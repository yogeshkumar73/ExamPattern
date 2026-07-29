"use client"

import {
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger
} from "@/components/ui/menubar"
import {
  Brain, Settings, HelpCircle, User, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Globe, Scale, MessageSquare, Sparkles, Swords, Mail, Smartphone, UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { useNav, type Step } from "@/hooks/use-nav"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"

type SessionUser = {
  name?: string
  email?: string
  role?: string
}

type Session = {
  user?: SessionUser
} | null

export function Header() {
  const { currentStep, setStep, isRegistered, isAdmin, setAdmin, setRegistered } = useNav()

  const [session, setSession] = useState<Session>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdminDialogOpen, setAdminDialogOpen] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState("")
  const [adminAuthMessage, setAdminAuthMessage] = useState("")
  const [adminAuthLoading, setAdminAuthLoading] = useState(false)

  // Sync session from localStorage and listen to storage changes
  useEffect(() => {
    function syncSession() {
      const storedSession = localStorage.getItem("aura_session")
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession)
          setSession(parsed)
          if (parsed?.user?.role === "admin") {
            setAdmin(true)
          }
        } catch {
          setSession(null)
        }
      } else {
        setSession(null)
      }
    }
    syncSession()
    window.addEventListener("storage", syncSession)
    return () => window.removeEventListener("storage", syncSession)
  }, [setAdmin])

  // Secure admin check simulation - Replace with real secure backend call
  const verifyAdminPassword = useCallback(async (password: string): Promise<boolean> => {
    // WARNING: This is placeholder.
    // Do NOT use client side password validation in production.
    // Replace this with an API call to your backend for safe validation.
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(password === "b6001d1fe29d165a0") // Example only
      }, 300)
    })
  }, [])

  const handleAdminUnlock = useCallback(async () => {
    if (!adminPasswordInput.trim()) {
      setAdminAuthMessage("Please enter the password.")
      return
    }
    setAdminAuthLoading(true)
    setAdminAuthMessage("Verifying...")
    const isValid = await verifyAdminPassword(adminPasswordInput.trim())
    if (isValid) {
      setAdmin(true)
      setAdminAuthMessage("Successfully unlocked!")
      setTimeout(() => {
        setAdminDialogOpen(false)
        setAdminPasswordInput("")
        setAdminAuthMessage("")
        setAdminAuthLoading(false)
        setStep("admin")
      }, 600)
    } else {
      setAdminAuthMessage("Invalid password. Try again.")
      setAdminPasswordInput("")
      setAdminAuthLoading(false)
    }
  }, [adminPasswordInput, setAdmin, setStep, verifyAdminPassword])

  const handleAdminPasswordKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !adminAuthLoading) {
        handleAdminUnlock()
      }
    },
    [adminAuthLoading, handleAdminUnlock]
  )

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("aura_session")
    setSession(null)
    setRegistered(false)
    setStep("onboarding")
    window.location.reload()
  }, [setRegistered, setStep])

  // Manage steps for navigation controls
  const steps: Step[] = isRegistered ? ["upload", "analyze", "predict"] : ["onboarding"]
  const currentIndex = steps.indexOf(currentStep)

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }, [currentIndex, setStep, steps])

  const handleNext = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }, [currentIndex, setStep, steps])

  const createUserId = useCallback(() => {
    const id = "AURA-" + Math.random().toString(36).slice(2, 11).toUpperCase()
    setUserId(id)
    // Ideally, replace alert with a nicer UI feedback like toast/snackbar
    alert(`User ID Created: ${id}`)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={() => setStep("onboarding")}
            className="group flex items-center gap-2 font-bold text-xl tracking-tight text-primary transition-transform hover:opacity-80 hover:scale-105"
          >
            <div className="rounded-lg bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
              <Brain className="h-8 w-8" />
            </div>
            <span className="hidden bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 sm:inline">
              Aura Study AI
            </span>
          </Link>

          {isRegistered && (
            <nav className="hidden items-center gap-2 text-xs font-bold uppercase tracking-tighter text-muted-foreground lg:flex">
              <span className={currentStep === "upload" ? "text-primary" : ""}>01. Upload</span>
              <div className="bg-border h-[1px] w-4" />
              <span className={currentStep === "analyze" ? "text-primary" : ""}>02. Configure</span>
              <div className="bg-border h-[1px] w-4" />
              <span className={currentStep === "predict" ? "text-primary" : ""}>03. Results</span>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isRegistered && (
            <nav className="flex items-center space-x-1.5 rounded-xl border bg-muted/30 p-1 shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                aria-label="Previous Step"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[90px] px-3 text-center text-[10px] font-black uppercase tracking-widest text-primary">
                {currentStep}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={handleNext}
                disabled={currentIndex === steps.length - 1}
                aria-label="Next Step"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}

          <Menubar className="hidden md:flex border-none bg-transparent shadow-none hover:rotate-y-12 transition-transform">
            <MenubarMenu>
              <MenubarTrigger
                onClick={() => setStep("profile")}
                className="cursor-pointer font-bold hover:text-primary transition-colors"
                aria-label="User Profile"
              >
                <User className="mr-2 h-4 w-4" /> {session?.user?.name ?? "Student Profile"}
              </MenubarTrigger>
              <MenubarContent className="w-56">
                {session?.user ? (
                  <>
                    <MenubarItem onClick={() => setStep("profile")} className="cursor-pointer font-bold text-xs">
                      {session.user.email}
                    </MenubarItem>
                    <MenubarSeparator />
                  </>
                ) : userId ? (
                  <>
                    <MenubarItem onClick={() => setStep("profile")} className="cursor-pointer font-mono text-xs">
                      {userId}
                    </MenubarItem>
                    <MenubarSeparator />
                  </>
                ) : (
                  <MenubarItem onClick={createUserId} className="gap-2">
                    <UserPlus className="h-4 w-4" /> Create User ID
                  </MenubarItem>
                )}
                {/* Only show Admin unlock option if no user is logged in, or the logged in user is an admin */}
                {(!session?.user || session.user.role === "admin") && (
                  <MenubarItem
                    onClick={() => (isAdmin ? setAdmin(false) : setAdminDialogOpen(true))}
                    className="gap-2"
                  >
                    <ShieldCheck className="text-primary h-4 w-4" /> {isAdmin ? "Lock Admin" : "Unlock Admin"}
                  </MenubarItem>
                )}
                <MenubarSeparator />
                <MenubarItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <Dialog
              open={isAdminDialogOpen}
              onOpenChange={(open) => {
                if (!open && !adminAuthLoading) {
                  setAdminDialogOpen(open)
                  setAdminPasswordInput("")
                  setAdminAuthMessage("")
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Admin Access</DialogTitle>
                  <DialogDescription>Enter the admin password to unlock admin features.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    type="password"
                    placeholder="Admin Password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    onKeyDown={handleAdminPasswordKeyDown}
                    disabled={adminAuthLoading}
                    autoFocus
                    aria-label="Admin Password Input"
                  />
                  {adminAuthMessage && (
                    <p
                      className={`text-sm font-semibold ${
                        adminAuthMessage.includes("Successfully") || adminAuthMessage.includes("Verifying")
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                      role="alert"
                    >
                      {adminAuthMessage}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setAdminDialogOpen(false)} disabled={adminAuthLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdminUnlock} disabled={adminAuthLoading}>
                    {adminAuthLoading ? "Verifying..." : "Submit"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {isAdmin && (
              <MenubarMenu>
                <MenubarTrigger onClick={() => setStep("admin")} className="cursor-pointer font-bold text-primary">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                </MenubarTrigger>
              </MenubarMenu>
            )}

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("chat")} className="cursor-pointer font-bold">
                <MessageSquare className="mr-2 h-4 w-4" /> Chat
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("community")} className="cursor-pointer font-bold">
                <Globe className="mr-2 h-4 w-4" /> Community
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("lab")} className="cursor-pointer font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                <Brain className="mr-2 h-4 w-4" /> Smart Lab
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("arena")} className="cursor-pointer font-bold text-rose-500 hover:text-rose-600 transition-colors">
                <Swords className="mr-2 h-4 w-4" /> Battle Arena
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("guider")} className="cursor-pointer font-bold text-green-500 hover:text-green-600 transition-colors">
                <Sparkles className="mr-2 h-4 w-4" /> AI Guider
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("policy")} className="cursor-pointer font-bold">
                <Scale className="mr-2 h-4 w-4" /> Policies
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-bold">
                <HelpCircle className="mr-2 h-4 w-4" /> Support
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <a
                    href="mailto:helpsupport9452@gmail.com?subject=User%20Query&body=Please%20describe%20your%20query%20below%20and%20we%20will%20respond%20shortly.%0D%0A%0D%0AQuery:%20"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" /> Email: helpsupport9452@gmail.com
                  </a>
                </MenubarItem>
                <MenubarItem asChild>
                  <a href="tel:+917379307099" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Contact: +91 73793 07099
                  </a>
                </MenubarItem>
                <MenubarItem asChild>
                  <a href="tel:+919532415871" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Contact: +91 95324 15871
                  </a>
                </MenubarItem>
                <MenubarItem>Documentation</MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="text-xs font-bold text-muted-foreground">v2.0 Stable Build</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("developer")} className="cursor-pointer font-bold text-muted-foreground">
                <Settings className="mr-2 h-4 w-4" /> Developer Section
              </MenubarTrigger>
              <MenubarContent className="w-64 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src="https://ui-avatars.com/api/?name=Dev+Team&background=0D8ABC&color=fff&rounded=true"
                    alt="Developer Avatar"
                    className="h-10 w-10"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-sm font-bold">Aura Core Team</h4>
                    <p className="text-xs text-muted-foreground">Engineers</p>
                  </div>
                </div>
                <MenubarSeparator />
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Status:</strong> All Systems Operational
                  </p>
                  <p>
                    <strong className="text-foreground">Release:</strong> v2.1.4-beta
                  </p>
                  <p>
                    <strong className="text-foreground">Region:</strong> US-East (N. Virginia)
                  </p>
                  <p>
                    <strong className="text-foreground">Uptime:</strong> 99.99%
                  </p>
                </div>
                <Button onClick={() => setStep("developer")} variant="outline" className="mt-4 w-full text-xs font-bold">
                  View Contributors
                </Button>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </header>
  )
}
