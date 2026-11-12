"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle2, 
  XCircle,
  FileQuestion, 
  Info, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  CheckSquare, 
  BookOpen, 
  ShieldCheck, 
  Printer, 
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  HelpCircle,
  Trophy,
  Award
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

  // Interactive Practice State for MCQs
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<number, string>>({})
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({})
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({})

  // Interactive Practice State for Written Questions
  const [writtenDrafts, setWrittenDrafts] = useState<Record<number, string>>({})
  const [revealedWritten, setRevealedWritten] = useState<Record<number, boolean>>({})

  // Calculate practice statistics
  const answeredCount = Object.keys(checkedQuestions).length
  const correctCount = Object.entries(checkedQuestions).filter(([idxStr, isChecked]) => {
    if (!isChecked) return false
    const idx = Number(idxStr)
    return userSelectedOptions[idx] === mcqs[idx]?.correctAnswer
  }).length
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0

  const handleSelectOption = (qIndex: number, option: string) => {
    // If question has already been checked, don't change unless user resets
    if (checkedQuestions[qIndex]) return
    setUserSelectedOptions(prev => ({ ...prev, [qIndex]: option }))
  }

  const handleCheckAnswer = (qIndex: number) => {
    if (!userSelectedOptions[qIndex]) return
    setCheckedQuestions(prev => ({ ...prev, [qIndex]: true }))
    setShowExplanations(prev => ({ ...prev, [qIndex]: true }))
  }

  const handleRetryQuestion = (qIndex: number) => {
    setCheckedQuestions(prev => {
      const next = { ...prev }
      delete next[qIndex]
      return next
    })
    setUserSelectedOptions(prev => {
      const next = { ...prev }
      delete next[qIndex]
      return next
    })
    setShowExplanations(prev => {
      const next = { ...prev }
      delete next[qIndex]
      return next
    })
  }

  const handleResetAllMCQs = () => {
    setUserSelectedOptions({})
    setCheckedQuestions({})
    setShowExplanations({})
  }

  const toggleExplanation = (qIndex: number) => {
    setShowExplanations(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))
  }

  const toggleWrittenReveal = (qIndex: number) => {
    setRevealedWritten(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))
  }

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
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">INTERACTIVE PRACTICE SUITE</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Practice exam-predicted questions interactively. Select answers, test your recall, and get instant feedback.
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
            Practice Mode: Active
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
                <span>🎯 Objective Suite (MCQ Practice)</span>
                <Badge variant="secondary" className="ml-1 text-xs">{mcqs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="written" 
                className="gap-2 text-sm sm:text-base font-bold data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                <span>📝 Subjective Suite (Theory Practice)</span>
                <Badge variant="secondary" className="ml-1 text-xs">{written.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* ── MCQ TAB ────────────────────────────────────────────── */}
            <TabsContent value="mcq" className="p-4 sm:p-8 space-y-6 mt-0">
              {mcqs.length > 0 ? (
                <>
                  {/* Interactive Practice Scoreboard */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-background to-blue-500/10 border-2 border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs uppercase font-black tracking-wider text-primary">Student Practice Progress</div>
                        <div className="text-sm sm:text-base font-bold text-foreground">
                          Answered <span className="text-primary font-black">{answeredCount}</span> of {mcqs.length} Questions
                          {answeredCount > 0 && (
                            <span className="ml-2 text-xs font-semibold text-muted-foreground">
                              ({correctCount} Correct • <span className={scorePercent >= 70 ? "text-green-500 font-bold" : "text-amber-500 font-bold"}>{scorePercent}% Accuracy</span>)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleResetAllMCQs}
                        className="text-xs font-bold gap-1.5 rounded-xl border"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Practice
                      </Button>
                    </div>
                  </div>

                  {/* MCQ List */}
                  {mcqs.map((q, index) => {
                    const userSelected = userSelectedOptions[index]
                    const isChecked = Boolean(checkedQuestions[index])
                    const isUserCorrect = isChecked && userSelected === q.correctAnswer
                    const showExp = Boolean(showExplanations[index])

                    return (
                      <Card key={index} className={`overflow-hidden border-2 transition-all rounded-3xl shadow-md ${
                        isChecked 
                          ? isUserCorrect 
                            ? "border-green-500/50 bg-green-500/[0.02]" 
                            : "border-rose-500/50 bg-rose-500/[0.02]"
                          : userSelected 
                            ? "border-primary/50" 
                            : "hover:border-primary/30"
                      }`}>
                        <CardHeader className="py-3 px-4 sm:px-6 bg-muted/20 border-b flex flex-row justify-between items-center gap-2">
                          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                              {index + 1}
                            </div>
                            <span>Practice Question {index + 1}</span>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {isChecked && (
                              <Badge className={`text-xs font-black ${
                                isUserCorrect ? "bg-green-600 text-white" : "bg-rose-600 text-white"
                              }`}>
                                {isUserCorrect ? "✓ Correct (+1 Mark)" : "✗ Incorrect (0 Marks)"}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] sm:text-xs font-bold border-primary/20">
                              {q.difficulty || "Standard"}
                            </Badge>
                            <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black border-none">1 Mark</Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-6 space-y-6">
                          <p className="text-base sm:text-lg font-black leading-snug">
                            {q.question}
                          </p>

                          {/* 4 Interactive Options Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {(q.options || []).map((option, optIndex) => {
                              const isSelected = userSelected === option
                              const isCorrectAnswer = option === q.correctAnswer

                              // Visual state styling
                              let optionStyle = "bg-background border-border/80 hover:border-primary/60 cursor-pointer"
                              let badgeStyle = "bg-muted text-muted-foreground"

                              if (isChecked) {
                                if (isCorrectAnswer) {
                                  optionStyle = "bg-green-500/15 border-green-500 text-green-700 dark:text-green-300 shadow-md font-bold"
                                  badgeStyle = "bg-green-600 text-white font-black"
                                } else if (isSelected && !isCorrectAnswer) {
                                  optionStyle = "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-md font-bold"
                                  badgeStyle = "bg-rose-600 text-white font-black"
                                } else {
                                  optionStyle = "bg-muted/10 border-border/40 opacity-60"
                                }
                              } else if (isSelected) {
                                optionStyle = "bg-primary/10 border-primary ring-2 ring-primary/20 text-primary font-bold shadow-md"
                                badgeStyle = "bg-primary text-primary-foreground font-black"
                              }

                              return (
                                <button
                                  type="button"
                                  key={optIndex}
                                  disabled={isChecked}
                                  onClick={() => handleSelectOption(index, option)}
                                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left w-full ${optionStyle}`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${badgeStyle}`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <span className="flex-1 text-xs sm:text-sm leading-snug">{option}</span>
                                  
                                  {/* Result Icons */}
                                  {isChecked && isCorrectAnswer && (
                                    <div className="flex items-center gap-1 text-green-600 text-xs font-black">
                                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                      <span className="hidden sm:inline">Correct</span>
                                    </div>
                                  )}
                                  {isChecked && isSelected && !isCorrectAnswer && (
                                    <div className="flex items-center gap-1 text-rose-600 text-xs font-black">
                                      <XCircle className="w-5 h-5 flex-shrink-0" />
                                      <span className="hidden sm:inline">Your Pick</span>
                                    </div>
                                  )}
                                  {!isChecked && isSelected && (
                                    <Badge variant="outline" className="border-primary text-primary text-[10px] font-bold">
                                      Selected
                                    </Badge>
                                  )}
                                </button>
                              )
                            })}
                          </div>

                          {/* Action Controls for Answering / Retrying */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              {!isChecked ? (
                                <Button 
                                  onClick={() => handleCheckAnswer(index)} 
                                  disabled={!userSelected}
                                  className="h-10 px-5 rounded-xl text-xs font-black bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                >
                                  <Check className="w-4 h-4 mr-1.5" /> Check My Answer
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleRetryQuestion(index)} 
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 border-2"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" /> Try Again
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    onClick={() => toggleExplanation(index)} 
                                    size="sm"
                                    className="h-9 px-3 rounded-xl text-xs font-bold text-muted-foreground gap-1"
                                  >
                                    {showExp ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showExp ? "Hide Explanation" : "View Explanation"}
                                  </Button>
                                </>
                              )}
                            </div>

                            {!isChecked && (
                              <span className="text-xs text-muted-foreground font-medium italic">
                                {userSelected ? "Click 'Check My Answer' to verify." : "Select an option above to answer."}
                              </span>
                            )}
                          </div>

                          {/* Conceptual Explanation (Revealed after check or manual toggle) */}
                          {showExp && q.explanation && (
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-xs sm:text-sm relative overflow-hidden space-y-1 animate-in fade-in slide-in-from-top-1">
                              <div className="font-black text-primary flex items-center gap-1.5 uppercase tracking-wider text-xs">
                                <Info className="w-4 h-4 text-primary" /> Conceptual Explanation
                              </div>
                              <p className="text-muted-foreground font-medium leading-relaxed">{q.explanation}</p>
                            </div>
                          )}

                          {/* Mandatory Disclaimer */}
                          <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground/80">
                            <span className="italic">
                              ⚠️ {q.disclaimer || "Estimated practice question; not a guaranteed exam question."}
                            </span>
                            <span className="font-bold text-primary">Syllabus Aligned</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </>
              ) : (
                <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
                  <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Objective Questions Selected</p>
                </div>
              )}
            </TabsContent>

            {/* ── WRITTEN TAB ────────────────────────────────────────── */}
            <TabsContent value="written" className="p-4 sm:p-8 space-y-6 mt-0">
              {written.length > 0 ? (
                written.map((q, index) => {
                  const isRevealed = Boolean(revealedWritten[index])
                  const draftText = writtenDrafts[index] || ""

                  return (
                    <Card key={index} className="overflow-hidden border-2 transition-all hover:border-indigo-500/40 rounded-3xl group shadow-md">
                      <CardHeader className="py-3 px-4 sm:px-6 bg-muted/20 border-b flex flex-row justify-between items-center gap-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                            {index + 1}
                          </div>
                          <span>Subjective Practice Question {index + 1}</span>
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

                        {/* Interactive Practice: Student Answer Draft Area */}
                        <div className="space-y-2 p-4 rounded-2xl bg-muted/20 border">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-primary" /> Practice Your Draft Answer:
                            </span>
                            <span className="text-muted-foreground font-mono">{draftText.length} chars</span>
                          </div>
                          <Textarea 
                            placeholder="Type your structured solution, equations, or key points here to test yourself..."
                            value={draftText}
                            onChange={(e) => setWrittenDrafts(prev => ({ ...prev, [index]: e.target.value }))}
                            className="min-h-[100px] text-xs font-mono rounded-xl border bg-background"
                          />
                          <div className="flex justify-end pt-1">
                            <Button 
                              variant={isRevealed ? "outline" : "default"} 
                              size="sm" 
                              onClick={() => toggleWrittenReveal(index)}
                              className="rounded-xl text-xs font-bold gap-1.5"
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {isRevealed ? "Hide Model Answer & Rubric" : "Compare with Model Answer & Rubric"}
                            </Button>
                          </div>
                        </div>

                        {/* Model Answer & Rubric Checks (Expandable) */}
                        {isRevealed && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
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
                        )}

                        {/* Mandatory Disclaimer */}
                        <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/40">
                          <span className="italic">
                            ⚠️ {q.disclaimer || "Estimated practice question; not a guaranteed exam question."}
                          </span>
                          <span className="font-bold text-indigo-500">Grading Rubric Ready</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
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
