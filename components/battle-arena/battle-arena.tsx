"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Swords, Trophy, Users, MessageSquare, Mic, Crown, Zap, Target,
  Star, Shield, Globe, Code2, Brain, Calculator, BookOpen, TrendingUp,
  Shuffle, ChevronRight, Lock, Play, Loader2, Flame, Award, Activity
} from "lucide-react"
import { BattleRoom } from "./battle-room"
import { ArenaLeaderboard } from "./arena-leaderboard"
import { ArenaChat } from "./arena-chat"
import { ArenaProfile } from "./arena-profile"
import { VoiceRoom } from "./voice-room"
import { AchievementsPanel } from "./achievements-panel"
import { TournamentBracket } from "./tournament-bracket"
import { StudentTournaments } from "./student-tournaments"
import { FriendsPanel } from "./friends-panel"

interface ArenaUser {
  id: string
  name: string
  email: string
  avatar: string
  xp: number
  level: number
  coins: number
  arenaPoints: number
  arenaRank: string
  wins: number
  losses: number
  winRate: number
  currentStreak: number
  badges: string[]
  achievements: any[]
  gameStats: any
  battleHistory: any[]
  accuracy: number
}

interface BattleArenaProps {
  userId: string | null
  userEmail: string | null
  isAdmin?: boolean
}

const GAME_MODES = [
  { id: 'coding',     label: 'Coding Battle',   icon: Code2,       color: '#3b82f6', desc: 'Solve coding challenges', gradient: 'from-blue-600 to-cyan-500' },
  { id: 'puzzle',     label: 'Puzzle Battle',   icon: Brain,       color: '#8b5cf6', desc: 'Logic & algorithm puzzles', gradient: 'from-violet-600 to-purple-500' },
  { id: 'math',       label: 'Math Battle',     icon: Calculator,  color: '#10b981', desc: 'Arithmetic, algebra, geometry', gradient: 'from-emerald-600 to-teal-500' },
  { id: 'gk',         label: 'GK Battle',       icon: BookOpen,    color: '#f59e0b', desc: 'General knowledge quiz', gradient: 'from-amber-600 to-orange-500' },
  { id: 'prediction', label: 'Prediction Game', icon: TrendingUp,  color: '#ec4899', desc: 'Predict sequences & patterns', gradient: 'from-pink-600 to-rose-500' },
  { id: 'mixed',      label: 'Mixed Mode',      icon: Shuffle,     color: '#f97316', desc: 'Random mix of all modes', gradient: 'from-orange-600 to-red-500' },
]

const DIFFICULTIES = [
  { id: 'beginner',     label: 'Beginner',     color: '#22c55e', icon: '🟢' },
  { id: 'intermediate', label: 'Intermediate', color: '#3b82f6', icon: '🔵' },
  { id: 'advanced',     label: 'Advanced',     color: '#8b5cf6', icon: '🟣' },
  { id: 'expert',       label: 'Expert',       color: '#f59e0b', icon: '🟡' },
  { id: 'master',       label: 'Master',       color: '#f97316', icon: '🟠' },
  { id: 'grandmaster',  label: 'Grandmaster',  color: '#ef4444', icon: '🔴' },
]

const BATTLE_TYPES = [
  { id: 'pve',        label: 'vs AI',           icon: '🤖', desc: 'Challenge the AI Boss' },
  { id: '1v1',        label: '1v1 Ranked',      icon: '⚔️', desc: 'Find a worthy opponent' },
  { id: 'team',       label: 'Team Battle',     icon: '👥', desc: '2v2 or 3v3 teamfight' },
  { id: 'private',    label: 'Private Room',    icon: '🔒', desc: 'Invite friends only' },
  { id: 'tournament', label: 'Tournament',      icon: '🏆', desc: 'Bracket competition' },
]

