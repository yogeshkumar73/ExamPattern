"use client"

import React, { createContext, useContext, useState } from "react"

type Step = "onboarding" | "upload" | "analyze" | "predict" | "admin" | "community" | "policy" | "chat"

interface NavContextType {
  currentStep: Step
  setStep: (step: Step) => void
  isRegistered: boolean
  setRegistered: (v: boolean) => void
  isAdmin: boolean
  setAdmin: (v: boolean) => void
}

const NavContext = createContext<NavContextType | undefined>(undefined)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setStep] = useState<Step>("onboarding")
  const [isRegistered, setRegistered] = useState(false)
  const [isAdmin, setAdmin] = useState(false)
  
  return (
    <NavContext.Provider value={{ 
      currentStep, 
      setStep, 
      isRegistered, 
      setRegistered,
      isAdmin,
      setAdmin
    }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const context = useContext(NavContext)
  if (!context) throw new Error("useNav must be used within NavProvider")
  return context
}
