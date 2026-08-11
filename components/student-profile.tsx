"use client"

import { useState, useEffect, useCallback } from "react"
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
  RefreshCw,
  Lock,
  Trophy,
  Target,
  Flame,
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

type ProfileTab = "overview" | "academic" | "activity" | "achievements" | "settings"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  coinsReward: number
  unlocked: boolean
  eligible: boolean
  unlockedAt?: string
}

interface FullProfile extends SessionUser {
  bio?: string
  xp?: number
  level?: number
  coins?: number
  elo?: number
  wins?: number
  losses?: number
  totalBattles?: number
  accuracy?: number
  currentStreak?: number
  bestStreak?: number
  arenaPoints?: number
}

export function StudentProfile() {
  const { setStep, setRegistered, setAdmin, setSessionUser, setProfileComplete, navigate } = useNav()

  const [profile, setProfile] = useState<FullProfile>({
    id: "", name: "", email: "", phone: "", branch: "", bio: "",
    photoUrl: "", stream: "", course: "", department: "", grade: "",
    role: "student", profileComplete: false, points: 0, rank: "Bronze",
    xp: 0, level: 1, coins: 0, elo: 1200, wins: 0, losses: 0,
    totalBattles: 0, accuracy: 0, currentStreak: 0, bestStreak: 0, arenaPoints: 0,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview")
  const [battleActivity, setBattleActivity] = useState<any[]>([])
  const [battleStats, setBattleStats] = useState<{ wins: number; losses: number; total: number }>({ wins: 0, losses: 0, total: 0 })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // ── Persist user data to localStorage ────────────────────────────────────────
  const persistToSession = useCallback((userData: Partial<FullProfile>) => {
    try {
      const saved = localStorage.getItem("aura_session")
      if (saved) {
        const sess = JSON.parse(saved)
        sess.user = { ...sess.user, ...userData }
        localStorage.setItem("aura_session", JSON.stringify(sess))
      }
    } catch {}
  }, [])

  // ── Fetch fresh profile from DB ───────────────────────────────────────────────
  const fetchProfileFromDB = useCallback(async (email: string, localData: Partial<FullProfile>) => {
    try {
      const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`)
      if (!res.ok) return localData

      const data = await res.json()
      if (data.user) {
        // Merge DB data (DB is authoritative for stats, local for unsaved edits)
        const merged: FullProfile = {
          ...localData,
          ...data.user,
          id: data.user.id || localData.id || "",
        }
        persistToSession(merged)
        return merged
      }
    } catch (err) {
      console.warn("Profile DB fetch failed, using local data:", err)
    }
    return localData
  }, [persistToSession])

  // ── Initial load: localStorage → DB sync ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoadingProfile(true)
      let localData: Partial<FullProfile> = {}

      try {
        const saved = localStorage.getItem("aura_session")
        if (saved) {
          const session = JSON.parse(saved)
          if (session?.user) localData = { ...session.user, bio: session.user.bio || "" }
        }
      } catch {}

      if (localData.email) {
        const merged = await fetchProfileFromDB(localData.email as string, localData)
        setProfile(prev => ({ ...prev, ...merged }))
      } else if (localData.id || localData.name) {
        setProfile(prev => ({ ...prev, ...localData }))
      }

      setIsLoadingProfile(false)
    }

    load()
  }, [fetchProfileFromDB])

  // ── Fetch battle activity ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile.id) return
    fetch(`/api/arena/battle?userId=${encodeURIComponent(profile.id)}`)
      .then(async res => {
        if (!res.ok) return null
        const text = await res.text()
        return text ? JSON.parse(text) : null
      })
      .then(data => {
        if (!data) return
        if (data.battleHistory) setBattleActivity(data.battleHistory)
        if (data.stats) setBattleStats({ wins: data.stats.wins || 0, losses: data.stats.losses || 0, total: data.stats.total || 0 })
      })
      .catch(err => console.warn("Unable to load battle activity:", err))
  }, [profile.id])

  // ── Fetch achievements when tab opens ─────────────────────────────────────────
  const loadAchievements = useCallback(async () => {
    if (!profile.id) return
    setIsLoadingAchievements(true)
    try {
      const res = await fetch(`/api/arena/achievements?userId=${encodeURIComponent(profile.id)}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.achievements)) setAchievements(data.achievements)
      }
    } catch (err) {
      console.warn("Failed to load achievements:", err)
    } finally {
      setIsLoadingAchievements(false)
    }
  }, [profile.id])

  useEffect(() => {
    if (activeTab === "achievements") loadAchievements()
  }, [activeTab, loadAchievements])

  // ── Save profile ──────────────────────────────────────────────────────────────
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
          bio: profile.bio,
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
        persistToSession(updated)
        showToast("✅ Profile saved successfully!")
      } else {
        showToast("⚠️ " + (data.message || "Failed to save."))
      }
    } catch {
      persistToSession(profile)
      showToast("💾 Saved locally (offline mode)")
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  // ── Refresh profile from DB ───────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!profile.email) return
    setIsLoadingProfile(true)
    const merged = await fetchProfileFromDB(profile.email, profile)
    setProfile(prev => ({ ...prev, ...merged }))
    setIsLoadingProfile(false)
    showToast("🔄 Profile refreshed from server!")
  }

  // ── Logout ────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("aura_session")
    setRegistered(false)
    setAdmin(false)
    setSessionUser(null)
    setProfileComplete(false)
    setStep("onboarding")
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const streamInfo = STREAMS.find((s) => s.value === profile.stream)
  const rankKey = (profile.rank || "Bronze") as keyof typeof RANK_CONFIG
  const rankCfg = RANK_CONFIG[rankKey] || RANK_CONFIG.Bronze
  const pts = profile.points || profile.xp || 0
  const rankProgress = rankCfg.max > rankCfg.min
    ? Math.min(100, ((pts - rankCfg.min) / (rankCfg.max - rankCfg.min)) * 100)
    : 100
  const winRate = (profile.totalBattles || 0) > 0
    ? Math.round(((profile.wins || 0) / (profile.totalBattles || 1)) * 100)
    : 0

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "overview",     label: "Overview",     icon: User },
    { id: "academic",     label: "Academic",      icon: GraduationCap },
    { id: "activity",     label: "Activity",      icon: Activity },
    { id: "achievements", label: "Achievements",  icon: Trophy },
    { id: "settings",     label: "Settings",      icon: Settings },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading your profile...</p>
      </div>
    )
  }

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
        <Button variant="ghost" className="gap-2 font-bold text-muted-foreground hover:text-primary" onClick={() => navigate("upload")}>
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 font-bold" onClick={handleRefresh} disabled={isLoadingProfile}>
            <RefreshCw className={`w-4 h-4 ${isLoadingProfile ? "animate-spin" : ""}`} /> Refresh
          </Button>
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

      {/* Hero Card */}
      <div
        className="relative overflow-hidden rounded-3xl mb-8 p-8 border-2 border-white/10"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(250 80% 60%/0.12) 50%, hsl(200 80% 50%/0.1) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
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
                  <span className="text-4xl font-black text-white/80">{profile.name?.[0]?.toUpperCase() || "?"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
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
                <Badge className={`${streamInfo.color} text-white font-bold px-3 py-1 rounded-full`}>{streamInfo.label}</Badge>
              )}
              {profile.course && (
                <Badge variant="outline" className="font-bold border-primary/30 text-primary">{profile.course}</Badge>
              )}
              {profile.profileComplete && (
                <Badge className="bg-green-500 text-white font-bold gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </Badge>
              )}
              {(profile.level || 0) > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  Level {profile.level}
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
                  {Math.max(0, rankCfg.max - pts)} XP to {rankCfg.next}
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
            {tab.id === "achievements" && unlockedCount > 0 && (
              <span className="ml-1 text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded-full font-black">
                {unlockedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Personal Details */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5 text-primary" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {[
                { label: "Full Name", key: "name" },
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs font-black uppercase text-muted-foreground">{f.label}</Label>
                  <Input
                    disabled={!isEditing || f.key === "email"}
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
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value } as any)}
                  className="resize-none font-medium border-2"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats & Achievements — all dynamic */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5 text-yellow-500" /> Stats & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {[
                { label: "Total XP Points", value: profile.xp ?? profile.points ?? 0, icon: "⚡" },
                { label: "Rank", value: profile.rank || "Bronze", icon: "🏆" },
                { label: "Arena Level", value: `Level ${profile.level ?? 1}`, icon: "🎮" },
                { label: "Coins", value: profile.coins ?? 0, icon: "🪙" },
                { label: "ELO Rating", value: profile.elo ?? 1200, icon: "📊" },
                { label: "Total Battles", value: profile.totalBattles ?? 0, icon: "⚔️" },
                { label: "Win Rate", value: winRate > 0 ? `${winRate}%` : "0%", icon: "🎯" },
                { label: "Best Streak", value: profile.bestStreak ?? 0, icon: "🔥" },
                { label: "Stream", value: streamInfo?.label || "Not set", icon: "📚" },
                { label: "Lab Access", value: profile.isLabApproved ? "Approved ✓" : "Pending", icon: "🔬" },
                { label: "Account Status", value: (profile as any).status || "Active", icon: "🟢" },
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

      {/* ── ACADEMIC TAB ──────────────────────────────────────────────────────── */}
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

      {/* ── ACTIVITY TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <Card className="border-2 shadow-xl animate-in fade-in duration-300">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Live arena stats */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Total Battles", value: profile.totalBattles ?? battleStats.total, icon: <Target className="w-5 h-5 text-blue-400" /> },
                { label: "Wins", value: profile.wins ?? battleStats.wins, icon: <Trophy className="w-5 h-5 text-yellow-400" /> },
                { label: "Losses", value: profile.losses ?? battleStats.losses, icon: <Flame className="w-5 h-5 text-red-400" /> },
                { label: "Win Rate", value: `${winRate}%`, icon: <Zap className="w-5 h-5 text-green-400" /> },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border border-muted/40 bg-muted/10 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">{s.label}</p>
                  </div>
                  <p className="text-3xl font-black">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Extra stats */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Current Streak", value: profile.currentStreak ?? 0 },
                { label: "Best Streak", value: profile.bestStreak ?? 0 },
                { label: "Accuracy", value: `${profile.accuracy ?? 0}%` },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                  <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-black mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Battle history */}
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

      {/* ── ACHIEVEMENTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === "achievements" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Achievements</h2>
              <p className="text-sm text-muted-foreground font-medium">
                {unlockedCount} / {achievements.length} unlocked
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 font-bold" onClick={loadAchievements} disabled={isLoadingAchievements}>
              <RefreshCw className={`w-4 h-4 ${isLoadingAchievements ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {isLoadingAchievements ? (
            <div className="flex items-center justify-center h-48 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="font-bold text-muted-foreground">Loading achievements...</span>
            </div>
          ) : achievements.length === 0 ? (
            <Card className="border-2 p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-black text-lg">No achievements yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start playing battles to earn your first achievement!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <Card
                  key={ach.id}
                  className={`border-2 shadow-md transition-all ${
                    ach.unlocked
                      ? "border-yellow-500/40 bg-yellow-500/5"
                      : ach.eligible
                      ? "border-blue-500/30 bg-blue-500/5"
                      : "border-muted/40 opacity-60"
                  }`}
                >
                  <CardContent className="pt-5 pb-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      ach.unlocked
                        ? "bg-yellow-500/20 border-2 border-yellow-500/40"
                        : "bg-muted/30 border-2 border-muted/40 grayscale"
                    }`}>
                      {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-sm">{ach.name}</p>
                        {ach.unlocked && (
                          <Badge className="bg-yellow-500 text-white text-[9px] font-black px-1.5">UNLOCKED</Badge>
                        )}
                        {!ach.unlocked && ach.eligible && (
                          <Badge className="bg-blue-500 text-white text-[9px] font-black px-1.5">CLAIM NOW</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[10px] font-bold text-amber-500">+{ach.xpReward} XP</span>
                        <span className="text-[10px] font-bold text-yellow-500">+{ach.coinsReward} 🪙</span>
                        {ach.unlockedAt && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(ach.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────────────────────── */}
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
                Resetting your session will log you out and clear all local data. Your account data remains safely in the database.
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
