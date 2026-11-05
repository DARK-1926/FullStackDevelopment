import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { NODE_ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
app.options("*", cors());
app.use(express.json({ limit: "256kb" }));


app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    try {
      await connectDB();
    } catch (error) {
      console.warn("MongoDB is unavailable; continuing with the fallback store:", error);
    }
  }
  next();
});


app.use(routes);


const distPath = path.resolve(__dirname, "../../dist");
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const clientBuildPath = fs.existsSync(distPath)
  ? distPath
  : (fs.existsSync(frontendDistPath) ? frontendDistPath : null);

if (clientBuildPath) {
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}


app.use(errorHandler);

export default app;
