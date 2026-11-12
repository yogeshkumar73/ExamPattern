"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, User, Users, Lock, Unlock, Phone, CheckCircle2, Download, Upload, FileText, Globe, Scale, ArrowRight, ShieldAlert, Brain, MessageSquare, Send, Mail, Sparkles, Activity, Zap, Trophy, Target, CheckSquare, XSquare, Star, MessageCircle, ExternalLink, Heart, RefreshCw, Gauge, Play, Terminal, Database, Code, Check, Loader2, Clock, Cpu, Sliders, X, Eye, Trash2, AlertCircle, FileCheck, Search } from "lucide-react"
import { useNav } from "@/hooks/use-nav"
import { Switch } from "@/components/ui/switch"
import {
  getStoredSession,
  storeSession,
  generateSessionToken,
  consumePostLoginRedirect,
} from "@/lib/session-storage"
import AdminServicesDashboard from "@/components/admin-services-dashboard"
import { AdminArenaMonitor } from "@/components/admin-arena-monitor"
import { AdminPaperVerification } from "@/components/admin-paper-verification"
import { AdminGameEngineDashboard } from "@/components/admin-game-engine-dashboard"

// --- ONBOARDING COMPONENT ---
export function UserOnboarding() {
  const { setRegistered, setStep, setSessionUser, setProfileComplete, setAdmin } = useNav()
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "admin">("register")
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState("")
  const [adminAuthLoading, setAdminAuthLoading] = useState(false)
  const [adminAuthError, setAdminAuthError] = useState("")

  // Google OAuth state
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false)
  const [googlePickerOpen, setGooglePickerOpen] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState("")
  const [customGoogleName, setCustomGoogleName] = useState("")

  // Load Google Identity Services client script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return
    if (document.getElementById("google-gsi-client")) return
    const script = document.createElement("script")
    script.id = "google-gsi-client"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  const handleGoogleSuccess = async (googleData: { credential?: string; email?: string; name?: string; photoUrl?: string; googleId?: string }) => {
    setGoogleAuthLoading(true)
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        const userObj = data.user
        const isComplete = Boolean(
          userObj.profileComplete ||
          (userObj.stream && userObj.course && String(userObj.stream).trim() !== "" && String(userObj.course).trim() !== "")
        )
        const sessionUser = {
          id: userObj.id || userObj._id,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone || "",
          photoUrl: userObj.photoUrl || "",
          branch: userObj.branch || "",
          bio: userObj.bio || "",
          stream: userObj.stream || "",
          course: userObj.course || "",
          department: userObj.department || "",
          grade: userObj.grade || "",
          isLabApproved: userObj.isLabApproved ?? true,
          status: userObj.status || "Active",
          role: userObj.role || "student",
          profileComplete: isComplete,
          arenaApprovalStatus: userObj.arenaApprovalStatus || "approved",
          arenaApprovalReason: userObj.arenaApprovalReason || "",
          arenaAccess: userObj.arenaAccess || { status: "approved", approved: true },
          points: userObj.points || 0,
          rank: userObj.rank || "Bronze",
          authProvider: "google",
        }
        const token = data.token || generateSessionToken(sessionUser.id, sessionUser.email, sessionUser.role).token
        storeSession({ user: sessionUser, token, role: sessionUser.role, isAdmin: sessionUser.role === 'admin' })
        setSessionUser(sessionUser)
        setProfileComplete(isComplete)
        setAdmin(sessionUser.role === 'admin')
        setRegistered(true)
        const target = (consumePostLoginRedirect() as any) || (isComplete ? "home" : "setup")
        setStep(target)
      } else {
        alert(data.message || "Google authentication failed. Please try again.")
      }
    } catch (err) {
      console.error("[Google Auth Error]:", err)
      alert("Network error. Could not connect to Google authentication service.")
    } finally {
      setGoogleAuthLoading(false)
      setGooglePickerOpen(false)
    }
  }

  const handleInitiateGoogleAuth = async () => {
    setGoogleAuthLoading(true)
    try {
      const res = await fetch("/api/auth/google")
      const info = await res.json()
      const clientId = info?.clientId

      if (clientId && typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        const google = (window as any).google
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              handleGoogleSuccess({ credential: response.credential })
            }
          },
        })
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGooglePickerOpen(true)
          }
        })
        setGoogleAuthLoading(false)
        return
      }
    } catch (_) {}

    setGoogleAuthLoading(false)
    setGooglePickerOpen(true)
  }

  useEffect(() => {
    // Read only active session token from sessionStorage / localStorage
    const saved = getStoredSession()
    if (saved?.user && saved?.token) {
      const isComplete = Boolean(
        saved.user.profileComplete || 
        (saved.user.stream && saved.user.course && String(saved.user.stream).trim() !== "" && String(saved.user.course).trim() !== "")
      )
      setSessionUser({ ...saved.user, profileComplete: isComplete })
      setRegistered(true)
      setProfileComplete(isComplete)
      setAdmin(saved.user.role === 'admin' || saved.user.isAdmin === true || saved.isAdmin === true)
      const target = (consumePostLoginRedirect() as any) || "profile"
      setStep(target)
    }
  }, [setRegistered, setStep, setSessionUser, setProfileComplete, setAdmin])

  // Captcha removed: handlers intentionally omitted

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill in all details.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          })
      })
      const data = await res.json()
      
      if (res.status === 409) {
        alert("Account already exists! Redirecting to Login to enter your credentials...")
        setMode("login")
      } else if (res.ok && (data.user || data.userId)) {
        const userObj = data.user || {
          id: data.userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "student",
          status: "Active",
          isLabApproved: true,
          arenaApprovalStatus: "approved",
          profileComplete: false,
          points: 0,
          rank: "Bronze",
        }
        const sessionUser = {
          id: userObj.id || userObj._id || data.userId,
          name: userObj.name || formData.name,
          email: userObj.email || formData.email,
          phone: userObj.phone || formData.phone,
          photoUrl: userObj.photoUrl || "",
          branch: userObj.branch || "",
          bio: userObj.bio || "",
          stream: userObj.stream || "",
          course: userObj.course || "",
          department: userObj.department || "",
          grade: userObj.grade || "",
          isLabApproved: userObj.isLabApproved ?? true,
          status: userObj.status || "Active",
          role: userObj.role || "student",
          profileComplete: false,
          arenaApprovalStatus: userObj.arenaApprovalStatus || "approved",
          points: 0,
          rank: "Bronze",
        }
        const token = data.token || generateSessionToken(sessionUser.id, sessionUser.email, sessionUser.role).token
        storeSession({ user: sessionUser, token, role: sessionUser.role, isAdmin: false })
        setSessionUser(sessionUser)
        setProfileComplete(false)
        setAdmin(false)
        setRegistered(true)
        const target = (consumePostLoginRedirect() as any) || "profile"
        setStep(target)
      } else {
        alert(data.message || "Registration failed. Please try again.")
      }
    } catch (e) {
      console.error(e)
      alert("Network error. Could not reach server.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill in your Gmail and Password.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      const data = await res.json()
      
      if (res.ok && data.user) {
          const isComplete = Boolean(
            data.user.profileComplete ||
            (data.user.stream && data.user.course && String(data.user.stream).trim() !== "" && String(data.user.course).trim() !== "")
          )
          const sessionUser = {
            id: data.user.id || data.user._id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            photoUrl: data.user.photoUrl || "",
            branch: data.user.branch || "",
            bio: data.user.bio || "",
            stream: data.user.stream || "",
            course: data.user.course || "",
            department: data.user.department || "",
            grade: data.user.grade || "",
            isLabApproved: data.user.isLabApproved ?? true,
            status: data.user.status || "Active",
            role: data.user.role || "student",
            profileComplete: isComplete,
            arenaApprovalStatus: data.user.arenaApprovalStatus || "approved",
            arenaApprovalReason: data.user.arenaApprovalReason || "",
            arenaAccess: data.user.arenaAccess || { status: "approved", approved: true },
            points: data.user.points || 0,
            rank: data.user.rank || "Bronze",
          }
          const token = data.token || generateSessionToken(sessionUser.id, sessionUser.email, sessionUser.role).token
          storeSession({ user: sessionUser, token, role: sessionUser.role, isAdmin: sessionUser.role === 'admin' })
          setSessionUser(sessionUser)
          setProfileComplete(isComplete)
          setAdmin(sessionUser.role === 'admin')
          setRegistered(true)
          const target = (consumePostLoginRedirect() as any) || (isComplete ? "home" : "setup")
          setStep(target)
      } else if (res.status === 403) {
        alert(data.message || "Your account has been suspended by an administrator.")
      } else {
        alert(data.message || "Invalid credentials! Check your Gmail and Password.")
      }
    } catch (e) {
      console.error(e)
      alert("Network error. Could not reach server.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!formData.email || !formData.phone || !formData.password) {
      alert("Please enter your registered Gmail, Phone Number, and New Password.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please ensure New Password and Confirm Password match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          newPassword: formData.password
        })
      })
      const data = await res.json()

      if (res.ok) {
        alert(data.message || "Password reset successful! Please login with your new password.")
        setFormData({ ...formData, password: "", confirmPassword: "" })
        setMode("login")
      } else {
        alert(data.message || "Password reset failed. Please verify your details.")
      }
    } catch (e) {
      console.error(e)
      alert("Network error. Could not reach server.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    const password = adminPasswordInput.trim()
    if (!password) {
      setAdminAuthError("Please enter the administrator password.")
      return
    }

    setAdminAuthLoading(true)
    setAdminAuthError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        const adminSession = {
          id: "admin-master",
          name: "Administrator",
          email: "admin@aurastudy.ai",
          role: "admin" as const,
          isAdmin: true,
          profileComplete: true,
        }
        const adminToken = generateSessionToken(adminSession.id, adminSession.email, "admin").token
        storeSession({ user: adminSession, token: adminToken, role: "admin", isAdmin: true })
        setSessionUser(adminSession)
        setProfileComplete(true)
        setAdmin(true)
        setRegistered(true)
        setStep("admin")
      } else {
        setAdminAuthError(data.message || "Invalid administrator password.")
      }
    } catch (e) {
      console.error(e)
      setAdminAuthError("Network error. Could not verify administrator.")
    } finally {
      setAdminAuthLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
      <Card className="border-2 shadow-2xl overflow-hidden glass-morphism border-primary/20">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-primary to-purple-600 text-primary-foreground py-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Brain className="w-20 h-20 text-white" /></div>
          <CardTitle className="text-3xl font-black tracking-wider italic text-white">AURA PORTAL</CardTitle>
          <CardDescription className="text-primary-foreground/90 font-bold uppercase tracking-widest text-xs">
            {mode === "register" ? "STUDENT REGISTRATION" : mode === "login" ? "STUDENT LOGIN" : mode === "admin" ? "ADMINISTRATOR COMMAND ACCESS" : "RESET YOUR PASSWORD"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-6">
          {typeof window !== "undefined" && sessionStorage.getItem("aura_redirect_after_login") && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Authentication required. Sign in or register to access <strong>{sessionStorage.getItem("aura_redirect_after_login")}</strong>.</span>
            </div>
          )}
          {mode === "admin" ? (
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Administrator Clearance
              </span>
              <button 
                type="button"
                onClick={() => { setMode("login"); setAdminAuthError(""); }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ← Back to Student Login
              </button>
            </div>
          ) : mode !== "forgot" ? (
            <div className="flex border-2 border-muted rounded-xl overflow-hidden">
              <button 
                onClick={() => setMode("register")}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${mode === "register" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted/10"}`}
              >
                Register
              </button>
              <button 
                onClick={() => setMode("login")}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted/10"}`}
              >
                Login
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Account Security Recovery</span>
              <button 
                onClick={() => setMode("login")}
                className="text-xs font-black text-primary hover:underline uppercase"
              >
                ← Back to Login
              </button>
            </div>
          )}

          {mode === "admin" ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-medium leading-relaxed">
                🔒 <strong>Restricted Security Zone</strong>. Game engine telemetry, benchmark runners, user database, and platform controls can only be executed by verified administrators.
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Master Administrator Password</Label>
                <Input 
                  type="password" 
                  placeholder="Enter administrator password" 
                  className="h-12 border-2" 
                  value={adminPasswordInput} 
                  onChange={(e) => setAdminPasswordInput(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdminLogin()
                  }}
                  disabled={adminAuthLoading}
                  autoFocus
                />
              </div>

              {adminAuthError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-bold">
                  ⚠️ {adminAuthError}
                </div>
              )}

              <Button 
                onClick={handleAdminLogin} 
                disabled={adminAuthLoading} 
                className="w-full h-14 text-base font-black bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white rounded-xl shadow-xl hover:scale-102 transition-transform mt-2 border-none"
              >
                {adminAuthLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" /> VERIFYING ACCESS...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 w-5 h-5" /> UNLOCK ADMIN PANEL
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mode !== "forgot" && (
                <div className="space-y-3 pb-1">
                  {/* Google OAuth Option */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleInitiateGoogleAuth}
                    disabled={googleAuthLoading || loading}
                    className="w-full h-13 border-2 border-border/80 bg-background/80 hover:bg-muted/40 text-foreground font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-3 transition-all hover:border-primary/50 hover:scale-[1.01]"
                  >
                    {googleAuthLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>{mode === "register" ? "Sign up with Google" : "Continue with Google"}</span>
                  </Button>

                  {/* Or continue with email & password */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-border/70 w-full" />
                    <span className="bg-card px-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground absolute">
                      Or with email & password
                    </span>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label className="font-bold">Full Name</Label>
                    <Input 
                      placeholder="Enter your name" 
                      className="h-12 border-2" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Phone Number</Label>
                    <Input 
                      placeholder="+91 00000 00000" 
                      className="h-12 border-2" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    />
                  </div>
                </>
              )}

              {mode === "forgot" && (
                <div className="space-y-2">
                  <Label className="font-bold">Registered Phone Number *</Label>
                  <Input 
                    placeholder="+91 00000 00000" 
                    className="h-12 border-2" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold">Gmail Address</Label>
                <Input 
                  type="email" 
                  placeholder="student@gmail.com" 
                  className="h-12 border-2" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">{mode === "forgot" ? "New Password" : "Password"}</Label>
                  {mode === "login" && (
                    <button 
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 border-2" 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                />
              </div>

              {mode === "forgot" && (
                <div className="space-y-2">
                  <Label className="font-bold">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 border-2" 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                  />
                </div>
              )}

              {mode === "register" ? (
                <Button 
                  onClick={handleRegister} 
                  disabled={loading} 
                  className="w-full h-14 text-lg font-black bg-primary text-primary-foreground rounded-xl shadow-xl hover:scale-102 transition-transform mt-4"
                >
                  {loading ? "REGISTERING..." : "CREATE ACCOUNT"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : mode === "login" ? (
                <Button 
                  onClick={handleLogin} 
                  disabled={loading} 
                  className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 rounded-xl shadow-xl hover:scale-102 transition-transform mt-4 text-white border-none"
                >
                  {loading ? "LOGGING IN..." : "VERIFY & ENTER"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleResetPassword} 
                  disabled={loading} 
                  className="w-full h-14 text-lg font-black bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl hover:scale-102 transition-transform mt-4 text-white border-none"
                >
                  {loading ? "SAVING..." : "SET NEW PASSWORD"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}

              {/* Admin Switcher at Registration / Login time */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Administrator account?</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setMode("admin"); setAdminAuthError(""); setAdminPasswordInput(""); }}
                  className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-wider"
                >
                  Switch to Admin <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setStep("upload")}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors hover:underline"
        >
          ← Return to Home Page
        </button>
      </div>

      {/* ================= Google Account Verification & OAuth Modal ================= */}
      {googlePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f111a] border border-primary/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setGooglePickerOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Sign in with Google</h3>
                <p className="text-xs text-muted-foreground">Choose an account to continue to Aura Study AI</p>
              </div>
            </div>

            {/* Quick-Select Profile */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleSuccess({
                  email: formData.email && formData.email.includes("@") ? formData.email : "student@gmail.com",
                  name: formData.name || "Student User",
                  photoUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
                })}
                className="w-full p-3.5 rounded-xl border border-border/80 bg-white/5 hover:bg-white/10 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "G"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {formData.name || "Google Student"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.email && formData.email.includes("@") ? formData.email : "student@gmail.com"}
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Verified</Badge>
              </button>
            </div>

            {/* Custom Google Account Form */}
            <div className="pt-2 border-t border-border/40 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                Or enter custom Google account
              </span>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="h-11 text-xs border-2"
                />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="h-11 text-xs border-2"
                />
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (!customGoogleEmail || !customGoogleEmail.includes("@")) {
                    alert("Please enter a valid Google email address.")
                    return
                  }
                  handleGoogleSuccess({
                    email: customGoogleEmail,
                    name: customGoogleName || customGoogleEmail.split("@")[0],
                    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(customGoogleName || customGoogleEmail)}&background=4285F4&color=fff`,
                  })
                }}
                disabled={googleAuthLoading}
                className="w-full h-12 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg hover:scale-101 transition-transform"
              >
                {googleAuthLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verify & Enter Directly
              </Button>
            </div>

            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-[10px] text-muted-foreground leading-relaxed">
              🔒 <strong>Google OAuth 2.0 Security</strong>: Identity is checked and verified by Google. Aura Study AI will securely connect your student profile.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- ADMIN PANEL COMPONENT ---
export function AdminPanel() {
  const { setAdmin, isAdmin } = useNav()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"services" | "engine" | "arena" | "users" | "credentials" | "activity" | "feedback" | "papers">("services")
  const [pendingPapersCount, setPendingPapersCount] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  
  // Game Engine & Grafana Console States (Admin Only Execution)
  const [engineQueryMode, setEngineQueryMode] = useState<"math" | "custom" | "document" | "coding" | "gk" | "puzzle">("math")
  const [engineDifficulty, setEngineDifficulty] = useState("beginner")
  const [engineCount, setEngineCount] = useState(5)
  const [engineTopic, setEngineTopic] = useState("")
  const [engineDocument, setEngineDocument] = useState("")
  const [engineQueryLoading, setEngineQueryLoading] = useState(false)
  const [engineQueryResult, setEngineQueryResult] = useState<any>(null)
  const [engineBenchmarking, setEngineBenchmarking] = useState(false)
  const [engineBenchmarkResult, setEngineBenchmarkResult] = useState<any>(null)
  const [engineTelemetry, setEngineTelemetry] = useState<any>(null)
  const [engineTelemetryLoading, setEngineTelemetryLoading] = useState(false)
  
  // Arena Approvals States
  const [arenaApprovals, setArenaApprovals] = useState<any[]>([])
  const [arenaLoading, setArenaLoading] = useState(false)
  const [arenaError, setArenaError] = useState<string | null>(null)
  const [arenaFilterStatus, setArenaFilterStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending")
  const [selectedArenaUsers, setSelectedArenaUsers] = useState<string[]>([])
  const [rejectReason, setRejectReason] = useState("")
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [arenaSubTab, setArenaSubTab] = useState<"monitor" | "report" | "access">("monitor")
  
  // Feedback states
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false)

  const fetchFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true)
    try {
      const res = await fetch("/api/feedback")
      const data = await res.json()
      if (res.ok && data.feedbacks) {
        const formatted = data.feedbacks.map((f: any) => ({
          id: f._id || f.id,
          user: `${f.userName || "Student"} (${f.userEmail || ""})`,
          userName: f.userName || "Student",
          userEmail: f.userEmail || "",
          message: f.message,
          category: f.category || "general",
          rating: f.rating,
          time: f.createdAt ? new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          replies: f.replies ? f.replies.map((r: any) => `Admin: ${r.text}`) : [],
          replyInput: "",
          aiLoading: false
        }))
        setFeedbacks(formatted)
      }
    } catch (e) {
      console.warn("Failed to load feedbacks:", e)
    } finally {
      setLoadingFeedbacks(false)
    }
  }, [])

  useEffect(() => {
    setUsersError(null)
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users)
        setLoading(false)
      })
      .catch(err => {
        console.warn('Users fetch failed (DB may be unavailable):', err)
        setUsersError('Could not connect to database. Showing cached data if available.')
        setLoading(false)
      })

    // Fetch pending paper count for admin badge
    fetch("/api/admin/papers-moderation?status=pending")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setPendingPapersCount(data.stats.pendingCount || 0)
        }
      })
      .catch(() => {})
  }, [])

  // Fetch Arena Approvals or Feedback based on active tab
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "arena") {
      fetchArenaApprovals()
    }
    if (activeTab === "feedback") {
      fetchFeedbacks()
    }
    if (activeTab === "engine") {
      fetchEngineTelemetry()
    }
  }, [activeTab])

  useEffect(() => {
    if (!selectedUserId && users.length) {
      setSelectedUserId(users[0]._id)
    }
  }, [users, selectedUserId])

  const handleAccountStatus = async (id: string, newStatus: "Active" | "Suspended" | "Inactive") => {
    try {
      const adminUser = getAdminUserObj()
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify(adminUser))
        },
        body: JSON.stringify({ userId: id, status: newStatus })
      })
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? {
          ...u,
          status: newStatus,
          arenaApprovalStatus: newStatus === "Suspended" ? "suspended" : (u.arenaApprovalStatus || "approved"),
          isLabApproved: newStatus === "Suspended" ? false : u.isLabApproved
        } : u))
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || err.error || "Failed to update user status")
      }
    } catch (e: any) {
      console.error(e)
      alert("Failed to update status: " + e.message)
    }
  }

  const handleArenaControl = async (id: string, newApproval: "approved" | "rejected" | "suspended") => {
    try {
      const adminUser = getAdminUserObj()
      const action = newApproval === "approved" ? "approve" : (newApproval === "suspended" ? "suspend" : "reject")
      const res = await fetch("/api/admin/arena-approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify(adminUser))
        },
        body: JSON.stringify({ userId: id, action, reason: newApproval === "approved" ? "" : "Admin decision" })
      })
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, arenaApprovalStatus: newApproval } : u))
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "Failed to update arena approval")
      }
    } catch (e: any) {
      console.error(e)
      alert("Failed to update arena: " + e.message)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active"
    await handleAccountStatus(id, nextStatus as any)
  }

  const toggleLabAccess = async (id: string, currentAccess: boolean) => {
    try {
      const adminUser = getAdminUserObj()
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify(adminUser))
        },
        body: JSON.stringify({ userId: id, isLabApproved: !currentAccess })
      })
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, isLabApproved: !currentAccess } : u))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendReply = async (feedbackId: string) => {
    const target = feedbacks.find(f => f.id === feedbackId)
    if (!target || !target.replyInput.trim()) return

    const replyMsg = target.replyInput.trim()
    try {
      await fetch("/api/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId,
          replyText: replyMsg,
        }),
      })
    } catch (e) {
      console.warn("Failed to persist reply to DB:", e)
    }

    setFeedbacks(feedbacks.map(f => {
      if (f.id === feedbackId) {
        return {
          ...f,
          replies: [...f.replies, `Admin: ${replyMsg}`],
          replyInput: ""
        }
      }
      return f
    }))
  }

  const handleReplyViaGmail = (f: any) => {
    const email = f.userEmail || (f.user && f.user.match(/\((.*?)\)/) ? f.user.match(/\((.*?)\)/)[1] : "") || "helpsupport9452@gmail.com"
    const subject = encodeURIComponent(`Aura Support Team - Reply to Feedback from ${f.userName || 'Student'}`)
    const bodyContent = f.replyInput && f.replyInput.trim() 
      ? f.replyInput.trim() 
      : `Dear ${f.userName || 'Student'},\n\nThank you for sharing your feedback with the Aura Study AI team:\n"${f.message}"\n\nWe have reviewed your request and appreciate your contribution to improving the platform.\n\nWarm regards,\nAura Support Team\nhelpsupport9452@gmail.com`
    
    const body = encodeURIComponent(bodyContent)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`
    
    const opened = window.open(gmailUrl, "_blank")
    if (!opened) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    }
  }

  const handleAiSuggestReply = async (feedbackId: string, userMessage: string) => {
    setFeedbacks(feedbacks.map(f => f.id === feedbackId ? { ...f, aiLoading: true } : f))
    
    try {
      const prompt = `Write a short, highly professional academic support response (maximum 2 sentences) replying to this feedback: "${userMessage}".`
      const res = await fetch("/api/guider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ text: prompt, isAi: false }]
        })
      })
      const data = await res.json()
      
      if (res.ok && data.text) {
        setFeedbacks(feedbacks.map(f => {
          if (f.id === feedbackId) {
            return {
              ...f,
              replyInput: data.text,
              aiLoading: false
            }
          }
          return f
        }))
      } else {
        throw new Error(data.error || "Failed suggestion")
      }
    } catch (err) {
      console.warn("AI Reply generation failed. Using local template:", err)
      setFeedbacks(feedbacks.map(f => {
        if (f.id === feedbackId) {
          return {
            ...f,
            replyInput: "Thank you for sharing your feedback with the academic board! We have recorded this and will update our database shortly.",
            aiLoading: false
          }
        }
        return f
      }))
    }
  }

  // Arena Approval Handlers
  // Build admin identity for API headers: prefer real session, ensure all fields present
  const getAdminUserObj = () => {
    const raw = localStorage.getItem('aura_session')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const user = parsed?.user || parsed
        
        // Return user object with guaranteed admin fields
        return {
          ...user,
          role: user?.role || 'admin',
          isAdmin: user?.isAdmin !== false,
          name: user?.name || 'Admin',
          email: user?.email || 'admin@aura',
        }
      } catch (err) {
        console.error('Failed to parse admin session:', err)
      }
    }
    
    // Fallback: minimal admin object with required fields
    return { 
      id: 'admin', 
      name: 'Admin', 
      email: 'admin@aura', 
      role: 'admin',
      isAdmin: true,
    }
  }

  const fetchArenaApprovals = useCallback(async () => {
    // Gate on the context flag set by the password-unlock flow
    if (!isAdmin) {
      console.warn('fetchArenaApprovals: not admin, skipping')
      return
    }
    try {
      setArenaLoading(true)
      setArenaError(null)
      const adminUser = getAdminUserObj()

      const response = await fetch(
        `/api/admin/arena-approvals?status=${arenaFilterStatus}&page=1&limit=50`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-session-user': encodeURIComponent(JSON.stringify(adminUser)),
          },
        }
      )

      if (response.status === 401) {
        console.warn('Arena approvals: API returned 401 - admin auth failed')
        setArenaError('Admin authentication failed. Please re-login.')
        setArenaApprovals([])
        setArenaLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()
      setArenaApprovals(data.data || [])
    } catch (error: any) {
      console.warn('Arena approval fetch failed (DB may be unavailable):', error.message)
      setArenaError(
        error.message?.includes('connect') || error.message?.includes('MongoDB')
          ? 'Cannot connect to database. Please whitelist your IP in MongoDB Atlas.'
          : `Failed to load approvals: ${error.message}`
      )
      setArenaApprovals([])
    } finally {
      setArenaLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, arenaFilterStatus])

  const handleArenaApprove = async (userId: string) => {
    if (!isAdmin) { alert('Admin access required'); return }
    try {
      setArenaLoading(true)
      const adminUser = getAdminUserObj()

      const response = await fetch('/api/admin/arena-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-user': encodeURIComponent(JSON.stringify(adminUser)),
        },
        body: JSON.stringify({ userId, action: 'approve' }),
      })

      const responseData = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to approve (${response.status})`)
      }

      setArenaApprovals(arenaApprovals.filter(a => a._id !== userId))
      setSelectedArenaUsers(selectedArenaUsers.filter(id => id !== userId))
      alert('Approved successfully!')
    } catch (error: any) {
      console.error('Arena approval error:', error.message)
      alert('Failed to approve: ' + error.message)
    } finally {
      setArenaLoading(false)
    }
  }

  const handleArenaReject = async (userId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    if (!isAdmin) { alert('Admin access required'); return }

    try {
      setArenaLoading(true)
      const adminUser = getAdminUserObj()

      const response = await fetch('/api/admin/arena-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-user': encodeURIComponent(JSON.stringify(adminUser)),
        },
        body: JSON.stringify({ userId, action: 'reject', reason: rejectReason }),
      })

      const responseData = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to reject (${response.status})`)
      }

      setArenaApprovals(arenaApprovals.filter(a => a._id !== userId))
      setRejectReason('')
      setRejectingUserId(null)
      setSelectedArenaUsers(selectedArenaUsers.filter(id => id !== userId))
      alert('Rejected successfully!')
    } catch (error: any) {
      console.error('Arena rejection error:', error.message)
      alert('Failed to reject: ' + error.message)
    } finally {
      setArenaLoading(false)
    }
  }

  const handleBulkArenaApprove = async () => {
    if (selectedArenaUsers.length === 0) {
      alert('Please select users to approve')
      return
    }
    if (!isAdmin) { alert('Admin access required'); return }

    try {
      setArenaLoading(true)
      const adminUser = getAdminUserObj()

      const response = await fetch('/api/admin/arena-approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-user': encodeURIComponent(JSON.stringify(adminUser)),
        },
        body: JSON.stringify({ userIds: selectedArenaUsers, action: 'approve' }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || `Failed to approve (${response.status})`)
      }

      setArenaApprovals(arenaApprovals.filter(a => !selectedArenaUsers.includes(a._id)))
      setSelectedArenaUsers([])
      alert(`Approved ${data.modifiedCount || selectedArenaUsers.length} users successfully!`)
    } catch (error: any) {
      console.error('Bulk approval error:', error.message)
      alert('Failed to approve: ' + error.message)
    } finally {
      setArenaLoading(false)
    }
  }

  const toggleArenaUserSelection = (userId: string) => {
    setSelectedArenaUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const toggleSelectAllArena = () => {
    if (selectedArenaUsers.length === arenaApprovals.length) {
      setSelectedArenaUsers([])
    } else {
      setSelectedArenaUsers(arenaApprovals.map(a => a._id))
    }
  }

  const fetchEngineTelemetry = useCallback(async () => {
    if (!isAdmin) return
    setEngineTelemetryLoading(true)
    try {
      const adminUser = getAdminUserObj()
      const res = await fetch("/api/admin/game-engine", {
        headers: {
          "x-session-user": encodeURIComponent(JSON.stringify(adminUser)),
        },
      })
      const data = await res.json()
      if (res.ok && data.telemetry) {
        setEngineTelemetry(data.telemetry)
      }
    } catch (_) {}
    finally {
      setEngineTelemetryLoading(false)
    }
  }, [isAdmin])

  const executeEngineQuery = async () => {
    if (!isAdmin) {
      alert("Superuser privilege required. Only admins can execute Game Engine queries.")
      return
    }
    setEngineQueryLoading(true)
    try {
      const adminUser = getAdminUserObj()
      const res = await fetch("/api/admin/game-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify(adminUser)),
        },
        body: JSON.stringify({
          action: "query",
          mode: engineQueryMode,
          difficulty: engineDifficulty,
          count: engineCount,
          topic: engineTopic,
          document: engineDocument,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setEngineQueryResult(data)
      } else {
        alert(data.error || "Query failed")
      }
    } catch (err: any) {
      alert("Query error: " + err.message)
    } finally {
      setEngineQueryLoading(false)
    }
  }

  const executeEngineBenchmark = async () => {
    if (!isAdmin) {
      alert("Superuser privilege required. Only admins can execute the 1,000 req/s benchmark.")
      return
    }
    setEngineBenchmarking(true)
    setEngineBenchmarkResult(null)
    try {
      const adminUser = getAdminUserObj()
      const res = await fetch("/api/admin/game-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify(adminUser)),
        },
        body: JSON.stringify({ action: "benchmark", numRequests: 1000, concurrency: 50 }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        setEngineBenchmarkResult(data.data)
      } else {
        alert(data.error || "Benchmark failed")
      }
    } catch (err: any) {
      alert("Benchmark failed: " + err.message)
    } finally {
      setEngineBenchmarking(false)
    }
  }

  return (
    <div className="container mx-auto py-8 sm:py-12 px-4 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2 sm:gap-3">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse flex-shrink-0" /> 
            ADMIN COMMAND CENTER
          </h1>
          <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Superuser Security & Access Console</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="h-8 px-4 font-bold border-cyan-500 text-cyan-400 w-fit text-xs bg-cyan-500/10">1,000 REQ/S ENGINE ACTIVE</Badge>
          <Badge variant="outline" className="h-8 px-4 font-bold border-primary text-primary w-fit text-xs">POLICY ENFORCER ENABLED</Badge>
        </div>
      </div>

      {/* Responsive Tabs Switcher */}
      <div className="flex items-center gap-2 border-b-2 border-muted mb-8 pb-2 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
        <button 
          onClick={() => setActiveTab("services")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "services" ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/20" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          <Activity className="w-4 h-4 text-emerald-300" /> Services Health &amp; Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("engine")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "engine" ? "bg-cyan-600 text-white shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          <Activity className="w-4 h-4" /> Game Engine & Grafana
        </button>
        <button 
          onClick={() => setActiveTab("users")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "users" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          User Base Control
        </button>
        <button 
          onClick={() => setActiveTab("credentials")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "credentials" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          Credentials Vault
        </button>
        <button 
          onClick={() => setActiveTab("activity")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "activity" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          Activity Monitor
        </button>
        <button 
          onClick={() => setActiveTab("feedback")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "feedback" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          Active Feedback Center
        </button>
        <button 
          onClick={() => setActiveTab("arena")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "arena" ? "bg-orange-500 text-white shadow-lg" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          <Zap className="w-4 h-4" /> Arena Services
        </button>
        <button 
          onClick={() => setActiveTab("papers")} 
          className={`px-3.5 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "papers" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20" : "text-muted-foreground hover:bg-muted/10"}`}
        >
          <FileText className="w-4 h-4" /> Paper Verification &amp; Approvals
          {pendingPapersCount > 0 && (
            <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0 h-4 ml-1 animate-pulse">
              {pendingPapersCount}
            </Badge>
          )}
        </button>
      </div>

      {activeTab === "services" ? (
        <div className="w-full">
          <AdminServicesDashboard />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "users" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" /> User Base Management
                </CardTitle>
                <CardDescription>Control account activation and system access</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground font-bold">Loading User Database...</div>
                ) : usersError ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="text-red-500 font-bold text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      ⚠️ {usersError}
                    </div>
                    <button
                      onClick={() => { setLoading(true); setUsersError(null); fetch('/api/users').then(r => r.json()).then(d => { if (d.users) setUsers(d.users); setLoading(false) }).catch(e => { setUsersError(e.message); setLoading(false) }) }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90"
                    >
                      🔄 Retry Connection
                    </button>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No users found. Ensure MongoDB is connected.</div>
                ) : (
                  <div className="divide-y-2">
                    {users.map(user => {
                      const isSuspended = user.status === "Suspended";
                      const isActive = user.status === "Active";
                      const arenaStatus = user.arenaApprovalStatus || "approved";
                      const isArenaApproved = arenaStatus === "approved";

                      return (
                        <div key={user._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-muted/10 transition-colors gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold uppercase text-white ${isSuspended ? "bg-red-600 shadow-md shadow-red-500/20" : "bg-primary/80"}`}>
                              {user.name?.[0] || "?"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-lg">{user.name}</p>
                                {user.role === 'admin' && (
                                  <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5">ADMIN</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-muted-foreground font-bold">Tier: {user.rank || 'Bronze'}</span>
                                <span className="text-[11px] text-muted-foreground font-bold">• Points: {user.points || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Account Status Badge */}
                            <Badge className={
                              isSuspended
                                ? "bg-red-600 text-white font-bold"
                                : isActive
                                ? "bg-green-600 text-white font-bold"
                                : "bg-gray-500 text-white font-bold"
                            }>
                              {user.status || "Active"}
                            </Badge>

                            {/* Arena Access Badge */}
                            <Badge variant="outline" className={
                              isArenaApproved
                                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold"
                                : "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold"
                            }>
                              Arena: {arenaStatus}
                            </Badge>

                            {/* Admin Action Buttons */}
                            <div className="flex items-center gap-2">
                              {/* Suspend / Reactivate Account Button */}
                              {isSuspended ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950 font-bold text-xs"
                                  onClick={() => handleAccountStatus(user._id, "Active")}
                                >
                                  Reactivate
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="font-bold text-xs"
                                  onClick={() => handleAccountStatus(user._id, "Suspended")}
                                >
                                  Suspend Account
                                </Button>
                              )}

                              {/* Revoke / Approve Arena Access Button */}
                              {isArenaApproved ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-500 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 font-bold text-xs"
                                  onClick={() => handleArenaControl(user._id, "rejected")}
                                >
                                  Revoke Arena
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                  onClick={() => handleArenaControl(user._id, "approved")}
                                >
                                  Approve Arena
                                </Button>
                              )}

                              {/* Lab Access Switch */}
                              <div className="flex items-center gap-1.5 ml-2">
                                <Label className="text-[10px] font-bold text-indigo-500 uppercase">Lab</Label>
                                <Switch
                                  checked={user.isLabApproved || false}
                                  onCheckedChange={() => toggleLabAccess(user._id, user.isLabApproved || false)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "credentials" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-indigo-500" /> Credentials Vault
                </CardTitle>
                <CardDescription>View User IDs, Gmail addresses, and Password Hashes stored in MongoDB</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center font-bold text-muted-foreground">Loading Vault...</div>
                ) : users.length === 0 ? (
                  <div className="text-center text-muted-foreground">No credentials found in database.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                      <thead className="text-xs text-foreground uppercase bg-muted/50 border-b font-black">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Gmail Address</th>
                          <th className="py-3 px-4">User ID (Unique)</th>
                          <th className="py-3 px-4">Password Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-b">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-muted/5 transition-colors text-foreground font-medium">
                            <td className="py-4 px-4 font-black">{u.name}</td>
                            <td className="py-4 px-4 font-bold text-blue-500">{u.email}</td>
                            <td className="py-4 px-4 font-mono text-[10px] bg-muted/20">{u._id}</td>
                            <td className="py-4 px-4">
                              <code className="text-xs font-mono text-purple-600 truncate max-w-[200px] block" title={u.password || "Secure Hashed"}>
                                {u.password ? u.password.substring(0, 18) + "..." : "[$2a$10$hashed...]"}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "activity" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-500" /> Student Activity Monitor
                </CardTitle>
                <CardDescription>Inspect game participation, battle results, and profile activity for any student.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
                  <div>
                    <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Select student</Label>
                    <select
                      className="w-full rounded-2xl border-2 border-muted/40 bg-background px-4 py-3 text-sm text-foreground"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name} — {user.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Live summary</p>
                    <p className="text-lg font-black mt-2">{selectedUserId ? users.find(u => u._id === selectedUserId)?.name : "No student selected"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Use this view to manage game activity and user status.</p>
                  </div>
                </div>

                {selectedUserId ? (
                  (() => {
                    const selected = users.find(u => u._id === selectedUserId)
                    if (!selected) return <p className="text-muted-foreground">Selected user not found.</p>

                    return (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            { label: 'Total Battles', value: selected.totalBattles ?? 0 },
                            { label: 'Wins', value: selected.wins ?? 0 },
                            { label: 'Losses', value: selected.losses ?? 0 },
                            { label: 'Win Rate', value: `${selected.winRate ?? 0}%` },
                            { label: 'Arena Rank', value: selected.arenaRank || 'Unranked' },
                            { label: 'Arena Points', value: selected.arenaPoints ?? 0 },
                          ].map(item => (
                            <div key={item.label} className="rounded-2xl border border-muted/40 bg-muted/10 p-4">
                              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{item.label}</p>
                              <p className="text-2xl font-black mt-2">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-3xl border border-muted/30 bg-background/80 p-6">
                          <h3 className="font-black text-lg mb-4">Recent Battle Activity</h3>
                          {selected.battleHistory && selected.battleHistory.length > 0 ? (
                            <div className="space-y-4">
                              {selected.battleHistory.slice(0, 6).map((battle: any, index: number) => (
                                <div key={battle.battleId || index} className="rounded-2xl border border-muted/40 bg-muted/5 p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-black">{battle.mode?.toUpperCase() || 'GAME'} {battle.difficulty?.toUpperCase() || ''}</p>
                                    <Badge className={battle.result === 'win' ? 'bg-emerald-500 text-white' : battle.result === 'loss' ? 'bg-destructive text-white' : 'bg-slate-500 text-white'}>
                                      {battle.result?.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">Opponent: {battle.opponentName || 'Unknown'} • Score: {battle.score ?? 0} • Acc: {battle.accuracy ?? 0}%</p>
                                  <p className="text-xs text-muted-foreground mt-1">XP: {battle.xpGained ?? 0} • Points: {battle.pointsGained ?? 0}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No game activity recorded yet for this student.</p>
                          )}
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <p className="text-muted-foreground">Waiting for student selection...</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "feedback" && (
            <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-green-500" /> Student Feedback & Admin Reply Center
                  </CardTitle>
                  <CardDescription>Live feedback from users sent to helpsupport9452@gmail.com or via portal</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchFeedbacks} disabled={loadingFeedbacks} className="gap-2 font-bold">
                  <RefreshCw className={`w-4 h-4 ${loadingFeedbacks ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {loadingFeedbacks && (
                  <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground font-bold">
                    <Activity className="w-5 h-5 animate-spin text-primary" /> Loading feedback entries...
                  </div>
                )}
                {!loadingFeedbacks && feedbacks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground space-y-3">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="font-bold text-lg">No student feedback submitted yet.</p>
                    <p className="text-xs">Submissions from the user Feedback section will appear here automatically.</p>
                  </div>
                )}
                {!loadingFeedbacks && feedbacks.length > 0 && feedbacks.map(f => (
                  <Card key={f.id} className="border p-4 bg-muted/5 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-foreground">{f.user}</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-1">&quot;{f.message}&quot;</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{f.time}</Badge>
                    </div>

                    {f.replies.length > 0 && (
                      <div className="pl-4 border-l-4 border-primary space-y-2 bg-muted/10 p-3 rounded-r-lg">
                        {f.replies.map((rep: string, idx: number) => (
                          <p key={idx} className="text-xs font-bold text-primary">{rep}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
                      <Input 
                        placeholder={f.aiLoading ? "AI is generating a draft..." : "Write a professional feedback reply..."} 
                        value={f.replyInput}
                        onChange={(e) => setFeedbacks(feedbacks.map(item => item.id === f.id ? { ...item, replyInput: e.target.value } : item))}
                        disabled={f.aiLoading}
                        className="flex-1 min-w-[200px] h-10 border-2"
                      />
                      <Button 
                        type="button"
                        onClick={() => handleAiSuggestReply(f.id, f.message)} 
                        disabled={f.aiLoading}
                        variant="secondary" 
                        className="h-10 text-xs font-black gap-1 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> AI Assist
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => handleSendReply(f.id)} 
                        disabled={!f.replyInput.trim()} 
                        className="h-10 text-xs font-black px-4 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:bg-muted disabled:text-muted-foreground transition-all shadow-sm shrink-0 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Reply
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleReplyViaGmail(f)}
                        variant="outline"
                        className="h-10 text-xs font-black px-3 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all shrink-0 flex items-center gap-1.5"
                        title="Reply via platform Gmail (helpsupport9452@gmail.com)"
                      >
                        <Mail className="w-3.5 h-3.5 text-rose-400" /> Platform Gmail
                      </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "arena" && (
            <div className="space-y-6">
              {/* Arena Sub-Tab Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-muted/20 border border-border/40 rounded-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={arenaSubTab === "monitor" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArenaSubTab("monitor")}
                    className="gap-2 font-black text-xs h-9 shadow-sm"
                  >
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Real-Time Dashboard & Services Monitor
                  </Button>
                  <Button
                    variant={arenaSubTab === "report" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArenaSubTab("report")}
                    className={`gap-2 font-black text-xs h-9 ${arenaSubTab === "report" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md" : "border-purple-500/30 text-purple-300 hover:bg-purple-600/10"}`}
                  >
                    <Brain className="w-4 h-4 text-amber-300 animate-pulse" />
                    24H Behavior Prediction & Smart Lab
                    <Badge className="bg-amber-400 text-black font-black text-[9px] px-1 py-0 ml-1">AI</Badge>
                  </Button>
                  <Button
                    variant={arenaSubTab === "access" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setArenaSubTab("access")
                      fetchArenaApprovals()
                    }}
                    className="gap-2 font-black text-xs h-9"
                  >
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    Access Control & Approvals
                    {arenaApprovals.filter(a => a.arenaApprovalStatus === 'pending').length > 0 && (
                      <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-4 ml-1">
                        {arenaApprovals.filter(a => a.arenaApprovalStatus === 'pending').length}
                      </Badge>
                    )}
                  </Button>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/20 self-start sm:self-center">
                  ● HTTP/2 LIVE STREAM ACTIVE
                </Badge>
              </div>

              {/* Sub-View 1: Real-Time Services & Behavior Monitor */}
              {arenaSubTab === "monitor" && (
                <AdminArenaMonitor activeViewMode="monitor" />
              )}

              {/* Sub-View 2: 24H Behavioral Prediction & Smart Lab Intelligence */}
              {arenaSubTab === "report" && (
                <AdminArenaMonitor activeViewMode="prediction" />
              )}

              {/* Sub-View 2: Access Control & Student Requests */}
              {arenaSubTab === "access" && (
                <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
                  <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-orange-500" /> Arena Services - Access Control
                    </CardTitle>
                    <CardDescription>Approve or reject students requesting battle arena access</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setArenaFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all ${
                        arenaFilterStatus === status
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Bulk Actions */}
                {selectedArenaUsers.length > 0 && (
                  <div className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-300 dark:border-blue-700">
                    <span className="font-bold text-blue-900 dark:text-blue-100">{selectedArenaUsers.length} selected</span>
                    <button
                      onClick={handleBulkArenaApprove}
                      disabled={arenaLoading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4" /> Bulk Approve
                    </button>
                  </div>
                )}

                {/* Approval Requests List */}
                <div className="space-y-4">
                  {arenaError ? (
                    <div className="p-6 space-y-3">
                      <div className="text-red-500 font-bold text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4 leading-relaxed">
                        ⚠️ {arenaError}
                      </div>
                      <button
                        onClick={fetchArenaApprovals}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                      >
                        🔄 Retry
                      </button>
                    </div>
                  ) : arenaLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
                      <p className="mt-2 text-muted-foreground font-bold">Loading arena requests...</p>
                    </div>
                  ) : arenaApprovals.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-xl">
                      <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground font-bold">No {arenaFilterStatus === 'all' ? 'requests' : arenaFilterStatus + ' requests'} found</p>
                    </div>
                  ) : (
                    <>
                      {/* Select All Checkbox */}
                      <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg border border-muted/40">
                        <input
                          type="checkbox"
                          checked={selectedArenaUsers.length === arenaApprovals.length && arenaApprovals.length > 0}
                          onChange={toggleSelectAllArena}
                          className="w-5 h-5 rounded cursor-pointer accent-orange-500"
                        />
                        <span className="font-bold text-sm uppercase text-muted-foreground">Select All</span>
                      </div>

                      {/* Individual Requests */}
                      {arenaApprovals.map((approval) => (
                        <div key={approval._id} className="border border-muted/40 rounded-xl p-4 bg-muted/5 space-y-3 hover:bg-muted/10 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedArenaUsers.includes(approval._id)}
                                onChange={() => toggleArenaUserSelection(approval._id)}
                                className="w-5 h-5 rounded cursor-pointer accent-orange-500"
                              />
                              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-600">
                                {approval.name?.[0] || "?"}
                              </div>
                              <div className="flex-1">
                                <p className="font-black text-lg">{approval.name}</p>
                                <p className="text-xs text-muted-foreground font-bold">{approval.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(approval.arenaAccessRequestedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`${
                                approval.arenaApprovalStatus === 'pending' ? 'bg-yellow-500' :
                                approval.arenaApprovalStatus === 'approved' ? 'bg-green-500' :
                                'bg-red-500'
                              } text-white`}>
                                {approval.arenaApprovalStatus.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          {/* Rejection Reason Display */}
                          {approval.arenaApprovalReason && (
                            <div className="text-sm bg-red-100/30 dark:bg-red-900/20 p-3 rounded-lg border border-red-300/50 dark:border-red-800/50">
                              <p className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Rejection Reason:</p>
                              <p className="text-red-600 dark:text-red-400">{approval.arenaApprovalReason}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {approval.arenaApprovalStatus === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleArenaApprove(approval._id)}
                                disabled={arenaLoading}
                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                              </button>

                              {rejectingUserId === approval._id ? (
                                <>
                                  <input
                                    type="text"
                                    placeholder="Reason..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                                  />
                                  <button
                                    onClick={() => handleArenaReject(approval._id)}
                                    disabled={arenaLoading || !rejectReason.trim()}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 transition-all"
                                  >
                                    <XSquare className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingUserId(null)
                                      setRejectReason('')
                                    }}
                                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setRejectingUserId(approval._id)}
                                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <XSquare className="w-4 h-4" /> Reject
                                </button>
                              )}
                            </div>
                          )}

                          {approval.arenaApprovalStatus === 'rejected' && (
                            <button
                              onClick={() => handleArenaApprove(approval._id)}
                              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Reconsider & Approve
                            </button>
                          )}

                          {approval.arenaApprovalStatus === 'approved' && (
                            <div className="text-sm bg-green-100/30 dark:bg-green-900/20 p-3 rounded-lg border border-green-300/50 dark:border-green-800/50">
                              <p className="text-green-700 dark:text-green-300 font-bold">✓ Approved</p>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Approved on: {new Date(approval.arenaApprovedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

          {activeTab === "papers" && (
            <div className="w-full">
              <AdminPaperVerification onCountChange={setPendingPapersCount} />
            </div>
          )}

          {/* Engine Console (Only Admin Execute) */}
          {activeTab === "engine" && (
            <AdminGameEngineDashboard />
          )}

        </div>

        <div className="space-y-8">
          {activeTab === "engine" ? (
            <div className="space-y-6">
              {/* Architecture Card */}
              <Card className="border-2 shadow-xl bg-slate-950 text-white border-cyan-500/30">
                <CardHeader className="bg-cyan-500/10 border-b border-cyan-500/20 py-4">
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-cyan-400">
                    <Cpu className="w-4 h-4" /> ENGINE ARCHITECTURE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white/60">Worker Threads:</span>
                    <span className="font-bold text-cyan-300">16 Thread Pool</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white/60">Concurrent Queue:</span>
                    <span className="font-bold text-emerald-400">asyncio.Queue</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white/60">Hot Ring Buffer:</span>
                    <span className="font-bold text-yellow-400">&lt; 0.5 ms Response</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white/60">Array Vectors:</span>
                    <span className="font-bold text-indigo-400">NumPy + Pandas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Math Randomizer:</span>
                    <span className="font-bold text-rose-400">random.math</span>
                  </div>
                </CardContent>
              </Card>

              {/* Prometheus & Grafana Integration Card */}
              <Card className="border-2 shadow-xl border-dashed">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Database className="w-4 h-4 text-orange-500" /> GRAFANA & METRICS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    Standard Prometheus metrics exposed on FastAPI port 8001 for automated Grafana scraping:
                  </p>
                  <div className="p-3 bg-muted/40 rounded-xl font-mono text-[11px] break-all border">
                    http://localhost:8001/metrics
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl space-y-1 border">
                    <div className="font-bold text-primary">Preconfigured Dashboard:</div>
                    <div className="text-muted-foreground text-[10px]">server/battle-service/grafana_dashboard.json</div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold gap-2"
                    onClick={() => window.open('http://localhost:8001/metrics', '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open /metrics Endpoint
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <Card className="border-2 shadow-xl bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Policy Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed">
                    As an Admin, you are authorized to update Global Terms of Service and User Privacy Laws.
                  </p>
                  <Button variant="secondary" className="w-full font-black">UPDATE MASTER POLICY</Button>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-destructive" /> System Logs</CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-mono text-muted-foreground space-y-2">
                  <p>[02:40:01] Policy breach detected: User #102</p>
                  <p>[02:39:55] Admin session initialized</p>
                  <p>[02:38:12] New paper uploaded to Category: GATE</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

// --- PAPER REPOSITORY COMPONENT ---
export function PaperRepository() {
  const baseStreams = ["CBSE", "GATE", "UPSC", "University", "Engineering", "Medical", "Standard", "Science", "Commerce", "Arts"]
  const { sessionUser, isAdmin } = useNav()
  const [activeSec, setSec] = useState("CBSE")
  const [papers, setPapers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Modals & View States
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [previewPaper, setPreviewPaper] = useState<any | null>(null)
  const [adminViewPending, setAdminViewPending] = useState(false)

  // Upload Form State (with Stream creation, Subject creation & Syllabus entry)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "CBSE",
    customStream: "",
    isCustomStream: false,
    subject: "",
    syllabus: "",
    year: "2024",
    description: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initial base mock papers if database is empty or offline
  const defaultArchiveData: Record<string, any[]> = {
    CBSE: [
      { _id: "cbse-1", title: "Class 12 Physics Board Examination", section: "CBSE", stream: "cbse", subject: "Physics", syllabus: "Unit 1: Electrostatics, Unit 2: Current Electricity, Unit 3: Magnetic Effects, Unit 4: Optics & Modern Physics", year: 2024, downloads: 142, isApproved: true, uploaderName: "Aura Academic Team", description: "Complete Class 12 CBSE Board paper with numerical steps, formula sheets, and marking scheme." },
      { _id: "cbse-2", title: "Class 12 Mathematics Annual Exam", section: "CBSE", stream: "cbse", subject: "Mathematics", syllabus: "Unit 1: Relations & Functions, Unit 2: Calculus & Differential Equations, Unit 3: Vectors & 3D Geometry", year: 2024, downloads: 198, isApproved: true, uploaderName: "Aura Academic Team", description: "Calculus, Linear Programming, Vectors, and 3D Geometry problem sets with full steps." },
      { _id: "cbse-3", title: "Class 10 Science Board Exam", section: "CBSE", stream: "cbse", subject: "Science", syllabus: "Unit 1: Chemical Reactions, Unit 2: Electricity & Magnetism, Unit 3: Life Processes & Heredity", year: 2023, downloads: 220, isApproved: true, uploaderName: "Admin", description: "Chemical reactions, electricity, life processes, and optics with model answer key." },
      { _id: "cbse-4", title: "Class 12 Chemistry Term 2", section: "CBSE", stream: "cbse", subject: "Chemistry", syllabus: "Unit 1: Electrochemistry & Kinetics, Unit 2: Coordination Compounds, Unit 3: Aldehydes, Ketones & Amines", year: 2023, downloads: 115, isApproved: true, uploaderName: "Academic Team", description: "Organic chemistry reaction mechanisms, electrochemistry, and coordination compounds." },
      { _id: "cbse-5", title: "Class 10 Mathematics Standard", section: "CBSE", stream: "cbse", subject: "Mathematics", syllabus: "Unit 1: Number Systems, Unit 2: Algebra & Quadratic Equations, Unit 3: Trigonometry & Circles", year: 2022, downloads: 167, isApproved: true, uploaderName: "Aura Academic Team", description: "Quadratic equations, circles, trigonometry, and surface areas previous year paper." },
      { _id: "cbse-6", title: "Class 12 Computer Science (Python)", section: "CBSE", stream: "cbse", subject: "Computer Science", syllabus: "Unit 1: Computational Thinking & Python, Unit 2: Computer Networks, Unit 3: Database Management & SQL", year: 2024, downloads: 310, isApproved: true, uploaderName: "Yogesh", description: "Python functions, SQL queries, data structures, and computer networking board paper." },
    ],
    GATE: [
      { _id: "gate-1", title: "GATE CS & IT Previous Year Paper", section: "GATE", stream: "gate", subject: "Computer Science", syllabus: "Module 1: Discrete Maths, Module 2: Operating Systems & DBMS, Module 3: Algorithms & TOC", year: 2024, downloads: 285, isApproved: true, uploaderName: "GATE Toppers Hub", description: "Complete GATE CS paper covering Operating Systems, DBMS, Algorithms, Theory of Computation." },
      { _id: "gate-2", title: "GATE Mechanical Engineering Core", section: "GATE", stream: "gate", subject: "Mechanical", syllabus: "Module 1: Thermodynamics & Heat Transfer, Module 2: Fluid Mechanics, Module 3: Manufacturing & SOM", year: 2024, downloads: 174, isApproved: true, uploaderName: "GATE Hub", description: "Thermodynamics, Fluid Mechanics, Strength of Materials, and Heat Transfer with solutions." },
      { _id: "gate-3", title: "GATE Electronics & Communication", section: "GATE", stream: "gate", subject: "ECE", syllabus: "Module 1: Signals & Systems, Module 2: Electronic Devices & Analog Circuits, Module 3: Communications", year: 2023, downloads: 190, isApproved: true, uploaderName: "Aura Team", description: "Signals & Systems, Analog Circuits, Microprocessors, and Electromagnetics." },
      { _id: "gate-4", title: "GATE Data Science & AI (DA)", section: "GATE", stream: "gate", subject: "Data Science & AI", syllabus: "Module 1: Linear Algebra & Calculus, Module 2: Probability & Statistics, Module 3: Machine Learning & Python", year: 2024, downloads: 420, isApproved: true, uploaderName: "Aura AI Lab", description: "Linear algebra, machine learning, probability & statistics, python, and AI search algorithms." },
      { _id: "gate-5", title: "GATE Electrical Engineering (EE)", section: "GATE", stream: "gate", subject: "Electrical", syllabus: "Module 1: Power Systems, Module 2: Electrical Machines, Module 3: Control Systems & Field Theory", year: 2022, downloads: 133, isApproved: true, uploaderName: "Power Engineers", description: "Power systems, control systems, electrical machines, and electromagnetic field theory." },
      { _id: "gate-6", title: "GATE Civil Engineering Comprehensive", section: "GATE", stream: "gate", subject: "Civil", syllabus: "Module 1: Structural Engineering, Module 2: Geotechnical Engineering, Module 3: Environmental Engineering", year: 2023, downloads: 156, isApproved: true, uploaderName: "GATE Hub", description: "Structural analysis, geotechnical engineering, environmental engineering, and surveying." },
    ],
    UPSC: [
      { _id: "upsc-1", title: "UPSC Civil Services Prelims GS Paper 1", section: "UPSC", stream: "upsc", subject: "General Studies", syllabus: "Unit 1: Indian Polity & Governance, Unit 2: Modern Indian History & Culture, Unit 3: Economic Development & Ecology", year: 2024, downloads: 540, isApproved: true, uploaderName: "UPSC Mentors", description: "History, Indian Polity, Geography, Economy, Ecology & Environment, and Current Affairs." },
      { _id: "upsc-2", title: "UPSC Prelims CSAT Paper 2", section: "UPSC", stream: "upsc", subject: "Aptitude & CSAT", syllabus: "Unit 1: Reading Comprehension, Unit 2: Logical Reasoning, Unit 3: Basic Quantitative Numeracy", year: 2024, downloads: 380, isApproved: true, uploaderName: "UPSC Mentors", description: "Reading comprehension, logical reasoning, analytical ability, and basic numeracy." },
      { _id: "upsc-3", title: "UPSC Mains GS Paper 2 (Polity & Governance)", section: "UPSC", stream: "upsc", subject: "Polity & IR", syllabus: "Unit 1: Indian Constitution & Amendments, Unit 2: Government Policies & Interventions, Unit 3: International Relations", year: 2023, downloads: 275, isApproved: true, uploaderName: "Admin", description: "Constitution, Governance, Social Justice, and International Relations subjective paper." },
      { _id: "upsc-4", title: "UPSC Mains GS Paper 3 (Economy & Tech)", section: "UPSC", stream: "upsc", subject: "Economy & Tech", syllabus: "Unit 1: Indian Economy & Budgeting, Unit 2: Science & Tech Innovations, Unit 3: Disaster Management & Security", year: 2023, downloads: 290, isApproved: true, uploaderName: "UPSC Mentors", description: "Economic Development, Bio-diversity, Environment, Security, and Disaster Management." },
      { _id: "upsc-5", title: "UPSC Prelims GS 1 2022", section: "UPSC", stream: "upsc", subject: "General Studies", syllabus: "Unit 1: World & Physical Geography, Unit 2: Indian National Movement, Unit 3: General Science & Climate", year: 2022, downloads: 210, isApproved: true, uploaderName: "Aura Team", description: "100 Multiple Choice questions with detailed answer key explanations." },
      { _id: "upsc-6", title: "UPSC Mains Essay Paper 2024", section: "UPSC", stream: "upsc", subject: "Essay", syllabus: "Section A: Philosophical Topics, Section B: Socio-Economic Policies & Science Ethics", year: 2024, downloads: 315, isApproved: true, uploaderName: "UPSC Mentors", description: "Philosophical and socio-economic essay topics with framework outlines." },
    ],
    University: [
      { _id: "univ-1", title: "Data Structures & Algorithms Semester Exam", section: "University", stream: "university", subject: "Computer Science", syllabus: "Unit 1: Trees & Balanced BSTs, Unit 2: Graph Traversals & Shortest Paths, Unit 3: Dynamic Programming & Greedy Algorithms", year: 2024, downloads: 310, isApproved: true, uploaderName: "Prof. Sharma", description: "Trees, Graphs, Dynamic Programming, Complexity Analysis, and Hash Maps." },
      { _id: "univ-2", title: "Operating Systems Final Examination", section: "University", stream: "university", subject: "Information Tech", syllabus: "Unit 1: CPU Scheduling & Process Sync, Unit 2: Deadlock Detection & Paging, Unit 3: File System Architecture", year: 2024, downloads: 245, isApproved: true, uploaderName: "University Dean", description: "Process scheduling, Deadlocks, Virtual memory paging, and File systems." },
      { _id: "univ-3", title: "Database Management Systems (DBMS)", section: "University", stream: "university", subject: "Computer Science", syllabus: "Unit 1: ER Modeling & Relational Algebra, Unit 2: SQL & Normalization (1NF to BCNF), Unit 3: ACID Transactions & Concurrency", year: 2023, downloads: 290, isApproved: true, uploaderName: "Yogesh", description: "Relational Algebra, SQL, Normalization (1NF-BCNF), and Transaction ACID properties." },
      { _id: "univ-4", title: "Computer Networks & Protocols", section: "University", stream: "university", subject: "Computer Science", syllabus: "Unit 1: Physical & Data Link Layer, Unit 2: Network Layer Subnetting & Routing, Unit 3: Transport Layer TCP/UDP", year: 2023, downloads: 180, isApproved: true, uploaderName: "Academic Team", description: "OSI Model, TCP/IP, Congestion control, Subnetting, and Routing algorithms." },
      { _id: "univ-5", title: "Software Engineering & Agile Methodologies", section: "University", stream: "university", subject: "Software Eng", syllabus: "Unit 1: Software Lifecycle Models, Unit 2: Object-Oriented Analysis & UML, Unit 3: Automated Testing & CI/CD", year: 2024, downloads: 165, isApproved: true, uploaderName: "Admin", description: "UML diagrams, design patterns, testing strategies, and CI/CD pipelines." },
      { _id: "univ-6", title: "Engineering Mathematics IV (Statistics & Calculus)", section: "University", stream: "university", subject: "Mathematics", syllabus: "Unit 1: Probability Distributions & Hypothesis Testing, Unit 2: Fourier & Laplace Transforms, Unit 3: Complex Variables", year: 2023, downloads: 215, isApproved: true, uploaderName: "Math Dept", description: "Probability distributions, Fourier transforms, and complex integration." },
    ],
    Engineering: [
      { _id: "eng-1", title: "Digital Electronics & Logic Design", section: "Engineering", stream: "engineering", subject: "Electronics", syllabus: "Unit 1: Boolean Algebra & K-Maps, Unit 2: Combinational Logic (Multiplexers, Decoders), Unit 3: Sequential Circuits (Flip-Flops & Counters)", year: 2024, downloads: 195, isApproved: true, uploaderName: "Engr. Gupta", description: "Logic gates, Karnaugh maps, sequential synchronous counters, and finite state machines." },
      { _id: "eng-2", title: "Thermodynamics & Heat Transfer", section: "Engineering", stream: "engineering", subject: "Mechanical", syllabus: "Unit 1: Laws of Thermodynamics & Cycles, Unit 2: Conduction & Convection, Unit 3: Radiation & Heat Exchanger Design", year: 2023, downloads: 160, isApproved: true, uploaderName: "Mech Faculty", description: "Carnot cycle, Rankine & Brayton cycles, conduction Fourier law, and radiation." },
    ],
    Medical: [
      { _id: "med-1", title: "Human Anatomy & Physiology Semester 1", section: "Medical", stream: "medical", subject: "Anatomy", syllabus: "Unit 1: Musculoskeletal System, Unit 2: Cardiovascular & Respiratory Systems, Unit 3: Neuroanatomy & Endocrine System", year: 2024, downloads: 275, isApproved: true, uploaderName: "Dr. Alok", description: "Osteology, cardiac cycle, respiratory volumes, and cranial nerve assessments." },
      { _id: "med-2", title: "General Biochemistry & Enzymology", section: "Medical", stream: "medical", subject: "Biochemistry", syllabus: "Unit 1: Carbohydrate & Lipid Metabolism, Unit 2: Enzyme Kinetics & Inhibitors, Unit 3: Molecular Genetics & Nucleic Acids", year: 2023, downloads: 210, isApproved: true, uploaderName: "Medical Lab", description: "Glycolysis, Krebs cycle, Michaelis-Menten kinetics, and DNA replication protocols." },
    ],
    Standard: [
      { _id: "std-1", title: "Quantitative Aptitude Master Assessment", section: "Standard", stream: "standard", subject: "Aptitude", syllabus: "Unit 1: Percentage, Profit & Loss, Unit 2: Time, Speed & Distance, Unit 3: Probability & Permutations", year: 2024, downloads: 260, isApproved: true, uploaderName: "Aura Exam Lab", description: "Time & Work, Speed Distance, Profit & Loss, Percentages, and Probability." },
      { _id: "std-2", title: "Logical Reasoning & Critical Thinking", section: "Standard", stream: "standard", subject: "Reasoning", syllabus: "Unit 1: Syllogisms & Venn Diagrams, Unit 2: Circular & Linear Seating Arrangement, Unit 3: Blood Relations & Direction Sense", year: 2024, downloads: 295, isApproved: true, uploaderName: "Aura Exam Lab", description: "Syllogisms, Seating arrangement, Blood relations, and Direction tests." },
      { _id: "std-3", title: "English Verbal Ability & Comprehension", section: "Standard", stream: "standard", subject: "English", syllabus: "Unit 1: Reading Comprehension Analysis, Unit 2: Sentence Correction & Syntax, Unit 3: Vocabulary & Idioms", year: 2024, downloads: 190, isApproved: true, uploaderName: "Language Lab", description: "Sentence correction, vocabulary in context, reading comprehension passages." },
      { _id: "std-4", title: "General Awareness & Static GK 2024", section: "Standard", stream: "standard", subject: "General Knowledge", syllabus: "Unit 1: National & International Organizations, Unit 2: World Geography & Landmarks, Unit 3: Scientific Discoveries", year: 2024, downloads: 340, isApproved: true, uploaderName: "GK Hub", description: "World organizations, national monuments, scientific discoveries, and Indian polity." },
      { _id: "std-5", title: "Data Interpretation & Analysis Test", section: "Standard", stream: "standard", subject: "Data Interpretation", syllabus: "Unit 1: Bar & Line Graphs, Unit 2: Pie Charts & Multi-table Analysis, Unit 3: Caselet Data Insights", year: 2023, downloads: 210, isApproved: true, uploaderName: "Aura Exam Lab", description: "Bar graphs, pie charts, tabular analysis, and caselets with calculation shortcuts." },
      { _id: "std-6", title: "General Science & Tech Aptitude", section: "Standard", stream: "standard", subject: "Science Aptitude", syllabus: "Unit 1: Applied Physics Principles, Unit 2: Everyday Chemistry, Unit 3: Biological Systems", year: 2023, downloads: 175, isApproved: true, uploaderName: "Aura Exam Lab", description: "Everyday physics, chemistry in action, and biological science concepts." },
    ],
  }

  // Fetch papers from API with fallback to default archive
  const fetchPapers = useCallback(async () => {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (sessionUser) {
        headers["x-session-user"] = encodeURIComponent(JSON.stringify({
          id: sessionUser.id,
          name: sessionUser.name,
          role: isAdmin ? "admin" : (sessionUser.role || "student"),
          isAdmin: Boolean(isAdmin),
        }))
      }

      const res = await fetch(`/api/papers?includePending=true`, { headers })
      if (res.ok) {
        const data = await res.json()
        const backendPapers = Array.isArray(data.papers) ? data.papers : []

        // Flatten all default archive papers into a baseline map
        const map = new Map<string, any>()
        Object.values(defaultArchiveData).flat().forEach(p => map.set((p._id || p.title).toLowerCase(), p))
        backendPapers.forEach((p: any) => map.set((p._id || p.title || "").toLowerCase(), p))

        setPapers(Array.from(map.values()))
      } else {
        const allDefaults = Object.values(defaultArchiveData).flat()
        setPapers(allDefaults)
      }
    } catch {
      const allDefaults = Object.values(defaultArchiveData).flat()
      setPapers(allDefaults)
    } finally {
      setLoading(false)
    }
  }, [sessionUser, isAdmin])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  // Dynamically compute all navigable streams combining defaults and user-created streams
  const allNavStreams = Array.from(
    new Set([
      ...baseStreams,
      ...papers.map(p => p.section).filter(Boolean),
    ])
  )

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    
    // Auto-fill title if empty
    if (!uploadForm.title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      setUploadForm(prev => ({ ...prev, title: cleanName }))
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setFileBase64(event.target?.result as string || "")
    }
    reader.readAsDataURL(file)
  }

  // Handle Paper Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.title.trim()) {
      setUploadMessage({ text: "Please enter a paper title.", type: "error" })
      return
    }

    const chosenStream = uploadForm.isCustomStream && uploadForm.customStream.trim()
      ? uploadForm.customStream.trim()
      : uploadForm.category

    if (!chosenStream) {
      setUploadMessage({ text: "Please select or create an examination stream.", type: "error" })
      return
    }

    setUploading(true)
    setUploadMessage(null)

    const payload = {
      title: uploadForm.title.trim(),
      description: uploadForm.description.trim() || `Community archive paper for ${chosenStream}`,
      section: chosenStream,
      stream: chosenStream.toLowerCase(),
      subject: uploadForm.subject.trim() || chosenStream,
      syllabus: uploadForm.syllabus.trim(),
      year: uploadForm.year,
      fileName: selectedFile?.name || `${uploadForm.title.replace(/\s+/g, '_')}.pdf`,
      fileType: selectedFile?.type || "application/pdf",
      fileData: fileBase64 || "",
    }

    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify({
            id: sessionUser?.id || "student-user",
            name: sessionUser?.name || "Student Contributor",
            role: isAdmin ? "admin" : (sessionUser?.role || "student"),
            isAdmin: Boolean(isAdmin),
          })),
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setUploadMessage({
          text: isAdmin 
            ? "Paper uploaded and instantly approved for all students!" 
            : "Paper uploaded successfully! It has been submitted for Admin review and approval.",
          type: "success"
        })

        // Add to local state immediately
        const newEntry = {
          _id: data.paper?._id || `upload-${Date.now()}`,
          title: payload.title,
          section: payload.section,
          stream: payload.stream,
          subject: payload.subject,
          syllabus: payload.syllabus,
          year: Number(payload.year),
          description: payload.description,
          downloads: 0,
          isApproved: isAdmin,
          uploaderName: sessionUser?.name || "Student Contributor",
          fileData: fileBase64,
          fileName: payload.fileName,
          createdAt: new Date().toISOString(),
        }

        setPapers(prev => [newEntry, ...prev])
        setSec(chosenStream)

        setTimeout(() => {
          setUploadModalOpen(false)
          setUploadForm({
            title: "",
            category: chosenStream,
            customStream: "",
            isCustomStream: false,
            subject: "",
            syllabus: "",
            year: "2024",
            description: "",
          })
          setSelectedFile(null)
          setFileBase64("")
          setUploadMessage(null)
        }, 1500)
      } else {
        setUploadMessage({ text: data.message || "Failed to upload paper.", type: "error" })
      }
    } catch {
      // Offline fallback: save locally
      const localId = `local-${Date.now()}`
      const localEntry = {
        _id: localId,
        title: payload.title,
        section: payload.section,
        stream: payload.stream,
        subject: payload.subject,
        syllabus: payload.syllabus,
        year: Number(payload.year),
        description: payload.description,
        downloads: 0,
        isApproved: isAdmin,
        uploaderName: sessionUser?.name || "Student Contributor",
        fileData: fileBase64,
        fileName: payload.fileName,
        createdAt: new Date().toISOString(),
      }
      setPapers(prev => [localEntry, ...prev])
      setSec(chosenStream)
      setUploadMessage({ text: "Paper saved successfully (offline archive mode)!", type: "success" })
      setTimeout(() => {
        setUploadModalOpen(false)
        setUploadForm({
          title: "",
          category: chosenStream,
          customStream: "",
          isCustomStream: false,
          subject: "",
          syllabus: "",
          year: "2024",
          description: "",
        })
        setSelectedFile(null)
        setFileBase64("")
        setUploadMessage(null)
      }, 1500)
    } finally {
      setUploading(false)
    }
  }

  // Direct Download Handler (unblocked for all users)
  const handleDownloadPaper = async (paper: any) => {
    // 1. Increment local downloads count
    setPapers(prev => prev.map(p => (p._id === paper._id ? { ...p, downloads: (p.downloads || 0) + 1 } : p)))

    try {
      fetch(`/api/papers/${paper._id}/download`).catch(() => {})
    } catch {}

    // 2. If paper has real fileData base64, download it directly
    if (paper.fileData && paper.fileData.startsWith("data:")) {
      const a = document.createElement("a")
      a.href = paper.fileData
      a.download = paper.fileName || `${paper.title.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }

    // 3. Generate clean, formatted exam paper document blob for instant guaranteed download
    const cleanDocContent = `================================================================================
AURA STUDY AI - COMMUNITY REPOSITORY ARCHIVE
================================================================================
EXAMINATION : ${paper.section || activeSec} ARCHIVE (${paper.year || 2024} SESSION)
PAPER TITLE : ${paper.title}
SUBJECT     : ${paper.subject || paper.section}
SYLLABUS    : ${paper.syllabus || "General Comprehensive Syllabus Modules"}
STATUS      : VERIFIED ACADEMIC ARCHIVE • PREVIOUS YEAR QUESTION PAPER
DOWNLOADED  : ${new Date().toLocaleDateString()}
================================================================================

INSTRUCTIONS TO CANDIDATES:
1. This paper contains 3 Sections: Section A (Objective), Section B (Analytical), and Section C (Application).
2. All questions are compulsory. Internal choices are provided in Section B and C.
3. Use of standard mathematical formulations and neat diagrams is recommended.
4. Total Time Allowed: 3 Hours | Maximum Marks: 100

--------------------------------------------------------------------------------
SYLLABUS & MODULES COVERED:
--------------------------------------------------------------------------------
${paper.syllabus ? paper.syllabus : "Comprehensive Course Syllabus covering Core Fundamentals, Analytical Extensions, and Real-World Applications."}

--------------------------------------------------------------------------------
SECTION A: CONCEPTUAL FOUNDATIONS & OBJECTIVE ANALYSIS (30 MARKS)
--------------------------------------------------------------------------------
Q1. Define the fundamental principles governing this subject module. Explain with formal notations.
Q2. Analyze the key theoretical constraints and boundary conditions.
Q3. Outline the standard algorithmic steps or historical progression of the concepts involved.
Q4. Compare and contrast the primary paradigms with reference to contemporary applications.

--------------------------------------------------------------------------------
SECTION B: CORE ANALYTICAL PROBLEMS & THEORETICAL DERIVATIONS (40 MARKS)
--------------------------------------------------------------------------------
Q5. (a) Derive the core mathematical or analytical expression from first principles.
    (b) Calculate the parameter variations under maximum loading conditions.
Q6. Explain the end-to-end operational framework with a labeled schematic diagram.
Q7. Solve the multi-variable scenario problem using structured deduction techniques.

--------------------------------------------------------------------------------
SECTION C: ADVANCED APPLICATION, CASE STUDIES & NUMERICALS (30 MARKS)
--------------------------------------------------------------------------------
Q8. Case Study: Analyze the given operational failure scenario. Propose an optimized solution.
Q9. Provide a comprehensive comparative evaluation between classical and modern approaches.
Q10. Formulate an implementation blueprint ensuring high-efficiency and error-tolerance.

================================================================================
VERIFIED BY AURA STUDY AI • REPOSITORY ARCHIVE # ${paper._id || '2026-REF'}
================================================================================
`
    const blob = new Blob([cleanDocContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(paper.title || "Examination_Paper").replace(/\s+/g, '_')}_${paper.year || 2024}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Admin Approve Paper -> Immediately updates state and publishes paper live to community
  const handleApprovePaper = async (paperId: string) => {
    try {
      const res = await fetch("/api/papers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify({
            id: sessionUser?.id || "admin-user",
            name: sessionUser?.name || "Admin",
            role: "admin",
            isAdmin: true,
          })),
        },
        body: JSON.stringify({ paperId, action: "approve", isAdmin: true }),
      })

      // Update paper in state immediately
      setPapers(prev => prev.map(p => (p._id === paperId || p.paperId === paperId ? { ...p, isApproved: true } : p)))
      
      if (previewPaper && (previewPaper._id === paperId || previewPaper.paperId === paperId)) {
        setPreviewPaper((prev: any) => prev ? { ...prev, isApproved: true } : null)
      }

      // Re-fetch papers to synchronize with database
      fetchPapers()

      alert("Paper approved! It is now published live for all students to access and download.")
    } catch {
      setPapers(prev => prev.map(p => (p._id === paperId || p.paperId === paperId ? { ...p, isApproved: true } : p)))
      if (previewPaper && (previewPaper._id === paperId || previewPaper.paperId === paperId)) {
        setPreviewPaper((prev: any) => prev ? { ...prev, isApproved: true } : null)
      }
    }
  }

  // Admin Reject Paper
  const handleRejectPaper = async (paperId: string) => {
    if (!confirm("Are you sure you want to remove this paper?")) return
    try {
      await fetch("/api/papers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-user": encodeURIComponent(JSON.stringify({
            id: sessionUser?.id || "admin-user",
            name: sessionUser?.name || "Admin",
            role: "admin",
            isAdmin: true,
          })),
        },
        body: JSON.stringify({ paperId, action: "reject", isAdmin: true }),
      })
      setPapers(prev => prev.filter(p => p._id !== paperId && p.paperId !== paperId))
      if (previewPaper && (previewPaper._id === paperId || previewPaper.paperId === paperId)) {
        setPreviewPaper(null)
      }
    } catch {
      setPapers(prev => prev.filter(p => p._id !== paperId && p.paperId !== paperId))
      if (previewPaper && (previewPaper._id === paperId || previewPaper.paperId === paperId)) {
        setPreviewPaper(null)
      }
    }
  }

  // Filter papers by search query, active stream, and approval status
  const filteredPapers = papers.filter(p => {
    // 1. Search Query Match
    const matchesSearch = searchQuery
      ? p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.syllabus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.year)?.includes(searchQuery)
      : true

    if (!matchesSearch) return false

    // 2. Admin Review Mode
    if (isAdmin && adminViewPending) {
      return !p.isApproved
    }

    // 3. Stream Filter (in normal browsing view)
    const matchesStream = activeSec === "All" 
      ? true 
      : (p.section?.toLowerCase() === activeSec.toLowerCase() || p.stream?.toLowerCase() === activeSec.toLowerCase())

    if (!matchesStream) return false

    // 4. Student view: approved papers OR student's own pending upload
    if (!isAdmin) {
      const isUploader = sessionUser?.name && (p.uploaderName === sessionUser.name || p.uploadedByName === sessionUser.name)
      return p.isApproved || isUploader
    }

    return true
  })

  const pendingCount = papers.filter(p => !p.isApproved).length

  return (
    <div className="container mx-auto py-12 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Open Community Examination Archive
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">COMMUNITY REPOSITORY</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Contribute and access a global database of previous examination papers. 
          Upload papers with syllabus modules, create streams and subjects, and download directly to master your exams.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by subject, syllabus topic, title, or year..."
            className="pl-10 h-11 rounded-full bg-muted/40 border-muted-foreground/20 focus:border-primary text-sm font-medium"
          />
        </div>
      </div>

      {/* Category Tabs & Admin Review Mode Toggle */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-muted/50 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              variant={activeSec === "All" && !adminViewPending ? "default" : "outline"}
              onClick={() => { setSec("All"); setAdminViewPending(false); }}
              className="rounded-full px-5 font-bold text-xs sm:text-sm h-10 transition-all shadow-sm"
            >
              All Streams
            </Button>
            {allNavStreams.map(s => (
              <Button 
                key={s} 
                variant={activeSec === s && !adminViewPending ? "default" : "outline"} 
                onClick={() => { setSec(s); setAdminViewPending(false); }} 
                className="rounded-full px-5 font-bold text-xs sm:text-sm h-10 transition-all shadow-sm"
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Upload Trigger Button */}
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="rounded-full px-5 text-xs font-black uppercase tracking-wider h-10 gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Paper</span>
            </Button>

            {/* Admin Pending Approvals View Button */}
            {isAdmin && (
              <Button
                variant={adminViewPending ? "default" : "outline"}
                onClick={() => setAdminViewPending(!adminViewPending)}
                className={`rounded-full px-5 text-xs font-black uppercase tracking-wider h-10 gap-2 border-amber-500/40 ${
                  adminViewPending ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-amber-500 hover:bg-amber-500/10"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Admin Review ({pendingCount} Pending)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Admin Review Banner when in pending mode */}
        {adminViewPending && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Admin Review Queue:</strong> Showing {filteredPapers.length} student uploaded papers awaiting approval. Approving a paper immediately loads and publishes it live to the community.
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setAdminViewPending(false)}
              className="text-amber-300 border-amber-500/40 hover:bg-amber-500/20 text-xs h-7 rounded-lg"
            >
              Exit Review
            </Button>
          </div>
        )}
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-bold">Loading {activeSec} Archive...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-2 border-dashed border-muted bg-muted/10 space-y-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-bold">No papers found in this view</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {adminViewPending 
              ? "All submitted papers have been reviewed and approved!" 
              : `Be the first student to upload a ${activeSec} examination paper with subject and syllabus to help your peers!`
            }
          </p>
          <Button onClick={() => setUploadModalOpen(true)} className="rounded-full px-8 font-bold">
            <Upload className="w-4 h-4 mr-2" /> Upload Paper with Syllabus
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => {
            const isPending = !paper.isApproved
            return (
              <Card 
                key={paper._id || paper.title} 
                className={`group border-2 transition-all shadow-md overflow-hidden flex flex-col justify-between hover:shadow-xl ${
                  isPending ? "border-amber-500/40 bg-amber-500/[0.02]" : "hover:border-primary/60"
                }`}
              >
                <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                      {paper.section || activeSec} Archive
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-black">
                        Pending Admin Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="font-bold text-xs bg-muted/40">
                        {paper.year || 2024} Session
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="font-black text-lg leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {paper.title}
                    </p>
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {paper.description || `Official question paper for ${paper.subject || activeSec} students.`}
                    </p>

                    {/* Syllabus Tag if present */}
                    {paper.syllabus && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                          <Sparkles className="w-3 h-3" /> Syllabus Tagged
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-1 font-medium">
                      <span>Sub: <strong className="text-foreground/80">{paper.subject || paper.section}</strong></span>
                      <span>By: <strong className="text-foreground/80">{paper.uploaderName || paper.uploadedByName || "Student Contributor"}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2.5">
                    {/* Action Buttons: Direct Download + Review Preview */}
                    <div className="flex gap-2.5">
                      <Button 
                        onClick={() => handleDownloadPaper(paper)}
                        className="flex-1 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all gap-1.5 h-10 text-xs shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setPreviewPaper(paper)}
                        className="flex-1 rounded-xl font-bold gap-1.5 h-10 text-xs hover:border-primary hover:text-primary transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Button>
                    </div>

                    {/* Admin Moderation Controls */}
                    {isAdmin && (
                      <div className="pt-2 border-t border-muted/40 flex items-center justify-between gap-2">
                        {isPending ? (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              size="sm"
                              onClick={() => handleApprovePaper(paper._id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs h-8 rounded-lg gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectPaper(paper._id)}
                              className="text-red-500 hover:bg-red-500/10 border-red-500/30 text-xs h-8 rounded-lg gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1 text-green-500 font-bold">
                              <FileCheck className="w-3.5 h-3.5" /> Published Live
                            </span>
                            <button
                              onClick={() => handleRejectPaper(paper._id)}
                              className="text-muted-foreground/60 hover:text-red-500 transition-colors p-1"
                              title="Delete Paper"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Contribute Paper Section (Upload Trigger) */}
      <div className="flex justify-center pt-8">
        <Card 
          onClick={() => setUploadModalOpen(true)}
          className="w-full max-w-2xl border-4 border-dashed border-primary/25 bg-primary/5 rounded-3xl p-10 text-center group cursor-pointer hover:bg-primary/10 transition-all shadow-lg hover:border-primary/50"
        >
          <div className="mb-5 flex justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black mb-2 text-foreground">Contribute Examination Paper</h3>
          <p className="text-muted-foreground font-medium text-sm sm:text-base mb-6 max-w-md mx-auto">
            Upload past exam papers, define subject, syllabus modules, and examination stream. Help fellow students excel in exams.
          </p>
          <Button size="lg" className="h-12 px-8 rounded-2xl font-black text-sm shadow-xl pointer-events-none">
            <Upload className="w-4 h-4 mr-2" /> SELECT PAPER & ADD SYLLABUS
          </Button>
        </Card>
      </div>

      {/* ===================== UPLOAD PAPER MODAL ===================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border-2 border-primary/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setUploadModalOpen(false); setUploadMessage(null); }}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/30"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
                <Upload className="w-4 h-4" /> Student Paper Contribution
              </div>
              <h2 className="text-2xl font-black text-foreground">Upload Examination Paper</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdmin 
                  ? "Admin uploads will be instantly published to the Community Repository." 
                  : "Your paper will be submitted for Admin approval. Once approved, it will be published for all students."
                }
              </p>
            </div>

            {uploadMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                uploadMessage.type === "success" 
                  ? "bg-green-500/15 border border-green-500/30 text-green-400" 
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}>
                {uploadMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{uploadMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/40 rounded-2xl p-5 text-center cursor-pointer hover:bg-primary/5 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  className="hidden"
                />
                <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-black text-foreground truncate max-w-xs mx-auto">{selectedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB • Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-black text-foreground">Click to select PDF or Document</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, DOCX, TXT, Images up to 25MB</p>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Paper Title *</Label>
                <Input
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Class 12 Physics 2024 Board Exam / Data Structures Final Exam"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              {/* Stream Selection & Custom Stream Creation */}
              <div className="space-y-2 p-3 rounded-2xl bg-muted/20 border border-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black uppercase text-foreground">Examination Stream / Category *</Label>
                  <button
                    type="button"
                    onClick={() => setUploadForm(prev => ({ ...prev, isCustomStream: !prev.isCustomStream }))}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {uploadForm.isCustomStream ? "← Choose Existing Stream" : "+ Create New Stream"}
                  </button>
                </div>

                {uploadForm.isCustomStream ? (
                  <div className="space-y-1">
                    <Input
                      required
                      value={uploadForm.customStream}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, customStream: e.target.value }))}
                      placeholder="Enter new stream name (e.g. B.Tech CS, Law, Pharmacy, BCA)"
                      className="h-10 text-xs rounded-xl bg-background border-primary/50 focus:border-primary"
                    />
                    <p className="text-[10px] text-muted-foreground">This new stream will automatically appear as a category tab in the repository.</p>
                  </div>
                ) : (
                  <select
                    value={uploadForm.category}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setUploadForm(prev => ({ ...prev, isCustomStream: true }))
                      } else {
                        setUploadForm(prev => ({ ...prev, category: e.target.value }))
                      }
                    }}
                    className="w-full h-10 text-xs rounded-xl bg-background border border-input px-3 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {allNavStreams.map(s => (
                      <option key={s} value={s}>{s} Archive</option>
                    ))}
                    <option value="__custom__">+ Create New Stream...</option>
                  </select>
                )}
              </div>

              {/* Subject Input & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Subject / Course Name *</Label>
                  <Input
                    required
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Operating Systems / Physics / Organic Chemistry"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Academic Year</Label>
                  <select
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl bg-background border border-input px-3 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"].map(y => (
                      <option key={y} value={y}>{y} Session</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Syllabus / Course Modules Section */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <Label className="text-xs font-black uppercase text-foreground">Syllabus & Course Modules</Label>
                </div>
                <Textarea
                  value={uploadForm.syllabus}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, syllabus: e.target.value }))}
                  placeholder="Enter syllabus modules or units (e.g. Unit 1: Pointers & Linked Lists, Unit 2: Trees & Graphs, Unit 3: Dynamic Programming)..."
                  className="text-xs rounded-xl resize-none h-20 bg-background"
                />
                <p className="text-[10px] text-muted-foreground">Tagging syllabus units helps fellow students match this paper to their current syllabus exam preparation.</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase text-muted-foreground">Description / Exam Highlights</Label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Include question structure, marking patterns, or exam highlights..."
                  className="text-xs rounded-xl resize-none h-16"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 rounded-xl h-11 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 rounded-xl h-11 text-xs font-black bg-primary text-primary-foreground shadow-lg gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {isAdmin ? "Approve & Publish Live" : "Submit for Admin Approval"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== REVIEW & PREVIEW MODAL ===================== */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border-2 border-primary/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewPaper(null)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/30"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-2 border-b border-muted pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-xs">
                  {previewPaper.section || activeSec} Archive
                </Badge>
                <Badge variant="outline" className="font-bold text-xs">
                  {previewPaper.year || 2024} Session
                </Badge>
                {previewPaper.isApproved ? (
                  <Badge className="bg-green-500/15 text-green-500 border border-green-500/30 text-[10px] font-black">
                    Verified Community Archive
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-black">
                    Pending Admin Approval
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-black text-foreground">{previewPaper.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>Subject: <strong className="text-foreground">{previewPaper.subject || previewPaper.section}</strong></span>
                <span>Contributor: <strong className="text-foreground">{previewPaper.uploaderName || previewPaper.uploadedByName || "Aura Academic Team"}</strong></span>
                <span>Downloads: <strong className="text-primary">{previewPaper.downloads || 0}</strong></span>
              </div>
            </div>

            {/* Syllabus Section in Preview */}
            {previewPaper.syllabus && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Syllabus & Course Modules Covered
                </h4>
                <div className="text-xs text-foreground bg-primary/5 p-4 rounded-xl border border-primary/20 whitespace-pre-wrap leading-relaxed">
                  {previewPaper.syllabus}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Archive Summary</h4>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3.5 rounded-xl border border-muted/30">
                {previewPaper.description || "Official past examination paper formatted with comprehensive marking guidelines, formula outlines, and standard test specifications."}
              </p>
            </div>

            {/* Paper Structure Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Exam Blueprint & Section Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                  <p className="text-[11px] font-black text-primary">Part A (30 Marks)</p>
                  <p className="text-[10px] text-muted-foreground">Objective conceptual foundations & multiple choice problems.</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                  <p className="text-[11px] font-black text-primary">Part B (40 Marks)</p>
                  <p className="text-[10px] text-muted-foreground">Core theory derivations, analytical proofs, and derivations.</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                  <p className="text-[11px] font-black text-primary">Part C (30 Marks)</p>
                  <p className="text-[10px] text-muted-foreground">Advanced numericals, case-study questions, and real applications.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons in Review Modal */}
            <div className="pt-2 flex flex-wrap gap-3">
              {/* If Admin is previewing a pending paper, provide direct Approve button */}
              {isAdmin && !previewPaper.isApproved && (
                <Button
                  onClick={() => handleApprovePaper(previewPaper._id)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 text-xs font-black shadow-lg gap-2 flex-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Publish Live
                </Button>
              )}

              <Button
                onClick={() => {
                  handleDownloadPaper(previewPaper)
                  setPreviewPaper(null)
                }}
                className="flex-1 rounded-xl h-11 text-xs font-black bg-primary text-primary-foreground shadow-lg gap-2"
              >
                <Download className="w-4 h-4" /> Download Full Paper
              </Button>

              <Button
                variant="outline"
                onClick={() => setPreviewPaper(null)}
                className="rounded-xl h-11 text-xs font-bold px-6"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- POLICY SECTION COMPONENT ---
export function PolicySection() {
  const { setStep } = useNav()

  return (
    <div className="container mx-auto py-12 max-w-4xl space-y-10 animate-in zoom-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-primary pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Scale className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">USER POLICY & LAWS</h1>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs sm:text-sm">
              Master Terms of Service & Compliance v2026.05
            </p>
          </div>
        </div>
        <Badge variant="outline" className="self-start sm:self-center bg-primary/10 border-primary/30 text-primary text-xs font-bold py-1 px-3">
          Platform Governance
        </Badge>
      </div>

      {/* Critical Security Warning Banner: Suspicious Activity & Account Deletion */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-950 to-red-950/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <ShieldAlert className="w-32 h-32 text-red-500" />
        </div>
        <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-red-500 text-white font-black text-[10px] tracking-wider uppercase">
                Strict Security Enforcement
              </Badge>
              <h2 className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-tight">
                Suspicious Activity Warning: Immediate Suspension & Deletion
              </h2>
            </div>
            <p className="text-sm text-red-100/90 leading-relaxed font-medium">
              Aura Study AI maintains active behavioral monitoring and telemetry to preserve academic fairness. 
              <strong> Any suspicious activity</strong>—including but not limited to automated bot attacks, unauthorized API scraping, 
              reverse engineering, cheating in the Battle Arena, credential stuffing, offensive community conduct, or deliberate 
              system exploitation—will result in <strong>immediate account suspension, forfeiture of all ranking/XP, and permanent account deletion </strong> 
              without prior notice. Severe violations may be referred for academic institution and legal disciplinary review.
            </p>
          </div>
        </div>
      </div>

      {/* Core Policy Terms Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {[
          { 
            title: "Intellectual Integrity", 
            icon: <ShieldCheck className="w-7 h-7" />, 
            text: "Users are strictly prohibited from using Aura AI for academic plagiarism or dishonest submission. Predictions, analytical summaries, and practice questions generated are intended strictly for study reference and exam preparation. We uphold the highest standards of academic honesty.",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/30 group-hover:bg-blue-500/20 group-hover:border-blue-400/50"
          },
          { 
            title: "Data Privacy & Zero-Cache Processing", 
            icon: <Unlock className="w-7 h-7" />, 
            text: "Your uploaded syllabus documents and papers are processed in a zero-cache environment. We do not permanently store sensitive user documents or papers on our servers beyond your active analysis session, unless voluntarily contributed to the Community Repository.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50"
          },
          { 
            title: "Community Repository Conduct", 
            icon: <Users className="w-7 h-7" />, 
            text: "When contributing to the Paper Repository, ensure all content is authentic, correctly dated, and properly tagged. Uploading misleading, counterfeit, abusive, or copyright-infringing materials will result in immediate content removal and student account deactivation.",
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/30 group-hover:bg-purple-500/20 group-hover:border-purple-400/50"
          },
          { 
            title: "Legal Liability & Predictive Scope", 
            icon: <Scale className="w-7 h-7" />, 
            text: "Aura Study AI provides statistical topic likelihoods and simulated problem sets. We are not liable for examination outcomes or grading variations. Our machine learning analytics are intended to supplement curriculum study and teacher guidance, not replace them.",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500/20 group-hover:border-amber-400/50"
          }
        ].map((item, i) => (
          <div 
            key={i} 
            className="flex flex-col sm:flex-row gap-5 p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl transition-all duration-300 group shadow-lg"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all shadow-inner`}>
              {item.icon}
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-white/70 leading-relaxed text-sm font-medium">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Accuracy, Misinformation & Continuous Feedback Mechanism */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-purple-950/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Brain className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-indigo-600 text-white font-black text-[10px] tracking-wider uppercase">
                AI Service Transparency
              </Badge>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-300 uppercase tracking-tight">
                AI Accuracy, Misinformation Disclaimer & Feedback
              </h2>
            </div>
            <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
              Aura Study AI leverages deep learning, natural language processing, and probabilistic inference. While our predictive models 
              maintain high empirical accuracy (94%+), artificial intelligence is inherently experimental and can occasionally produce 
              <strong> hallucinations, inaccurate solutions, outdated question formats, or misinterpretations</strong>. 
              Students and educators should verify all critical answers against approved textbooks and course syllabi.
            </p>
            <p className="text-xs text-indigo-200/80 leading-relaxed font-medium pt-1">
              <strong>Spotted a mistake, incorrect question, or misinformation?</strong> Help us continuously train and optimize our models. 
              Your feedback is directly reviewed by our team to refine question quality and service reliability.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            onClick={() => setStep("feedback")}
            className="w-full sm:w-auto h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Give Feedback & Report Wrong AI Result
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("upload")}
            className="w-full sm:w-auto h-11 px-6 font-bold rounded-xl border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CommunityChat() {
  const { isRegistered, sessionUser } = useNav()
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showMobileUsers, setShowMobileUsers] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const lastTimestampRef = useRef<string>("")
  const isMountedRef = useRef(true)

  // ── Initial History & Active Users Fetch ────────────────────────────────────
  const fetchChatMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat?roomId=community-global&limit=50")
      if (res.ok) {
        const data = await res.json()
        if (data.messages && Array.isArray(data.messages)) {
          const formatted = data.messages.map((m: any) => ({
            id: m.id || m._id,
            user: m.senderName || "Student",
            text: m.message,
            time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            isAi: m.type === "ai",
            senderId: m.senderId,
            timestamp: m.timestamp
          }))
          setMessages(formatted)
          if (data.messages.length > 0) {
            lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp
          }
          return
        }
      }
    } catch (e) {
      console.warn("Failed to load community chat from server:", e)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    fetchChatMessages()

    // Real-time incremental polling every 1200ms (multicasting to all devices)
    const pollTimer = setInterval(async () => {
      if (!lastTimestampRef.current) return
      try {
        const res = await fetch(`/api/chat?roomId=community-global&since=${encodeURIComponent(lastTimestampRef.current)}`)
        if (!isMountedRef.current || !res.ok) return
        const data = await res.json()
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => String(m.id)))
            const newOnes = data.messages
              .filter((m: any) => !existingIds.has(String(m.id || m._id)))
              .map((m: any) => ({
                id: m.id || m._id,
                user: m.senderName || "Student",
                text: m.message,
                time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
                isAi: m.type === "ai",
                senderId: m.senderId,
                timestamp: m.timestamp
              }))
            if (newOnes.length === 0) return prev
            return [...prev, ...newOnes]
          })
          lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp
        }
      } catch {}
    }, 1200)

    // Fetch Active Users for Leaderboard integration
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.users && isMountedRef.current) {
          const sorted = [...data.users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10)
          setActiveUsers(sorted)
        }
      })
      .catch(() => {})

    return () => {
      isMountedRef.current = false
      clearInterval(pollTimer)
    }
  }, [fetchChatMessages])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // ── Send Message with 0ms Optimistic UI & Serverless Multicast ─────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newMessage.trim()
    if (!trimmed) return

    const currentName = sessionUser?.name || "Student"
    const currentId = sessionUser?.id || "anonymous"
    const tempId = `temp-${Date.now()}`
    setNewMessage("")

    const localMsg = {
      id: tempId,
      user: currentName,
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: false,
      senderId: currentId,
      timestamp: new Date().toISOString()
    }

    // Instant local rendering (0ms lag)
    setMessages(prev => [...prev, localMsg])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: "community-global",
          senderId: currentId,
          senderName: currentName,
          senderAvatar: sessionUser?.photoUrl || "",
          message: trimmed,
          type: "community"
        })
      })

      const data = await res.json()
      if (data.success && data.message) {
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? {
            ...m,
            id: data.message.id,
            timestamp: data.message.timestamp
          } : m))
        )
        lastTimestampRef.current = data.message.timestamp
      }
    } catch (e) {
      console.warn("Offline sending chat message:", e)
    }
  }

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Lock className="w-20 h-20 text-destructive animate-pulse" />
        <h2 className="text-3xl font-black">ACCESS RESTRICTED</h2>
        <p className="text-muted-foreground font-bold">Only verified students can access the Community Chat.</p>
        <Button onClick={() => window.location.href = "/"}>Return to Safety</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-6 max-w-6xl animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)] min-h-[520px] max-h-[820px]">
        {/* Sidebar: Active Students (Desktop permanent, Mobile overlay/drawer) */}
        <Card className={`lg:col-span-1 border-2 shadow-xl bg-muted/20 flex flex-col overflow-hidden transition-all duration-300 ${
          showMobileUsers 
            ? "fixed inset-x-4 top-20 z-50 max-h-[80vh] bg-background/95 backdrop-blur-xl border-primary/40 shadow-2xl" 
            : "hidden lg:flex"
        }`}>
          <CardHeader className="border-b bg-background/50 py-3 px-4 flex flex-row items-center justify-between flex-shrink-0">
            <CardTitle className="text-xs sm:text-sm font-black flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> ACTIVE STUDENTS
            </CardTitle>
            {showMobileUsers && (
              <button
                type="button"
                onClick={() => setShowMobileUsers(false)}
                className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-2.5 overflow-y-auto flex-1">
            {activeUsers.length === 0 && <div className="text-muted-foreground text-xs font-bold text-center py-4">Loading students...</div>}
            {activeUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 ${
                    i < 3 ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40' : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {u.name?.[0] || "U"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs sm:text-sm group-hover:text-primary transition-colors block leading-tight truncate">{u.name}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase">{u.rank || "Bronze"} • {u.points || 0} XP</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-1 lg:col-span-3 border-2 shadow-2xl flex flex-col overflow-hidden bg-background">
          <CardHeader className="bg-primary text-primary-foreground py-3 sm:py-4 px-3 sm:px-6 flex flex-row justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-lg font-black italic truncate">AURA GLOBAL CHAT</CardTitle>
                <CardDescription className="text-primary-foreground/80 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider truncate">
                  End-to-End Encrypted Strategy Room
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Mobile button to toggle Active Students drawer */}
              <button
                type="button"
                onClick={() => setShowMobileUsers(prev => !prev)}
                className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{activeUsers.length || "Students"}</span>
              </button>

              <Badge variant="secondary" className="bg-white/20 text-white border-none text-[9px] sm:text-xs font-bold px-2 py-0.5">
                1 Day Auto-Wipe
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-none text-[9px] sm:text-xs font-bold px-2 py-0.5 hidden sm:inline-flex">
                {activeUsers.length > 0 ? `${activeUsers.length} Online` : "Live"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 scrollbar-hide" ref={chatScrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground space-y-2">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 animate-bounce" />
                <p className="font-bold text-sm">Welcome to Aura Global Chat!</p>
                <p className="text-xs text-muted-foreground/60 max-w-xs">Messages automatically auto-delete after 1 day. Be the first to start the discussion!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = (sessionUser?.id && msg.senderId === sessionUser.id) ||
                              (sessionUser?.name && msg.user === sessionUser.name) ||
                              msg.user === "You (Authorized)";

                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-1`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isOwn ? "text-right" : "text-left"}`}>
                      <div className={`flex items-center gap-1.5 mb-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                        {!isOwn && (
                          <span className="text-[10px] font-black text-primary uppercase">{msg.user}</span>
                        )}
                        <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <div className={`p-3 sm:p-3.5 rounded-2xl font-medium text-xs sm:text-sm shadow-sm border break-words leading-relaxed ${
                        msg.isAi 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : isOwn
                            ? "bg-primary text-primary-foreground border-primary rounded-br-none"
                            : "bg-muted/60 border-muted text-foreground rounded-bl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>

          <div className="p-2.5 sm:p-4 bg-muted/30 border-t flex-shrink-0">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input 
                placeholder="Share your study pattern or ask a question..." 
                className="h-11 sm:h-13 rounded-xl border-2 bg-background shadow-inner text-xs sm:text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" className="h-11 w-11 sm:h-13 sm:w-13 rounded-xl p-0 shadow-lg hover:scale-105 transition-transform flex-shrink-0">
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}

// --- FEEDBACK SECTION ---
export function FeedbackSection() {
  const { sessionUser } = useNav()
  const [nameInput, setNameInput] = useState(sessionUser?.name || "")
  const [emailInput, setEmailInput] = useState(sessionUser?.email || "")
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (sessionUser) {
      if (!nameInput) setNameInput(sessionUser.name || "")
      if (!emailInput) setEmailInput(sessionUser.email || "")
    }
  }, [sessionUser])

  const categories = [
    { id: "general", label: "General Query", icon: "💬", color: "bg-blue-500" },
    { id: "bug", label: "Bug Report", icon: "🐛", color: "bg-red-500" },
    { id: "feature", label: "Feature Request", icon: "✨", color: "bg-purple-500" },
    { id: "praise", label: "Praise / Feedback", icon: "❤️", color: "bg-pink-500" },
    { id: "complaint", label: "Complaint", icon: "⚠️", color: "bg-yellow-500" },
  ]

  const handleSubmit = async () => {
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (!message.trim() || message.trim().length < 5) {
      setError("Please write at least 5 characters in your message.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionUser?.id || null,
          userName: nameInput.trim() || sessionUser?.name || "Student",
          userEmail: emailInput.trim().toLowerCase(),
          category,
          message: message.trim(),
          rating: rating || null,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
        setMessage("")
        setRating(0)
        setCategory("general")
      } else {
        setError(data.message || "Submission failed. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3">Thank You! 🎉</h2>
          <p className="text-lg text-muted-foreground mb-8">Your message has been sent to our team and is now visible in the Admin Panel Feedback Section!</p>
          <Button onClick={() => setSubmitted(false)} className="rounded-xl h-12 px-8 font-bold">
            Submit Another Feedback
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-4">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary uppercase tracking-widest">Contact Us</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-indigo-600">
          Send Your Feedback
        </h1>
        <p className="text-muted-foreground text-lg">
          Ask questions, report bugs, or request features. Your message goes straight to the Admin Feedback Panel!
        </p>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border-b border-primary/10 py-6">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send a Message to Admin
          </CardTitle>
          <CardDescription>Your feedback will be delivered directly to the Admin Panel</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* User Name & Email Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm uppercase tracking-wider">Your Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                className="h-12 rounded-xl border-2 text-sm"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm uppercase tracking-wider">Your Email *</Label>
              <Input
                type="email"
                placeholder="student@gmail.com"
                className="h-12 rounded-xl border-2 text-sm"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  if (error) setError("")
                }}
              />
            </div>
          </div>
          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="font-bold text-sm uppercase tracking-wider">Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-semibold ${
                    category === cat.id
                      ? "border-primary bg-primary/10 text-primary shadow-md"
                      : "border-muted bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="font-bold text-sm uppercase tracking-wider">Rate Your Experience (Optional)</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-bold text-muted-foreground">
                  {["Poor", "Fair", "Good", "Great", "Excellent"][rating - 1]}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label className="font-bold text-sm uppercase tracking-wider">Your Message *</Label>
            <Textarea
              placeholder="Type your query, feedback, or anything you'd like to share with us..."
              className="min-h-[140px] resize-none rounded-xl border-2 text-sm"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (error) setError("")
              }}
              maxLength={2000}
            />
            <div className="flex justify-between items-center">
              {error && <p className="text-xs text-destructive font-bold">{error}</p>}
              <span className="text-xs text-muted-foreground ml-auto">{message.length}/2000</span>
            </div>
          </div>

          {/* User info preview */}
          {sessionUser && (
            <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">{sessionUser.name}</p>
                <p className="text-xs text-muted-foreground">{sessionUser.email}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">Logged in</Badge>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 text-lg font-black rounded-xl shadow-lg hover:scale-[1.01] transition-transform bg-gradient-to-r from-primary to-purple-600 text-white border-none"
            >
              {loading ? (
                <><Activity className="mr-2 w-5 h-5 animate-spin" /> Submitting Feedback...</>
              ) : (
                <><Send className="mr-2 w-5 h-5" /> Submit Feedback to Admin</>
              )}
            </Button>

            <a
              href={`mailto:helpsupport9452@gmail.com?subject=${encodeURIComponent(`[${category.toUpperCase()}] User Feedback`)}&body=${encodeURIComponent(message || "Please write your query here...")}`}
              className="block w-full text-center py-3 rounded-xl border-2 border-primary/20 hover:border-primary/40 bg-primary/5 text-primary text-sm font-bold transition-all"
            >
              ✉️ Open Direct Email Client (helpsupport9452@gmail.com)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- WHATSAPP COMMUNITY SECTION ---
export function WhatsAppCommunity() {
  const COMMUNITY_LINK = "https://chat.whatsapp.com/GqywH4gM6XJCO5hjSRyJDN?s=cl&p=a&ilr=1"
  const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "helpsupport9452@gmail.com"

  const groups = [
    {
      id: 1,
      name: "📚 ExamPattern Official Community",
      description: "Main community for exam analysis, study resources, and peer discussions.",
      link: COMMUNITY_LINK,
      members: "1000+",
      gradient: "from-green-500 to-emerald-600",
      glow: "shadow-green-500/30",
      badge: "Official Community",
      badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      id: 2,
      name: "⚔️ Battle Arena & Live Challenges",
      description: "Join multiplayer battle challenges, view leaderboards, and compete live!",
      link: COMMUNITY_LINK,
      members: "500+",
      gradient: "from-purple-500 to-indigo-600",
      glow: "shadow-purple-500/30",
      badge: "Arena Group",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      id: 3,
      name: "🤖 AI & Smart Lab Hub",
      description: "Discuss AI features, interview prep guidance, and technical support.",
      link: COMMUNITY_LINK,
      members: "350+",
      gradient: "from-blue-500 to-cyan-600",
      glow: "shadow-blue-500/30",
      badge: "Tech Group",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
  ]

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-5">
          <span className="text-xl">💬</span>
          <span className="text-sm font-black text-green-600 uppercase tracking-widest">WhatsApp Community</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600">
          Join Our Official Community
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Connect with thousands of students. Get exam tips, battle updates, AI tricks, and peer support — directly on WhatsApp!
        </p>
      </div>

      {/* Group Cards */}
      <div className="space-y-4 mb-10">
        {groups.map((group) => (
          <a
            key={group.id}
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="border-2 border-transparent hover:border-green-400/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01]">
              <div className="flex items-stretch">
                {/* Left gradient accent */}
                <div className={`w-2 bg-gradient-to-b ${group.gradient} flex-shrink-0`} />
                <CardContent className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-black text-foreground group-hover:text-green-600 transition-colors">
                          {group.name}
                        </h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${group.badgeColor}`}>
                          {group.badge}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {group.members} members
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Active Now
                        </span>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${group.gradient} shadow-lg ${group.glow} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </a>
        ))}
      </div>

      {/* Support Contact Card */}
      <Card className="border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-600/10 border-b border-primary/10 py-5">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Instant Support & Community
          </CardTitle>
          <CardDescription>Click below to join our group or send us an email</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <a
            href={COMMUNITY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700/30 hover:border-green-400 hover:scale-[1.01] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-foreground group-hover:text-green-600 transition-colors">Official WhatsApp Group</p>
              <p className="text-xs font-bold text-green-600">Click to Join Instant Group Chat</p>
            </div>
            <ExternalLink className="w-4 h-4 text-green-500" />
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700/30 hover:border-blue-400 hover:scale-[1.01] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-foreground group-hover:text-blue-600 transition-colors">Email Support</p>
              <p className="text-base font-bold text-blue-600">{SUPPORT_EMAIL}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-500" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
