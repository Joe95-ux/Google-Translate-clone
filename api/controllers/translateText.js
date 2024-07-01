import { getLanguageShort, headers } from "../util.js";
import {getSupportedLanguages, getLangShort, detectLanguage} from "../utilProd.js";
import axios from "axios"

export const translateText = async (req, res) => {
  const { text, outputLang, inputLang } = req.query;
  const fromLang = await getLanguageShort(inputLang);
  const toLang = await getLanguageShort(outputLang);
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

