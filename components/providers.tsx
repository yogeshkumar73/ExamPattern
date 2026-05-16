"use client"

import { NavProvider } from "@/hooks/use-nav"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      {children}
    </NavProvider>
  )
}
