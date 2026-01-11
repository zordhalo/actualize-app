// apps/web/api/health.ts
/**
 * Health check endpoint for Vercel serverless functions.
 * Returns the health status of the API and database connection.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getDatabaseName, getClient } from './_utils/mongodb';
import { handleCors } from './_utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthStatus: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    database?: {
      status: 'connected' | 'disconnected';
      name: string;
      collections?: string[];
      questionCount?: number;
    };
    error?: string;
    version: string;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  try {
    // Test database connection
    const client = await getClient();
    const db = await getDb();

    // Ping the database
    await client.db().admin().ping();

    // Get collections list
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);

    // Count questions to verify data access
    const questionCount = await db.collection('questions').countDocuments();

    healthStatus.database = {
      status: 'connected',
      name: getDatabaseName(),
      collections: collectionNames,
      questionCount,
    };

    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('[health] Database health check failed:', error);

    healthStatus.status = 'unhealthy';
    healthStatus.error = error instanceof Error ? error.message : 'Unknown error';
    healthStatus.database = {
      status: 'disconnected',
      name: getDatabaseName(),
    };

    return res.status(503).json(healthStatus);
  }
}
