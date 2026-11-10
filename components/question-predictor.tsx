"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  FileQuestion, 
  Info, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckSquare, 
  BookOpen, 
  ShieldCheck, 
  Printer, 
  Download 
} from "lucide-react"
import type { AnalysisResult } from "@/components/exam-analyzer"

type QuestionPredictorProps = {
  analysisResult: AnalysisResult
}

export default function QuestionPredictor({ analysisResult }: QuestionPredictorProps) {
  const { predictedQuestions } = analysisResult
  const mcqs = predictedQuestions?.mcq || []
  const written = predictedQuestions?.written || []
  const [activeTab, setActiveTab] = useState<string>(mcqs.length > 0 ? "mcq" : "written")

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileQuestion className="w-7 h-7 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">PREDICTED PRACTICE SUITE</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Topic-aligned practice set generated strictly from syllabus units and verified exam patterns
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="gap-2 border-2 rounded-xl text-xs font-bold"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Export PDF
          </Button>
          <div className="h-8 px-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            No-Duplicate Engine: Active
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <Card className="border-2 shadow-2xl overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 sm:h-16 bg-muted/20 rounded-none border-b">
              <TabsTrigger 
                value="mcq" 
                className="gap-2 text-sm sm:text-base font-bold data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                <span>🎯 Objective Suite (MCQ)</span>
                <Badge variant="secondary" className="ml-1 text-xs">{mcqs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="written" 
                className="gap-2 text-sm sm:text-base font-bold data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                <span>📝 Subjective Suite (Theory)</span>
                <Badge variant="secondary" className="ml-1 text-xs">{written.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* ── MCQ TAB ────────────────────────────────────────────── */}
            <TabsContent value="mcq" className="p-4 sm:p-8 space-y-6 mt-0">
              {mcqs.length > 0 ? (
                mcqs.map((q, index) => (
                  <Card key={index} className="overflow-hidden border-2 transition-all hover:border-primary/40 rounded-3xl group shadow-md">
                    <CardHeader className="py-3 px-4 sm:px-6 bg-muted/20 border-b flex flex-row justify-between items-center gap-2">
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                          {index + 1}
                        </div>
                        <span>Objective Practice Question</span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs font-bold border-primary/20">
                          {q.difficulty || "Standard"}
                        </Badge>
                        <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black border-none">1 Mark</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                      <p className="text-base sm:text-lg font-black leading-snug group-hover:text-primary transition-colors">
                        {q.question}
                      </p>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {(q.options || []).map((option, optIndex) => {
                          const isCorrect = option === q.correctAnswer
                          return (
                            <div
                              key={optIndex}
                              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                                isCorrect 
                                  ? "bg-green-500/10 border-green-500/60 shadow-md" 
                                  : "bg-background border-border/80"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                                isCorrect ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                              }`}>
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className="flex-1 font-semibold text-xs sm:text-sm leading-snug">{option}</span>
                              {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-xs sm:text-sm relative overflow-hidden space-y-1">
                          <div className="font-black text-primary flex items-center gap-1.5 uppercase tracking-wider text-xs">
                            <Info className="w-4 h-4 text-primary" /> Conceptual Explanation
                          </div>
                          <p className="text-muted-foreground font-medium leading-relaxed">{q.explanation}</p>
                        </div>
                      )}

                      {/* Mandatory Disclaimer */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/40">
                        <span className="italic">
                          ⚠️ {q.disclaimer || "Estimated practice question; not a guaranteed exam question."}
                        </span>
                        <span className="font-bold text-primary">Syllabus Aligned</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
                  <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Objective Questions Selected</p>
                </div>
              )}
            </TabsContent>

            {/* ── WRITTEN TAB ────────────────────────────────────────── */}
            <TabsContent value="written" className="p-4 sm:p-8 space-y-6 mt-0">
              {written.length > 0 ? (
                written.map((q, index) => (
                  <Card key={index} className="overflow-hidden border-2 transition-all hover:border-indigo-500/40 rounded-3xl group shadow-md">
                    <CardHeader className="py-3 px-4 sm:px-6 bg-muted/20 border-b flex flex-row justify-between items-center gap-2">
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                          {index + 1}
                        </div>
                        <span>Subjective Theory Question</span>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600 text-white font-black px-3 text-xs">
                          {q.marks || 5} Marks
                        </Badge>
                        <Badge variant="outline" className="text-xs font-bold border-indigo-500/30">
                          {q.difficulty || "Standard"}
                        </Badge>
                        {q.verificationStatus && (
                          <Badge className="bg-green-600 text-white text-[10px] font-black uppercase">
                            ✓ {q.verificationStatus}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                      <p className="text-lg sm:text-xl font-black leading-snug group-hover:text-indigo-600 transition-colors">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Model Answer */}
                        <div className="lg:col-span-2 space-y-2">
                          <div className="font-black text-indigo-600 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-indigo-600" /> Academic Model Answer
                          </div>
                          <div className="p-5 bg-muted/30 rounded-2xl border-2 border-indigo-500/10 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-medium">
                            {q.modelAnswer || "Model answer generated from syllabus core concepts."}
                          </div>
                        </div>

                        {/* Rubric Checks & References */}
                        <div className="space-y-4">
                          {/* Rubric Checklist */}
                          {q.rubricChecks && q.rubricChecks.length > 0 && (
                            <div className="space-y-2">
                              <div className="font-black text-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                <CheckSquare className="w-4 h-4 text-green-500" /> Scoring Rubric Criteria
                              </div>
                              <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border text-xs">
                                {q.rubricChecks.map((rubric: any, rIdx: number) => (
                                  <div key={rIdx} className="flex items-start gap-2 text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{typeof rubric === "string" ? rubric : rubric.criterion}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reference Sources */}
                          {q.referenceSources && q.referenceSources.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="font-bold text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                <BookOpen className="w-3.5 h-3.5 text-primary" /> Verified Context
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {q.referenceSources.map((ref: string, refIdx: number) => (
                                  <Badge key={refIdx} variant="secondary" className="text-[10px] font-semibold py-0.5">
                                    {ref}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mandatory Disclaimer */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/40">
                        <span className="italic">
                          ⚠️ {q.disclaimer || "Estimated practice question; not a guaranteed exam question."}
                        </span>
                        <span className="font-bold text-indigo-500">Grading Rubric Ready</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
                  <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Subjective Questions Selected</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
