"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Swords,
  Code2,
  Brain,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Trophy,
  Users,
  Target,
  Zap,
  CheckCircle,
  GraduationCap,
  Laptop
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNav, type Step } from "@/hooks/use-nav"

interface SlideData {
  id: string
  badge: string
  title: string
  subtitle: string
  description: string
  ctaPrimary: {
    label: string
    step: Step
    icon: any
  }
  ctaSecondary?: {
    label: string
    step: Step
    icon?: any
  }
  gradient: string
  accentColor: string
  stats: { label: string; value: string }[]
  previewCard: {
    tag: string
    title: string
    meta: string
    icon: any
  }
}

const HERO_SLIDES: SlideData[] = [
  {
    id: "welcome",
    badge: "Welcome to Aura Prime v2.0",
    title: "The Ultimate AI Academic & Practice Ecosystem",
    subtitle: "Built for Ambitious Engineering & University Students",
    description: "Master algorithms in our interactive practice lab, duel peers in real-time battle arenas, and predict exam questions using deep learning — all in one unified platform.",
    ctaPrimary: {
      label: "Launch Practice Lab",
      step: "lab",
      icon: Code2,
    },
    ctaSecondary: {
      label: "Enter Battle Arena",
      step: "arena",
      icon: Swords,
    },
    gradient: "from-indigo-600/20 via-purple-600/10 to-transparent",
    accentColor: "#6366F1",
    stats: [
      { label: "Active Contenders", value: "10K+" },
      { label: "Practice Challenges", value: "500+" },
      { label: "Prediction Accuracy", value: "94%" },
    ],
    previewCard: {
      tag: "Interactive Platform",
      title: "Zero Setup • Instant Coding • Real-time AI Mentorship",
      meta: "Python, C++, Java, JavaScript & TypeScript supported",
      icon: Laptop,
    },
  },
  {
    id: "arena",
    badge: "⚔️ Multiplayer 1v1 Battle Arena",
    title: "Compete Live. Duel Friends. Rise to Diamond.",
    subtitle: "Real-time Synchronized Competitive Coding & Quizzes",
    description: "Challenge your classmates or queue for random matchmaking in 1v1 speed battles. Climb dynamic tier ranks from Bronze to Diamond with live streak multipliers and trophy rewards.",
    ctaPrimary: {
      label: "Enter Battle Arena",
      step: "arena",
      icon: Swords,
    },
    ctaSecondary: {
      label: "View Real-Time Ranks",
      step: "arena",
      icon: Trophy,
    },
    gradient: "from-rose-600/20 via-orange-600/10 to-transparent",
    accentColor: "#F43F5E",
    stats: [
      { label: "Matchmaking Delay", value: "<10s" },
      { label: "Leaderboard Ranks", value: "100% Real" },
      { label: "Competitive Tiers", value: "Bronze to Diamond" },
    ],
    previewCard: {
      tag: "Live Arena Duel",
      title: "Synchronized Real-Time 1v1 Coding & Rapid Quizzes",
      meta: "Strict descending rank order • Streak bonus XP",
      icon: Swords,
    },
  },
  {
    id: "lab",
    badge: "💻 Smart Practice Platform",
    title: "Interactive Web Compiler & Problem Challenges",
    subtitle: "From Easy Data Structures to Hard Dynamic Programming",
    description: "Sharpen your algorithmic problem solving with automated test runners, memory benchmarks, and progressive AI guidance that teaches you first principles without spoiling answers.",
    ctaPrimary: {
      label: "Explore Practice Lab",
      step: "lab",
      icon: Code2,
    },
    ctaSecondary: {
      label: "Solve Challenges",
      step: "lab",
      icon: Zap,
    },
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    accentColor: "#10B981",
    stats: [
      { label: "Supported Languages", value: "5+ Core" },
      { label: "Test Runner Speed", value: "<15ms" },
      { label: "Curated Problems", value: "All Levels" },
    ],
    previewCard: {
      tag: "Code Playground",
      title: "In-Browser Execution with Automated Edge Testing",
      meta: "Test cases, time complexity analysis & clean syntax",
      icon: Code2,
    },
  },
  {
    id: "predictor",
    badge: "🧠 Deep Learning Exam Predictor",
    title: "Intelligent Syllabus & Past-Paper Pattern Analysis",
    subtitle: "Identify High-Yield Topics & Probable University Questions",
    description: "Upload your syllabus documents and previous years' question papers. Our deep-learning models analyze question recurrence, unit weights, and probability distributions with unmatched accuracy.",
    ctaPrimary: {
      label: "Predict Exam Papers",
      step: "upload",
      icon: Brain,
    },
    ctaSecondary: {
      label: "Browse Paper Repository",
      step: "community",
      icon: BookOpen,
    },
    gradient: "from-amber-600/20 via-yellow-600/10 to-transparent",
    accentColor: "#F59E0B",
    stats: [
      { label: "Pattern Accuracy", value: "94%" },
      { label: "Engineering Units", value: "All Streams" },
      { label: "PDF Extraction", value: "Instant" },
    ],
    previewCard: {
      tag: "Exam Intelligence",
      title: "Statistical Question Weighting & Unit Recurrence",
      meta: "Historical pattern matching & blueprint generation",
      icon: Brain,
    },
  },
  {
    id: "guider",
    badge: "🎙️ AI Mock Interview & Guider",
    title: "Master Technical & Behavioral Interviews with AI",
    subtitle: "Real-time Voice & Chat Simulation for Top Tech Companies",
    description: "Practice real coding interview rounds with our 24/7 AI Guider. Receive instant constructive feedback on communication clarity, system design reasoning, and algorithm efficiency.",
    ctaPrimary: {
      label: "Start Mock Interview",
      step: "guider",
      icon: Sparkles,
    },
    ctaSecondary: {
      label: "Student Community",
      step: "community",
      icon: Users,
    },
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    accentColor: "#3B82F6",
    stats: [
      { label: "Simulated Roles", value: "SDE, AI, DevOps" },
      { label: "Feedback Report", value: "Comprehensive" },
      { label: "Availability", value: "24/7 On Demand" },
    ],
    previewCard: {
      tag: "AI Career Prep",
      title: "Real-Time Voice & Behavioral SDE Interview Evaluation",
      meta: "Rubric-based grading & code architecture analysis",
      icon: Sparkles,
    },
  },
]

