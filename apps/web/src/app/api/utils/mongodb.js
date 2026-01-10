import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env as MONGODB_URI');
}

const uri = process.env.MONGODB_URI;

// Extract database name from connection string or use environment variable
function extractDatabaseName() {
  // First check if explicitly set in environment
  if (process.env.MONGODB_DATABASE) {
    return process.env.MONGODB_DATABASE;
  }

  // Try to extract from connection string
  try {
    if (uri.includes('mongodb+srv://')) {
      // MongoDB Atlas format: mongodb+srv://user:pass@cluster/dbname?options
      const match = uri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
      if (match && match[1]) {
        return match[1];
      }
    } else {
      // Standard format: mongodb://user:pass@host:port/dbname?options
      const url = new URL(uri.replace('mongodb://', 'mongodb://dummy@'));
      const dbName = url.pathname.slice(1).split('?')[0];
      if (dbName) {
        return dbName;
      }
    }
  } catch (e) {
    // If parsing fails, try regex
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Default database name if not found in connection string
  return 'test';
}

const databaseName = extractDatabaseName();

// Log database name for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(`[mongodb] Using database: "${databaseName}"`);
  console.log(`[mongodb] Connection URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
}

const options = {};

if (process.env.NODE_ENV === 'development') {
  // Use a global variable to preserve the client across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(dbName = databaseName) {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}

export function getDatabaseName() {
  return databaseName;
}

export default clientPromise;

