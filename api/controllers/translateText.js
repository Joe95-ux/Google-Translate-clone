import { getLanguageShort, headers } from "../util.js";
import {getSupportedLanguages, getLangShort, detectLanguage, translateDocument, translateTextFxn, picToText, extractTextElements, createTranslatedImage} from "../utilProd.js";
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
  const { text, outputLang, inputLang } = req.query;
  let fromLang = await getLangShort(inputLang);
  let toLang = await getLangShort(outputLang);
  if(fromLang === toLang){
    fromLang = "";
  }
  try {
    const response = await translateTextFxn(text, fromLang, toLang);
    res.status(200).json(response);
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
    },
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
    const imageUri = publicUrl.replace('gs://', 'https://storage.googleapis.com/')
    const fullTextAnnotation = await picToText(imageUri);

    if (!fullTextAnnotation) {
      return res.status(400).json({ error: 'No text found in image' });
    }

    // 4. Extract text elements with positions
    const textElements = extractTextElements(fullTextAnnotation);
    const extractedText = textElements.map(el => el.text).join('\n\n');
    const contents = textElements.map(el => el.text);

    const translations = await translateTextFxn(contents, from, to);

    // Apply translations to text elements
    textElements.forEach((el, index) => {
      el.translatedText = translations[0].translations[index].translatedText;
    });

    // Download original image for processing
    const imageResponse = await axios.get(publicUrl.replace('gs://', 'https://storage.googleapis.com/'), { 
      responseType: 'arraybuffer' 
    });
    const originalImageBuffer = Buffer.from(imageResponse.data);

    // Create translated image
    const translatedImageBuffer = await createTranslatedImage(
      originalImageBuffer, 
      textElements, 
      to
    );

    // Upload translated image to GCS
    const translatedFileName = `translated_${file.originalname}`;
    const translatedFile = storage.bucket(process.env.BUCKET_NAME).file(translatedFileName);
    
    await translatedFile.save(translatedImageBuffer, {
      metadata: { contentType: file.mimetype },
      public: true,
    });

    // Return all required data
    console.log({extractedText,
      originalImageUrl: publicUrl,
      translatedImageUrl: `gs://${process.env.BUCKET_NAME}/${translatedFileName}`,});

    res.json({
      extractedText,
      originalImageUrl: publicUrl,
      translatedImageUrl: `gs://${process.env.BUCKET_NAME}/${translatedFileName}`,
      textElements: textElements.map(el => ({
        originalText: el.text,
        translatedText: el.translatedText,
        confidence: el.confidence,
        boundingBox: el.boundingBox
      })),
      language: {
        detected: translations[0].detectedLanguageCode || from,
        target: to
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(`Failed to translate file. ${error.message}`);
  }
};
