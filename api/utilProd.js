dotenv.config();
import dotenv from "dotenv";
import { TranslationServiceClient } from "@google-cloud/translate";
import vision from '@google-cloud/vision';
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {fileURLToPath} from "url";
import sharp from "sharp";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Font configuration
const fonts = {
  latin: { 
    path: path.join(__dirname, 'fonts/NotoSans-Regular.ttf'),
    family: 'Noto Sans'
  },
  cjk: {
    path: path.join(__dirname, 'fonts/NotoSans-Regular.ttf'),
    family: 'Noto Sans'
  },
  arabic: {
    path: path.join(__dirname, 'fonts/NotoSansArabic-Regular.ttf'),
    family: 'Noto Sans Arabic'
  }
};

// Register all fonts
Object.values(fonts).forEach(font => {
  registerFont(font.path, { family: font.family });
});

// Helper functions
function getFontForLanguage(languageCode) {
  if (/ja|ko|zh/.test(languageCode)) return fonts.cjk;
  if (/ar|fa|ur/.test(languageCode)) return fonts.arabic;
  return fonts.latin;
}

function drawRoundedRect(ctx, vertices, radius) {
  const [v0, v1, v2, v3] = vertices;
  ctx.beginPath();
  ctx.moveTo(v0.x + radius, v0.y);
  ctx.lineTo(v1.x - radius, v1.y);
  ctx.quadraticCurveTo(v1.x, v1.y, v1.x, v1.y + radius);
  ctx.lineTo(v2.x, v2.y - radius);
  ctx.quadraticCurveTo(v2.x, v2.y, v2.x - radius, v2.y);
  ctx.lineTo(v3.x + radius, v3.y);
  ctx.quadraticCurveTo(v3.x, v3.y, v3.x, v3.y - radius);
  ctx.lineTo(v0.x, v0.y + radius);
  ctx.quadraticCurveTo(v0.x, v0.y, v0.x + radius, v0.y);
  ctx.closePath();
}

const projectId = process.env.PROJECT_ID;
const location = "global";
if (!projectId) {
  throw new Error("PROJECT_ID environment variable is not set");
}

// Instantiates a client
const translationClient = new TranslationServiceClient();

export async function getSupportedLanguages() {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    displayLanguageCode: "en",
  };
  try {
    // Get supported languages
    const [response] = await translationClient.getSupportedLanguages(request);
    return response.languages;
  } catch (error) {
    console.log(error);
  }
}

// process language codes
export async function getLangShort(language) {
  let lan;
  if (
    language === "Detect language" ||
    language === "" ||
    language === null ||
    language === "unknown"
  ) {
    return "";
  } else if (language.includes("Detected")) {
    lan = language.split(" - ")[0];
  } else {
    lan = language;
  }

  try {
    const data = await getSupportedLanguages();
    const filteredLan = data.filter(
      (languageObj) => languageObj.displayName === lan
    );
    return filteredLan[0]?.languageCode || 'undefined';
  } catch (error) {
    console.log(error);
  }
}

// detect language
export async function detectLanguage(text) {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    content: text,
  };

  try {
    // Run request
    const languages = await getSupportedLanguages();
    const [response] = await translationClient.detectLanguage(request);

    let languageCode = response.languages[0].languageCode;
    let language;
    if (languageCode) {
      const languageObj = languages.filter(
        (lang) => lang.languageCode === languageCode
      );
      language = languageObj[0].displayName;
    }
    return language;
  } catch (error) {
    console.log(error);
  }
}

// translate text

export async function translateTextFxn(text, fromLang, toLang) {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: "text/plain", // mime types: text/plain, text/html
    sourceLanguageCode: fromLang,
    targetLanguageCode: toLang,
  };

  // Run request
  const [response] = await translationClient.translateText(request);
  // console.log(response.glossaryTranslations);

  // for (const translation of response.translations) {
  //   console.log(`Translation: ${translation.translatedText}`);
  // }
  return response.translations[0].translatedText;
}

// translateText("The quick brown fox jumped over the white lazy dog");

// translate document

