import { getLanguageShort, headers } from "../util.js";
import axios from "axios"

export const translateText = async (req, res) => {
  const { text, outputLang, inputLang, } = req.query;
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
