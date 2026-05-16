"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileSearch, Sparkles, Target } from "lucide-react"

type TopicAnalysisProps = {
  extractedText: string
  topics?: Array<{ name: string; frequency: number; importance: number; probabilityMatch?: number }>
  patterns?: Array<{ pattern: string; description: string }>
}

export default function TopicAnalysis({ extractedText, topics = [], patterns = [] }: TopicAnalysisProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const getStrategicTip = (topicName: string) => {
    return `STRATEGIC TIP: Focus on real-world applications of ${topicName}. For this specific exam format, examiners prioritize the 'HOW' and 'WHY' rather than just definitions. Practice at least 3 high-rigor variations of this topic.`
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Content Preview */}
      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 py-4 border-b">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" /> 
            Source Material Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="h-48 w-full rounded-2xl border-2 p-6 bg-muted/10 shadow-inner">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium">
              {extractedText || "No context provided for this session..."}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Interactive Topics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-black tracking-tighter">STRATEGIC TOPIC MAP</h2>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic, index) => (
              <Card 
                key={index} 
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                className={`group transition-all duration-500 cursor-pointer border-2 hover:scale-[1.02] rounded-3xl ${
                  selectedTopic === topic.name ? "border-primary bg-primary/5 shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]" : "hover:border-primary/30 shadow-md"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                        {index + 1}
                      </div>
                      <h4 className="font-black text-xl group-hover:text-primary transition-colors">{topic.name}</h4>
                    </div>
                    <Badge className={`px-4 py-1 rounded-full font-black ${topic.probabilityMatch && topic.probabilityMatch > 70 ? "bg-green-500" : "bg-primary"}`}>
                      {topic.probabilityMatch || 0}% PROBABILITY
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <span>Syllabus Criticality</span>
                      <span>{topic.importance}/10</span>
                    </div>
                    <Progress value={topic.importance * 10} className="h-2 rounded-full" />
                  </div>

                  {selectedTopic === topic.name && (
                    <div className="mt-6 p-5 bg-primary/10 rounded-2xl text-sm font-bold text-primary animate-in slide-in-from-top-4 duration-300 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="uppercase tracking-tighter">AI Strategy Suggestion</span>
                      </div>
                      <p className="leading-relaxed opacity-90">{getStrategicTip(topic.name)}</p>
                      <div className="mt-3 text-[10px] opacity-60 uppercase tracking-widest font-black">Click to collapse</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-4 border-dashed rounded-3xl bg-muted/10">
            <p className="text-xl font-black text-muted-foreground uppercase tracking-widest">Awaiting Analysis...</p>
          </div>
        )}
      </div>

      {/* Pattern Recognition */}
      {patterns.length > 0 && (
        <Card className="border-2 bg-slate-950 text-white shadow-2xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <FileSearch className="w-48 h-48" />
          </div>
          <CardHeader className="border-b border-white/10 py-6 px-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3 italic">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              PATTERN RECOGNITION ENGINE
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 relative z-10">
            {patterns.map((p, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                </div>
                <div>
                  <p className="font-black text-lg mb-2 uppercase tracking-tighter group-hover:text-primary transition-colors">{p.pattern}</p>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{p.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
