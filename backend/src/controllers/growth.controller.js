import { getMongoStatus } from "../config/db.js";
import { GrowthLog } from "../models/GrowthLog.js";
import { fallbackStore } from "../store/fallbackStore.js";




export async function createLog(req, res) {
  try {
    const { platform, problemsSolved, notes } = req.body || {};

    const validPlatforms = ["LeetCode", "Codeforces", "CodeChef", "GeeksforGeeks", "GitHub"];
    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({ error: "Invalid or unsupported platform." });
    }

    const count = parseInt(problemsSolved, 10);
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ error: "Problems or items count must be at least 1." });
    }

    const today = new Date().toISOString().split("T")[0];
    const logPayload = {
      userId: req.user.id,
      date: today,
      platform,
      problemsSolved: count,
      notes: typeof notes === "string" ? notes.trim() : "",
    };

    let savedLog = null;
    if (getMongoStatus()) {
      savedLog = await GrowthLog.create(logPayload);
    } else {
      savedLog = fallbackStore.createGrowthLog(logPayload);
    }

    res.status(201).json({
      message: "Coding activity recorded successfully.",
      log: savedLog,
    });
  } catch (err) {
    console.error("Growth log error:", err);
    res.status(500).json({ error: "Failed to save coding activity log." });
  }
}




export async function getLogs(req, res) {
  try {
    let logs = [];
    if (getMongoStatus()) {
      logs = await GrowthLog.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    } else {
      logs = fallbackStore.getGrowthLogs(req.user.id);
    }

    res.json({ logs });
  } catch (err) {
    console.error("Fetch growth logs error:", err);
    res.status(500).json({ error: "Failed to fetch activity logs." });
  }
}
