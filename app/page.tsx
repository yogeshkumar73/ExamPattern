"use client"

import React from "react"
import ExamAnalyzer from "@/components/exam-analyzer"
import { useNav } from "@/hooks/use-nav"
import { HomeHeroSlider } from "@/components/home-hero-slider"
import { HomeStudentEngagement } from "@/components/home-student-engagement"
import { PracticePlatformShowcase } from "@/components/practice-platform-showcase"
import { PlatformVision } from "@/components/platform-vision"
import { VisionSlider } from "@/components/vision-slider"
import { Brain, ChevronLeft, Sparkles, Swords, Code2, GraduationCap, ShieldCheck, HeartHandshake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { currentStep, setStep } = useNav()

  // If user explicitly navigated to a dedicated tool workspace (e.g. Arena, Lab, Admin, Profile, Guider, etc.)
  if (currentStep !== "home") {
    return (
      <main className="flex-1 w-full min-h-[calc(100vh-4rem)]">
        {/* Navigation Breadcrumb to return to Home */}
        <div className="border-b bg-background/95 backdrop-blur-md sticky top-16 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("home")
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              className="h-8 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Home Overview</span>
            </Button>
            <Badge variant="outline" className="text-[11px] font-mono uppercase tracking-widest text-primary border-primary/30">
              Active Mode: {currentStep}
            </Badge>
          </div>
        </div>

        {/* Dedicated Workspace View */}
        <div id="analyzer" className="w-full">
          <ExamAnalyzer />
        </div>
      </main>
    )
  }

  // Home Landing Page View: Welcoming New Students, Practice Platform, and Vision
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* 1. Hero Slide Component: Welcomes New Users & Dynamic Feature Redirects */}
      <HomeHeroSlider />

      {/* 2. Real-Time Student Activity Graph, Skill Pie Chart & Top Winners Showcase */}
      <HomeStudentEngagement />

      {/* 3. Practice Platform Showcase: Interactive Compiler, Challenges, & 1v1 PvP Preview */}
      <PracticePlatformShowcase />

      {/* 3. Platform Vision Component: Vasudhaiva Kutumbakam & Future of Student Education */}
      <PlatformVision />

      {/* 4. Vasudhaiva Kutumbakam Continuous 10-Theme Cultural Slider */}
      <div className="border-b bg-background/50">
        <VisionSlider />
      </div>

      {/* 5. Exam Pattern Analyzer Quick Access & Input Section */}
      <section id="analyzer" className="scroll-mt-20 py-16 bg-muted/10 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="outline" className="mb-3 py-1 px-3 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
              AI EXAM SUITE
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              Deep Syllabus & Question Paper Predictor
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Extract syllabus topic weights and historical question patterns directly below.
            </p>
          </div>

          <ExamAnalyzer />
        </div>
      </section>

      {/* 6. Professional Academic Footer */}
      <footer className="py-14 border-t bg-card text-card-foreground">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-black text-lg text-primary">
                <Brain className="w-6 h-6" />
                <span>Aura Study AI</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empowering university and engineering students globally with high-velocity algorithmic practice, real-time 1v1 battle arenas, and deep learning exam prediction.
              </p>
              <div className="text-xs font-semibold text-emerald-500">
                • Vasudhaiva Kutumbakam (वसुधैव कुटुम्बकम्)
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-foreground">Practice Platforms</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <button onClick={() => setStep("lab")} className="hover:text-primary transition-colors">
                    Interactive Web Compiler
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("arena")} className="hover:text-primary transition-colors">
                    1v1 Algorithm Battle Arena
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("lab")} className="hover:text-primary transition-colors">
                    Curated Problem Bank
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("guider")} className="hover:text-primary transition-colors">
                    AI Socratic Guider & Debugger
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-foreground">Academic AI</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <button onClick={() => setStep("upload")} className="hover:text-primary transition-colors">
                    Syllabus Topic Weighting
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("community")} className="hover:text-primary transition-colors">
                    Past Question Paper Repository
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("guider")} className="hover:text-primary transition-colors">
                    Technical Mock Interviews
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("chat")} className="hover:text-primary transition-colors">
                    Student Discussion Forum
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-foreground">Platform</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <button onClick={() => setStep("policy")} className="hover:text-primary transition-colors">
                    Terms & Academic Integrity
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("feedback")} className="hover:text-primary transition-colors">
                    Submit Student Feedback
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("developer")} className="hover:text-primary transition-colors">
                    Developer Architecture
                  </button>
                </li>
                <li>
                  <button onClick={() => setStep("community-join")} className="hover:text-primary transition-colors">
                    Join WhatsApp Community
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              © 2026 Aura Study AI. Built for academic excellence & cognitive empowerment.
            </div>
            <div className="flex items-center gap-4">
              <span>Sa Vidya Ya Vimuktaye (सा विद्या या विमुक्तये)</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
