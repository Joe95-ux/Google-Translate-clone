const PORT = 4000;
import axios from "axios";
import fs from "fs";
import { promises as fsPromises } from 'fs';
import path from "path";
import express from "express";
import cors from "cors";
import multer from "multer";
import { OpenAI } from "openai";
import { extractRawText } from "mammoth";
import pdf from "pdf-parse";
import { Readable } from "stream";
import { translateText } from "./controllers/translateText.js";
import {
  translateDoc,
  lanOptions,
  generateTranslatedPdf,
  convertDocxToHTML,
  convertHTMLToDocx,
  convertHTMLToPdf,
  convertPdfToHTML,
  convertHTMLToPptx,
  convertPptxToHTML,
  convertXlsxToHTML,
  convertHTMLToXlsx,
} from "./util.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());

//openai config

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const deleteUploadsDirectory = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.unlinkSync(filePath); // Delete file or directory
    });
  });
};


// delete files in upload directory
deleteUploadsDirectory("public/uploads/");

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

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/languages", async (req, res) => {
  try {
    const response = await axios.request(lanOptions);
    const arrayData = response.data.map((language) => {
      if (language.language === "Automatic") {
        return "Detect language";
      } else {
        return language.language;
      }
    });
    res.status(200).json(arrayData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
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

app.post("/translate-document", upload.single("file"), async (req, res) => {
  try {
    let { fromLanguage, toLanguage } = req.body;

    const file = req.file;
    const filePath = file.path;

    const extractTextFromDocx = async (filePath) => {
      const buffer = await fsPromises.readFile(filePath);
      const { value } = await extractRawText({ buffer });
      return value;
    };

    const extractTextFromPdf = async (filePath) => {
      const buffer = await fsPromises.readFile(filePath);
      const data = await pdf(buffer);
      return data.text;
    };

    // Extract text based on file type
    let extractedText = "";
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension === ".pdf") {
      extractedText = await extractTextFromPdf(filePath);
    } else if (fileExtension === ".docx") {
      extractedText = await extractTextFromDocx(filePath);
    } else if (fileExtension === ".pptx") {
      // Extract text from PPTX (you may need a library like pptx-extractor)
    } else if (fileExtension === ".xlsx") {
      // Extract text from XLSX (you may need a library like xlsx)
    }

    // Translate the extracted text
    const translatedText = await translateDoc(
      extractedText,
      fromLanguage,
      toLanguage
    );

    // Generate a translated PDF document
    const translatedPdfDoc = await generateTranslatedPdf(translatedText);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF stream to the response
    translatedPdfDoc.pipe(res);
  } catch (error) {
    console.error('Error translating document:', error);
    res.status(500).send('An error occurred while translating the document.');
  }
});

//translate text
app.get("/translation", translateText);

app.get('/detect-language', async (req, res) => {
  const {textToTranslate} = req.query;
  const encodedParams = new URLSearchParams();
  encodedParams.set('text', textToTranslate);
  const options = {
    method: 'POST',
    url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/detect-language',
    headers:headers,
    data: encodedParams
  }

  try {
    const response = await axios.request(options);
    res.status(200).json(response.data.source_lang);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

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

    // Write the audio data to a temporary file
    const directory = path.resolve(__dirname, "public");

    // Delete all existing files in the directory
    await deleteFilesInDirectory(directory);

    // Modify the filename to include the timestamp
    const audioFilePath = path.resolve(directory, `speech_${timestamp}.mp3`);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(audioFilePath, buffer);

    // Send the URL of the generated audio file in the response
    res.json({ url: `http://localhost:4000/speech_${timestamp}.mp3` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to synthesize speech" });
  }
});

// Function to delete all files in a directory
async function deleteFilesInDirectory(directory) {
  try {
    // Check if the directory exists
    const directoryExists = await fs.promises.access(directory, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!directoryExists) {
      console.error(`Directory ${directory} does not exist or is not accessible.`);
      return;
    }

    // Read the files in the directory
    const entries = await fs.promises.readdir(directory);

    // Iterate over the entries and delete files starting with 'speech:'
    for (const entry of entries) {
      const entryPath = path.resolve(directory, entry);
      const stats = await fs.promises.stat(entryPath);

      // Check if the entry is a file and starts with 'speech:'
      if (stats.isFile() && entry.startsWith('speech')) {
        await fs.promises.unlink(entryPath);
      }
    }
  } catch (error) {
    console.error('Error deleting files in directory:', error);
  }
}


app.get("/speech_:timestamp.mp3", (req, res) => {
  const { timestamp } = req.params;
  const audioFilePath = path.resolve(
    __dirname,
    "public",
    `speech_${timestamp}.mp3`
  );

  // Send the file to the client
  res.sendFile(audioFilePath, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: 0,
    },
  });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
