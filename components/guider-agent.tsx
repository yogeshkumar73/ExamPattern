"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Bot, RefreshCw, Trash2, Lightbulb, Compass } from "lucide-react"

const SUGGESTIONS = [
  "I want to build an application",
  "How to prepare for Data Structures?",
  "Tips for university exam revision",
  "How does Battle Arena 1v1 work?",
]

export function GuiderAgent() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am your AI Guider Agent. I can help you understand your academic requirements, architect software applications, and suggest the best resources and practice strategies. What do you need help with?",
      isAi: true
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMessage = { text: textToSend.trim(), isAi: false }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/guider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      })
      const data = await res.json()

      const reply = data.text || data.reply || (data.success && data.message)
      if (reply) {
        setMessages([...updatedMessages, { text: reply, isAi: true }])
      } else {
        throw new Error(data.error || "No response received")
      }
    } catch (e: any) {
      console.warn("[Guider] API fallback trigger:", e?.message || e)
      
      // Dynamic contextual offline reply
      const lower = textToSend.toLowerCase()
      let fallbackText = "I'm right here with you! What specific challenge, programming language, or academic concept would you like to master today?"
      
      if (lower.includes("build") || lower.includes("app") || lower.includes("project")) {
        fallbackText = "To build your application, start with a Minimum Viable Product (MVP):\n\n1. **Frontend**: React or Next.js with Tailwind CSS.\n2. **Backend**: Node.js or Python FastAPI.\n3. **Database**: MongoDB for flexible data or PostgreSQL for relational data.\n4. **Testing**: Practice writing clean functions in our Smart Lab!\n\nTell me the idea for your app, and we can map out the architecture!"
      } else if (lower.includes("exam") || lower.includes("study") || lower.includes("syllabus")) {
        fallbackText = "For maximum exam performance:\n\n1. Check the **Exam Pattern Analyzer** to review syllabus unit weights.\n2. Solve 3-5 past year question papers.\n3. Create quick summary formula sheets for high-yield topics.\n\nWhich subject or engineering unit are you preparing for?"
      } else if (lower.includes("code") || lower.includes("dsa") || lower.includes("algorithm")) {
        fallbackText = "For algorithm mastery:\n\n1. Master core data structures: Arrays, Hash Maps, Linked Lists, Trees, and Dynamic Programming.\n2. Test your solutions with edge cases in the **Smart Lab**.\n3. Enter the **Battle Arena** to test your coding speed against fellow students in 1v1 duels!"
      }

      setMessages([...updatedMessages, { text: fallbackText, isAi: true }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleClear = () => {
    setMessages([
      {
        text: "Hello! I am your AI Guider Agent. What academic or software project would you like to discuss today?",
        isAi: true
      }
    ])
  }

  return (
    <div className="container mx-auto py-8 sm:py-12 px-4 max-w-3xl animate-in slide-in-from-bottom-8 duration-500">
      <Card className="border-2 shadow-2xl overflow-hidden flex flex-col h-[75vh] min-h-[550px]">
        {/* Header */}
        <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 py-4 px-4 sm:px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-emerald-500 font-black text-lg sm:text-xl flex items-center gap-2">
                AI Guider Agent
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-none font-bold">
                  Gemini Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">
                Personalized academic planning, app architecture & coding guidance
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </CardHeader>

        {/* Quick Suggestion Chips */}
        <div className="p-2 sm:p-2.5 bg-muted/20 border-b border-border/40 flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1 pl-1 shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Suggestions:
          </span>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-background/80 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 border border-border/60 text-muted-foreground whitespace-nowrap text-xs font-semibold transition-all shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide bg-muted/10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isAi ? "justify-start" : "justify-end"} animate-in fade-in`}>
              <div className={`flex gap-2 sm:gap-3 max-w-[92%] sm:max-w-[85%] ${m.isAi ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`w-8 h-8 rounded-full border shadow-sm flex items-center justify-center shrink-0 ${
                  m.isAi ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-primary text-primary-foreground border-primary"
                }`}>
                  {m.isAi ? <Bot className="w-4 h-4" /> : <div className="w-3 h-3 bg-white rounded-full" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    m.isAi
                      ? "bg-card border border-border/70 text-foreground"
                      : "bg-primary text-primary-foreground font-medium"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] flex-row items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 animate-bounce">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl text-xs sm:text-sm bg-card border text-muted-foreground flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300" />
                  <span className="ml-2 font-mono text-xs">AI Guider is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Footer */}
        <CardFooter className="p-3 sm:p-4 border-t bg-background">
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input
              placeholder={loading ? "AI Guider is responding..." : "Ask for guidance, project architecture, or exam advice..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 h-12 bg-muted/40 border-2 rounded-xl text-xs sm:text-sm"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-12 w-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shrink-0 transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
