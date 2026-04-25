const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      required: true,
    },
    textLength: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: auto-compute text length for analytics.
 */
documentSchema.pre('save', function (next) {
  if (this.extractedText) {
    this.textLength = this.extractedText.length;
  }
  next();
});

/**
 * Virtual: get all results associated with this document.
 */
documentSchema.virtual('results', {
  ref: 'Result',
  localField: '_id',
  foreignField: 'documentId',
});

// Ensure virtuals are included in JSON/Object output
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);
