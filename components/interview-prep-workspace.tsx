"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Play, RotateCcw, CheckCircle, RefreshCw, Star, Sparkles, Mic, PhoneCall, Send, PhoneOff, MessageSquare, Bot, MicOff, AlertCircle, Volume2, Radio, Check, HelpCircle } from "lucide-react"

interface InterviewQuestion {
  _id: string
  prompt: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
}

interface MockInterviewState {
  id: string
  questions: InterviewQuestion[]
  currentQuestionIndex: number
  answers: string[]
  score: number
  readinessScore: number
  status: "idle" | "running" | "completed"
}

interface ChatMessage {
  role: "user" | "ai"
  content: string
}

interface VoiceConvMessage {
  role: "user" | "assistant"
  content: string
}

const categories = ["Basics", "JavaScript", "React", "NextJs", "Node", "DSA", "SystemDesign", "Python", "Java", "SQL"]
const difficulties = ["Easy", "Medium", "Hard"]

const HIGH_PROB_TOPICS = [
  { label: "CS Basics: Process vs Thread & Deadlocks", category: "Basics", difficulty: "Easy" },
  { label: "Web Basics: Box Model & Critical Path", category: "Basics", difficulty: "Easy" },
  { label: "JavaScript: Closures, Event Loop & TDZ", category: "JavaScript", difficulty: "Easy" },
  { label: "React Fiber & Hooks Lifecycle", category: "React", difficulty: "Medium" },
  { label: "Next.js RSC & App Router", category: "NextJs", difficulty: "Hard" },
  { label: "Node.js Event Loop & Streams", category: "Node", difficulty: "Medium" },
  { label: "DSA: LRU Cache & Pointers", category: "DSA", difficulty: "Hard" },
  { label: "System Design: TinyURL & Scale", category: "SystemDesign", difficulty: "Medium" },
  { label: "SQL: B-Tree Indexing & ACID", category: "SQL", difficulty: "Medium" },
]

const HIGH_PROBABILITY_STARTERS: Record<string, string> = {
  Basics: "Welcome to your Core Fundamentals & Basics interview! Let's start with foundational system architecture: could you explain the key differences between a Process and a Thread, and how memory is shared?",
  JavaScript: "Welcome to your JavaScript technical interview! Let's explore asynchronous execution: could you walk me through the JavaScript Event Loop and explain how microtasks differ from macrotasks?",
  React: "Welcome to your React technical interview! Let's start with component architecture: could you explain how React's reconciliation algorithm and Fiber architecture prioritize render updates?",
  NextJs: "Welcome to your Next.js interview! Let's discuss performance: how do React Server Components differ from Client Components in the App Router, and how do you optimize data fetching with caching?",
  Node: "Welcome to your Node.js technical screening! Could you explain the phases of the Node.js event loop and how process.nextTick differs from setImmediate?",
  DSA: "Welcome to your Data Structures and Algorithms interview! Let's explore cache design: how would you implement an LRU cache with constant O(1) time complexity for both get and put operations?",
  SystemDesign: "Welcome to your System Design interview! Today we are designing a high-throughput URL shortening service like bit.ly. How would you generate unique keys, handle 100,000 QPS, and structure the cache?",
  Python: "Welcome to your Python technical interview! Could you explain the Global Interpreter Lock (GIL) and how it affects CPU-bound vs I/O-bound concurrency in production systems?",
  Java: "Welcome to your Java interview! Could you walk me through the internal bucket architecture and collision resolution in a Java 8+ HashMap?",
  SQL: "Welcome to your Database interview! What is the architectural difference between Clustered and Non-Clustered B-tree indexes, and how do they impact range queries?"
}

