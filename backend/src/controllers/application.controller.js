import { getMongoStatus } from "../config/db.js";
import { Application } from "../models/Application.js";
import { fallbackStore } from "../store/fallbackStore.js";




export async function getApplications(req, res) {
  try {
    const userId = req.user?.id;
    let applications = [];

    if (getMongoStatus() && userId) {
      applications = await Application.find({ userId }).sort({ createdAt: -1 });
    } else {
      applications = fallbackStore.getApplications(userId);
    }

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error("Fetch applications error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch applications." });
  }
}




export async function createApplication(req, res) {
  try {
    const userId = req.user?.id || "guest-user";
    const {
      opportunityId,
      role,
      company,
      location,
      status = "Applied",
      deadline = "Ongoing",
      notes = "",
      sourceUrl = "",
      matchScore = 85,
    } = req.body || {};

    if (!role || !company) {
      return res.status(400).json({ success: false, error: "Role and company are required." });
    }

    const payload = {
      userId,
      opportunityId: opportunityId || `manual-${Date.now()}`,
      role: role.trim(),
      company: company.trim(),
      location: location || "Remote",
      status,
      appliedDate: new Date().toISOString().split("T")[0],
      deadline: deadline || "Ongoing",
      notes: notes.trim(),
      sourceUrl,
      matchScore: Number(matchScore) || 85,
    };

    let newApp = null;
    if (getMongoStatus() && req.user?.id) {
      newApp = await Application.create(payload);
    } else {
      newApp = fallbackStore.createApplication(payload);
    }

    res.status(201).json({
      success: true,
      application: newApp,
    });
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ success: false, error: "Failed to create application." });
  }
}




export async function updateApplication(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    let updated = null;
    if (getMongoStatus() && req.user?.id) {
      updated = await Application.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { $set: updates },
        { new: true },
      );
    } else {
      updated = fallbackStore.updateApplication(id, updates);
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    res.json({
      success: true,
      application: updated,
    });
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ success: false, error: "Failed to update application." });
  }
}




export async function deleteApplication(req, res) {
  try {
    const { id } = req.params;

    let deleted = false;
    if (getMongoStatus() && req.user?.id) {
      const resDel = await Application.findOneAndDelete({ _id: id, userId: req.user.id });
      deleted = !!resDel;
    } else {
      deleted = fallbackStore.deleteApplication(id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Application not found or already deleted." });
    }

    res.json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (err) {
    console.error("Delete application error:", err);
    res.status(500).json({ success: false, error: "Failed to delete application." });
  }
}

