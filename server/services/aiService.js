const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get the configured generative model.
 */
const getModel = () => {
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Truncate text to fit within model context limits.
 * Gemini 1.5 Flash supports ~1M tokens, but we limit to keep costs/latency low.
 */
const truncateText = (text, maxChars = 30000) => {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n\n[Text truncated for processing...]';
};

/**
 * Generate a summary of the provided text.
 *
 * @param {string} text - The source text to summarize.
 * @param {'short'|'detailed'} type - Summary length.
 * @returns {Promise<{ text: string }>}
 */
const generateSummary = async (text, type = 'short') => {
  const model = getModel();
  const truncated = truncateText(text);

  const prompt =
    type === 'short'
      ? `You are an expert academic summarizer. Create a concise summary (3-5 sentences) of the following text. Focus on the key points and main ideas.

Return your response as valid JSON in this exact format:
{"text": "your summary here"}

Text to summarize:
${truncated}`
      : `You are an expert academic summarizer. Create a detailed, comprehensive summary of the following text. Include all major points, supporting details, and key takeaways. Organize it with clear paragraphs.

Return your response as valid JSON in this exact format:
{"text": "your detailed summary here"}

Text to summarize:
${truncated}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return parseJsonResponse(response);
};

/**
 * Generate flashcards from the provided text.
 *
 * @param {string} text - The source text.
 * @returns {Promise<{ cards: Array<{ front: string, back: string }> }>}
 */
const generateFlashcards = async (text) => {
  const model = getModel();
  const truncated = truncateText(text);

  const prompt = `You are an expert educator. Create 8-12 study flashcards from the following text. Each flashcard should have a clear question or concept on the front and a concise answer or explanation on the back.

Return your response as valid JSON in this exact format:
{"cards": [{"front": "question or concept", "back": "answer or explanation"}, ...]}

Important: Return ONLY valid JSON, no other text.

Text:
${truncated}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return parseJsonResponse(response);
};

/**
 * Generate multiple-choice quiz questions from the provided text.
 *
 * @param {string} text - The source text.
 * @returns {Promise<{ questions: Array<{ question: string, options: string[], correctAnswer: number }> }>}
 */
const generateQuiz = async (text) => {
  const model = getModel();
  const truncated = truncateText(text);

  const prompt = `You are an expert educator and test designer. Create 8-10 multiple-choice quiz questions from the following text. Each question should test understanding of key concepts.

Return your response as valid JSON in this exact format:
{"questions": [{"question": "your question here", "options": ["option A", "option B", "option C", "option D"], "correctAnswer": 0}, ...]}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the zero-based index of the correct option (0, 1, 2, or 3)
- Questions should vary in difficulty
- Return ONLY valid JSON, no other text

Text:
${truncated}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return parseJsonResponse(response);
};

/**
 * Parse JSON from the AI response, handling markdown code fences.
 *
 * @param {string} responseText - Raw AI response text.
 * @returns {object} Parsed JSON object.
 */
const parseJsonResponse = (responseText) => {
  try {
    // Strip markdown code fences if present (```json ... ```)
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('AI returned an invalid response format. Please try again.');
  }
};

module.exports = { generateSummary, generateFlashcards, generateQuiz };
