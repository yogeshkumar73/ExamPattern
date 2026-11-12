"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Star, Zap, Target, Activity, RefreshCw, Clock, Eye, UserCheck, ExternalLink } from "lucide-react"
import { VisitProfileModal } from "./visit-profile-modal"

const CATEGORIES = [
  { id: 'global',     label: 'Global',     icon: '🌍', color: '#6366f1' },
  { id: 'coding',     label: 'Coding',     icon: '💻', color: '#3b82f6' },
  { id: 'puzzle',     label: 'Puzzle',     icon: '🧩', color: '#8b5cf6' },
  { id: 'math',       label: 'Math',       icon: '🔢', color: '#10b981' },
  { id: 'gk',         label: 'GK',         icon: '🌍', color: '#f59e0b' },
  { id: 'prediction', label: 'Predict',    icon: '🔮', color: '#ec4899' },
  { id: 'battle',     label: 'Battle',     icon: '⚔️', color: '#ef4444' },
]

const RANK_ICONS: Record<string, string> = {
  Unranked: '⬜', Bronze: '🥉', Silver: '🥈', Gold: '🥇',
  Platinum: '💠', Diamond: '💎', Master: '👑', Grandmaster: '🌟',
}

const PODIUM_CONFIG = [
  { pos: 2, size: 'h-24', bgFrom: '#64748b', bgTo: '#94a3b8', medal: '🥈', z: 'z-10' },
  { pos: 1, size: 'h-32', bgFrom: '#92400e', bgTo: '#fbbf24', medal: '🥇', z: 'z-20' },
  { pos: 3, size: 'h-20', bgFrom: '#7c2d12', bgTo: '#d97706', medal: '🥉', z: 'z-10' },
]

function computeRankTier(points: number): string {
  if (points >= 5000) return 'Grandmaster';
  if (points >= 3000) return 'Master';
  if (points >= 2000) return 'Diamond';
  if (points >= 1000) return 'Platinum';
  if (points >= 500)  return 'Gold';
  if (points >= 200)  return 'Silver';
  return 'Bronze';
}

