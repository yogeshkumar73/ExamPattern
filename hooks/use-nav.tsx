"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import {
  getStoredSession,
  storeSession,
  clearStoredSession,
  hasValidSessionToken,
  savePostLoginRedirect,
  generateSessionToken,
} from "@/lib/session-storage"

export type Step =
  | "home"
  | "onboarding"
  | "setup"        // mandatory stream/course setup after registration
  | "upload"
  | "analyze"
  | "predict"
  | "admin"
  | "community"
  | "policy"
  | "chat"
  | "profile"
  | "developer"
  | "lab"
  | "guider"
  | "arena"
  | "feedback"
  | "community-join"

export interface SessionUser {
  id: string
  name: string
  email: string
  phone?: string
  photoUrl?: string
  branch?: string
  bio?: string
  stream?: string
  course?: string
  department?: string
  grade?: string
  role?: "student" | "admin"
  profileComplete?: boolean
  isLabApproved?: boolean
  status?: string
  points?: number
  rank?: string
  arenaApprovalStatus?: "pending" | "approved" | "rejected" | "suspended"
  arenaApprovalReason?: string
  arenaAccessRequestedAt?: string
  arenaApprovedAt?: string
  arenaRejectedAt?: string
  arenaAccess?: any
}

interface NavContextType {
  currentStep: Step
  setStep: (step: Step) => void
  isRegistered: boolean
  setRegistered: (v: boolean) => void
  isAdmin: boolean
  setAdmin: (v: boolean) => void
  sessionUser: SessionUser | null
  setSessionUser: (user: SessionUser | null) => void
  profileComplete: boolean
  setProfileComplete: (v: boolean) => void
  /** Navigate only if profile is complete; otherwise redirect to setup */
  navigate: (step: Step) => void
}

const NavContext = createContext<NavContextType | undefined>(undefined)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<Step>("home")
  const [isRegistered, setRegistered] = useState(false)
  const [isAdmin, setAdmin] = useState(false)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [profileComplete, setProfileComplete] = useState(false)

  // Sync session state from sessionStorage (browser window lifecycle)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncSession = async () => {
        // Read strictly from sessionStorage; null indicates window was closed or token expired
        const stored = getStoredSession()
        if (stored && stored.user && stored.token) {
          setSessionUser(stored.user)
          setRegistered(true)
          setProfileComplete(Boolean(stored.user.profileComplete))
          if (stored.user.role === "admin" || stored.user.isAdmin === true || stored.isAdmin === true) {
            setAdmin(true)
          }
          return
        }

        // Auto-sync with NextAuth /api/auth/session if active server session exists
        try {
          const res = await fetch("/api/auth/session", { credentials: "include" })
          if (res.ok) {
            const text = await res.text()
            if (text && text.trim()) {
              const data = JSON.parse(text)
              const u = data?.user || data?.session?.user
              if (u?.email) {
                const sessionUserObj: SessionUser = {
                  id: u.id || u._id || `USR-${u.email}`,
                  name: u.name || "Student",
                  email: u.email,
                  photoUrl: u.image || u.photoUrl || "",
                  role: u.role || "student",
                  profileComplete: Boolean(u.profileComplete),
                }
                const isAdminUser = Boolean(u.isAdmin || u.role === "admin")
                const token = generateSessionToken(sessionUserObj.id, sessionUserObj.email, sessionUserObj.role || "student").token
                storeSession({ user: sessionUserObj, token, role: sessionUserObj.role, isAdmin: isAdminUser })
                setSessionUser(sessionUserObj)
                setRegistered(true)
                setAdmin(isAdminUser)
                setProfileComplete(sessionUserObj.profileComplete || false)
                return
              }
            }
          }
        } catch (authErr) {
          // Unauthenticated or network error
        }

        // Unauthenticated guest: clear persistent disk storage and enforce guest state
        clearStoredSession()
        setSessionUser(null)
        setRegistered(false)
        setAdmin(false)
        setProfileComplete(false)
      }

      syncSession()

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "aura_session") {
          syncSession()
        }
      }

      window.addEventListener("storage", handleStorageChange)

      // Auto-detect arena step from URL query parameters with authorization guard
      const checkArenaRoute = () => {
        try {
          const params = new URLSearchParams(window.location.search)
          const stepParam = params.get("step") || params.get("tab")
          if (
            stepParam === "arena" ||
            stepParam === "tournament" ||
            stepParam === "events" ||
            params.get("tournamentId") ||
            params.get("invite") ||
            params.get("roomCode")
          ) {
            if (hasValidSessionToken()) {
              setCurrentStep("arena")
            } else {
              // Intercept guest from entering service without login
              savePostLoginRedirect("arena")
              setCurrentStep("onboarding")
            }
          }
        } catch (e) {
          console.error("Failed to parse URL in useNav:", e)
        }
      }

      checkArenaRoute()
      window.addEventListener("popstate", checkArenaRoute)
      const handleArenaNav = () => {
        if (hasValidSessionToken()) {
          setCurrentStep("arena")
        } else {
          savePostLoginRedirect("arena")
          setCurrentStep("onboarding")
        }
      }
      window.addEventListener("arena-navigate", handleArenaNav)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener("popstate", checkArenaRoute)
        window.removeEventListener("arena-navigate", handleArenaNav)
      }
    }
  }, [])

  // Steps that can be accessed without an authenticated session
  const PUBLIC_STEPS: Step[] = ["home", "onboarding", "policy"]

  /**
   * Set step with authentication verification:
   * Guests are intercepted and redirected to "onboarding" before entering any platform service.
   */
  const setStep = useCallback((step: Step) => {
    // 1. Allow public landing and informational pages freely
    if (PUBLIC_STEPS.includes(step)) {
      setCurrentStep(step)
      return
    }

    // 2. Verify active session token in sessionStorage
    const isSessionActive = hasValidSessionToken()
    if (!isRegistered || !isSessionActive) {
      // Remember intended service destination for post-login redirect
      savePostLoginRedirect(step)
      setCurrentStep("onboarding")
      return
    }

    // 3. For authenticated users, verify mandatory profile completion before general services
    if (!profileComplete && step !== "setup" && step !== "profile") {
      setCurrentStep("setup")
      return
    }

    setCurrentStep(step)
  }, [isRegistered, profileComplete])

  /** Navigate with guard */
  const navigate = useCallback(
    (step: Step) => {
      setStep(step)
    },
    [setStep]
  )

  return (
    <NavContext.Provider
      value={{
        currentStep,
        setStep,
        isRegistered,
        setRegistered,
        isAdmin,
        setAdmin,
        sessionUser,
        setSessionUser,
        profileComplete,
        setProfileComplete,
        navigate,
      }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const context = useContext(NavContext)
  if (!context) throw new Error("useNav must be used within NavProvider")
  return context
}
