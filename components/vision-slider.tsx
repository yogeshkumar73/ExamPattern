"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Globe2,
  GraduationCap,
  Droplets,
  Sparkles,
  Award,
  Flag,
  Heart,
  Leaf,
  Cpu,
  Sun,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SloganCard {
  id: number
  theme: string
  hindiTag: string
  slogan: string
  description: string
  icon: any
  gradient: string
  borderColor: string
  accentColor: string
}

const VISION_SLOGANS: SloganCard[] = [
  {
    id: 1,
    theme: "Vasudhaiva Kutumbakam",
    hindiTag: "वसुधैव कुटुम्बकम्",
    slogan: "The Entire World is One Single Family",
    description: "Transcending borders and barriers through universal, accessible education for every soul on planet Earth.",
    icon: Globe2,
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    borderColor: "border-amber-500/30 hover:border-amber-400",
    accentColor: "text-amber-400 bg-amber-500/10",
  },
  {
    id: 2,
    theme: "Sacred Education",
    hindiTag: "सा विद्या या विमुक्तये",
    slogan: "True Education is That Which Liberates",
    description: "Empowering every learner with deep wisdom, critical intellect, and ethical clarity to conquer real-world challenges.",
    icon: GraduationCap,
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
    borderColor: "border-blue-500/30 hover:border-blue-400",
    accentColor: "text-blue-400 bg-blue-500/10",
  },
  {
    id: 3,
    theme: "Water — Elixir of Life",
    hindiTag: "जल ही जीवन है — अमृत धारा",
    slogan: "Save Every Drop, Nurture Every Stream",
    description: "Revering sacred water as pure consciousness. Sustainable stewardship for living rivers and future generations.",
    icon: Droplets,
    gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
    borderColor: "border-cyan-500/30 hover:border-cyan-400",
    accentColor: "text-cyan-400 bg-cyan-500/10",
  },
  {
    id: 4,
    theme: "The Student Spark",
    hindiTag: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत",
    slogan: "Arise, Awake, and Stop Not Till the Goal is Reached",
    description: "The architect of tomorrow's universe. Igniting fearless curiosity, unwavering grit, and visionary ambition.",
    icon: Sparkles,
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    borderColor: "border-purple-500/30 hover:border-purple-400",
    accentColor: "text-purple-400 bg-purple-500/10",
  },
  {
    id: 5,
    theme: "Guru — The Illuminator",
    hindiTag: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः",
    slogan: "Guiding from Darkness of Ignorance to Light of Wisdom",
    description: "Honoring mentors, educators, and guides whose compassionate light shapes the destiny of humankind.",
    icon: Award,
    gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    borderColor: "border-yellow-500/30 hover:border-yellow-400",
    accentColor: "text-yellow-400 bg-yellow-500/10",
  },
  {
    id: 6,
    theme: "Bharat Diversity",
    hindiTag: "अनेकता में एकता — भारत का गौरव",
    slogan: "Unity in Vibrant Diversity, Bound by Heritage",
    description: "Celebrating 1.4 billion aspirations across diverse languages, cultures, and traditions woven into one majestic nation.",
    icon: Flag,
    gradient: "from-orange-500/20 via-emerald-500/10 to-transparent",
    borderColor: "border-orange-500/30 hover:border-orange-400",
    accentColor: "text-orange-400 bg-orange-500/10",
  },
  {
    id: 7,
    theme: "Universal Humanity",
    hindiTag: "परोपकाराय सतां विभूतयः",
    slogan: "Service to Humanity is the Highest Calling",
    description: "Cultivating boundless empathy, unconditional kindness, and uplifting the most vulnerable with compassionate tech.",
    icon: Heart,
    gradient: "from-rose-500/20 via-red-500/10 to-transparent",
    borderColor: "border-rose-500/30 hover:border-rose-400",
    accentColor: "text-rose-400 bg-rose-500/10",
  },
  {
    id: 8,
    theme: "Mother Earth & Ecology",
    hindiTag: "माता भूमिः पुत्रोऽहं पृथिव्याः",
    slogan: "Earth is My Mother, and I am Her Child",
    description: "Harmonizing artificial intelligence with environmental conservation, renewable energy, and ecological reverence.",
    icon: Leaf,
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    borderColor: "border-emerald-500/30 hover:border-emerald-400",
    accentColor: "text-emerald-400 bg-emerald-500/10",
  },
  {
    id: 9,
    theme: "Deep Tech & Innovation",
    hindiTag: "विज्ञानं ब्रह्म — तकनीक से उत्थान",
    slogan: "Harnessing Advanced AI for Societal Elevation",
    description: "Engineering intelligent learning systems that democratize knowledge and unlock peak human potential.",
    icon: Cpu,
    gradient: "from-indigo-500/20 via-violet-500/10 to-transparent",
    borderColor: "border-indigo-500/30 hover:border-indigo-400",
    accentColor: "text-indigo-400 bg-indigo-500/10",
  },
  {
    id: 10,
    theme: "Sarve Bhavantu Sukhinah",
    hindiTag: "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः",
    slogan: "May All Beings Everywhere Be Happy & Free",
    description: "The ultimate vision of Aura: radiating knowledge, peace, harmony, and prosperity across the cosmos.",
    icon: Sun,
    gradient: "from-yellow-400/20 via-orange-400/10 to-transparent",
    borderColor: "border-yellow-400/30 hover:border-yellow-300",
    accentColor: "text-yellow-300 bg-yellow-400/10",
  },
]

export function VisionSlider() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Smooth Left-to-Right auto slide mechanism
  useEffect(() => {
    if (!isPlaying || isHovered) return

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        // If reached end, smoothly loop back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          scrollRef.current.scrollBy({ left: 340, behavior: "smooth" })
        }
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isPlaying, isHovered])

  const slideLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: "smooth" })
    }
  }

  const slideRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" })
    }
  }

  return (
    <section className="py-12 sm:py-20 border-b border-white/10 bg-gradient-to-b from-background via-slate-950/60 to-background overflow-hidden relative">
      {/* Decorative Aura background glows */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with Vasudhaiva Kutumbakam ethos */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>वसुधैव कुटुम्बकम् • Universal Platform Vision</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              One World, One Family, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-primary to-indigo-400">
                Infinite Possibilities
              </span>
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              Rooted in timeless philosophy: connecting students, teachers, nature, diversity, and humanity through purposeful artificial intelligence.
            </p>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <Button
              variant="outline"
              size="icon"
              onClick={slideLeft}
              className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={slideRight}
              className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
              title={isPlaying ? "Pause Autoplay" : "Play Autoplay"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* 10 Component-Based Sliding Cards (Left to Right) */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {VISION_SLOGANS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={`snap-start flex-shrink-0 w-[290px] sm:w-[340px] rounded-3xl p-6 bg-gradient-to-b ${item.gradient} bg-slate-950/80 border ${item.borderColor} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between relative group`}
              >
                {/* Header: Icon + Number Index */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.accentColor} border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-white/50 bg-black/40 px-2 py-0.5">
                    0{item.id}/10
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-2.5 my-auto">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-300/90 font-serif">
                    {item.hindiTag}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-primary-foreground transition-colors">
                    {item.slogan}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Tag */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-semibold">
                  <span>{item.theme}</span>
                  <span className="text-white/20 group-hover:text-amber-400/80 transition-colors">✦ Aura Vision</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom indicator dots */}
        <div className="flex justify-center items-center gap-1.5 pt-6">
          {VISION_SLOGANS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({ left: idx * 340, behavior: "smooth" })
                }
              }}
              className="w-2 h-2 rounded-full bg-white/20 hover:bg-amber-400 transition-all focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