// Process and dynamically rank real users from DB without fake bots or static dummy data
function processRealLeaderboard(
  category: string,
  backendData: any[] = []
) {
  if (!Array.isArray(backendData) || backendData.length === 0) {
    return []
  }

  // 1. Map only real registered users from DB
  const mapped = backendData.map((player) => {
    const wins = Number(player.wins ?? 0)
    const losses = Number(player.losses ?? 0)
    const totalBattles = Number(player.totalBattles ?? (wins + losses))
    const winRate = Number(player.winRate ?? (totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0))
    const xp = Number(player.xp ?? 0)
    const arenaPoints = Number(player.arenaPoints ?? 0)
    const level = Number(player.level ?? (xp > 0 ? Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1) : 1))
    const currentStreak = Number(player.currentStreak ?? 0)
    const accuracy = Number(player.accuracy ?? 0)
    const categoryXP = category !== 'global' ? Number(player.categoryXP ?? xp ?? arenaPoints) : undefined

    // Clean corrupted badges from DB if any
    const rawBadges = Array.isArray(player.badges) ? player.badges : []
    const cleanBadges = rawBadges.filter((b: any) => typeof b === 'string' && b.trim().length > 0 && !b.includes('?'))
    const badges = cleanBadges.length > 0 ? cleanBadges : (wins > 5 ? ['🏆', '🔥'] : wins > 0 ? ['⚔️'] : ['⭐'])

    return {
      userId: String(player.userId ?? player._id ?? ''),
      name: player.name || 'Student Player',
      email: player.email || '',
      avatar: player.avatar || player.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name || 'User')}&background=6366f1&color=fff`,
      arenaPoints,
      arenaRank: player.arenaRank && player.arenaRank !== 'Unranked' ? player.arenaRank : computeRankTier(arenaPoints),
      xp,
      level,
      wins,
      losses,
      totalBattles,
      winRate,
      badges,
      currentStreak,
      accuracy,
      categoryXP,
    }
  })

  // 2. Dynamically compare scores and sort strictly descending
  mapped.sort((a, b) => {
    const scoreA = category !== 'global' ? (a.categoryXP ?? a.xp ?? a.arenaPoints) : a.arenaPoints
    const scoreB = category !== 'global' ? (b.categoryXP ?? b.xp ?? b.arenaPoints) : b.arenaPoints
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }
    // Tiebreakers: XP, then total wins
    if (b.xp !== a.xp) return b.xp - a.xp
    return b.wins - a.wins
  })

  // 3. Assign dynamic ranks 1, 2, 3...
  return mapped.map((player, index) => ({
    ...player,
    rank: index + 1,
  }))
}

interface ArenaLeaderboardProps {
  currentUserId?: string
  currentUserName?: string
  currentUserEmail?: string
  currentUser?: any
  refreshTrigger?: number
}

export function ArenaLeaderboard({ 
  currentUserId, 
  currentUserName, 
  currentUserEmail, 
  currentUser,
  refreshTrigger = 0 
}: ArenaLeaderboardProps) {
  const [activeCategory, setActiveCategory] = useState('global')
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [secondsUntilUpdate, setSecondsUntilUpdate] = useState(120)
  const [lastUpdatedText, setLastUpdatedText] = useState('Just now')

  // Visit user profile modal state
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleVisitProfile = (player: any) => {
    setSelectedProfileUser(player)
    setIsProfileModalOpen(true)
  }

  const fetchLeaderboard = useCallback(async (isAuto = false) => {
    if (isAuto) {
      setIsUpdating(true)
    } else {
      setLoading(true)
    }
    setAnimate(false)

    try {
      const res = await fetch(`/api/arena/leaderboard?category=${activeCategory}&limit=50&t=${Date.now()}`)
      const data = await res.json()
      let list: any[] = []
      if (data.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        list = processRealLeaderboard(activeCategory, data.leaderboard)
      } else {
        list = []
      }

      setLeaderboard(list)
      const now = new Date()
      setLastUpdatedText(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      )
    } catch (e) {
      console.warn("Could not load leaderboard:", e)
      setLeaderboard([])
    } finally {
      setLoading(false)
      setIsUpdating(false)
      setTimeout(() => setAnimate(true), 60)
    }
  }, [activeCategory])

  // Category switch or external refreshTrigger
  useEffect(() => {
    setSecondsUntilUpdate(120)
    fetchLeaderboard(false)
  }, [activeCategory, refreshTrigger, fetchLeaderboard])

  // 2-minute dynamic interval countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilUpdate((prev) => {
        if (prev <= 1) {
          fetchLeaderboard(true)
          return 120 // Reset to 2 minutes
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fetchLeaderboard])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3, 10) // Exactly ranks 4 to 10

  const minutes = Math.floor(secondsUntilUpdate / 60)
  const seconds = secondsUntilUpdate % 60
  const formattedCountdown = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border whitespace-nowrap transition-all font-bold text-sm ${
              activeCategory === cat.id
                ? 'text-white border-white/30 bg-white/10'
                : 'text-white/50 border-white/10 hover:text-white/80'
            }`}
            style={activeCategory === cat.id ? { boxShadow: `0 0 15px ${cat.color}40`, borderColor: `${cat.color}60` } : {}}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Podium (Top 3 Champions) */}
      {top3.length > 0 && (
        <div className="arena-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="w-20 hidden md:block" />
            <h2 className="text-white font-black text-center flex items-center justify-center gap-2 text-base md:text-lg">
              <Crown className="w-5 h-5 text-yellow-400" />
              TOP CHAMPIONS (RANKS 1 – {top3.length})
            </h2>
            <div className="text-xs text-white/40 font-mono hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{lastUpdatedText}</span>
            </div>
          </div>

          <div className="flex items-end justify-center gap-4">
            {PODIUM_CONFIG.filter(cfg => cfg.pos <= top3.length).map(({ pos, size, bgFrom, bgTo, medal, z }) => {
              const player = top3[pos - 1]
              if (!player) return null
              const isCurrentUser =
                (currentUserId && player.userId === currentUserId) ||
                (currentUserName && player.name && player.name.toLowerCase() === currentUserName.toLowerCase()) ||
                (currentUserEmail && player.email && player.email.toLowerCase() === currentUserEmail.toLowerCase()) ||
                (player.name && player.name.toLowerCase() === 'yogesh')

              return (
                <div 
                  key={pos} 
                  onClick={() => handleVisitProfile(player)}
                  className={`flex flex-col items-center ${z} transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95`}
                  title={`Click to visit ${player.name}'s profile`}
                >
                  <div className="relative mb-3">
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className={`w-16 h-16 rounded-2xl border-2 object-cover shadow-lg transition-transform group-hover:ring-4 group-hover:ring-indigo-500/50 ${
                        isCurrentUser ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-white/20'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-black text-white transition-opacity">
                      VISIT
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">{medal}</div>
                    <div className="absolute -bottom-1 -right-1 text-xs bg-black/60 rounded-full px-1">
                      {RANK_ICONS[player.arenaRank] || '⬜'}
                    </div>
                  </div>
                  <div className="text-white font-black text-sm text-center mb-1 max-w-[120px] truncate flex items-center justify-center gap-1 group-hover:text-indigo-300 transition-colors">
                    <span className={isCurrentUser ? 'text-indigo-300' : 'text-white'}>{player.name}</span>
                    {isCurrentUser && (
                      <span className="bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded text-[9px] font-bold border border-indigo-500/30">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-yellow-400/90 mb-3">
                    {(activeCategory === 'global' ? player.arenaPoints : (player.categoryXP || player.arenaPoints)).toLocaleString()} pts
                  </div>
                  <div
                    className={`w-24 ${size} rounded-t-2xl flex items-center justify-center text-2xl font-black text-white shadow-2xl transition-all duration-300`}
                    style={{ background: `linear-gradient(180deg, ${bgFrom}, ${bgTo})`, boxShadow: `0 -4px 20px ${bgTo}60` }}
                  >
                    #{pos}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rankings List (Ranks 4 to 10 in descending order) */}
      <div className="arena-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-black flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-yellow-400" />
              RANKINGS (RANKS 4 – 10)
            </h3>
            <p className="text-white/40 text-xs mt-0.5">
              Strict descending order • Auto-updates every 2 minutes
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 2-Min Live Countdown Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
              <Activity className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin text-indigo-400' : 'animate-pulse'}`} />
              <span>{isUpdating ? 'Updating ranks...' : `Live • In ${formattedCountdown}`}</span>
            </div>

            {/* Instant Manual Refresh */}
            <button
              onClick={() => {
                setSecondsUntilUpdate(120)
                fetchLeaderboard(true)
              }}
              disabled={loading || isUpdating}
              title="Click to update ranks dynamically now"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || isUpdating ? 'animate-spin text-yellow-400' : ''}`} />
              <span className="hidden sm:inline">Update Now</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center text-white/50 text-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="font-semibold text-white/80">No active contenders found for this category yet.</p>
            <p className="text-xs text-white/40 mt-1">Play battles to take the #1 spot!</p>
          </div>
        ) : rest.length === 0 ? (
          <div className="p-8 text-center text-white/50 text-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400/40" />
            <p className="font-semibold text-white/80">All current contenders are featured on the Top Champions Podium!</p>
            <p className="text-xs text-white/40 mt-1">More contenders will appear here as new players join and compete.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {rest.map((player, idx) => {
              const rank = idx + 4
              const isCurrentUser =
                (currentUserId && player.userId === currentUserId) ||
                (currentUserName && player.name && player.name.toLowerCase() === currentUserName.toLowerCase()) ||
                (currentUserEmail && player.email && player.email.toLowerCase() === currentUserEmail.toLowerCase()) ||
                (player.name && player.name.toLowerCase() === 'yogesh')
              return (
                <div
                  key={player.userId || `rank-${rank}`}
                  onClick={() => handleVisitProfile(player)}
                  className={`flex items-center gap-4 p-4 transition-all cursor-pointer group hover:bg-white/10 active:bg-white/15 ${animate ? 'arena-leaderboard-row' : 'opacity-0'} ${
                    isCurrentUser ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'hover:bg-white/5'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  title={`Click to visit ${player.name}'s profile`}
                >
                  {/* Rank number (4 to 10) */}
                  <div className="w-8 text-center font-black text-white/70 text-sm">#{rank}</div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-xl object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute -bottom-1 -right-1 text-xs">
                      {RANK_ICONS[player.arenaRank] || ''}
                    </div>
                  </div>

                  {/* Name & info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm truncate group-hover:text-indigo-300 transition-colors ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                        {player.name}
                      </span>
                      {isCurrentUser && (
                        <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-indigo-500/30">
                          YOU
                        </span>
                      )}
                      {player.badges?.slice(0, 2).map((b: string, i: number) => (
                        <span key={i} className="text-xs">{b}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-white/40 text-xs">Lv.{player.level}</span>
                      <span className="text-white/40 text-xs">{player.arenaRank}</span>
                      {player.currentStreak > 2 && (
                        <span className="text-orange-400 text-xs font-bold">🔥{player.currentStreak}</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs text-white/40">W/L</div>
                      <div className="text-xs font-black">
                        <span className="text-green-400">{player.wins}</span>
                        <span className="text-white/30">/</span>
                        <span className="text-red-400">{player.losses}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Win%</div>
                      <div className="text-xs font-black text-yellow-400">{player.winRate}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40">XP</div>
                      <div className="text-xs font-black text-indigo-400">{player.xp.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Points in descending order */}
                  <div className="text-right">
                    <div className="font-black text-white text-base">
                      {activeCategory === 'global'
                        ? player.arenaPoints.toLocaleString()
                        : (player.categoryXP || player.xp || player.arenaPoints).toLocaleString()
                      }
                    </div>
                    <div className="text-[10px] text-white/30 uppercase font-mono">pts</div>
                  </div>

                  {/* Interactive Visit Profile Action Pill */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVisitProfile(player)
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 group-hover:bg-indigo-600 group-hover:text-white shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Visit</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Visit Student Profile Modal */}
      <VisitProfileModal
        user={selectedProfileUser}
        currentUser={currentUser || { id: currentUserId, name: currentUserName, email: currentUserEmail }}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}
