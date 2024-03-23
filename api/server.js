const PORT = 4000
const axios = require('axios').default
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()

app.use(cors());

app.use(express.json());

app.get('/languages', async (req, res) => {
  const options = {
    method: 'GET',
    url:'https://google-translate113.p.rapidapi.com/api/v1/translator/support-languages',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': process.env.RAPID_API_HOST,
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
  }

  try {
    const response = await axios.request(options);
    const arrayOfData = Object.keys(response.data.data).map(
      (key) => response.data.data[key]
    )
    res.status(200).json(arrayOfData)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

app.get('/translation', async (req, res) => {
  const { textToTranslate, outputLanguage, inputLanguage } = req.query

  const options = {
    method: 'GET',
    params: {
      text: textToTranslate,
      tl: outputLanguage,
      sl: inputLanguage,
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': process.env.RAPID_API_HOST,
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
  }

  try {
    const response = await axios(
      'https://google-translate113.p.rapidapi.com/api/v1/translator/text',
      options
    )
    res.status(200).json(response.data.data.translation)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

app.listen(PORT, () => console.log('Server running on port ' + PORT))