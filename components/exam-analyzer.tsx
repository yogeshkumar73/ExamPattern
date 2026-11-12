"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  FileText, 
  Brain, 
  Sparkles, 
  Settings2, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight, 
  Gauge, 
  ListOrdered, 
  FileSearch, 
  Info, 
  History, 
  BookOpen, 
  Layers, 
  Zap, 
  GraduationCap, 
  FileCode, 
  ShieldAlert, 
  X,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  ShieldCheck,
  TrendingUp,
  Printer,
  FileCheck
} from "lucide-react"
import FileUpload from "@/components/file-upload"
import TopicAnalysis, { TopicItem } from "@/components/topic-analysis"
import QuestionPredictor from "@/components/question-predictor"
import { UserOnboarding, AdminPanel, PaperRepository, PolicySection, CommunityChat, FeedbackSection, WhatsAppCommunity } from "./admin-community"
import { StudentProfile } from "@/components/student-profile"
import { DeveloperSection } from "@/components/developer-section"
import { SmartLab } from "@/components/smart-lab"
import { GuiderAgent } from "@/components/guider-agent"
import { BattleArena } from "@/components/battle-arena/battle-arena"
import { StudentArenaRequest } from "@/components/student-arena-request"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useNav } from "@/hooks/use-nav"

export type HistoricalPaperItem = {
  id: string
  name: string
  academicYear: number
  text: string
  charCount: number
}

export type ExtractedQuestionItem = {
  id: string
  questionNumber: string
  academicYear: number
  marks: number
  questionText: string
  questionType: "mcq" | "short" | "long" | "written"
  topicName?: string
  mappingConfidence?: number
  needsHumanReview?: boolean
}

export type AnalysisResult = {
  extractedText: string
  sampleText?: string
  topics: TopicItem[]
  patterns: Array<{ pattern: string; description: string }>
  predictedQuestions: {
    mcq: Array<{ 
      question: string
      options: string[]
      correctAnswer: string
      explanation?: string
      difficulty?: string
      disclaimer?: string
      sourceEvidence?: string[]
    }>
    written: Array<{ 
      question: string
      marks: number
      difficulty: string
      modelAnswer?: string
      rubricChecks?: Array<{ criterion: string; result: boolean }>
      referenceSources?: string[]
      verificationStatus?: string
      disclaimer?: string
      sourceEvidence?: string[]
    }>
  }
  report?: any
  engine?: string
}

