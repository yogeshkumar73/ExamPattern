import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://text:7JDgF75FpxIfqUuws@test.9k9mdzj.mongodb.net/?appName=test";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function dbConnect() {
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  };

  try {
    const conn = await mongoose.connect(MONGODB_URI, opts);
    console.log("MongoDB Connected Successfully");
    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}

export default dbConnect;
