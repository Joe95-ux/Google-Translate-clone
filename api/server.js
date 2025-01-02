const PORT = process.env.PORT || 4000;
import axios from "axios";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { OpenAI } from "openai";
import { Readable } from "stream";
import {
  translateText,
  translateTextWithGoogle,
  getLanguageDisplayNames,
  getDetectedLanguage,
  getDocumentTranslation,
} from "./controllers/translateText.js";
import {
  lanOptions,
  headers,
  generateWordDocument,
  generateOCR,
  convertDocxToHtml,
  convertHTMLToPdf,
  convertPdfToHTML,
} from "./util.js";
import connectDB from "./db.js";
import logger from "./logger.js";
import { fileURLToPath } from "url";
import os from 'os';
import dotenv from "dotenv";
import { deleteTemporaryFiles, ensureTempDirectory } from "./lib.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __rootDir = path.resolve();

const isProduction = process.env.NODE_ENV === "production";
const TMP_DIR = isProduction ? os.tmpdir() : path.resolve(__rootDir, "public", "temp");

dotenv.config();

//MONGODB CONFIG
connectDB();

const app = express();

app.use(cors());

//openai config

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const deleteUploadsDirectory = async (directory) => {
  try {
    const files = await fs.promises.readdir(directory);
    if (files.length === 0) {
      console.log("No files to delete.");
      return;
    }

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directory, file);
        await fs.promises.unlink(filePath); // Delete file or directory
      })
    );

    console.log("Files deleted successfully.");
  } catch (err) {
    console.error("Error reading or deleting directory:", err);
  }
};

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Set up multer for handling file uploads to cloud
const cloudUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // limit file size to 10MB
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//languages with google translate api: remove "z" to us and delete route under it
app.get("/languagesz", async (req, res) => {
  try {
    const response = await axios.request(lanOptions);
    if (response.data && Array.isArray(response.data)) {
      const arrayData = response.data.map((language) => {
        if (language.language === "Automatic") {
          return "Detect language";
        } else {
          return language.language;
        }
      });
      res.status(200).json(arrayData);
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (err) {
    console.error("Error fetching languages:", err.message);
    res.status(500).json({ message: "Failed to fetch languages" });
  }
});

// using google cloud translate: delete this to use route with google translate API
app.get("/languages", getLanguageDisplayNames);

app.get("/clear-uploads", async (req, res) => {
  try {
    await deleteUploadsDirectory("public/uploads/");
    res.status(200).json({ message: "cleared uploads successfully!" });
  } catch (error) {
    res.status(500).json({ message: "failed to clear recent uploads" });
    console.log(error);
  }
});

//translate Doc

// app.post("/translate-document", upload.single("file"), async (req, res) => {
//   try {
//     const { fromLanguage, toLanguage } = req.body;
//     const file = req.file;
//     const filePath = file.path;
//     const fileExtension = path.extname(file.originalname).toLowerCase();

//     let htmlContent = "";
//     switch (fileExtension) {
//       case '.pdf':
//         htmlContent = await convertPdfToHTML(filePath);
//         break;
//       case '.docx':
//         htmlContent = await convertDocxToHTML(filePath);
//         break;
//       case '.pptx':
//         htmlContent = await convertPptxToHTML(filePath);
//         break;
//       case '.xlsx':
//         htmlContent = await convertXlsxToHTML(filePath);
//         break;
//       default:
//         return res.status(400).send('Unsupported file type');
//     }

//     const translatedHtml = await translateDoc(htmlContent, fromLanguage, toLanguage);

//     let translatedDocument;
//     let fileName;
//     let contentType;
//     switch (fileExtension) {
//       case '.docx':
//         translatedDocument = await convertHTMLToDocx(translatedHtml);
//         fileName = 'translated.docx';
//         contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//         break;
//       case '.pdf':
//         translatedDocument = await convertHTMLToPdf(translatedHtml);
//         fileName = 'translated.pdf';
//         contentType = 'application/pdf';
//         break;
//       case '.pptx':
//         translatedDocument = await convertHTMLToPptx(translatedHtml);
//         fileName = 'translated.pptx';
//         contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
//         break;
//       case '.xlsx':
//         translatedDocument = await convertHTMLToXlsx(translatedHtml);
//         fileName = 'translated.xlsx';
//         contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
//         break;
//     }

//     res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
//     res.setHeader('Content-Type', contentType);
//     res.send(translatedDocument);

//   } catch (error) {
//     console.error('Error translating document:', error);
//     res.status(500).send('An error occurred while translating the document.');
//   }
// });

app.post("/translate-documentz", upload.single("file"), async (req, res) => {
  try {
    let { fromLanguage, toLanguage } = req.body;

    const file = req.file;
    const filePath = file.path;

    // Extract text based on file type
    let extractedText = "";
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension === ".pdf") {
      extractedText = await convertPdfToHTML(
        filePath,
        fromLanguage,
        toLanguage
      );
      const OCR = await generateOCR(filePath);
    } else if (fileExtension.includes(".doc")) {
      extractedText = await convertDocxToHtml(
        filePath,
        fromLanguage,
        toLanguage
      );
    } else {
      return res.status(400).send("Unsupported file type");
    }

    // Translate the extracted text
    const translatedText = extractedText;

    // Generate the translated document based on the original file type
    let translatedDocument;
    let contentType;
    if (fileExtension === ".pdf") {
      translatedDocument = await convertHTMLToPdf(translatedText);
      contentType = "application/pdf";
    } else if (fileExtension.includes(".doc")) {
      translatedDocument = await generateWordDocument(translatedText);
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else {
      return res.status(400).send("Unsupported file type");
    }

    // Set response headers for document download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=translated${fileExtension}`
    );
    res.setHeader("Content-Type", contentType);
    translatedDocument.pipe(res);
  } catch (error) {
    console.error("Error translating document:", error);
    res.status(500).send("An error occurred while translating the document.");
  }
});

// translate document with google cloud translate
app.post(
  "/translate-document",
  cloudUpload.single("file"),
  getDocumentTranslation
);

//translate text
app.get("/translation", translateTextWithGoogle);

// app.get('/detect-language', async (req, res) => {
//   const {textToTranslate} = req.query;
//   const encodedParams = new URLSearchParams();
//   encodedParams.set('text', textToTranslate);
//   const options = {
//     method: 'POST',
//     url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/detect-language',
//     headers:headers,
//     data: encodedParams
//   }

//   try {
//     const response = await axios.request(options);
//     res.status(200).json(response.data.source_lang);
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ message: err })
//   }
// })

