import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory, deleteDocument } from '../services/api';
import {
  Upload, FileText, Layers, HelpCircle, Clock, Trash2, Eye, Plus, Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getHistory();
      setDocuments(res.data.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its results?`)) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  // Stats
  const totalDocs = documents.length;
  const totalResults = documents.reduce((sum, d) => sum + (d.resultCount || 0), 0);
  const totalPages = documents.reduce((sum, d) => sum + (d.pageCount || 0), 0);

  return (
    <div className="page" id="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header fade-in">
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Here&apos;s your learning activity at a glance.</p>
          </div>
          <Link to="/upload" className="btn btn-primary" id="dashboard-upload-btn">
            <Plus size={18} />
            Upload PDF
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger">
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(108, 43, 252, 0.15)' }}>
              <FileText size={22} color="var(--primary-400)" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalDocs}</span>
              <span className="stat-label">Documents</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <Brain size={22} color="var(--accent-400)" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalResults}</span>
              <span className="stat-label">AI Results</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Layers size={22} color="var(--success)" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalPages}</span>
              <span className="stat-label">Pages Processed</span>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="section-header">
          <h2>Recent Documents</h2>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner spinner-lg" />
            <p className="loading-text">Loading your documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state glass-card fade-in">
            <Upload size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No documents yet</h3>
            <p className="empty-state-text">Upload your first PDF to start generating study materials.</p>
            <Link to="/upload" className="btn btn-primary" id="empty-upload-btn">
              <Upload size={16} />
              Upload Your First PDF
            </Link>
          </div>
        ) : (
          <div className="doc-list stagger">
            {documents.map((doc) => (
              <div key={doc._id} className="doc-card glass-card" id={`doc-${doc._id}`}>
                <div className="doc-icon-wrap">
                  <FileText size={24} color="var(--primary-400)" />
                </div>
                <div className="doc-info">
                  <h3 className="doc-name">{doc.originalName}</h3>
                  <div className="doc-meta">
                    <span>{doc.pageCount} pages</span>
                    <span>•</span>
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span><Clock size={12} /> {formatDate(doc.createdAt)}</span>
                  </div>
                  <div className="doc-badges">
                    {doc.resultTypes?.map((type) => (
                      <span key={type} className="badge badge-primary">{type.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
                <div className="doc-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/results/${doc._id}`)}
                    id={`view-${doc._id}`}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(doc._id, doc.originalName)}
                    id={`delete-${doc._id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
