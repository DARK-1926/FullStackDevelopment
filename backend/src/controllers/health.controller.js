import { getMongoStatus } from "../config/db.js";




export function healthCheck(_req, res) {
  res.json({
    status: "online",
    db: getMongoStatus() ? "MongoDB Connected" : "Local Resilient Store (MongoDB offline)",
    timestamp: new Date().toISOString(),
  });
}
