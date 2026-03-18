import { getAuth } from "@clerk/express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ActivityLog = require("../models/Activity.js");

export const getActivityLog = async (req, res) => {
  try {
    const auth = getAuth(req);
    const orgId = req.organizationId || auth?.orgId;

    if (!orgId) {
      return res.status(403).json({ message: "Organization required." });
    }

    const limit = Math.min(Number(req.query.limit || 50), 200);

    const activities = await ActivityLog.find({ organization_id: orgId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ activities });
  } catch (err) {
    console.error("getActivityLog error:", err);
    res.status(500).json({ message: err?.message || "Failed to fetch activity." });
  }
};