//detect language with google cloud translate

app.get("/detect-language", getDetectedLanguage);

// open ai requests

// app.get("/detect-language", async (req, res) => {
//   try {
//     const { textToTranslate } = req.query;
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a language detector. Once a text is provided, detect the language and send only the language as response; for example English.",
//         },
//         {
//           role: "user",
//           content: textToTranslate,
//         },
//       ],
//       temperature: 1,
//       max_tokens: 256,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//     });
//     res.status(200).json(response.choices[0].message.content);
//   } catch (error) {
//     console.error("error", error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.post("/synthesize-speech", async (req, res) => {
  const { input } = req.body;
  const timestamp = Date.now();

  try {
    // Generate speech audio from the input text using OpenAI text-to-speech API
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input,
    });

    // Ensure the temp directory exists
    await ensureTempDirectory();
    
    // Clean up old temp files
    await deleteTemporaryFiles(TMP_DIR);

    // Modify the filename to include the timestamp
    const audioFilePath = path.resolve(TMP_DIR, `speech_${timestamp}.mp3`);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(audioFilePath, buffer);

    // Send the URL of the generated audio file in the response
    const audioURL =
      isProduction ? "/temp/" : "http://localhost:4000/temp/";

    res.json({ url: `${audioURL}speech_${timestamp}.mp3` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to synthesize speech" });
  }
});


app.get("/speech_:timestamp.mp3", (req, res) => {
  const { timestamp } = req.params;
  const audioFilePath = path.resolve(TMP_DIR, `speech_${timestamp}.mp3`);

  // Send the file to the client
  res.sendFile(audioFilePath, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: 0,
    },
  });
});
const __newdir = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__newdir, "/client/build")));

  // Catch-all route for React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__newdir, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => {
  logger.info("Server running on port " + PORT);
});
