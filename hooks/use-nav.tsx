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
  arenaApprovalStatus?: "pending" | "approved" | "rejected"
  arenaApprovalReason?: string
  arenaAccessRequestedAt?: string
  arenaApprovedAt?: string
  arenaRejectedAt?: string
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

  // Sync global session state from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aura_session")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed?.user) {
            setSessionUser(parsed.user)
            setRegistered(true)
            setProfileComplete(parsed.user.profileComplete || false)
            if (parsed.user.role === "admin") {
              setAdmin(true)
            }
          }
        } catch (e) {
          console.error("Failed to restore session in NavProvider:", e)
        }
      }
    }
  }, [])

  const setStep = useCallback((step: Step) => {
    setCurrentStep(step)
  }, [])

  /** Navigate with guard: forces profile setup if stream is missing */
  const navigate = useCallback(
    (step: Step) => {
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
