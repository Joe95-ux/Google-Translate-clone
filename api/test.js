import {TranslationServiceClient} from '@google-cloud/translate';

const projectId = process.env.PROJECT_ID;
const location = "global";
if (!projectId) {
    throw new Error('PROJECT_ID environment variable is not set');
  }


// Instantiates a client
const translationClient = new TranslationServiceClient();

async function getSupportedLanguages() {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
  };

  // Get supported languages
  const [response] = await translationClient.getSupportedLanguages(request);

  for (const language of response.languages) {
    // Supported language code, generally consisting of its ISO 639-1 identifier, for
    // example, 'en', 'ja'. In certain cases, BCP-47 codes including language and
    // region identifiers are returned (for example, 'zh-TW' and 'zh-CN')
    console.log(`Language - Language Code: ${language.languageCode}`);
    // Human readable name of the language localized in the display language specified
    // in the request.
    console.log(`Language - Display Name: ${language.displayName}`);
    // Can be used as source language.
    console.log(`Language - Support Source: ${language.supportSource}`);
    // Can be used as target language.
    console.log(`Language - Support Target: ${language.supportTarget}`);
  }
}

getSupportedLanguages();