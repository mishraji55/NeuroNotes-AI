const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['summary_short', 'summary_detailed', 'flashcards', 'quiz'],
    },
    /**
     * Content shape varies by type:
     *
     * summary_short / summary_detailed:
     *   { text: "..." }
     *
     * flashcards:
     *   { cards: [{ front: "...", back: "..." }, ...] }
     *
     * quiz:
     *   { questions: [{ question: "...", options: ["A","B","C","D"], correctAnswer: 0 }, ...] }
     */
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups: "get all results for this document by this user"
resultSchema.index({ documentId: 1, userId: 1 });

module.exports = mongoose.model('Result', resultSchema);
