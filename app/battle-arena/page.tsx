"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BattleArenaRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search
      const query = search ? search.replace(/^\?/, "") : ""
      const hasStep = query.includes("step=")
      const target = query
        ? `/?${hasStep ? query : `step=arena&${query}`}`
        : "/?step=arena"

      window.location.replace(target)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-white/70">Entering Battle Arena...</p>
      </div>
    </div>
  )
}
