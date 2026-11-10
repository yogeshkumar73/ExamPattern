import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY || process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are the Aura AI Academic & Technical Guider Agent.
You are a warm, highly knowledgeable, and practical mentor for engineering and university students.

Your capabilities include:
1. Academic Advice: Syllabus breakdown, high-yield topic prioritization, exam strategy, and schedule planning.
2. Software & App Development: Practical architectures, modern tech stack advice (Next.js, React, Node.js, Python, MongoDB, PostgreSQL), step-by-step development roadmaps from idea to deployment.
3. Algorithms & Coding: Socratic problem-solving tips, Big-O complexity analysis, and practice pathways for the Smart Lab (interactive compiler) and Battle Arena (1v1 duels).
4. Career & Interview Preparation: Technical mock interview tips, DSA patterns, and system design fundamentals.

Communication Guidelines:
- Respond specifically to what the student is asking right now. Never output generic copy-paste scripts.
- When a student greets you, warmly welcome them and ask what project, course, or coding challenge they want to conquer today.
- When a student asks about building an application, outline a concrete 4-step roadmap (Ideation & Scope, Tech Stack, Core Backend/Frontend Architecture, Testing & Deployment).
- Use clean Markdown with bold headings and bullet points for high readability.
- Keep responses informative, encouraging, and focused (around 2-4 structured paragraphs or bullet points).`;

/**
 * Intelligent local contextual guidance fallback if external AI endpoints are unreachable.
 */
function generateContextualGuidance(query: string): string {
  const q = query.toLowerCase().trim();

  if (q.includes("build") || q.includes("app") || q.includes("project") || q.includes("website") || q.includes("software")) {
    return `### 🚀 Roadmap to Build Your Application\n\nBuilding an application is an exciting milestone! Here is a proven 4-stage engineering blueprint to get started:\n\n1. **Define Core Scope (MVP)**:\n   - List 2 to 3 core features your users cannot live without. Avoid feature creep early on.\n2. **Choose Modern Tech Stack**:\n   - **Frontend**: Next.js / React with Tailwind CSS for rapid, responsive UI development.\n   - **Backend**: Node.js (Express / Next.js API Routes) or Python (FastAPI) for lightweight, high-performance endpoints.\n   - **Database**: MongoDB for flexible document storage or PostgreSQL for structured relational data.\n3. **Architecture & API Design**:\n   - Design REST or GraphQL contracts first before coding UI components.\n   - Implement authentication (e.g., JWT, OAuth, or NextAuth) and secure environment variables.\n4. **Interactive Practice & Deployment**:\n   - Test logic in our **Smart Lab** workspace, then deploy on Vercel or Railway.\n\nWhat type of application are you planning to build (e.g., Web App, AI Tool, Mobile App)? Tell me the idea, and we can architect the database schema together!`;
  }

  if (q.includes("exam") || q.includes("syllabus") || q.includes("study") || q.includes("paper") || q.includes("test")) {
    return `### 📚 Strategic Exam Preparation Framework\n\nTo maximize retention and scoring with 94% accuracy, follow this prioritized revision strategy:\n\n- **Step 1: Syllabus Topic Weighting** — Upload your official syllabus in our **Exam Pattern Analyzer** to extract unit weights and recurring concepts.\n- **Step 2: Historical Pattern Matching** — Solve at least 3-5 past examination papers under timed conditions to identify repeated questions.\n- **Step 3: High-Frequency Formula Sheets** — Create condensed one-page summaries for mathematical derivations and algorithm theorems.\n- **Step 4: Active Recall & Mock Tests** — Test yourself with our question predictor before exam day.\n\nWhich subject or engineering unit are you preparing for right now?`;
  }

  if (q.includes("code") || q.includes("algorithm") || q.includes("dsa") || q.includes("practice") || q.includes("problem")) {
    return `### 💻 Algorithmic Mastery & Smart Lab Practice\n\nFor cracking coding challenges and tech interviews:\n\n- **Focus on Core Patterns**: Hash Maps, Two Pointers, Sliding Window, Binary Trees, and BFS/DFS Graph traversals.\n- **Optimize Time & Space**: Strive for $O(N)$ or $O(N \\log N)$ runtime and avoid unnecessary memory allocations.\n- **Hands-on Compiler**: Head over to our **Smart Lab** to solve curated problems in Python, JavaScript, Java, or C++ with automated test cases.\n- **Live Arena Duels**: Jump into the **Battle Arena** to test your problem-solving speed against peers in real time!\n\nWhich data structure or algorithm would you like to explore today?`;
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.length < 5) {
    return `### 👋 Hello! Welcome to Aura AI Guider\n\nI am your dedicated academic and technical co-pilot. I can help you with:\n\n- **Building Real-World Projects & Full-Stack Apps** (Architecture, Tech Stack & APIs)\n- **Interactive Coding & Algorithm Optimization** (DSA & Smart Lab practice)\n- **Multiplayer Battle Arena Strategies** (Rank tiers, speed & accuracy)\n- **Exam & Syllabus Analysis** (Past-paper pattern prediction & unit weights)\n- **Technical Interview Coaching** (Mock rounds & system design)\n\nWhat are you working on or curious about today? Ask me anything!`;
  }

  return `### 💡 Guider Recommendation\n\nThank you for reaching out! To help you achieve maximum progress:\n\n- **Project Development**: If you're building an app or service, identify your core tech stack and API endpoints.\n- **Coding Practice**: Use the **Smart Lab** to run code in 5+ languages with automated test suites.\n- **Rankings & Arena**: Duel fellow students in the **Battle Arena** to sharpen your algorithm speed.\n- **Exam Preparation**: Analyze your university syllabus in the **Exam Predictor** to target high-probability topics.\n\nCould you share a bit more detail about your specific goal or subject so I can provide customized step-by-step guidance?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => !m.isAi && (m.text || m.content));
    const userQuery = lastUserMessage?.text || lastUserMessage?.content || "";

    // 1. Primary: Google Gemini AI
    if (GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        const contents = messages
          .filter((m: any) => m && (m.text || m.content))
          .map((m: any) => ({
            role: (m.isAi || m.role === "assistant" || m.role === "model") ? "model" : "user",
            parts: [{ text: String(m.text || m.content || "").trim() }],
          }));

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return NextResponse.json({
            success: true,
            text: replyText,
            reply: replyText,
            source: "gemini",
          });
        }
      } catch (geminiError: any) {
        console.warn("[Guider] Gemini API attempt failed, attempting fallback:", geminiError?.message || geminiError);
      }
    }

    // 2. Secondary: OpenRouter API Fallback
    if (OPENROUTER_API_KEY) {
      try {
        const cleanedKey = OPENROUTER_API_KEY.trim();
        const formattedMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
            .filter((m: any) => m && (m.text || m.content))
            .map((m: any) => ({
              role: (m.isAi || m.role === "assistant") ? "assistant" : "user",
              content: String(m.text || m.content || "").trim(),
            })),
        ];

        const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cleanedKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Aura AI Guider",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (openRouterRes.ok) {
          const orData = await openRouterRes.json();
          const reply = orData?.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return NextResponse.json({
              success: true,
              text: reply,
              reply,
              source: "openrouter",
            });
          }
        }
      } catch (orErr: any) {
        console.warn("[Guider] OpenRouter fallback failed:", orErr?.message || orErr);
      }
    }

    // 3. Tertiary: High-Quality Contextual Guidance Engine
    const fallbackText = generateContextualGuidance(userQuery);
    return NextResponse.json({
      success: true,
      text: fallbackText,
      reply: fallbackText,
      source: "contextual_engine",
    });
  } catch (error: any) {
    console.error("[Guider] Global handler error:", error);
    return NextResponse.json({
      success: true,
      text: generateContextualGuidance(""),
      reply: generateContextualGuidance(""),
      source: "recovery_engine",
    });
  }
}
