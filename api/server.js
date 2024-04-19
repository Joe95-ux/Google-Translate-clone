const PORT = 4000;
const axios = require("axios").default;
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();
const app = express();

app.use(cors());

//openai config

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const headers = {
  "content-type": "application/x-www-form-urlencoded",
  "x-rapidapi-host": process.env.RAPID_API_HOST,
  "x-rapidapi-key": process.env.RAPID_API_KEY,
};

const lanOptions = {
  method: "GET",
  url: "https://google-translate113.p.rapidapi.com/api/v1/translator/support-languages",
  headers: headers,
};
async function getLanguageShort(language) {
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

app.get("/languages", async (req, res) => {
  try {
    const response = await axios.request(lanOptions);
    const arrayData = response.data.map((language) => {
      if (language.language === "Automatic") {
        return "Detect language";
      } else {
        return language.language;
      }
    });
    res.status(200).json(arrayData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

app.get("/translation", async (req, res) => {
  const { textToTranslate, outputLanguage, inputLanguage } = req.query;
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
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

// app.get('/detect-language', async (req, res) => {
//   const {textToTranslate} = req.query;
//   const encodedParams = new URLSearchParams();
//   encodedParams.set('text', textToTranslate);
//   const options = {
//     method: 'POST',
//     url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/detect-language',
//     headers:headers,
//     data: encodedParams
//   }

//   try {
//     const response = await axios.request(options);
//     res.status(200).json(response.data.source_lang);
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ message: err })
//   }
// })

// open ai requests

app.get("/detect-language", async (req, res) => {
  try {
    const { textToTranslate } = req.query;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Hello! I'm here to help you detect the language of a given text. Please provide the text you want me to analyze. I will only send the language as response and nothing more. ",
        },
        {
          role: "user",
          content: textToTranslate,
        },
      ],
    });
    res.status(200).json(response.choices[0].message.content);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/synthesize-speech", async (req, res) => {
  const { input } = req.body;
  const timestamp = Date.now();

  try {
    // Generate speech audio from the input text using OpenAI text-to-speech API
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input,
    });

    // Write the audio data to a temporary file
    const directory = path.resolve(__dirname, "public");

    // Delete all existing files in the directory
    await deleteFilesInDirectory(directory);

    // Modify the filename to include the timestamp
    const audioFilePath = path.resolve(directory, `speech_${timestamp}.mp3`);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(audioFilePath, buffer);

    // Send the URL of the generated audio file in the response
    res.json({ url: `http://localhost:4000/speech_${timestamp}.mp3` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to synthesize speech" });
  }
});

// Function to delete all files in a directory
async function deleteFilesInDirectory(directory) {
  const files = await fs.promises.readdir(directory);
  for (const file of files) {
    await fs.promises.unlink(path.resolve(directory, file));
    console.log(`File ${file} has been deleted.`);
  }
}

app.get("/speech_:timestamp.mp3", (req, res) => {
  const { timestamp } = req.params;
  const audioFilePath = path.resolve(__dirname, "public", `speech_${timestamp}.mp3`);
  
  // Send the file to the client
  res.sendFile(audioFilePath, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": 0
    }
  });
});



app.listen(PORT, () => console.log("Server running on port " + PORT));
