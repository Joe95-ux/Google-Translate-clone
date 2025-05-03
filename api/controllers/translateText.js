import { getLanguageShort, headers } from "../util.js";
import {getSupportedLanguages, getLangShort, detectLanguage, translateDocument, translateTextFxn, picToText, extractTextElements, createTranslatedImage} from "../utilProd.js";
import {contextualize} from "../openAI.js";
import axios from "axios";
import mime from "mime-types";
import { Writable } from 'stream';
import {Storage} from '@google-cloud/storage';

const storage = new Storage();

export const translateText = async (req, res) => {
  const { text, outputLang, inputLang } = req.query;
  const fromLang = await getLangShort(inputLang);
  const toLang = await getLangShort(outputLang);
  const options = {
    method: "POST",
    headers: headers,
    data: new URLSearchParams({
      from: fromLang,
      to: toLang,
      text: text,
    }),
  };

  try {
    const response = await axios.request(
      "https://google-translate113.p.rapidapi.com/api/v1/translator/text",
      options
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

//translate text with google cloud translate
export const translateTextWithGoogle = async (req, res) => {
  const { text, outputLang, inputLang, context } = req.query;
  let fromLang = await getLangShort(inputLang);
  let toLang = await getLangShort(outputLang);
  if(fromLang === toLang){
    fromLang = "";
  }
  try {
    const result = await translateTextFxn(text, fromLang, toLang);
    let contextResponse;
    if(context === "true"){
      const resultObject = await contextualize(
        inputLang,
        outputLang,
        text,
        result
      );

      contextResponse = resultObject.choices[0].message.content;
      console.log(contextResponse, context);
    }else{
      contextResponse = {};
    }
    const data = {translation: result, contextTranslations: contextResponse};
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};


// language display Name
export const getLanguageDisplayNames = async (req, res)=>{
  try {
    const languages = await getSupportedLanguages();
    if(languages && Array.isArray(languages)){
      let displayNames = languages.map(lang=>{
        return lang.displayName;
      })

      
      displayNames = ["Detect language", ...displayNames]
      res.status(200).json(displayNames);

    }else {
      throw new Error("Unexpected response format");
    }
    
  } catch (error) {
    console.log(error)
    
  }
}

// Detect language

export const getDetectedLanguage = async(req, res)=>{
  const {textToTranslate} = req.query;
  try {
    const language = await detectLanguage(textToTranslate);
    res.status(200).json(language);
  } catch (error) {
    console.log(error)
    
  }
}

// upload to cloud storage and translate document with google cloud translate

// Upload file to Google Cloud Storage
async function uploadFile(file) {
  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    }
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      resolve(`gs://${bucket.name}/${blob.name}`);
    });

    blobStream.end(file.buffer);
  });
}

export const getDocumentTranslation = async (req, res) => {
  try {
    let { fromLanguage, toLanguage } = req.body;
    const from = await getLangShort(fromLanguage);
    const to = await getLangShort(toLanguage)
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }
    const mimeType = mime.lookup(file.originalname);
    if (!mimeType) {
      return res.status(400).send('Could not determine the MIME type.');
    }

    const publicUrl = await uploadFile(file);
    const {byteStreams, translatedMimeType} = await translateDocument(publicUrl, mimeType, from, to);
    res.setHeader('Content-Type', translatedMimeType);
    res.setHeader('Content-Disposition', `attachment; filename=translated_${file.originalname}`);
    for (const buffer of byteStreams) {
      res.write(buffer);
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send(`Failed to translate file. ${error.message}`);
  }
};


export const getImageTranslation = async (req, res) => {
  try {
    const { fromLanguage, toLanguage } = req.body;
    const from = await getLangShort(fromLanguage);
    const to = await getLangShort(toLanguage);
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const mimeType = mime.lookup(file.originalname);
    if (!mimeType) {
      return res.status(400).send("Could not determine the MIME type.");
    }

    const fullTextAnnotation = await picToText(file.buffer);
    if (!fullTextAnnotation || !fullTextAnnotation.pages) {
      return res.status(400).json({ error: "No text found in image" });
    }

    const textElements = extractTextElements(fullTextAnnotation);
    const extractedText = fullTextAnnotation.text;
    let contents = textElements.map((el) => el.text).join("|||");

    const translations = await translateTextFxn(contents, from, to);
    const translatedSegments = translations?.split("|||") || [];

    // Apply translations to text elements
    textElements.forEach((el, index) => {
      el.translatedText = translatedSegments[index] || el.text;
    });

    // Generate translated image
    const translatedImageBuffer = await createTranslatedImage(file.buffer, textElements, to);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename=translated_${file.originalname}`);
    res.write(translatedImageBuffer);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send(`Failed to translate file. ${error.message}`);
  }
};
