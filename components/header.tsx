"use client"

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"
import { Brain, FileText, Settings, HelpCircle, User, LogOut, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNav } from "@/hooks/use-nav"
import Link from "next/link"

export function Header() {
  const { currentStep, setStep } = useNav()

  const steps: Array<"upload" | "analyze" | "predict"> = ["upload", "analyze", "predict"]
  const currentIndex = steps.indexOf(currentStep)

  const handlePrev = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1])
  }

  const handleNext = () => {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1])
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary hover:opacity-80 transition-opacity">
          <Brain className="w-8 h-8" />
          <span className="hidden sm:inline">Aura Prime Analyzer</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Navigation Controls inside Menubar area */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="h-8 w-8 p-0 rounded-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground min-w-[80px] text-center">
              {currentStep}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNext} 
              disabled={currentIndex === steps.length - 1 || (currentStep === "upload" && currentIndex === 0)} // Simplified logic for demo
              className="h-8 w-8 p-0 rounded-md"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Menubar className="border-none bg-transparent shadow-none hidden md:flex">
            <div className="flex items-center mr-4 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Llama 3.3 Active</span>
            </div>
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-medium">
                <Home className="w-4 h-4 mr-2" /> Home
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Link href="/">Back to Landing</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            {/* ... rest of the menubar ... */}

            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-medium">File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="gap-2" onClick={() => setStep("upload")}>
                  <FileText className="w-4 h-4" /> New Analysis
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-medium">Support</MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="gap-2">
                  <HelpCircle className="w-4 h-4" /> Documentation
                </MenubarItem>
                <MenubarItem>Contact Support</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </header>
  )
}

