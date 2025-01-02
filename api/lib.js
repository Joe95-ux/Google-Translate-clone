dotenv.config();
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from ('os');

// Determine the temporary directory based on the environment
const isProduction = process.env.NODE_ENV === "production";
const TMP_DIR = isProduction ? os.tmpdir() : path.resolve(__dirname, "public", "temp");

// Ensure the directory exists in development
export async function ensureTempDirectory() {
  if (!isProduction) {
    try {
      await fs.promises.mkdir(TMP_DIR, { recursive: true });
      console.log(`Temporary directory ensured at: ${TMP_DIR}`);
    } catch (error) {
      console.error(`Failed to create temp directory at ${TMP_DIR}:`, error);
    }
  }
}

// Write a temporary file
async function writeTemporaryFile(fileName, data) {
  await ensureTempDirectory(); // Ensure directory exists in development
  const tmpFilePath = path.join(TMP_DIR, fileName);
  await fs.promises.writeFile(tmpFilePath, data);
  console.log(`File written at: ${tmpFilePath}`);
}

// Delete temporary files
export async function deleteTemporaryFiles(directory) {
  try {
    // Ensure the directory exists
    await ensureTempDirectory();

    const directoryExists = await fs.promises
      .access(TMP_DIR, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!directoryExists) {
      console.error(
        `Directory ${TMP_DIR} does not exist or is not accessible.`
      );
      return;
    }
    const entries = await fs.promises.readdir(directory);

    for (const entry of entries) {
      const entryPath = path.resolve(directory, entry);
      const stats = await fs.promises.stat(entryPath);

      if (stats.isFile() && entry.startsWith("speech")) {
        await fs.promises.unlink(entryPath);
        console.log(`Deleted: ${entryPath}`);
      }
    }
  } catch (error) {
    console.error("Error deleting temporary files:", error);
  }
}
