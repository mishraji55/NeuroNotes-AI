import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, FileText, Layers, HelpCircle, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing" id="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content slide-up">
            <div className="hero-badge">
              <Sparkles size={14} />
              AI-Powered Learning Platform
            </div>
            <h1 className="hero-title">
              Transform PDFs into
              <span className="text-gradient"> Smart Study Materials</span>
            </h1>
            <p className="hero-subtitle">
              Upload any PDF and let AI generate concise summaries, interactive flashcards,
              and challenging quizzes — instantly accelerate your learning.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-cta-dashboard">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta-register">
                    Start Free
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg" id="hero-cta-login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Floating orbs */}
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features-section">
        <div className="container">
          <h2 className="section-title text-center">
            Everything you need to <span className="text-gradient">study smarter</span>
          </h2>
          <p className="section-subtitle text-center">
            Powered by advanced AI to transform any document into effective study tools.
          </p>

          <div className="features-grid stagger">
            <div className="feature-card glass-card">
              <div className="feature-icon" style={{ background: 'rgba(108, 43, 252, 0.15)' }}>
                <FileText size={24} color="var(--primary-400)" />
              </div>
              <h3 className="feature-title">AI Summaries</h3>
              <p className="feature-desc">
                Get concise or detailed summaries that capture every key point from your documents.
              </p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
                <Layers size={24} color="var(--accent-400)" />
              </div>
              <h3 className="feature-title">Smart Flashcards</h3>
              <p className="feature-desc">
                Auto-generated flashcards with key concepts on the front and explanations on the back.
              </p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                <HelpCircle size={24} color="var(--success)" />
              </div>
              <h3 className="feature-title">Quiz Generator</h3>
              <p className="feature-desc">
                Multiple-choice quizzes that test your understanding with instant scoring and feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works" id="how-it-works-section">
        <div className="container">
          <h2 className="section-title text-center">
            How it <span className="text-gradient">works</span>
          </h2>
          <div className="steps-grid stagger">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload PDF</h3>
              <p>Drag & drop or browse to upload any PDF document.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={20} />
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>AI Processes</h3>
              <p>Our AI reads and understands the content in seconds.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={20} />
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Study & Learn</h3>
              <p>Use summaries, flashcards, and quizzes to master the material.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-items stagger">
            <div className="trust-item">
              <Zap size={20} color="var(--primary-400)" />
              <span>Instant Generation</span>
            </div>
            <div className="trust-item">
              <Shield size={20} color="var(--success)" />
              <span>Secure & Private</span>
            </div>
            <div className="trust-item">
              <Brain size={20} color="var(--accent-400)" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 NeuroNotes AI. Built for learners.</p>
        </div>
      </footer>
    </div>
  );
}
