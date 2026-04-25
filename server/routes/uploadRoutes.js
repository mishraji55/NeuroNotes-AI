const express = require('express');
const { uploadPdf } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload a PDF file (protected + multer middleware)
router.post('/', protect, upload.single('pdf'), uploadPdf);

module.exports = router;
