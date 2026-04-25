import axios from 'axios';

/**
 * Axios instance configured with base URL and auth interceptor.
 * In development, Vite proxy handles /api → localhost:5000.
 * In production, same-origin requests go directly to the Express server.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('neuronotes_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('neuronotes_token');
      localStorage.removeItem('neuronotes_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ---------- Upload ----------
export const uploadPdf = (file, onProgress) => {
  const formData = new FormData();
  formData.append('pdf', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
      : undefined,
  });
};

// ---------- AI Generation ----------
export const generateSummary = (documentId, type = 'short') =>
  api.post('/ai/summarize', { documentId, type });

export const generateFlashcards = (documentId) =>
  api.post('/ai/flashcards', { documentId });

export const generateQuiz = (documentId) =>
  api.post('/ai/quiz', { documentId });

export const generateAll = (documentId) =>
  api.post('/ai/generate-all', { documentId });

// ---------- History ----------
export const getHistory = () => api.get('/history');
export const getDocumentResults = (documentId) => api.get(`/history/${documentId}`);
export const deleteDocument = (documentId) => api.delete(`/history/${documentId}`);

export default api;
