const PORT = 4000;
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import express from "express";
import cors from "cors";
import multer from "multer";
import { OpenAI } from "openai";
import { extractRawText } from "mammoth";
import pdf from "pdf-parse";
import { translateText } from "./controllers/translateText.js";
import { translateDoc, lanOptions } from "./util.js";
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
app.post("/translate-document", upload.single("file"), async (req, res) => {
  let { fromLanguage, toLanguage } = req.body;

  const file = req.file;
  const filePath = file.path;

  const extractTextFromDocx = async (filePath) => {
    const buffer = await fs.readFile(filePath);
    const { value } = await extractRawText({ buffer });
    return value;
  };

  const extractTextFromPdf = async (filePath) => {
    const buffer = await fs.readFile(filePath);
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

  // Write translated text back to the document (simplified for demonstration)
  const translatedFileName = `${Date.now()}_translated${path.extname(
    file.originalname
  )}`;
  const translatedFilePath = path.join(
    __dirname,
    "public",
    "uploads",
    translatedFileName
  );
  await fs.writeFile(translatedFilePath, translatedText);

  // Send back the translated document
  res.sendFile(translatedFilePath);
});

//translate text
app.get("/translation", translateText);

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

// open ai requests

app.get("/detect-language", async (req, res) => {
  try {
    const { textToTranslate } = req.query;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Hello! I'm here to help you detect the language of a given text. Please provide the text you want me to analyze. I will only send the language as response and nothing more. ",
        },
        {
          role: "user",
          content: textToTranslate,
        },
      ],
    });
    res.status(200).json(response.choices[0].message.content);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: error.message });
  }
});

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
  const files = await fs.promises.readdir(directory);
  for (const file of files) {
    await fs.promises.unlink(path.resolve(directory, file));
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
