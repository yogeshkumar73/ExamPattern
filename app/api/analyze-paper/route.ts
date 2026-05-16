import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Safe imports for optional dependencies
let ratelimit: any = null
try {
  const { Ratelimit } = require("@upstash/ratelimit")
  const { Redis } = require("@upstash/redis")
  
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  })

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
  })
} catch (e) {
  console.warn("Upstash Redis not installed. Rate limiting disabled.")
}

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check Rate Limit if available
    if (ratelimit && process.env.UPSTASH_REDIS_REST_URL) {
      const ip = request.headers.get("x-forwarded-for") || "anonymous"
      const { success } = await ratelimit.limit(ip)
      
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment." },
          { status: 429 }
        )
      }
    }

    const { text: syllabusText, sampleText: oldPaperText, requirements, options } = await request.json()

    if (!syllabusText) {
      return NextResponse.json({ error: "Syllabus is required for analysis." }, { status: 400 })
    }

    const questionsCount = options.questionCount || 5
    const difficulty = options.difficulty || "Medium"
    const paperFormat = options.paperFormat || "Standard"
    
    const outputInstructions = [
      "- 'topics': Array of {name, frequency (in old papers), importance (1-10 based on syllabus), probabilityMatch (1-100)}",
      "- 'patterns': Array of {pattern, description}",
      `- 'predictedQuestions': Object with:
        - 'mcq': Array of ${options.outputTypes.includes("mcq") ? questionsCount : 0} questions with {question, options, correctAnswer, explanation}
        - 'written': Array of ${options.outputTypes.includes("written") ? questionsCount : 0} questions with {question, marks, difficulty, modelAnswer}`
    ]

    const hybridLogic = options.hybridMode ? `
DYNAMIC HYBRID LOGIC:
1. Strict adherence to the ${paperFormat} examination style.
2. Cross-reference Syllabus vs Old Papers to find high-probability gaps.
3. IGNORE ALL CACHED OR GENERALIZED DATA. Focus exclusively on the current syllabus and paper uploads provided in this session.` : `
DIRECT SESSION ANALYSIS:
1. Analyze current uploads only.
2. Adhere strictly to ${paperFormat} formatting.`

    const { text: analysisText } = await generateText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct"),
      system: `You are a precision Academic Analyzer specialized in the ${paperFormat} format. 
Your primary goal is to generate questions that match the exact rigor and style of ${paperFormat}.
${hybridLogic}
STRICT CONSTRAINTS:
- Rigor: ${difficulty}.
- Requirements: ${requirements || "None"}.
- Zero-Cache: Every search must be unique and based ONLY on current context.
- Response: PURE JSON.`,
      prompt: `Analyze Syllabus and Old Papers for ${paperFormat} Exam.
Syllabus: ${syllabusText.substring(0, 10000)}
Old Papers: ${oldPaperText || "None"}.
Output: ${outputInstructions.join("\n")}`,
    })

    // Parse JSON
    let jsonResult = {}
    try {
      const cleanJson = analysisText.replace(/```json/g, "").replace(/```/g, "").trim()
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      jsonResult = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson)
    } catch (e) {
      console.error("JSON Parse Error:", analysisText)
      return NextResponse.json({ error: "AI failed to produce valid JSON" }, { status: 500 })
    }

    return NextResponse.json({
      extractedText: syllabusText,
      ...jsonResult
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}
