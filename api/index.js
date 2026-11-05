import { connectDB } from "../backend/src/config/db.js";
import app from "../backend/src/app.js";

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Accept");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB is unavailable; continuing with the fallback store:", error);
  }
  return app(req, res);
}
