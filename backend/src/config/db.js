import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

let isMongoConnecting = null;




export function getMongoStatus() {
  return mongoose.connection.readyState === 1;
}




export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isMongoConnecting) {
    return isMongoConnecting;
  }

  isMongoConnecting = (async () => {
    try {
      if (!MONGODB_URI) {
        return false;
      }
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      });
      console.info("[MongoDB] Connected successfully to Database");
      return true;
    } catch (err) {
      console.warn(`[MongoDB] Notice: Could not connect to MongoDB: ${err.message}`);
      return false;
    } finally {
      isMongoConnecting = null;
    }
  })();

  return isMongoConnecting;
}
