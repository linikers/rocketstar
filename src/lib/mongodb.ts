import mongoose from 'mongoose';
import type { Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Cache the Mongoose connection
let cachedMongoose: typeof mongoose | null = null;

async function dbConnect() {
  if (cachedMongoose) {
    return cachedMongoose;
  }

  const opts = {
    bufferCommands: false,
  };

  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof global & {
      _mongooseClientPromise?: Promise<typeof mongoose>;
    };

    if (!globalWithMongo._mongooseClientPromise) {
      globalWithMongo._mongooseClientPromise = mongoose.connect(uri, opts);
    }
    cachedMongoose = await globalWithMongo._mongooseClientPromise;
  } else {
    cachedMongoose = await mongoose.connect(uri, opts);
  }

  return cachedMongoose;
}

export async function getDb(): Promise<Db> {
  const conn = await dbConnect();
  const db = conn.connection.db;
  if (!db) {
    throw new Error('MongoDB connection not established');
  }
  return db;
}

export default dbConnect;
