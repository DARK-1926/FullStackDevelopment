import mongoose from "mongoose";

const growthLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    platform: {
      type: String,
      enum: ["LeetCode", "Codeforces", "GitHub", "HackerRank"],
      required: true,
    },
    problemsSolved: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const GrowthLog =
  mongoose.models.GrowthLog || mongoose.model("GrowthLog", growthLogSchema);

