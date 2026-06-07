"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Camera,
  UserCircle,
  Save,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  Zap,
  Award,
  AlertTriangle,
  GraduationCap,
  CheckCircle2,
  Activity,
  Settings,
  User,
} from "lucide-react"
import { useNav, type SessionUser } from "@/hooks/use-nav"

const STREAMS = [
  { value: "class10", label: "Class 10 – Board", color: "bg-blue-500" },
  { value: "class11", label: "Class 11", color: "bg-cyan-500" },
  { value: "class12", label: "Class 12", color: "bg-teal-500" },
  { value: "ssc", label: "SSC (Staff Selection)", color: "bg-orange-500" },
  { value: "upsc", label: "UPSC Civil Services", color: "bg-red-500" },
  { value: "gate", label: "GATE Engineering", color: "bg-violet-500" },
  { value: "jee", label: "JEE / Engineering", color: "bg-indigo-500" },
  { value: "neet", label: "NEET / Medical", color: "bg-green-500" },
  { value: "university", label: "University / College", color: "bg-yellow-500" },
  { value: "other", label: "Other / Custom", color: "bg-gray-500" },
]

const RANK_CONFIG = {
  Bronze:   { min: 0,    max: 500,  color: "from-amber-700 to-yellow-600",  next: "Silver" },
  Silver:   { min: 500,  max: 1500, color: "from-gray-400 to-slate-300",    next: "Gold" },
  Gold:     { min: 1500, max: 3000, color: "from-yellow-400 to-amber-300",  next: "Platinum" },
  Platinum: { min: 3000, max: 3000, color: "from-cyan-400 to-blue-300",     next: null },
}

type ProfileTab = "overview" | "academic" | "activity" | "settings"

