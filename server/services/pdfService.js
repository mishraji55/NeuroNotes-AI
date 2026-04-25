const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract text content from a PDF file.
 *
 * @param {string} filePath - Absolute path to the PDF file.
 * @returns {Promise<{ text: string, pageCount: number, info: object }>}
 */
const extractText = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text.trim(),
      pageCount: data.numpages,
      info: data.info || {},
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Delete an uploaded file from disk.
 * Called after text extraction to free storage.
 *
 * @param {string} filePath - Absolute path to the file.
 */
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Warning: Could not delete file ${filePath}:`, error.message);
  }
};

module.exports = { extractText, cleanupFile };
