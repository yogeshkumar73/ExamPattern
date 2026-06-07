"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Zap, Trophy, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"

interface AchievementsPanelProps {
  user: any
}

export function AchievementsPanel({ user }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unlockedCount, setUnlockedCount] = useState(0)

  const fetchAchievements = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/arena/achievements?userId=${user.id}`)
      const data = await res.json()
      if (data.achievements) {
        setAchievements(data.achievements)
        setUnlockedCount(data.achievements.filter((a: any) => a.unlocked).length)
      }
    } catch (_) {}
    setLoading(false)
  }

  const handleScanForNewUnlocks = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch("/api/arena/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      })
      const data = await res.json()
      if (data.newlyUnlocked?.length > 0) {
        alert(`Congratulations! You unlocked ${data.newlyUnlocked.length} new achievement(s): ${data.newlyUnlocked.map((a: any) => a.name).join(', ')}!`)
      } else {
        alert("All achievements are up to date! Keep playing to unlock more.")
      }
      fetchAchievements()
    } catch (_) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [user])

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
            <p className="text-xs text-white/50">Unlock achievements by winning battles and earning XP.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-initial text-center md:text-right">
            <div className="text-2xl font-black text-yellow-400">{unlockedCount}/{achievements.length}</div>
            <div className="text-[10px] text-white/40 font-bold uppercase">Unlocked</div>
          </div>
          <Button
            onClick={handleScanForNewUnlocks}
            disabled={loading}
            className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl"
          >
            Check for Unlocks
          </Button>
        </div>
      </div>

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
                  ? "border-green-500/20 bg-green-500/5"
                  : ach.eligible
                  ? "border-yellow-500/20 bg-yellow-500/5 animate-pulse"
                  : "border-white/5 bg-white/5 opacity-60"
              }`}
            >
              <div className="text-3xl p-3 rounded-xl bg-white/5 flex items-center justify-center h-fit">
                {ach.icon}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-white font-black text-sm truncate">{ach.name}</h4>
                  {ach.unlocked ? (
                    <Badge className="bg-green-500 text-black text-[9px] uppercase font-bold">Unlocked</Badge>
                  ) : ach.eligible ? (
                    <Badge className="bg-yellow-500 text-black text-[9px] uppercase font-bold">Claimable</Badge>
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
