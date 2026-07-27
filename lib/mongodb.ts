import mongoose from "mongoose";
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;

  // eslint-disable-next-line no-var
  var mongoClient: MongoClient | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

/**
 * MongoDB Native Client (Auth.js)
 */
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (global.mongoClient) {
    return global.mongoClient;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  const client = new MongoClient(uri);

  global.mongoClient = client;

  clientPromise = client.connect();

  return clientPromise;
}

export { clientPromise };

/**
 * Mongoose Connection
 */
export default async function dbConnect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("✅ MongoDB Connected");

    return cached.conn;
  } catch (err) {
    cached.promise = null;

    console.error("❌ MongoDB Connection Error:", err);

    throw err;
  }
}