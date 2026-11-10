"use client"

import React, { useState } from "react"
import {
  Globe2,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  Lightbulb,
  Compass,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users2,
  Flame
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNav } from "@/hooks/use-nav"

interface VisionPillar {
  id: string
  sanskrit: string
  title: string
  subtitle: string
  description: string
  icon: any
  gradient: string
  borderColor: string
  tagColor: string
}

const VISION_PILLARS: VisionPillar[] = [
  {
    id: "universal",
    sanskrit: "वसुधैव कुटुम्बकम्",
    title: "Vasudhaiva Kutumbakam",
    subtitle: "The Entire World is One Single Academic Family",
    description: "Education knows no borders, caste, or financial status. We believe every ambitious engineering student on Earth deserves access to cutting-edge AI mentorship, interactive compilers, and exam intelligence without paywalls.",
    icon: Globe2,
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    borderColor: "border-amber-500/30 hover:border-amber-500/70",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    id: "liberation",
    sanskrit: "सा विद्या या विमुक्तये",
    title: "Cognitive Liberation",
    subtitle: "True Knowledge is That Which Liberates the Mind",
    description: "Moving students away from blind rote memorization toward first-principles thinking, architectural reasoning, and interactive algorithmic discovery. Real understanding sets a developer free.",
    icon: GraduationCap,
    gradient: "from-indigo-500/10 via-blue-500/5 to-transparent",
    borderColor: "border-indigo-500/30 hover:border-indigo-500/70",
    tagColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
  },
  {
    id: "grit",
    sanskrit: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत",
    title: "Fearless Student Grit",
    subtitle: "Arise, Awake, and Stop Not Till the Goal is Reached",
    description: "Inspired by Swami Vivekananda, we ignite boundless curiosity, resilience through failed test cases, and the unwavering conviction to tackle the world's most daunting computational challenges.",
    icon: Flame,
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    borderColor: "border-rose-500/30 hover:border-rose-500/70",
    tagColor: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  },
  {
    id: "co-pilot",
    sanskrit: "गुरुर्ब्रह्मा गुरुर्विष्णुः",
    title: "The AI Mentor & Illuminator",
    subtitle: "Guiding from Darkness of Ignorance to Light of Wisdom",
    description: "AI is not here to replace human intellect or write thoughtless answers — it is here to be a 24/7 Socratic companion that illuminates hidden insights, challenges your logic, and elevates your potential.",
    icon: Sparkles,
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/70",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  }
]

export function PlatformVision() {
  const { setStep } = useNav()
  const [activePillar, setActivePillar] = useState<string>("universal")

  return (
    <section className="py-16 sm:py-24 bg-muted/20 border-b relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Badge
            variant="outline"
            className="mb-3 py-1 px-3.5 text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border-amber-500/20"
          >
            OUR VISION & PHILOSOPHY
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Harmonizing Ancient Wisdom with <br className="hidden sm:inline" />
            Cutting-Edge Deep Learning
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            We are building more than software. We are creating a democratic sanctuary where every student transforms into a confident architect of the digital future.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {VISION_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            const isSelected = activePillar === pillar.id

            return (
              <div
                key={pillar.id}
                onClick={() => setActivePillar(pillar.id)}
                className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer bg-card/60 backdrop-blur-xl relative overflow-hidden ${
                  pillar.borderColor
                } ${isSelected ? "ring-2 ring-primary/40 shadow-xl scale-[1.01]" : "hover:-translate-y-1"}`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  {/* Shloka Tag & Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${pillar.tagColor}`}>
                      {pillar.sanskrit}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-background/80 border flex items-center justify-center text-foreground shadow-sm">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-primary">
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Student Impact & Metrics Ribbon */}
        <div className="p-8 sm:p-10 rounded-3xl border-2 bg-gradient-to-r from-background via-muted/40 to-background shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-black text-foreground mb-1">10,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Students Mentored</div>
            </div>

            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-black text-emerald-500 mb-1">500+</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Curated Challenges</div>
            </div>

            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-black text-primary mb-1">94%</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Exam Pattern Accuracy</div>
            </div>

            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-500 mb-1">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Free Core Access</div>
            </div>
          </div>
        </div>

        {/* Vision Student Call to Action */}
        <div className="mt-12 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black text-foreground">
            Join the Next Generation of Engineers Today
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Whether you are preparing for university exams, cracking top coding interviews, or challenging your peers in 1v1 arenas — your journey begins right here.
          </p>
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <Button
              size="lg"
              onClick={() => {
                setStep("lab")
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="h-12 px-8 rounded-xl font-black text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              Start Practicing Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setStep("arena")
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="h-12 px-8 rounded-xl font-bold text-sm bg-background/50 hover:bg-muted"
            >
              Challenge Contenders in Arena
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
