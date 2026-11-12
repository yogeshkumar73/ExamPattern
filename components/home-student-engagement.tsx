"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Trophy,
  TrendingUp,
  Users,
  Award,
  Zap,
  Swords,
  Code2,
  Brain,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  ArrowRight,
  Activity,
  CheckCircle2,
  PieChart as PieIcon,
  Crown,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNav } from "@/hooks/use-nav"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface TopStudent {
  rank: number
  userId: string
  name: string
  avatar: string
  arenaPoints: number
  arenaRank: string
  xp: number
  wins: number
  winRate: number
  streak: number
  countryCode?: string
  city?: string
  coins?: number
}

// Simulated hourly dynamic participation data
const INITIAL_PARTICIPATION_DATA = [
  { time: "06:00", activeStudents: 420, challengesSolved: 890, battlesActive: 34 },
  { time: "08:00", activeStudents: 680, challengesSolved: 1450, battlesActive: 52 },
  { time: "10:00", activeStudents: 950, challengesSolved: 2340, battlesActive: 78 },
  { time: "12:00", activeStudents: 1120, challengesSolved: 3120, battlesActive: 94 },
  { time: "14:00", activeStudents: 1040, challengesSolved: 2890, battlesActive: 82 },
  { time: "16:00", activeStudents: 1210, challengesSolved: 3670, battlesActive: 106 },
  { time: "18:00", activeStudents: 1390, challengesSolved: 4420, battlesActive: 128 },
  { time: "20:00", activeStudents: 1480, challengesSolved: 5120, battlesActive: 142 },
  { time: "22:00", activeStudents: 1290, challengesSolved: 4380, battlesActive: 118 },
  { time: "Now",   activeStudents: 1340, challengesSolved: 4680, battlesActive: 122 },
]

// Skill mastery pie chart distribution data
const SKILLS_DISTRIBUTION = [
  { name: "DSA & Problem Solving", students: 4820, value: 35, color: "#6366F1", tag: "Most Active" },
  { name: "AI & Neural Networks", students: 3440, value: 25, color: "#EC4899", tag: "Fast Growing" },
  { name: "System Architecture & OS", students: 2750, value: 20, color: "#10B981", tag: "Core Practice" },
  { name: "Full-Stack Engineering", students: 1650, value: 12, color: "#F59E0B", tag: "Project Ready" },
  { name: "Mathematical & Discrete Logic", students: 1100, value: 8, color: "#06B6D4", tag: "Competitive" },
]

