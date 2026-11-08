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
- **Executive Blueprint Report**: Integrated printable/exportable report payload with methodology, year coverage, topic ranking tables, and evaluation disclaimers.

---

### 2. ⚡ High-Throughput Game Engine & Grafana Telemetry
- **Multi-User Real-time Architecture**:
  - Built to sustain **1,000+ requests/second** during live exam events.
  - Asynchronous priority queues with background worker pools and in-memory pre-seeded ring buffers.
  - Non-repeating procedural math and algorithmic variations via `random.math` and NumPy.
- **Prometheus & Grafana Monitoring**:
  - Built-in `/metrics` endpoint formatted for standard Prometheus scraping.
  - Pre-configured Grafana dashboard (`server/battle-service/grafana_dashboard.json`) tracking real-time QPS throughput, active players, p50/p95 queue latencies, and platform accuracy.
- **Admin-Only Query & Benchmark Execution**:
  - High-load engine benchmarks (e.g., 1,000 req/s stress tests) and arbitrary game queries are locked inside the **Admin Command Center** (`/api/admin/game-engine`). Non-admin attempts return `401 Unauthorized`.

---

### 3. 🛡️ Secure Admin Clearance & Authentication
- **Admin Switch at Registration & Login**:
  - Switch between Student Registration, Student Login, and **Administrator Clearance** directly on the onboarding portal.
  - Master Administrator Password verification with cryptographic HMAC tokens.
- **Clean Student Navigation**:
  - Header profile menu is kept strictly for student actions (*View Profile*, *Sign Out*).
  - Admin tools remain accessible only to verified administrators via elevated session routing.

---

### 4. 👤 Student Profile & Device Photo Upload
- **Device Camera & Gallery Picker**:
  - Click on the profile avatar or account settings button to select or capture an image directly from mobile cameras or desktop storage.
  - Automatic base64 encoding with immediate live preview and persistent database synchronization (`PUT /api/profile`).
- **High-Contrast Legible Badges**:
  - Distinct badges for `STUDENT` and `ADMIN` roles across both light and dark modes.
- **Battle Statistics**:
  - Tracks XP points, ranks (Bronze, Silver, Gold, Platinum), ELO ratings, win/loss records, and unlocked achievements.

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
| **AI Integration** | Google Gemini 2.5 API (`@google/genai`) with offline fallback support |
| **Testing** | pytest, pytest-asyncio, Next.js build verification |

---

## 📁 Repository Structure

```text
Local LLM/
├── app/                                # Next.js App Router
│   ├── api/                            # API Route Handlers
│   │   ├── admin/game-engine/          # Admin-only Game Engine runner & benchmarks
│   │   ├── admin/login/                # Admin Master Password verification
│   │   ├── analyze-paper/              # Bridge to FastAPI Exam Pattern Engine
│   │   ├── extract-text/               # PDF / Image / OCR text extractor
│   │   ├── profile/                    # User profile sync & photo upload
│   │   └── arena/                      # Battle, matchmaking, and leaderboard
│   ├── layout.tsx                      # Root Layout
│   └── page.tsx                        # Main Application Landing Page
├── components/                         # UI Components
│   ├── admin-community.tsx             # Onboarding with Admin Switch & Command Center
│   ├── exam-analyzer.tsx               # 3-Step Exam Pattern Analyzer Interface
│   ├── topic-analysis.tsx              # Strategic Topic Ranking & Evidence Cards
│   ├── question-predictor.tsx          # MCQ & Subjective Practice Suite with Rubrics
│   ├── header.tsx                      # Header with Student Profile Menu & Navigation
│   ├── student-profile.tsx             # User Profile, Device Image Upload & Settings
│   └── battle-arena/                   # Battle Arena & High-Throughput Engine UI
├── models/                             # Mongoose MongoDB Models
├── server/
│   └── battle-service/                 # FastAPI High-Performance Backend (Port 8001)
│       ├── main.py                     # FastAPI entry point & metrics
│       ├── run_server.py               # Standalone daemon launcher
│       ├── grafana_dashboard.json      # Pre-configured Grafana telemetry dashboard
│       ├── routes/
│       │   ├── exam_analyzer.py        # Blueprint API endpoints
│       │   └── questions.py            # Battle questions & benchmark routes
│       ├── services/
│       │   ├── exam_analyzer/          # Core Exam Pattern Analyzer Pipeline
│       │   │   ├── models.py           # Pydantic data schemas
│       │   │   ├── pdf_parser.py       # PyMuPDF / pypdf document reader
│       │   │   ├── syllabus_analyzer.py# Unit & topic hierarchy extractor
│       │   │   ├── question_extractor.py# Multi-paper question parser
│       │   │   ├── topic_mapper.py     # TF-IDF semantic topic matcher
│       │   │   ├── pattern_analyzer.py # Pandas & NumPy scoring engine
│       │   │   ├── question_generator.py# Practice question & rubric generator
│       │   │   └── report_service.py   # Executive report compiler
│       │   └── high_throughput_engine.py# 1,000 req/s queue & buffer engine
│       └── tests/                      # pytest test suite (84 passing tests)
├── package.json                        # Node dependencies & build scripts
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
Verifies PDF extraction, syllabus segmentation, question parsing, TF-IDF mapping, Pandas/NumPy pattern analysis, model answer rubrics, and high-throughput queues.

### Run Next.js Production Build
```bash
npm run build
```
Compiles all pages and serverless API routes with Turbopack with 0 errors.

---

## 📊 Prometheus & Grafana Integration

1. **Prometheus Target**: Configure your `prometheus.yml` to scrape `http://localhost:8001/metrics`.
2. **Grafana Dashboard**: Import `server/battle-service/grafana_dashboard.json` into Grafana to monitor:
   - Real-time QPS throughput & peak capacity
   - Active concurrent player sessions
   - p50 and p95 queue latencies
   - Platform overall accuracy rate

---

## 📜 License & Disclaimers

- **Academic Integrity**: Aura Study AI is designed as a study aid, topic prioritization guide, and practice system.
- **Statistical Disclaimer**: All priority scores, frequency percentages, and predicted questions represent statistical approximations from historical inputs, not guaranteed examination occurrences.
