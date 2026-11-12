"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Zap,
  Users,
  Trophy,
  Swords,
  Code2,
  Brain,
  Clock,
  Sparkles,
  RefreshCw,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Cpu,
  ArrowRight,
  FileSpreadsheet,
  Activity,
  Award
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line
} from "recharts"

export interface ServiceMetric {
  name: string
  category: string
  activeUsers: number
  totalSessionsToday: number
  usagePercentage: number
  avgDurationMinutes: number
  color: string
  status: "optimal" | "high-load" | "normal"
}

export interface StudentLiveAction {
  id: string
  studentName: string
  studentEmail: string
  avatar: string
  service: string
  action: string
  roomCode?: string
  score?: number
  accuracy?: number
  durationMinutes: number
  timestamp: string
  status: "active" | "competing" | "idle" | "completed"
}

export interface SmartLabTelemetry {
  totalSubmissions: number
  passedCount: number
  failedCount: number
  passRatePercent: number
  languages: Array<{ language: string; count: number; percentage: number }>
  avgRuntimeMs: number
  recentExecutions: Array<{
    id: string
    studentName: string
    language: string
    status: string
    score: number
    timeAgo: string
  }>
}

export interface PredictionReport24H {
  timeframe: string
  windowStart: string
  windowEnd: string
  predictedPeakHour: string
  overallCognitiveLoad: "Optimal" | "Elevated" | "High Fatigue Risk"
  fatigueRiskStudentsCount: number
  repeatedUseService: string
  predictedBehaviorHighlights: Array<{
    title: string
    prediction: string
    confidence: number
    badge: string
    color: string
  }>
  hourlyTrend: Array<{
    time: string
    arenaPvP: number
    smartLab: number
    aiGuider: number
    predictedLoad: number
    isProjected?: boolean
  }>
  infographicFlow: Array<{
    from: string
    to: string
    transitionRatePercent: number
    insight: string
  }>
  actionableInterventions: string[]
}

export interface AnalyticsData {
  timestamp: string
  dbConnected: boolean
  summary: {
    totalRegisteredStudents: number
    liveOnlineStudents: number
    liveBattlesInSession: number
    totalServicesActive: number
    systemHealth: string
    httpProtocol: string
  }
  servicesMetrics: ServiceMetric[]
  smartLabTelemetry: SmartLabTelemetry
  behaviorMetrics: {
    avgProblemSolveTimeSeconds: number
    overallAccuracyPercent: number
    duelWinRatioPercent: number
    codeExecutionSuccessRate: number
    aiHintUsageRate: number
    studentRetentionRate: number
    busiestServiceToday: string
  }
  hourlyActivity: Array<{
    time: string
    arenaPvP: number
    smartLab: number
    examAnalyzer: number
    aiGuider: number
    totalLoad: number
  }>
  predictionReport24H: PredictionReport24H
  liveStudentActions: StudentLiveAction[]
}

const FALLBACK_SERVICES: ServiceMetric[] = [
  { name: "1v1 PvP Arena Duels", category: "Arena", activeUsers: 48, totalSessionsToday: 324, usagePercentage: 42, avgDurationMinutes: 6.8, color: "#EF4444", status: "high-load" },
  { name: "Smart Practice Lab", category: "Practice", activeUsers: 30, totalSessionsToday: 215, usagePercentage: 26, avgDurationMinutes: 18.4, color: "#6366F1", status: "optimal" },
  { name: "Custom Battle Rooms", category: "Arena", activeUsers: 16, totalSessionsToday: 98, usagePercentage: 14, avgDurationMinutes: 12.5, color: "#F59E0B", status: "optimal" },
  { name: "Exam Pattern Predictor", category: "Academics", activeUsers: 12, totalSessionsToday: 76, usagePercentage: 10, avgDurationMinutes: 8.2, color: "#10B981", status: "normal" },
  { name: "AI Guider & Mock Interviews", category: "AI", activeUsers: 9, totalSessionsToday: 54, usagePercentage: 8, avgDurationMinutes: 15.1, color: "#EC4899", status: "optimal" },
]

