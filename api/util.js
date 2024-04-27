
import dotenv from "dotenv"
import axios from "axios";
dotenv.config();

export const headers = {
  "content-type": "application/x-www-form-urlencoded",
  "x-rapidapi-host": process.env.RAPID_API_HOST,
  "x-rapidapi-key": process.env.RAPID_API_KEY,
};

export const lanOptions = {
  method: "GET",
  url: "https://google-translate113.p.rapidapi.com/api/v1/translator/support-languages",
  headers: headers,
};

export async function getLanguageShort(language) {
  let lan;
  if (language === "Detect language") {
    lan = "Automatic";
  } else if (language.includes("Detected")) {
    lan = language.split(" - ")[0];
  } else {
    lan = language;
  }
  try {
    const response = await axios.request(lanOptions);
    const data = response.data;
    const filteredLan = data.filter(
      (languageObj) => languageObj.language === lan
    );
    return filteredLan[0].code;
  } catch (error) {
    console.log(error);
  }
}


export const translateDoc = async (textToTranslate, inputLanguage, outputLanguage ) => {
    const fromLang = await getLanguageShort(inputLanguage);
    const toLang = await getLanguageShort(outputLanguage);
  
    const options = {
      method: "POST",
      headers: headers,
      data: new URLSearchParams({
        from: fromLang,
        to: toLang,
        text: textToTranslate,
      }),
    };
  
    try {
      const response = await axios.request(
        "https://google-translate113.p.rapidapi.com/api/v1/translator/text",
        options
      );
      return response.data.trans;
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  };
  
