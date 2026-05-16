"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, User, Users, Lock, Unlock, Phone, CheckCircle2, Download, Upload, FileText, Globe, Scale, ArrowRight, ShieldAlert, Brain, MessageSquare, Send } from "lucide-react"
import { useNav } from "@/hooks/use-nav"
import { Switch } from "@/components/ui/switch"
// import { signIn, useSession } from "next-auth/react" // Removed due to environment restrictions

// --- ONBOARDING COMPONENT ---
export function UserOnboarding() {
  const { setRegistered, setStep } = useNav()
  // Simulated Session State
  const [session, setSession] = useState<any>(null)
  
  const [step, setLocalStep] = useState(1)
  const [formData, setFormData] = useState({ name: "", phone: "" })
  const [otp, setOtp] = useState("")

  const handleSimulatedGoogleLogin = () => {
    const mockUser = {
      user: {
        name: "Aura Demo Student",
        email: "student@aurastudy.ai",
        image: null
      }
    }
    setSession(mockUser)
    setRegistered(true)
    setStep("upload")
    // Store in localStorage for persistence
    localStorage.setItem("aura_session", JSON.stringify(mockUser))
  }

  useEffect(() => {
    const saved = localStorage.getItem("aura_session")
    if (saved) {
      setSession(JSON.parse(saved))
      setRegistered(true)
      setStep("upload")
    }
  }, [setRegistered, setStep])

  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleNext = async () => {
    setIsSending(true)
    try {
      const response = await fetch("http://localhost:5000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.phone })
      })
      const data = await response.json()
      if (data.success) {
        setLocalStep(2)
      } else {
        alert(data.message || "Failed to send OTP")
      }
    } catch (e) {
      // Fallback for demo if service is offline
      console.warn("OTP Service offline. Using demo mode.")
      setLocalStep(2)
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.phone, otp })
      })
      const data = await response.json()
      if (data.success) {
        setRegistered(true)
        setStep("upload")
      } else {
        alert(data.message || "Invalid OTP")
      }
    } catch (e) {
      // Fallback for demo
      if (otp === "123456" || otp === "1234") {
        setRegistered(true)
        setStep("upload")
      } else {
        alert("Verification failed. Try 123456")
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
      <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
        <CardHeader className="bg-primary text-primary-foreground py-10 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Brain className="w-20 h-20" /></div>
          <CardTitle className="text-3xl font-black italic">AURA WELCOME</CardTitle>
          <CardDescription className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs">Initialize Your Study Profile</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-6">
            <Button onClick={handleSimulatedGoogleLogin} variant="outline" className="w-full h-14 rounded-xl border-2 font-bold gap-3 hover:bg-muted transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                <path fill="#FBBC05" d="M16.04 18.013c-1.09.61-2.39.987-3.79.987-3.23 0-5.94-2.12-6.98-5.01L1.24 17.1c2.16 4.38 6.72 7.4 12.01 7.4 2.8 0 5.43-.84 7.6-2.3l-4.81-4.187Z" />
                <path fill="#4285F4" d="M22.527 12.236c0-.833-.073-1.636-.21-2.409H12v4.573h5.92c-.255 1.364-1.027 2.527-2.182 3.309l4.818 4.19C23.364 19.345 24 16.073 24 12.236Z" />
                <path fill="#34A853" d="M1.24 6.65l4.026 3.115a7.047 7.047 0 0 1 6.984-5.01c1.39 0 2.68.35 3.79.96L21.84 2.3A11.96 11.96 0 0 0 12 0C6.71 0 2.15 3.02 0 7.4l1.24-.75Z" />
              </svg>
              Login with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-bold italic">OR USE AURA ID</span></div>
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold">Full Name</Label>
                  <Input placeholder="Enter your name" className="h-12 border-2" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</Label>
                  <Input placeholder="+91 00000 00000" className="h-12 border-2" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <Button onClick={handleNext} disabled={!formData.name || !formData.phone || isSending} className="w-full h-14 text-lg font-black bg-primary rounded-xl shadow-xl hover:scale-105 transition-transform">
                  {isSending ? "SENDING..." : "GET OTP"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">OTP sent to {formData.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">6-Digit Verification Code</Label>
                  <Input placeholder="0 0 0 0 0 0" maxLength={6} className="h-16 text-center text-3xl font-black tracking-[0.5em] border-2" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
                <Button onClick={handleVerify} disabled={isVerifying} className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 rounded-xl shadow-xl">
                  {isVerifying ? "VERIFYING..." : "VERIFY ACCOUNT"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- ADMIN PANEL COMPONENT ---
export function AdminPanel() {
  const { setAdmin, isAdmin } = useNav()
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", status: "Active", rank: "Gold" },
    { id: 2, name: "Sarah Smith", status: "Inactive", rank: "Silver" },
    { id: 3, name: "Alex Johnson", status: "Active", rank: "Platinum" },
  ])

  const toggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u))
  }

  return (
    <div className="container mx-auto py-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-primary" /> 
          ADMIN COMMAND CENTER
        </h1>
        <Badge variant="outline" className="h-8 px-4 font-bold border-primary text-primary">POLICY ENFORCER ENABLED</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-2 shadow-2xl">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" /> User Base Management
            </CardTitle>
            <CardDescription>Control account activation and system access</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-lg">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase">Member Tier: {user.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge className={user.status === "Active" ? "bg-green-500" : "bg-destructive"}>
                      {user.status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold uppercase tracking-widest">{user.status === "Active" ? "Lock" : "Unlock"}</Label>
                      <Switch checked={user.status === "Active"} onCheckedChange={() => toggleStatus(user.id)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-2 shadow-xl bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Policy Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium leading-relaxed">
                As an Admin, you are authorized to update Global Terms of Service and User Privacy Laws.
              </p>
              <Button variant="secondary" className="w-full font-black">UPDATE MASTER POLICY</Button>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-destructive" /> System Logs</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono text-muted-foreground space-y-2">
              <p>[02:40:01] Policy breach detected: User #102</p>
              <p>[02:39:55] Admin session initialized</p>
              <p>[02:38:12] New paper uploaded to Category: GATE</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// --- PAPER REPOSITORY COMPONENT ---
export function PaperRepository() {
  const sections = ["CBSE", "GATE", "UPSC", "University", "Standard"]
  const [activeSec, setSec] = useState("CBSE")

  return (
    <div className="container mx-auto py-12 space-y-12 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-primary">COMMUNITY REPOSITORY</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Contribute and access a global database of previous examination papers. 
          Upload to help others, download to master your field.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {sections.map(s => (
          <Button key={s} variant={activeSec === s ? "default" : "outline"} onClick={() => setSec(s)} className="rounded-full px-8 font-bold">
            {s}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="group border-2 hover:border-primary transition-all shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-bold text-xs uppercase tracking-widest">{activeSec} Archive</span>
              </div>
              <Badge variant="outline">202{i} Session</Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <p className="font-black text-xl leading-tight">Advanced Concepts in {activeSec} Module {i}</p>
              <div className="flex gap-3">
                <Button className="flex-1 rounded-xl font-bold bg-muted text-foreground hover:bg-primary hover:text-white transition-all gap-2">
                  <Download className="w-4 h-4" /> Download
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl font-bold gap-2">
                  <Globe className="w-4 h-4" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-12">
        <Card className="w-full max-w-2xl border-4 border-dashed border-primary/20 bg-primary/5 rounded-3xl p-12 text-center group cursor-pointer hover:bg-primary/10 transition-all">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-float group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10" />
            </div>
          </div>
          <h3 className="text-3xl font-black mb-2">Contribute to the Archive</h3>
          <p className="text-muted-foreground font-medium mb-8">Share your old papers to empower the next generation of students.</p>
          <Button size="lg" className="h-14 px-12 rounded-2xl font-black text-lg shadow-2xl">SELECT FILES TO UPLOAD</Button>
        </Card>
      </div>
    </div>
  )
}

// --- POLICY SECTION COMPONENT ---
export function PolicySection() {
  return (
    <div className="container mx-auto py-12 max-w-4xl space-y-12 animate-in zoom-in duration-500">
      <div className="flex items-center gap-4 border-b-4 border-primary pb-6">
        <Scale className="w-16 h-16 text-primary" />
        <div>
          <h1 className="text-5xl font-black tracking-tighter">USER POLICY & LAWS</h1>
          <p className="font-bold text-muted-foreground uppercase tracking-widest">Master Terms of Service v2026.04</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {[
          { title: "Intellectual Integrity", icon: <ShieldCheck />, text: "Users are strictly prohibited from using Aura AI for plagiarism. Predictions generated are for study reference only. We uphold the highest standards of academic honesty." },
          { title: "Data Privacy", icon: <Unlock />, text: "Your uploaded papers are processed in a zero-cache environment. We do not store sensitive user data permanently on our servers beyond the active session unless uploaded to the Community Repository." },
          { title: "Community Conduct", icon: <Users />, text: "When contributing to the Paper Repository, ensure all content is authentic. Misleading or offensive uploads will result in immediate account deactivation by the Admin." },
          { title: "Legal Liability", icon: <ShieldAlert />, text: "Aura Study AI is not liable for exam results. Our analytics are predictive and intended to supplement individual effort, not replace it." }
        ].map((item, i) => (
          <div key={i} className="flex gap-6 p-8 rounded-3xl border-2 bg-card hover:shadow-2xl transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
              {item.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- COMMUNITY CHAT COMPONENT ---
export function CommunityChat() {
  const { isRegistered } = useNav()
  const [messages, setMessages] = useState([
    { id: 1, user: "Aura AI Bot", text: "Welcome to the verified student chat! How can I help your study group today?", time: "02:40", isAi: true },
    { id: 2, user: "John Doe", text: "Has anyone uploaded the 2023 GATE papers yet?", time: "02:41", isAi: false },
    { id: 3, user: "Sarah Smith", text: "Yes, just added them to the Community Archive!", time: "02:42", isAi: false },
  ])
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const msg = {
      id: Date.now(),
      user: "You (Authorized)",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: false
    }
    setMessages([...messages, msg])
    setNewMessage("")
  }

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Lock className="w-20 h-20 text-destructive animate-pulse" />
        <h2 className="text-3xl font-black">ACCESS RESTRICTED</h2>
        <p className="text-muted-foreground font-bold">Only verified students can access the Community Chat.</p>
        <Button onClick={() => window.location.href = "/"}>Return to Safety</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 max-w-6xl animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
        {/* Sidebar: Active Students */}
        <Card className="lg:col-span-1 border-2 shadow-xl bg-muted/20">
          <CardHeader className="border-b bg-background/50">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> ACTIVE STUDENTS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {["John Doe", "Sarah Smith", "Alex Johnson", "Aura AI Bot"].map((user, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border-2 border-primary/20">
                    {user[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <span className="font-bold text-sm group-hover:text-primary transition-colors">{user}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 border-2 shadow-2xl flex flex-col overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground py-4 flex flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <CardTitle className="text-lg font-black italic">AURA GLOBAL CHAT</CardTitle>
                <CardDescription className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Strategy Room</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-none">124 Online</Badge>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.user === "You (Authorized)" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] space-y-1 ${msg.user === "You (Authorized)" ? "text-right" : "text-left"}`}>
                  <div className="flex items-center gap-2 mb-1 justify-inherit">
                    {msg.user !== "You (Authorized)" && <span className="text-[10px] font-black text-primary uppercase">{msg.user}</span>}
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <div className={`p-4 rounded-2xl font-medium text-sm shadow-sm border-2 ${
                    msg.isAi 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : msg.user === "You (Authorized)"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 border-muted"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-4 bg-muted/30 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input 
                placeholder="Share your study pattern or ask a question..." 
                className="h-14 rounded-xl border-2 bg-background shadow-inner"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" className="h-14 w-14 rounded-xl p-0 shadow-lg hover:scale-105 transition-transform">
                <Send className="w-6 h-6" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
