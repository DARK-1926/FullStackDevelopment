import { getMongoStatus } from "../config/db.js";
import { Opportunity } from "../models/Opportunity.js";
import { fallbackStore } from "../store/fallbackStore.js";
import { seedOpportunities } from "../data/seedOpportunities.js";




export async function getOpportunities(req, res) {
  try {
    let opportunities = [];

    if (getMongoStatus()) {
      opportunities = await Opportunity.find().sort({ deadlineDate: 1 });
      if (opportunities.length === 0) {

        await Opportunity.insertMany(seedOpportunities);
        opportunities = await Opportunity.find().sort({ deadlineDate: 1 });
      }
    } else {
      opportunities = fallbackStore.getOpportunities();
    }


    const { type, locationType, q } = req.query;
    let filtered = [...opportunities];

    if (type && type !== "All") {
      filtered = filtered.filter((o) => o.type?.toLowerCase() === type.toLowerCase());
    }
    if (locationType && locationType !== "All") {
      filtered = filtered.filter((o) => o.locationType?.toLowerCase() === locationType.toLowerCase());
    }
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.title?.toLowerCase().includes(term) ||
          o.company?.toLowerCase().includes(term) ||
          (Array.isArray(o.skills) && o.skills.some((s) => s.toLowerCase().includes(term))),
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      opportunities: filtered,
    });
  } catch (err) {
    console.error("Opportunities fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch opportunities." });
  }
}




export async function getOpportunityById(req, res) {
  try {
    const { id } = req.params;
    let opportunity = null;

    if (getMongoStatus()) {
      opportunity = await Opportunity.findById(id).catch(() => null);
      if (!opportunity) {
        opportunity = await Opportunity.findOne({ id }).catch(() => null);
      }
    } else {
      opportunity = fallbackStore.getOpportunityById(id);
    }

    if (!opportunity) {
      return res.status(404).json({ success: false, error: "Opportunity not found." });
    }

    res.json({
      success: true,
      opportunity,
    });
  } catch (err) {
    console.error("Opportunity lookup error:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve opportunity." });
  }
}