const FALLBACK_TOP_STUDENTS: TopStudent[] = [
  {
    rank: 1,
    userId: "u-1",
    name: "Yogesh",
    avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%236366f1'/><stop offset='100%25' stop-color='%23a855f7'/></linearGradient></defs><rect width='100' height='100' rx='24' fill='url(%23g1)'/><circle cx='50' cy='40' r='18' fill='%23ffffff'/><path d='M25 82c0-14 11-25 25-25s25 11 25 25' fill='%23ffffff'/><polygon points='50,15 68,24 50,33 32,24' fill='%23fef08a'/></svg>",
    arenaPoints: 2600,
    arenaRank: "Diamond",
    xp: 4600,
    wins: 9,
    winRate: 88,
    streak: 5,
    countryCode: "IN",
    city: "Kanpur, India",
    coins: 1950,
  },
  {
    rank: 2,
    userId: "u-2",
    name: "Sonu",
    avatar: "https://ui-avatars.com/api/?name=Sonu&background=ef4444&color=fff",
    arenaPoints: 2250,
    arenaRank: "Diamond",
    xp: 3925,
    wins: 6,
    winRate: 75,
    streak: 3,
    countryCode: "IN",
    city: "Kanpur, India",
    coins: 1160,
  },
  {
    rank: 3,
    userId: "u-3",
    name: "Rohan Sharma",
    avatar: "https://ui-avatars.com/api/?name=Rohan+Sharma&background=06b6d4&color=fff",
    arenaPoints: 1650,
    arenaRank: "Platinum",
    xp: 1850,
    wins: 5,
    winRate: 63,
    streak: 3,
    countryCode: "IN",
    city: "Delhi, India",
    coins: 1600,
  },
  {
    rank: 4,
    userId: "u-4",
    name: "Pradip",
    avatar: "https://ui-avatars.com/api/?name=Pradip&background=10b981&color=fff",
    arenaPoints: 1200,
    arenaRank: "Gold",
    xp: 3700,
    wins: 4,
    winRate: 58,
    streak: 2,
    countryCode: "IN",
    city: "Lucknow, India",
    coins: 1400,
  },
  {
    rank: 5,
    userId: "u-5",
    name: "Abhi",
    avatar: "https://ui-avatars.com/api/?name=Abhi&background=f59e0b&color=fff",
    arenaPoints: 1400,
    arenaRank: "Gold",
    xp: 250,
    wins: 1,
    winRate: 100,
    streak: 1,
    countryCode: "IN",
    city: "Noida, India",
    coins: 1200,
  },
  {
    rank: 6,
    userId: "u-6",
    name: "Devendra kumar",
    avatar: "https://ui-avatars.com/api/?name=Devendra+kumar&background=6366f1&color=fff",
    arenaPoints: 1200,
    arenaRank: "Gold",
    xp: 150,
    wins: 0,
    winRate: 0,
    streak: 0,
    countryCode: "IN",
    city: "Agra, India",
    coins: 1200,
  },
  {
    rank: 7,
    userId: "u-7",
    name: "IND Brother",
    avatar: "https://ui-avatars.com/api/?name=IND+Brother&background=ec4899&color=fff",
    arenaPoints: 1200,
    arenaRank: "Gold",
    xp: 100,
    wins: 0,
    winRate: 0,
    streak: 0,
    countryCode: "IN",
    city: "Mumbai, India",
    coins: 1200,
  },
  {
    rank: 8,
    userId: "u-8",
    name: "Alexandra",
    avatar: "https://ui-avatars.com/api/?name=Alexandra&background=8b5cf6&color=fff",
    arenaPoints: 1200,
    arenaRank: "Gold",
    xp: 50,
    wins: 0,
    winRate: 0,
    streak: 0,
    countryCode: "IN",
    city: "Bengaluru, India",
    coins: 1200,
  },
  {
    rank: 9,
    userId: "u-9",
    name: "Student User",
    avatar: "https://ui-avatars.com/api/?name=Student+User&background=3b82f6&color=fff",
    arenaPoints: 1200,
    arenaRank: "Gold",
    xp: 20,
    wins: 0,
    winRate: 0,
    streak: 0,
    countryCode: "IN",
    city: "Pune, India",
    coins: 1200,
  },
  {
    rank: 10,
    userId: "u-10",
    name: "Ok@1234567",
    avatar: "https://ui-avatars.com/api/?name=Ok&background=4285F4&color=fff",
    arenaPoints: 1000,
    arenaRank: "Silver",
    xp: 100,
    wins: 0,
    winRate: 0,
    streak: 0,
    countryCode: "IN",
    city: "Hyderabad, India",
    coins: 1000,
  },
]

function getCountryFlag(code?: string): string {
  if (!code || code.length !== 2) return "🌍"
  try {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return "🌍"
  }
}

