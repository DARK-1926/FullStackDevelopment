import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    locationType: { type: String, enum: ["Remote", "Hybrid", "Onsite"], default: "Remote" },
    type: { type: String, enum: ["Internship", "Research", "Hackathon", "Full-time"], default: "Internship" },
    deadline: { type: String, required: true },
    deadlineDate: { type: String, required: true },
    stipend: { type: String, default: "Not disclosed" },
    experience: { type: String, default: "Any" },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    source: { type: String, default: "OpportunityOS Aggregator" },
    sourceUrl: { type: String, default: "#" },
    retrievedAt: { type: String, default: () => new Date().toISOString() },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Opportunity =
  mongoose.models.Opportunity || mongoose.model("Opportunity", opportunitySchema);

