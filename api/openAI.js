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
        { role: "system", content: `You are a translation expert. Your task is to deduce at least three plausible contexts for the sentence: "${textToTranslate}", originally written in ${inputLanguage} and translated into ${outputLanguage} as "${translatedText}". For each context, rewrite the translation to fit naturally and accurately within that context. Return a JSON object where each key is a short context label (e.g., "Casual Conversation", "Medical Setting") and the value is the retranslated sentence that fits that context. Only return a pure JSON object. Do not include any explanations or additional text.` }
      ],
    });
    return response;
  } catch (error) {
    console.error("An error occurred while adding context to thetranslation:", error.messages)
    return error.messages;
  }
}
