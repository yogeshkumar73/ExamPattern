"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, User, Users, Lock, Unlock, Phone, CheckCircle2, Download, Upload, FileText, Globe, Scale, ArrowRight, ShieldAlert, Brain, MessageSquare, Send, Sparkles } from "lucide-react"
import { useNav } from "@/hooks/use-nav"
import { Switch } from "@/components/ui/switch"
// import { signIn, useSession } from "next-auth/react" // Removed due to environment restrictions

// --- ONBOARDING COMPONENT ---
export function UserOnboarding() {
  const { setRegistered, setStep } = useNav()
  const [mode, setMode] = useState<"login" | "register">("register")
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("aura_session")
    if (saved) {
      setRegistered(true)
      setStep("profile")
    }
  }, [setRegistered, setStep])

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill in all details.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })
      const data = await res.json()
      
      if (res.status === 400 && data.message?.toLowerCase().includes("exists")) {
        alert("Account already exists! Redirecting to Login to enter your credentials...")
        setMode("login")
      } else if (res.ok) {
        alert("Registration Successful! Please login using your Gmail and Password.")
        setMode("login")
      } else {
        alert(data.message || "Registration failed. Please try again.")
      }
    } catch (e) {
      console.error(e)
      alert("Network error. Could not reach server.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill in your Gmail and Password.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      const data = await res.json()
      
      if (res.ok && data.user) {
        const sessionUser = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          photoUrl: data.user.photoUrl || "",
          branch: data.user.branch || "",
          bio: data.user.bio || "",
          isLabApproved: data.user.isLabApproved || false,
          status: data.user.status || "Active"
        }
        localStorage.setItem("aura_session", JSON.stringify({ user: sessionUser }))
        setRegistered(true)
        setStep("profile")
      } else {
        alert(data.message || "Invalid credentials! Check your Gmail and Password.")
      }
    } catch (e) {
      console.error(e)
      alert("Network error. Could not reach server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
      <Card className="border-2 shadow-2xl overflow-hidden glass-morphism border-primary/20">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-primary-foreground py-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Brain className="w-20 h-20 text-white" /></div>
          <CardTitle className="text-3xl font-black tracking-wider italic text-white">AURA PORTAL</CardTitle>
          <CardDescription className="text-primary-foreground/90 font-bold uppercase tracking-widest text-xs">
            {mode === "register" ? "STUDENT REGISTRATION" : "STUDENT LOGIN"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-6">
          <div className="flex border-2 border-muted rounded-xl overflow-hidden">
            <button 
              onClick={() => setMode("register")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${mode === "register" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted/10"}`}
            >
              Register
            </button>
            <button 
              onClick={() => setMode("login")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted/10"}`}
            >
              Login
            </button>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label className="font-bold">Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-12 border-2" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Phone Number</Label>
                  <Input 
                    placeholder="+91 00000 00000" 
                    className="h-12 border-2" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="font-bold">Gmail Address</Label>
              <Input 
                type="email" 
                placeholder="student@gmail.com" 
                className="h-12 border-2" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold">Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-12 border-2" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              />
            </div>

            {mode === "register" ? (
              <Button 
                onClick={handleRegister} 
                disabled={loading} 
                className="w-full h-14 text-lg font-black bg-primary rounded-xl shadow-xl hover:scale-102 transition-transform mt-4 text-white"
              >
                {loading ? "REGISTERING..." : "CREATE ACCOUNT"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button 
                onClick={handleLogin} 
                disabled={loading} 
                className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 rounded-xl shadow-xl hover:scale-102 transition-transform mt-4 text-white border-none"
              >
                {loading ? "LOGGING IN..." : "VERIFY & ENTER"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
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
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "credentials" | "feedback">("users")
  
  // Feedback states
  const [feedbacks, setFeedbacks] = useState([
    { 
      id: "1", 
      user: "User #102 (John Doe)", 
      message: "Prediction model is very accurate!", 
      time: "12 mins ago",
      replies: [] as string[],
      replyInput: "",
      aiLoading: false
    },
    { 
      id: "2", 
      user: "User #45 (Alice)", 
      message: "Need more UPSC past papers.", 
      time: "1 hour ago",
      replies: ["Admin: We are currently uploading more papers for UPSC v2026!"] as string[],
      replyInput: "",
      aiLoading: false
    }
  ])

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active"
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status: nextStatus })
      })
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, status: nextStatus } : u))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const toggleLabAccess = async (id: string, currentAccess: boolean) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, isLabApproved: !currentAccess })
      })
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, isLabApproved: !currentAccess } : u))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendReply = (feedbackId: string) => {
    setFeedbacks(feedbacks.map(f => {
      if (f.id === feedbackId && f.replyInput.trim()) {
        return {
          ...f,
          replies: [...f.replies, `Admin: ${f.replyInput.trim()}`],
          replyInput: ""
        }
      }
      return f
    }))
  }

  const handleAiSuggestReply = async (feedbackId: string, userMessage: string) => {
    setFeedbacks(feedbacks.map(f => f.id === feedbackId ? { ...f, aiLoading: true } : f))
    
    try {
      const prompt = `Write a short, highly professional academic support response (maximum 2 sentences) replying to this feedback: "${userMessage}".`
      const res = await fetch("/api/guider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ text: prompt, isAi: false }]
        })
      })
      const data = await res.json()
      
      if (res.ok && data.text) {
        setFeedbacks(feedbacks.map(f => {
          if (f.id === feedbackId) {
            return {
              ...f,
              replyInput: data.text,
              aiLoading: false
            }
          }
          return f
        }))
      } else {
        throw new Error(data.error || "Failed suggestion")
      }
    } catch (err) {
      console.warn("AI Reply generation failed. Using local template:", err)
      setFeedbacks(feedbacks.map(f => {
        if (f.id === feedbackId) {
          return {
            ...f,
            replyInput: "Thank you for sharing your feedback with the academic board! We have recorded this and will update our database shortly.",
            aiLoading: false
          }
        }
        return f
      }))
    }
  }

  return (
    <div className="container mx-auto py-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary animate-pulse" /> 
            ADMIN COMMAND CENTER
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Superuser Security & Access Console</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 font-bold border-primary text-primary w-fit">POLICY ENFORCER ENABLED</Badge>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap border-b-2 border-muted mb-8 gap-2 pb-2">
        <button 
          onClick={() => setActiveTab("users")} 
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider rounded-xl transition-all ${activeTab === "users" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          User Base Control
        </button>
        <button 
          onClick={() => setActiveTab("credentials")} 
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider rounded-xl transition-all ${activeTab === "credentials" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          Credentials Vault
        </button>
        <button 
          onClick={() => setActiveTab("feedback")} 
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider rounded-xl transition-all ${activeTab === "feedback" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          Active Feedback Center
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "users" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" /> User Base Management
                </CardTitle>
                <CardDescription>Control account activation and system access</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground font-bold">Loading User Database...</div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No users found. Ensure MongoDB is connected.</div>
                ) : (
                  <div className="divide-y-2">
                    {users.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase">
                            {user.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-black text-lg">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-bold uppercase">Tier: {user.rank || 'Bronze'} | Points: {user.points || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <Badge className={(user.status || "Active") === "Active" ? "bg-green-500 text-white" : "bg-destructive text-white"}>
                            {user.status || "Active"}
                          </Badge>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-4">
                              <Label className="text-xs font-bold uppercase tracking-widest">{(user.status || "Active") === "Active" ? "Lock" : "Unlock"}</Label>
                              <Switch checked={(user.status || "Active") === "Active"} onCheckedChange={() => toggleStatus(user._id, user.status || "Active")} />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <Label className="text-[10px] font-bold text-indigo-500 uppercase">Lab Access</Label>
                              <Switch checked={user.isLabApproved || false} onCheckedChange={() => toggleLabAccess(user._id, user.isLabApproved || false)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "credentials" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-indigo-500" /> Credentials Vault
                </CardTitle>
                <CardDescription>View User IDs, Gmail addresses, and Password Hashes stored in MongoDB</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center font-bold text-muted-foreground">Loading Vault...</div>
                ) : users.length === 0 ? (
                  <div className="text-center text-muted-foreground">No credentials found in database.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                      <thead className="text-xs text-foreground uppercase bg-muted/50 border-b font-black">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Gmail Address</th>
                          <th className="py-3 px-4">User ID (Unique)</th>
                          <th className="py-3 px-4">Password Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-b">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-muted/5 transition-colors text-foreground font-medium">
                            <td className="py-4 px-4 font-black">{u.name}</td>
                            <td className="py-4 px-4 font-bold text-blue-500">{u.email}</td>
                            <td className="py-4 px-4 font-mono text-[10px] bg-muted/20">{u._id}</td>
                            <td className="py-4 px-4">
                              <code className="text-xs font-mono text-purple-600 truncate max-w-[200px] block" title={u.password || "Secure Hashed"}>
                                {u.password ? u.password.substring(0, 18) + "..." : "[$2a$10$hashed...]"}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "feedback" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-green-500" /> Active Feedback & Discussion Reply
                </CardTitle>
                <CardDescription>Reply directly to student concerns or get instant AI-suggested responses</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {feedbacks.map(f => (
                  <Card key={f.id} className="border p-4 bg-muted/5 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-foreground">{f.user}</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-1">"{f.message}"</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{f.time}</Badge>
                    </div>

                    {f.replies.length > 0 && (
                      <div className="pl-4 border-l-4 border-primary space-y-2 bg-muted/10 p-3 rounded-r-lg">
                        {f.replies.map((rep, idx) => (
                          <p key={idx} className="text-xs font-bold text-primary">{rep}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input 
                        placeholder={f.aiLoading ? "AI is generating a draft..." : "Write a professional feedback reply..."} 
                        value={f.replyInput}
                        onChange={(e) => setFeedbacks(feedbacks.map(item => item.id === f.id ? { ...item, replyInput: e.target.value } : item))}
                        disabled={f.aiLoading}
                        className="flex-1 h-10 border-2"
                      />
                      <Button 
                        onClick={() => handleAiSuggestReply(f.id, f.message)} 
                        disabled={f.aiLoading}
                        variant="secondary" 
                        className="h-10 text-xs font-black gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> AI Assist
                      </Button>
                      <Button 
                        onClick={() => handleSendReply(f.id)} 
                        disabled={!f.replyInput.trim()} 
                        className="h-10 text-xs font-black bg-primary text-white"
                      >
                        Send Reply
                      </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

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
