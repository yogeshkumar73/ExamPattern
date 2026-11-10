# Aura Study AI — Exam Pattern Analyzer, Vasudhaiva Kutumbakam Vision & Multiplayer Learning Combat

A modern, production-ready academic intelligence and gamified learning platform built with **Next.js 16**, **React 19**, **Tailwind CSS**, **MongoDB**, and **Python FastAPI** microservices powered by **Pandas**, **NumPy**, **PyMuPDF**, and **scikit-learn**.

---

## 🌟 Vasudhaiva Kutumbakam — Platform Ethos & Vision Slider

The platform embodies the sacred timeless philosophy of **वसुधैव कुटुम्बकम्** (*"The Entire World is One Family"*), uniting education, ecology, diversity, and technology through an interactive, left-to-right 10-component vision carousel (`components/vision-slider.tsx`):

1. **वसुधैव कुटुम्बकम् (Vasudhaiva Kutumbakam)**: *"The Entire World is One Single Family"* — Transcending geographic barriers through universal, accessible education.
2. **सा विद्या या विमुक्तये (Sacred Education)**: *"True Education is That Which Liberates"* — Deep conceptual mastery and intellectual freedom.
3. **जल ही जीवन है — अमृत धारा (Water — Elixir of Life)**: *"Save Every Drop, Nurture Every Stream"* — Ecological conservation and sacred water stewardship.
4. **उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत (The Student Spark)**: *"Arise, Awake, and Stop Not Till the Goal is Reached"* — Fearless ambition and student resilience.
5. **गुरुर्ब्रह्मा गुरुर्विष्णुः (Guru — The Illuminator)**: *"Guiding from Darkness to Light"* — Honoring teachers, mentors, and ethical guides.
6. **अनेकता में एकता — भारत का गौरव (Bharat Diversity)**: *"Unity in Vibrant Diversity"* — Celebrating 1.4 billion dreams woven into one rich heritage.
7. **परोपकाराय सतां विभूतयः (Universal Humanity)**: *"Service to Humanity is the Highest Calling"* — Compassion and technology for the underserved.
8. **माता भूमिः पुत्रोऽहं पृथिव्याः (Mother Earth & Ecology)**: *"Earth is My Mother, and I am Her Child"* — Harmonizing AI with environmental preservation.
9. **विज्ञानं ब्रह्म (Deep Tech & Innovation)**: *"Harnessing Advanced AI for Societal Elevation"* — High-throughput learning algorithms.
10. **सर्वे भवन्तु सुखिनः (Universal Peace & Well-being)**: *"May All Beings Everywhere Be Happy & Free"* — The ultimate vision of global harmony and prosperity.

---

## 🚀 Key Modules & Capabilities

### 1. ⚔️ Battle Arena & Combat Modes
- **1v1 Ranked Matchmaking**: Automatically pairs students against rank-appropriate rivals or bot contenders with live question streams.
- **Team Battle (2v2 & 3v3)**: Group combat with team progress bars (Blue Team vs Red Team) and cooperative scoring.
- **Private Battle Rooms**: Host custom rooms with room codes (`PRIV-XXXXX`), optional secret passwords, and direct friend invites.
- **Friend Duel Challenges**: One-click duel challenges from the Friend List that send real-time alerts and launch head-to-head combat.
- **Tournament Hosting & Event System**:
  - Host tournaments across 6 game modes, 4 difficulty tiers, 4–32 player capacities, and 500–10,000 XP prize pools.
  - Set immediate start or scheduled future events with host-only start/cancel controls.
  - Password protection and shareable direct invite links (`?step=arena&tab=tournament&invite=TRN-XXXXXX`) with auto-opening join modal.
  - Broadcast notifications dispatched to all students when new events are hosted.

