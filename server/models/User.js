import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      default: "National Institute of Technology",
    },
    degree: {
      type: String,
      default: "B.Tech in Computer Science & Engineering",
    },
    gradYear: {
      type: String,
      default: "2027",
    },
    targetRoles: {
      type: [String],
      default: ["Frontend Engineer", "Full Stack Developer", "Software Engineering Intern"],
    },
    skills: {
      type: [String],
      default: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "Node.js",
        "Express",
        "MongoDB",
        "Data Structures",
        "Algorithms",
        "Git",
        "GitHub",
      ],
    },
    resumeSummary: {
      type: String,
      default:
        "Computer Science undergraduate with hands-on experience building fullstack and reactive web apps. Active competitive programmer with consistent problem-solving practice.",
    },
    platformHandles: {
      leetcode: { type: String, default: "alex_shah" },
      codeforces: { type: String, default: "alex_coder" },
      github: { type: String, default: "alexshah-dev" },
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

