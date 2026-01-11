// api/_utils/mongodb.ts
/**
 * MongoDB connection helper for Vercel serverless functions.
 * Implements connection pooling and caching for serverless environments.
 */

import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to environment variables as MONGODB_URI');
}

const uri = process.env.MONGODB_URI;

// Extract database name from connection string or use environment variable
function extractDatabaseName(): string {
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
      const url = new URL(uri.replace('mongodb://', 'http://'));
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

const options = {
  // Connection timeout in milliseconds
  connectTimeoutMS: 10000,
  // Socket timeout in milliseconds
  socketTimeoutMS: 45000,
  // Server selection timeout in milliseconds
  serverSelectionTimeoutMS: 10000,
};

// In serverless environments, we need to cache the connection
// to reuse across invocations within the same instance
function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  return clientPromise as Promise<MongoClient>;
}

export async function getDb(dbName: string = databaseName): Promise<Db> {
  const mongoClient = await getClientPromise();
  return mongoClient.db(dbName);
}

export function getDatabaseName(): string {
  return databaseName;
}

export async function getClient(): Promise<MongoClient> {
  return getClientPromise();
}

export default getClientPromise;
