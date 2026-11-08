"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileSearch, Sparkles, Target, TrendingUp, Award, Layers, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react"

export type TopicItem = {
  name: string
  unit?: string
  frequency: number
  totalPapers?: number
  importance: number
  priorityScore?: number
  probabilityMatch?: number
  totalMarks?: number
  marksSharePct?: number
  recentTrend?: number
  recencyScore?: number
  similarityClusters?: number
  scoreExplanation?: string[]
}

type TopicAnalysisProps = {
  extractedText: string
  topics?: TopicItem[]
  patterns?: Array<{ pattern: string; description: string }>
}

export default function TopicAnalysis({ extractedText, topics = [], patterns = [] }: TopicAnalysisProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs sm:text-sm text-amber-500 font-medium leading-relaxed">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <span className="font-black uppercase tracking-wider block text-amber-400">Statistical Analysis Notice</span>
          Topic priority scores (0–100) are estimates calculated using multivariable regression, paper frequency, recency weighting, and marks share. They represent study priority recommendations and are not guaranteed examination predictions.
        </div>
      </div>

      {/* Interactive Topics Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">STRATEGIC TOPIC RANKING</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Ranked by appearance rate, marks distribution, recency, and trend trajectory</p>
            </div>
          </div>
          <Badge variant="outline" className="h-8 px-3 rounded-xl border-primary/30 text-primary font-bold text-xs self-start sm:self-auto">
            {topics.length} Topics Analyzed
          </Badge>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topics.map((topic, index) => {
              const pScore = topic.priorityScore ?? topic.probabilityMatch ?? 70
              const isSelected = selectedTopic === topic.name

              return (
                <Card 
                  key={index} 
                  onClick={() => setSelectedTopic(isSelected ? null : topic.name)}
                  className={`group transition-all duration-300 cursor-pointer border-2 hover:scale-[1.01] rounded-3xl overflow-hidden ${
                    isSelected ? "border-primary bg-primary/5 shadow-2xl" : "hover:border-primary/40 shadow-md"
                  }`}
                >
                  <CardContent className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base flex-shrink-0 shadow-inner">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-lg sm:text-xl truncate group-hover:text-primary transition-colors">
                            {topic.name}
                          </h4>
                          {topic.unit && (
                            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 truncate">
                              <Layers className="w-3 h-3 text-primary flex-shrink-0" /> {topic.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={`px-3 py-1 rounded-full font-black text-xs flex-shrink-0 ${
                        pScore >= 80 ? "bg-emerald-600 text-white" : pScore >= 60 ? "bg-indigo-600 text-white" : "bg-amber-600 text-white"
                      }`}>
                        {pScore} PRIORITY
                      </Badge>
                    </div>

                    {/* Feature Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2.5 rounded-xl bg-muted/40 border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Appearances</div>
                        <div className="text-sm font-black text-foreground mt-0.5">
                          {topic.frequency} {topic.totalPapers ? `/ ${topic.totalPapers}` : "papers"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Marks</div>
                        <div className="text-sm font-black text-primary mt-0.5">
                          {topic.totalMarks ? `${topic.totalMarks}M` : "15M"}
                          {topic.marksSharePct ? ` (${topic.marksSharePct}%)` : ""}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Trend</div>
                        <div className={`text-sm font-black mt-0.5 flex items-center justify-center gap-1 ${
                          (topic.recentTrend ?? 0) >= 0 ? "text-green-500" : "text-amber-500"
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {(topic.recentTrend ?? 0) > 0 ? `+${topic.recentTrend}` : (topic.recentTrend ?? "Stable")}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-muted-foreground">
                        <span>Relative Examination Weight</span>
                        <span>{pScore}%</span>
                      </div>
                      <Progress value={pScore} className="h-2 rounded-full" />
                    </div>

                    {/* Expanded Score Evidence */}
                    {isSelected && (
                      <div className="pt-3 border-t border-border/60 space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary" /> Transparent Statistical Evidence
                        </div>
                        {topic.scoreExplanation && topic.scoreExplanation.length > 0 ? (
                          <ul className="space-y-1.5 text-xs text-muted-foreground font-medium">
                            {topic.scoreExplanation.map((exp, eIdx) => (
                              <li key={eIdx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{exp}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            Evaluated across historical paper frequency, marks share, and curriculum coverage.
                          </p>
                        )}
                        <div className="text-[10px] text-muted-foreground text-right font-semibold">Click to collapse</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center border-4 border-dashed rounded-3xl bg-muted/10">
            <p className="text-xl font-black text-muted-foreground uppercase tracking-widest">Awaiting Analysis...</p>
          </div>
        )}
      </div>

      {/* Patterns Discovered */}
      {patterns.length > 0 && (
        <Card className="border-2 shadow-xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-muted/20 border-b py-4">
            <CardTitle className="text-base font-black uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Examination Pattern Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((pat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                <div className="text-sm font-black text-foreground">{pat.pattern}</div>
                <div className="text-xs text-muted-foreground font-medium">{pat.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Source Material Insight */}
      <Card className="border-2 shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/20 py-4 border-b">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" /> Source Syllabus Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="h-36 w-full rounded-2xl border-2 p-4 bg-muted/10">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono">
              {extractedText || "No context provided for this session..."}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
