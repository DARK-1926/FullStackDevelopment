import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { getMongoStatus } from "../config/db.js";
import { User } from "../models/User.js";
import { fallbackStore } from "../store/fallbackStore.js";
import { sanitizeUser } from "../utils/sanitize.js";




export async function register(req, res) {
  try {
    const { name, email, password, university, degree, gradYear } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();


    if (getMongoStatus()) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({ error: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name: String(name).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          university: university || "National Institute of Technology",
          degree: degree || "B.Tech in Computer Science & Engineering",
          gradYear: gradYear || "2027",
        });

        const secret = JWT_SECRET || "opportunity_os_super_secure_jwt_secret_2026";
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, secret, {
          expiresIn: "7d",
        });

        return res.status(201).json({
          message: "Registration successful!",
          token,
          user: sanitizeUser(newUser),
        });
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          return res.status(409).json({ error: "An account with this email already exists." });
        }
        console.warn("MongoDB registration failed, falling back to local store:", dbErr.message);
      }
    }


    const existing = fallbackStore.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = fallbackStore.createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      university: university || "National Institute of Technology",
      degree: degree || "B.Tech in Computer Science & Engineering",
      gradYear: gradYear || "2027",
    });

    const secret = JWT_SECRET || "opportunity_os_super_secure_jwt_secret_2026";
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, secret, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "Registration successful!",
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message || "Internal server error during registration." });
  }
}




export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let user = null;
    if (getMongoStatus()) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (dbErr) {
        console.warn("MongoDB query failed, falling back to local store:", dbErr.message);
        user = fallbackStore.findUserByEmail(normalizedEmail);
      }
    } else {
      user = fallbackStore.findUserByEmail(normalizedEmail);
    }


    if (!user) {
      user = fallbackStore.findUserByEmail(normalizedEmail);
    }

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(String(password), user.password).catch(() => false);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const secret = JWT_SECRET || "opportunity_os_super_secure_jwt_secret_2026";
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login successful!",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Internal server error during login." });
  }
}




export async function me(req, res) {
  try {
    let user = null;
    if (getMongoStatus()) {
      try {
        user = await User.findById(req.user.id);
      } catch (_e) {
        user = fallbackStore.findUserById(req.user.id);
      }
    } else {
      user = fallbackStore.findUserById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: "User session not found." });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Auth me error:", err);
    res.status(500).json({ error: "Failed to verify session." });
  }
}




export function logout(_req, res) {
  res.json({ message: "Logged out successfully." });
}
