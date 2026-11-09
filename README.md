# Aura Study AI — Exam Pattern Analyzer & Multiplayer Learning Combat

A modern, production-ready academic intelligence and gamified learning platform built with **Next.js**, **React**, **Tailwind CSS**, **MongoDB**, and **Python FastAPI** microservices powered by **Pandas**, **NumPy**, **PyMuPDF**, and **scikit-learn**.

---

## 🚀 Key Modules & Capabilities

### 1. 📖 Exam Pattern Analyzer (Full Blueprint Implementation)
- **Syllabus & Multi-Paper Extraction**:
  - Upload official syllabus documents (PDF, TXT, images) to automatically segment course units, modules, and normalized topic hierarchies.
  - Upload multiple historical exam papers tagged by academic year (e.g., 2021 to 2025).
  - High-fidelity PDF structure extraction via **PyMuPDF (`fitz`)** with automatic fallback to `pypdf`.
- **Intelligent Topic Mapping**:
  - Uses **`scikit-learn` TF-IDF + Cosine Similarity** to match extracted historical questions to syllabus topics.
  - Assigns confidence ratings with automatic `needsHumanReview` flags for uncertain mappings (< 0.65).
- **Multivariable Statistical Scoring (Pandas + NumPy)**:
  - Generates topic-wise feature tables analyzing:
    - **Appearance Rate**: $\text{Papers Appeared} / \text{Total Papers}$
    - **Total Marks & Marks Share**: Topic percentage of total exam marks
    - **Recency Decay**: Exponential weighting favoring recent examination cycles
    - **Trend Trajectory**: First-degree polynomial linear regression slope ($\text{np.polyfit}$) across years
    - **Semantic Similarity Clusters**: Recurring question theme detection
    - **Syllabus Coverage**: Breadth relative to core unit scope
  - **Configurable Weighted Priority Formula**:
    $$\text{Priority Score} = 0.30 \cdot S_{\text{appearance}} + 0.20 \cdot S_{\text{recency}} + 0.20 \cdot S_{\text{marks}} + 0.15 \cdot S_{\text{trend}} + 0.15 \cdot S_{\text{coverage}}$$
  - **Transparent Evidence**: Every topic score presents an auditable evidence checklist (e.g., *"Appeared in 3 of 3 papers (100% frequency)"*, *"Carries 15 marks total (50% share)"*).
- **Predicted Practice Question Suite**:
  - **Objective Suite (MCQ)**: 4 distinct options, highlighted correct answer, conceptual explanation, difficulty rating, and disclaimer.
  - **Subjective Suite (Theory)**: Detailed academic model answers, scoring rubric criteria checklist, verified reference sources, verification status, and disclaimer.
  - **Mandatory Disclaimer**: All practice sets carry clear academic disclaimers (*"Estimated practice question; not a guaranteed exam question"*).

---

### 2. 📚 Community Repository & Examination Archive
- **Multi-Category Archive**: Access curated previous year exam papers across **CBSE**, **GATE**, **UPSC**, **University**, and **Standard** curriculum streams.
- **Student & Contributor Upload**: Students and teachers can contribute papers with title, subject, academic year, and PDF document upload.
- **Admin Moderation & One-Click Approvals**:
  - Student uploads enter a moderation queue marked `Pending Review`.
  - Admins can toggle the **Admin Review** filter to review and **Approve** (publish to community) or **Reject** submissions.
  - Admin uploads are published instantly to the repository.
- **Unrestricted 1-Click Downloads**: Any student can download approved examination papers immediately without stream blocking or mandatory review gates.
- **Detailed Examination Preview / Review**: Interactive modal presenting paper metadata, syllabus breakdown (Part A 30%, Part B 40%, Part C 30%), topics covered, and direct download links.

---