export async function translateDocument(inputUri, mimeType, from, to) {
  const documentInputConfig = {
    gcsSource: {
      inputUri: inputUri,
    },
    mimeType: mimeType,
  };
  // Construct request
  const request = {
    parent: translationClient.locationPath(projectId, location),
    documentInputConfig: documentInputConfig,
    sourceLanguageCode: from,
    targetLanguageCode: to,
  };

  // Run request
  try {
    const [response] = await translationClient.translateDocument(request);
    const byteStreams = response.documentTranslation.byteStreamOutputs;
    const translatedMimeType = response.documentTranslation.mimeType;

    return {
      byteStreams,
      translatedMimeType,
    };
  } catch (error) {

  }
}

export async function picToText(inputUri){
  const client = new vision.ImageAnnotatorClient();

  // Performs text detection on the local file
  const [result] = await client.textDetection(inputUri);
  return result.fullTextAnnotation;

}

// Text extraction helper
export function extractTextElements(fullTextAnnotation) {
  const textElements = [];

  for (const page of fullTextAnnotation.pages) {
    for (const block of page.blocks) {
      for (const paragraph of block.paragraphs) {
        for (const word of paragraph.words) {
          const wordText = word.symbols.map((s) => s.text).join("");
          textElements.push({
            text: wordText,
            boundingBox: word.boundingBox,
            confidence: word.confidence || 1.0,
          });
        }
      }
    }
  }
  return textElements;
}

// Create Glossary

// const glossaryId = 'your-glossary-display-name'

// async function createGlossary() {
//   // Construct glossary
//   const glossary = {
//     languageCodesSet: {
//       languageCodes: ['en', 'es'],
//     },
//     inputConfig: {
//       gcsSource: {
//         inputUri: 'gs://cloud-samples-data/translation/glossary.csv',
//       },
//     },
//     name: `projects/${projectId}/locations/${location}/glossaries/${glossaryId}`,
//   };

//   // Construct request
//   const request = {
//     parent: `projects/${projectId}/locations/${location}`,
//     glossary: glossary,
//   };

//   // Create glossary using a long-running operation
//   const [operation] = await translationClient.createGlossary(request);

//   // Wait for the operation to complete
//   await operation.promise();

//   console.log('Created glossary:');
//   console.log(`InputUri ${request.glossary.inputConfig.gcsSource.inputUri}`);
// }

// createGlossary();



export async function createTranslatedImage(originalBuffer, textElements, targetLanguage) {
  const blurred = await sharp(originalBuffer).blur(8).toBuffer();
  const bgImage = await loadImage(blurred);
  const metadata = await sharp(originalBuffer).metadata();
  const { width, height } = metadata;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bgImage, 0, 0, width, height);

  const originalImage = await loadImage(originalBuffer);
  ctx.globalAlpha = 0.4;
  ctx.drawImage(originalImage, 0, 0, width, height);
  ctx.globalAlpha = 1.0;

  for (const el of textElements) {
    if (!el.boundingBox?.vertices) {
      console.warn("Skipping element without valid bounding box:", el);
      continue;
    }
    await renderTranslatedText(ctx, el, targetLanguage);
  }

  return canvas.toBuffer("image/png");
}


async function renderTranslatedText(ctx, element, targetLanguage) {
  const vertices = element.boundingBox.vertices;
  if (!vertices || vertices.length !== 4) return;

  const x = vertices[0].x;
  const y = vertices[0].y;
  const boxWidth = vertices[1].x - vertices[0].x;
  const boxHeight = vertices[2].y - vertices[1].y;

  const { fontFamily, fontSize } = calculateTextStyle(element.translatedText, boxWidth, boxHeight, targetLanguage);

  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(x, y, boxWidth, boxHeight);

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "top";

  const lines = wrapText(ctx, element.translatedText, boxWidth - 10);
  lines.forEach((line, i) => {
    ctx.fillText(line, x + 5, y + i * fontSize * 1.2);
  });
}


function calculateTextStyle(text, boxWidth, boxHeight, languageCode) {
  let fontSize = Math.min(boxHeight, 40);
  const fontFamily = getFontForLanguage(languageCode);

  const testCanvas = createCanvas(1, 1);
  const ctx = testCanvas.getContext("2d");

  while (fontSize > 10) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    if (metrics.width < boxWidth) break;
    fontSize -= 1;
  }

  return { fontFamily, fontSize };
}

// Text wrapping helper
function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
