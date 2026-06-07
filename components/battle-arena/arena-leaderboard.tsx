"use client"

import { useState, useEffect } from "react"
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Star, Zap, Target, Activity } from "lucide-react"

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

// Generate mock leaderboard with realistic names and stats
function generateMockLeaderboard(category: string) {
  const names = [
    'AlgoMaster99', 'CodeNinja', 'ByteWizard', 'LogicKing', 'BrainStorm',
    'DataDragon', 'NeuralNerd', 'HackForce', 'CyberSage', 'PixelPunk',
    'MathGenius', 'PuzzlePro', 'TechTitan', 'GKChampion', 'InfoGuru',
    'DevStrike', 'RootAdmin', 'SystemX', 'Overflow_', 'BitHunter',
  ]
  const ranks = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']

  return names.map((name, i) => ({
    rank: i + 1,
    userId: `mock-${i}`,
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${['6366f1','8b5cf6','3b82f6','ec4899','10b981'][i % 5]}&color=fff`,
    arenaPoints: Math.max(0, 8500 - i * 380 + Math.floor(Math.random() * 200)),
    arenaRank: ranks[Math.max(0, 7 - Math.floor(i / 3))],
    xp: Math.max(0, 12000 - i * 550 + Math.floor(Math.random() * 500)),
    level: Math.max(1, 25 - Math.floor(i * 1.2)),
    wins: Math.max(0, 120 - i * 5 + Math.floor(Math.random() * 20)),
    losses: Math.max(0, 20 + i * 2 + Math.floor(Math.random() * 10)),
    winRate: Math.max(20, 95 - i * 3 + Math.floor(Math.random() * 10)),
    badges: ['🏆', '⚡', '🎯', '🔥'].slice(0, Math.max(1, 4 - Math.floor(i / 5))),
    totalBattles: Math.max(5, 150 - i * 6),
    currentStreak: Math.max(0, 15 - i),
    accuracy: Math.max(40, 98 - i * 2.5),
    categoryXP: category !== 'global' ? Math.max(0, 5000 - i * 240 + Math.floor(Math.random() * 300)) : undefined,
  }))
}

interface ArenaLeaderboardProps {
  currentUserId?: string
}

export function ArenaLeaderboard({ currentUserId }: ArenaLeaderboardProps) {
  const [activeCategory, setActiveCategory] = useState('global')
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setAnimate(false)
      try {
        const res = await fetch(`/api/arena/leaderboard?category=${activeCategory}&limit=20`)
        const data = await res.json()
        if (data.leaderboard?.length > 0) {
          setLeaderboard(data.leaderboard)
        } else {
          setLeaderboard(generateMockLeaderboard(activeCategory))
        }
      } catch {
        setLeaderboard(generateMockLeaderboard(activeCategory))
      } finally {
        setLoading(false)
        setTimeout(() => setAnimate(true), 50)
      }
    }
    fetchLeaderboard()
  }, [activeCategory])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

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

      {/* Podium (top 3) */}
      {top3.length >= 3 && (
        <div className="arena-card p-6">
          <h2 className="text-white font-black text-center mb-8 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            TOP CHAMPIONS
          </h2>
          <div className="flex items-end justify-center gap-4">
            {PODIUM_CONFIG.map(({ pos, size, bgFrom, bgTo, medal, z }) => {
              const player = top3[pos - 1]
              if (!player) return null
              return (
                <div key={pos} className={`flex flex-col items-center ${z}`}>
                  <div className="relative mb-3">
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-16 h-16 rounded-2xl border-2 border-white/20 object-cover"
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">{medal}</div>
                    <div className="absolute -bottom-1 -right-1 text-sm">
                      {RANK_ICONS[player.arenaRank] || '⬜'}
                    </div>
                  </div>
                  <div className="text-white font-black text-sm text-center mb-2 max-w-[100px] truncate">
                    {player.name}
                  </div>
                  <div className="text-xs text-white/50 mb-3">{player.arenaPoints.toLocaleString()} pts</div>
                  <div
                    className={`w-24 ${size} rounded-t-2xl flex items-center justify-center text-2xl font-black text-white shadow-2xl`}
                    style={{ background: `linear-gradient(180deg, ${bgFrom}, ${bgTo})`, boxShadow: `0 -4px 20px ${bgTo}60` }}
                  >
                    {pos}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="arena-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-black flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            RANKINGS
          </h3>
          <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
            <Activity className="w-3 h-3 animate-pulse" /> Live
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {rest.map((player, idx) => {
              const isCurrentUser = player.userId === currentUserId
              const rank = idx + 4
              return (
                <div
                  key={player.userId}
                  className={`flex items-center gap-4 p-4 transition-all ${animate ? 'arena-leaderboard-row' : 'opacity-0'} ${
                    isCurrentUser ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'hover:bg-white/5'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Rank number */}
                  <div className="w-8 text-center font-black text-white/60 text-sm">#{rank}</div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="absolute -bottom-1 -right-1 text-xs">
                      {RANK_ICONS[player.arenaRank] || ''}
                    </div>
                  </div>

                  {/* Name & info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm truncate ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                        {player.name}
                      </span>
                      {isCurrentUser && <span className="text-indigo-400 text-xs font-bold">YOU</span>}
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

                  {/* Points */}
                  <div className="text-right">
                    <div className="font-black text-white">
                      {activeCategory === 'global'
                        ? player.arenaPoints.toLocaleString()
                        : (player.categoryXP || player.xp).toLocaleString()
                      }
                    </div>
                    <div className="text-[10px] text-white/30 uppercase">pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
