import { ApiError } from "../utils/ApiError.js";




export function errorHandler(err, req, res, _next) {
  if (req?.headers?.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      errors: err.errors,
      success: false,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
    success: false,
  });
}
