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
import puppeteer from "puppeteer";
import { promisify } from "util";
import { JSDOM } from "jsdom";
import createDOMPurify from 'dompurify';
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
import { Document, Packer, Paragraph, TabStopPosition, TextRun } from "docx";
import ConvertAPI from "convertapi";
const convertapi = new ConvertAPI(process.env.CONVERT_API_SECRET, {
  conversionTimeout: 60,
});

const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

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

// generate pdf from text (this is not in use)
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

// generate word doc from text (this is not in use)

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

// start of page processing functions
// Function to process each page individually
const processPage = async (pageContent, fromLanguage, toLanguage, type) => {
  const dom = new JSDOM(pageContent);
  const document = dom.window.document;

  const styleTags = document.querySelectorAll("style");
  if (type === "doc") {
    if (styleTags.length) {
      for (const styleTag of styleTags) {
        const nextDiv = styleTag.nextElementSibling;
        if (nextDiv && nextDiv.tagName === "DIV") {
          const divContent = nextDiv.outerHTML;

          // Remove specific spans in div content
          const cleanedContent = removeSpecificSpans(divContent);

          // Sanitize the cleaned content
          const sanitizedContent = DOMPurify.sanitize(cleanedContent);

          // Translate the div content
          const translatedContent = await translateDoc(
            sanitizedContent,
            fromLanguage,
            toLanguage
          );

          const newDiv = document.createElement("div");
          newDiv.innerHTML = translatedContent;

          nextDiv.replaceWith(newDiv);
        }
      }

      return dom.serialize();
    } else {
      const cleanedContent = removeSpecificSpans(pageContent);

      // Sanitize the cleaned content
      const sanitizedContent = DOMPurify.sanitize(cleanedContent);

      const translatedContent = await translateDoc(
        sanitizedContent,
        fromLanguage,
        toLanguage
      );
      return translatedContent;
    }

  } else if (type === "pdf") {
    const pageContainer = document.getElementById('page-container');
    if (!pageContainer) {
      throw new Error('No div with id="page-container" found in the HTML.');
    }
    
    const contentToTranslate = pageContainer.innerHTML;

    // Remove specific spans in content
    const cleanedContent = removeSpecificSpans(contentToTranslate);

    // Sanitize the cleaned content
    const sanitizedContent = DOMPurify.sanitize(cleanedContent);

    // Translate the extracted content
    const translatedContent = await translateDoc(
      sanitizedContent,
      fromLanguage,
      toLanguage
    );

    // Append the translated content back to the original HTML
    pageContainer.innerHTML = translatedContent;
    return dom.serialize();
  }

  return dom.serialize();
};


// Helper function to remove spans with specific classes
const removeSpecificSpans = (content) => {
  const dom = new JSDOM(content);
  const document = dom.window.document;

  // Remove spans with class ._._2 and ._._1
  const spansToRemove = document.querySelectorAll('span._._2');
  spansToRemove.forEach(span => span.remove());

  // Replace spans with class ._._0 with a single space
  const spansToReplace = document.querySelectorAll('span._._0');
  spansToReplace.forEach(span => {
    const space = document.createTextNode(' ');
    span.replaceWith(space);
  });

  return document.body.innerHTML;
};


// Function to process the entire HTML document
const processHTML = async (htmlFilePath, fromLanguage, toLanguage, type) => {
  try {
    // Read the HTML file
    const htmlContent = await fs.promises.readFile(htmlFilePath, "utf8");

    // Process each page individually
    const processedPages = await processPage(
      htmlContent,
      fromLanguage,
      toLanguage,
      type
    );

    // Write the updated HTML content back to the file or return it
    await fs.promises.writeFile(htmlFilePath, processedPages, "utf8");

    return processedPages;
  } catch (error) {
    console.error("Error processing HTML:", error);
    throw error;
  }
};

// end of page processing functions

// this is not in use

export const convertDocxToHtmlz = async (
  filePath,
  fromLanguage,
  toLanguage
) => {
  try {
    const options = {
      convertUnderline: mammoth.underline.element("em"),
      includeDefaultStyleMap: true,
    };
    const { value } = await mammoth.convertToHtml({ path: filePath }, options);
    const html = await processPage(value, fromLanguage, toLanguage);

    return html;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw error;
  }
};

// Convert .docx to HTML

