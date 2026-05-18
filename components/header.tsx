"use client"

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"
import { 
  Brain, FileText, Settings, HelpCircle, User, LogOut, ChevronLeft, ChevronRight, 
  Home, Trophy, Video, Mail, Smartphone, UserPlus, ShieldCheck, Globe, Scale, MessageSquare, Sparkles 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNav } from "@/hooks/use-nav"
import Link from "next/link"
import { useState, useEffect } from "react"
// import { useSession, signOut } from "next-auth/react" // Removed due to environment restrictions

export function Header() {
  const { currentStep, setStep, isRegistered, isAdmin, setAdmin, setRegistered } = useNav()
  const [session, setSession] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const syncSession = () => {
      const saved = localStorage.getItem("aura_session")
      if (saved) {
        try {
          setSession(JSON.parse(saved))
        } catch (e) {
          setSession(null)
        }
      } else {
        setSession(null)
      }
    }
    syncSession()
    window.addEventListener("storage", syncSession)
    return () => window.removeEventListener("storage", syncSession)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("aura_session")
    setSession(null)
    setRegistered(false)
    setStep("onboarding")
    window.location.reload() // Force reload to clear all states
  }

  const steps: Array<any> = isRegistered ? ["upload", "analyze", "predict"] : ["onboarding"]
  const currentIndex = steps.indexOf(currentStep)

  const handlePrev = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1])
  }

  const handleNext = () => {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1])
  }

  const createUserId = () => {
    const id = "AURA-" + Math.random().toString(36).substr(2, 9).toUpperCase()
    setUserId(id)
    alert(`User ID Created: ${id}`)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" onClick={() => setStep("onboarding")} className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary hover:opacity-80 transition-all hover:scale-105 group">
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Brain className="w-8 h-8" />
            </div>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Aura Study AI</span>
          </Link>

          {/* Section Numbering for UX */}
          {isRegistered && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
              <span className={currentStep === "upload" ? "text-primary" : ""}>01. Upload</span>
              <div className="w-4 h-[1px] bg-border" />
              <span className={currentStep === "analyze" ? "text-primary" : ""}>02. Configure</span>
              <div className="w-4 h-[1px] bg-border" />
              <span className={currentStep === "predict" ? "text-primary" : ""}>03. Results</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation Controls */}
          {isRegistered && (
            <div className="flex items-center bg-muted/30 rounded-xl p-1 border shadow-inner">
              <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentIndex <= 0} className="h-8 w-8 p-0 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3 text-[10px] font-black uppercase tracking-widest text-primary min-w-[90px] text-center">
                {currentStep}
              </div>
              <Button variant="ghost" size="sm" onClick={handleNext} disabled={currentIndex === steps.length - 1} className="h-8 w-8 p-0 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Menubar className="border-none bg-transparent shadow-none hidden md:flex hover:rotate-y-12 transition-transform">
            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("profile")} className="cursor-pointer font-bold hover:text-primary transition-colors">
                <User className="w-4 h-4 mr-2" /> {session?.user?.name || "Student Profile"}
              </MenubarTrigger>
              <MenubarContent className="w-56">
                {session?.user ? (
                  <>
                    <MenubarItem onClick={() => setStep("profile")} className="font-bold text-xs cursor-pointer">{session.user.email}</MenubarItem>
                    <MenubarSeparator />
                  </>
                ) : userId ? (
                  <>
                    <MenubarItem onClick={() => setStep("profile")} className="font-mono text-xs cursor-pointer">{userId}</MenubarItem>
                    <MenubarSeparator />
                  </>
                ) : (
                  <MenubarItem onClick={createUserId} className="gap-2">
                    <UserPlus className="w-4 h-4" /> Create User ID
                  </MenubarItem>
                )}
                <MenubarItem onClick={() => {
                  if (isAdmin) {
                    setAdmin(false);
                  } else {
                    const pass = prompt("Enter Admin Password:");
                    if (pass === "admin123") {
                      setAdmin(true);
                      alert("Admin Access Granted!");
                    } else if (pass !== null) {
                      alert("Incorrect Password!");
                    }
                  }
                }} className="gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> {isAdmin ? "Lock Admin" : "Unlock Admin"}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleSignOut} className="text-destructive gap-2 cursor-pointer">
                  <LogOut className="w-4 h-4" /> Sign Out
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {isAdmin && (
              <MenubarMenu>
                <MenubarTrigger onClick={() => setStep("admin")} className="cursor-pointer font-bold text-primary">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Admin
                </MenubarTrigger>
              </MenubarMenu>
            )}

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("chat")} className="cursor-pointer font-bold">
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("community")} className="cursor-pointer font-bold">
                <Globe className="w-4 h-4 mr-2" /> Community
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("lab")} className="cursor-pointer font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                <Brain className="w-4 h-4 mr-2" /> Smart Lab
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("guider")} className="cursor-pointer font-bold text-green-500 hover:text-green-600 transition-colors">
                <Sparkles className="w-4 h-4 mr-2" /> AI Guider
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("policy")} className="cursor-pointer font-bold">
                <Scale className="w-4 h-4 mr-2" /> Policies
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-bold">
                <HelpCircle className="w-4 h-4 mr-2" /> Support
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <a href="mailto:help@gmail.com" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email: help@gmail.com
                  </a>
                </MenubarItem>
                <MenubarItem asChild>
                  <a href="tel:+91123456789" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Phone: +91 123456789
                  </a>
                </MenubarItem>
                <MenubarItem>Documentation</MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="font-bold text-xs text-muted-foreground">v2.0 Stable Build</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("developer")} className="cursor-pointer font-bold text-muted-foreground">
                <Settings className="w-4 h-4 mr-2" /> Developer Section
              </MenubarTrigger>
              <MenubarContent className="w-64 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src="https://ui-avatars.com/api/?name=Dev+Team&background=0D8ABC&color=fff&rounded=true" alt="Developer Avatar" className="w-10 h-10" />
                  <div>
                    <h4 className="text-sm font-bold">Aura Core Team</h4>
                    <p className="text-xs text-muted-foreground">Engineers</p>
                  </div>
                </div>
                <MenubarSeparator />
                <div className="space-y-2 mt-3 text-xs text-muted-foreground">
                  <p><strong className="text-foreground">Status:</strong> All Systems Operational</p>
                  <p><strong className="text-foreground">Release:</strong> v2.1.4-beta</p>
                  <p><strong className="text-foreground">Region:</strong> US-East (N. Virginia)</p>
                  <p><strong className="text-foreground">Uptime:</strong> 99.99%</p>
                </div>
                <Button onClick={() => setStep("developer")} variant="outline" className="w-full mt-4 text-xs font-bold">View Contributors</Button>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </header>
  )
}

