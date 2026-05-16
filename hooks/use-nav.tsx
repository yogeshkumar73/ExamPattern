"use client"

import React, { createContext, useContext, useState } from "react"

type Step = "upload" | "analyze" | "predict"

interface NavContextType {
  currentStep: Step
  setStep: (step: Step) => void
  canGoNext: boolean
  canGoPrev: boolean
}

const NavContext = createContext<NavContextType | undefined>(undefined)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setStep] = useState<Step>("upload")
  
  // These will be updated by the ExamAnalyzer component
  const [canGoNext, setCanGoNext] = useState(false)
  const [canGoPrev, setCanGoPrev] = useState(false)

  return (
    <NavContext.Provider value={{ currentStep, setStep, canGoNext, canGoPrev }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const context = useContext(NavContext)
  if (!context) throw new Error("useNav must be used within NavProvider")
  return context
}
