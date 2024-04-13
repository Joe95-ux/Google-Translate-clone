const PORT = 4000
const axios = require('axios').default
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()

app.use(cors());

app.use(express.json());

const lanOptions = {
  method: 'GET',
  url:'https://google-translate113.p.rapidapi.com/api/v1/translator/support-languages',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'x-rapidapi-host': process.env.RAPID_API_HOST,
    'x-rapidapi-key': process.env.RAPID_API_KEY,
  },
}
async function getLanguageShort(language){
  let lan;
  if(language === "Detect language"){
    lan = "Automatic";
  }else{
    lan = language;
  }
  try {
    const response = await axios.request(lanOptions)
    const data = response.data;
    const filteredLan = data.filter(languageObj=>languageObj.language === lan);
    return filteredLan[0].code;
    
  } catch (error) {
    console.log(error);
  }

}

app.get('/languages', async (req, res) => {
  try {
    const response = await axios.request(lanOptions);
    const arrayData = response.data.map((language)=>{
      if(language.language === "Automatic"){
        return "Detect language"
      }else{
        return language.language
      }
    });
    res.status(200).json(arrayData);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

app.get('/translation', async (req, res) => {
  const { textToTranslate, outputLanguage, inputLanguage } = req.query;
  const fromLang = await getLanguageShort(inputLanguage);
  const toLang = await getLanguageShort(outputLanguage);
  
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': process.env.RAPID_API_HOST,
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
    data: new URLSearchParams({
      from: fromLang,
      to: toLang,
      text: textToTranslate,

    })
  }

  try {
    const response = await axios.request(
      'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
      options
    )
    res.status(200).json(response.data)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

app.listen(PORT, () => console.log('Server running on port ' + PORT))