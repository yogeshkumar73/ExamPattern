"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Brain, Sparkles, Settings2, CheckCircle2, ChevronRight, Gauge, ListOrdered, FileSearch, Compare, Info } from "lucide-react"
import FileUpload from "@/components/file-upload"
import TopicAnalysis from "@/components/topic-analysis"
import QuestionPredictor from "@/components/question-predictor"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useNav } from "@/hooks/use-nav"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export type AnalysisResult = {
  extractedText: string
  sampleText?: string
  topics: Array<{ name: string; frequency: number; importance: number; inSample?: boolean }>
  patterns: Array<{ pattern: string; description: string }>
  comparison?: {
    overlap: string[]
    missingInPaper: string[]
    priorityFocus: string[]
  }
  predictedQuestions: {
    mcq: Array<{ question: string; options: string[]; correctAnswer: string }>
    written: Array<{ question: string; marks: number; difficulty: string }>
  }
}

export default function ExamAnalyzer() {
  const { currentStep, setStep } = useNav()
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [sampleFile, setSampleFile] = useState<File | null>(null)
  const [paperText, setPaperText] = useState<string>("")
  const [sampleText, setSampleText] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Input Controls
  const [difficulty, setDifficulty] = useState("Medium")
  const [questionCount, setQuestionCount] = useState(5)
  const [outputTypes, setOutputTypes] = useState<string[]>(["topics", "patterns", "mcq", "written"])

  const toggleOutputType = (type: string) => {
    setOutputTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handlePaperUpload = async (file: File) => {
    setPaperFile(file)
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/extract-text", { method: "POST", body: formData })
      const data = await response.json()
      setPaperText(data.text)
    } catch (error) {
      console.error("Error extracting paper text:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSampleUpload = async (file: File) => {
    setSampleFile(file)
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/extract-text", { method: "POST", body: formData })
      const data = await response.json()
      setSampleText(data.text)
    } catch (error) {
      console.error("Error extracting sample text:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyze = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/analyze-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: paperText,
          sampleText: sampleText, // Send sample text for comparison
          options: { difficulty, questionCount, outputTypes }
        }),
      })

      const data = await response.json()
      setAnalysisResult(data)
      setStep("predict")
    } catch (error) {
      console.error("Error analyzing paper:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 bg-primary/5 text-primary">
          LangChain Powered Analysis
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-indigo-600">
          Aura Prime Analyzer
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl">
          Comparative analysis between target papers and requirement samples for maximum exam precision.
        </p>
      </div>

      <Tabs value={currentStep} onValueChange={(val) => setStep(val as any)} className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 p-1 h-14 bg-muted/50 backdrop-blur rounded-xl border">
            <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Upload className="w-4 h-4 mr-2" />
              1. Upload Papers
            </TabsTrigger>
            <TabsTrigger value="analyze" disabled={!paperText} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4 mr-2" />
              2. Comparative Config
            </TabsTrigger>
            <TabsTrigger value="predict" disabled={!analysisResult} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              3. Smart Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upload" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-dashed bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Target Exam Paper
                </CardTitle>
                <CardDescription>The paper you want to analyze patterns for</CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing && !paperText ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Spinner className="w-8 h-8 mb-4" />
                    <p className="text-sm animate-pulse">Extracting Target...</p>
                  </div>
                ) : (
                  <FileUpload onFileUpload={handlePaperUpload} />
                )}
                {paperText && <div className="mt-4 flex items-center gap-2 text-xs text-green-500 font-bold"><CheckCircle2 className="w-4 h-4" /> Text Extracted Successfully</div>}
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed bg-muted/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-500">
                  <FileSearch className="w-5 h-5" />
                  Sample / Requirements
                </CardTitle>
                <CardDescription>Optional: Upload a sample paper or syllabus for comparison</CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing && !sampleText ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Spinner className="w-8 h-8 mb-4 text-indigo-500" />
                    <p className="text-sm animate-pulse">Extracting Sample...</p>
                  </div>
                ) : (
                  <FileUpload onFileUpload={handleSampleUpload} />
                )}
                {sampleText && <div className="mt-4 flex items-center gap-2 text-xs text-indigo-500 font-bold"><CheckCircle2 className="w-4 h-4" /> Sample Loaded</div>}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 flex justify-center">
             <Button size="lg" disabled={!paperText} onClick={() => setStep("analyze")} className="h-14 px-12 rounded-full font-bold shadow-xl">
               Continue to Analysis <ChevronRight className="ml-2 w-5 h-5" />
             </Button>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-xl border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Source Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <TopicAnalysis extractedText={paperText} />
                </CardContent>
              </Card>

              {sampleText && (
                <Alert className="bg-indigo-500/10 border-indigo-500/30">
                  <Info className="h-4 w-4 text-indigo-500" />
                  <AlertTitle className="text-indigo-500 font-bold">Comparative Mode Active</AlertTitle>
                  <AlertDescription>
                    We will compare the Target Paper against the provided Sample/Requirements to identify topic weightage and probability.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Card className="shadow-xl border-primary/10 bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Smart Analysis Config
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <Gauge className="w-4 h-4" /> Focus Difficulty
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Foundation</SelectItem>
                      <SelectItem value="Medium">Standard</SelectItem>
                      <SelectItem value="Hard">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base flex items-center gap-2">
                      <ListOrdered className="w-4 h-4" /> Prediction Count
                    </Label>
                    <span className="font-bold text-primary">{questionCount}</span>
                  </div>
                  <Slider value={[questionCount]} min={1} max={15} step={1} onValueChange={(val) => setQuestionCount(val[0])} />
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Target Output Types</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "topics", label: "Comparative Topics" },
                      { id: "mcq", label: "MCQ + Answers" },
                      { id: "written", label: "Written + Marking Scheme" },
                    ].map((type) => (
                      <div key={type.id} className="flex items-center space-x-3 p-3 rounded-lg bg-background border cursor-pointer" onClick={() => toggleOutputType(type.id)}>
                        <Checkbox checked={outputTypes.includes(type.id)} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAnalyze} disabled={isProcessing} className="w-full h-14 text-lg font-bold shadow-lg">
                  {isProcessing ? <Spinner className="mr-2 h-5 w-5" /> : <><Brain className="mr-2 h-5 w-5" /> Run Intelligent Analysis</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predict" className="mt-0">
          {analysisResult && (
            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
              <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Compare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Analysis Strategy</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{difficulty}</Badge>
                          {sampleText && <Badge className="bg-indigo-500 text-white border-none">Comparative Mode</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    {analysisResult.comparison && (
                      <div className="flex gap-6 border-l pl-6 border-primary/10">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-tighter">Overlap</p>
                          <p className="text-xl font-black text-primary">{analysisResult.comparison.overlap.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-tighter">High Prob</p>
                          <p className="text-xl font-black text-indigo-500">{analysisResult.comparison.priorityFocus.length}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <QuestionPredictor analysisResult={analysisResult} />
              
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setStep("upload")} className="h-12 px-8 rounded-full">
                  Reset & Start Over
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
