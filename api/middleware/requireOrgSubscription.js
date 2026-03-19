import { getAuth } from "@clerk/express";
import Subscription from "../models/Subscription.js";

function isSubscriptionActive(sub) {
  if (!sub) return false;
  return ["active", "trialing"].includes(sub.status);
}

// Require:
// - user logged in
// - user belongs to an active Clerk org context (auth.orgId)
// - org has an active Subscription record in Mongo (status=active|trialing)
export default function requireOrgSubscription(req, res, next) {
  const auth = getAuth(req);

  const userId = auth?.userId;
  const orgId = auth?.orgId;

  if (!userId) return res.status(401).json({ message: "Unauthenticated" });

  if (!orgId) {
    return res
      .status(403)
      .json({ message: "Organization is required for this feature." });
  }

  return Subscription.findOne({ organization_id: orgId })
    .sort({ createdAt: -1 })
    .then((sub) => {
      if (!isSubscriptionActive(sub)) {
        return res.status(402).json({
          message: "Subscription required for this feature.",
        });
      }
      // Attach org/sub info for downstream handlers if needed.
      req.organizationId = orgId;
      req.subscription = sub;
      return next();
    })
    .catch((err) => {
      console.error("requireOrgSubscription error:", err);
      return res.status(500).json({ message: "Authorization failed." });
    });
}

