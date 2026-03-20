import { getAuth } from "@clerk/express";

// Requires authenticated user and active Clerk organization context.
// TODO: Re-introduce subscription checks for image translation later.
export default function requireOrganization(req, res, next) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  const orgId = auth?.orgId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!orgId) {
    return res
      .status(403)
      .json({ message: "Organization is required for this feature." });
  }

  req.organizationId = orgId;
  return next();
}
