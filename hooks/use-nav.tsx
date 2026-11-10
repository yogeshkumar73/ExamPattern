"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type Step =
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
  const [currentStep, setCurrentStep] = useState<Step>("onboarding")
  const [isRegistered, setRegistered] = useState(false)
  const [isAdmin, setAdmin] = useState(false)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [profileComplete, setProfileComplete] = useState(false)

  // Sync global session state from localStorage on client-side mount & cross-tab events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncSession = async () => {
        const saved = localStorage.getItem("aura_session")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed?.user && parsed.user.email) {
              setSessionUser(parsed.user)
              setRegistered(true)
              setProfileComplete(parsed.user.profileComplete || false)
              if (parsed.user.role === "admin" || parsed.user.isAdmin === true) {
                setAdmin(true)
              }
              return
            }
          } catch (e) {
            console.error("Failed to restore session in NavProvider:", e)
          }
        }

        // Auto-sync with NextAuth /api/auth/session if localStorage session not found
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
                localStorage.setItem("aura_session", JSON.stringify({ user: sessionUserObj, role: sessionUserObj.role, isAdmin: isAdminUser }))
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

      // Auto-detect arena step from URL query parameters or custom navigation events
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
            setCurrentStep("arena")
          }
        } catch (e) {
          console.error("Failed to parse URL in useNav:", e)
        }
      }

      checkArenaRoute()
      window.addEventListener("popstate", checkArenaRoute)
      const handleArenaNav = () => setCurrentStep("arena")
      window.addEventListener("arena-navigate", handleArenaNav)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener("popstate", checkArenaRoute)
        window.removeEventListener("arena-navigate", handleArenaNav)
      }
    }
  }, [])

  const setStep = useCallback((step: Step) => {
    setCurrentStep(step)
  }, [])

  /** Navigate with guard: forces login if unauthenticated for profile/admin/setup */
  const navigate = useCallback(
    (step: Step) => {
      // Unauthenticated users trying to access protected views are redirected to login
      if (!isRegistered && (step === "profile" || step === "admin" || step === "setup")) {
        setCurrentStep("onboarding")
        return
      }
      // Allow these steps without profile being complete
      const exemptSteps: Step[] = ["onboarding", "setup", "profile"]
      if (isRegistered && !profileComplete && !exemptSteps.includes(step)) {
        setCurrentStep("setup")
        return
      }
      setCurrentStep(step)
    },
    [isRegistered, profileComplete]
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
