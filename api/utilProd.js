dotenv.config();
import dotenv from "dotenv";
import { TranslationServiceClient } from "@google-cloud/translate";
import {vision} from '@google-cloud/vision';
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {fileURLpath} from "url";
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
    path: path.join(__dirname, 'fonts/NotoSansCJK-Regular.ttc'),
    family: 'Noto Sans CJK'
  },
  arabic: {
    path: path.join(__dirname, 'fonts/NotoNaskhArabic-Regular.ttf'),
    family: 'Noto Naskh Arabic'
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
  const elements = [];
  
  for (const page of fullTextAnnotation.pages) {
    for (const block of page.blocks) {
      for (const paragraph of block.paragraphs) {
        let paragraphText = '';
        const words = [];
        
        for (const word of paragraph.words) {
          let wordText = '';
          for (const symbol of word.symbols) {
            wordText += symbol.text;
          }
          words.push({
            text: wordText,
            boundingBox: word.boundingBox
          });
          paragraphText += wordText + ' ';
        }
        
        elements.push({
          text: paragraphText.trim(),
          boundingBox: paragraph.boundingBox,
          words
        });
      }
    }
  }
  
  return elements;
}

// Image creation helper
export async function createTranslatedImage(originalBuffer, textElements, targetLanguage) {
  // Load fonts (should be done once at startup)
  const font = getFontForLanguage(targetLanguage);
  
  // Get image metadata
  const metadata = await sharp(originalBuffer).metadata();
  const canvas = createCanvas(metadata.width, metadata.height);
  const ctx = canvas.getContext('2d');
  
  // Draw original image
  const img = await loadImage(originalBuffer);
  ctx.drawImage(img, 0, 0);
  
  // Process each text element
  for (const element of textElements) {
    const vertices = element.boundingBox.vertices;
    
    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    drawRoundedRect(ctx, vertices, 5);
    ctx.fill();
    
    // Configure text style
    const fontSize = calculateOptimalFontSize(element.translatedText, vertices);
    ctx.font = `${fontSize}px "${font.family}"`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    
    // Draw translated text
    const lines = wrapText(ctx, element.translatedText, vertices[1].x - vertices[0].x - 10);
    const startY = vertices[0].y + 10;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, vertices[0].x + 5, startY + (i * fontSize * 1.2));
    });
  }
  
  return canvas.toBuffer('image/png');
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



async function createTranslatedImage(originalBuffer, textElements, targetLanguage) {
  // Create a blurred version of the original for background
  const blurredImage = await sharp(originalBuffer)
    .blur(8)
    .toBuffer();
  
  // Load the blurred background
  const bgImage = await loadImage(blurredImage);
  
  // Get image dimensions
  const metadata = await sharp(originalBuffer).metadata();
  const { width, height } = metadata;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw blurred background
  ctx.drawImage(bgImage, 0, 0, width, height);
  
  // Draw original image with reduced opacity
  const originalImage = await loadImage(originalBuffer);
  ctx.globalAlpha = 0.4;
  ctx.drawImage(originalImage, 0, 0, width, height);
  ctx.globalAlpha = 1.0;
  
  // Process each text element
  for (const element of textElements) {
    await renderTranslatedText(ctx, element, targetLanguage);
  }
  
  // Convert canvas to buffer
  return canvas.toBuffer('image/png');
}

async function renderTranslatedText(ctx, element, targetLanguage) {
  const vertices = element.boundingBox.vertices;
  const { fontFamily, fontSize } = calculateTextStyle(
    element.translatedText,
    vertices,
    targetLanguage
  );
  
  // Draw text background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  drawRoundedRect(ctx, vertices, 5);
  ctx.fill();
  
  // Configure text style
  const font = getFontForLanguage(targetLanguage);
  ctx.font = `${fontSize}px "${font.family}"`;
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // Calculate text position
  const x = vertices[0].x;
  const y = vertices[0].y;
  const boxWidth = vertices[1].x - vertices[0].x;
  const boxHeight = vertices[3].y - vertices[0].y;
  
  // Wrap text to fit bounding box
  const lines = wrapText(ctx, element.translatedText, boxWidth - 20, fontSize);
  const totalTextHeight = lines.length * fontSize * 1.2;
  const startY = y + (boxHeight - totalTextHeight) / 2;
  
  // Draw each line of text
  lines.forEach((line, i) => {
    ctx.fillText(line, x + 10, startY + (i * fontSize * 1.2));
  });
}

function calculateTextStyle(text, vertices, languageCode) {
  const boxWidth = vertices[1].x - vertices[0].x;
  const boxHeight = vertices[3].y - vertices[0].y;
  const font = getFontForLanguage(languageCode);
  
  // Start with maximum possible size
  let fontSize = Math.min(boxHeight, 40);
  let fits = false;
  
  // Reduce font size until text fits
  while (fontSize > 8 && !fits) {
    const testCanvas = createCanvas(1, 1);
    const testCtx = testCanvas.getContext('2d');
    testCtx.font = `${fontSize}px "${font.family}"`;
    
    const metrics = testCtx.measureText(text);
    const textWidth = metrics.width;
    
    // Estimate lines needed
    const charsPerLine = Math.floor(boxWidth / (fontSize * 0.6));
    const linesNeeded = Math.ceil(text.length / charsPerLine);
    const estimatedHeight = linesNeeded * fontSize * 1.2;
    
    if (textWidth < boxWidth * 1.5 && estimatedHeight < boxHeight * 0.9) {
      fits = true;
    } else {
      fontSize -= 1;
    }
  }
  
  return { fontFamily: font.family, fontSize };
}