export function HomeStudentEngagement() {
  const { setStep } = useNav()
  const [mounted, setMounted] = useState(false)
  const [topStudents, setTopStudents] = useState<TopStudent[]>(FALLBACK_TOP_STUDENTS)
  const [activeStudentIdx, setActiveStudentIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [chartMetric, setChartMetric] = useState<"students" | "challenges" | "battles">("students")
  const [participationData, setParticipationData] = useState(INITIAL_PARTICIPATION_DATA)
  
  // Real-time live counter metrics
  const [liveStudentsOnline, setLiveStudentsOnline] = useState(1342)
  const [liveBattlesActive, setLiveBattlesActive] = useState(124)
  const [liveChallengesSolved, setLiveChallengesSolved] = useState(15840)

  useEffect(() => {
    setMounted(true)

    const loadTopRankers = () => {
      fetch("/api/arena/leaderboard?limit=10&category=global")
        .then((res) => res.json())
        .then((data) => {
          const list = data?.leaderboard || data?.data?.entries
          if (Array.isArray(list) && list.length > 0) {
            const mapped: TopStudent[] = list.slice(0, 10).map((item: any, idx: number) => ({
              rank: item.rank || idx + 1,
              userId: item.userId || item.player_id || `u-${idx}`,
              name: item.name || "Student",
              avatar: item.avatar || item.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Student')}&background=6366f1&color=fff`,
              arenaPoints: Number(item.arenaPoints || item.elo || 1200),
              arenaRank: item.arenaRank || item.rank_tier || "Bronze",
              xp: Number(item.xp || 1000),
              wins: Number(item.wins || 0),
              winRate: Number(item.winRate || item.win_rate || (item.wins > 0 ? 80 : 0)),
              streak: Number(item.streak || item.currentStreak || item.bestStreak || 0),
              countryCode: item.countryCode || "IN",
              city: item.city || "Kanpur, India",
              coins: Number(item.coins || 1200),
            }))
            setTopStudents(mapped)
          }
        })
        .catch((_) => {})
    }

    loadTopRankers()
    const pollRankers = setInterval(loadTopRankers, 8000)
    return () => clearInterval(pollRankers)
  }, [])

  // Dynamic realistic telemetry tick every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveStudentsOnline((prev) => prev + Math.floor(Math.random() * 5) - 2)
      setLiveBattlesActive((prev) => Math.max(80, prev + Math.floor(Math.random() * 3) - 1))
      setLiveChallengesSolved((prev) => prev + Math.floor(Math.random() * 4) + 1)
      
      // Update chart's latest "Now" data point
      setParticipationData((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last) {
          last.activeStudents = Math.max(1200, last.activeStudents + Math.floor(Math.random() * 7) - 3)
          last.challengesSolved += Math.floor(Math.random() * 3) + 1
          last.battlesActive = Math.max(100, last.battlesActive + Math.floor(Math.random() * 3) - 1)
        }
        return updated
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  // Auto-slide top students carousel every 4 seconds
  useEffect(() => {
    if (isPaused || topStudents.length === 0) return
    const interval = setInterval(() => {
      setActiveStudentIdx((prev) => (prev + 1) % topStudents.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused, topStudents.length])

  const currentStudent = topStudents[activeStudentIdx] || topStudents[0]

  return (
    <section className="relative py-14 sm:py-20 border-b border-border/40 bg-gradient-to-b from-background via-muted/15 to-background overflow-hidden">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL-TIME PLATFORM ENGAGEMENT & ACADEMIC MASTERY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Learn, Compete & Elevate Your Skills Live
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            See real-time student activity across competitive battle arenas, algorithmic practice labs, and AI syllabus mastery.
          </p>
        </div>

        {/* Live Metrics Quick Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-foreground">{liveStudentsOnline.toLocaleString()}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Students Active Now</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md shadow-sm hover:border-rose-500/30 transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-black">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-foreground">{liveBattlesActive}</span>
              <span className="text-xs font-semibold text-muted-foreground block">Synchronized 1v1 Duels</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md shadow-sm hover:border-emerald-500/30 transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-foreground">{liveChallengesSolved.toLocaleString()}</span>
              <span className="text-xs font-semibold text-muted-foreground block">Problems Solved Today</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md shadow-sm hover:border-amber-500/30 transition-all flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-foreground">840K+ 🪙</span>
              <span className="text-xs font-semibold text-muted-foreground block">Coins & XP Distributed</span>
            </div>
          </div>
        </div>

        {/* ─── ROW 1: Real-Time User Graph & Skill Pie Chart ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Student Learning Graph (2 cols) */}
          <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-card/70 border border-border/60 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    Live Student Participation & Activity Curve
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time algorithmic test submissions and concurrent learners over 24-hour cycle.
                </p>
              </div>

              {/* Metric Switcher Filter */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartMetric("students")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === "students"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Active Learners
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric("challenges")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === "challenges"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Challenges
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric("battles")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === "battles"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live Duels
                </button>
              </div>
            </div>

            {/* Recharts Area Curve */}
            <div className="h-64 sm:h-72 w-full pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="curveIndigo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="curveEmerald" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="curveRose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                    />
                    {chartMetric === "students" && (
                      <Area
                        type="monotone"
                        dataKey="activeStudents"
                        name="Active Students"
                        stroke="#6366F1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#curveIndigo)"
                      />
                    )}
                    {chartMetric === "challenges" && (
                      <Area
                        type="monotone"
                        dataKey="challengesSolved"
                        name="Challenges Solved"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#curveEmerald)"
                      />
                    )}
                    {chartMetric === "battles" && (
                      <Area
                        type="monotone"
                        dataKey="battlesActive"
                        name="Live Battles"
                        stroke="#F43F5E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#curveRose)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                  Loading telemetry...
                </div>
              )}
            </div>

            {/* Bottom Info Row */}
            <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Stream update interval: <strong>4.0s (Live Engine)</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("lab")}
                className="h-7 text-xs font-bold text-indigo-400 hover:text-indigo-300 gap-1 p-0"
              >
                Join Practice Lab Now <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Skill Mastery Pie Chart (`paichart`) (1 col) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card/70 border border-border/60 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-400" /> Skill Participation Breakdown
                </h3>
                <p className="text-xs text-muted-foreground">Distribution across core student curriculum</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-purple-500/30 text-purple-400">
                100% Dynamic
              </Badge>
            </div>

            {/* Recharts Pie Donut */}
            <div className="h-44 sm:h-48 w-full relative flex items-center justify-center">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SKILLS_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {SKILLS_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val}% of Students`, name]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "10px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}

              {/* Donut Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs uppercase font-black text-muted-foreground">TOP SKILL</span>
                <span className="text-sm font-black text-foreground">DSA & AI</span>
              </div>
            </div>

            {/* Interactive Skill List */}
            <div className="space-y-1.5 pt-1">
              {SKILLS_DISTRIBUTION.slice(0, 4).map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: skill.color }} />
                    <span className="text-foreground font-medium truncate">{skill.name}</span>
                  </div>
                  <span className="text-muted-foreground font-bold">{skill.value}%</span>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => setStep("lab")}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs h-9 rounded-xl shadow-md gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Boost Your Skills Today
            </Button>
          </div>
        </div>

        {/* ─── ROW 2: Winner & Top Student Sliding Showcase ─── */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-card/80 to-purple-950/30 border-2 border-indigo-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Hall of Champions & Top Students
                  </h3>
                  <Badge className="bg-amber-500 text-black font-black text-[10px] px-2 py-0.5">
                    LIVE PODIUM
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Meet the highest-ranking algorithm gladiators and weekly challenge leaders.
                </p>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-muted-foreground mr-1 hidden sm:inline font-medium">
                {activeStudentIdx + 1} of {topStudents.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveStudentIdx((prev) => (prev - 1 + topStudents.length) % topStudents.length)
                }
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-foreground hover:text-primary transition-colors"
                title="Previous Champion"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveStudentIdx((prev) => (prev + 1) % topStudents.length)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-foreground hover:text-primary transition-colors"
                title="Next Champion"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Champion Spotlight Card (Sliding) */}
          {currentStudent && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 sm:p-6 rounded-2xl bg-black/40 border border-white/10 shadow-inner animate-in fade-in zoom-in-95 duration-300">
              {/* Contender Details & Profile */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStudent.name)}&background=6366f1&color=fff`}
                    alt={currentStudent.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStudent.name)}&background=6366f1&color=fff`
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md bg-muted"
                  />
                  <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black text-xs flex items-center justify-center shadow-md">
                    #{currentStudent.rank}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-white truncate">{currentStudent.name}</h4>
                    <span className="text-sm" title={currentStudent.countryCode}>
                      {getCountryFlag(currentStudent.countryCode)}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 font-bold flex items-center gap-1.5 mt-0.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentStudent.arenaRank}</span>
                    <span className="text-white/40">•</span>
                    <span>{currentStudent.city || "Global"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-black">
                      {currentStudent.arenaPoints} ELO
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-black">
                      {currentStudent.xp.toLocaleString()} XP
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-xs text-muted-foreground block font-bold">Win Rate</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">{currentStudent.winRate}%</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-bold">Battles Won</span>
                  <span className="text-base sm:text-lg font-black text-indigo-300">{currentStudent.wins}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-bold">Win Streak</span>
                  <span className="text-base sm:text-lg font-black text-rose-400 flex items-center justify-center gap-0.5">
                    <Flame className="w-4 h-4" /> {currentStudent.streak}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
                <Button
                  onClick={() => setStep("arena")}
                  className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-xs h-10 rounded-xl shadow-lg shadow-rose-600/20 gap-2"
                >
                  <Swords className="w-4 h-4" /> Challenge to 1v1 Battle
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("profile")}
                  className="border-white/10 text-white/80 hover:text-white hover:bg-white/10 font-bold text-xs h-10 rounded-xl gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-400" /> View Leaderboard Podium
                </Button>
              </div>
            </div>
          )}

          {/* Slider Pagination Thumbnails */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {topStudents.map((st, idx) => (
              <button
                key={st.userId || idx}
                type="button"
                onClick={() => setActiveStudentIdx(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeStudentIdx === idx
                    ? "w-8 h-2.5 bg-amber-400 shadow-md shadow-amber-400/50"
                    : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
                }`}
                title={`View #${st.rank} ${st.name}`}
              />
            ))}
          </div>
        </div>

        {/* ─── ROW 3: Engage Learning to Practice Action Pathways ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => setStep("lab")}
            className="p-6 rounded-3xl bg-card/60 border border-border/60 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-foreground mb-1 group-hover:text-indigo-400 transition-colors">
              Interactive Practice Lab
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Zero-setup code playground with automated unit testing in Python, C++, Java, and JS.
            </p>
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Compiler <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => setStep("arena")}
            className="p-6 rounded-3xl bg-card/60 border border-border/60 hover:border-rose-500/50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-foreground mb-1 group-hover:text-rose-400 transition-colors">
              Multiplayer 1v1 Arena
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Real-time synchronized duels, speed algorithmic challenges, and ELO rank progressions.
            </p>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Enter Battle Arena <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => setStep("upload")}
            className="p-6 rounded-3xl bg-card/60 border border-border/60 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-foreground mb-1 group-hover:text-emerald-400 transition-colors">
              Deep Exam Paper Predictor
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Upload university syllabus & past papers. Our neural networks compute high-yield question distributions.
            </p>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Analyze Syllabus <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeStudentEngagement
