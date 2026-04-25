import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDocumentResults, generateSummary, generateFlashcards, generateQuiz } from '../services/api';
import {
  FileText, Layers, HelpCircle, ArrowLeft, ChevronLeft, ChevronRight,
  RotateCcw, Copy, CheckCircle, Sparkles, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ResultsPage.css';

export default function ResultsPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState(null);
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState('summary');
  const [generating, setGenerating] = useState({});

  // Flashcard state
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [documentId]);

  const fetchResults = async () => {
    try {
      const res = await getDocumentResults(documentId);
      setDocData(res.data.data.document);
      setResults(res.data.data.results);
    } catch (error) {
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    setGenerating((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === 'summary_short' || type === 'summary_detailed') {
        const summaryType = type === 'summary_short' ? 'short' : 'detailed';
        await generateSummary(documentId, summaryType);
      } else if (type === 'flashcards') {
        await generateFlashcards(documentId);
      } else if (type === 'quiz') {
        await generateQuiz(documentId);
      }
      toast.success('Generated successfully!');
      await fetchResults();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating((prev) => ({ ...prev, [type]: false }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Quiz scoring
  const quizQuestions = results.quiz?.content?.questions || [];
  const score = showResults
    ? quizQuestions.reduce((acc, q, i) => acc + (selectedAnswers[i] === q.correctAnswer ? 1 : 0), 0)
    : 0;

  const flashcards = results.flashcards?.content?.cards || [];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p className="loading-text">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="page" id="results-page">
      <div className="container">
        {/* Header */}
        <div className="results-header fade-in">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} id="back-to-dashboard">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="results-doc-info">
            <FileText size={20} color="var(--primary-400)" />
            <div>
              <h1 className="results-doc-name">{docData?.originalName}</h1>
              <span className="results-doc-meta">{docData?.pageCount} pages · {docData?.textLength?.toLocaleString()} chars</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs fade-in" id="result-tabs">
          <button
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
            id="tab-summary"
          >
            <FileText size={16} /> Summary
          </button>
          <button
            className={`tab ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => { setActiveTab('flashcards'); setFlipped(false); setCurrentCard(0); }}
            id="tab-flashcards"
          >
            <Layers size={16} /> Flashcards
          </button>
          <button
            className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quiz'); setCurrentQuestion(0); setSelectedAnswers({}); setShowResults(false); }}
            id="tab-quiz"
          >
            <HelpCircle size={16} /> Quiz
          </button>
        </div>

        {/* Tab content */}
        <div className="tab-content fade-in">
          {/* ===== SUMMARY TAB ===== */}
          {activeTab === 'summary' && (
            <div className="summary-tab">
              {/* Short summary */}
              <div className="summary-section glass-card">
                <div className="summary-section-header">
                  <h3>Short Summary</h3>
                  {results.summary_short && (
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(results.summary_short.content.text)}>
                      <Copy size={14} /> Copy
                    </button>
                  )}
                </div>
                {results.summary_short ? (
                  <p className="summary-text">{results.summary_short.content.text}</p>
                ) : (
                  <div className="generate-prompt">
                    <p>No short summary yet.</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleGenerate('summary_short')}
                      disabled={generating.summary_short}
                      id="gen-short-summary"
                    >
                      {generating.summary_short ? <><span className="spinner" /> Generating...</> : <><Sparkles size={14} /> Generate</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Detailed summary */}
              <div className="summary-section glass-card">
                <div className="summary-section-header">
                  <h3>Detailed Summary</h3>
                  {results.summary_detailed && (
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(results.summary_detailed.content.text)}>
                      <Copy size={14} /> Copy
                    </button>
                  )}
                </div>
                {results.summary_detailed ? (
                  <p className="summary-text">{results.summary_detailed.content.text}</p>
                ) : (
                  <div className="generate-prompt">
                    <p>No detailed summary yet.</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleGenerate('summary_detailed')}
                      disabled={generating.summary_detailed}
                      id="gen-detailed-summary"
                    >
                      {generating.summary_detailed ? <><span className="spinner" /> Generating...</> : <><Sparkles size={14} /> Generate</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== FLASHCARDS TAB ===== */}
          {activeTab === 'flashcards' && (
            <div className="flashcards-tab">
              {flashcards.length > 0 ? (
                <>
                  <div className="flashcard-counter">
                    Card {currentCard + 1} of {flashcards.length}
                  </div>
                  <div className="flashcard-container" onClick={() => setFlipped(!flipped)}>
                    <div className={`flashcard ${flipped ? 'flipped' : ''}`} id="flashcard-active">
                      <div className="flashcard-face flashcard-front">
                        <span className="flashcard-label">Question</span>
                        <p>{flashcards[currentCard]?.front}</p>
                        <span className="flashcard-hint">Click to flip</span>
                      </div>
                      <div className="flashcard-face flashcard-back">
                        <span className="flashcard-label">Answer</span>
                        <p>{flashcards[currentCard]?.back}</p>
                        <span className="flashcard-hint">Click to flip</span>
                      </div>
                    </div>
                  </div>
                  <div className="flashcard-nav">
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setCurrentCard((p) => Math.max(0, p - 1)); setFlipped(false); }}
                      disabled={currentCard === 0}
                      id="prev-card"
                    >
                      <ChevronLeft size={18} /> Previous
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setCurrentCard((p) => Math.min(flashcards.length - 1, p + 1)); setFlipped(false); }}
                      disabled={currentCard === flashcards.length - 1}
                      id="next-card"
                    >
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="generate-prompt glass-card">
                  <Layers size={40} className="empty-state-icon" />
                  <p>No flashcards generated yet.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerate('flashcards')}
                    disabled={generating.flashcards}
                    id="gen-flashcards"
                  >
                    {generating.flashcards ? <><span className="spinner" /> Generating...</> : <><Sparkles size={16} /> Generate Flashcards</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== QUIZ TAB ===== */}
          {activeTab === 'quiz' && (
            <div className="quiz-tab">
              {quizQuestions.length > 0 ? (
                showResults ? (
                  /* Score screen */
                  <div className="quiz-results glass-card fade-in">
                    <div className="quiz-score-header">
                      <CheckCircle size={48} color="var(--success)" />
                      <h2>Quiz Complete!</h2>
                      <div className="quiz-score">
                        <span className="score-number">{score}</span>
                        <span className="score-divider">/</span>
                        <span className="score-total">{quizQuestions.length}</span>
                      </div>
                      <p className="score-percent">{Math.round((score / quizQuestions.length) * 100)}% correct</p>
                    </div>

                    <div className="quiz-review">
                      {quizQuestions.map((q, i) => (
                        <div key={i} className={`review-item ${selectedAnswers[i] === q.correctAnswer ? 'correct' : 'incorrect'}`}>
                          <p className="review-question">{i + 1}. {q.question}</p>
                          <div className="review-options">
                            {q.options.map((opt, j) => (
                              <span
                                key={j}
                                className={`review-option ${j === q.correctAnswer ? 'is-correct' : ''} ${j === selectedAnswers[i] && j !== q.correctAnswer ? 'is-wrong' : ''}`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-primary" onClick={() => { setShowResults(false); setSelectedAnswers({}); setCurrentQuestion(0); }} id="retry-quiz">
                      <RotateCcw size={16} /> Try Again
                    </button>
                  </div>
                ) : (
                  /* Question screen */
                  <div className="quiz-question-card glass-card fade-in">
                    <div className="quiz-progress">
                      <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }} />
                      </div>
                    </div>

                    <h3 className="quiz-question-text">{quizQuestions[currentQuestion]?.question}</h3>

                    <div className="quiz-options">
                      {quizQuestions[currentQuestion]?.options.map((opt, i) => (
                        <button
                          key={i}
                          className={`quiz-option ${selectedAnswers[currentQuestion] === i ? 'selected' : ''}`}
                          onClick={() => setSelectedAnswers((p) => ({ ...p, [currentQuestion]: i }))}
                          id={`option-${i}`}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                          <span className="option-text">{opt}</span>
                        </button>
                      ))}
                    </div>

                    <div className="quiz-nav">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentQuestion((p) => p - 1)}
                        disabled={currentQuestion === 0}
                        id="prev-question"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      {currentQuestion < quizQuestions.length - 1 ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => setCurrentQuestion((p) => p + 1)}
                          disabled={selectedAnswers[currentQuestion] === undefined}
                          id="next-question"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => setShowResults(true)}
                          disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                          id="submit-quiz"
                        >
                          Submit Quiz <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="generate-prompt glass-card">
                  <HelpCircle size={40} className="empty-state-icon" />
                  <p>No quiz generated yet.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerate('quiz')}
                    disabled={generating.quiz}
                    id="gen-quiz"
                  >
                    {generating.quiz ? <><span className="spinner" /> Generating...</> : <><Sparkles size={16} /> Generate Quiz</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
