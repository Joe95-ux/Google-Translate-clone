import { createClerkClient } from "@clerk/backend";
import { getAuth } from "@clerk/express";
import ActivityLog from "../models/Activity.js";

const clerkClient =
  process.env.CLERK_SECRET_KEY
    ? createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
        // For BAPI operations like creating invitations we typically need secretKey.
      })
    : null;

function normalizeEmailFromClerkUser(user) {
  // Clerk user object varies slightly depending on which fields are returned.
  const primary = user?.primaryEmailAddress;
  if (typeof primary === "string") return primary;
  if (primary?.emailAddress) return primary.emailAddress;
  if (primary?.identifier) return primary.identifier;

  const any = user?.emailAddresses?.[0];
  if (!any) return null;
  if (typeof any === "string") return any;
  if (any?.emailAddress) return any.emailAddress;
  if (any?.identifier) return any.identifier;

  return null;
}

export const createOrganizationInvitation = async (req, res) => {
  try {
    if (!clerkClient) {
      return res.status(500).json({
        message: "Server misconfiguration: missing CLERK_SECRET_KEY for org invitation.",
      });
    }

    const auth = getAuth(req);
    const inviterUserId = auth?.userId;
    const organizationId = req.params.organizationId;

    if (!inviterUserId) return res.status(401).json({ message: "Unauthenticated" });

    // RBAC: only admins/owners should invite.
    const isOrgAdmin = auth?.has?.({ role: "org:admin" });
    const isOrgOwner = auth?.has?.({ role: "org:owner" });
    if (!isOrgAdmin && !isOrgOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      emailAddress,
      clerkUserId,
      role = "org:member",
      redirectUrl,
    } = req.body || {};

    if (!emailAddress && !clerkUserId) {
      return res.status(400).json({ message: "Provide `emailAddress` or `clerkUserId`." });
    }

    let finalEmail = emailAddress;
    if (!finalEmail && clerkUserId) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      finalEmail = normalizeEmailFromClerkUser(clerkUser);
    }

    if (!finalEmail) {
      return res.status(400).json({ message: "Could not resolve email for invitation." });
    }

    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId,
      inviterUserId,
      emailAddress: finalEmail,
      role,
      redirectUrl,
    });

    // Best-effort audit logging. If audit write fails, don't fail the invitation.
    try {
      await ActivityLog.create({
        action: "ORG_INVITATION_CREATED",
        actor_user_id: inviterUserId,
        organization_id: organizationId,
        target_user_id: clerkUserId || null,
        role,
        ip: req.ip || null,
        userAgent: req.get("user-agent") || null,
        metadata: {
          emailAddress: finalEmail,
          redirectUrl: redirectUrl || null,
        },
      });
    } catch (e) {
      console.warn("ActivityLog write failed (non-blocking):", e?.message || e);
    }

    res.status(200).json(invitation);
  } catch (err) {
    console.error("createOrganizationInvitation error:", err);
    res.status(500).json({ message: err?.message || "Failed to create invitation." });
  }
};

