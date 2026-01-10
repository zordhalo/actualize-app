import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file if it exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;
      
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    });
    
    // Set environment variables
    Object.assign(process.env, envVars);
  } catch (error) {
    // .env file doesn't exist or can't be read, that's okay
    // Will use environment variables or defaults
  }
}

// Load .env file
loadEnvFile();

// Get MongoDB URI from environment or use default
// Priority: process.env.MONGODB_URI > default local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/actualize?authSource=admin';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  Warning: MONGODB_URI not found in environment variables or .env file');
  console.warn('   Using default local MongoDB connection\n');
}

console.log('🔍 Testing MongoDB Connection...\n');

// Mask password in connection string for display
let maskedUri = MONGODB_URI;
if (MONGODB_URI.includes('mongodb+srv://')) {
  // MongoDB Atlas format: mongodb+srv://user:pass@cluster
  maskedUri = MONGODB_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://****:****@');
} else {
  // Standard format: mongodb://user:pass@host:port
  maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
}

console.log(`Connection URI: ${maskedUri}\n`);

if (MONGODB_URI.includes('mongodb+srv://')) {
  console.log('📍 Detected MongoDB Atlas (cloud) connection\n');
} else if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
  console.log('📍 Detected local MongoDB connection\n');
} else {
  console.log('📍 Detected remote MongoDB connection\n');
}

async function testMongoDBConnection() {
  let client;
  
  try {
    // Create MongoDB client
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log('⏳ Connecting to MongoDB...');
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!\n');

    // Test ping
    console.log('⏳ Testing server ping...');
    await client.db().admin().ping();
    console.log('✅ Server ping successful!\n');

    // Get server info (may not be available for all users, especially Atlas)
    console.log('📊 Server Information:');
    try {
      const serverStatus = await client.db().admin().serverStatus();
      console.log(`   Version: ${serverStatus.version}`);
      console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
      console.log(`   Host: ${serverStatus.host}\n`);
    } catch (adminError) {
      // Admin commands may not be available for all users (e.g., MongoDB Atlas)
      console.log(`   (Admin commands not available - this is normal for MongoDB Atlas)\n`);
    }

    // List databases
    console.log('📁 Available Databases:');
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    console.log('');

    // Get current database name from URI
    // Handle both mongodb:// and mongodb+srv:// formats
    let dbName = 'test';
    try {
      if (MONGODB_URI.includes('mongodb+srv://')) {
        // MongoDB Atlas format: mongodb+srv://user:pass@cluster/dbname?options
        const match = MONGODB_URI.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
        dbName = match ? match[1] : 'test';
      } else {
        // Standard format: mongodb://user:pass@host:port/dbname?options
        const url = new URL(MONGODB_URI.replace('mongodb://', 'mongodb://dummy@'));
        dbName = url.pathname.slice(1).split('?')[0] || 'test';
      }
    } catch (e) {
      // If parsing fails, try to extract from connection string
      const match = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
      dbName = match ? match[1] : 'test';
    }
    
    const currentDb = client.db(dbName);
    
    console.log(`📦 Collections in database "${dbName}":`);
    const collections = await currentDb.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   (No collections found)');
    } else {
      for (const collection of collections) {
        const count = await currentDb.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} document(s)`);
      }
    }
    console.log('');

    // Test write operation
    console.log('⏳ Testing write operation...');
    const testCollection = currentDb.collection('_connection_test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'MongoDB connection test'
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Write test successful! Inserted document ID: ${insertResult.insertedId}`);

    // Test read operation
    console.log('⏳ Testing read operation...');
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    if (readDoc) {
      console.log('✅ Read test successful!');
    }

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Cleanup successful!\n');

    console.log('🎉 All MongoDB connection tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ MongoDB Connection Test Failed!\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Name: ${error.name}`);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Troubleshooting:');
      if (MONGODB_URI.includes('mongodb+srv://')) {
        console.error('   - Check your MongoDB Atlas cluster is running');
        console.error('   - Verify your network allows connections to MongoDB Atlas');
        console.error('   - Check if your IP is whitelisted in MongoDB Atlas');
        console.error('   - Verify the cluster URL is correct');
      } else if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
        console.error('   - Make sure MongoDB is running locally');
        console.error('   - Check if MongoDB is accessible at the specified host/port');
        console.error('   - If using Docker, run: docker compose up mongodb');
      } else {
        console.error('   - Check if MongoDB server is accessible');
        console.error('   - Verify network connectivity');
        console.error('   - Check firewall settings');
      }
    } else if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your MongoDB username and password');
      console.error('   - Verify the authSource parameter in your connection string');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - MongoDB server may be slow to respond');
      console.error('   - Check network connectivity');
      console.error('   - Verify MongoDB is running and accessible');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed.');
    }
  }
}

// Run the test
testMongoDBConnection();
