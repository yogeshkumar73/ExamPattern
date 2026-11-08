"use client";

import Link from "next/link";
import { getSession, signOut } from "next-auth/react";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

import {
  Brain,
  Settings,
  HelpCircle,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  Scale,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Swords,
  Mail,
  Menu,
  ChevronDown,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useNav, type Step } from "@/hooks/use-nav";

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
  const [isAdminDialogOpen, setAdminDialogOpen] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState("")
  const [adminAuthMessage, setAdminAuthMessage] = useState("")
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    try {
      setAdminAuthLoading(true);

      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        if (mounted) {
          setSession(null);
          setAdmin(false);
        }
        return;
      }

      const text = await res.text();

      // Prevent "Unexpected end of JSON input"
      if (!text.trim()) {
        if (mounted) {
          setSession(null);
          setAdmin(false);
        }
        return;
      }

      const data = JSON.parse(text);

      if (!mounted) return;

      const session = data?.session ?? null;

      setSession(session);
      setAdmin(session?.user?.role === "admin");
    } catch (error) {
      console.error("Failed to load session:", error);

      if (mounted) {
        setSession(null);
        setAdmin(false);
      }
    } finally {
      if (mounted) {
        setAdminAuthLoading(false);
      }
    }
  };

  loadSession();

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === "session" ||
      event.key === "auth" ||
      event.key === "next-auth.session-token"
    ) {
      loadSession();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    mounted = false;
    window.removeEventListener("storage", handleStorage);
  };
}, []);

  // Secure admin check simulation - Replace with real secure backend call
 const verifyAdminPassword = useCallback(
  async (password: string): Promise<boolean> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 10_000);

    try {
      if (typeof password !== "string" || password.length === 0) {
        console.error("Admin password is required.");
        return false;
      }

      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
          const errorData = await response.json();

          if (
            errorData &&
            typeof errorData.message === "string"
          ) {
            message = errorData.message;
          }
        } catch {
          // Response was not valid JSON.
        }

        console.error("Admin login failed:", message);
        return false;
      }

      try {
        const data = await response.json();

        if (data?.success === true && data?.user) {
          // Store admin session in localStorage for API validation
          localStorage.setItem('aura_session', JSON.stringify({
            user: data.user,
            role: data.user.role,
            isAdmin: data.user.isAdmin,
            loginTime: new Date().toISOString()
          }));
        }

        return data?.success === true;
      } catch {
        console.error("Admin login returned invalid JSON.");
        return false;
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        console.error("Admin verification timed out.");
      } else {
        console.error("Admin verification failed:", error);
      }

      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  },
  []
);

 const handleAdminUnlock = useCallback(async () => {
  if (adminAuthLoading) return;

  const password = adminPasswordInput.trim();

  if (!password) {
    setAdminAuthMessage("Please enter the password.");
    return;
  }

  setAdminAuthLoading(true);
  setAdminAuthMessage("Verifying...");

  try {
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      setAdmin(false);
      setAdminPasswordInput("");
      setAdminAuthMessage("Invalid password.");
      return;
    }

    setAdmin(true);
    setAdminAuthMessage("Successfully unlocked.");

    setTimeout(() => {
      setAdminDialogOpen(false);
      setAdminPasswordInput("");
      setAdminAuthMessage("");
      setStep("admin");
    }, 500);
  } catch (error) {
    console.error(error);

    setAdmin(false);
    setAdminAuthMessage("Unable to verify admin credentials.");
  } finally {
    setAdminAuthLoading(false);
  }
}, [
  adminAuthLoading,
  adminPasswordInput,
  verifyAdminPassword,
  setAdmin,
  setStep,
]);
  const handleAdminPasswordKeyDown = useCallback(
  (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (!adminAuthLoading) {
      handleAdminUnlock();
    }
  },
  [adminAuthLoading, handleAdminUnlock]
);
 const handleSignOut = useCallback(async () => {
  try {
   await signOut({ redirect: true });
  } catch (error) {
    console.error(error);
  }

  localStorage.removeItem("aura_session");

  setSession(null);
  setAdmin(false);
  setRegistered(false);
  setStep("onboarding");
}, [setRegistered, setStep]);

  // Manage steps for navigation controls
const steps = useMemo<Step[]>(
  () =>
    isRegistered
      ? ["upload", "analyze", "predict"]
      : ["onboarding"],
  [isRegistered]
);

