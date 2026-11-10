"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  ShieldCheck,
  Bell,
} from "lucide-react"
import { useNav, type SessionUser } from "@/hooks/use-nav"
import { NotificationsCenter } from "@/components/notifications-center"

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
  Platinum: { min: 3000, max: 5000, color: "from-cyan-400 to-blue-300",     next: "Diamond" },
  Diamond:  { min: 5000, max: 5000, color: "from-purple-500 to-pink-500",    next: null },
}

export function computeRankTier(points: number): keyof typeof RANK_CONFIG {
  if (points >= 5000) return "Diamond"
  if (points >= 3000) return "Platinum"
  if (points >= 1500) return "Gold"
  if (points >= 500)  return "Silver"
  return "Bronze"
}

export function computeArenaRank(points: number): string {
  if (points >= 5000) return "Grandmaster"
  if (points >= 3000) return "Master"
  if (points >= 2000) return "Diamond"
  if (points >= 1500) return "Platinum"
  if (points >= 1200) return "Gold"
  if (points >= 1000) return "Silver"
  if (points >= 800)  return "Bronze"
  return "Unranked"
}

const PRESET_AVATARS = [
  { id: "scholar", label: "Scholar", url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%236366f1'/><stop offset='100%25' stop-color='%23a855f7'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g1)'/><circle cx='50' cy='40' r='18' fill='%23ffffff'/><path d='M25 82c0-14 11-25 25-25s25 11 25 25' fill='%23ffffff'/><polygon points='50,15 68,24 50,33 32,24' fill='%23fef08a'/></svg>" },
  { id: "cyber", label: "Cyber", url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2306b6d4'/><stop offset='100%25' stop-color='%233b82f6'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g2)'/><circle cx='50' cy='42' r='18' fill='%23ffffff'/><path d='M25 84c0-14 11-25 25-25s25 11 25 25' fill='%23ffffff'/><rect x='40' y='36' width='20' height='8' rx='4' fill='%2306b6d4'/></svg>" },
  { id: "astro", label: "Astro", url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23ec4899'/><stop offset='100%25' stop-color='%238b5cf6'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g3)'/><circle cx='50' cy='42' r='20' fill='%23ffffff'/><circle cx='50' cy='42' r='15' fill='%231e1b4b'/><circle cx='46' cy='38' r='3' fill='%2338bdf8'/><path d='M22 86c0-16 12-28 28-28s28 12 28 28' fill='%23ffffff'/></svg>" },
  { id: "champion", label: "Champion", url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23f59e0b'/><stop offset='100%25' stop-color='%23ef4444'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g4)'/><circle cx='50' cy='42' r='18' fill='%23ffffff'/><path d='M25 84c0-14 11-25 25-25s25 11 25 25' fill='%23ffffff'/><polygon points='42,22 50,15 58,22 55,27 45,27' fill='%23fbbf24'/></svg>" },
  { id: "emerald", label: "Emerald", url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2310b981'/><stop offset='100%25' stop-color='%23059669'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g5)'/><circle cx='50' cy='42' r='18' fill='%23ffffff'/><path d='M25 84c0-14 11-25 25-25s25 11 25 25' fill='%23ffffff'/><circle cx='50' cy='42' r='8' fill='%2310b981'/></svg>" },
  { id: "matrix", label: "Matrix", url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g6' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230f172a'/><stop offset='100%25' stop-color='%23334155'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g6)'/><circle cx='50' cy='42' r='18' fill='%2322c55e'/><path d='M25 84c0-14 11-25 25-25s25 11 25 25' fill='%2322c55e'/></svg>" },
]

type ProfileTab = "overview" | "academic" | "activity" | "achievements" | "notifications" | "settings"

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
  photoUrl?: string
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
  arenaRank?: string
  leaderboardRank?: number
  arenaLeaderboardRank?: number
}

export function StudentProfile() {
  const { setStep, setRegistered, isAdmin, setAdmin, setSessionUser, sessionUser, isRegistered, setProfileComplete, navigate } = useNav()

  const [profile, setProfile] = useState<FullProfile>({
    id: "", name: "", email: "", phone: "", branch: "", bio: "",
    photoUrl: "", stream: "", course: "", department: "", grade: "",
    role: "student", profileComplete: false, points: 0, rank: "Bronze",
    xp: 0, level: 1, coins: 0, elo: 1200, wins: 0, losses: 0,
    totalBattles: 0, accuracy: 0, currentStreak: 0, bestStreak: 0, arenaPoints: 0,
    arenaRank: "Unranked", leaderboardRank: 1, arenaLeaderboardRank: 1,
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

  // Password reset state inside profile settings
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" })
  const [isResettingPassword, setIsResettingPassword] = useState(false)

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

  // ── Profile Photo Upload via Device (Camera / Gallery / Files) ─────────────
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast("⚠️ Image file is too large (> 5MB). Please choose a smaller photo.")
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      if (base64) {
        const updated = { ...profile, photoUrl: base64 }
        setProfile(updated)
        persistToSession({ photoUrl: base64 })
        showToast("📸 Saving profile photo...")

        try {
          await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: profile.id,
              email: profile.email,
              name: profile.name,
              photoUrl: base64,
            }),
          })
          showToast("✅ Profile photo updated successfully!")
        } catch {
          showToast("💾 Profile photo saved locally!")
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSelectPresetAvatar = async (url: string) => {
    const updated = { ...profile, photoUrl: url }
    setProfile(updated)
    persistToSession({ photoUrl: url })
    showToast("📸 Profile avatar selected!")

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
          name: profile.name,
          photoUrl: url,
        }),
      })
      showToast("✅ Profile avatar saved!")
    } catch {
      showToast("💾 Profile avatar saved locally!")
    }
  }

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

      // Fallback to sessionUser from useNav
      if (!localData.email && sessionUser?.email) {
        localData = { ...sessionUser, bio: sessionUser.bio || "" }
      }

      const effectiveEmail = (localData.email || sessionUser?.email) as string | undefined
      if (effectiveEmail) {
        const merged = await fetchProfileFromDB(effectiveEmail, localData)
        setProfile(prev => ({ ...prev, ...merged }))
      } else if (localData.id || localData.name) {
        setProfile(prev => ({ ...prev, ...localData }))
      } else {
        // No user logged in: redirect to login page instead of showing fake guest
        setRegistered(false)
        setStep("onboarding")
      }

      setIsLoadingProfile(false)
    }

    load()
  }, [fetchProfileFromDB, sessionUser, setRegistered, setStep])

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

  // ── Change / Reset Password ──────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwordForm.newPassword) {
      showToast("⚠️ Please enter a new password.")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("⚠️ Passwords do not match!")
      return
    }

    setIsResettingPassword(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          phone: profile.phone,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        showToast("🔑 Password updated successfully!")
        setPasswordForm({ newPassword: "", confirmPassword: "" })
      } else {
        showToast("⚠️ " + (data.message || "Password update failed."))
      }
    } catch {
      showToast("⚠️ Network error. Please try again.")
    } finally {
      setIsResettingPassword(false)
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
  const pts = Math.max(profile.xp ?? 0, profile.points ?? 0)
  const calculatedTier = computeRankTier(pts)
  const rankKey = (profile.rank && profile.rank !== "Bronze" ? profile.rank : calculatedTier) as keyof typeof RANK_CONFIG
  const rankCfg = RANK_CONFIG[rankKey] || RANK_CONFIG[calculatedTier] || RANK_CONFIG.Bronze
  const rankProgress = rankCfg.max > rankCfg.min
    ? Math.min(100, Math.max(0, ((pts - rankCfg.min) / (rankCfg.max - rankCfg.min)) * 100))
    : 100

  const arenaPts = (profile as any).arenaPoints ?? profile.elo ?? 0
  const dynamicArenaRank = (profile as any).arenaRank && (profile as any).arenaRank !== "Unranked"
    ? (profile as any).arenaRank
    : computeArenaRank(arenaPts)
  const winRate = (profile.totalBattles || 0) > 0
    ? Math.round(((profile.wins || 0) / (profile.totalBattles || 1)) * 100)
    : 0

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "overview",      label: "Overview",          icon: User },
    { id: "academic",      label: "Academic",          icon: GraduationCap },
    { id: "notifications", label: "Messages & Alerts", icon: Bell },
    { id: "activity",      label: "Activity",          icon: Activity },
    { id: "achievements",  label: "Achievements",      icon: Trophy },
    { id: "settings",      label: "Settings",          icon: Settings },
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

  if (!profile.email && !sessionUser?.email) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="p-8 border border-white/10 rounded-3xl bg-slate-900 shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">Student Account Required</h2>
          <p className="text-sm text-muted-foreground">
            Please sign in or register to access your personal student profile.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={() => setStep("onboarding")} className="w-full font-bold">
              Sign In / Register
            </Button>
            <Button variant="outline" onClick={() => setStep("upload")} className="w-full">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-primary text-white rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-right-4 duration-300">
          {toast}
        </div>
      )}

      {/* Navigation Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <Button variant="ghost" className="gap-2 font-bold text-muted-foreground hover:text-primary justify-start sm:justify-center" onClick={() => navigate("upload")}>
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {(profile.role === "admin" || isAdmin) && (
            <Button
              size="sm"
              className="gap-2 font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={() => setStep("admin")}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Console
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2 font-bold text-xs sm:text-sm" onClick={handleRefresh} disabled={isLoadingProfile}>
            <RefreshCw className={`w-4 h-4 ${isLoadingProfile ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2 font-bold text-xs sm:text-sm" onClick={() => navigate("community")}>
            <BookOpen className="w-4 h-4" /> Community
          </Button>
          <Button variant="outline" size="sm" className="gap-2 font-bold text-xs sm:text-sm" onClick={() => navigate("guider")}>
            <Zap className="w-4 h-4" /> AI Guider
          </Button>
          <Button size="sm" className="gap-2 font-bold text-xs sm:text-sm" onClick={() => navigate("upload")}>
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
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 p-4 sm:p-8 border-2 border-white/10"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(250 80% 60%/0.12) 50%, hsl(200 80% 50%/0.1) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/5 translate-y-24 -translate-x-24 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Avatar with click-to-upload */}
          <div className="relative flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Upload profile picture"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo from your device"
              className="w-28 h-28 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden cursor-pointer group relative"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(250 80% 60%/0.3))" }}
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-black text-white/90">{profile.name?.[0]?.toUpperCase() || "?"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-7 h-7 text-white mb-1" />
                <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">Change Photo</span>
              </div>
            </div>
            {/* Role Badge - fixed legible background & styling */}
            <div
              className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider shadow-lg uppercase z-10"
              style={{
                backgroundColor: profile.role === "admin" ? "#dc2626" : "#4f46e5",
                color: "#ffffff",
                border: "1.5px solid rgba(255, 255, 255, 0.7)",
              }}
            >
              {profile.role === "admin" ? "ADMIN" : "STUDENT"}
            </div>
          </div>

          {/* Quick Preset Avatar Chooser */}
          <div className="flex md:hidden flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Avatar:</span>
            {PRESET_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => handleSelectPresetAvatar(av.url)}
                className={`w-6 h-6 rounded-md border overflow-hidden hover:scale-115 transition-transform ${
                  profile.photoUrl === av.url ? "ring-2 ring-primary border-primary scale-110" : "border-white/20 opacity-80"
                }`}
                title={`Pick ${av.label}`}
              >
                <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
              </button>
            ))}
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

            {/* Dynamic Rank + XP */}
            <div className="bg-white/10 rounded-2xl p-4 max-w-xs mx-auto md:mx-0 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rankCfg.color} flex items-center justify-center shadow`}>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-black text-sm block leading-none">{calculatedTier}</span>
                    <span className="text-[10px] text-muted-foreground font-bold">
                      {profile.leaderboardRank ? `Rank #${profile.leaderboardRank}` : "Top Student"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-foreground">{pts} XP</span>
                </div>
              </div>
              <Progress value={rankProgress} className="h-2 rounded-full" />
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2 font-bold">
                <span>{rankCfg.next ? `${Math.max(0, rankCfg.max - pts)} XP to ${rankCfg.next}` : "Max Rank Achieved"}</span>
                <span>{Math.round(rankProgress)}%</span>
              </div>
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
      <div className="flex items-center gap-1 border-b-2 border-muted mb-6 sm:mb-8 pb-1 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-xl transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-muted/20"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                { label: "Total XP Points", value: pts, icon: "⚡" },
                { label: "Rank", value: calculatedTier, icon: "🏆" },
                { label: "Standing", value: profile.leaderboardRank ? `#${profile.leaderboardRank} on Leaderboard` : "#1 on Leaderboard", icon: "🥇" },
                { label: "Arena Rank", value: dynamicArenaRank, icon: "⚔️" },
                { label: "Arena Standing", value: (profile as any).arenaLeaderboardRank ? `#${(profile as any).arenaLeaderboardRank} in Arena` : "Active", icon: "🎖️" },
                { label: "Arena Points", value: arenaPts, icon: "🎯" },
                { label: "Arena Level", value: `Level ${profile.level ?? 1}`, icon: "🎮" },
                { label: "Coins", value: profile.coins ?? 0, icon: "🪙" },
                { label: "ELO Rating", value: profile.elo ?? 0, icon: "📊" },
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

      {/* ── NOTIFICATIONS & MESSAGES TAB ────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="animate-in fade-in duration-300">
          <NotificationsCenter
            variant="embedded"
            currentUserId={profile.id}
            currentUserEmail={profile.email}
            currentUserName={profile.name}
            currentUserPhotoUrl={profile.photoUrl}
            isAdmin={profile.role === "admin" || isAdmin}
            onNavigate={(st) => navigate(st as any)}
          />
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
            <CardContent className="pt-6 space-y-6">
              {/* Profile Photo Uploader & Preview */}
              <div className="space-y-3">
                <Label className="font-black text-sm">Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2">
                  <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center relative shadow-md">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-muted-foreground">{profile.name?.[0]?.toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground font-medium">
                      Select or capture a photo from your phone or laptop (PNG, JPG, WebP supported).
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-bold text-xs gap-1.5 rounded-xl border"
                      >
                        <Camera className="w-4 h-4 text-primary" /> Choose Image from Device
                      </Button>
                      {profile.photoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProfile(prev => ({ ...prev, photoUrl: "" }))
                            persistToSession({ photoUrl: "" })
                            showToast("Photo removed")
                          }}
                          className="font-bold text-xs text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>

                    {/* Preset Avatars in Settings */}
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-muted-foreground mb-1.5">Or choose an avatar style:</p>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_AVATARS.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => handleSelectPresetAvatar(av.url)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                              profile.photoUrl === av.url
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-muted/40 border-border hover:bg-muted"
                            }`}
                          >
                            <img src={av.url} alt={av.label} className="w-5 h-5 rounded-md object-cover" />
                            <span>{av.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label className="font-semibold text-xs text-muted-foreground">Or direct photo URL link</Label>
                  <Input
                    value={profile.photoUrl || ""}
                    onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
                    placeholder="https://your-photo-url.com/image.jpg"
                    className="h-11 border-2 rounded-xl text-xs"
                  />
                </div>
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

          {/* Change / Reset Password Card */}
          <Card className="border-2 shadow-xl border-primary/20">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-5 h-5 text-primary" /> Reset & Change Password
              </CardTitle>
              <CardDescription>Update your account password securely</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="h-12 border-2 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="h-12 border-2 rounded-xl"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isResettingPassword}
                className="w-full h-12 font-black rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg"
              >
                <Lock className="mr-2 w-4 h-4" />
                {isResettingPassword ? "Updating Password..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Command Center Quick Access */}
          {(profile.role === "admin" || isAdmin) && (
            <Card className="border-2 border-red-500/30 bg-red-500/5 shadow-xl">
              <CardHeader className="border-b border-red-500/20 bg-red-500/10">
                <CardTitle className="flex items-center gap-2 text-base text-red-500">
                  <ShieldCheck className="w-5 h-5" /> Administrator Controls
                </CardTitle>
                <CardDescription>
                  Your profile has administrator privileges. Switch into the Admin Command Center to manage arena approvals, execute game engine benchmarks, and monitor students.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button
                  onClick={() => setStep("admin")}
                  className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl gap-2 h-11 px-6 shadow-lg shadow-red-500/20"
                >
                  <ShieldCheck className="w-4 h-4" /> Open Admin Command Center
                </Button>
              </CardContent>
            </Card>
          )}

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
