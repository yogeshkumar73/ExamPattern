"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Lightbulb, Target, TrendingUp, MessageCircle, Loader2, Volume2, Check } from "lucide-react"

interface AICoachProps {
  userEmail?: string
  userStats?: {
    correctAnswers: number
    totalQuestions: number
    category: string
    difficulty: string
    recentMistakes?: string[]
  }
}

interface CoachAdvice {
  tip: string
  context: string
  difficulty: string
  actionable: boolean
}

export function AICoach({ userEmail, userStats }: AICoachProps) {
  const [advice, setAdvice] = useState<CoachAdvice[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTip, setSelectedTip] = useState<number | null>(null)
  const [speakingTip, setSpeakingTip] = useState<number | null>(null)

  const fetchCoachAdvice = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'coach-advice',
        correctAnswers: (userStats?.correctAnswers || 5).toString(),
        totalQuestions: (userStats?.totalQuestions || 10).toString(),
        category: userStats?.category || 'coding',
        difficulty: userStats?.difficulty || 'intermediate',
      });

      const response = await fetch(`/api/arena/ai-content?${params}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (data.success && data.advice) {
        setAdvice(data.advice);
      }
    } catch (error) {
      console.error('Failed to fetch coach advice:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachAdvice();
  }, [userStats]);

  const handleSpeak = async (tip: CoachAdvice, index: number) => {
    setSpeakingTip(index);
    try {
      // Use Web Speech API for voice
      const utterance = new SpeechSynthesisUtterance(tip.tip);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setSpeakingTip(null);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setSpeakingTip(null);
    }
  };

  const contextIcons: Record<string, typeof Brain> = {
    'Practice Strategy': Target,
    'Learning Strategy': Lightbulb,
    'Growth Strategy': TrendingUp,
    'Time Management': Clock,
    'Focus Tips': Brain,
  };

  return (
    <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
      <CardHeader className="border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-300">
              AI Coach Assistant
            </CardTitle>
            <CardDescription>Personalized tips to boost your performance</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
              <p className="text-sm text-muted-foreground">Analyzing your performance...</p>
            </div>
          </div>
        ) : advice.length > 0 ? (
          <div className="space-y-3">
            {advice.map((tip, idx) => {
              const IconComponent = contextIcons[tip.context] || Lightbulb;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-indigo-500/20 bg-black/20 hover:bg-black/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedTip(selectedTip === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="font-semibold text-sm text-white">{tip.context}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-indigo-500/30 text-indigo-300"
                        >
                          {tip.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tip.tip}</p>

                      {selectedTip === idx && tip.actionable && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/10">
                          <div className="text-xs text-indigo-300 space-y-1">
                            <p className="font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Action Item:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Break down complex problems into steps</li>
                              <li>Review similar problems from your history</li>
                              <li>Practice for 15-20 minutes daily</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(tip, idx);
                      }}
                      disabled={speakingTip === idx}
                    >
                      <Volume2 className={`w-4 h-4 ${speakingTip === idx ? 'animate-pulse text-indigo-400' : ''}`} />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              onClick={fetchCoachAdvice}
              variant="outline"
              className="w-full border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Get Fresh Tips
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">
              Complete a few questions to get personalized coaching tips!
            </p>
            <Button
              onClick={fetchCoachAdvice}
              variant="ghost"
              size="sm"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Generate Tips
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Clock } from "lucide-react";