const currentIndex = useMemo(
  () => steps.indexOf(currentStep),
  [steps, currentStep]
);

  const handlePrev = useCallback(() => {
  if (currentIndex <= 0) return;

  setStep(steps[currentIndex - 1]);
}, [currentIndex, steps, setStep]);

  const handleNext = useCallback(() => {
  if (currentIndex >= steps.length - 1) return;

  setStep(steps[currentIndex + 1]);
}, [currentIndex, steps, setStep]);



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

          {/* Desktop & Laptop Menubar */}
          <Menubar className="hidden xl:flex border-none bg-transparent shadow-none gap-1">
            {/* AI Services Group */}
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-bold hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5">
                <Brain className="h-4 w-4 text-indigo-400" /> AI Services
                <ChevronDown className="h-3 w-3 opacity-60" />
              </MenubarTrigger>
              <MenubarContent className="w-56">
                <MenubarItem onClick={() => setStep("arena")} className="cursor-pointer gap-2 font-bold text-rose-500 hover:text-rose-600">
                  <Swords className="h-4 w-4" /> Battle Arena
                </MenubarItem>
                <MenubarItem onClick={() => setStep("lab")} className="cursor-pointer gap-2 font-bold text-indigo-500 hover:text-indigo-600">
                  <Brain className="h-4 w-4" /> Smart Lab
                </MenubarItem>
                <MenubarItem onClick={() => setStep("guider")} className="cursor-pointer gap-2 font-bold text-green-500 hover:text-green-600">
                  <Sparkles className="h-4 w-4" /> AI Guider
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Community Group */}
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-bold hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5">
                <Globe className="h-4 w-4 text-blue-400" /> Community
                <ChevronDown className="h-3 w-3 opacity-60" />
              </MenubarTrigger>
              <MenubarContent className="w-56">
                <MenubarItem onClick={() => setStep("chat")} className="cursor-pointer gap-2 font-bold">
                  <MessageSquare className="h-4 w-4 text-primary" /> Community Chat
                </MenubarItem>
                <MenubarItem onClick={() => setStep("community")} className="cursor-pointer gap-2 font-bold">
                  <BookOpen className="h-4 w-4 text-blue-400" /> Paper Repository
                </MenubarItem>
                <MenubarItem onClick={() => setStep("community-join")} className="cursor-pointer gap-2 font-bold text-green-600">
                  <MessageSquare className="h-4 w-4" /> WhatsApp Group
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setStep("feedback")} className="cursor-pointer gap-2 font-bold text-orange-500">
                  <MessageCircle className="h-4 w-4" /> Feedback
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Support & Legal Group */}
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer font-bold hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5">
                <HelpCircle className="h-4 w-4 text-muted-foreground" /> More
                <ChevronDown className="h-3 w-3 opacity-60" />
              </MenubarTrigger>
              <MenubarContent className="w-60">
                <MenubarItem onClick={() => setStep("policy")} className="cursor-pointer gap-2 font-bold">
                  <Scale className="h-4 w-4" /> Platform Policies
                </MenubarItem>
                <MenubarItem onClick={() => setStep("developer")} className="cursor-pointer gap-2 font-bold">
                  <Settings className="h-4 w-4" /> Developer Section
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem asChild>
                  <a
                    href="mailto:helpsupport9452@gmail.com?subject=User%20Query&body=Please%20describe%20your%20query%20below%20and%20we%20will%20respond%20shortly.%0D%0A%0D%0AQuery:%20"
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Mail className="h-4 w-4 text-primary" /> Email Support
                  </a>
                </MenubarItem>
                <MenubarItem asChild>
                  <a
                    href="https://chat.whatsapp.com/GqywH4gM6XJCO5hjSRyJDN?s=cl&p=a&ilr=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-bold text-green-600 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" /> Join WhatsApp Community
                  </a>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="text-xs font-bold text-muted-foreground">v2.0 Stable Build</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Admin Direct Button (if Admin) */}
            {isAdmin && (
              <MenubarMenu>
                <MenubarTrigger onClick={() => setStep("admin")} className="cursor-pointer font-bold text-primary flex items-center gap-1.5 px-3 py-1.5">
                  <ShieldCheck className="h-4 w-4" /> Admin
                </MenubarTrigger>
              </MenubarMenu>
            )}

            {/* Profile Menu */}
            <MenubarMenu>
              <MenubarTrigger
                className="cursor-pointer font-bold hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/20"
                aria-label="User Profile"
              >
                <User className="h-4 w-4 text-primary" />
                <span className="max-w-[120px] truncate">{session?.user?.name ?? "Student Profile"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </MenubarTrigger>
              <MenubarContent className="w-56">
                <MenubarItem onClick={() => setStep("profile")} className="cursor-pointer font-bold text-xs">
                  {session?.user?.email || "Student Account"}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setStep("profile")} className="cursor-pointer gap-2 font-medium">
                  <User className="text-primary h-4 w-4" /> View Student Profile
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive font-medium">
                  <LogOut className="h-4 w-4" /> Sign Out
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {/* Mobile & Tablet Drawer Trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-primary/20 bg-muted/20" aria-label="Open Navigation Menu">
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[380px] p-0 flex flex-col justify-between overflow-y-auto">
                <div className="p-6 space-y-6">
                  <SheetHeader className="text-left border-b pb-4">
                    <SheetTitle className="flex items-center gap-2 text-lg font-black text-primary">
                      <Brain className="h-6 w-6 text-primary" />
                      Aura Study AI
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground font-medium">
                      Multiplayer AI Academic & Practice System
                    </SheetDescription>
                  </SheetHeader>

                  {/* User Profile Bar in Mobile Menu */}
                  <div
                    onClick={() => { setStep("profile"); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{session?.user?.name || "Student Profile"}</div>
                      <div className="text-xs text-muted-foreground truncate">{session?.user?.email || "Click to view profile"}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* AI Services */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 mb-2">
                      Academic & AI Systems
                    </div>
                    <Button
                      variant={currentStep === "arena" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-rose-500 hover:text-rose-600 rounded-xl"
                      onClick={() => { setStep("arena"); setIsMobileMenuOpen(false); }}
                    >
                      <Swords className="h-4 w-4" /> Battle Arena
                    </Button>
                    <Button
                      variant={currentStep === "lab" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-indigo-500 hover:text-indigo-600 rounded-xl"
                      onClick={() => { setStep("lab"); setIsMobileMenuOpen(false); }}
                    >
                      <Brain className="h-4 w-4" /> Smart Lab
                    </Button>
                    <Button
                      variant={currentStep === "guider" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-green-500 hover:text-green-600 rounded-xl"
                      onClick={() => { setStep("guider"); setIsMobileMenuOpen(false); }}
                    >
                      <Sparkles className="h-4 w-4" /> AI Guider Agent
                    </Button>
                    <Button
                      variant={currentStep === "upload" || currentStep === "analyze" || currentStep === "predict" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold rounded-xl"
                      onClick={() => { setStep("upload"); setIsMobileMenuOpen(false); }}
                    >
                      <BookOpen className="h-4 w-4 text-primary" /> Exam Pattern Analyzer
                    </Button>
                  </div>

                  {/* Community & Social */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 mb-2">
                      Community & Social
                    </div>
                    <Button
                      variant={currentStep === "chat" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold rounded-xl"
                      onClick={() => { setStep("chat"); setIsMobileMenuOpen(false); }}
                    >
                      <MessageSquare className="h-4 w-4 text-primary" /> Community Chat
                    </Button>
                    <Button
                      variant={currentStep === "community" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold rounded-xl"
                      onClick={() => { setStep("community"); setIsMobileMenuOpen(false); }}
                    >
                      <Globe className="h-4 w-4 text-blue-500" /> Paper Repository
                    </Button>
                    <Button
                      variant={currentStep === "community-join" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-green-600 rounded-xl"
                      onClick={() => { setStep("community-join"); setIsMobileMenuOpen(false); }}
                    >
                      <MessageSquare className="h-4 w-4" /> Join WhatsApp Group
                    </Button>
                    <Button
                      variant={currentStep === "feedback" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-orange-500 rounded-xl"
                      onClick={() => { setStep("feedback"); setIsMobileMenuOpen(false); }}
                    >
                      <MessageCircle className="h-4 w-4" /> Student Feedback
                    </Button>
                  </div>

                  {/* Administration & Legal */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 mb-2">
                      Platform & Settings
                    </div>
                    {isAdmin && (
                      <Button
                        variant={currentStep === "admin" ? "default" : "ghost"}
                        className="w-full justify-start gap-3 h-11 text-sm font-bold text-primary rounded-xl"
                        onClick={() => { setStep("admin"); setIsMobileMenuOpen(false); }}
                      >
                        <ShieldCheck className="h-4 w-4" /> Admin Command Center
                      </Button>
                    )}
                    <Button
                      variant={currentStep === "policy" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold rounded-xl"
                      onClick={() => { setStep("policy"); setIsMobileMenuOpen(false); }}
                    >
                      <Scale className="h-4 w-4" /> Platform Policies
                    </Button>
                    <Button
                      variant={currentStep === "developer" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-muted-foreground rounded-xl"
                      onClick={() => { setStep("developer"); setIsMobileMenuOpen(false); }}
                    >
                      <Settings className="h-4 w-4" /> Developer Section
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 text-sm font-bold text-muted-foreground rounded-xl"
                      asChild
                    >
                      <a href="mailto:helpsupport9452@gmail.com">
                        <Mail className="h-4 w-4 text-primary" /> Email Support
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Footer in Mobile Menu */}
                <div className="p-6 border-t bg-muted/20 space-y-3">
                  <Button
                    variant="destructive"
                    className="w-full gap-2 font-bold rounded-xl h-11"
                    onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                  <div className="text-center text-[10px] text-muted-foreground font-semibold">
                    Aura Prime v2.0 • Build Stable
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Admin Unlock Dialog */}
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
            <DialogContent className="sm:max-w-md">
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
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="secondary" onClick={() => setAdminDialogOpen(false)} disabled={adminAuthLoading}>
                  Cancel
                </Button>
                <Button onClick={handleAdminUnlock} disabled={adminAuthLoading}>
                  {adminAuthLoading ? "Verifying..." : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
