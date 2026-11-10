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
  const [outputTypes, setOutputTypes] = useState<string[]>(["mcq", "written"])
  const [hybridMode, setHybridMode] = useState(true)

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

  const handleSyllabusUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/extract-text", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Extraction failed")
      const data = await response.json()
      setSyllabusText(data.text)
    } catch (err: any) {
      setError("Failed to extract syllabus. Please try a different file.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHistoricalPaperUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/extract-text", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Extraction failed")
      const data = await response.json()
      
      const newPaper: HistoricalPaperItem = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        academicYear: activePaperYear,
        text: data.text,
        charCount: data.text.length
      }

      setPapers(prev => [...prev, newPaper])
    } catch (err: any) {
      setError("Failed to extract historical paper. Please verify file integrity.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const removePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id))
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
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis pipeline execution failed.")
      }

      const data = await response.json()
      setAnalysisResult(data)
      setStep("predict")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during pattern analysis.")
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

      <Tabs value={currentStep} onValueChange={(val) => setStep(val as any)} className="w-full">
        {/* Navigation Tabs Header */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 p-1 h-12 sm:h-16 bg-muted/30 backdrop-blur-md rounded-xl sm:rounded-2xl border shadow-2xl">
            <TabsTrigger value="upload" className="rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-3">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="truncate">1. Input Data</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" disabled={!syllabusText} className="rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="truncate">2. Review & Config</span>
            </TabsTrigger>
            <TabsTrigger value="predict" disabled={!analysisResult} className="rounded-lg sm:rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="truncate">3. Predictions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── STEP 1: INPUT DATA (Syllabus & Historical Papers) ────────────────── */}
        <TabsContent value="upload" className="mt-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Syllabus Card */}
            <Card className="border-2 bg-card/40 backdrop-blur shadow-2xl relative overflow-hidden group transition-all hover:border-primary/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BookOpen className="w-32 h-32" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Official Syllabus
                </CardTitle>
                <CardDescription>Upload course syllabus for topic and unit hierarchy extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProcessing && !syllabusText ? (
                  <div className="py-20 flex flex-col items-center">
                    <Spinner className="w-12 h-12 mb-4 text-primary" />
                    <p className="font-bold text-primary animate-pulse">Scanning Syllabus Units...</p>
                  </div>
                ) : (
                  <FileUpload onFileUpload={handleSyllabusUpload} />
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
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Papers Card */}
            <Card className="border-2 bg-card/40 backdrop-blur shadow-2xl relative overflow-hidden group transition-all hover:border-blue-500/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <History className="w-32 h-32 text-blue-500" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl font-bold">
                  <div className="flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-500" />
                    Historical Papers
                  </div>
                  <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-500">
                    {papers.length} Uploaded
                  </Badge>
                </CardTitle>
                <CardDescription>Upload past exam papers tagged by academic year for pattern matching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Academic Year Selector Before Upload */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Calendar className="w-4 h-4 text-blue-500" /> Academic Exam Year:
                  </div>
                  <Select value={String(activePaperYear)} onValueChange={(val) => setActivePaperYear(Number(val))}>
                    <SelectTrigger className="w-36 h-9 rounded-xl border bg-background font-bold text-xs">
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

                {isProcessing && papers.length === 0 ? (
                  <div className="py-20 flex flex-col items-center">
                    <Spinner className="w-12 h-12 mb-4 text-blue-500" />
                    <p className="font-bold text-blue-500 animate-pulse">Extracting Paper Text...</p>
                  </div>
                ) : (
                  <FileUpload onFileUpload={handleHistoricalPaperUpload} />
                )}

                {/* Uploaded Papers List */}
                {papers.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Uploaded Exam Cycles:</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {papers.map((p) => (
                        <div key={p.id} className="p-3 rounded-2xl bg-muted/30 border flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Badge className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md flex-shrink-0">
                              {p.academicYear}
                            </Badge>
                            <span className="font-bold truncate">{p.name}</span>
                            <span className="text-muted-foreground font-mono text-[10px] flex-shrink-0">({p.charCount} chars)</span>
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
              Review & Configure <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </TabsContent>

        {/* ── STEP 2: REVIEW & CONFIGURE ──────────────────────────────────────── */}
        <TabsContent value="analyze" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden rounded-3xl">
                <CardHeader className="bg-primary/5 p-5 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Editable Syllabus & Paper Inputs
                    </CardTitle>
                    <CardDescription className="text-xs">Inspect and adjust raw context before triggering multivariable analysis</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 font-bold text-xs">
                    Multi-Paper Ready ({papers.length} Papers)
                  </Badge>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Editable Syllabus */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-black uppercase tracking-wider text-primary">Editable Official Syllabus</Label>
                      <span className="text-xs text-muted-foreground font-mono">{syllabusText.length} chars</span>
                    </div>
                    <Textarea 
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      placeholder="Syllabus content (units, modules, topics)..."
                      className="min-h-[220px] font-mono text-xs leading-relaxed border-2 rounded-2xl"
                    />
                  </div>

                  {/* Historical Papers Quick Overview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-black uppercase tracking-wider text-blue-500">Historical Paper Context</Label>
                    {papers.length > 0 ? (
                      <div className="space-y-2">
                        {papers.map((p, idx) => (
                          <div key={p.id} className="p-3.5 rounded-2xl bg-muted/30 border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs flex items-center gap-2">
                                <Badge className="bg-blue-600 text-white font-black text-[10px]">{p.academicYear}</Badge>
                                {p.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">{p.text.length} chars</span>
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
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-medium">
                        ⚠️ No past paper uploaded. Analysis will be generated from core syllabus requirements. For historical pattern matching, upload at least one past paper in Step 1.
                      </div>
                    )}
                  </div>

                  {/* Examiner Constraints */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Specific Examiner Constraints / Focus Areas</Label>
                    <Textarea 
                      placeholder="e.g. Prioritize Unit 2 and Unit 3, include at least two 10-mark questions, emphasize architectural trade-offs..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="min-h-[80px] border-2 rounded-xl text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generation Console Sidebar */}
            <Card className="shadow-2xl border-2 border-primary/20 bg-muted/20 sticky top-24 h-fit rounded-3xl">
              <CardHeader className="bg-primary/5 border-b p-5">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" /> Execution Console
                </CardTitle>
                <CardDescription className="text-xs">Blueprint configuration parameters</CardDescription>
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

                {/* Output Modules */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Output Suites</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "mcq", label: "Objective Suite (MCQ)", icon: "🎯" },
                      { id: "written", label: "Subjective Suite (Theory)", icon: "📝" },
                    ].map((type) => (
                      <div 
                        key={type.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer text-xs ${
                          outputTypes.includes(type.id) ? "border-primary bg-primary/10" : "border-border bg-background"
                        }`} 
                        onClick={() => toggleOutputType(type.id)}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                        <Checkbox checked={outputTypes.includes(type.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isProcessing || outputTypes.length === 0}
                  className="w-full h-14 text-base font-black shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 rounded-2xl group mt-2"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2 h-5 w-5" /> EXECUTING PATTERN ENGINE...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" /> GENERATE PATTERN ANALYSIS
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
                                  <Badge className="bg-primary text-white font-black text-[10px]">
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
