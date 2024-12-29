dotenv.config();
import dotenv from "dotenv";
import { TranslationServiceClient } from "@google-cloud/translate";

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
