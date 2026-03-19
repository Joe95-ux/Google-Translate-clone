import { getLangShort } from "../utilProd.js";
import { translateDocument } from "../utilProd.js";
import { Storage } from "@google-cloud/storage";
import path from "path";
import mime from "mime-types";
import archiver from "archiver";
import { getAuth } from "@clerk/express";
import ActivityLog from "../models/Activity.js";

const storage = new Storage();

function getTranslatedExtension(translatedMimeType, originalName) {
  const lower = String(translatedMimeType || "").toLowerCase();
  if (lower.includes("pdf")) return ".pdf";
  if (lower.includes("wordprocessingml")) return ".docx";
  if (lower.includes("presentationml")) return ".pptx";
  if (lower.includes("spreadsheetml")) return ".xlsx";

  // Fallback: keep original extension.
  const ext = path.extname(originalName);
  return ext || ".bin";
}

async function uploadFileToGcs(file) {
  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const blob = bucket.file(file.originalname);

  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype || mime.lookup(file.originalname) || "application/octet-stream",
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", () => resolve(`gs://${bucket.name}/${blob.name}`));
    blobStream.end(file.buffer);
  });
}

export const translateDocumentsZip = async (req, res) => {
  const auth = getAuth(req);
  const actor_user_id = auth?.userId;
  const organizationId = req.organizationId || auth?.orgId;

  try {
    const { fromLanguage, toLanguage } = req.body || {};
    const files = req.files;

    if (!fromLanguage || !toLanguage) {
      return res.status(400).json({ message: "`fromLanguage` and `toLanguage` are required." });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one file." });
    }

    const from = await getLangShort(fromLanguage);
    const to = await getLangShort(toLanguage);

    // Stream zip back to client.
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="translated_batch.zip"');

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("Zip archiver error:", err);
      res.status(500).end();
    });
    archive.pipe(res);

    for (const file of files) {
      const mimeType = mime.lookup(file.originalname) || file.mimetype;
      if (!mimeType) {
        throw new Error(`Could not determine MIME type for file: ${file.originalname}`);
      }

      const publicUrl = await uploadFileToGcs(file);
      const { byteStreams, translatedMimeType } = await translateDocument(
        publicUrl,
        mimeType,
        from,
        to
      );

      const translatedBuffer = Buffer.concat(byteStreams || []);
      const translatedExt = getTranslatedExtension(translatedMimeType, file.originalname);
      const baseName = path.parse(file.originalname).name || "document";
      const outName = `translated_${baseName}${translatedExt}`;

      archive.append(translatedBuffer, { name: outName });
    }

    await archive.finalize();

    // Best-effort audit log (non-blocking).
    try {
      if (actor_user_id && organizationId) {
        await ActivityLog.create({
          action: "BATCH_TRANSLATION_ZIP_CREATED",
          actor_user_id,
          organization_id: organizationId,
          metadata: { fileCount: files.length },
        });
      }
    } catch (e) {
      console.warn("ActivityLog write failed for batch (non-blocking):", e?.message || e);
    }
  } catch (err) {
    console.error("translateDocumentsZip error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: err?.message || "Batch translation failed." });
    } else {
      res.end();
    }
  }
};

