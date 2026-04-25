const Document = require('../models/Document');
const Result = require('../models/Result');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/history
 * @desc    Get all documents uploaded by the current user, with result counts
 * @access  Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user._id })
    .select('-extractedText') // Exclude full text for list view (performance)
    .sort({ createdAt: -1 }); // Newest first

  // Get result counts for each document
  const documentsWithCounts = await Promise.all(
    documents.map(async (doc) => {
      const resultCount = await Result.countDocuments({ documentId: doc._id });
      const resultTypes = await Result.distinct('type', { documentId: doc._id });
      return {
        _id: doc._id,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        pageCount: doc.pageCount,
        textLength: doc.textLength,
        createdAt: doc.createdAt,
        resultCount,
        resultTypes,
      };
    })
  );

  res.json({
    success: true,
    count: documentsWithCounts.length,
    data: documentsWithCounts,
  });
});

/**
 * @route   GET /api/history/:documentId
 * @desc    Get a specific document and all its AI-generated results
 * @access  Private
 */
const getDocumentResults = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  const document = await Document.findById(documentId);

  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  // Verify ownership
  if (document.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to access this document' });
  }

  // Get all results for this document
  const results = await Result.find({ documentId: document._id }).sort({ createdAt: -1 });

  // Group results by type
  const grouped = {
    summary_short: results.find((r) => r.type === 'summary_short') || null,
    summary_detailed: results.find((r) => r.type === 'summary_detailed') || null,
    flashcards: results.find((r) => r.type === 'flashcards') || null,
    quiz: results.find((r) => r.type === 'quiz') || null,
  };

  res.json({
    success: true,
    data: {
      document: {
        _id: document._id,
        originalName: document.originalName,
        fileSize: document.fileSize,
        pageCount: document.pageCount,
        textLength: document.textLength,
        textPreview: document.extractedText.substring(0, 500),
        createdAt: document.createdAt,
      },
      results: grouped,
    },
  });
});

/**
 * @route   DELETE /api/history/:documentId
 * @desc    Delete a document and all its results
 * @access  Private
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  const document = await Document.findById(documentId);

  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  if (document.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Delete all associated results first, then the document
  await Result.deleteMany({ documentId: document._id });
  await Document.findByIdAndDelete(documentId);

  res.json({ success: true, message: 'Document and all results deleted' });
});

module.exports = { getHistory, getDocumentResults, deleteDocument };