const RANK_ICONS: Record<string, string> = {
  Unranked: '⬜', Bronze: '🥉', Silver: '🥈', Gold: '🥇',
  Platinum: '💠', Diamond: '💎', Master: '👑', Grandmaster: '🌟',
}

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForLevel = (l: number) => l * l * 100
  const currentXP = xp - xpForLevel(level - 1)
  const neededXP = xpForLevel(level) - xpForLevel(level - 1)
  const pct = Math.min(100, Math.round((currentXP / neededXP) * 100))

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>Level {level}</span>
        <span>{currentXP}/{neededXP} XP</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 xp-bar transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function BattleArena({ userId, userEmail, isAdmin = false }: BattleArenaProps) {
  const [arenaUser, setArenaUser] = useState<ArenaUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [onlineCount, setOnlineCount] = useState(0)
  const [activeTab, setActiveTab] = useState('lobby')
  
  // Arena Approval Status — admins are always approved
  const [arenaApprovalStatus, setArenaApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(
    isAdmin ? 'approved' : null
  )
  const [approvalMessage, setApprovalMessage] = useState('')
  
  // Battle setup state
  const [selectedMode, setSelectedMode] = useState('coding')
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner')
  const [selectedBattleType, setSelectedBattleType] = useState('pve')
  
  // Battle state
  const [inBattle, setInBattle] = useState(false)
  const [battleConfig, setBattleConfig] = useState<any>(null)

  // Load user profile
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      try {
        const saved = localStorage.getItem('aura_session')
        if (!saved) { setLoading(false); return }
        const session = JSON.parse(saved)
        const email = session?.user?.email
        if (!email) { setLoading(false); return }

        const res = await fetch(`/api/profile?email=${email}`)
        const data = await res.json()
        if (data.user) {
          const u = data.user
          setArenaUser({
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            avatar: u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=128`,
            xp: u.xp || 0,
            level: u.level || 1,
            coins: u.coins || 0,
            arenaPoints: u.arenaPoints || 0,
            arenaRank: u.arenaRank || 'Unranked',
            wins: u.wins || 0,
            losses: u.losses || 0,
            winRate: u.winRate || 0,
            currentStreak: u.currentStreak || 0,
            badges: u.badges || [],
            achievements: u.achievements || [],
            gameStats: u.gameStats || {},
            battleHistory: u.battleHistory || [],
            accuracy: u.accuracy || 0,
          })

          // Check arena approval status — skip for admins (already approved)
          if (u._id && !isAdmin) {
            const statusRes = await fetch(`/api/user/arena-status?userId=${u._id}`)
            if (statusRes.ok) {
              const statusData = await statusRes.json()
              setArenaApprovalStatus(statusData.data.arenaApprovalStatus)
              if (statusData.data.arenaApprovalReason) {
                setApprovalMessage(statusData.data.arenaApprovalReason)
              }
            }
          }
        }
      } catch (e) {
        // fallback: create guest arena user
        const saved = localStorage.getItem('aura_session')
        if (saved) {
          const s = JSON.parse(saved)
          setArenaUser({
            id: s.user?.id || 'guest',
            name: s.user?.name || 'Guest',
            email: s.user?.email || '',
            avatar: `https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff`,
            xp: 0, level: 1, coins: 0, arenaPoints: 0, arenaRank: 'Unranked',
            wins: 0, losses: 0, winRate: 0, currentStreak: 0,
            badges: [], achievements: [], gameStats: {}, battleHistory: [], accuracy: 0,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Simulate online count
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 50) + 120)
    }, 5000)
    setOnlineCount(Math.floor(Math.random() * 50) + 120)
    return () => clearInterval(interval)
  }, [userId])

  const handleStartBattle = () => {
    // Check if arena is approved
    if (arenaApprovalStatus !== 'approved') {
      alert(
        arenaApprovalStatus === 'pending'
          ? 'Your arena access is pending admin approval. Please wait for approval.'
          : arenaApprovalStatus === 'rejected'
          ? `Your arena access was rejected. Reason: ${approvalMessage || 'Admin decision'}`
          : 'You do not have access to the arena. Please request access first.'
      )
      return
    }

    setBattleConfig({
      mode: selectedMode,
      difficulty: selectedDifficulty,
      battleType: selectedBattleType,
    })
    setInBattle(true)
  }

  const handleBattleEnd = async (result: any) => {
    // Update local state immediately
    if (arenaUser && result) {
      const updatedUser = {
        ...arenaUser,
        xp: arenaUser.xp + (result.xpGained || 0),
        wins: result.result === 'win' ? arenaUser.wins + 1 : arenaUser.wins,
        losses: result.result === 'loss' ? arenaUser.losses + 1 : arenaUser.losses,
        currentStreak: result.result === 'win' ? arenaUser.currentStreak + 1 : 0,
        arenaPoints: Math.max(0, arenaUser.arenaPoints + (result.pointsGained || 0)),
      }
      setArenaUser(updatedUser)

      // Calculate new level
      const xpForLevel = (l: number) => l * l * 100
      let newLevel = 1
      let totalXP = updatedUser.xp
      while (totalXP >= xpForLevel(newLevel)) {
        newLevel++
      }
      if (newLevel !== arenaUser.level) {
        updatedUser.level = newLevel
        setArenaUser({ ...updatedUser, level: newLevel })
      }

      // Persist to database
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: arenaUser.email,
            updates: {
              xp: updatedUser.xp,
              wins: updatedUser.wins,
              losses: updatedUser.losses,
              currentStreak: updatedUser.currentStreak,
              arenaPoints: updatedUser.arenaPoints,
              level: updatedUser.level,
            }
          })
        })
      } catch (e) {
        console.error('Failed to save battle results:', e)
      }
    }
    setInBattle(false)
    setBattleConfig(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-indigo-400 font-bold tracking-widest animate-pulse">LOADING ARENA...</p>
        </div>
      </div>
    )
  }

  if (inBattle && battleConfig) {
    return (
      <BattleRoom
        config={battleConfig}
        user={arenaUser}
        onBattleEnd={handleBattleEnd}
      />
    )
  }

  return (
    <div className="min-h-screen arena-bg rounded-2xl overflow-hidden">
      {/* ---- HEADER BAR ---- */}
      <div className="relative border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-4">
        <div className="arena-scanlines absolute inset-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center arena-rgb-glow">
                <Swords className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                BATTLE ARENA
                <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
              </h1>
              <p className="text-xs text-white/50 font-medium">Multiplayer Learning Combat System</p>
            </div>
          </div>

          {/* Live stats strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-bold">{onlineCount} Online</span>
            </div>

            {arenaUser && (
              <>
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1.5">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">{arenaUser.xp.toLocaleString()} XP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1.5">
                  <span className="text-sm">{RANK_ICONS[arenaUser.arenaRank] || '⬜'}</span>
                  <span className="text-amber-400 text-xs font-bold">{arenaUser.arenaRank}</span>
                </div>
                {arenaUser.currentStreak > 1 && (
                  <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-1.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-orange-400 text-xs font-bold">{arenaUser.currentStreak} Streak</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* User XP bar */}
        {arenaUser && (
          <div className="relative z-10 mt-3 max-w-sm">
            <XPBar xp={arenaUser.xp} level={arenaUser.level} />
          </div>
        )}
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 h-auto gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl mb-6">
            {[
              { value: 'lobby',       icon: Swords,       label: 'Battle' },
              { value: 'leaderboard', icon: Trophy,       label: 'Ranks' },
              { value: 'profile',     icon: Crown,        label: 'Profile' },
              { value: 'friends',     icon: Users,        label: 'Friends' },
              { value: 'chat',        icon: MessageSquare,label: 'Chat' },
              { value: 'voice',       icon: Mic,          label: 'Voice' },
              { value: 'tournament',  icon: Globe,        label: 'Events' },
              { value: 'achievements',icon: Award,        label: 'Awards' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col gap-1 py-2 px-1 h-auto text-white/50 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-[10px] font-bold hidden md:block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ===== BATTLE LOBBY ===== */}
          <TabsContent value="lobby" className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left: Mode & Config */}
              <div className="xl:col-span-2 space-y-6">
                {/* Game Mode Selector */}
                <div className="arena-card p-5">
                  <h2 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" /> SELECT GAME MODE
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GAME_MODES.map(mode => {
                      const Icon = mode.icon
                      const isSelected = selectedMode === mode.id
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedMode(mode.id)}
                          className={`relative p-4 rounded-xl border transition-all text-left group overflow-hidden ${
                            isSelected
                              ? 'border-white/30 bg-white/10 scale-[1.02]'
                              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                          }`}
                          style={isSelected ? { boxShadow: `0 0 20px ${mode.color}40` } : {}}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 opacity-10"
                              style={{ background: `linear-gradient(135deg, ${mode.color}, transparent)` }} />
                          )}
                          <div className="relative z-10">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                              style={{ background: `${mode.color}20`, border: `1px solid ${mode.color}40` }}>
                              <Icon className="w-5 h-5" style={{ color: mode.color }} />
                            </div>
                            <div className="font-black text-white text-sm">{mode.label}</div>
                            <div className="text-white/40 text-xs mt-0.5">{mode.desc}</div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                              style={{ background: mode.color }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Battle Type */}
                <div className="arena-card p-5">
                  <h2 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-violet-400" /> BATTLE TYPE
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {BATTLE_TYPES.map(bt => (
                      <button
                        key={bt.id}
                        onClick={() => setSelectedBattleType(bt.id)}
                        className={`p-3 rounded-xl border transition-all text-center ${
                          selectedBattleType === bt.id
                            ? 'border-violet-500 bg-violet-500/20 text-white'
                            : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
                        }`}
                      >
                        <div className="text-2xl mb-1">{bt.icon}</div>
                        <div className="text-xs font-black">{bt.label}</div>
                        <div className="text-[10px] text-white/40 mt-0.5 hidden md:block">{bt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="arena-card p-5">
                  <h2 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" /> DIFFICULTY
                  </h2>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDifficulty(d.id)}
                        className={`py-3 px-2 rounded-xl border transition-all text-center ${
                          selectedDifficulty === d.id
                            ? 'border-white/30 bg-white/10 text-white scale-105'
                            : 'border-white/10 text-white/50 hover:text-white/80'
                        }`}
                        style={selectedDifficulty === d.id ? { boxShadow: `0 0 15px ${d.color}40`, borderColor: `${d.color}80` } : {}}
                      >
                        <div className="text-xl mb-1">{d.icon}</div>
                        <div className="text-[11px] font-black">{d.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arena Approval Status Warning */}
                {arenaApprovalStatus !== 'approved' && (
                  <div className={`p-4 rounded-xl border-2 ${
                    arenaApprovalStatus === 'pending'
                      ? 'border-yellow-500/50 bg-yellow-500/10'
                      : arenaApprovalStatus === 'rejected'
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-blue-500/50 bg-blue-500/10'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Lock className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        arenaApprovalStatus === 'pending'
                          ? 'text-yellow-400'
                          : arenaApprovalStatus === 'rejected'
                          ? 'text-red-400'
                          : 'text-blue-400'
                      }`} />
                      <div>
                        <h3 className={`font-black text-lg ${
                          arenaApprovalStatus === 'pending'
                            ? 'text-yellow-300'
                            : arenaApprovalStatus === 'rejected'
                            ? 'text-red-300'
                            : 'text-blue-300'
                        }`}>
                          {arenaApprovalStatus === 'pending'
                            ? '⏳ Approval Pending'
                            : arenaApprovalStatus === 'rejected'
                            ? '❌ Arena Access Denied'
                            : '🔓 Request Arena Access'}
                        </h3>
                        <p className="text-white/70 text-sm mt-1">
                          {arenaApprovalStatus === 'pending'
                            ? 'Your arena access request is being reviewed by administrators. You will be able to battle once approved.'
                            : arenaApprovalStatus === 'rejected'
                            ? approvalMessage || 'Your arena access request was not approved. Contact an administrator for more information.'
                            : 'Request access to the battle arena to compete with other students.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Launch Button */}
                <button
                  onClick={handleStartBattle}
                  disabled={arenaApprovalStatus !== 'approved'}
                  className={`w-full py-5 rounded-2xl font-black text-xl text-white relative overflow-hidden group transition-all ${
                    arenaApprovalStatus === 'approved'
                      ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={arenaApprovalStatus === 'approved' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', boxShadow: '0 0 30px rgba(99,102,241,0.5)' } : { background: '#4b5563' }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    {arenaApprovalStatus !== 'approved' ? (
                      <>
                        <Lock className="w-6 h-6" />
                        ARENA LOCKED
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        {selectedBattleType === 'pve' ? 'CHALLENGE AI BOSS' :
                         selectedBattleType === '1v1' ? 'FIND OPPONENT' :
                         selectedBattleType === 'tournament' ? 'JOIN TOURNAMENT' :
                         'START BATTLE'}
                        <ChevronRight className="w-6 h-6" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Right: Stats Sidebar */}
              <div className="space-y-4">
                {/* Mini Profile Card */}
                {arenaUser && (
                  <div className="arena-card p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <img
                          src={arenaUser.avatar}
                          alt={arenaUser.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 text-sm">
                          {RANK_ICONS[arenaUser.arenaRank]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-black truncate">{arenaUser.name}</div>
                        <div className="text-xs text-white/40 font-medium">{arenaUser.arenaRank} • Lv.{arenaUser.level}</div>
                        <div className="flex gap-2 mt-1">
                          {arenaUser.badges.slice(0, 4).map((b, i) => (
                            <span key={i} className="text-sm">{b}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <XPBar xp={arenaUser.xp} level={arenaUser.level} />
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {[
                        { label: 'Wins', value: arenaUser.wins, color: '#22c55e' },
                        { label: 'Losses', value: arenaUser.losses, color: '#ef4444' },
                        { label: 'Win%', value: `${arenaUser.winRate}%`, color: '#f59e0b' },
                      ].map(s => (
                        <div key={s.label} className="text-center p-2 bg-white/5 rounded-xl">
                          <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[10px] text-white/40 font-bold uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-white/5 rounded-xl flex justify-between items-center">
                      <div className="text-xs text-white/40">Arena Points</div>
                      <div className="text-indigo-400 font-black">{arenaUser.arenaPoints.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {/* Live Matches */}
                <div className="arena-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-black text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-400 animate-pulse" /> LIVE BATTLES
                    </h3>
                    <span className="text-xs text-white/40">{Math.floor(onlineCount / 3)} active</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { p1: 'CodeNinja', p2: 'AlgoMaster', mode: 'coding', diff: 'advanced', progress: 72 },
                      { p1: 'MathGenius', p2: 'LogicKing', mode: 'math', diff: 'intermediate', progress: 45 },
                      { p1: 'PuzzlePro', p2: 'BrainStorm', mode: 'puzzle', diff: 'expert', progress: 88 },
                      { p1: 'GKChamp', p2: 'InfoGuru', mode: 'gk', diff: 'beginner', progress: 33 },
                    ].map((m, i) => (
                      <div key={i} className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/70 font-bold">{m.p1}</span>
                          <span className="text-white/30 text-[10px] px-2 py-0.5 bg-white/5 rounded-full uppercase">{m.mode}</span>
                          <span className="text-white/70 font-bold">{m.p2}</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="flex-1 h-1.5 bg-indigo-500/30 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.progress}%` }} />
                          </div>
                          <div className="flex-1 h-1.5 bg-rose-500/30 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${100 - m.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ===== LEADERBOARD ===== */}
          <TabsContent value="leaderboard" className="animate-in fade-in duration-300">
            <ArenaLeaderboard currentUserId={arenaUser?.id} />
          </TabsContent>

          {/* ===== PROFILE ===== */}
          <TabsContent value="profile" className="animate-in fade-in duration-300">
            <ArenaProfile user={arenaUser} onRefresh={() => {}} />
          </TabsContent>

          {/* ===== FRIENDS ===== */}
          <TabsContent value="friends" className="animate-in fade-in duration-300">
            <FriendsPanel currentUser={arenaUser} />
          </TabsContent>

          {/* ===== CHAT ===== */}
          <TabsContent value="chat" className="animate-in fade-in duration-300">
            <ArenaChat user={arenaUser} />
          </TabsContent>

          {/* ===== VOICE ===== */}
          <TabsContent value="voice" className="animate-in fade-in duration-300">
            <VoiceRoom user={arenaUser} />
          </TabsContent>

          {/* ===== TOURNAMENT ===== */}
          <TabsContent value="tournament" className="animate-in fade-in duration-300">
            <StudentTournaments user={arenaUser} />
          </TabsContent>

          {/* ===== ACHIEVEMENTS ===== */}
          <TabsContent value="achievements" className="animate-in fade-in duration-300">
            <AchievementsPanel user={arenaUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
