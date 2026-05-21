const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const tesseract = require('tesseract.js');

/**
 * Extracts raw text from an uploaded file based on its MIME type.
 * @param {Object} file The multer file object
 * @returns {Promise<String>} Extracted text
 */
const extractTextFromFile = async (file) => {
  const filePath = file.path;
  const mimeType = file.mimetype;
  let extractedText = '';

  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/jpg') {
      // OCR processing
      const { data: { text } } = await tesseract.recognize(filePath, 'eng');
      extractedText = text;
    } else if (mimeType === 'text/plain' || mimeType === 'text/csv') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (!extractedText || extractedText.trim() === '') {
      throw new Error("No readable text found in the document");
    }

    return extractedText.trim();
  } catch (err) {
    console.error("File processing error:", err.message);
    throw err;
  } finally {
    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

module.exports = { extractTextFromFile };
