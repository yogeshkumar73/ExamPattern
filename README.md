# Smart Lab & ExamPattern Platform

A modern, full-stack educational and gamified battle platform built with Next.js, React, Tailwind CSS, MongoDB, and Python FastAPI microservices.

---

## 🚀 Features

- **🎮 Battle Arena**: Multiplayer real-time coding, trivia, math, and prediction challenges with dynamic scoring and live leaderboards.
- **🤖 Smart AI Interview Prep**: Interactive voice and text AI interview simulator powered by Google Gemini AI.
- **⚡ Infinite Question Generator**: Algorithmic non-repeating question loop supporting math, prediction, general knowledge, coding, and puzzle modes.
- **🏆 Live Leaderboard & Ranking System**: ELO-based user ranking system with tier progression (Bronze to Grandmaster), dynamic win/loss stats, and badges.
- **📊 Student Profile & Progress Tracker**: Full user achievements tracking, skill breakdown, and historical battle stats saved seamlessly to MongoDB.

---

## 🛠️ Tech Stack

- **Frontend & Web API**: Next.js 14/15 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, NextAuth.js
- **Database**: MongoDB (Mongoose for Next.js API routes, Motor async driver for Python microservices)
- **AI Integration**: Google Gemini 2.5 API (`@google/genai`), OpenRouter
- **Backend Microservices**:
  - **AI Service** (`server/ai-service`): Python FastAPI microservice (Port `8000`)
  - **Battle Service** (`server/battle-service`): Python FastAPI microservice (Port `8001`)

---

## 📁 Repository Architecture

```text
Local LLM/
├── app/                        # Next.js App Router (Pages, API Routes & Layouts)
│   ├── api/                    # Serverless API endpoints
│   │   ├── arena/              # Battle, Questions & Leaderboard APIs
│   │   ├── interview/          # Voice & Chat AI Interview APIs
│   │   └── profile/            # User Profile & Achievements API
│   ├── battle-arena/           # Battle UI pages
│   └── student-profile/        # Profile UI pages
├── components/                 # Reusable UI Components
│   ├── battle-arena/           # Arena leaderboard & game components
│   └── smart-lab/              # Interview prep & smart lab features
├── lib/                        # MongoDB client, AI services & helper utilities
├── models/                     # Mongoose Models (User, Battle, etc.)
├── server/                     # Python Microservices
│   ├── ai-service/             # FastAPI AI processing service (Port 8000)
│   └── battle-service/         # FastAPI Battle Engine & Question Generators (Port 8001)
├── start-services.bat          # One-click Windows startup script
├── .netlifyignore              # Deployment exclusion rules for Netlify
└── .env                        # Environment Configuration
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# AI Model & Keys
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_MODEL=gemini-2.5-flash

# Database Connection
MONGODB_URI=your_mongodb_connection_string

# Application URLs
APP_URL=http://localhost:3000
BATTLE_SERVICE_URL=http://localhost:8001
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,https://exampattern.netlify.app

# Auth & Admin
NEXTAUTH_SECRET=your_nextauth_secret
ADMIN_PASSWORD=your_admin_password
```

---

## ⚡ Quick Start (Local Development)

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Start Python Microservices (Windows)
Double-click `start-services.bat` or run:
```cmd
.\start-services.bat
```
*This automatically launches the AI Service on port `8000` and the Battle Service on port `8001`.*

Alternatively, start them manually:
```bash
# Terminal 1 - AI Service
cd server/ai-service
python -m uvicorn main:app --port 8000 --reload

# Terminal 2 - Battle Service
cd server/battle-service
python -m uvicorn main:app --port 8001 --reload
```

### 3. Run the Next.js Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (Netlify Guide)

When deploying the Next.js frontend to **Netlify**:

1. **Backend URLs**: Set `BATTLE_SERVICE_URL` and `AI_SERVICE_URL` in your Netlify environment variables pointing to your hosted microservice URLs (e.g. on Render, Railway, or via Ngrok).
2. **Secret Scanner Prevention**: The included `.netlifyignore` excludes backend python virtualenvs (`.venv`), `server/` packages, and `node_modules` from Netlify's build & secret scanner.
