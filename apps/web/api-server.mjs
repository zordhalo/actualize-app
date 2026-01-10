// apps/web/api-server.mjs
/**
 * Local development API server for testing Vercel serverless functions.
 * Run with: node api-server.mjs
 */

import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

// Load environment variables
if (existsSync(join(__dirname, '.env'))) {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Helper to create mock req/res for Vercel functions
function createVercelRequest(req, body) {
  const url = parse(req.url, true);
  return {
    method: req.method,
    url: req.url,
    query: url.query,
    cookies: parseCookies(req.headers.cookie || ''),
    headers: req.headers,
    body: body,
  };
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

function createVercelResponse(res) {
  const response = {
    statusCode: 200,
    headers: {},
    body: null,
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    
    json(data) {
      this.headers['Content-Type'] = 'application/json';
      this.body = JSON.stringify(data);
      this._send(res);
      return this;
    },
    
    send(data) {
      this.body = data;
      this._send(res);
      return this;
    },
    
    end() {
      this._send(res);
      return this;
    },
    
    _send(httpRes) {
      Object.entries(this.headers).forEach(([key, value]) => {
        httpRes.setHeader(key, value);
      });
      httpRes.statusCode = this.statusCode;
      httpRes.end(this.body);
    }
  };
  return response;
}

// Route handlers cache
const routeCache = new Map();

async function loadHandler(apiPath) {
  // Convert /api/questions to ./api/questions.ts
  const relativePath = apiPath.replace('/api/', './api/') + '.ts';
  const fullPath = join(__dirname, relativePath);
  
  // Check for nested paths like /api/auth/token
  const nestedPath = apiPath.replace('/api/', './api/') + '/index.ts';
  const nestedFullPath = join(__dirname, nestedPath);
  
  // Try direct file first, then nested index
  let handlerPath = fullPath;
  if (!existsSync(fullPath)) {
    if (existsSync(nestedFullPath)) {
      handlerPath = nestedFullPath;
    } else {
      // Try without .ts extension for folder structure
      const folderPath = fullPath.replace('.ts', '') + '.ts';
      if (!existsSync(folderPath)) {
        return null;
      }
      handlerPath = folderPath;
    }
  }
  
  // Clear cache in development
  const cacheKey = handlerPath + '?' + Date.now();
  
  try {
    const module = await import(pathToFileURL(handlerPath).href + '?update=' + Date.now());
    return module.default;
  } catch (error) {
    console.error(`Error loading handler for ${apiPath}:`, error);
    return null;
  }
}

const server = createServer(async (req, res) => {
  const url = parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Only handle /api routes
  if (!url.pathname.startsWith('/api')) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  
  // Parse body for POST/PUT/PATCH
  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
  }
  
  // Map paths - handle nested routes
  let apiPath = url.pathname;
  
  // Special case for nested auth routes
  if (apiPath.startsWith('/api/auth/')) {
    const subPath = apiPath.replace('/api/auth/', '');
    apiPath = '/api/auth/' + subPath.replace('/', '-');
  }
  
  // Load and call handler
  const handler = await loadHandler(apiPath);
  
  if (!handler) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `API route not found: ${url.pathname}` }));
    return;
  }
  
  try {
    const vercelReq = createVercelRequest(req, body);
    const vercelRes = createVercelResponse(res);
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
  console.log(`   Handling /api/* routes`);
  console.log(`   Press Ctrl+C to stop`);
});