export const convertDocxToHtml = async (
  pdfFilePath,
  fromLanguage,
  toLanguage
) => {
  const htmlDir = path.dirname(pdfFilePath);
  const baseName = path.basename(pdfFilePath, ".docx");
  const type = "docx";
  try {
    const result = await convertapi.convert(
      "html",
      { File: pdfFilePath },
      "doc"
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
    const updatedHtmlContent = await processHTML(
      htmlFilePath,
      fromLanguage,
      toLanguage,
      type
    );

    return docs;
  } catch (error) {
    console.log("Error", error);
  }
};

// Generate word document from html - use this

export const generateWordDocument = async (docFilePath) => {
  try {
    const result = await convertapi.convert(
      "docx",
      { File: docFilePath[0] },
      "html"
    );
    const fileUrl = result.files[0].url;
    console.log("Files saved: " + fileUrl);

    // Download the file from the fileUrl
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const docxBuffer = Buffer.from(response.data);

    // Create a readable stream from the downloaded buffer
    const stream = new PassThrough();
    stream.end(docxBuffer);

    return stream;
  } catch (error) {
    console.log("Error", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};

// Convert .pdf to HTML -- defunc
export const convertPdfToHTMLs = async (
  pdfFilePath,
  fromLanguage,
  toLanguage
) => {
  const htmlDir = path.dirname(pdfFilePath);
  const baseName = path.basename(pdfFilePath, ".pdf");
  const type = "pdf";
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
    const updatedHtmlContent = await processHTML(
      htmlFilePath,
      fromLanguage,
      toLanguage,
      type
    );

    return docs;
  } catch (error) {
    console.log("Error", error);
  }
};

// Convert PDF to Html (use this code)
export const convertPdfToHTML = async (pdfFilePath, fromLanguage, toLanguage) => {
  return new Promise((resolve, reject) => {
    const htmlDir = path.dirname(pdfFilePath);
    const baseName = path.basename(pdfFilePath, ".pdf");
    const outputFilePath = path.join(htmlDir, `${baseName}.html`);
    const type = "pdf";

    exec(`pdf2htmlEX --zoom 1.5 --split-pages 0 --heps 5 --space-threshold 0.5 --dest-dir ${htmlDir} ${pdfFilePath}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting PDF to HTML: ${stderr}`);
        return reject(error);
      }

      try {
        const htmlFilePath = outputFilePath;
        const updatedHtmlContent = await processHTML(
          htmlFilePath,
          fromLanguage,
          toLanguage,
          type
        );

        // const dom = new JSDOM(updatedHtmlContent);
        // const { document } = dom.window;

        // const imgElements = document.querySelectorAll("img");
        // for (const imgElement of imgElements) {
        //   const src = imgElement.getAttribute("src");
        //   if (src) {
        //     const imagePath = path.resolve(htmlDir, src);
        //     try {
        //       const imageData = await fs.promises.readFile(imagePath, {
        //         encoding: "base64",
        //       });
        //       imgElement.setAttribute(
        //         "src",
        //         `data:image/png;base64,${imageData}`
        //       );
        //     } catch (error) {
        //       console.error("Error reading image file:", error.message);
        //     }
        //   }
        // }

        // const finalHtmlContent = dom.serialize();
        await fs.promises.writeFile(htmlFilePath, updatedHtmlContent, "utf8");

        resolve(updatedHtmlContent);
      } catch (err) {
        console.error("Error reading directory or HTML file:", err);
        reject(err);
      }
    });
  });
};

// Convert .pptx to HTML
export async function convertPptxToHTML(pptxFilePath) {
  // Implementation using another library
}

// Convert .xlsx to HTML
export async function convertXlsxToHTML(xlsxFilePath) {
  // Implementation using xlsx-populate or other library
}

// Convert HTML to .docx -- defunc

export async function convertHTMLToDocx(htmlContent) {
  try {
    const blob = htmlDocx.asBlob(htmlContent);
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Error converting HTML to .docx: ${error.message}`);
  }
}

// Convert HTML to .pdf -- defunc
export const convertHTMLToPdfz = async (htmlContent) => {
  try {
    const file = { content: htmlContent };
    const options = {
      format: "A4",
      margin: { top: "5mm", right: "5mm", bottom: "5mm", left: "0mm" },
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

// convert html to pdf -- defunc

export const convertHTMLToPdfs = async (docFilePath) => {
  try {
    const result = await convertapi.convert(
      "pdf",
      { File: docFilePath[0] },
      "html"
    );
    const fileUrl = result.files[0].url;
    console.log("Files saved: " + fileUrl);

    // Download the file from the fileUrl
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const docxBuffer = Buffer.from(response.data);

    // Create a readable stream from the downloaded buffer
    const stream = new PassThrough();
    stream.end(docxBuffer);

    return stream;
  } catch (error) {
    console.log("Error", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};

//convert html to pdf -- in use
export const convertHTMLToPdf = async (htmlContent) => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();

    // Set the HTML content and global style to the page
    await page.setContent(htmlContent, { waitUntil: "load" });

    // Generate the PDF from the page content
    const pdfBuffer = await page.pdf({
      format: "A4",
      preferCSSPageSize: false,
      scale: 1,
    });

    // Close the browser
    await browser.close();

    // Convert PDF buffer to stream
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
