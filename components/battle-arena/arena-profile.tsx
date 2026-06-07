"use client"

import { useState, useEffect } from "react"
import { Zap, Trophy, Target, Flame, Shield, Star, TrendingUp, Code2, Brain, Calculator, BookOpen, Award } from "lucide-react"

const RANK_ICONS: Record<string, string> = {
  Unranked: '⬜', Bronze: '🥉', Silver: '🥈', Gold: '🥇',
  Platinum: '💠', Diamond: '💎', Master: '👑', Grandmaster: '🌟',
}
const RANK_GRADIENTS: Record<string, string> = {
  Unranked:    'from-slate-600 to-slate-400',
  Bronze:      'from-amber-800 to-amber-600',
  Silver:      'from-gray-500 to-gray-300',
  Gold:        'from-yellow-700 to-yellow-400',
  Platinum:    'from-cyan-700 to-cyan-400',
  Diamond:     'from-blue-700 to-blue-300',
  Master:      'from-purple-700 to-purple-400',
  Grandmaster: 'from-red-700 to-yellow-400',
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
      <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  )
}

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForLevel = (l: number) => l * l * 100
  const currentXP = xp - xpForLevel(level - 1)
  const neededXP = xpForLevel(level) - xpForLevel(level - 1)
  const pct = Math.min(100, Math.round((currentXP / neededXP) * 100))

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-indigo-400">Level {level}</span>
        <span className="text-white/50">{currentXP.toLocaleString()} / {neededXP.toLocaleString()} XP</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 xp-bar"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-[10px] text-white/30">{pct}% to Level {level + 1}</div>
    </div>
  )
}

interface ArenaProfileProps {
  user: any
  onRefresh: () => void
}

