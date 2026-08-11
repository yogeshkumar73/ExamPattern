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
                {session?.user && (
                  <>
                    <MenubarItem onClick={() => setStep("profile")} className="cursor-pointer font-bold text-xs">
                      {session.user.email}
                    </MenubarItem>
                    <MenubarSeparator />
                  </>
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
              <MenubarTrigger onClick={() => setStep("feedback")} className="cursor-pointer font-bold text-orange-500 hover:text-orange-600 transition-colors">
                <MessageCircle className="mr-2 h-4 w-4" /> Feedback
              </MenubarTrigger>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger onClick={() => setStep("community-join")} className="cursor-pointer font-bold text-green-600 hover:text-green-700 transition-colors">
                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
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
                  <a
                    href="https://chat.whatsapp.com/GqywH4gM6XJCO5hjSRyJDN?s=cl&p=a&ilr=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-bold text-green-600"
                  >
                    <MessageSquare className="h-4 w-4 text-green-500" /> Join Official WhatsApp Group
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
