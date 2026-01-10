// Script to delete a user by email
// Run with: node scripts/delete-user.js krawczakluke@gmail.com

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
function loadEnvFile() {
  const envPath = join(__dirname, '..', '.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.error('Could not load .env file');
  }
}

loadEnvFile();

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/delete-user.js <email>');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'test';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment');
  process.exit(1);
}

async function deleteUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Extract database name from URI if not set
    let dbName = MONGODB_DATABASE;
    if (MONGODB_URI.includes('mongodb+srv://')) {
      const match = MONGODB_URI.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
      if (match && match[1]) dbName = match[1];
    }
    
    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return;
    }
    
    console.log(`Found user: ${user._id}`);
    
    // Delete accounts
    const accountsResult = await db.collection('accounts').deleteMany({ 
      userId: user._id.toHexString() 
    });
    console.log(`Deleted ${accountsResult.deletedCount} account(s)`);
    
    // Delete sessions
    const sessionsResult = await db.collection('sessions').deleteMany({ 
      userId: user._id.toHexString() 
    });
    console.log(`Deleted ${sessionsResult.deletedCount} session(s)`);
    
    // Delete user profile
    const profileResult = await db.collection('user_profiles').deleteMany({ 
      user_id: user._id.toHexString() 
    });
    console.log(`Deleted ${profileResult.deletedCount} profile(s)`);
    
    // Delete assessments
    const assessmentsResult = await db.collection('assessments').deleteMany({ 
      user_id: user._id.toHexString() 
    });
    console.log(`Deleted ${assessmentsResult.deletedCount} assessment(s)`);
    
    // Delete user
    const userResult = await db.collection('users').deleteOne({ _id: user._id });
    console.log(`Deleted ${userResult.deletedCount} user`);
    
    console.log(`\n✅ User ${email} and all related data deleted successfully`);
    console.log('You can now sign up again with a new password.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

deleteUser();