export function ArenaProfile({ user, onRefresh }: ArenaProfileProps) {
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/arena/achievements?userId=${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.achievements) setAchievements(d.achievements) })
      .catch(() => {})
  }, [user?.id])

  if (!user) {
    return (
      <div className="arena-card p-12 text-center">
        <div className="text-white/40 text-lg">Please log in to view your profile</div>
      </div>
    )
  }

  const rankGradient = RANK_GRADIENTS[user.arenaRank] || RANK_GRADIENTS.Unranked
  const modeStats = [
    { label: 'Coding',  icon: Code2,      color: '#3b82f6', wins: user.gameStats?.coding?.wins || 0, xp: user.gameStats?.coding?.xp || 0 },
    { label: 'Puzzle',  icon: Brain,      color: '#8b5cf6', wins: user.gameStats?.puzzle?.wins || 0, xp: user.gameStats?.puzzle?.xp || 0 },
    { label: 'Math',    icon: Calculator, color: '#10b981', wins: user.gameStats?.math?.wins || 0,   xp: user.gameStats?.math?.xp || 0 },
    { label: 'GK',      icon: BookOpen,   color: '#f59e0b', wins: user.gameStats?.gk?.wins || 0,     xp: user.gameStats?.gk?.xp || 0 },
    { label: 'Predict', icon: TrendingUp, color: '#ec4899', wins: user.gameStats?.prediction?.wins || 0, xp: user.gameStats?.prediction?.xp || 0 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Avatar & Rank */}
      <div className="space-y-4">
        <div className="arena-card p-6 text-center">
          {/* Rank ring */}
          <div className="relative inline-block mb-4">
            <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${rankGradient} p-1 mx-auto`}
              style={{ boxShadow: `0 0 30px rgba(99,102,241,0.3)` }}>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">
              {RANK_ICONS[user.arenaRank] || '⬜'}
            </div>
          </div>

          <div className="text-white font-black text-xl mt-3">{user.name}</div>
          <div className="text-white/50 text-sm">{user.email}</div>

          <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-black bg-gradient-to-r ${rankGradient} text-white`}>
            {user.arenaRank}
          </div>

          <div className="mt-4 space-y-2">
            <XPBar xp={user.xp || 0} level={user.level || 1} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="arena-card p-4">
          <h3 className="text-white font-black text-sm mb-3">QUICK STATS</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Total XP"     value={user.xp?.toLocaleString() || '0'} color="#6366f1" icon={Zap} />
            <StatCard label="Coins"        value={user.coins || 0}                   color="#f59e0b" icon={Star} />
            <StatCard label="Arena Points" value={user.arenaPoints || 0}             color="#3b82f6" icon={Trophy} />
            <StatCard label="Accuracy"     value={`${user.accuracy || 0}%`}          color="#10b981" icon={Target} />
            <StatCard label="Best Streak"  value={user.currentStreak || 0}           color="#f97316" icon={Flame} />
            <StatCard label="Battles"      value={user.totalBattles || 0}            color="#8b5cf6" icon={Shield} />
          </div>
        </div>
      </div>

      {/* Middle: Battle Stats */}
      <div className="space-y-4">
        {/* Win/Loss Ring */}
        <div className="arena-card p-5">
          <h3 className="text-white font-black text-sm mb-4">BATTLE RECORD</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="10"
                  strokeDasharray={`${(user.winRate || 0) * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-white">{user.winRate || 0}%</div>
                <div className="text-xs text-white/40">Win Rate</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <div className="text-2xl font-black text-green-400">{user.wins || 0}</div>
              <div className="text-xs text-green-400/70">Wins</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <div className="text-2xl font-black text-blue-400">{user.draws || 0}</div>
              <div className="text-xs text-blue-400/70">Draws</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <div className="text-2xl font-black text-red-400">{user.losses || 0}</div>
              <div className="text-xs text-red-400/70">Losses</div>
            </div>
          </div>
        </div>

        {/* Per-mode stats */}
        <div className="arena-card p-5">
          <h3 className="text-white font-black text-sm mb-4">MODE PERFORMANCE</h3>
          <div className="space-y-3">
            {modeStats.map(mode => {
              const total = Math.max(1, user.totalBattles || 1)
              const pct = Math.min(100, Math.round((mode.xp / Math.max(1, user.xp || 1)) * 100))
              return (
                <div key={mode.label}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <mode.icon className="w-3 h-3" style={{ color: mode.color }} />
                      <span className="text-white/70 text-xs font-bold">{mode.label}</span>
                    </div>
                    <div className="text-xs font-black" style={{ color: mode.color }}>
                      {mode.wins}W • {mode.xp.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: mode.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Battle History */}
        <div className="arena-card p-4">
          <h3 className="text-white font-black text-sm mb-3">RECENT BATTLES</h3>
          {user.battleHistory?.length > 0 ? (
            <div className="space-y-2">
              {user.battleHistory.slice(0, 5).map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${b.result === 'win' ? 'bg-green-400' : b.result === 'loss' ? 'bg-red-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs font-bold capitalize">{b.mode} • {b.difficulty}</div>
                    <div className="text-white/40 text-[10px]">vs {b.opponentName}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-black ${b.result === 'win' ? 'text-green-400' : b.result === 'loss' ? 'text-red-400' : 'text-blue-400'}`}>
                      {b.result?.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-indigo-400">+{b.xpGained} XP</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/30 text-sm py-4">No battles yet. Start fighting!</div>
          )}
        </div>
      </div>

      {/* Right: Achievements & Badges */}
      <div className="space-y-4">
        {/* Badges */}
        {user.badges?.length > 0 && (
          <div className="arena-card p-4">
            <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" /> BADGES
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((b: string, i: number) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="arena-card p-4">
          <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            ACHIEVEMENTS
            <span className="text-white/30 text-xs">({achievements.filter(a => a.unlocked).length}/{achievements.length})</span>
          </h3>
          <div className="space-y-2">
            {achievements.slice(0, 8).map((ach: any) => (
              <div
                key={ach.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  ach.unlocked
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                <div className="text-xl">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-black ${ach.unlocked ? 'text-yellow-300' : 'text-white/50'}`}>{ach.name}</div>
                  <div className="text-[10px] text-white/30 truncate">{ach.description}</div>
                </div>
                {ach.unlocked && (
                  <div className="text-[10px] text-indigo-400 font-bold text-right">
                    +{ach.xpReward}<br/>XP
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