### 3. ⚔️ Battle Arena, Dynamic Ranks (1–10) & 2-Minute Live Updates
- **Top 1 to 10 Descending Leaderboard**:
  - Strictly presents players in descending order of points.
  - **Podium Display (Top 3)**: #1 Gold (center), #2 Silver (left), #3 Bronze (right).
  - **Rankings Table (Ranks #4 to #10)**: Displays rank, avatar, tier badge, W/L record, win percentage, XP, and points.
- **2-Minute Dynamic Auto-Refresh**:
  - Integrated 120-second countdown timer (`Live • In 1m 45s`) that automatically re-queries and updates leaderboard scores dynamically.
  - Dynamic live score shifts simulate real-time battle results with smooth CSS transition animations.
  - **Update Now Button**: Allows users and testers to instantly trigger live updates on demand.
- **530+ Static Question Bank**:
  - Over 530 questions across Coding, Puzzle, Math, GK, Prediction, Mixed Mode, and Topic & Doc AI.
  - Scaled attempt limits (15 to 40 questions) and difficulty-tuned countdown timers (90s down to 25s).

---

### 4. 💬 Real-Time Multicast Global Chat (24-Hour TTL)
- **End-to-End Multicasting**: High-performance real-time chat with fast incremental sync and active student roster.
- **Mobile-Responsive UI**: Clean responsive chatroom with drawer toggle for mobile devices.
- **Auto-Cleanup (24-Hour TTL)**: MongoDB TTL indexes automatically prune messages older than 24 hours to preserve database performance and privacy.

---

### 5. 🔔 Notifications & Multi-User Admin Message Center
- **Admin-Only Broadcasts & Direct Messages**: Protected message composition for administrators to send platform-wide announcements or direct alerts to individual students.
- **Privacy-Safe Student Identifiers**: User identifiers masked (e.g. `#D84A12`) without exposing raw emails to other users.
- **Social Connection Actions**: One-click Profile redirect, Follow, and Connection request approvals.
- **Interactive Notification Drawer**: In-app inbox with unread badges, priority indicators (Urgent, High, Normal), and auto-expiry after 7 days.

---

### 6. 🎙️ AI Smart Lab & Speech Interviewer
- **Interactive AI Voice Interviewer**: Voice-based mock interviews powered by browser Speech Recognition, Google Gemini AI, and Text-to-Speech audio synthesis.
- **Curated Question Pool**: Comprehensive technical, system design, and behavioral questions tailored for competitive campus placements and technical evaluations.

---

### 7. ⚡ High-Throughput Game Engine & Grafana Telemetry
- **Multi-User Real-time Architecture**:
  - Built to sustain **1,000+ requests/second** during live exam events.
  - Asynchronous priority queues with background worker pools and in-memory pre-seeded ring buffers.
  - Non-repeating procedural math and algorithmic variations via NumPy.
- **Prometheus & Grafana Monitoring**:
  - Built-in `/metrics` endpoint formatted for standard Prometheus scraping.
  - Pre-configured Grafana dashboard (`server/battle-service/grafana_dashboard.json`) tracking real-time QPS throughput, active players, p50/p95 queue latencies, and platform accuracy.
- **Admin-Only Query & Benchmark Execution**:
  - High-load engine benchmarks (e.g., 1,000 req/s stress tests) and arbitrary game queries are locked inside the **Admin Command Center** (`/api/admin/game-engine`). Non-admin attempts return `401 Unauthorized`.

---

### 8. 🛡️ Secure Admin Clearance & Authentication
- **Admin Switch at Registration & Login**:
  - Switch between Student Registration, Student Login, and **Administrator Clearance** directly on the onboarding portal.
  - Master Administrator Password verification with cryptographic HMAC tokens.
- **Clean Student Navigation**:
  - Header profile menu is kept strictly for student actions (*View Profile*, *Sign Out*).
  - Admin tools remain accessible only to verified administrators via elevated session routing.

---

### 9. 👤 Student Profile & Device Photo Upload
- **Device Camera & Gallery Picker**:
  - Click on the profile avatar or account settings button to select or capture an image directly from mobile cameras or desktop storage.
  - Automatic base64 encoding with immediate live preview and persistent database synchronization (`PUT /api/profile`).
- **High-Contrast Legible Badges**:
  - Distinct badges for `STUDENT` and `ADMIN` roles across both light and dark modes.
- **Battle Statistics**:
  - Tracks XP points, ranks (Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster), ELO ratings, win/loss records, and unlocked achievements.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend Services** | Python 3.11, FastAPI, Uvicorn, Pydantic Settings, Motor, PyMongo |
| **Data & ML Analytics** | Pandas, NumPy, scikit-learn (TF-IDF & Cosine Similarity) |
| **Document Processing** | PyMuPDF (`fitz`), `pypdf`, Tesseract OCR |
| **Telemetry & Metrics** | Prometheus (`prometheus_client`), Grafana |
| **Database** | MongoDB (Mongoose for Next.js, Motor for async Python) |
| **AI Integration** | Google Gemini API (`@google/genai`) with offline fallback support |
| **Testing** | pytest, pytest-asyncio, Next.js build verification |

---

## 📁 Repository Structure

```text
Local LLM/
├── app/                                # Next.js App Router
│   ├── api/                            # API Route Handlers
│   │   ├── admin/                      # Admin routes (arena approvals, engine benchmarks, auth)
│   │   ├── analyze-paper/              # Bridge to FastAPI Exam Pattern Engine
│   │   ├── arena/                      # Battle matchmaking, leaderboard & questions
│   │   ├── chat/                       # Global real-time chat with 24-hour TTL
│   │   ├── interview/                  # Smart Lab voice & question generator
│   │   ├── notifications/              # Multi-user notification center
│   │   ├── papers/                     # Community repository, upload & download
│   │   └── profile/                    # User profile sync & photo upload
│   ├── layout.tsx                      # Root Layout
│   └── page.tsx                        # Main Application Landing Page
├── components/                         # UI Components
│   ├── admin-community.tsx             # Community Repository, Admin Panel & Policy
│   ├── exam-analyzer.tsx               # 3-Step Exam Pattern Analyzer Interface
│   ├── topic-analysis.tsx              # Strategic Topic Ranking & Evidence Cards
│   ├── question-predictor.tsx          # MCQ & Subjective Practice Suite with Rubrics
│   ├── header.tsx                      # Header with Student Profile Menu & Navigation
│   ├── notifications-center.tsx        # Multi-User Notifications & Admin Messaging
│   ├── smart-lab.tsx                   # Smart Lab & AI Voice Interviewer
│   ├── student-profile.tsx             # User Profile, Device Image Upload & Settings
│   └── battle-arena/                   # Battle Arena, Leaderboard & 530+ Question Bank
├── lib/
│   ├── data/arenaQuestionBank.ts       # 530+ Curated Static Arena Questions
│   ├── mongodb.ts                      # Mongoose Database Connection
│   └── mockDb.ts                       # Offline Resilience & Fallback Data
├── models/                             # Mongoose MongoDB Models
│   ├── ArenaQuestion.ts
│   ├── ChatMessage.ts
│   ├── Notification.ts
│   ├── Paper.ts
│   └── User.ts
├── server/
│   └── battle-service/                 # FastAPI High-Performance Backend (Port 8001)
├── package.json                        # Node dependencies & build scripts
├── .gitignore                          # Git Ignore Configuration
└── README.md                           # Project Documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root folder with the following variables:

```env
# AI Model & Keys
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

# Database Connection
MONGODB_URI=mongodb://localhost:27017/aura_study_ai
DATABASE_NAME=aura_study_ai

# Service URLs
BATTLE_SERVICE_URL=http://localhost:8001
APP_URL=http://localhost:3000

# Security & Secrets
NEXTAUTH_SECRET=your_nextauth_secret
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_admin_password
```

---

## ⚡ Quick Start (Local Setup)

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Install Python Dependencies
```bash
pip install -r server/battle-service/requirements.txt
```

### 3. Start the Python FastAPI Engine
```bash
python server/battle-service/run_server.py
```
*The engine starts on `http://localhost:8001` with MongoDB, Prometheus `/metrics`, and the Exam Analyzer routes active.*

### 4. Run the Next.js Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

### Run Python Test Suite (84 Tests)
```bash
pytest server/battle-service/tests
```

### Run Next.js Production Build
```bash
npm run build
```

---

## 📜 License & Disclaimers

- **Academic Integrity**: Aura Study AI is designed as a study aid, topic prioritization guide, and practice system.
- **Statistical Disclaimer**: All priority scores, frequency percentages, and predicted questions represent statistical approximations from historical inputs, not guaranteed examination occurrences.
