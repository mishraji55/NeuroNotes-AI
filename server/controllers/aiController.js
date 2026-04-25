const Document = require('../models/Document');
const Result = require('../models/Result');
const { generateSummary, generateFlashcards, generateQuiz } = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Helper: find a document and verify ownership.
 */
const findUserDocument = async (documentId, userId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.userId.toString() !== userId.toString()) {
    const error = new Error('Not authorized to access this document');
    error.statusCode = 403;
    throw error;
  }

  return document;
};

/**
 * @route   POST /api/ai/summarize
 * @desc    Generate a summary for an uploaded document
 * @access  Private
 * @body    { documentId: string, type: 'short' | 'detailed' }
 */
const summarize = asyncHandler(async (req, res) => {
  const { documentId, type = 'short' } = req.body;

  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required' });
  }

  if (!['short', 'detailed'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type must be "short" or "detailed"' });
  }

  const document = await findUserDocument(documentId, req.user._id);

  // Generate summary via AI
  const content = await generateSummary(document.extractedText, type);

  // Save result to database
  const result = await Result.create({
    documentId: document._id,
    userId: req.user._id,
    type: type === 'short' ? 'summary_short' : 'summary_detailed',
    content,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: result._id,
      type: result.type,
      content: result.content,
      createdAt: result.createdAt,
    },
  });
});

/**
 * @route   POST /api/ai/flashcards
 * @desc    Generate flashcards for an uploaded document
 * @access  Private
 * @body    { documentId: string }
 */
const flashcards = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required' });
  }

  const document = await findUserDocument(documentId, req.user._id);

  // Generate flashcards via AI
  const content = await generateFlashcards(document.extractedText);

  // Save result to database
  const result = await Result.create({
    documentId: document._id,
    userId: req.user._id,
    type: 'flashcards',
    content,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: result._id,
      type: result.type,
      content: result.content,
      createdAt: result.createdAt,
    },
  });
});

/**
 * @route   POST /api/ai/quiz
 * @desc    Generate quiz questions for an uploaded document
 * @access  Private
 * @body    { documentId: string }
 */
const quiz = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required' });
  }

  const document = await findUserDocument(documentId, req.user._id);

  // Generate quiz via AI
  const content = await generateQuiz(document.extractedText);

  // Save result to database
  const result = await Result.create({
    documentId: document._id,
    userId: req.user._id,
    type: 'quiz',
    content,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: result._id,
      type: result.type,
      content: result.content,
      createdAt: result.createdAt,
    },
  });
});

/**
 * @route   POST /api/ai/generate-all
 * @desc    Generate all content types (short summary, detailed summary, flashcards, quiz) in parallel
 * @access  Private
 * @body    { documentId: string }
 */
const generateAll = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required' });
  }

  const document = await findUserDocument(documentId, req.user._id);
  const text = document.extractedText;

  // Run all AI generations in parallel
  const [shortSummary, detailedSummary, flashcardsContent, quizContent] = await Promise.all([
    generateSummary(text, 'short'),
    generateSummary(text, 'detailed'),
    generateFlashcards(text),
    generateQuiz(text),
  ]);

  // Save all results to database in parallel
  const [shortResult, detailedResult, flashcardsResult, quizResult] = await Promise.all([
    Result.create({ documentId: document._id, userId: req.user._id, type: 'summary_short', content: shortSummary }),
    Result.create({ documentId: document._id, userId: req.user._id, type: 'summary_detailed', content: detailedSummary }),
    Result.create({ documentId: document._id, userId: req.user._id, type: 'flashcards', content: flashcardsContent }),
    Result.create({ documentId: document._id, userId: req.user._id, type: 'quiz', content: quizContent }),
  ]);

  res.status(201).json({
    success: true,
    data: {
      summary_short: { _id: shortResult._id, type: 'summary_short', content: shortSummary, createdAt: shortResult.createdAt },
      summary_detailed: { _id: detailedResult._id, type: 'summary_detailed', content: detailedSummary, createdAt: detailedResult.createdAt },
      flashcards: { _id: flashcardsResult._id, type: 'flashcards', content: flashcardsContent, createdAt: flashcardsResult.createdAt },
      quiz: { _id: quizResult._id, type: 'quiz', content: quizContent, createdAt: quizResult.createdAt },
    },
  });
});

module.exports = { summarize, flashcards, quiz, generateAll };