export function InterviewPrepWorkspace() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("React")
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium")
  const [generateCount, setGenerateCount] = useState<number>(5)
  const [personalize, setPersonalize] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<"setup" | "chat" | "voice">("setup")

  const [mockInterview, setMockInterview] = useState<MockInterviewState | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Voice Call State
  const [isCalling, setIsCalling] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [autoListen, setAutoListen] = useState(true)
  const [voiceInputText, setVoiceInputText] = useState("")
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [aiVoiceResponse, setAiVoiceResponse] = useState("")
  const [voiceConvHistory, setVoiceConvHistory] = useState<VoiceConvMessage[]>([])
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [voiceError, setVoiceError] = useState("")
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<any>(null)
  const isCallingRef = useRef(isCalling)
  const autoListenRef = useRef(autoListen)

  useEffect(() => {
    isCallingRef.current = isCalling
  }, [isCalling])

  useEffect(() => {
    autoListenRef.current = autoListen
  }, [autoListen])

  // Chat Coach State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Hello! I'm your AI Interview Coach powered by Google Gemini. What topic would you like to practice today? Tell me your experience level and the role you're targeting!" }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Feedback details
  const [commScore, setCommScore] = useState(85)
  const [techScore, setTechScore] = useState(90)
  const [solveScore, setSolveScore] = useState(88)
  const [feedbackSummary, setFeedbackSummary] = useState("")

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-500",
    Medium: "bg-yellow-500",
    Hard: "bg-red-500",
  }

  useEffect(() => {
    const session = localStorage.getItem("aura_session")
    if (session) {
      const parsed = JSON.parse(session)
      setUserId(parsed.user?.id || null)
    }
    loadQuestions()
  }, [])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  // Call timer
  useEffect(() => {
    if (isCalling) {
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
      setCallDuration(0)
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current) }
  }, [isCalling])

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const loadQuestions = async (cat?: string, diff?: string) => {
    try {
      setLoading(true)
      const qCat = cat !== undefined ? cat : selectedCategory
      const qDiff = diff !== undefined ? diff : selectedDifficulty
      const params = new URLSearchParams()
      if (qCat && qCat !== "All") params.append("category", qCat)
      if (qDiff && qDiff !== "All") params.append("difficulty", qDiff)
      const url = `/api/interview/questions${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error("Failed to load interview questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const startMockInterview = async () => {
    const activeUserId = userId || "USR-GUESTBYPASS"
    try {
      setIsStarting(true)
      const response = await fetch("/api/interview/mock-interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          categories: [selectedCategory],
          mode: "Text",
          count: generateCount,
        }),
      })

      const data = await response.json()
      if (data.success && data.interview) {
        setMockInterview({
          id: data.interview._id,
          questions: data.interview.questions || [],
          currentQuestionIndex: 0,
          answers: [],
          score: 0,
          readinessScore: 0,
          status: "running",
        })
        setCurrentAnswer("")
        setShowResults(false)
        setActiveTab("setup")
      } else {
        throw new Error(data.message || "Failed starting interview")
      }
    } catch (error) {
      console.error("Failed to start mock interview:", error)
      alert("Failed to start mock interview.")
    } finally {
      setIsStarting(false)
    }
  }

  const handleSubmitAnswer = () => {
    if (!mockInterview) return

    const updatedAnswers = [...mockInterview.answers]
    updatedAnswers[mockInterview.currentQuestionIndex] = currentAnswer
    setCurrentAnswer("")

    const nextIndex = mockInterview.currentQuestionIndex + 1
    if (nextIndex >= mockInterview.questions.length) {
      completeMockInterview(mockInterview.id, updatedAnswers)
    } else {
      setMockInterview({
        ...mockInterview,
        answers: updatedAnswers,
        currentQuestionIndex: nextIndex,
      })
    }
  }

  const completeMockInterview = async (interviewId: string, answers: string[]) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/interview/mock-interviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockInterviewId: interviewId, answers }),
      })

      const data = await response.json()
      if (data.success && data.interview) {
        const score = data.interview.score || 75
        const readiness = data.interview.readinessScore || 80

        setMockInterview((prev) =>
          prev
            ? {
                ...prev,
                answers,
                score,
                readinessScore: readiness,
                status: "completed",
              }
            : null
        )

        setCommScore(Math.min(100, Math.max(50, data.interview.communicationScore || score + Math.floor(Math.random() * 8 - 4))))
        setTechScore(Math.min(100, Math.max(50, data.interview.technicalAccuracyScore || score + Math.floor(Math.random() * 8 - 4))))
        setSolveScore(Math.min(100, Math.max(50, data.interview.problemSolvingScore || score + Math.floor(Math.random() * 8 - 4))))
        setFeedbackSummary(data.interview.feedback || "You communicated well. Ensure that code segments are backed up by time complexity analyses.")
        setShowResults(true)
      }
    } catch (error) {
      console.error("Failed to complete mock interview:", error)
      alert("Error evaluating answers. Finishing interview.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetInterview = () => {
    setMockInterview(null)
    setCurrentAnswer("")
    setShowResults(false)
  }

  // ─── AI Coach Chat (Google Gemini) ──────────────────────────────────────────
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setChatInput("")
    setIsChatLoading(true)

    try {
      // Build conversation history for OpenAI (exclude system messages, convert roles)
      const history = chatMessages
        .filter(m => m.role === "ai" || m.role === "user")
        .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }))

      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: userMessage }],
          category: selectedCategory,
          difficulty: selectedDifficulty,
        }),
      })

      const data = await response.json()
      if (data.success && data.reply) {
        setChatMessages(prev => [...prev, { role: "ai", content: data.reply }])
      } else {
        setChatMessages(prev => [...prev, { role: "ai", content: "I apologize, I had trouble responding. Please try again." }])
      }
    } catch (err) {
      console.error("Chat error:", err)
      setChatMessages(prev => [...prev, { role: "ai", content: "Connection error. Please check your network and try again." }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // ─── Voice Call (Google Gemini + Browser SpeechRecognition + TTS) ─────────────
  const startVoiceCall = async () => {
    setIsCalling(true)
    setIsListening(false)
    setIsAiSpeaking(false)
    setVoiceConvHistory([])
    setVoiceTranscript("")
    setVoiceError("")
    setVoiceInputText("")

    // Tailored high-probability starter question
    const starter = HIGH_PROBABILITY_STARTERS[selectedCategory] || 
      `Hello! I'm your AI Technical Interviewer. Let's do a live mock interview for ${selectedCategory} at ${selectedDifficulty} level. Are you ready to begin?`
    
    setAiVoiceResponse(starter)
    setVoiceConvHistory([{ role: "assistant", content: starter }])
    speakText(starter)
  }

  const endVoiceCall = () => {
    setIsCalling(false)
    setIsListening(false)
    setIsAiSpeaking(false)
    setVoiceTranscript("")
    setAiVoiceResponse("")
    setVoiceConvHistory([])
    setVoiceError("")
    setVoiceInputText("")
    // Stop any ongoing speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
  }

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    // Pick a good English voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => {
      setIsAiSpeaking(true)
    }

    utterance.onend = () => {
      setIsAiSpeaking(false)
      // Auto-listen when AI finishes asking the question
      if (autoListenRef.current && isCallingRef.current) {
        startListening()
      }
    }

    utterance.onerror = () => {
      setIsAiSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser. Please use Chrome or type your answer below.")
      return
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }

    setVoiceError("")
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceTranscript("")
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ""
      setIsListening(false)
      recognitionRef.current = null

      if (transcript.trim()) {
        setVoiceTranscript(transcript)
        await sendVoiceMessage(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition event:", event.error)
      setIsListening(false)
      recognitionRef.current = null
      if (event.error === "no-speech") {
        setVoiceError("")
      } else if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied. You can type your answers below or allow microphone access in browser settings.")
      } else if (event.error === "audio-capture") {
        setVoiceError("No microphone found. You can type your answers below.")
      } else if (event.error === "network") {
        setVoiceError("Network issue with speech service. You can type your answers below.")
      } else {
        setVoiceError(`Speech recognition error: ${event.error}. You can type below.`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (e) {
      console.warn("Could not start recognition:", e)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  const toggleMic = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleSendVoiceTextInput = async () => {
    if (!voiceInputText.trim() || isAiThinking) return
    const text = voiceInputText.trim()
    setVoiceInputText("")
    stopListening()
    setVoiceTranscript(text)
    await sendVoiceMessage(text)
  }

  const sendVoiceMessage = async (transcript: string) => {
    setIsAiThinking(true)
    setAiVoiceResponse("")

    const updatedHistory: VoiceConvMessage[] = [...voiceConvHistory, { role: "user", content: transcript }]
    setVoiceConvHistory(updatedHistory)

    try {
      const response = await fetch("/api/interview/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          conversationHistory: voiceConvHistory,
          category: selectedCategory,
          difficulty: selectedDifficulty,
        }),
      })

      const data = await response.json()
      const aiReply = data.success && data.response
        ? data.response
        : "Interesting perspective. Can you elaborate on that?"

      setAiVoiceResponse(aiReply)
      setVoiceConvHistory([...updatedHistory, { role: "assistant", content: aiReply }])
      speakText(aiReply)
    } catch (err) {
      console.error("Voice API error:", err)
      const fallback = "I see. Could you elaborate on that approach?"
      setAiVoiceResponse(fallback)
      speakText(fallback)
    } finally {
      setIsAiThinking(false)
    }
  }

  // Generate more questions
  const handleGenerateQuestions = async () => {
    try {
      if (personalize && userId) {
        const generated: any[] = []
        for (let i = 0; i < generateCount; i++) {
          const r = await fetch('/api/ai/interview-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              category: selectedCategory,
              difficulty: selectedDifficulty,
              prompt: `Generate a ${selectedDifficulty} difficulty interview question for ${selectedCategory}.`
            })
          })
          const d = await r.json()
          if (d.success && d.result?.question) {
            generated.push({
              _id: `ai-${Date.now()}-${i}`,
              prompt: d.result.question,
              category: selectedCategory,
              difficulty: selectedDifficulty
            })
          }
        }
        if (generated.length) setQuestions(prev => [...generated, ...prev])
      } else {
        const res = await fetch(`/api/interview/questions?category=${encodeURIComponent(selectedCategory)}&difficulty=${encodeURIComponent(selectedDifficulty)}&count=${generateCount}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.questions)) setQuestions(data.questions)
      }
    } catch (err) {
      console.error('Generate failed', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground font-bold">Loading interview engine...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Navigation Tabs */}
      {!mockInterview && (
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mb-6 border-b pb-4 overflow-x-auto">
          <Button
            variant={activeTab === "setup" ? "default" : "outline"}
            className={`font-bold flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3 sm:px-4 ${activeTab === "setup" ? "bg-indigo-500 text-white" : ""}`}
            onClick={() => setActiveTab("setup")}
          >
            <Users className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">Standard Assessment</span>
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            className={`font-bold flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3 sm:px-4 ${activeTab === "chat" ? "bg-purple-500 text-white" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">AI Coach Chat</span>
          </Button>
          <Button
            variant={activeTab === "voice" ? "default" : "outline"}
            className={`font-bold flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3 sm:px-4 ${activeTab === "voice" ? "bg-green-500 text-white" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            <PhoneCall className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">Live Voice Call</span>
          </Button>
        </div>
      )}

      {/* --- STANDARD ASSESSMENT (Text Mock Interview) --- */}
      {(activeTab === "setup" || mockInterview) && (
        <>
          {mockInterview && mockInterview.status === "running" ? (
            <Card className="border-2 border-indigo-500/20 bg-indigo-500/5 shadow-2xl">
              <CardHeader className="border-b border-indigo-500/10 bg-indigo-500/5">
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-black text-indigo-500">
                    <Users className="w-5 h-5" /> Live Assessment
                  </CardTitle>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Question {mockInterview.currentQuestionIndex + 1} / {mockInterview.questions.length}
                  </span>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${((mockInterview.currentQuestionIndex + 1) / mockInterview.questions.length) * 100}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {mockInterview.questions[mockInterview.currentQuestionIndex] ? (
                  <>
                    <div className="space-y-2">
                      <Badge className="bg-indigo-500 text-white border-none">{mockInterview.questions[mockInterview.currentQuestionIndex].category}</Badge>
                      <h2 className="text-xl md:text-2xl font-black leading-snug">{mockInterview.questions[mockInterview.currentQuestionIndex].prompt}</h2>
                    </div>
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your explanation or pseudocode answer here..."
                      className="h-64 resize-none border-2 p-4 leading-relaxed font-mono"
                      disabled={isSubmitting}
                    />
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSubmitAnswer} disabled={isSubmitting || !currentAnswer.trim()} size="lg" className="flex-1 h-12 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                        {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                        {mockInterview.currentQuestionIndex === mockInterview.questions.length - 1 ? "Submit & Evaluate with AI" : "Next Question"}
                      </Button>
                      <Button onClick={resetInterview} variant="outline" size="lg" className="h-12 border-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        End Early
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-muted-foreground font-bold">Error loading question. Please skip.</div>
                )}
              </CardContent>
            </Card>
          ) : showResults && mockInterview ? (
            <Card className="border-4 border-indigo-500 shadow-2xl overflow-hidden animate-in zoom-in duration-500">
              <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-center">AI Evaluation Complete</CardTitle>
                <p className="text-center text-muted-foreground font-medium mt-1">Powered by Google Gemini</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/40 border-2 p-5 rounded-2xl flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Technical Score</p>
                    <p className="text-6xl font-black text-indigo-500">{mockInterview.score}</p>
                  </div>
                  <div className="bg-muted/40 border-2 p-5 rounded-2xl flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Job Readiness</p>
                    <p className="text-6xl font-black text-green-500">{mockInterview.readinessScore}%</p>
                  </div>
                </div>
                {feedbackSummary && (
                  <Card className="border-2 border-indigo-500/20 bg-indigo-500/5">
                    <CardContent className="pt-5 space-y-3">
                      <h4 className="font-black text-sm uppercase tracking-wider text-indigo-500 flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Coach Feedback</h4>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">{feedbackSummary}</p>
                    </CardContent>
                  </Card>
                )}
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider mb-3 text-muted-foreground">Performance Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span className="font-bold">Communication Delivery</span>
                      <Badge className="bg-indigo-500 text-white">{commScore}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span className="font-bold">Technical Accuracy</span>
                      <Badge className="bg-emerald-500 text-white">{techScore}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <span className="font-bold">Problem Solving Strategy</span>
                      <Badge className="bg-purple-500 text-white">{solveScore}%</Badge>
                    </div>
                  </div>
                </div>
                <Button onClick={resetInterview} size="lg" className="w-full h-12 font-black bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                  Back to Setup
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 border-indigo-500/10 shadow-xl">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-lg font-black text-indigo-500">Configure Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Focus Area</label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={(cat) => {
                        setSelectedCategory(cat)
                        loadQuestions(cat, selectedDifficulty)
                      }}
                    >
                      <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Difficulty</label>
                    <Select 
                      value={selectedDifficulty} 
                      onValueChange={(diff) => {
                        setSelectedDifficulty(diff)
                        loadQuestions(selectedCategory, diff)
                      }}
                    >
                      <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {difficulties.map((diff) => <SelectItem key={diff} value={diff} className="font-bold">{diff.toUpperCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={startMockInterview} size="lg" className="w-full h-14 font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl" disabled={isStarting}>
                    {isStarting ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />} Begin Mock Interview
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-500/10 shadow-xl">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-lg font-black text-slate-500">Curated Question Bank</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-bold">No questions loaded.</p>
                  ) : (
                    <div className="space-y-3">
                      {questions.slice(0, 4).map((q) => (
                        <div key={q._id} className="border p-3 rounded-lg flex items-center justify-between hover:bg-muted/20 transition-all">
                          <p className="text-sm font-bold truncate max-w-[200px]">{q.prompt}</p>
                          <div className="flex gap-2">
                            <Badge className="bg-slate-500/20 text-slate-700 text-[10px]">{q.category}</Badge>
                            <Badge className={`${difficultyColors[q.difficulty]} text-white text-[10px]`}>{q.difficulty}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2 items-center">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={generateCount}
                      onChange={(e) => setGenerateCount(Number(e.target.value || 1))}
                      className="w-20 p-2 border rounded-md font-bold"
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" checked={personalize} onChange={(e) => setPersonalize(e.target.checked)} /> AI Generate
                    </label>
                    <Button onClick={handleGenerateQuestions} className="ml-auto">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* --- AI COACH CHAT (Real OpenAI) --- */}
      {activeTab === "chat" && !mockInterview && (
        <Card className="border-2 border-purple-500/20 shadow-2xl max-w-4xl mx-auto h-[600px] flex flex-col">
          <CardHeader className="bg-purple-500/10 border-b flex flex-row items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-600"><Bot className="w-6 h-6" /></div>
            <div className="flex-1">
              <CardTitle className="text-lg font-black text-purple-600">AI Career Coach</CardTitle>
              <CardDescription className="font-bold">Powered by Google Gemini — Ask anything about technical interviews, resumes, or code.</CardDescription>
            </div>
            <Badge className="bg-purple-500 text-white text-[10px] font-bold">LIVE AI</Badge>
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-6" ref={chatScrollRef}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm font-medium ${msg.role === "ai" ? "bg-muted/60 border text-foreground" : "bg-purple-600 text-white"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/60 border rounded-2xl px-5 py-3 flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-150" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t bg-muted/10">
            <div className="flex w-full gap-2 relative">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendChatMessage()}
                placeholder="Message your AI coach..."
                className="h-14 bg-background pr-16 font-medium border-2"
                disabled={isChatLoading}
              />
              <Button
                onClick={handleSendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* --- LIVE VOICE CALL (Google Gemini + Web Speech API + Text Fallback) --- */}
      {activeTab === "voice" && !mockInterview && (
        <Card className={`border-4 shadow-2xl max-w-3xl mx-auto transition-colors duration-500 ${isCalling ? "border-green-500 bg-background" : "border-slate-300 dark:border-slate-800"}`}>
          <CardHeader className="text-center py-8 space-y-4">
            <div className="mx-auto w-28 h-28 rounded-full flex items-center justify-center relative shadow-xl bg-muted border-4 border-background">
              {isCalling && (
                <>
                  <div className={`absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-25`} />
                  <div className={`absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-15 delay-300`} />
                </>
              )}
              {isAiSpeaking ? (
                <Volume2 className="w-12 h-12 text-emerald-500 animate-pulse" />
              ) : isListening ? (
                <Mic className="w-12 h-12 text-indigo-500 animate-bounce" />
              ) : (
                <PhoneCall className={`w-12 h-12 ${isCalling ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
              )}
            </div>

            <div>
              <CardTitle className="text-3xl font-black">AI Voice Interviewer</CardTitle>
              <CardDescription className="text-md mt-1 font-bold uppercase tracking-widest text-muted-foreground">
                {isCalling ? `CONNECTED • ${formatDuration(callDuration)}` : "High-Probability Mock Interview"}
              </CardDescription>

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge className="bg-emerald-600 text-white text-[11px] font-semibold">
                  {isCalling ? "LIVE SCREENING" : "Google Gemini Voice"}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-bold">
                  {selectedCategory} • {selectedDifficulty}
                </Badge>
                {isCalling && (
                  <Badge className={`text-[11px] font-bold ${isAiSpeaking ? "bg-amber-500 text-black" : isListening ? "bg-indigo-500 text-white animate-pulse" : isAiThinking ? "bg-purple-600 text-white" : "bg-muted text-foreground"}`}>
                    {isAiSpeaking ? "AI Interviewer Speaking" : isListening ? "Listening to You..." : isAiThinking ? "Evaluating Answer..." : "Ready for Response"}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-8 space-y-6">
            {/* Setup Controls (When not in call) */}
            {!isCalling && (
              <div className="bg-muted/30 border rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview Domain</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-11 font-medium bg-background">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Seniority / Level</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="h-11 font-medium bg-background">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* High Probability Topic Quick Picks */}
                <div className="space-y-1.5 text-left pt-2 border-t">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">FAANG High-Probability Quick Topics</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {HIGH_PROB_TOPICS.map((topic, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(topic.category)
                          setSelectedDifficulty(topic.difficulty)
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          selectedCategory === topic.category && selectedDifficulty === topic.difficulty
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-listen toggle */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-muted-foreground font-medium">Auto-listen when interviewer finishes question</span>
                  <button
                    type="button"
                    onClick={() => setAutoListen(!autoListen)}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${autoListen ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    {autoListen ? "Enabled" : "Manual Click"}
                  </button>
                </div>
              </div>
            )}

            {/* AI Question & Response Display */}
            <div className="min-h-28 bg-muted/20 rounded-2xl p-5 flex flex-col items-center justify-center border-2 border-dashed relative">
              {isAiThinking && (
                <div className="flex gap-2 items-center py-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  <span className="ml-2 text-sm text-muted-foreground font-semibold">AI Interviewer evaluating response...</span>
                </div>
              )}

              {!isAiThinking && isCalling && aiVoiceResponse && (
                <div className="text-center space-y-2 animate-in fade-in zoom-in w-full">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {isAiSpeaking ? "🔊 Interviewer is speaking..." : "Current Question / Feedback"}
                  </span>
                  <p className="font-semibold text-foreground text-lg leading-relaxed">{aiVoiceResponse}</p>
                </div>
              )}

              {!isCalling && (
                <div className="text-center py-2 space-y-1">
                  <p className="font-semibold text-base text-foreground">Select your topic above & press the green button to call</p>
                  <p className="text-xs text-muted-foreground">Simulates a high-stakes FAANG technical interview with real-time audio evaluation.</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {voiceError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold">{voiceError}</span>
              </div>
            )}

            {/* Active Voice Controls */}
            <div className="flex justify-center items-center gap-6">
              {isCalling && (
                <Button
                  onClick={toggleMic}
                  variant={isListening ? "default" : "outline"}
                  size="lg"
                  className={`w-20 h-20 rounded-full shadow-xl transition-all ${
                    isListening
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse ring-4 ring-indigo-300"
                      : "border-2 border-indigo-400/50 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  }`}
                  disabled={isAiThinking}
                  title={isListening ? "Mute Microphone" : "Unmute / Speak"}
                >
                  {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8 text-indigo-500" />}
                </Button>
              )}

              <Button
                onClick={isCalling ? endVoiceCall : startVoiceCall}
                size="lg"
                className={`w-20 h-20 rounded-full shadow-xl transition-all ${
                  isCalling
                    ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-300 hover:scale-105"
                }`}
                title={isCalling ? "End Mock Interview Call" : "Start Mock Interview Call"}
              >
                {isCalling ? <PhoneOff className="w-8 h-8" /> : <PhoneCall className="w-8 h-8" />}
              </Button>
            </div>

            {isListening && (
              <p className="text-center text-sm font-bold text-indigo-500 animate-pulse">
                🎤 Listening... Speak your technical explanation now
              </p>
            )}

            {/* In-Call Text Input Fallback (for noisy environments or mobile browsers) */}
            {isCalling && (
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <Input
                    value={voiceInputText}
                    onChange={(e) => setVoiceInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendVoiceTextInput()}
                    placeholder="Type your response here if in a noisy room..."
                    disabled={isAiThinking}
                    className="h-11 font-medium bg-background border-2"
                  />
                  <Button
                    onClick={handleSendVoiceTextInput}
                    disabled={isAiThinking || !voiceInputText.trim()}
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-1" /> Send
                  </Button>
                </div>

                {/* Quick Assistance Chips during interview */}
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceInputText("Could you please repeat or clarify the question?")
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full border bg-muted/40 hover:bg-muted text-muted-foreground"
                  >
                    Repeat Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceInputText("Could you provide a small hint or clarify the constraints?")
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full border bg-muted/40 hover:bg-muted text-muted-foreground"
                  >
                    Request Hint
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceInputText("Let's analyze the time and space complexity first.")
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full border bg-muted/40 hover:bg-muted text-muted-foreground"
                  >
                    Discuss Big-O
                  </button>
                </div>
              </div>
            )}

            {/* User transcript badge */}
            {voiceTranscript && !isListening && (
              <div className="bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20 text-center text-indigo-700 dark:text-indigo-300 font-medium text-sm">
                <span className="text-[10px] text-muted-foreground block mb-0.5 uppercase tracking-wider font-bold">Your Last Answer:</span>
                "{voiceTranscript}"
              </div>
            )}

            {/* Conversation Log */}
            {isCalling && voiceConvHistory.length > 1 && (
              <div className="border rounded-xl overflow-hidden text-left">
                <div className="bg-muted/40 px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview Transcript Log</span>
                  <span className="text-[11px] text-muted-foreground">{voiceConvHistory.length} turns</span>
                </div>
                <div className="max-h-48 overflow-y-auto p-3 space-y-2.5">
                  {voiceConvHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2.5 rounded-xl ${
                        msg.role === "user"
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ml-6"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 mr-6"
                      }`}
                    >
                      <span className="font-bold block mb-1">
                        {msg.role === "user" ? "Candidate (You)" : "AI Interviewer"}
                      </span>
                      {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isCalling && (
              <p className="text-center text-xs text-muted-foreground font-medium pt-2">
                Supported on Chrome, Edge, Safari & Mobile • Speech Recognition + Google Gemini + Live Audio & Text
              </p>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  )
}
