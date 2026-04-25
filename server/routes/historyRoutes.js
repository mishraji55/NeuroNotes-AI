const express = require('express');
const { getHistory, getDocumentResults, deleteDocument } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All history routes are protected
router.get('/', protect, getHistory);
router.get('/:documentId', protect, getDocumentResults);
router.delete('/:documentId', protect, deleteDocument);

module.exports = router;
