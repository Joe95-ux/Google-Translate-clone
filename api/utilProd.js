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
    lan = "English";
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
    return filteredLan[0].languageCode;
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
    if(languageCode){
      const languageObj = languages.filter(lang=>lang.languageCode === languageCode);
      language = languageObj[0].displayName;
    }
    return language;
  } catch (error) {
    console.log(error);
  }
}
