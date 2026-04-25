import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadPdf, generateAll } from '../services/api';
import {
  Upload, FileText, CheckCircle, Loader, Sparkles, ArrowRight, X, File
} from 'lucide-react';
import toast from 'react-hot-toast';
import './UploadPage.css';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [document, setDocument] = useState(null); // uploaded doc metadata
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        const err = rejected[0].errors[0];
        if (err.code === 'file-too-large') toast.error('File too large. Max 10MB.');
        else if (err.code === 'file-invalid-type') toast.error('Only PDF files allowed.');
        else toast.error(err.message);
        return;
      }
      if (accepted.length > 0) {
        setFile(accepted[0]);
        setDocument(null);
      }
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await uploadPdf(file, (progress) => setUploadProgress(progress));
      setDocument(res.data.data);
      toast.success('PDF uploaded and processed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!document) return;
    setGenerating(true);
    try {
      await generateAll(document._id);
      toast.success('All study materials generated!');
      navigate(`/results/${document._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setDocument(null);
    setUploadProgress(0);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="page" id="upload-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1 className="page-title">Upload PDF</h1>
          <p className="page-subtitle">Drop a PDF and let AI create study materials for you.</p>
        </div>

        <div className="upload-content">
          {/* Dropzone */}
          {!document && (
            <div className="upload-zone-wrapper fade-in">
              <div
                {...getRootProps()}
                className={`upload-zone glass-card ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                id="pdf-dropzone"
              >
                <input {...getInputProps()} id="pdf-file-input" />

                {!file ? (
                  <div className="dropzone-content">
                    <div className="dropzone-icon">
                      <Upload size={40} />
                    </div>
                    <h3>{isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}</h3>
                    <p>or click to browse · Max 10MB</p>
                  </div>
                ) : (
                  <div className="file-preview">
                    <div className="file-preview-icon">
                      <File size={32} color="var(--primary-400)" />
                    </div>
                    <div className="file-preview-info">
                      <span className="file-preview-name">{file.name}</span>
                      <span className="file-preview-size">{formatSize(file.size)}</span>
                    </div>
                    <button className="file-remove" onClick={(e) => { e.stopPropagation(); removeFile(); }} aria-label="Remove file">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {file && !uploading && (
                <button className="btn btn-primary btn-lg upload-btn" onClick={handleUpload} id="upload-submit">
                  <Upload size={18} />
                  Upload & Process
                </button>
              )}

              {uploading && (
                <div className="upload-progress fade-in">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="progress-text">
                    <Loader size={14} className="spinning" />
                    Uploading & extracting text... {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Post-upload success */}
          {document && (
            <div className="upload-success fade-in">
              <div className="success-card glass-card">
                <div className="success-header">
                  <CheckCircle size={40} color="var(--success)" />
                  <h2>PDF Processed Successfully!</h2>
                </div>

                <div className="success-details">
                  <div className="detail-row">
                    <FileText size={16} />
                    <span className="detail-label">File:</span>
                    <span className="detail-value">{document.originalName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Pages:</span>
                    <span className="detail-value">{document.pageCount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Text extracted:</span>
                    <span className="detail-value">{document.textLength?.toLocaleString()} characters</span>
                  </div>
                </div>

                {document.textPreview && (
                  <div className="text-preview">
                    <h4>Text Preview</h4>
                    <p>{document.textPreview}</p>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg generate-btn"
                  onClick={handleGenerate}
                  disabled={generating}
                  id="generate-all-btn"
                >
                  {generating ? (
                    <>
                      <span className="spinner" />
                      Generating with AI... This may take a moment
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate All Study Materials
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
