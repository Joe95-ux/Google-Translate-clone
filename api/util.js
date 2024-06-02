dotenv.config();
import dotenv from "dotenv";
import axios from "axios";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import htmlDocx from "html-docx-js";
import htmlToDocx from "html-to-docx";
import { exec } from "child_process";
import html_to_pdf from "html-pdf-node";
import { promisify } from "util";
import {JSDOM} from "jsdom";
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
import { Document, Packer, Paragraph, TabStopPosition, TextRun } from "docx";
import ConvertAPI from "convertapi";
const convertapi = new ConvertAPI(process.env.CONVERT_API_SECRET, {
  conversionTimeout: 60,
});

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
  if (
    language === "Detect language" ||
    language === "" ||
    language === null ||
    language === "unknown"
  ) {
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
      html: textToTranslate,
    }),
  };

  try {
    const response = await axios.request(
      "https://google-translate113.p.rapidapi.com/api/v1/translator/html",
      options
    );
    return response.data.trans;
  } catch (err) {
    console.log(err);
  }
};

// generate pdf from text
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

// generate word doc from text

export const generateWordDocuments = async (text) => {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(text)],
            }),
          ],
        },
      ],
    });

    const stream = new PassThrough();
    Packer.toStream(doc).pipe(stream);
    return stream;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};

export const generateWordDocument = async (htmlContent) => {
  try {
    const docxBuffer = await htmlToDocx(htmlContent);

    const stream = new PassThrough();
    stream.end(docxBuffer);

    return stream;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};

// Convert .docx to HTML
export async function convertDocxToHTML(docxFilePath) {
  try {
    const { value } = await mammoth.convertToHtml({
      path: docxFilePath,
      includeDefaultStyleMap: true,
    });
    return value;
  } catch (error) {
    throw new Error(`Error converting .docx to HTML: ${error.message}`);
  }
}

// Convert .pdf to HTML
export const convertPdfToHTMLs = async (pdfFilePath) => {
  return new Promise((resolve, reject) => {
    const htmlDir = path.dirname(pdfFilePath);
    const baseName = path.basename(pdfFilePath, ".pdf");

    exec(`pdftohtml -s -c ${pdfFilePath}`, async (error, stdout, stderr) => {
      if (error) {
        console.error("Error converting PDF to HTML:", stderr);
        return reject(error);
      }

      try {
        const files = await fs.promises.readdir(htmlDir);
        const htmlFile = files.find(
          (file) => file.startsWith(baseName) && file.endsWith(".html")
        );

        if (!htmlFile) {
          throw new Error("Converted HTML file not found");
        }

        const htmlFilePath = path.join(htmlDir, htmlFile);
        let htmlContent = await fs.promises.readFile(htmlFilePath, "utf8");

        // Update image source paths to use relative paths
        const updatedHtmlContent = htmlContent.replace(
          /src="(.*?)"/g,
          (match, p1) => {
            const imageName = path.basename(p1);
            return `src="./${imageName}"`;
          }
        );

        // Write the updated HTML content back to the HTML file
        await fs.promises.writeFile(htmlFilePath, updatedHtmlContent, "utf8");

        resolve(updatedHtmlContent);
      } catch (err) {
        console.error("Error reading directory or HTML file:", err);
        reject(err);
      }
    });
  });
};

export const convertPdfToHTML = async (pdfFilePath) => {
  const htmlDir = path.dirname(pdfFilePath);
  const baseName = path.basename(pdfFilePath, ".pdf");
  try {
    const result = await convertapi.convert(
      "html",
      { File: pdfFilePath },
      "pdf"
    );
    const docs = await result.saveFiles(htmlDir);
    console.log("Files saved: " + docs);
    const files = await fs.promises.readdir(htmlDir);
    const htmlFile = files.find(
      (file) => file.startsWith(baseName) && file.endsWith(".html")
    );

    if (!htmlFile) {
      throw new Error("Converted HTML file not found");
    }
    const htmlFilePath = path.join(htmlDir, htmlFile);
    let htmlContent = await fs.promises.readFile(htmlFilePath, "utf8");

    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;

    // Extract the content inside the body tag
    const bodyContent = document.body.innerHTML;

    return {document, bodyContent, type:"pdf"};
  } catch (error) {
    console.log("Error", error);
  }
};


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
export const convertHTMLToPdf = async (htmlContent) => {
  try {
    const file = { content: htmlContent };
    const options = {
      format: "A4",
      path: "output.pdf",
    };
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    const stream = new PassThrough();
    stream.end(pdfBuffer);

    return stream;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Convert HTML to .pptx

// export async function convertHTMLToPdf(htmlContent) {
//   try {
//     return new Promise((resolve, reject) => {
//       const buffers = [];
//       const doc = new PDFDocument();

//       doc.on('data', buffers.push.bind(buffers));
//       doc.on('end', () => {
//         const pdfData = Buffer.concat(buffers);
//         resolve(pdfData);
//       });

//       doc.text(htmlContent);
//       doc.end();
//     });
//   } catch (error) {
//     throw new Error(`Error converting HTML to .pdf: ${error.message}`);
//   }
// }
export async function convertHTMLToPptx(htmlContent) {
  // Implementation using pptxgenjs or other library
}

// Convert HTML to .xlsx
export async function convertHTMLToXlsx(htmlContent) {
  // Implementation using another library
}
