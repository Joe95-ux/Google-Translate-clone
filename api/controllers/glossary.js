import { getAuth } from "@clerk/express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const Glossary = require("../models/Glossary.js");
const GlossaryEntry = require("../models/GlossaryEntry.js");
const ActivityLog = require("../models/Activity.js");

function isOrgAdmin(auth) {
  return Boolean(
    auth?.has?.({ role: "org:admin" }) || auth?.has?.({ role: "org:owner" })
  );
}

async function logActivity({
  action,
  actor_user_id,
  organization_id,
  target_user_id = null,
  role = null,
  metadata = {},
  req,
}) {
  try {
    await ActivityLog.create({
      action,
      actor_user_id,
      organization_id,
      target_user_id,
      role,
      ip: req?.ip || null,
      userAgent: req?.get?.("user-agent") || null,
      metadata,
    });
  } catch (e) {
    // Non-blocking audit logging.
    console.warn("ActivityLog write failed:", e?.message || e);
  }
}

function normalizePayload(body) {
  return body || {};
}

export const listGlossaries = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    if (!organizationId) return res.status(403).json({ message: "Organization required." });

    const glossaries = await Glossary.find({ organization_id: organizationId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ glossaries });
  } catch (err) {
    console.error("listGlossaries error:", err);
    res.status(500).json({ message: err?.message || "Failed to list glossaries." });
  }
};

export const createGlossary = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    const actor_user_id = auth?.userId;

    if (!actor_user_id) return res.status(401).json({ message: "Unauthenticated." });
    if (!organizationId) return res.status(403).json({ message: "Organization required." });
    if (!isOrgAdmin(auth)) return res.status(403).json({ message: "Admin required." });

    const { name, description } = normalizePayload(req.body);
    if (!name) return res.status(400).json({ message: "`name` is required." });

    const glossary = await Glossary.create({
      organization_id: organizationId,
      created_by_user_id: actor_user_id,
      name,
      description: description || "",
    });

    await logActivity({
      action: "GLOSSARY_CREATED",
      actor_user_id,
      organization_id: organizationId,
      req,
      metadata: { glossaryId: glossary._id, name },
    });

    res.status(201).json({ glossary });
  } catch (err) {
    console.error("createGlossary error:", err);
    res.status(500).json({ message: err?.message || "Failed to create glossary." });
  }
};

export const getGlossary = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    if (!organizationId) return res.status(403).json({ message: "Organization required." });

    const { glossaryId } = req.params;
    const glossary = await Glossary.findOne({ _id: glossaryId, organization_id: organizationId }).lean();
    if (!glossary) return res.status(404).json({ message: "Glossary not found." });

    const entries = await GlossaryEntry.find({ glossary_id: glossaryId, organization_id: organizationId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ glossary, entries });
  } catch (err) {
    console.error("getGlossary error:", err);
    res.status(500).json({ message: err?.message || "Failed to fetch glossary." });
  }
};

export const updateGlossary = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    const actor_user_id = auth?.userId;

    if (!actor_user_id) return res.status(401).json({ message: "Unauthenticated." });
    if (!organizationId) return res.status(403).json({ message: "Organization required." });
    if (!isOrgAdmin(auth)) return res.status(403).json({ message: "Admin required." });

    const { glossaryId } = req.params;
    const { name, description } = normalizePayload(req.body);

    const updated = await Glossary.findOneAndUpdate(
      { _id: glossaryId, organization_id: organizationId },
      { $set: { ...(name ? { name } : {}), description: description ?? undefined } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Glossary not found." });

    await logActivity({
      action: "GLOSSARY_UPDATED",
      actor_user_id,
      organization_id: organizationId,
      req,
      metadata: { glossaryId, name: name || updated.name },
    });

    res.status(200).json({ glossary: updated });
  } catch (err) {
    console.error("updateGlossary error:", err);
    res.status(500).json({ message: err?.message || "Failed to update glossary." });
  }
};

export const deleteGlossary = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    const actor_user_id = auth?.userId;

    if (!actor_user_id) return res.status(401).json({ message: "Unauthenticated." });
    if (!organizationId) return res.status(403).json({ message: "Organization required." });
    if (!isOrgAdmin(auth)) return res.status(403).json({ message: "Admin required." });

    const { glossaryId } = req.params;

    const glossary = await Glossary.findOne({ _id: glossaryId, organization_id: organizationId }).lean();
    if (!glossary) return res.status(404).json({ message: "Glossary not found." });

    await GlossaryEntry.deleteMany({ glossary_id: glossaryId, organization_id: organizationId });
    await Glossary.deleteOne({ _id: glossaryId, organization_id: organizationId });

    await logActivity({
      action: "GLOSSARY_DELETED",
      actor_user_id,
      organization_id: organizationId,
      req,
      metadata: { glossaryId, name: glossary.name },
    });

    res.status(200).json({ message: "Glossary deleted." });
  } catch (err) {
    console.error("deleteGlossary error:", err);
    res.status(500).json({ message: err?.message || "Failed to delete glossary." });
  }
};