### 2. 🔔 Real-Time Notifications & Smart Redirects
- **Zero-Friction In-App Redirection**: Clicking **Enter Tournament** or **Enter Duel** in the notification center closes the drawer and transitions directly into the target match/tournament via clean SPA state without 404s or full-page reloads.
- **Sanitized, Clean Alerts**: Concise notification text without technical jargon, stripped email addresses, and hidden clutter buttons.
- **Dedicated Route Fallback**: [`/battle-arena`](file:///C:/Local%20LLM/app/battle-arena/page.tsx) automatically captures external links and forwards them cleanly to `/?step=arena`.

### 3. 👤 Authenticated Personal Accounts & Guest Protection
- **No Fake Guest Accounts**: New/unauthenticated visitors are never pushed into blank dummy student profiles (`Student`, Level 1, Bronze, 0 XP).
- **Direct Login Redirection**: Unauthenticated attempts to access student profiles or protected tools smoothly direct the user to the Sign In / Register portal or Home landing page.
- **Instant Auto-Login on Registration**: Creating a new account automatically creates the authenticated session and redirects directly into the user's personal profile without requiring a manual second login.
- **Cross-Session Synchronization**: Global synchronization between NextAuth cookies, localStorage, and MongoDB ensures real student identities (`Yogesh`, profile avatars, rank, XP) populate reliably.

### 4. 📖 Exam Pattern Analyzer
- **Multi-Paper Blueprint Analysis**: Upload syllabus and historical examination papers (PDF, TXT, images) to extract course units and topic hierarchies via PyMuPDF.
- **Multivariable Topic Scoring**:
  $$\text{Priority Score} = 0.30 \cdot S_{\text{appearance}} + 0.20 \cdot S_{\text{recency}} + 0.20 \cdot S_{\text{marks}} + 0.15 \cdot S_{\text{trend}} + 0.15 \cdot S_{\text{coverage}}$$
- **Predicted Practice Question Suite**: Objective MCQs and Subjective theoretical questions with comprehensive marking rubrics and academic disclaimers.

### 5. 📚 Community Repository & Examination Archive
- Multi-category question paper archive across CBSE, GATE, UPSC, and University boards with one-click student downloads and admin approval workflows.

### 6. 🎙️ AI Smart Lab & Speech Interviewer
- Voice-based mock interviews powered by browser Speech Recognition, Google Gemini AI, and Text-to-Speech synthesis for campus placements.

### 7. 🛡️ Security, Rate Limiting & Bot Mitigation
- **Automated Bot Blocking**: Integrated Next.js middleware filters out malicious scanner user agents (`sqlmap`, `nikto`, `nmap`, etc.) with HTTP 403 Forbidden.
- **Input Validation**: Cryptographic password hashing, parameterized MongoDB queries, and strict payload type checks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend Services** | Node.js, Python 3.11, FastAPI, Uvicorn, Motor, PyMongo |
| **Data & ML Analytics** | Pandas, NumPy, scikit-learn (TF-IDF & Cosine Similarity) |
| **Document Processing** | PyMuPDF (`fitz`), `pypdf`, Tesseract OCR |
| **Telemetry & Metrics** | Prometheus (`prometheus_client`), Grafana |
| **Database** | MongoDB (Mongoose for Next.js, Motor for async Python) |
| **AI Integration** | Google Gemini API (`@google/genai`) with offline fallback resilience |
| **Testing** | Automated Platform Test Suite (`npm test`), pytest |

---

## ⚡ Quick Start & Verification

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Run All Automated Test Cases (25 Tests)
```bash
npm test
```
*Validates pages, bot defenses, notifications, battle matchmaking, tournaments, duels, and authentication input handling.*

### 3. Run the Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build Verification
```bash
npm run build
```

---

## 📜 License & Disclaimers

- **Academic Integrity**: Aura Study AI is engineered as an intelligent study companion and collaborative practice platform.
- **Statistical Disclaimer**: All priority rankings, predicted practice questions, and match statistics represent statistical approximations to assist revision, not guaranteed examination contents.
