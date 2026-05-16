"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileQuestion, Info, Sparkles, RefreshCcw, Lightbulb } from "lucide-react"
import type { AnalysisResult } from "@/components/exam-analyzer"

type QuestionPredictorProps = {
  analysisResult: AnalysisResult
}

export default function QuestionPredictor({ analysisResult }: QuestionPredictorProps) {
  const { predictedQuestions } = analysisResult
  const mcqs = predictedQuestions?.mcq || []
  const written = predictedQuestions?.written || []

  const handleGenerateMore = () => {
    alert("Triggering Smart Iteration... Fetching fresh questions without repeating prior data.")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-black tracking-tight">PREDICTED EXAM SUITE</h2>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleGenerateMore} variant="outline" className="gap-2 border-2 hover:bg-primary hover:text-white transition-all">
            <Sparkles className="w-4 h-4" /> Generate More
          </Button>
          <Button variant="secondary" className="gap-2 border-2 transition-all">
            <RefreshCcw className="w-4 h-4" /> No-Repeat Mode: ON
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-2xl overflow-hidden border-2">
        <CardContent className="p-0">
          <Tabs defaultValue={mcqs.length > 0 ? "mcq" : "written"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-16 bg-muted/20 rounded-none border-b">
              <TabsTrigger value="mcq" className="gap-2 text-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary">
                🎯 Objective Suite <Badge variant="secondary" className="ml-2">{mcqs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="written" className="gap-2 text-lg font-bold data-[state=active]:bg-background data-[state=active]:text-primary">
                📝 Subjective Suite <Badge variant="secondary" className="ml-2">{written.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mcq" className="p-6 space-y-6 mt-0">
              {mcqs.length > 0 ? (
                mcqs.map((q, index) => (
                  <Card key={index} className="overflow-hidden border-2 transition-all hover:border-primary/30 group">
                    <CardHeader className="py-3 bg-muted/30 border-b flex flex-row justify-between items-center">
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center text-[10px]">{index + 1}</div>
                        MCQ Predictor
                      </CardTitle>
                      <Badge variant="outline" className="bg-background">Difficulty: {q.difficulty || "Standard"}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <p className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                              option === q.correctAnswer 
                                ? "bg-green-500/5 border-green-500/50 shadow-[0_0_20px_-5px_rgba(34,197,94,0.2)]" 
                                : "bg-background hover:border-primary/30 hover:shadow-md"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                              option === q.correctAnswer ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className="flex-1 font-semibold">{option}</span>
                            {option === q.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-4 p-5 bg-blue-500/5 border-2 border-blue-500/10 rounded-2xl text-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                          <p className="font-black text-blue-600 mb-2 flex items-center gap-2 uppercase tracking-tighter">
                            <Info className="w-4 h-4" /> AI Explanation & Logic
                          </p>
                          <p className="text-muted-foreground leading-relaxed font-medium">{q.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-32 text-center border-4 border-dashed rounded-3xl bg-muted/10">
                  <p className="text-2xl font-black text-muted-foreground uppercase tracking-widest">No MCQ predictions available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="written" className="p-6 space-y-6 mt-0">
              {written.length > 0 ? (
                written.map((q, index) => (
                  <Card key={index} className="overflow-hidden border-2 transition-all hover:border-primary/30 group">
                    <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/30 border-b">
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-500 text-white flex items-center justify-center text-[10px]">{index + 1}</div>
                        Subjective Predictor
                      </CardTitle>
                      <div className="flex gap-3">
                        <Badge variant="default" className="font-black px-4">{q.marks} Marks</Badge>
                        <Badge className={q.difficulty === "Hard" ? "bg-red-500" : q.difficulty === "Medium" ? "bg-yellow-500" : "bg-green-500"}>
                          {q.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <p className="text-2xl font-black leading-tight group-hover:text-indigo-600 transition-colors">{q.question}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="font-black text-indigo-500 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" /> Expert Model Answer
                          </p>
                          <div className="p-6 bg-muted/40 rounded-2xl border-2 border-indigo-500/10 text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium italic shadow-inner">
                            {q.modelAnswer || "Model answer pending generation..."}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="font-black text-green-600 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Lightbulb className="w-4 h-4" /> Real-Life Case Study
                          </p>
                          <div className="p-6 bg-green-500/5 rounded-2xl border-2 border-green-500/10 text-green-800/80 leading-relaxed font-medium">
                            <strong>EXAM TIP:</strong> To score full marks, relate this to a real-world scenario. For example: In a 2024 industrial context, this theory is applied to optimize logistics. Mentioning this adds significant weight to your answer.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-32 text-center border-4 border-dashed rounded-3xl bg-muted/10">
                  <p className="text-2xl font-black text-muted-foreground uppercase tracking-widest">No Subjective predictions available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
