import ExamAnalyzer from "@/components/exam-analyzer"
import { Brain, ShieldCheck, Zap, Code2, Sparkles, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero / Welcome Section */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b bg-muted/20">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-primary/5 border-primary/20 text-primary animate-bounce">
            Introducing Aura Prime v2.0
          </Badge>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-indigo-600">
            Intelligent Exam Analysis <br />
            Powered by Deep Learning
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Upload your source materials and let our advanced AI models identify hidden patterns, 
            weight topics, and predict potential examination questions with 94% accuracy.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full" asChild>
              <a href="#analyzer">Start Analyzing</a>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-medium rounded-full bg-background/50">
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

      {/* Technical Feature Section (The "Code Try Catch" section) */}
      <section className="py-24 border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Robust Error-Resilient Processing</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We take stability seriously. Every analysis step is protected by multi-layered error handling 
                and fallback mechanisms to ensure you get results even when models fluctuate.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                  </div>
                  <div>
                    <span className="font-semibold">Automatic Fallbacks:</span>
                    <p className="text-muted-foreground text-sm">If an API fails, we automatically switch to secondary models.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-blue-500" />
                  </div>
                  <div>
                    <span className="font-semibold">JSON Validation:</span>
                    <p className="text-muted-foreground text-sm">Every AI response is strictly validated and cleaned before rendering.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-6 shadow-2xl border border-white/10 font-mono text-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain className="w-48 h-48" />
              </div>
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <pre className="text-slate-300">
                <code>{`try {
  // 1. Analyze paper structure
  const result = await analyzePaper(content);
  
  // 2. Validate structural integrity
  if (!isValid(result)) {
    throw new ValidationError("Incomplete analysis");
  }

  return formatPremiumOutput(result);
} catch (error) {
  console.error("Resilient Mode Engaged:", error);
  return generateVerifiedBackup(content);
}`}</code>
              </pre>
              <div className="mt-6 flex items-center gap-2 text-xs text-primary/80 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> System: Stable 
              </div>
            </div>
          </div>
        </div>
      </section>

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

