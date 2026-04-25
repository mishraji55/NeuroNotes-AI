const path = require('path');
const Document = require('../models/Document');
const { extractText, cleanupFile } = require('../services/pdfService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/upload
 * @desc    Upload a PDF file, extract text, save to database
 * @access  Private
 *
 * Flow:
 * 1. Multer saves file to disk (via middleware)
 * 2. pdf-parse extracts text content
 * 3. Document record saved to MongoDB
 * 4. Original file deleted from disk (we only store text)
 * 5. Return document metadata to client
 */
const uploadPdf = asyncHandler(async (req, res) => {
  // Multer middleware already ran — check if file was attached
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a PDF file',
    });
  }

  const filePath = req.file.path;

  try {
    // Extract text from PDF
    const { text, pageCount, info } = await extractText(filePath);

    if (!text || text.trim().length === 0) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message: 'Could not extract any text from this PDF. It may be a scanned/image-based document.',
      });
    }

    // Save document metadata + extracted text to MongoDB
    const document = await Document.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      pageCount,
      extractedText: text,
    });

    // Delete the uploaded file — we only need the extracted text
    cleanupFile(filePath);

    res.status(201).json({
      success: true,
      data: {
        _id: document._id,
        originalName: document.originalName,
        fileSize: document.fileSize,
        pageCount: document.pageCount,
        textLength: document.textLength,
        textPreview: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    // Clean up file on any error
    cleanupFile(filePath);
    throw error;
  }
});

module.exports = { uploadPdf };
