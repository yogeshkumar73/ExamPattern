import { type NextRequest, NextResponse } from "next/server"

// NVIDIA Nemotron 3 Super via OpenRouter (free tier)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const NEMOTRON_SUPER_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1:free"

export async function POST(request: NextRequest) {
  try {
    const { text: syllabusText, sampleText: oldPaperText, requirements, options } = await request.json()

    if (!syllabusText) {
      return NextResponse.json({ error: "Syllabus is required for analysis." }, { status: 400 })
    }

    const questionsCount = options?.questionCount || 5
    const difficulty = options?.difficulty || "Medium"
    const paperFormat = options?.paperFormat || "Standard"

    const outputInstructions = [
      "- 'topics': Array of {name, frequency (in old papers), importance (1-10 based on syllabus), probabilityMatch (1-100)}",
      "- 'patterns': Array of {pattern, description}",
      `- 'predictedQuestions': Object with:
        - 'mcq': Array of ${options?.outputTypes?.includes("mcq") ? questionsCount : 0} questions with {question, options, correctAnswer, explanation}
        - 'written': Array of ${options?.outputTypes?.includes("written") ? questionsCount : 0} questions with {question, marks, difficulty, modelAnswer}`
    ]

    const hybridLogic = options?.hybridMode ? `
DYNAMIC HYBRID LOGIC:
1. Strict adherence to the ${paperFormat} examination style.
2. Cross-reference Syllabus vs Old Papers to find high-probability gaps.
3. IGNORE ALL CACHED OR GENERALIZED DATA. Focus exclusively on the current syllabus and paper uploads provided in this session.` : `
DIRECT SESSION ANALYSIS:
1. Analyze current uploads only.
2. Adhere strictly to ${paperFormat} formatting.`

    const systemPrompt = `You are a precision Academic Analyzer specialized in the ${paperFormat} format. 
Your primary goal is to generate questions that match the exact rigor and style of ${paperFormat}.
${hybridLogic}
STRICT CONSTRAINTS:
- Rigor: ${difficulty}.
- Requirements: ${requirements || "None"}.
- Zero-Cache: Every search must be unique and based ONLY on current context.
- Response: PURE JSON only. No markdown, no explanation outside JSON.`

    const userPrompt = `Analyze Syllabus and Old Papers for ${paperFormat} Exam.
Syllabus: ${syllabusText.substring(0, 10000)}
Old Papers: ${oldPaperText || "None"}.
Output strict JSON with these keys:
${outputInstructions.join("\n")}`

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 })
    }

    // Call OpenRouter with NVIDIA Nemotron Super
    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Aura Study Logic - Paper Analyzer",
      },
      body: JSON.stringify({
        model: NEMOTRON_SUPER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    })

    if (!orResponse.ok) {
      const errBody = await orResponse.text()
      console.error("OpenRouter Error:", errBody)
      return NextResponse.json({ error: `AI service error: ${orResponse.status}` }, { status: 502 })
    }

    const orData = await orResponse.json()
    const analysisText = orData.choices?.[0]?.message?.content || ""

    if (!analysisText) {
      return NextResponse.json({ error: "AI returned an empty response." }, { status: 500 })
    }

    // Parse JSON from AI response
    let jsonResult = {}
    try {
      const cleanJson = analysisText.replace(/```json/g, "").replace(/```/g, "").trim()
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      jsonResult = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson)
    } catch (e) {
      console.error("JSON Parse Error from AI:", analysisText)
      return NextResponse.json({ error: "AI failed to produce valid JSON. Please try again." }, { status: 500 })
    }

    return NextResponse.json({
      extractedText: syllabusText,
      model: NEMOTRON_SUPER_MODEL,
      ...jsonResult
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Server Error: " + (error.message || "Unknown") }, { status: 500 })
  }
}
