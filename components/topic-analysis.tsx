"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, Target } from "lucide-react"

type TopicAnalysisProps = {
  extractedText: string
  topics?: Array<{ name: string; frequency: number; importance: number }>
  patterns?: Array<{ pattern: string; description: string }>
}

export default function TopicAnalysis({ extractedText, topics, patterns }: TopicAnalysisProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extracted Text</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 w-full rounded-md border p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {extractedText || "No text extracted yet..."}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>

      {topics && topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Identified Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{topic.name}</p>
                      {topic.inSample && (
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] py-0 h-4">
                          Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Frequency: {topic.frequency}</p>
                  </div>
                  <Badge variant={topic.importance > 7 ? "default" : "secondary"}>{topic.importance}/10</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {patterns && patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Detected Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <p className="font-medium mb-1">{pattern.pattern}</p>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
