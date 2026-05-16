"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, FileQuestion } from "lucide-react"
import type { AnalysisResult } from "@/components/exam-analyzer"

type QuestionPredictorProps = {
  analysisResult: AnalysisResult
}

export default function QuestionPredictor({ analysisResult }: QuestionPredictorProps) {
  const { predictedQuestions } = analysisResult
  const mcqs = predictedQuestions?.mcq || []
  const written = predictedQuestions?.written || []

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-primary" />
            Predicted Exam Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue={mcqs.length > 0 ? "mcq" : "written"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="mcq" className="gap-2">
                MCQ Questions <Badge variant="secondary">{mcqs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="written" className="gap-2">
                Written Questions <Badge variant="secondary">{written.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mcq" className="space-y-4 mt-6">
              {mcqs.length > 0 ? (
                mcqs.map((q, index) => (
                  <Card key={index} className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardHeader className="py-3 bg-muted/20">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <p className="text-lg font-semibold">{q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                              option === q.correctAnswer 
                                ? "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]" 
                                : "bg-background hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              option === q.correctAnswer ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className="flex-1">{option}</span>
                            {option === q.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">No MCQ questions were predicted for this paper.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="written" className="space-y-4 mt-6">
              {written.length > 0 ? (
                written.map((q, index) => (
                  <Card key={index} className="overflow-hidden border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Question {index + 1}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="font-bold">{q.marks} Marks</Badge>
                        <Badge
                          className={
                            q.difficulty === "Hard" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                            q.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : 
                            "bg-green-500/10 text-green-500 border-green-500/20"
                          }
                        >
                          {q.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-xl font-medium leading-relaxed">{q.question}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">No written questions were predicted for this paper.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
