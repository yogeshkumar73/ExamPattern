"use client"

import ExamAnalyzer from "@/components/exam-analyzer"
import { useNav } from "@/hooks/use-nav"
import { VisionSlider } from "@/components/vision-slider"
import { Brain, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { isRegistered, currentStep } = useNav()

  // If user is registered or explicitly on the onboarding / login step, render the active workspace directly
  if ((isRegistered && currentStep !== "onboarding") || currentStep === "onboarding") {
    return (
      <main className="flex-1 w-full min-h-[calc(100vh-4rem)]">
        <div id="analyzer" className="w-full">
          <ExamAnalyzer />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      {/* Hero / Welcome Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-32 overflow-hidden border-b bg-muted/20">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge variant="outline" className="mb-4 sm:mb-6 py-1.5 px-3 sm:px-4 text-xs sm:text-sm bg-primary/5 border-primary/20 text-primary animate-bounce">
            Introducing Aura Prime v2.0
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-indigo-600 leading-tight">
            Intelligent Exam Analysis <br className="hidden sm:inline" />
            Powered by Deep Learning
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            Upload your source materials and let our advanced AI models identify hidden patterns, 
            weight topics, and predict potential examination questions with 94% accuracy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-full" asChild>
              <a href="#analyzer">Start Analyzing</a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-medium rounded-full bg-background/50">
              View Sample Results
            </Button>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Vasudhaiva Kutumbakam & Platform Vision Slider (Left-to-Right 10 Themes) */}
      <VisionSlider />

      {/* Main App Section */}
      <div id="analyzer" className="scroll-mt-20">
        <ExamAnalyzer />
      </div>

      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 font-bold mb-4 opacity-50">
            <Brain className="w-5 h-5" />
            <span>Aura Prime Analyzer</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Aura Technologies. All rights reserved. Built for academic excellence.
          </p>
        </div>
      </footer>
    </main>
  )
}

