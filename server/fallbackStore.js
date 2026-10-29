import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "local_db.json");

// Default initial user for instant testing: alex@university.edu / password123
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("password123", 10);

const defaultData = {
  users: [
    {
      _id: "user-default-1",
      name: "Alex Shah",
      email: "alex@university.edu",
      password: DEFAULT_PASSWORD_HASH,
      university: "National Institute of Technology",
      degree: "B.Tech in Computer Science & Engineering",
      gradYear: "2027",
      targetRoles: ["Frontend Engineer", "Full Stack Developer", "Software Engineering Intern"],
      skills: [
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
      resumeSummary:
        "Computer Science undergraduate with hands-on experience building fullstack and reactive web apps. Active competitive programmer with 300+ problems solved across LeetCode and Codeforces.",
      platformHandles: {
        leetcode: "alex_shah",
        codeforces: "alex_coder",
        github: "alexshah-dev",
      },
    },
  ],
  applications: [],
  growthLogs: [],
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (_e) {
    return defaultData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn("Failed to write to fallback store:", err);
  }
}

export const fallbackStore = {
  findUserByEmail(email) {
    const db = readDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id) {
    const db = readDb();
    return db.users.find((u) => u._id === id);
  },

  createUser(userData) {
    const db = readDb();
    const newUser = {
      _id: `user-${Date.now()}`,
      university: "National Institute of Technology",
      degree: "B.Tech in Computer Science & Engineering",
      gradYear: "2027",
      targetRoles: ["Software Engineer", "Full Stack Developer"],
      skills: ["React", "JavaScript", "HTML", "CSS", "Node.js", "MongoDB"],
      resumeSummary: "Aspiring software engineer eager to build modern scalable applications.",
      platformHandles: { leetcode: "", codeforces: "", github: "" },
      ...userData,
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },

  updateUserProfile(userId, updates) {
    const db = readDb();
    const index = db.users.findIndex((u) => u._id === userId);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates };
    writeDb(db);
    return db.users[index];
  },
};