export default function ExamAnalyzer() {
  const { currentStep, setStep, isRegistered, sessionUser, isAdmin } = useNav()
  const [syllabusText, setSyllabusText] = useState<string>("")
  const [papers, setPapers] = useState<HistoricalPaperItem[]>([])
  const [activePaperYear, setActivePaperYear] = useState<number>(2025)
  const [activePaperName, setActivePaperName] = useState<string>("End Semester Exam 2025")
  const [requirements, setRequirements] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Input Controls
  const [targetYear, setTargetYear] = useState<number>(2026)
  const [difficulty, setDifficulty] = useState("Standard")
  const [paperFormat, setPaperFormat] = useState("Academic Standard")
  const [questionCount, setQuestionCount] = useState(6)
  const [outputTypes, setOutputTypes] = useState<string[]>([])
  const [hybridMode, setHybridMode] = useState(true)

  // Direct paste states for two boxes
  const [syllabusInputMode, setSyllabusInputMode] = useState<"upload" | "paste">("upload")
  const [paperInputMode, setPaperInputMode] = useState<"upload" | "paste">("upload")
  const [manualPaperText, setManualPaperText] = useState<string>("")
  const [manualPaperName, setManualPaperName] = useState<string>("Historical Paper")

  // Step 3 Subtab
  const [resultsTab, setResultsTab] = useState<"topics" | "predictions" | "report">("topics")

  // Session Persistence with multi-user isolation
  const userKey = sessionUser?.id || "guest"

  useEffect(() => {
    try {
      const savedSyllabus = localStorage.getItem(`aura_syllabus_${userKey}`) || localStorage.getItem("aura_syllabus")
      const savedPapers = localStorage.getItem(`aura_papers_${userKey}`)
      const savedOldPaper = localStorage.getItem(`aura_old_paper_${userKey}`) || localStorage.getItem("aura_old_paper")
      const savedResult = localStorage.getItem(`aura_result_${userKey}`) || localStorage.getItem("aura_result")
      
      if (savedSyllabus) setSyllabusText(savedSyllabus)
      else setSyllabusText("")

      if (savedPapers) {
        setPapers(JSON.parse(savedPapers))
      } else if (savedOldPaper) {
        setPapers([{
          id: "p_init_1",
          name: "Historical Paper 2025",
          academicYear: 2025,
          text: savedOldPaper,
          charCount: savedOldPaper.length
        }])
      }

      if (savedResult) setAnalysisResult(JSON.parse(savedResult))
      else setAnalysisResult(null)
    } catch (e) {
      console.error("Failed to load session:", e)
    }
  }, [userKey])

  useEffect(() => {
    if (syllabusText) {
      localStorage.setItem(`aura_syllabus_${userKey}`, syllabusText)
    }
    if (papers.length > 0) {
      localStorage.setItem(`aura_papers_${userKey}`, JSON.stringify(papers))
      localStorage.setItem(`aura_old_paper_${userKey}`, papers[0]?.text || "")
    }
    if (analysisResult) {
      localStorage.setItem(`aura_result_${userKey}`, JSON.stringify(analysisResult))
    }
  }, [syllabusText, papers, analysisResult, userKey])

  const clearSession = () => {
    localStorage.removeItem(`aura_syllabus_${userKey}`)
    localStorage.removeItem(`aura_papers_${userKey}`)
    localStorage.removeItem(`aura_old_paper_${userKey}`)
    localStorage.removeItem(`aura_result_${userKey}`)
    localStorage.removeItem("aura_syllabus")
    localStorage.removeItem("aura_old_paper")
    localStorage.removeItem("aura_result")
    setSyllabusText("")
    setPapers([])
    setAnalysisResult(null)
    setStep("upload")
  }

  // --- RENDER ROUTING WITH AUTHORIZATION ---
  if (currentStep === "onboarding") return <UserOnboarding />

  // Intercept unauthenticated guest users attempting to access any service before login
  if (!isRegistered && !sessionUser && currentStep !== "policy") {
    return <UserOnboarding />
  }
  if (currentStep === "setup") {
    return <StudentProfile initialTab="academic" />
  }
  if (currentStep === "admin") {
    if (!isAdmin) return <StudentProfile />
    return <AdminPanel />
  }
  if (currentStep === "community") return <PaperRepository />
  if (currentStep === "policy") return <PolicySection />
  if (currentStep === "chat") return <CommunityChat />
  if (currentStep === "profile") {
    if (!isRegistered && !sessionUser) return <UserOnboarding />
    return <StudentProfile />
  }
  if (currentStep === "developer") return <DeveloperSection />
  if (currentStep === "lab") return <SmartLab />
  if (currentStep === "guider") return <GuiderAgent />
  if (currentStep === "feedback") return <FeedbackSection />
  if (currentStep === "community-join") return <WhatsAppCommunity />
  if (currentStep === "arena") {
    const isArenaAdmin = isAdmin || sessionUser?.role === "admin"
    const isSuspended = sessionUser?.status === "Suspended" || sessionUser?.arenaApprovalStatus === "suspended"
    const isRejected = sessionUser?.arenaApprovalStatus === "rejected"
    
    if (isArenaAdmin) {
      return <BattleArena userId={sessionUser?.id || null} userEmail={sessionUser?.email || null} isAdmin={true} />
    }
    if (isSuspended || isRejected) {
      return <StudentArenaRequest />
    }
    return <BattleArena userId={sessionUser?.id || null} userEmail={sessionUser?.email || null} isAdmin={false} />
  }

  const toggleOutputType = (type: string) => {
    setOutputTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  // Zero-dependency client-side text extractor for browser (works offline and on Netlify)
  const extractClientSideText = async (file: File): Promise<string> => {
    try {
      // 1. Direct text file reading
      const direct = await file.text().catch(() => "")
      if (direct && direct.trim().length > 20 && !direct.includes("\0")) {
        return direct.trim()
      }

      // 2. Client-side PDF stream extractor
      const arrayBuf = await file.arrayBuffer().catch(() => null)
      if (arrayBuf) {
        const bytes = new Uint8Array(arrayBuf)
        let raw = ""
        const chunkSize = 8192
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const slice = bytes.subarray(i, i + chunkSize)
          let chunkStr = ""
          for (let j = 0; j < slice.length; j++) {
            chunkStr += String.fromCharCode(slice[j])
          }
          raw += chunkStr
        }

        const textPieces: string[] = []
        const btRegex = /BT[\s\S]*?ET/g
        const matches = raw.match(btRegex)

        if (matches && matches.length > 0) {
          for (const block of matches) {
            const strRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g
            let match
            while ((match = strRegex.exec(block)) !== null) {
              textPieces.push(match[1])
            }
            const hexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g
            while ((match = hexRegex.exec(block)) !== null) {
              const hex = match[1]
              let str = ""
              for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
              }
              textPieces.push(str)
            }
          }
        }

        if (textPieces.length > 0) {
          const joined = textPieces.join(" ").replace(/\\([()\\])/g, "$1").trim()
          if (joined.length > 30) return joined
        }

        // ASCII word scanner fallback
        const printable = raw.replace(/[^\x20-\x7E\r\n\t]/g, " ")
        const words = printable
          .split(/\s+/)
          .filter((w) => w.length > 2 && !w.startsWith("/") && !w.includes("obj") && !w.includes("endobj") && !w.includes("stream"))

        if (words.length > 15) {
          return words.join(" ").slice(0, 50000)
        }
      }
    } catch (_) {}
    return ""
  }

  const handleSyllabusUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    try {
      const fName = (file.name || "").toLowerCase()
      const fType = (file.type || "").toLowerCase()
      let extracted = ""

      // 1. Direct text reading for standard text/markdown files (instant & offline)
      if (
        fType.startsWith("text/") ||
        /\.(txt|md|markdown|json|csv|rtf|log|tex|py|js|ts|html)$/i.test(fName)
      ) {
        extracted = await file.text().catch(() => "")
      }

      // 2. If not yet extracted, attempt serverless API with graceful client fallback
      if (!extracted || extracted.trim().length === 0) {
        try {
          const formData = new FormData()
          formData.append("file", file)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 12000)

          const response = await fetch("/api/extract-text", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json().catch(() => null)
            if (data?.text && data.text.trim().length > 0) {
              extracted = data.text.trim()
            }
          }
        } catch (serverlessErr) {
          console.warn("[Serverless extraction unavailable, using client extractor]:", serverlessErr)
        }
      }

      // 3. Client-side browser fallback (handles Netlify serverless deployment errors)
      if (!extracted || extracted.trim().length === 0) {
        extracted = await extractClientSideText(file)
      }

      if (extracted && extracted.trim().length > 0) {
        setSyllabusText(extracted)
        setError(null)
      } else {
        setError(
          "Could not automatically extract readable text from this file. Please paste your syllabus text in the 'Paste Text' tab, or upload a TXT/PDF file."
        )
      }
    } catch (err: any) {
      console.error("[Syllabus Upload Error]:", err)
      const msg = err?.message === "Failed to fetch"
        ? "Network error connecting to extraction service. Please paste your syllabus text in the 'Paste Text' tab."
        : (err?.message || "Failed to process syllabus file. Please try pasting the text directly.")
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHistoricalPaperUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    try {
      const fName = (file.name || "").toLowerCase()
      const fType = (file.type || "").toLowerCase()
      let paperText = ""

      // 1. Direct text reading
      if (
        fType.startsWith("text/") ||
        /\.(txt|md|markdown|json|csv|rtf|log|tex|py|js|ts|html)$/i.test(fName)
      ) {
        paperText = await file.text().catch(() => "")
      }

      // 2. Serverless extraction with timeout
      if (!paperText || paperText.trim().length === 0) {
        try {
          const formData = new FormData()
          formData.append("file", file)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 12000)

          const response = await fetch("/api/extract-text", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json().catch(() => null)
            if (data?.text && data.text.trim().length > 0) {
              paperText = data.text.trim()
            }
          }
        } catch (serverlessErr) {
          console.warn("[Serverless extraction unavailable, using client extractor]:", serverlessErr)
        }
      }

      // 3. Client-side browser fallback
      if (!paperText || paperText.trim().length === 0) {
        paperText = await extractClientSideText(file)
      }

      if (paperText && paperText.trim().length > 0) {
        const newPaper: HistoricalPaperItem = {
          id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          academicYear: activePaperYear,
          text: paperText,
          charCount: paperText.length,
        }
        setPapers(prev => [...prev, newPaper])
        setError(null)
      } else {
        setError("Could not automatically extract text from this past paper. Please use the 'Paste Paper' tab to paste its questions directly.")
      }
    } catch (err: any) {
      console.error("[Historical Paper Upload Error]:", err)
      const msg = err?.message === "Failed to fetch"
        ? "Network error connecting to extraction service. Please paste the paper text directly."
        : (err?.message || "Failed to process historical paper.")
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const removePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id))
  }

  const handleAddManualPaper = () => {
    if (!manualPaperText.trim()) return
    const newPaper: HistoricalPaperItem = {
      id: `p_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: manualPaperName.trim() || `Historical Paper ${activePaperYear}`,
      academicYear: activePaperYear,
      text: manualPaperText.trim(),
      charCount: manualPaperText.trim().length,
    }
    setPapers(prev => [...prev, newPaper])
    setManualPaperText("")
  }

  const handleAnalyze = async () => {
    if (!syllabusText.trim()) {
      setError("Please provide official syllabus content before proceeding.")
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/analyze-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: syllabusText,
          papers: papers.map(p => ({
            id: p.id,
            paperName: p.name,
            academicYear: p.academicYear,
            text: p.text
          })),
          sampleText: papers[0]?.text || "",
          requirements,
          options: { 
            targetYear,
            difficulty, 
            paperFormat,
            questionCount, 
            outputTypes,
            hybridMode 
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Analysis service temporarily busy. Please retry." }))
        throw new Error(errorData.error || "Analysis pipeline execution failed.")
      }

      const data = await response.json()
      setAnalysisResult(data)
      setStep("predict")
    } catch (err: any) {
      const errMsg = err?.message === "Failed to fetch"
        ? "Network connection issue or analysis service offline. Please check your connection and retry."
        : (err?.message || "An unexpected error occurred during pattern analysis.")
      setError(errMsg)
      console.error("Analysis Error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pt-10 pb-8 sm:pt-14 sm:pb-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Banner */}
      <div className="flex flex-col items-center text-center mb-8 sm:mb-12 relative pt-2">
        <div className="w-full flex justify-end sm:absolute sm:right-0 sm:top-0 mb-3 sm:mb-0">
          <Button variant="ghost" size="sm" onClick={clearSession} className="text-muted-foreground hover:text-destructive text-xs sm:text-sm">
            <X className="w-4 h-4 mr-1 sm:mr-2" /> Reset Session
          </Button>
        </div>
        <Badge variant="outline" className="mb-4 px-3 sm:px-4 py-1.5 text-xs sm:text-sm border-primary/30 bg-primary/10 text-primary flex items-center gap-2 shadow-sm">
          <GraduationCap className="w-4 h-4" /> Exam Pattern Analyzer • Blueprint Engine
        </Badge>
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-blue-600">
          Aura Study Logic
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-medium">
          Multivariable statistical pattern analysis using syllabus units, historical paper frequencies, marks distribution, and recency trends.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}
      </div>

      <Tabs value={["upload", "analyze", "predict"].includes(currentStep) ? currentStep : "upload"} onValueChange={(val) => setStep(val as any)} className="w-full">
        {/* Navigation Tabs Header */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 p-1 h-12 sm:h-16 bg-muted/30 backdrop-blur-md rounded-xl sm:rounded-2xl border shadow-2xl">
            <TabsTrigger value="upload" className="rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-3">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="truncate">1. Input Syllabus & Paper</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" disabled={!syllabusText} className="rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="truncate">2. Compare & Configure</span>
            </TabsTrigger>
            <TabsTrigger value="predict" disabled={!analysisResult} className="rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="truncate">3. Practice Predictions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── STEP 1: INPUT DATA (Syllabus & Historical Papers) ────────────────── */}
        <TabsContent value="upload" className="mt-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box 1: Syllabus Card */}
            <Card className="border-2 bg-card/40 backdrop-blur shadow-2xl relative overflow-hidden group transition-all hover:border-primary/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BookOpen className="w-32 h-32" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Box 1: Official Syllabus
                  </CardTitle>
                  <div className="flex gap-1 bg-muted/40 p-1 rounded-xl border text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSyllabusInputMode("upload")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        syllabusInputMode === "upload" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyllabusInputMode("paste")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        syllabusInputMode === "paste" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>
                <CardDescription>Upload or paste course syllabus for topic and unit hierarchy extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {syllabusInputMode === "upload" ? (
                  isProcessing && !syllabusText ? (
                    <div className="py-20 flex flex-col items-center">
                      <Spinner className="w-12 h-12 mb-4 text-primary" />
                      <p className="font-bold text-primary animate-pulse">Scanning Syllabus Units...</p>
                    </div>
                  ) : (
                    <FileUpload 
                      id="syllabus-file-upload" 
                      title="Upload Course Syllabus"
                      description="Drag & drop or browse PDF, TXT, or Image"
                      onFileUpload={handleSyllabusUpload} 
                    />
                  )
                ) : (
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Paste your course syllabus here (Unit 1, Unit 2, topics, learning outcomes)..."
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      className="min-h-[220px] font-mono text-xs rounded-2xl border-2"
                    />
                  </div>
                )}

                {syllabusText && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between text-primary animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
                      <div>
                        <div className="text-sm font-bold uppercase tracking-wider">Syllabus Context Ready</div>
                        <div className="text-xs text-muted-foreground font-mono">{syllabusText.length.toLocaleString()} characters extracted</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSyllabusText("")} className="text-xs text-destructive hover:bg-destructive/10">
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Box 2: Historical Papers Card */}
            <Card className="border-2 bg-card/40 backdrop-blur shadow-2xl relative overflow-hidden group transition-all hover:border-blue-500/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <History className="w-32 h-32 text-blue-500" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
                    <History className="w-6 h-6 text-blue-500" />
                    Box 2: Past Exam Papers
                  </CardTitle>
                  <div className="flex gap-1 bg-muted/40 p-1 rounded-xl border text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPaperInputMode("upload")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        paperInputMode === "upload" ? "bg-blue-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperInputMode("paste")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        paperInputMode === "paste" ? "bg-blue-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>
                <CardDescription>Upload or paste past exam papers tagged by academic year for pattern matching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Academic Year Selector & Paper Details */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <Label className="text-xs font-bold text-muted-foreground">Exam Year:</Label>
                    <Select value={String(activePaperYear)} onValueChange={(val) => setActivePaperYear(Number(val))}>
                      <SelectTrigger className="h-8 rounded-xl border bg-background font-bold text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025 Paper</SelectItem>
                        <SelectItem value="2024">2024 Paper</SelectItem>
                        <SelectItem value="2023">2023 Paper</SelectItem>
                        <SelectItem value="2022">2022 Paper</SelectItem>
                        <SelectItem value="2021">2021 Paper</SelectItem>
                        <SelectItem value="2020">2020 Paper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Paper Name (e.g. Midterm / Final)"
                      value={manualPaperName}
                      onChange={(e) => setManualPaperName(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {paperInputMode === "upload" ? (
                  isProcessing && papers.length === 0 ? (
                    <div className="py-20 flex flex-col items-center">
                      <Spinner className="w-12 h-12 mb-4 text-blue-500" />
                      <p className="font-bold text-blue-500 animate-pulse">Extracting Paper Text...</p>
                    </div>
                  ) : (
                    <FileUpload 
                      id="historical-paper-file-upload" 
                      title="Upload Past Exam Paper"
                      description="Drag & drop or browse PDF, TXT, or Image"
                      onFileUpload={handleHistoricalPaperUpload} 
                    />
                  )
                ) : (
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Paste past exam paper questions, sections, or marks breakdown here..."
                      value={manualPaperText}
                      onChange={(e) => setManualPaperText(e.target.value)}
                      className="min-h-[160px] font-mono text-xs rounded-2xl border-2"
                    />
                    <Button 
                      onClick={handleAddManualPaper}
                      disabled={!manualPaperText.trim()}
                      size="sm"
                      className="w-full rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add Past Paper to Pattern Context
                    </Button>
                  </div>
                )}

                {/* Uploaded Papers List */}
                {papers.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Loaded Past Exam Papers ({papers.length}):</span>
                      <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/30">
                        {papers.reduce((sum, p) => sum + p.charCount, 0).toLocaleString()} chars total
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {papers.map((p) => (
                        <div key={p.id} className="p-3 rounded-2xl bg-muted/30 border flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Badge className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md flex-shrink-0">
                              {p.academicYear}
                            </Badge>
                            <span className="font-bold truncate">{p.name}</span>
                            <span className="text-muted-foreground font-mono text-[10px] flex-shrink-0">({p.charCount.toLocaleString()} chars)</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePaper(p.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => setStep("analyze")} 
              disabled={!syllabusText}
              className="h-14 sm:h-16 px-8 sm:px-16 rounded-2xl shadow-2xl shadow-primary/30 gap-3 text-base sm:text-xl font-black bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-transform"
            >
              Compare Syllabus & Paper <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </TabsContent>

        {/* ── STEP 2: REVIEW, COMPARE & CONFIGURE ─────────────────────────────── */}
        <TabsContent value="analyze" className="mt-0 space-y-8">
          {/* Comparative Alignment Banner */}
          <Card className="border-2 border-primary/20 bg-muted/20 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="bg-primary/5 border-b p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">Multivariable Analysis Engine</div>
                  <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Syllabus & Past Paper Comparison
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 px-3 py-1 font-bold text-xs">
                    ✓ Syllabus Ready ({syllabusText.length.toLocaleString()} chars)
                  </Badge>
                  <Badge variant="outline" className={`px-3 py-1 font-bold text-xs ${
                    papers.length > 0 
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/30" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  }`}>
                    {papers.length > 0 ? `✓ ${papers.length} Past Paper(s) Loaded` : "⚠️ Past Paper Optional"}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs pt-1">
                Inspect and compare both inputs side-by-side. Check your desired practice suites and create the pattern blueprint.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Side-by-Side Comparison of Syllabus & Past Paper */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Official Syllabus Column */}
                <Card className="shadow-lg border-2 border-primary/20 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-primary/5 p-4 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-sm text-primary">
                      <BookOpen className="w-4 h-4" /> Official Syllabus
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {syllabusText.length.toLocaleString()} chars
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Editable Syllabus Content:
                    </Label>
                    <Textarea 
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      placeholder="Syllabus content (units, modules, topics)..."
                      className="min-h-[280px] font-mono text-xs leading-relaxed border-2 rounded-2xl"
                    />
                  </CardContent>
                </Card>

                {/* Historical Paper Column */}
                <Card className="shadow-lg border-2 border-blue-500/20 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-blue-500/5 p-4 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-sm text-blue-500">
                      <History className="w-4 h-4" /> Past Exam Paper Context
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {papers.length} paper(s) • {papers.reduce((sum, p) => sum + p.charCount, 0).toLocaleString()} chars
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {papers.length > 0 ? (
                      <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                        {papers.map((p) => (
                          <div key={p.id} className="p-3 rounded-2xl bg-muted/30 border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs flex items-center gap-2">
                                <Badge className="bg-blue-600 text-white font-black text-[10px]">{p.academicYear}</Badge>
                                {p.name}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removePaper(p.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <Textarea 
                              value={p.text}
                              onChange={(e) => {
                                const newText = e.target.value
                                setPapers(prev => prev.map(item => item.id === p.id ? { ...item, text: newText, charCount: newText.length } : item))
                              }}
                              className="min-h-[100px] font-mono text-xs border rounded-xl"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-medium space-y-3 text-center">
                        <div>
                          ⚠️ No past paper uploaded in Step 1.
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          You can paste past paper questions right here to compare and match patterns with your syllabus:
                        </p>
                        <Textarea 
                          placeholder="Paste past exam paper questions here..."
                          value={manualPaperText}
                          onChange={(e) => setManualPaperText(e.target.value)}
                          className="min-h-[100px] text-xs font-mono rounded-xl bg-background text-foreground"
                        />
                        <Button 
                          onClick={handleAddManualPaper} 
                          disabled={!manualPaperText.trim()}
                          size="sm" 
                          className="w-full rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Past Paper for Comparison
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Examiner Constraints */}
              <Card className="shadow-md border-2 border-primary/20 rounded-3xl overflow-hidden">
                <CardHeader className="bg-primary/5 p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" /> Specific Examiner Constraints & Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Textarea 
                    placeholder="e.g. Prioritize Unit 2 and Unit 3, include at least two 10-mark questions, emphasize architectural trade-offs..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="min-h-[70px] border rounded-xl text-xs font-medium"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Execution Console Sidebar with Clickable Checkboxes */}
            <Card className="shadow-2xl border-2 border-primary/20 bg-muted/20 sticky top-24 h-fit rounded-3xl">
              <CardHeader className="bg-primary/5 border-b p-5">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" /> Execution Console
                </CardTitle>
                <CardDescription className="text-xs">Select options and create pattern blueprint</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                {/* Target Year */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Exam Year</Label>
                  <Select value={String(targetYear)} onValueChange={(val) => setTargetYear(Number(val))}>
                    <SelectTrigger className="h-11 rounded-xl border-2 bg-background text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026">2026 Examination (Next Cycle)</SelectItem>
                      <SelectItem value="2027">2027 Examination</SelectItem>
                      <SelectItem value="2025">2025 Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Exam Format */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam Target / Style</Label>
                  <Select value={paperFormat} onValueChange={setPaperFormat}>
                    <SelectTrigger className="h-11 rounded-xl border-2 bg-background text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic Standard">Academic Standard (University)</SelectItem>
                      <SelectItem value="CBSE Board">CBSE Board Exam</SelectItem>
                      <SelectItem value="GATE">GATE Engineering Standard</SelectItem>
                      <SelectItem value="UPSC">UPSC Civil Services</SelectItem>
                      <SelectItem value="Custom">Custom Rigor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty Rigor</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-11 rounded-xl border-2 bg-background text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Foundation">Foundation (Easy)</SelectItem>
                      <SelectItem value="Standard">Standard (Medium)</SelectItem>
                      <SelectItem value="Advanced">Advanced (Hard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-bold uppercase tracking-wider text-muted-foreground">Questions to Generate</Label>
                    <Badge variant="default" className="text-xs font-black px-2.5 py-0.5 rounded-lg">{questionCount}</Badge>
                  </div>
                  <Slider value={[questionCount]} min={2} max={20} step={1} onValueChange={(val) => setQuestionCount(val[0])} />
                </div>

                {/* Output Modules Checkboxes (User chooses and clicks, no autofill) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-bold uppercase tracking-wider text-muted-foreground">Select Output Suites</Label>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {outputTypes.length === 0 ? "Choose at least 1" : `${outputTypes.length} Selected`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "mcq", label: "Objective Suite (MCQ Practice)", icon: "🎯" },
                      { id: "written", label: "Subjective Suite (Theory Practice)", icon: "📝" },
                    ].map((type) => {
                      const isChecked = outputTypes.includes(type.id)
                      return (
                        <div 
                          key={type.id} 
                          onClick={() => toggleOutputType(type.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-xs cursor-pointer select-none ${
                            isChecked ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background hover:border-primary/40"
                          }`} 
                        >
                          <div className="flex items-center gap-2.5 font-bold flex-1 pointer-events-none">
                            <span className="text-base">{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              id={`output-${type.id}`}
                              checked={isChecked} 
                              onCheckedChange={() => toggleOutputType(type.id)}
                              className="data-[state=checked]:bg-primary cursor-pointer h-5 w-5"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {outputTypes.length === 0 && (
                    <p className="text-[11px] text-amber-500 font-medium">
                      ⚠️ Please click and choose which suite(s) to generate.
                    </p>
                  )}
                </div>

                {/* Execute / Create Button */}
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isProcessing || outputTypes.length === 0}
                  className="w-full h-14 text-base font-black shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 rounded-2xl group mt-2"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2 h-5 w-5" /> COMPARING & CREATING BLUEPRINT...
                    </>
                  ) : outputTypes.length === 0 ? (
                    <>
                      <CheckSquare className="mr-2 h-5 w-5" /> SELECT SUITE(S) ABOVE
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" /> CREATE PATTERN BLUEPRINT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── STEP 3: PREDICTIONS & PATTERN DASHBOARD ─────────────────────────── */}
        <TabsContent value="predict" className="mt-0 space-y-8">
          {analysisResult && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
              {/* Executive Overview Banner */}
              <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-background to-blue-500/10 shadow-2xl relative overflow-hidden rounded-3xl">
                <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary/20 flex items-center justify-center text-primary shadow-xl border border-primary/30 flex-shrink-0">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1 flex items-center gap-2">
                        Pattern Blueprint Ready
                        <Badge className="bg-emerald-600 text-white text-xs font-black">
                          {analysisResult.engine === "fastapi-pandas-numpy" ? "Pandas + NumPy Active" : "AI Synthesized"}
                        </Badge>
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm font-semibold text-muted-foreground">
                        <span>Target: <span className="text-primary font-bold">{targetYear} ({paperFormat})</span></span>
                        <span>•</span>
                        <span>Topics Identified: <span className="text-primary font-bold">{analysisResult.topics?.length || 0}</span></span>
                        <span>•</span>
                        <span>Practice Set: <span className="text-foreground font-bold">
                          {(analysisResult.predictedQuestions?.mcq?.length || 0) + (analysisResult.predictedQuestions?.written?.length || 0)} questions
                        </span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={() => setStep("upload")} className="h-11 px-4 rounded-xl border-2 font-bold text-xs">
                      <ChevronLeft className="mr-1.5 w-4 h-4" /> Start Fresh
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setStep("analyze")} className="h-11 px-4 rounded-xl border font-bold text-xs">
                      Refine Inputs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* View Switcher Subtabs */}
              <div className="flex justify-center">
                <div className="inline-flex p-1 rounded-2xl bg-muted/30 border-2 gap-1">
                  <button
                    onClick={() => setResultsTab("topics")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
                      resultsTab === "topics" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🎯 Strategic Topic Map
                  </button>
                  <button
                    onClick={() => setResultsTab("predictions")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
                      resultsTab === "predictions" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📝 Predicted Practice Suite
                  </button>
                  <button
                    onClick={() => setResultsTab("report")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
                      resultsTab === "report" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📄 Executive Blueprint Report
                  </button>
                </div>
              </div>

              {/* View 1: Topics Map */}
              {resultsTab === "topics" && (
                <TopicAnalysis 
                  extractedText={analysisResult.extractedText} 
                  topics={analysisResult.topics} 
                  patterns={analysisResult.patterns} 
                />
              )}

              {/* View 2: Predicted Questions Suite */}
              {resultsTab === "predictions" && (
                <QuestionPredictor analysisResult={analysisResult} />
              )}

              {/* View 3: Executive Blueprint Report */}
              {resultsTab === "report" && (
                <Card className="border-2 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in duration-500">
                  <CardHeader className="bg-muted/30 border-b p-6 sm:p-8 flex flex-row items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Aura Study AI • Official Assessment</div>
                      <CardTitle className="text-2xl font-black">Executive Examination Pattern Report</CardTitle>
                      <CardDescription>Comprehensive statistical blueprint and topic hierarchy summary</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold text-xs gap-1.5 rounded-xl border-2">
                      <Printer className="w-3.5 h-3.5" /> Print Report
                    </Button>
                  </CardHeader>

                  <CardContent className="p-6 sm:p-8 space-y-8 font-sans">
                    {/* Method Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-muted/40 border">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Target Exam Year</div>
                        <div className="text-xl font-black text-primary mt-1">{targetYear}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/40 border">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Papers Analyzed</div>
                        <div className="text-xl font-black text-foreground mt-1">{papers.length || 1}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/40 border">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Topics Identified</div>
                        <div className="text-xl font-black text-foreground mt-1">{analysisResult.topics?.length || 0}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/40 border">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Scoring Formula</div>
                        <div className="text-xs font-black text-green-500 mt-2">Section 9 Weighted</div>
                      </div>
                    </div>

                    {/* Ranked Table */}
                    <div className="space-y-3">
                      <h4 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" /> Topic Priority Index Breakdown
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border-2">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/40 border-b text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                            <tr>
                              <th className="py-3 px-4">Rank</th>
                              <th className="py-3 px-4">Topic Name</th>
                              <th className="py-3 px-4">Unit</th>
                              <th className="py-3 px-4">Priority Score</th>
                              <th className="py-3 px-4">Appearances</th>
                              <th className="py-3 px-4">Primary Statistical Evidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-medium">
                            {(analysisResult.topics || []).map((t, idx) => (
                              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                <td className="py-3 px-4 font-black">#{idx + 1}</td>
                                <td className="py-3 px-4 font-bold text-foreground">{t.name}</td>
                                <td className="py-3 px-4 text-muted-foreground">{t.unit || "Core"}</td>
                                <td className="py-3 px-4">
                                  <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] px-2.5 py-0.5 border-none shadow-sm">
                                    {t.priorityScore ?? t.probabilityMatch ?? 70}/100
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 font-bold">{t.frequency} papers</td>
                                <td className="py-3 px-4 text-muted-foreground text-[11px]">
                                  {t.scoreExplanation?.[0] || "Evaluated by frequency, marks weight, and recency."}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Disclaimer Footnote */}
                    <div className="p-4 rounded-2xl bg-muted/30 border text-xs text-muted-foreground leading-relaxed">
                      <strong>Methodology & Evaluation Disclaimer:</strong> Scores are calculated using multivariable regression across historical question papers (30% appearance rate, 20% recency score, 20% marks weight, 15% trend trajectory, and 15% syllabus coverage). Priority indices do not represent guaranteed examination questions. Prepared for academic preparation and study optimization.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