export function StudentProfile() {
  const { setStep, setRegistered, setAdmin, setSessionUser, setProfileComplete, navigate } = useNav()

  const [profile, setProfile] = useState<SessionUser & { bio?: string }>({
    id: "",
    name: "",
    email: "",
    phone: "",
    branch: "",
    bio: "",
    photoUrl: "",
    stream: "",
    course: "",
    department: "",
    grade: "",
    role: "student",
    profileComplete: false,
    points: 0,
    rank: "Bronze",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview")
  const [battleActivity, setBattleActivity] = useState<any[]>([])
  const [battleStats, setBattleStats] = useState<{ wins: number; losses: number; total: number }>({ wins: 0, losses: 0, total: 0 })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("aura_session")
    if (saved) {
      try {
        const session = JSON.parse(saved)
        if (session?.user) {
          setProfile({ ...profile, ...session.user, bio: session.user.bio || "" })
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!profile.id) return

    fetch(`/api/arena/battle?userId=${encodeURIComponent(profile.id)}`)
      .then(async res => {
        const text = await res.text()
        if (!res.ok) {
          console.warn('Battle activity fetch failed:', res.status, text)
          return null
        }
        try {
          return text ? JSON.parse(text) : null
        } catch (parseError) {
          console.warn('Failed to parse battle activity response:', parseError, text)
          return null
        }
      })
      .then(data => {
        if (!data) return
        if (data.battleHistory) setBattleActivity(data.battleHistory)
        if (data.stats) setBattleStats({ wins: data.stats.wins || 0, losses: data.stats.losses || 0, total: data.stats.total || 0 })
      })
      .catch(err => {
        console.warn("Unable to load battle activity:", err)
      })
  }, [profile.id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          branch: profile.branch,
          bio: (profile as any).bio,
          photoUrl: profile.photoUrl,
          stream: profile.stream,
          course: profile.course,
          department: profile.department,
          grade: profile.grade,
        }),
      })

      const data = await res.json()
      if (res.ok && data.user) {
        const updated = { ...profile, ...data.user }
        setProfile(updated)
        setSessionUser(updated)
        setProfileComplete(data.user.profileComplete || false)
        const savedSession = localStorage.getItem("aura_session")
        if (savedSession) {
          const sess = JSON.parse(savedSession)
          sess.user = { ...sess.user, ...data.user }
          localStorage.setItem("aura_session", JSON.stringify(sess))
        }
        showToast("✅ Profile saved successfully!")
      } else {
        showToast("⚠️ " + (data.message || "Failed to save."))
      }
    } catch {
      // Save locally
      const savedSession = localStorage.getItem("aura_session")
      if (savedSession) {
        const sess = JSON.parse(savedSession)
        sess.user = { ...sess.user, ...profile }
        localStorage.setItem("aura_session", JSON.stringify(sess))
      }
      showToast("💾 Saved locally (offline mode)")
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("aura_session")
    setRegistered(false)
    setAdmin(false)
    setSessionUser(null)
    setProfileComplete(false)
    setStep("onboarding")
  }

  const streamInfo = STREAMS.find((s) => s.value === profile.stream)
  const rankKey = (profile.rank || "Bronze") as keyof typeof RANK_CONFIG
  const rankCfg = RANK_CONFIG[rankKey] || RANK_CONFIG.Bronze
  const pts = profile.points || 0
  const rankProgress = rankCfg.max > rankCfg.min
    ? Math.min(100, ((pts - rankCfg.min) / (rankCfg.max - rankCfg.min)) * 100)
    : 100

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="container mx-auto py-8 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-primary text-white rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-right-4 duration-300">
          {toast}
        </div>
      )}

      {/* Navigation Row */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          className="gap-2 font-bold text-muted-foreground hover:text-primary"
          onClick={() => navigate("upload")}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 font-bold" onClick={() => navigate("community")}>
            <BookOpen className="w-4 h-4" /> Community
          </Button>
          <Button variant="outline" className="gap-2 font-bold" onClick={() => navigate("guider")}>
            <Zap className="w-4 h-4" /> AI Guider
          </Button>
          <Button className="gap-2 font-bold" onClick={() => navigate("upload")}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Incomplete Banner */}
      {!profile.profileComplete && (
        <div className="mb-6 p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-black text-amber-700 dark:text-amber-400">Complete Your Academic Profile</p>
            <p className="text-sm text-muted-foreground">Select your stream and course to unlock all features.</p>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-black" onClick={() => { setActiveTab("academic"); setIsEditing(true) }}>
            Setup Now
          </Button>
        </div>
      )}

      {/* Hero Card – Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl mb-8 p-8 border-2 border-white/10"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(250 80% 60%/0.12) 50%, hsl(200 80% 50%/0.1) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/5 translate-y-24 -translate-x-24 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-28 h-28 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden cursor-pointer group"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(250 80% 60%/0.3))" }}
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-black text-white/80">{profile.name?.[0] || "?"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Role badge */}
            <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-[10px] font-black text-white shadow-lg ${profile.role === "admin" ? "bg-red-500" : "bg-primary"}`}>
              {profile.role === "admin" ? "ADMIN" : "STUDENT"}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight mb-1">{profile.name || "Student"}</h1>
            <p className="text-muted-foreground font-medium mb-3">{profile.email}</p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
              {streamInfo && (
                <Badge className={`${streamInfo.color} text-white font-bold px-3 py-1 rounded-full`}>
                  {streamInfo.label}
                </Badge>
              )}
              {profile.course && (
                <Badge variant="outline" className="font-bold border-primary/30 text-primary">
                  {profile.course}
                </Badge>
              )}
              {profile.profileComplete && (
                <Badge className="bg-green-500 text-white font-bold gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </Badge>
              )}
            </div>

            {/* Rank + XP */}
            <div className="bg-white/10 rounded-2xl p-4 max-w-xs mx-auto md:mx-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rankCfg.color} flex items-center justify-center`}>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-black text-sm">{profile.rank || "Bronze"}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{pts} XP</span>
              </div>
              <Progress value={rankProgress} className="h-2 rounded-full" />
              {rankCfg.next && (
                <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                  {rankCfg.max - pts} XP to {rankCfg.next}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              className="gap-2 font-bold border-white/20"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
            <Button variant="destructive" className="gap-2 font-bold" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b-2 border-muted mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-muted/20"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5 text-primary" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {[
                { label: "Full Name", value: profile.name, key: "name" },
                { label: "Email", value: profile.email, key: "email" },
                { label: "Phone", value: profile.phone, key: "phone" },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs font-black uppercase text-muted-foreground">{f.label}</Label>
                  <Input
                    disabled={!isEditing}
                    value={(profile as any)[f.key] || ""}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className="font-medium border-2"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-muted-foreground">Bio</Label>
                <Textarea
                  disabled={!isEditing}
                  value={(profile as any).bio || ""}
                  onChange={(e) => setProfile({ ...profile, ...{ bio: e.target.value } } as any)}
                  className="resize-none font-medium border-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5 text-yellow-500" /> Stats & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {[
                { label: "Total XP Points", value: pts, icon: "⚡" },
                { label: "Rank", value: profile.rank || "Bronze", icon: "🏆" },
                { label: "Stream", value: streamInfo?.label || "Not set", icon: "📚" },
                { label: "Lab Access", value: profile.isLabApproved ? "Approved ✓" : "Pending", icon: "🔬" },
                { label: "Account Status", value: profile.status || "Active", icon: "🟢" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border">
                  <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <span>{stat.icon}</span> {stat.label}
                  </span>
                  <span className="font-black text-sm text-foreground">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Academic */}
      {activeTab === "academic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="w-5 h-5 text-primary" /> Stream & Course
                {!profile.profileComplete && (
                  <Badge className="bg-amber-500 text-white text-[10px] ml-2">Required</Badge>
                )}
              </CardTitle>
              <CardDescription>Set your academic stream to access relevant papers</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-black text-sm">Academic Stream *</Label>
                <Select
                  value={profile.stream || ""}
                  onValueChange={(v) => setProfile({ ...profile, stream: v })}
                  disabled={!isEditing && profile.profileComplete}
                >
                  <SelectTrigger className="h-12 border-2 rounded-xl">
                    <SelectValue placeholder="Select your stream..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STREAMS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${s.color}`} />
                          {s.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-sm">Course / Exam Target *</Label>
                <Input
                  value={profile.course || ""}
                  onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                  disabled={!isEditing && profile.profileComplete}
                  placeholder="e.g. SSC CGL, B.Tech CSE, NEET UG..."
                  className="h-12 border-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-sm">Department</Label>
                  <Input
                    value={profile.department || ""}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={!isEditing && profile.profileComplete}
                    placeholder="e.g. Science, Arts..."
                    className="h-12 border-2 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-sm">Grade / Level</Label>
                  <Input
                    value={profile.grade || ""}
                    onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                    disabled={!isEditing && profile.profileComplete}
                    placeholder="e.g. 12th, 2nd Year..."
                    className="h-12 border-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-sm">Branch / Subject</Label>
                <Input
                  value={profile.branch || ""}
                  onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                  disabled={!isEditing && profile.profileComplete}
                  placeholder="e.g. Computer Science, Biology..."
                  className="h-12 border-2 rounded-xl"
                />
              </div>

              {(!profile.profileComplete || isEditing) && (
                <Button
                  className="w-full h-12 font-black rounded-xl shadow-lg"
                  onClick={handleSave}
                  disabled={isSaving || !profile.stream || !profile.course}
                >
                  {isSaving ? "Saving..." : "Save Academic Info"} <CheckCircle2 className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base">Stream Access Preview</CardTitle>
              <CardDescription>Papers you can access based on your stream</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {STREAMS.map((s) => (
                <div
                  key={s.value}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    profile.stream === s.value
                      ? "border-primary bg-primary/5"
                      : "border-muted opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="text-sm font-bold">{s.label}</span>
                  </div>
                  {profile.stream === s.value ? (
                    <Badge className="bg-green-500 text-white text-[10px]">Your Stream ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Locked</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Activity */}
      {activeTab === "activity" && (
        <Card className="border-2 shadow-xl animate-in fade-in duration-300">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Total Battles</p>
                <p className="text-3xl font-black mt-2">{battleStats.total}</p>
              </div>
              <div className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Wins</p>
                <p className="text-3xl font-black mt-2">{battleStats.wins}</p>
              </div>
              <div className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Losses</p>
                <p className="text-3xl font-black mt-2">{battleStats.losses}</p>
              </div>
              <div className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Win Rate</p>
                <p className="text-3xl font-black mt-2">{battleStats.total > 0 ? `${Math.round((battleStats.wins / battleStats.total) * 100)}%` : '0%'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-muted/30 bg-background/80 p-6">
              <h3 className="font-black text-lg mb-4">Latest Game Results</h3>
              {battleActivity.length > 0 ? (
                <div className="space-y-4">
                  {battleActivity.slice(0, 5).map((battle, index) => (
                    <div key={battle.battleId || index} className="rounded-2xl border border-muted/40 bg-muted/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-black text-sm">{(battle.mode || 'Game').toUpperCase()} • {battle.difficulty?.toUpperCase() || 'NORMAL'}</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${battle.result === 'win' ? 'bg-emerald-500 text-white' : battle.result === 'loss' ? 'bg-destructive text-white' : 'bg-slate-500 text-white'}`}>
                          {battle.result?.toUpperCase() || 'DRAW'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Opponent: {battle.opponentName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">Score: {battle.score ?? 0} • Accuracy: {battle.accuracy ?? 0}%</p>
                      <p className="text-xs text-muted-foreground">XP: {battle.xpGained ?? 0} • Points: {battle.pointsGained ?? 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No game activity recorded yet. Play a game to populate your battle history.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content: Settings */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-5 h-5 text-primary" /> Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-sm">Profile Photo URL</Label>
                <Input
                  value={profile.photoUrl || ""}
                  onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
                  placeholder="https://your-photo-url.com/image.jpg"
                  className="h-12 border-2 rounded-xl"
                />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 h-12 font-black rounded-xl" onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 w-4 h-4" /> {isSaving ? "Saving..." : "Save Settings"}
                </Button>
                <Button variant="destructive" className="h-12 px-6 font-black rounded-xl" onClick={handleLogout}>
                  <LogOut className="mr-2 w-4 h-4" /> Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-500/20 bg-amber-500/5 shadow-xl">
            <CardHeader>
              <CardTitle className="text-amber-600 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Resetting your session will log you out and clear all local data.
              </p>
              <Button variant="destructive" className="font-black" onClick={handleLogout}>
                Clear Session & Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex justify-between mt-12 pt-6 border-t-2">
        <Button variant="outline" className="gap-2 font-bold h-12 px-8 rounded-xl" onClick={() => navigate("upload")}>
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-bold h-12 px-8 rounded-xl" onClick={() => navigate("community")}>
            Community <BookOpen className="w-4 h-4" />
          </Button>
          <Button className="gap-2 font-bold h-12 px-8 rounded-xl shadow-xl shadow-primary/20" onClick={() => navigate("upload")}>
            Dashboard <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
