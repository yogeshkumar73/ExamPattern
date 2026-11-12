"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Zap, Trophy, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Sparkles } from "lucide-react"

interface AchievementsPanelProps {
  user: any
}

export function AchievementsPanel({ user }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null)

  const fetchAchievements = async () => {
    const userId = user?.id || user?._id
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/arena/achievements?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      if (data.achievements) {
        setAchievements(data.achievements)
        setUnlockedCount(data.achievements.filter((a: any) => a.unlocked).length)
      }
    } catch (_) {}
    setLoading(false)
  }

  const syncUserSession = (data: any, achIcon?: string) => {
    try {
      const raw = localStorage.getItem("aura_session")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.user) {
          parsed.user.badges = data.badges || (achIcon ? [...(parsed.user.badges || []), achIcon] : parsed.user.badges)
          parsed.user.achievements = data.achievements || parsed.user.achievements
          if (data.xp) parsed.user.xp = data.xp
          if (data.coins) parsed.user.coins = data.coins
          localStorage.setItem("aura_session", JSON.stringify(parsed))
          sessionStorage.setItem("aura_session", JSON.stringify(parsed))
        }
      }
    } catch (_) {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aura_profile_updated"))
      window.dispatchEvent(new Event("aura_achievement_claimed"))
    }
  }

  const handleClaimBadge = async (achId: string, achName: string, achIcon: string) => {
    const userId = user?.id || user?._id
    if (!userId) return
    setClaimingId(achId)
    setClaimSuccessMsg(null)
    try {
      const res = await fetch("/api/arena/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, achievementId: achId })
      })
      const data = await res.json()
      if (data.success) {
        setClaimSuccessMsg(`🎉 You claimed the "${achName}" ${achIcon} badge! Added to your Profile section.`)
        syncUserSession(data, achIcon)
        await fetchAchievements()
      } else {
        alert(data.error || "Failed to claim badge.")
      }
    } catch (err: any) {
      alert("Error claiming badge: " + err.message)
    } finally {
      setClaimingId(null)
    }
  }

  const handleScanForNewUnlocks = async () => {
    const userId = user?.id || user?._id
    if (!userId) return
    setLoading(true)
    setClaimSuccessMsg(null)
    try {
      const res = await fetch("/api/arena/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.newlyUnlocked?.length > 0) {
        setClaimSuccessMsg(`🎉 Claimed ${data.newlyUnlocked.length} new badge(s): ${data.newlyUnlocked.map((a: any) => `${a.icon} ${a.name}`).join(', ')}! Added to your Profile.`)
        syncUserSession(data)
      } else {
        alert("All completed badges are claimed! Keep playing battles to unlock more.")
      }
      await fetchAchievements()
    } catch (_) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [user])

  const claimableCount = achievements.filter((a: any) => a.eligible && !a.unlocked).length

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="arena-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center arena-rgb-glow">
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">ARENA AWARDS</h3>
            <p className="text-xs text-white/50">Complete battles and score requirements to claim badges for your Profile.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-initial text-center md:text-right">
            <div className="text-2xl font-black text-yellow-400">{unlockedCount}/{achievements.length}</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Claimed</div>
          </div>

          {claimableCount > 0 && (
            <Button
              onClick={handleScanForNewUnlocks}
              disabled={loading}
              className="h-10 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs uppercase rounded-xl shadow-lg shadow-yellow-500/20 gap-1.5 animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              Claim All ({claimableCount})
            </Button>
          )}

          <Button
            onClick={handleScanForNewUnlocks}
            disabled={loading}
            className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl"
          >
            Check for Unlocks
          </Button>
        </div>
      </div>

      {/* Claim Success Banner */}
      {claimSuccessMsg && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/15 to-emerald-500/15 border-2 border-yellow-500/30 text-yellow-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-black">{claimSuccessMsg}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClaimSuccessMsg(null)}
            className="text-xs text-yellow-400/80 hover:text-white"
          >
            Dismiss
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`arena-card p-4 flex gap-4 border transition-all ${
                ach.unlocked
                  ? "border-green-500/30 bg-green-500/10 shadow-lg shadow-green-500/5"
                  : ach.eligible
                  ? "border-yellow-500/40 bg-yellow-500/10 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-500/30"
                  : "border-white/5 bg-white/5 opacity-60"
              }`}
            >
              <div className="text-3xl p-3 rounded-xl bg-white/5 flex items-center justify-center h-fit">
                {ach.icon}
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-white font-black text-sm truncate">{ach.name}</h4>
                  {ach.unlocked ? (
                    <Badge className="bg-green-500 text-black text-[9px] uppercase font-black px-2 py-0.5">
                      ✓ Claimed
                    </Badge>
                  ) : ach.eligible ? (
                    <Button
                      size="sm"
                      onClick={() => handleClaimBadge(ach.id, ach.name, ach.icon)}
                      disabled={claimingId === ach.id}
                      className="h-7 px-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black text-[10px] font-black uppercase rounded-lg shadow-md shadow-yellow-500/20 gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {claimingId === ach.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Award className="w-3 h-3" />
                      )}
                      Claim Badge
                    </Button>
                  ) : (
                    <Badge className="bg-white/10 text-white/40 text-[9px] uppercase font-bold">Locked</Badge>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-normal">{ach.description}</p>
                
                <div className="flex gap-3 pt-2 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-indigo-400"><Zap className="w-3.5 h-3.5" /> +{ach.xpReward} XP</span>
                  <span className="flex items-center gap-1 text-amber-400"><Trophy className="w-3.5 h-3.5" /> +{ach.coinsReward} Coins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default AchievementsPanel
