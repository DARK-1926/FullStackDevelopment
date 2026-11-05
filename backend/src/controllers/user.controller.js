import { getMongoStatus } from "../config/db.js";
import { User } from "../models/User.js";
import { fallbackStore } from "../store/fallbackStore.js";
import { sanitizeUser } from "../utils/sanitize.js";




export async function updateProfile(req, res) {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : {};
    const updates = {};
    const stringFields = ["name", "email", "university", "degree", "gradYear", "resumeSummary"];

    for (const field of stringFields) {
      if (typeof body[field] === "string") updates[field] = body[field].trim();
    }

    if (typeof body.profileImage === "string") {
      const isValidImage = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(body.profileImage);
      if (body.profileImage.length > 240_000 || (body.profileImage && !isValidImage)) {
        return res.status(400).json({ error: "Profile image must be a JPEG, PNG, or WebP under 170 KB." });
      }
      updates.profileImage = body.profileImage;
    }

    for (const field of ["skills", "targetRoles"]) {
      if (Array.isArray(body[field]) && body[field].every((value) => typeof value === "string")) {
        updates[field] = body[field].map((value) => value.trim()).filter(Boolean);
      }
    }

    if (body.platformHandles && typeof body.platformHandles === "object" && !Array.isArray(body.platformHandles)) {
      const handles = {};
      for (const field of ["leetcode", "codeforces", "codechef", "geeksforgeeks", "gfg", "github"]) {
        if (typeof body.platformHandles[field] === "string") {
          handles[field] = body.platformHandles[field].trim();
        }
      }
      if (Object.keys(handles).length) updates.platformHandles = handles;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid profile fields were provided." });
    }

    let updatedUser = null;
    if (getMongoStatus()) {
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true, strict: "throw" },
      );
    } else {
      updatedUser = fallbackStore.updateUserProfile(req.user.id, updates);
    }

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile updated successfully.", user: sanitizeUser(updatedUser) });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
}
