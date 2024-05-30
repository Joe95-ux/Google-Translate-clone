dotenv.config();
import dotenv from "dotenv";
import axios from "axios";
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import htmlDocx from 'html-docx-js';

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
  if (language === "Detect language" || language === "" || language === null || language === "unknown") {
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

export const translateDoc = async (
  textToTranslate,
  inputLanguage,
  outputLanguage
) => {
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
  }
};



export async function generateTranslatedPdf(translatedText) {
  return new Promise((resolve, reject) => {
    // Create a writable stream using pdfkit
    const doc = new PDFDocument();
    
    // Create a writable stream to capture the PDF content
    const stream = doc.pipe(new PassThrough());

    // Write the translated text to the PDF document
    doc.text(translatedText);

    // End the document
    doc.end();

    // Resolve the promise with the readable stream
    resolve(stream);
  });
}


// Convert .docx to HTML
export async function convertDocxToHTML(docxFilePath) {
  try {
    const { value } = await mammoth.convertToHtml({ path: docxFilePath, includeDefaultStyleMap: true });
    return value;
  } catch (error) {
    throw new Error(`Error converting .docx to HTML: ${error.message}`);
  }
}

// Convert .pdf to HTML
export async function convertPdfToHTML(pdfFilePath) {
  try {
    const buffer = await fsPromises.readFile(pdfFilePath);
    const data = await pdf(buffer);
    // Convert extracted text to HTML. Here, we simply wrap text in <p> tags
    const htmlContent = data.text.split('\n').map(line => `<p>${line}</p>`).join('');
    return htmlContent;
  } catch (error) {
    throw new Error(`Error converting .pdf to HTML: ${error.message}`);
  }
}

// Convert .pptx to HTML
export async function convertPptxToHTML(pptxFilePath) {
  // Implementation using another library
}

// Convert .xlsx to HTML
export async function convertXlsxToHTML(xlsxFilePath) {
  // Implementation using xlsx-populate or other library
}



// Convert HTML to .docx

export async function convertHTMLToDocx(htmlContent) {
  try {
    const blob = htmlDocx.asBlob(htmlContent);
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Error converting HTML to .docx: ${error.message}`);
  }
}

// Convert HTML to .pdf
// export async function convertHTMLToPdf(htmlContent) {
//   try {
//     return new Promise((resolve, reject) => {
//       const buffers = [];
//       const doc = new PDFDocument();
      
//       // Collect PDF content into buffers array
//       doc.on('data', buffers.push.bind(buffers));
//       doc.on('end', () => {
//         const pdfData = Buffer.concat(buffers);
//         resolve(pdfData);
//       });

//       // Write HTML content to PDF document
//       doc.text(htmlContent);

//       // End the document
//       doc.end();
//     });
//   } catch (error) {
//     throw new Error(`Error converting HTML to .pdf: ${error.message}`);
//   }
// }


// Convert HTML to .pptx

export async function convertHTMLToPdf(htmlContent) {
  try {
    return new Promise((resolve, reject) => {
      const buffers = [];
      const doc = new PDFDocument();
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.text(htmlContent);
      doc.end();
    });
  } catch (error) {
    throw new Error(`Error converting HTML to .pdf: ${error.message}`);
  }
}
export async function convertHTMLToPptx(htmlContent) {
  // Implementation using pptxgenjs or other library
}

// Convert HTML to .xlsx
export async function convertHTMLToXlsx(htmlContent) {
  // Implementation using another library
}
