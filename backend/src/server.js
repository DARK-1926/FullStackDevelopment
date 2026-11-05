import { PORT } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";


connectDB().catch((error) => {
  console.warn("Could not initialize MongoDB:", error);
});

try {
  const server = app.listen(PORT, () => {
    console.info(`[OpportunityOS Backend] Server listening on http://localhost:${PORT}`);
  });
  server.on("error", (error) => {
    console.error("Could not start the API server:", error);
    process.exitCode = 1;
  });
} catch (error) {
  console.error("Could not start the API server:", error);
  process.exitCode = 1;
}
