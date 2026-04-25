# NeuroNotes AI

AI-powered PDF study tool — upload PDFs and auto-generate summaries, flashcards, and quizzes.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **AI:** Google Gemini API (gemini-1.5-flash)
- **Auth:** JWT

## Setup

### 1. Clone & Install

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Development Servers

```bash
# Backend (from server/)
npm run dev

# Frontend (from client/)
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Create account |
| POST | `/api/auth/login` | ✗ | Login |
| POST | `/api/upload` | ✓ | Upload PDF |
| POST | `/api/ai/summarize` | ✓ | Generate summary |
| POST | `/api/ai/flashcards` | ✓ | Generate flashcards |
| POST | `/api/ai/quiz` | ✓ | Generate quiz |
| POST | `/api/ai/generate-all` | ✓ | Generate all |
| GET | `/api/history` | ✓ | List documents |
| GET | `/api/history/:id` | ✓ | Document details |
