// apps/web/api-server.ts
/**
 * Local development API server for testing Vercel serverless functions.
 * Run with: pnpm dev:api
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

// Load environment variables
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

// Parse cookies from header
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

// Create mock Vercel request
function createVercelRequest(req: IncomingMessage, body: any, parsedUrl: ReturnType<typeof parse>): VercelRequest {
  return {
    method: req.method,
    url: req.url,
    query: parsedUrl.query as Record<string, string>,
    cookies: parseCookies(req.headers.cookie || ''),
    headers: req.headers as Record<string, string>,
    body: body,
  } as VercelRequest;
}

// Create mock Vercel response
function createVercelResponse(res: ServerResponse): VercelResponse {
  const mockRes = {
    statusCode: 200,
    _headers: {} as Record<string, string>,
    _sent: false,
    
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    
    setHeader(key: string, value: string) {
      this._headers[key] = value;
      res.setHeader(key, value);
      return this;
    },
    
    json(data: any) {
      if (this._sent) return this;
      this._sent = true;
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = this.statusCode;
      res.end(JSON.stringify(data));
      return this;
    },
    
    send(data: any) {
      if (this._sent) return this;
      this._sent = true;
      res.statusCode = this.statusCode;
      res.end(data);
      return this;
    },
    
    end() {
      if (this._sent) return this;
      this._sent = true;
      res.statusCode = this.statusCode;
      res.end();
      return this;
    },
  };
  
  return mockRes as unknown as VercelResponse;
}

// Route handler cache
const handlerCache = new Map<string, any>();

// Load API handler dynamically
async function loadHandler(apiPath: string): Promise<((req: VercelRequest, res: VercelResponse) => Promise<any>) | null> {
  // Map API path to file path
  // /api/questions -> ./api/questions.ts
  // /api/auth/token -> ./api/auth/token.ts
  
  const relativePath = apiPath.replace(/^\//, '') + '.ts';
  const fullPath = join(__dirname, relativePath);
  
  // Check if file exists
  if (!existsSync(fullPath)) {
    // Try folder/index pattern
    const indexPath = join(__dirname, apiPath.replace(/^\//, ''), 'index.ts');
    if (existsSync(indexPath)) {
      // Convert Windows path to file:// URL for proper ESM import
      const fileUrl = pathToFileURL(indexPath).href;
      const module = await import(fileUrl);
      return module.default;
    }
    return null;
  }
  
  try {
    // Convert Windows path to file:// URL for proper ESM import
    // This is required because dynamic import() on Windows requires file:// URLs
    const fileUrl = pathToFileURL(fullPath).href;
    const module = await import(`${fileUrl}?update=${Date.now()}`);
    return module.default;
  } catch (error) {
    console.error(`Error loading handler for ${apiPath}:`, error);
    return null;
  }
}

// Parse request body
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(data || null);
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '/', true);
  const pathname = parsedUrl.pathname || '/';
  
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
  if (!pathname.startsWith('/api')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found - only /api/* routes are handled' }));
    return;
  }
  
  console.log(`[API] ${req.method} ${pathname}`);
  
  // Parse body for POST/PUT/PATCH
  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
    body = await parseBody(req);
  }
  
  // Load and call handler
  const handler = await loadHandler(pathname);
  
  if (!handler) {
    console.log(`[API] Handler not found for ${pathname}`);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `API route not found: ${pathname}` }));
    return;
  }
  
  try {
    const vercelReq = createVercelRequest(req, body, parsedUrl);
    const vercelRes = createVercelResponse(res);
    await handler(vercelReq, vercelRes);
  } catch (error: any) {
    console.error('[API] Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error', 
      message: error?.message || 'Unknown error' 
    }));
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 Local API Server');
  console.log('═══════════════════════════════════════');
  console.log(`   URL: http://localhost:${PORT}`);
  console.log('   Handling: /api/* routes');
  console.log('   Press Ctrl+C to stop');
  console.log('═══════════════════════════════════════');
  console.log('');
});
