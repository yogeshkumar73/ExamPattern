import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// Cache the connection to reuse across serverless invocations
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

// MongoDB client for Auth.js adapter
declare global {
  // eslint-disable-next-line no-var
  var mongoClient: MongoClient | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global.mongoClient) {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
  const client = new MongoClient(MONGODB_URI);
  global.mongoClient = client;
  clientPromise = client.connect();
} else {
  clientPromise = Promise.resolve(global.mongoClient);
}

export { clientPromise };

async function dbConnect(): Promise<typeof mongoose> {
  // Check at runtime (not module load) so the build doesn't fail when env var is missing
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not defined. ' +
      'Please set it in your Netlify environment variables.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('MongoDB Connected Successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB Connection Error:', error);
    throw error;
  }

  return cached.conn;
}

export default dbConnect;

