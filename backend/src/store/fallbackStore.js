import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { seedOpportunities } from "../data/seedOpportunities.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "..", "local_db.json");


const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("password123", 10);

const defaultApplications = [
  {
    _id: "app-default-1",
    userId: "user-default-1",
    opportunityId: "stripe-swe-intern",
    role: "Software Engineer Intern (Payments & Core Infra)",
    company: "Stripe",
    location: "Bengaluru · Hybrid",
    status: "Interviewing",
    appliedDate: "2026-10-15",
    deadline: "Nov 25, 2026",
    notes: "Passed technical screening round. System design and coding interview scheduled.",
    matchScore: 92,
    sourceUrl: "https://stripe.com/jobs",
  },
  {
    _id: "app-default-2",
    userId: "user-default-1",
    opportunityId: "cred-frontend-intern",
    role: "Frontend Engineering Intern (UI / Interactions)",
    company: "CRED",
    location: "Bengaluru · Onsite",
    status: "Applied",
    appliedDate: "2026-10-24",
    deadline: "Dec 01, 2026",
    notes: "Submitted portfolio showcasing interactive components.",
    matchScore: 95,
    sourceUrl: "https://cred.club/careers",
  },
];

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
      profileImage: "",
      platformHandles: {
        leetcode: "tourist",
        codeforces: "tourist",
        codechef: "gennady.korotkevich",
        geeksforgeeks: "tourist",
        github: "torvalds",
      },
    },
  ],
  opportunities: seedOpportunities,
  applications: defaultApplications,
  growthLogs: [],
};

let inMemoryDb = null;

function readDb() {
  if (inMemoryDb) return inMemoryDb;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      inMemoryDb = JSON.parse(raw);
    } else {
      inMemoryDb = JSON.parse(JSON.stringify(defaultData));
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      } catch (error) {
        console.warn("Could not initialize the fallback data file:", error);
      }
    }
    if (!inMemoryDb.opportunities || inMemoryDb.opportunities.length === 0) {
      inMemoryDb.opportunities = seedOpportunities;
    }
    if (!inMemoryDb.applications) {
      inMemoryDb.applications = defaultApplications;
    }
    return inMemoryDb;
  } catch (error) {
    console.warn("Could not read fallback data; using defaults:", error);
    inMemoryDb = JSON.parse(JSON.stringify(defaultData));
    return inMemoryDb;
  }
}

function writeDb(data) {
  inMemoryDb = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Could not persist fallback data:", error);
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
      profileImage: "",
      platformHandles: { leetcode: "", codeforces: "", codechef: "", geeksforgeeks: "", github: "" },
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

  createGrowthLog(logData) {
    const db = readDb();
    if (!Array.isArray(db.growthLogs)) {
      db.growthLogs = [];
    }
    const newLog = {
      _id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...logData,
    };
    db.growthLogs.unshift(newLog);
    writeDb(db);
    return newLog;
  },

  getGrowthLogs(userId) {
    const db = readDb();
    if (!Array.isArray(db.growthLogs)) return [];
    return db.growthLogs.filter((log) => log.userId === userId);
  },

  getOpportunities() {
    const db = readDb();
    return db.opportunities || seedOpportunities;
  },

  getOpportunityById(id) {
    const db = readDb();
    const list = db.opportunities || seedOpportunities;
    return list.find((o) => o.id === id || o._id === id);
  },

  getApplications(userId) {
    const db = readDb();
    if (!Array.isArray(db.applications)) return defaultApplications;
    if (!userId) return db.applications;
    return db.applications.filter((a) => a.userId === userId || !a.userId);
  },

  createApplication(appData) {
    const db = readDb();
    if (!Array.isArray(db.applications)) db.applications = [];
    const newApp = {
      _id: `app-${Date.now()}`,
      id: `app-${Date.now()}`,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      ...appData,
    };
    db.applications.unshift(newApp);
    writeDb(db);
    return newApp;
  },

  updateApplication(id, updates) {
    const db = readDb();
    if (!Array.isArray(db.applications)) return null;
    const index = db.applications.findIndex((a) => a._id === id || a.id === id);
    if (index === -1) return null;
    db.applications[index] = { ...db.applications[index], ...updates };
    writeDb(db);
    return db.applications[index];
  },

  deleteApplication(id) {
    const db = readDb();
    if (!Array.isArray(db.applications)) return false;
    const prevLen = db.applications.length;
    db.applications = db.applications.filter((a) => a._id !== id && a.id !== id);
    writeDb(db);
    return db.applications.length < prevLen;
  },
};
