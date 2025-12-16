import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env as MONGODB_URI');
}

const uri = process.env.MONGODB_URI;
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

export async function getDb() {
  const client = await clientPromise;
  return client.db(); // Uses database from connection string
}

export default clientPromise;