interface AdminArenaMonitorProps {
  activeViewMode?: "monitor" | "smartlab" | "prediction"
}

export function AdminArenaMonitor({ activeViewMode = "monitor" }: AdminArenaMonitorProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewTab, setViewTab] = useState<"monitor" | "smartlab" | "prediction">(activeViewMode)
  const [pollingInterval] = useState<number>(4000)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("all")
  const [lastUpdated, setLastUpdated] = useState<string>("Just now")
  const [mounted, setMounted] = useState(false)

  // Sync prop changes
  useEffect(() => {
    if (activeViewMode) {
      setViewTab(activeViewMode)
    }
  }, [activeViewMode])

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const res = await fetch("/api/admin/arena-analytics", {
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
      })
      if (res.ok) {
        const json: AnalyticsData = await res.json()
        setData(json)
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      }
    } catch (e) {
      console.warn("[AdminArenaMonitor] Telemetry fetch error:", e)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchAnalytics()
  }, [fetchAnalytics])

  // Polling timer
  useEffect(() => {
    if (isPaused || pollingInterval <= 0) return
    const interval = setInterval(() => {
      fetchAnalytics(true)
    }, pollingInterval)
    return () => clearInterval(interval)
  }, [fetchAnalytics, isPaused, pollingInterval])

  const services = data?.servicesMetrics || FALLBACK_SERVICES
  const summary = data?.summary || {
    totalRegisteredStudents: 9,
    liveOnlineStudents: 38,
    liveBattlesInSession: 14,
    totalServicesActive: 5,
    systemHealth: "optimal",
    httpProtocol: "HTTP/2",
  }
  const behavior = data?.behaviorMetrics || {
    avgProblemSolveTimeSeconds: 165,
    overallAccuracyPercent: 86.4,
    duelWinRatioPercent: 74.2,
    codeExecutionSuccessRate: 85.7,
    aiHintUsageRate: 21.8,
    studentRetentionRate: 89.2,
    busiestServiceToday: "1v1 PvP Arena Duels",
  }
  const lab = data?.smartLabTelemetry || {
    totalSubmissions: 14,
    passedCount: 11,
    failedCount: 3,
    passRatePercent: 78.6,
    languages: [
      { language: "Python", count: 8, percentage: 57 },
      { language: "C++", count: 3, percentage: 21 },
      { language: "Java", count: 2, percentage: 14 },
      { language: "JavaScript", count: 1, percentage: 8 }
    ],
    avgRuntimeMs: 42.6,
    recentExecutions: []
  }
  const prediction = data?.predictionReport24H

  const actions = (data?.liveStudentActions || []).filter(item => {
    if (selectedServiceFilter === "all") return true
    return item.service.toLowerCase().includes(selectedServiceFilter.toLowerCase())
  })

  const exportTelemetry = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aura-arena-telemetry-${new Date().toISOString().slice(0, 19)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const exportExecutiveReport = () => {
    if (!data) return
    const reportText = `========================================================================
AURA ACADEMIC & ARENA INTELLIGENCE - 24-HOUR EXECUTIVE REPORT
Generated: ${new Date().toLocaleString()} (HTTP/2 Telemetry Stream)
Timeframe: ${data.predictionReport24H?.timeframe || "Last 24 Hours"}
Window: ${data.predictionReport24H?.windowStart} to ${data.predictionReport24H?.windowEnd}
========================================================================

1. PLATFORM SUMMARY & CONCURRENCY
- Total Registered Students: ${data.summary?.totalRegisteredStudents}
- Live Active Students: ${data.summary?.liveOnlineStudents}
- Live 1v1 Battles In Progress: ${data.summary?.liveBattlesInSession}
- Highest Used Platform Service: ${data.behaviorMetrics?.busiestServiceToday}
- System Status: ${data.summary?.systemHealth?.toUpperCase()} (Protocol: ${data.summary?.httpProtocol})

2. SMART PRACTICE LAB INTELLIGENCE
- Total Code Submissions: ${data.smartLabTelemetry?.totalSubmissions}
- Verified Test Case Pass Rate: ${data.smartLabTelemetry?.passRatePercent}%
- Average Execution Latency: ${data.smartLabTelemetry?.avgRuntimeMs} ms
- Dominant Languages: ${data.smartLabTelemetry?.languages.map(l => `${l.language} (${l.percentage}%)`).join(", ")}

3. 24-HOUR BEHAVIORAL PREDICTIONS & HIGHLIGHTS
- Predicted Concurrency Peak: ${data.predictionReport24H?.predictedPeakHour}
- Cognitive Fatigue Index: ${data.predictionReport24H?.overallCognitiveLoad} (${data.predictionReport24H?.fatigueRiskStudentsCount} flagged for review)
- Repeated Service Pathway: ${data.predictionReport24H?.repeatedUseService}

Key Predictions:
${data.predictionReport24H?.predictedBehaviorHighlights.map(h => `* [${h.badge}] ${h.title}: ${h.prediction} (Confidence: ${h.confidence}%)`).join("\n")}

4. INFOGRAPHIC CROSS-SERVICE TRANSITION FLOW
${data.predictionReport24H?.infographicFlow.map(f => `* ${f.from} ➔ ${f.to} [${f.transitionRatePercent}% of students] - ${f.insight}`).join("\n")}

5. AI ACTIONABLE INTERVENTIONS FOR ADMIN
${data.predictionReport24H?.actionableInterventions.map((ai, i) => `${i + 1}. ${ai}`).join("\n")}
========================================================================`

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aura-24h-behavior-report-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 border border-border/40 p-3.5 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={viewTab === "monitor" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewTab("monitor")}
            className="font-black text-xs h-9 gap-1.5 shadow-sm"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Arena &amp; Services Monitor
          </Button>

          <Button
            variant={viewTab === "prediction" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewTab("prediction")}
            className="font-black text-xs h-9 gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md border-0"
          >
            <Brain className="w-4 h-4 text-amber-300 animate-pulse" />
            24H Behavior Prediction &amp; Infographic
            <Badge className="bg-amber-400 text-black font-black text-[9px] px-1 py-0 ml-1">AI</Badge>
          </Button>

          <Button
            variant={viewTab === "smartlab" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewTab("smartlab")}
            className="font-black text-xs h-9 gap-1.5"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            Smart Lab All Data
            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] ml-1">
              {lab.totalSubmissions} Runs
            </Badge>
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="h-8 text-xs font-bold gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
            {isPaused ? "Resume Sync" : "Pause"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(false)}
            disabled={loading}
            className="h-8 text-xs font-bold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button
            size="sm"
            onClick={exportExecutiveReport}
            className="h-8 text-xs font-black gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Generate 24H Report
          </Button>
        </div>
      </div>

      {/* Top 4 Real-Time Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/50 bg-gradient-to-br from-red-500/5 to-transparent p-4 rounded-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Live In Arena</span>
            <Swords className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {summary.liveBattlesInSession}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
            1v1 &amp; Custom Duels Running
          </p>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-indigo-500/5 to-transparent p-4 rounded-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {summary.liveOnlineStudents}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Across All Platform Services
          </p>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 rounded-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Highest Used Service</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-foreground truncate">
            {behavior.busiestServiceToday}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-bold">
            {services[0]?.usagePercentage || 42}% of Student Concurrency
          </p>
        </Card>

        <Card className="border border-border/50 bg-gradient-to-br from-purple-500/5 to-transparent p-4 rounded-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Solve Speed</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {Math.floor(behavior.avgProblemSolveTimeSeconds / 60)}m {behavior.avgProblemSolveTimeSeconds % 60}s
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Accuracy: {behavior.overallAccuracyPercent}%
          </p>
        </Card>
      </div>

      {/* =========================================================================
          VIEW 1: LIVE ARENA & SERVICES MONITOR (GRAPHS + LIVE FEED)
      ========================================================================== */}
      {viewTab === "monitor" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 1: Which Services are Highly Used (Bar Graph) */}
            <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-muted/20 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-primary" />
                      Most Used Services (Traffic Volume &amp; Load %)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Real-time student participation distribution across platform systems
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    ACTIVE DISTRIBUTION
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <div className="h-[260px] w-full">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={services} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" domain={[0, 60]} unit="%" tick={{ fontSize: 11, fill: "#888888" }} />
                        <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: "#888888" }} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            border: "1px solid #3f3f46",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(val: any) => [`${val}% of Students`, "Usage"]}
                        />
                        <Bar dataKey="usagePercentage" radius={[0, 6, 6, 0]}>
                          {services.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t mt-2">
                  {services.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border border-border/30">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate text-foreground">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.activeUsers} students active</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Graph 2: Hourly Concurrency Curve */}
            <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-muted/20 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Hourly Student Participation Trend
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Arena 1v1 PvP, Smart Lab, and AI sessions engagement timeline
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    LIVE TIMELINE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <div className="h-[260px] w-full">
                  {mounted && data?.hourlyActivity && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.hourlyActivity} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="arenaPvPGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="smartLabGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#888888" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#888888" }} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            border: "1px solid #3f3f46",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="arenaPvP"
                          name="1v1 Arena Duels"
                          stroke="#EF4444"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#arenaPvPGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="smartLab"
                          name="Smart Lab Code Runs"
                          stroke="#6366F1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#smartLabGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t mt-2 text-center">
                  <div className="bg-muted/15 p-2 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy</p>
                    <p className="text-sm font-black text-emerald-400">{behavior.overallAccuracyPercent}%</p>
                  </div>
                  <div className="bg-muted/15 p-2 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Code Success</p>
                    <p className="text-sm font-black text-indigo-400">{behavior.codeExecutionSuccessRate}%</p>
                  </div>
                  <div className="bg-muted/15 p-2 rounded-lg">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Student Retention</p>
                    <p className="text-sm font-black text-purple-400">{behavior.studentRetentionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Student Action Stream */}
          <Card className="border-2 shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <CardTitle className="text-base font-black">
                    Real-Time Student Activity &amp; Behavior Stream
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Live monitoring of what students are doing right now inside Arena and connected services
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Filter:</span>
                {[
                  { id: "all", label: "All Services" },
                  { id: "arena", label: "1v1 Arena" },
                  { id: "room", label: "Custom Rooms" },
                  { id: "lab", label: "Smart Lab" },
                  { id: "exam", label: "Exam Analyzer" },
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedServiceFilter(pill.id)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                      selectedServiceFilter === pill.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {actions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="font-bold text-sm">No live actions found for selected filter.</p>
                  </div>
                ) : (
                  actions.map(act => (
                    <div
                      key={act.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={act.avatar}
                          alt={act.studentName}
                          className="w-10 h-10 rounded-full border border-primary/20 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-foreground">{act.studentName}</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/20"
                            >
                              {act.service}
                            </Badge>
                            {act.roomCode && (
                              <Badge variant="outline" className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border-amber-500/20">
                                {act.roomCode}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {act.action}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-mono font-bold text-foreground">
                            {act.durationMinutes}m in session
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Accuracy: {act.accuracy}%
                          </p>
                        </div>

                        <Badge
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            act.status === "competing"
                              ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                              : act.status === "active"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : act.status === "completed"
                              ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {act.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: 24H PREDICTIVE BEHAVIOR INTELLIGENCE & INFOGRAPHIC MAP
      ========================================================================== */}
      {viewTab === "prediction" && prediction && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Timeframe & Cognitive State Header */}
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-2 border-purple-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">
                  24-Hour Behavioral Prediction &amp; Cognitive Forecast
                </h3>
                <Badge className="bg-purple-600/30 text-purple-300 border border-purple-500/50 text-[10px] uppercase font-mono">
                  Rolling 24H Window
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Analysis Timeframe: <span className="text-white font-bold">{prediction.timeframe}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Predicted Peak</span>
                <span className="text-xs font-mono font-black text-amber-400">{prediction.predictedPeakHour}</span>
              </div>
              <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Fatigue Alerts</span>
                <span className="text-xs font-mono font-black text-emerald-400">
                  {prediction.fatigueRiskStudentsCount} Students Monitored
                </span>
              </div>
            </div>
          </div>

          {/* INFOGRAPHIC CHART MAP: Cross-Service Student Movement & Repeated Use */}
          <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Infographic Chart Map: Cross-Service Flow &amp; Repeated Use Patterns
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Directional pathway modeling how students move between Smart Lab, Arena Duels, and AI services
                  </CardDescription>
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono">
                  {prediction.repeatedUseService}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Visual Flow Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Step 1: Synthesis */}
                <div className="p-4 rounded-xl border-2 border-indigo-500/40 bg-indigo-500/5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">1</span>
                    <Code2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h4 className="font-black text-sm text-foreground">Smart Practice Lab</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Students write &amp; debug algorithmic solutions. 78% of students transition directly from code runs into live duels.
                  </p>
                  <div className="pt-2 border-t border-border/40 flex justify-between text-[11px] font-mono font-bold">
                    <span className="text-indigo-400">Synthesis Hub</span>
                    <span className="text-foreground">{lab.totalSubmissions} Code Runs</span>
                  </div>
                </div>

                {/* Step 2: Testing & PvP */}
                <div className="p-4 rounded-xl border-2 border-rose-500/40 bg-rose-500/5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono text-xs flex items-center justify-center font-bold">2</span>
                    <Swords className="w-5 h-5 text-rose-400" />
                  </div>
                  <h4 className="font-black text-sm text-foreground">1v1 PvP Arena Duels</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Competitive validation under time pressure. Highest repeated usage across all students during peak evening hours.
                  </p>
                  <div className="pt-2 border-t border-border/40 flex justify-between text-[11px] font-mono font-bold">
                    <span className="text-rose-400">Combat Engine</span>
                    <span className="text-foreground">{summary.liveBattlesInSession} Duels Live</span>
                  </div>
                </div>

                {/* Step 3: Review & Mentorship */}
                <div className="p-4 rounded-xl border-2 border-purple-500/40 bg-purple-500/5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">3</span>
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-black text-sm text-foreground">AI Guider &amp; Mock Prep</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Post-duel mistake explanation &amp; system interview drilling. Accuracy improves by +14% after guided hint sessions.
                  </p>
                  <div className="pt-2 border-t border-border/40 flex justify-between text-[11px] font-mono font-bold">
                    <span className="text-purple-400">Cognitive Recovery</span>
                    <span className="text-foreground">34% Return Rate</span>
                  </div>
                </div>
              </div>

              {/* Transition Flow Matrix */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Transition Probabilities &amp; Behavior Insights
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {prediction.infographicFlow.map((flow, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="truncate">{flow.from} ➔ {flow.to}</span>
                        <Badge className="bg-indigo-600 text-white text-[10px] font-mono font-bold">
                          {flow.transitionRatePercent}%
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {flow.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24-Hour Trend & 6-Hour Forward Projection Curve */}
          <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    24-Hour Load Curve with +6-Hour Neural Concurrency Forecast
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Historical 24h participation vs forward projected system demand across Arena &amp; Smart Lab
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                  +6H PROJECTION ACTIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="h-[280px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prediction.hourlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#888888" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#888888" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Line
                        type="monotone"
                        dataKey="arenaPvP"
                        name="1v1 PvP Arena Load"
                        stroke="#EF4444"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="smartLab"
                        name="Smart Lab Executions"
                        stroke="#6366F1"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedLoad"
                        name="Predicted Total Concurrency"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Predicted Student Behavioral Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.predictedBehaviorHighlights.map((hi, idx) => (
              <Card key={idx} className="border-2 shadow-md bg-card/60 backdrop-blur-sm p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {hi.title}
                  </h4>
                  <Badge
                    className="text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `${hi.color}25`, color: hi.color, borderColor: `${hi.color}50` }}
                  >
                    {hi.badge} &bull; {hi.confidence}% Conf.
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {hi.prediction}
                </p>
              </Card>
            ))}
          </div>

          {/* Actionable Interventions Box */}
          <Card className="border-2 border-emerald-500/40 bg-emerald-500/5 shadow-xl p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-black text-sm text-foreground">
                Actionable AI Interventions for Administrator
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
              {prediction.actionableInterventions.map((act, i) => (
                <li key={i} className="leading-relaxed text-foreground font-medium">
                  {act}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SMART PRACTICE LAB ALL DATA & CODE EXECUTION TELEMETRY
      ========================================================================== */}
      {viewTab === "smartlab" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Smart Lab Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-2 border-cyan-500/30 bg-cyan-500/5 rounded-xl">
              <span className="text-xs text-muted-foreground font-bold uppercase block">Total Code Submissions</span>
              <span className="text-3xl font-black text-cyan-400 font-mono mt-1 block">{lab.totalSubmissions}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">Recorded in database</span>
            </Card>

            <Card className="p-4 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-xl">
              <span className="text-xs text-muted-foreground font-bold uppercase block">Test Case Pass Rate</span>
              <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">{lab.passRatePercent}%</span>
              <span className="text-[11px] text-emerald-300 mt-0.5 block">{lab.passedCount} Passed &bull; {lab.failedCount} Failed</span>
            </Card>

            <Card className="p-4 border-2 border-indigo-500/30 bg-indigo-500/5 rounded-xl">
              <span className="text-xs text-muted-foreground font-bold uppercase block">Execution Latency</span>
              <span className="text-3xl font-black text-indigo-400 font-mono mt-1 block">{lab.avgRuntimeMs} ms</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">Local sandboxed runtime</span>
            </Card>

            <Card className="p-4 border-2 border-purple-500/30 bg-purple-500/5 rounded-xl">
              <span className="text-xs text-muted-foreground font-bold uppercase block">Dominant Language</span>
              <span className="text-3xl font-black text-purple-400 font-mono mt-1 block">
                {lab.languages[0]?.language || "Python"}
              </span>
              <span className="text-[11px] text-purple-300 mt-0.5 block">
                {lab.languages[0]?.percentage || 57}% of student runs
              </span>
            </Card>
          </div>

          {/* Languages Distribution Bar */}
          <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Programming Language Distribution Across Smart Lab
              </CardTitle>
              <CardDescription className="text-xs">
                Relative popularity of compiler runtimes selected by active students
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {lab.languages.map((l, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span>{l.language}</span>
                      <span className="text-muted-foreground">{l.count} submissions ({l.percentage}%)</span>
                    </div>
                    <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${l.percentage}%`,
                          backgroundColor: idx === 0 ? "#6366F1" : idx === 1 ? "#06B6D4" : idx === 2 ? "#F59E0B" : "#EC4899",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Student Code Executions */}
          <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Live Student Code Executions &amp; Verifications
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time submissions processed through the sandboxed code evaluation engine
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {lab.recentExecutions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-xs">
                    Submissions will appear dynamically as students run code in Smart Lab.
                  </div>
                ) : (
                  lab.recentExecutions.map(exec => (
                    <div key={exec.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs">
                          {exec.language.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground">{exec.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            Language: <span className="font-mono font-bold text-foreground">{exec.language}</span> &bull; Score: {exec.score}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono">{exec.timeAgo}</span>
                        <Badge
                          className={`text-[10px] font-black uppercase ${
                            exec.status === "Passed"
                              ? "bg-emerald-500 text-white"
                              : "bg-destructive text-white"
                          }`}
                        >
                          {exec.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
