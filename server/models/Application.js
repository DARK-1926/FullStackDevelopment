import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opportunityId: { type: String },
    role: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "Remote" },
    status: {
      type: String,
      enum: ["Saved", "Applied", "Interviewing", "Offer", "Rejected"],
      default: "Applied",
    },
    appliedDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    deadline: { type: String, default: "Ongoing" },
    notes: { type: String, default: "" },
    matchScore: { type: Number, default: 85 },
    sourceUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);

