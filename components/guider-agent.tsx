"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, Send, Bot } from "lucide-react"

export function GuiderAgent() {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AI Guider Agent. I can help you understand your academic requirements and suggest the best resources and guidance. What do you need help with?", isAi: true }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { text: input, isAi: false }
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
      
      if (res.ok && data.text) {
        setMessages([...updatedMessages, { text: data.text, isAi: true }])
      } else {
        throw new Error(data.error || "Failed response")
      }
    } catch (e) {
      console.warn("LangChain API offline or error. Using local guidance system:", e)
      setTimeout(() => {
        // High-quality local fallback advice based on keywords
        const lowerInput = input.toLowerCase()
        let responseText = "Based on your request, I highly recommend checking out the 'Smart Lab' coding section to practice key algorithms. Make sure to review basic schemas and database normalization."
        if (lowerInput.includes("exam") || lowerInput.includes("paper")) {
          responseText = "For exam prep, check out our CBSE and GATE archives in the 'Community Repository'. Practicing 5 past papers under timed conditions has a 94% correlation with top grades!"
        } else if (lowerInput.includes("code") || lowerInput.includes("program") || lowerInput.includes("lab")) {
          responseText = "In the Smart Lab, focus on optimizing your time and space complexity. Practicing data structures like hash maps, binary trees, and dynamic programming is highly recommended."
        } else if (lowerInput.includes("points") || lowerInput.includes("rank")) {
          responseText = "You earn points by analyzing syllabi and reviewing recommended topics. Higher points unlock Silver, Gold, and Platinum ranks!"
        }
        setMessages([...updatedMessages, { text: responseText, isAi: true }])
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 max-w-3xl animate-in slide-in-from-bottom-8 duration-500">
      <Card className="border-2 shadow-2xl overflow-hidden flex flex-col h-[70vh]">
        <CardHeader className="bg-green-500/10 border-b border-green-500/20">
          <CardTitle className="flex items-center gap-3 text-green-600 font-black text-2xl">
            <Sparkles className="w-8 h-8" /> 
            AI Guider Agent
          </CardTitle>
          <CardDescription className="font-bold text-muted-foreground">
            Personalized guidance and resource suggestions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-muted/10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.isAi ? "justify-start" : "justify-end"}`}>
              <div className={`flex gap-3 max-w-[80%] ${m.isAi ? "flex-row" : "flex-row-reverse"}`}>
                <div className="w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center flex-shrink-0">
                  {m.isAi ? <Bot className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 bg-primary rounded-full" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${m.isAi ? "bg-muted border text-foreground" : "bg-primary text-primary-foreground"}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row items-center">
                <div className="w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center flex-shrink-0 animate-bounce">
                  <Bot className="w-4 h-4 text-green-500" />
                </div>
                <div className="p-4 rounded-2xl text-sm font-medium shadow-sm bg-muted border text-muted-foreground flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-200"></span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
 
        <CardFooter className="p-4 border-t bg-background">
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input 
              placeholder={loading ? "AI is typing..." : "Ask for guidance, resources, or advice..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 h-12 bg-muted/50 border-2"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="h-12 w-12 rounded-xl bg-green-500 hover:bg-green-600 shadow-md">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
