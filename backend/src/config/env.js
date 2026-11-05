import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/opportunity_os";
export const JWT_SECRET = process.env.JWT_SECRET || "opportunity_os_jwt_secret_dev_key_2026";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const CLIENT_ORIGINS = process.env.CLIENT_ORIGINS || "";
