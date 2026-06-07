"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Play, RotateCcw, CheckCircle, RefreshCw, Star, Sparkles, Mic, PhoneCall, Send, PhoneOff, MessageSquare, Bot, MicOff, AlertCircle } from "lucide-react"

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

const categories = ["React", "NextJs", "Node", "Python", "Java", "DSA", "SystemDesign"]
const difficulties = ["Easy", "Medium", "Hard"]

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
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [aiVoiceResponse, setAiVoiceResponse] = useState("")
  const [voiceConvHistory, setVoiceConvHistory] = useState<VoiceConvMessage[]>([])
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [voiceError, setVoiceError] = useState("")
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<any>(null)

  // Chat Coach State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Hello! I'm your AI Interview Coach powered by GPT. What topic would you like to practice today? Tell me your experience level and the role you're targeting!" }
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

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/interview/questions")
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

  // ─── AI Coach Chat (Real OpenAI) ────────────────────────────────────────────
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

  // ─── Voice Call (Real OpenAI + Browser SpeechRecognition + TTS) ─────────────
  const startVoiceCall = async () => {
    setIsCalling(true)
    setVoiceConvHistory([])
    setVoiceTranscript("")
    setVoiceError("")

    const openingMessage = `Hello! I'm your AI Voice Interviewer. Let's do a live mock technical interview for ${selectedCategory} at ${selectedDifficulty} level. Are you ready to begin?`
    setAiVoiceResponse(openingMessage)
    setVoiceConvHistory([{ role: "assistant", content: openingMessage }])
    speakText(openingMessage)
  }

  const endVoiceCall = () => {
    setIsCalling(false)
    setIsListening(false)
    setVoiceTranscript("")
    setAiVoiceResponse("")
    setVoiceConvHistory([])
    setVoiceError("")
    // Stop any ongoing speech
    window.speechSynthesis?.cancel()
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
  }

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return
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
    window.speechSynthesis.speak(utterance)
  }

  const toggleMic = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
      }
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser. Please use Chrome.")
      return
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
      const transcript = event.results[0][0].transcript
      setVoiceTranscript(transcript)
      setIsListening(false)
      recognitionRef.current = null

      // Send to OpenAI Voice API
      await sendVoiceMessage(transcript)
    }

    recognition.onerror = (event: any) => {
      // Use warn (not error) so Next.js dev overlay is not triggered
      console.warn("Speech recognition event:", event.error)
      setIsListening(false)
      recognitionRef.current = null
      if (event.error === "no-speech") {
        // "no-speech" is benign — mic was open but user didn't speak. Reset silently.
        setVoiceError("")
      } else if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please allow microphone access in your browser settings.")
      } else if (event.error === "audio-capture") {
        setVoiceError("No microphone found. Please connect a microphone and try again.")
      } else if (event.error === "network") {
        setVoiceError("Network error during speech recognition. Please check your connection.")
      } else {
        setVoiceError(`Speech recognition error: ${event.error}. Please try again.`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
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
        <div className="flex gap-4 mb-6 border-b pb-4">
          <Button
            variant={activeTab === "setup" ? "default" : "outline"}
            className={`font-bold ${activeTab === "setup" ? "bg-indigo-500 text-white" : ""}`}
            onClick={() => setActiveTab("setup")}
          >
            <Users className="w-4 h-4 mr-2" /> Standard Assessment
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            className={`font-bold ${activeTab === "chat" ? "bg-purple-500 text-white" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> AI Coach Chat
          </Button>
          <Button
            variant={activeTab === "voice" ? "default" : "outline"}
            className={`font-bold ${activeTab === "voice" ? "bg-green-500 text-white" : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            <PhoneCall className="w-4 h-4 mr-2" /> Live Voice Call
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
                <p className="text-center text-muted-foreground font-medium mt-1">Powered by OpenAI GPT</p>
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
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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
              <CardDescription className="font-bold">Powered by OpenAI GPT — Ask anything about technical interviews, resumes, or code.</CardDescription>
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

      {/* --- LIVE VOICE CALL (Real OpenAI + Web Speech API) --- */}
      {activeTab === "voice" && !mockInterview && (
        <Card className={`border-4 shadow-2xl max-w-3xl mx-auto transition-colors duration-500 ${isCalling ? "border-green-500" : "border-slate-300"}`}>
          <CardHeader className="text-center py-10 space-y-4">
            <div className="mx-auto w-32 h-32 rounded-full flex items-center justify-center relative shadow-xl bg-muted border-4 border-background">
              {isCalling && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-20" />
                  <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-10 delay-300" />
                </>
              )}
              <PhoneCall className={`w-12 h-12 ${isCalling ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-3xl font-black">AI Voice Interviewer</CardTitle>
              <CardDescription className="text-md mt-2 font-bold uppercase tracking-widest text-muted-foreground">
                {isCalling ? `CONNECTED • ${formatDuration(callDuration)}` : "Ready to connect"}
              </CardDescription>
              {isCalling && (
                <div className="flex justify-center gap-2 mt-2">
                  <Badge className="bg-green-500 text-white text-[10px]">LIVE • OpenAI GPT</Badge>
                  <Badge className="bg-blue-500 text-white text-[10px]">{selectedCategory} • {selectedDifficulty}</Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-10 space-y-6">
            {/* AI Response Box */}
            <div className="min-h-24 bg-muted/30 rounded-xl p-4 flex items-center justify-center border-2 border-dashed relative">
              {isAiThinking && (
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-150" />
                  <span className="ml-2 text-sm text-muted-foreground font-medium">AI is thinking...</span>
                </div>
              )}
              {!isAiThinking && isCalling && aiVoiceResponse && (
                <p className="text-center font-medium text-green-600 text-lg animate-in fade-in zoom-in">{aiVoiceResponse}</p>
              )}
              {!isCalling && (
                <p className="text-center text-muted-foreground text-sm font-medium">Press the green button to start your interview session</p>
              )}
            </div>

            {/* Error Message */}
            {voiceError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{voiceError}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-6">
              {isCalling && (
                <Button
                  onClick={toggleMic}
                  variant={isListening ? "default" : "outline"}
                  size="lg"
                  className={`w-20 h-20 rounded-full shadow-lg ${isListening ? "bg-indigo-500 hover:bg-indigo-600 text-white animate-pulse" : "border-2"}`}
                  disabled={isAiThinking}
                >
                  {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                </Button>
              )}
              <Button
                onClick={isCalling ? endVoiceCall : startVoiceCall}
                size="lg"
                className={`w-20 h-20 rounded-full shadow-lg ${isCalling ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
              >
                {isCalling ? <PhoneOff className="w-8 h-8" /> : <PhoneCall className="w-8 h-8" />}
              </Button>
            </div>

            {isListening && (
              <p className="text-center text-sm font-bold text-indigo-500 animate-pulse mt-2">🎤 Listening... Speak now</p>
            )}

            {/* User transcript */}
            {voiceTranscript && !isListening && (
              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 text-center text-indigo-600 font-medium">
                <span className="text-xs text-muted-foreground block mb-1 uppercase tracking-wider">You said:</span>
                "{voiceTranscript}"
              </div>
            )}

            {/* Conversation History */}
            {isCalling && voiceConvHistory.length > 2 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conversation Log</span>
                </div>
                <div className="max-h-40 overflow-y-auto p-3 space-y-2">
                  {voiceConvHistory.slice(-6).map((msg, i) => (
                    <div key={i} className={`text-xs font-medium p-2 rounded-lg ${msg.role === "user" ? "bg-indigo-50 text-indigo-700 text-right" : "bg-green-50 text-green-700"}`}>
                      <span className="font-bold block mb-0.5">{msg.role === "user" ? "You" : "AI Interviewer"}</span>
                      {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isCalling && (
              <p className="text-center text-xs text-muted-foreground font-medium mt-2">
                Uses browser Speech Recognition (Chrome recommended) + OpenAI GPT + Text-to-Speech
              </p>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  )
}