export const createGlossaryEntry = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    const actor_user_id = auth?.userId;

    if (!actor_user_id) return res.status(401).json({ message: "Unauthenticated." });
    if (!organizationId) return res.status(403).json({ message: "Organization required." });
    if (!isOrgAdmin(auth)) return res.status(403).json({ message: "Admin required." });

    const { glossaryId } = req.params;
    const { fromLanguage, toLanguage, sourceText, targetText, notes } = normalizePayload(req.body);

    if (!sourceText || !targetText) {
      return res.status(400).json({ message: "`sourceText` and `targetText` are required." });
    }

    const glossary = await Glossary.findOne({ _id: glossaryId, organization_id: organizationId }).lean();
    if (!glossary) return res.status(404).json({ message: "Glossary not found." });

    const entry = await GlossaryEntry.create({
      organization_id: organizationId,
      glossary_id: glossaryId,
      fromLanguage: fromLanguage || null,
      toLanguage: toLanguage || null,
      sourceText,
      targetText,
      notes: notes || "",
    });

    await logActivity({
      action: "GLOSSARY_ENTRY_CREATED",
      actor_user_id,
      organization_id: organizationId,
      req,
      metadata: { glossaryId, entryId: entry._id },
    });

    res.status(201).json({ entry });
  } catch (err) {
    console.error("createGlossaryEntry error:", err);
    res.status(500).json({ message: err?.message || "Failed to create glossary entry." });
  }
};

export const updateGlossaryEntry = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    const actor_user_id = auth?.userId;

    if (!actor_user_id) return res.status(401).json({ message: "Unauthenticated." });
    if (!organizationId) return res.status(403).json({ message: "Organization required." });
    if (!isOrgAdmin(auth)) return res.status(403).json({ message: "Admin required." });

    const { glossaryId, entryId } = req.params;
    const { fromLanguage, toLanguage, sourceText, targetText, notes } = normalizePayload(req.body);

    const updated = await GlossaryEntry.findOneAndUpdate(
      { _id: entryId, glossary_id: glossaryId, organization_id: organizationId },
      {
        $set: {
          ...(fromLanguage !== undefined ? { fromLanguage: fromLanguage || null } : {}),
          ...(toLanguage !== undefined ? { toLanguage: toLanguage || null } : {}),
          ...(sourceText !== undefined ? { sourceText } : {}),
          ...(targetText !== undefined ? { targetText } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Entry not found." });

    await logActivity({
      action: "GLOSSARY_ENTRY_UPDATED",
      actor_user_id,
      organization_id: organizationId,
      req,
      metadata: { glossaryId, entryId },
    });

    res.status(200).json({ entry: updated });
  } catch (err) {
    console.error("updateGlossaryEntry error:", err);
    res.status(500).json({ message: err?.message || "Failed to update entry." });
  }
};

export const deleteGlossaryEntry = async (req, res) => {
  try {
    const auth = getAuth(req);
    const organizationId = req.organizationId || auth?.orgId;
    const actor_user_id = auth?.userId;

    if (!actor_user_id) return res.status(401).json({ message: "Unauthenticated." });
    if (!organizationId) return res.status(403).json({ message: "Organization required." });
    if (!isOrgAdmin(auth)) return res.status(403).json({ message: "Admin required." });

    const { glossaryId, entryId } = req.params;

    const existing = await GlossaryEntry.findOne({
      _id: entryId,
      glossary_id: glossaryId,
      organization_id: organizationId,
    }).lean();
    if (!existing) return res.status(404).json({ message: "Entry not found." });

    await GlossaryEntry.deleteOne({ _id: entryId, glossary_id: glossaryId, organization_id: organizationId });

    await logActivity({
      action: "GLOSSARY_ENTRY_DELETED",
      actor_user_id,
      organization_id: organizationId,
      req,
      metadata: { glossaryId, entryId },
    });

    res.status(200).json({ message: "Entry deleted." });
  } catch (err) {
    console.error("deleteGlossaryEntry error:", err);
    res.status(500).json({ message: err?.message || "Failed to delete entry." });
  }
};

