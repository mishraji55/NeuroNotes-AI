const express = require('express');
const { summarize, flashcards, quiz, generateAll } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All AI routes are protected
router.post('/summarize', protect, summarize);
router.post('/flashcards', protect, flashcards);
router.post('/quiz', protect, quiz);
router.post('/generate-all', protect, generateAll);

module.exports = router;
