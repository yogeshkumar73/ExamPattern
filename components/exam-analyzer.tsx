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
  X 
} from "lucide-react"
import FileUpload from "@/components/file-upload"
import TopicAnalysis from "@/components/topic-analysis"
import QuestionPredictor from "@/components/question-predictor"
import { UserOnboarding, AdminPanel, PaperRepository, PolicySection, CommunityChat } from "./admin-community"
import { StudentProfile } from "@/components/student-profile"
import { DeveloperSection } from "@/components/developer-section"
import { SmartLab } from "@/components/smart-lab"
import { GuiderAgent } from "@/components/guider-agent"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useNav } from "@/hooks/use-nav"

export type AnalysisResult = {
  extractedText: string
  sampleText?: string
  topics: Array<{ name: string; frequency: number; importance: number; probabilityMatch?: number }>
  patterns: Array<{ pattern: string; description: string }>
  predictedQuestions: {
    mcq: Array<{ question: string; options: string[]; correctAnswer: string; explanation?: string; difficulty?: string }>
    written: Array<{ question: string; marks: number; difficulty: string; modelAnswer?: string }>
  }
}

export default function ExamAnalyzer() {
  const { currentStep, setStep, isRegistered } = useNav()
  const [syllabusText, setSyllabusText] = useState<string>("")
  const [oldPaperText, setOldPaperText] = useState<string>("")
  const [requirements, setRequirements] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Input Controls
  const [difficulty, setDifficulty] = useState("Medium")
  const [paperFormat, setPaperFormat] = useState("Standard")
  const [questionCount, setQuestionCount] = useState(5)
  const [outputTypes, setOutputTypes] = useState<string[]>(["mcq", "written"])
  const [hybridMode, setHybridMode] = useState(true)

  // Session Persistence
  useEffect(() => {
    try {
      const savedSyllabus = localStorage.getItem("aura_syllabus")
      const savedOldPaper = localStorage.getItem("aura_old_paper")
      const savedResult = localStorage.getItem("aura_result")
      
      if (savedSyllabus) setSyllabusText(savedSyllabus)
      if (savedOldPaper) setOldPaperText(savedOldPaper)
      if (savedResult) setAnalysisResult(JSON.parse(savedResult))
    } catch (e) {
      console.error("Failed to load session:", e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("aura_syllabus", syllabusText)
    localStorage.setItem("aura_old_paper", oldPaperText)
    if (analysisResult) {
      localStorage.setItem("aura_result", JSON.stringify(analysisResult))
    }
  }, [syllabusText, oldPaperText, analysisResult])

  const clearSession = () => {
    localStorage.removeItem("aura_syllabus")
    localStorage.removeItem("aura_old_paper")
    localStorage.removeItem("aura_result")
    setSyllabusText("")
    setOldPaperText("")
    setAnalysisResult(null)
    setStep("upload")
  }

  // --- RENDER ROUTING ---
  if (currentStep === "onboarding") return <UserOnboarding />
  if (currentStep === "admin") return <AdminPanel />
  if (currentStep === "community") return <PaperRepository />
  if (currentStep === "policy") return <PolicySection />
  if (currentStep === "chat") return <CommunityChat />
  if (currentStep === "profile") return <StudentProfile />
  if (currentStep === "developer") return <DeveloperSection />
  if (currentStep === "lab") return <SmartLab />
  if (currentStep === "guider") return <GuiderAgent />

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

  const handleOldPaperUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/extract-text", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Extraction failed")
      const data = await response.json()
      setOldPaperText(data.text)
    } catch (err: any) {
      setError("Failed to extract paper. Please check the file format.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyze = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/analyze-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: syllabusText,
          sampleText: oldPaperText,
          requirements: requirements,
          options: { 
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
        throw new Error(errorData.error || "Generation failed")
      }

      const data = await response.json()
      setAnalysisResult(data)
      setStep("predict")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.")
      console.error("Analysis Error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center mb-12 relative">
        <div className="absolute right-0 top-0">
          <Button variant="ghost" size="sm" onClick={clearSession} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4 mr-2" /> Reset Session
          </Button>
        </div>
        <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/30 bg-primary/10 text-primary flex items-center gap-2">
          <GraduationCap className="w-4 h-4" /> Multi-User Production Engine
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-blue-600">
          Aura Study Logic
        </h1>
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-bounce flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> {error}
          </div>
        )}
      </div>

      <Tabs value={currentStep} onValueChange={(val) => setStep(val as any)} className="w-full">
        {/* ... existing TabsList ... */}
        <div className="flex justify-center mb-10">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 p-1 h-16 bg-muted/30 backdrop-blur-md rounded-2xl border shadow-2xl">
            <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-base font-semibold">
              <Layers className="w-5 h-5 mr-2" />
              1. Input Data
            </TabsTrigger>
            <TabsTrigger value="analyze" disabled={!syllabusText} className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-base font-semibold">
              <Zap className="w-5 h-5 mr-2" />
              2. Review & Config
            </TabsTrigger>
            <TabsTrigger value="predict" disabled={!analysisResult} className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-base font-semibold">
              <Sparkles className="w-5 h-5 mr-2" />
              3. Predictions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Step 1: Upload Both Papers */}
        <TabsContent value="upload" className="mt-0">
          {/* ... existing upload content ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 bg-card/40 backdrop-blur shadow-2xl relative overflow-hidden group transition-all hover:border-primary/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BookOpen className="w-32 h-32" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Official Syllabus
                </CardTitle>
                <CardDescription>Upload core syllabus for fresh context</CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing && !syllabusText ? (
                  <div className="py-20 flex flex-col items-center">
                    <Spinner className="w-12 h-12 mb-4 text-primary" />
                    <p className="font-bold text-primary animate-pulse">Scanning Syllabus...</p>
                  </div>
                ) : (
                  <FileUpload onFileUpload={handleSyllabusUpload} />
                )}
                {syllabusText && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-primary animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div className="text-sm font-bold uppercase tracking-wider">Syllabus Context Ready</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 bg-card/40 backdrop-blur shadow-2xl relative overflow-hidden group transition-all hover:border-blue-500/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <History className="w-32 h-32 text-blue-500" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <History className="w-6 h-6 text-blue-500" />
                  Historical Papers
                </CardTitle>
                <CardDescription>Upload old papers for specific pattern matching</CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing && !oldPaperText ? (
                  <div className="py-20 flex flex-col items-center">
                    <Spinner className="w-12 h-12 mb-4 text-blue-500" />
                    <p className="font-bold text-blue-500 animate-pulse">Extracting Patterns...</p>
                  </div>
                ) : (
                  <FileUpload onFileUpload={handleOldPaperUpload} />
                )}
                {oldPaperText && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-blue-500 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div className="text-sm font-bold uppercase tracking-wider">Historical Trend Data Ready</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button 
              size="lg" 
              onClick={() => setStep("analyze")} 
              disabled={!syllabusText}
              className="h-16 px-16 rounded-2xl shadow-2xl shadow-primary/30 gap-3 text-xl font-black bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-transform"
            >
              Review & Configure <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </TabsContent>

        {/* Step 2: Review & Configure */}
        <TabsContent value="analyze" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-2xl border-primary/10 overflow-hidden border-2">
                {/* ... existing format settings ... */}
                <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    Refine Analysis Inputs
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3">Multi-User Session</Badge>
                    <Switch checked={hybridMode} onCheckedChange={setHybridMode} />
                  </div>
                </div>
                <CardContent className="pt-6 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-black uppercase tracking-wider text-primary">Editable Syllabus Context</Label>
                    <Textarea 
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      placeholder="Syllabus content will appear here for manual editing..."
                      className="min-h-[250px] font-mono text-sm leading-relaxed border-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-black uppercase tracking-wider text-blue-500">Editable Historical Context</Label>
                    <Textarea 
                      value={oldPaperText}
                      onChange={(e) => setOldPaperText(e.target.value)}
                      placeholder="Historical paper content will appear here..."
                      className="min-h-[200px] font-mono text-sm leading-relaxed border-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-3">
                      <Label className="text-base font-bold flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary" /> Exam Target
                      </Label>
                      <Select value={paperFormat} onValueChange={setPaperFormat}>
                        <SelectTrigger className="h-14 rounded-xl border-2 bg-muted/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Academic Standard</SelectItem>
                          <SelectItem value="CBSE">CBSE Board</SelectItem>
                          <SelectItem value="GATE">GATE (Engineering)</SelectItem>
                          <SelectItem value="UPSC">UPSC (Civil Services)</SelectItem>
                          <SelectItem value="Custom">Custom Prompt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-bold flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-primary" /> Difficulty
                      </Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="h-14 rounded-xl border-2 bg-muted/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Foundation</SelectItem>
                          <SelectItem value="Medium">Standard</SelectItem>
                          <SelectItem value="Hard">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-bold">Specific Examiner Constraints</Label>
                    <Textarea 
                      placeholder="e.g. Include 2 long answers, emphasize Chapter 1..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="min-h-[100px] border-2 rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ... Generation Engine Controls ... */}
            <Card className="shadow-2xl border-primary/10 bg-muted/40 sticky top-24 h-fit rounded-2xl border-2 border-primary/10">
              <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="text-xl">Generation Console</CardTitle>
                <CardDescription>Final execution settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-bold text-primary">Question Count</Label>
                    <Badge variant="default" className="text-lg px-3 rounded-lg">{questionCount}</Badge>
                  </div>
                  <Slider value={[questionCount]} min={1} max={30} step={1} onValueChange={(val) => setQuestionCount(val[0])} />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-bold text-primary">Output Modules</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: "mcq", label: "Objective (MCQ)", icon: "🎯" },
                      { id: "written", label: "Subjective (Theory)", icon: "📝" },
                    ].map((type) => (
                      <div 
                        key={type.id} 
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          outputTypes.includes(type.id) ? "border-primary bg-primary/10" : "border-border bg-background"
                        }`} 
                        onClick={() => toggleOutputType(type.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-bold">{type.label}</span>
                        </div>
                        <Checkbox checked={outputTypes.includes(type.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={isProcessing || outputTypes.length === 0}
                  className="w-full h-16 text-xl font-black shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 rounded-2xl group"
                >
                  {isProcessing ? <Spinner className="mr-2 h-6 w-6" /> : <Brain className="mr-2 h-6 w-6" />}
                  GENERATE FINAL PAPER
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predict" className="mt-0">
          {/* ... existing prediction content ... */}
          {analysisResult && (
            <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8">
              <Card className="border-primary/30 bg-primary/5 shadow-2xl relative overflow-hidden border-2">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
                <CardContent className="py-8 flex flex-wrap items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl border border-primary/20 rotate-3 transition-transform hover:rotate-0">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-2 uppercase flex items-center gap-2">
                        Precision Results <Badge className="bg-green-500">Verified</Badge>
                      </h3>
                      <div className="flex gap-3 flex-wrap text-sm font-bold text-muted-foreground">
                        <span>Rank: <span className="text-primary">#1 Strategy</span></span>
                        <span>•</span>
                        <span>Format: <span className="text-primary">{paperFormat}</span></span>
                        <span>•</span>
                        <span>Status: <span className="text-green-500">Optimized</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-2 font-bold hover:bg-muted" onClick={() => setStep("upload")}>
                      <ChevronLeft className="mr-2 w-4 h-4" /> Start Fresh
                    </Button>
                    <Button variant="default" size="lg" className="h-14 px-8 rounded-2xl border-2 font-bold" onClick={() => setStep("analyze")}>
                      Refine Format
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <TopicAnalysis 
                extractedText={analysisResult.extractedText} 
                topics={analysisResult.topics} 
                patterns={analysisResult.patterns} 
              />
              <QuestionPredictor analysisResult={analysisResult} />
              
              <div className="flex justify-center pb-32">
                <Button variant="ghost" size="lg" onClick={() => setStep("upload")} className="h-16 px-12 rounded-2xl text-muted-foreground hover:text-primary transition-colors text-lg font-bold uppercase tracking-widest">
                  New Dynamic Search
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


