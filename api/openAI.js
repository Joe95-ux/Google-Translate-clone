import { openai } from "./server.js";

export async function contextualize(
  inputLanguage,
  outputLanguage,
  textToTranslate,
  translatedText
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are a translation expert. Your job is to deduce the context for this ${translatedText} given that the input language is ${inputLanguage}, output language is ${outputLanguage}, and original text to translate is ${textToTranslate}. You can deduce atleast three context for each translatedText and improve the translation based on the deduced contexts. return the response as an object with deduced context serving as key and translation based on that context serving as value ` },
        { role: "user", content: `As a translation expert, given the ${inputLanguage}, ${outputLanguage}, ${textToTranslate} and ${translatedText}, please provide context for the translated text. You could provide up to three context for each translated text and as per the context, adjust the translation to reflect that context so that the end user can have improved translations based on the context(s) deduced.The response should be an object with the context and translation based on that context as key value pairs respectively.` },
      ],
    });
    return response;
  } catch (error) {
    console.error("An error occurred while adding context to thetranslation:", error.messages)
    return error.messages;
  }
}