export function HomeHeroSlider() {
  const { setStep, isRegistered, sessionUser } = useNav()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const activeSlide = HERO_SLIDES[currentIdx]

  // Slide navigation
  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return
    timerRef.current = setInterval(nextSlide, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, currentIdx])

  const handleRedirect = (step: Step) => {
    setStep(step)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-muted/20 to-background py-8 sm:py-16 md:py-20">
      {/* Background radial glow matching current slide accent */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${activeSlide.accentColor}18 0%, transparent 70%)`,
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Banner for New / Returning Students */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
              {isRegistered && sessionUser ? (
                <>Welcome back, <strong className="text-foreground">{sessionUser.name}</strong> • Ready to practice today?</>
              ) : (
                <>Welcome New Student! Explore our Practice Platform & Battle Arena freely.</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {!isRegistered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRedirect("onboarding")}
                className="h-8 text-xs font-bold rounded-lg border-primary/30 hover:border-primary text-primary"
              >
                Sign In / Register
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-bold">
                Student Account Active
              </Badge>
            )}
            <div className="hidden sm:flex items-center gap-1 text-muted-foreground font-mono">
              <span>{currentIdx + 1}</span>
              <span>/</span>
              <span>{HERO_SLIDES.length}</span>
            </div>
          </div>
        </div>

        {/* Main Slide Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Slide Content */}
          <div className="lg:col-span-7 space-y-6 transition-all duration-500">
            {/* Animated Slide Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-background/80 backdrop-blur shadow-sm text-xs sm:text-sm font-bold text-foreground">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeSlide.accentColor }} />
              {activeSlide.badge}
            </div>

            {/* Slide Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                {activeSlide.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                {activeSlide.subtitle}
              </p>
            </div>

            {/* Slide Description */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {activeSlide.description}
            </p>

            {/* Call-to-action Redirect Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => handleRedirect(activeSlide.ctaPrimary.step)}
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-black text-sm sm:text-base gap-2.5 shadow-xl hover:scale-105 transition-all text-white"
                style={{ backgroundColor: activeSlide.accentColor }}
              >
                <activeSlide.ctaPrimary.icon className="w-5 h-5" />
                {activeSlide.ctaPrimary.label}
                <ArrowRight className="w-4 h-4" />
              </Button>

              {activeSlide.ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleRedirect(activeSlide.ctaSecondary.step)}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base gap-2 bg-background/60 hover:bg-muted border-border/80"
                >
                  {activeSlide.ctaSecondary.icon && <activeSlide.ctaSecondary.icon className="w-4 h-4 text-muted-foreground" />}
                  {activeSlide.ctaSecondary.label}
                </Button>
              )}
            </div>

            {/* Dynamic Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/40 max-w-lg">
              {activeSlide.stats.map((stat, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-lg sm:text-xl font-black text-foreground">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-muted-foreground truncate">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Feature Card Preview */}
          <div className="lg:col-span-5">
            <div
              className="relative p-6 sm:p-8 rounded-3xl border-2 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl shadow-2xl transition-all duration-500 overflow-hidden group hover:border-primary/50"
              style={{ borderColor: `${activeSlide.accentColor}40` }}
            >
              {/* Subtle Ambient Light */}
              <div
                className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: activeSlide.accentColor }}
              />

              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {activeSlide.previewCard.tag}
                </span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: activeSlide.accentColor }}
                >
                  <activeSlide.previewCard.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Card Body */}
              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                {activeSlide.previewCard.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                {activeSlide.previewCard.meta}
              </p>

              {/* Quick Feature Pills */}
              <div className="space-y-2.5 mb-6 text-xs font-semibold">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Instant browser access • No local installation required</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Real-time score sync & dynamic ranking comparison</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Deep Socratic guidance powered by Deep Learning AI</span>
                </div>
              </div>

              {/* Direct Card Action Button */}
              <Button
                onClick={() => handleRedirect(activeSlide.ctaPrimary.step)}
                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-foreground text-background hover:opacity-90"
              >
                <span>Jump Directly to {activeSlide.ctaPrimary.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Slide Controls & Carousel Thumbnails */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-border/40">
          {/* Slide Indicator Dots & Quick Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIdx(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  currentIdx === idx
                    ? "bg-foreground text-background shadow-md scale-105"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: slide.accentColor }}
                />
                <span className="hidden sm:inline">{slide.badge.replace(/^[^\w]+/, '')}</span>
                <span className="sm:hidden">#{idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Prev / Play / Next Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-9 h-9 rounded-xl border-border/60 hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              className="w-9 h-9 rounded-xl border-border/60 hover:bg-muted"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-9 h-9 rounded-xl border-border/60 hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
