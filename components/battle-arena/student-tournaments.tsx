"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Trophy, Users, Plus, Loader2, Play, Clock, Target, User,
  ChevronRight, Lock, Unlock, Calendar, Zap, Award, Copy, Check,
  Share2, Shield, AlertCircle, X, Sparkles, Key
} from "lucide-react"
import { TournamentGame } from "./tournament-game"
import { TournamentResult } from "./tournament-result"

interface StudentTournamentsProps {
  user: any
}

const GAME_MODES = [
  { id: 'coding', label: 'Coding Battle', icon: '💻', desc: 'Algorithm challenges', color: 'from-blue-600 to-cyan-500' },
  { id: 'math', label: 'Math Battle', icon: '🔢', desc: 'Speed arithmetic & algebra', color: 'from-green-600 to-teal-500' },
  { id: 'puzzle', label: 'Puzzle Battle', icon: '🧩', desc: 'Logic & IQ teasers', color: 'from-purple-600 to-pink-500' },
  { id: 'gk', label: 'GK Battle', icon: '🧠', desc: 'General science & tech', color: 'from-yellow-600 to-orange-500' },
  { id: 'prediction', label: 'Prediction Game', icon: '📈', desc: 'Market & trend estimation', color: 'from-pink-600 to-rose-500' },
  { id: 'mixed', label: 'Mixed Mode', icon: '🔀', desc: 'Random round rotation', color: 'from-orange-600 to-red-500' },
]

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: '#22c55e' },
  { id: 'intermediate', label: 'Intermediate', color: '#3b82f6' },
  { id: 'advanced', label: 'Advanced', color: '#8b5cf6' },
  { id: 'expert', label: 'Expert', color: '#f59e0b' },
]

const PRIZE_OPTIONS = [500, 1000, 2500, 5000, 10000]

export function StudentTournaments({ user }: StudentTournamentsProps) {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('browse') // browse, my-tournaments, playing, results
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGameMode, setShowGameMode] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<any>(null)
  
  // Quick Code / Direct Link Modal
  const [showCodeJoinModal, setShowCodeJoinModal] = useState(false)
  const [joinInviteCode, setJoinInviteCode] = useState("")
  const [joinPassword, setJoinPassword] = useState("")

  // Password Prompt for Protected Tournaments
  const [passwordPromptTournament, setPasswordPromptTournament] = useState<any>(null)
  const [enteredPassword, setEnteredPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Copied indicator state
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    mode: 'coding',
    difficulty: 'intermediate',
    maxParticipants: 8,
    prizePool: 1000,
    timeType: 'immediate', // immediate | scheduled
    scheduledTime: '',
    isPrivate: false,
    password: '',
  })

  const fetchTournaments = async () => {
    try {
      const param = user?.id ? `?userId=${encodeURIComponent(user.id)}` : ''
      const res = await fetch(`/api/arena/tournaments${param}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.tournaments) setTournaments(data.tournaments)
    } catch (e) {
      console.error('Failed to fetch tournaments:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()
    const interval = setInterval(fetchTournaments, 5000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Auto-detect invite or tournamentId from URL query param or arena-navigate event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const applyInviteParam = (detail?: any) => {
        const params = new URLSearchParams(window.location.search)
        const invite = detail?.invite || params.get('invite')
        const tId = detail?.tournamentId || params.get('tournamentId')
        if (invite) {
          setJoinInviteCode(invite)
          setShowCodeJoinModal(true)
        } else if (tId && tournaments.length > 0) {
          const found = tournaments.find(t => t._id === tId)
          if (found) {
            handleJoinTournament(found)
          }
        }
      }

      applyInviteParam()

      const handleArenaNav = (e: any) => {
        applyInviteParam(e.detail)
      }
      window.addEventListener('arena-navigate', handleArenaNav)
      return () => window.removeEventListener('arena-navigate', handleArenaNav)
    }
  }, [tournaments.length])

  const handleCopyInviteLink = (tournament: any) => {
    const inviteLink = `${window.location.origin}/?step=arena&tab=tournament&tournamentId=${tournament._id}&invite=${tournament.inviteCode || ''}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedCode(tournament._id)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  const handleCopyCodeOnly = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  const handleCreateTournament = async () => {
    let cleanName = formData.name.trim()
    if (!cleanName || cleanName.includes('@')) {
      const modeLabel = formData.mode.charAt(0).toUpperCase() + formData.mode.slice(1)
      cleanName = `${modeLabel} Championship`
    }

    if (formData.isPrivate && !formData.password.trim()) {
      alert('Please provide a password for your private tournament, or uncheck the private option.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: cleanName,
          mode: formData.mode,
          difficulty: formData.difficulty,
          maxParticipants: formData.maxParticipants,
          prizePool: formData.prizePool,
          startTime: formData.timeType === 'scheduled' && formData.scheduledTime ? formData.scheduledTime : new Date().toISOString(),
          scheduledStartTime: formData.timeType === 'scheduled' && formData.scheduledTime ? formData.scheduledTime : null,
          password: formData.isPrivate ? formData.password.trim() : '',
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar || user?.photoUrl,
        })
      })
      const data = await res.json()
      if (data.success) {
        setFormData({
          name: '',
          mode: 'coding',
          difficulty: 'intermediate',
          maxParticipants: 8,
          prizePool: 1000,
          timeType: 'immediate',
          scheduledTime: '',
          isPrivate: false,
          password: '',
        })
        setShowCreateForm(false)
        await fetchTournaments()
        setActiveTab('my-tournaments')
      } else {
        alert(data.error || 'Failed to create tournament')
      }
    } catch (e) {
      console.error('Failed to create tournament:', e)
      alert('Error creating tournament. Please check connection.')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinTournament = async (tournament: any, passwordOverride?: string) => {
    // If tournament has password and user is not host and no password provided yet
    if (tournament.hasPassword && tournament.createdBy !== user?.id && !passwordOverride) {
      setPasswordPromptTournament(tournament)
      setEnteredPassword("")
      setPasswordError(null)
      return
    }

    setActionLoading(tournament._id)
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          tournamentId: tournament._id,
          password: passwordOverride || enteredPassword,
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar || user?.photoUrl,
        })
      })
      const data = await res.json()
      if (data.success) {
        setPasswordPromptTournament(null)
        setEnteredPassword("")
        setPasswordError(null)
        await fetchTournaments()
        setActiveTab('my-tournaments')
      } else {
        if (passwordPromptTournament) {
          setPasswordError(data.error || 'Incorrect tournament password')
        } else {
          alert(data.error || 'Failed to join tournament')
        }
      }
    } catch (e) {
      console.error('Failed to join tournament:', e)
      alert('Error joining tournament')
    } finally {
      setActionLoading(null)
    }
  }

  const handleJoinViaCodeOrLink = async () => {
    if (!joinInviteCode.trim()) {
      alert("Please enter an invite code or link")
      return
    }

    // Extract code if full link was pasted
    let cleanCode = joinInviteCode.trim()
    if (cleanCode.includes("invite=")) {
      cleanCode = cleanCode.split("invite=")[1].split("&")[0]
    }

    setActionLoading("code_join")
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          inviteCode: cleanCode,
          password: joinPassword,
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar || user?.photoUrl,
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowCodeJoinModal(false)
        setJoinInviteCode("")
        setJoinPassword("")
        await fetchTournaments()
        setActiveTab('my-tournaments')
      } else {
        alert(data.error || 'Could not join with this code')
      }
    } catch (e) {
      alert('Network error entering tournament')
    } finally {
      setActionLoading(null)
    }
  }

  // Host Only: Start tournament early
  const handleHostStartTournament = async (tournamentId: string) => {
    if (!confirm("Are you sure you want to start this tournament now with current players?")) return
    setActionLoading(tournamentId)
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_tournament',
          tournamentId,
          userId: user?.id,
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchTournaments()
        setActiveTab('playing')
      } else {
        alert(data.error || 'Failed to start tournament')
      }
    } catch (e) {
      alert('Error starting tournament')
    } finally {
      setActionLoading(null)
    }
  }

  // Host Only: Cancel tournament
  const handleHostCancelTournament = async (tournamentId: string) => {
    if (!confirm("Cancel and delete this tournament? This cannot be undone.")) return
    setActionLoading(tournamentId)
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_tournament',
          tournamentId,
          userId: user?.id,
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchTournaments()
      } else {
        alert(data.error || 'Failed to cancel tournament')
      }
    } catch (e) {
      alert('Error cancelling tournament')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMatchComplete = async () => {
    await fetchTournaments()
    if (selectedTournament?.status === 'finished') {
      setShowGameMode(false)
      setShowResults(true)
    }
  }

  // Get filtered tournaments
  const myTournaments = tournaments.filter(t => t.participants?.some((p: any) => p.userId === user?.id))
  const activeTournaments = tournaments.filter(t => t.status === 'open' && !myTournaments.includes(t))
  const activePlaying = tournaments.filter(t => t.status === 'active' && myTournaments.includes(t))
  const finished = tournaments.filter(t => t.status === 'finished' && myTournaments.includes(t))

  const getParticipationStatus = (tournament: any) => {
    if (tournament.status === 'open') return 'Registration Open'
    if (tournament.status === 'active') return 'In Progress'
    return 'Finished'
  }

  const getTournamentColor = (status: string) => {
    if (status === 'open') return 'from-indigo-900/60 via-slate-900 to-black'
    if (status === 'active') return 'from-amber-950/60 via-slate-900 to-black'
    return 'from-gray-900 via-slate-900 to-black'
  }

  return (
    <div className="space-y-5 max-w-full overflow-hidden">
      {/* Header - Fully Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">Tournaments & Events</h2>
            <p className="text-xs text-white/50">Host, compete, and climb the arena rankings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCodeJoinModal(true)}
            className="border-white/10 text-white/80 hover:text-white hover:bg-white/5 text-xs font-bold h-9"
          >
            <Key className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Enter with Code
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs h-9 shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Host Tournament
          </Button>
        </div>
      </div>

      {/* Host Tournament Form - Responsive Full Control Modal / Card */}
      {showCreateForm && (
        <div className="arena-card rounded-2xl p-4 sm:p-6 border border-purple-500/30 bg-black/60 backdrop-blur-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-base sm:text-lg font-black text-white">Host New Event Tournament</h3>
            </div>
            <button onClick={() => setShowCreateForm(false)} className="text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* 1. Name */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Tournament Title
              </label>
              <Input
                placeholder="e.g. Master Code Clash 2026"
                autoComplete="off"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-purple-500"
              />
            </div>

            {/* 2. Responsive Grid for Game Mode, Difficulty, Players, Prize */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Game Mode */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                  Game Mode
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  {GAME_MODES.map(m => (
                    <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Players Count */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                  Player Slots
                </label>
                <select
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value={4}>4 Players (Semi + Final)</option>
                  <option value={8}>8 Players (Quarter + Semi + Final)</option>
                  <option value={16}>16 Players (Bracket 16)</option>
                  <option value={32}>32 Players (Grand Stage)</option>
                </select>
              </div>

              {/* Prize Pool */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                  Prize Pool (XP)
                </label>
                <select
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  {PRIZE_OPTIONS.map(pz => (
                    <option key={pz} value={pz}>🏆 {pz.toLocaleString()} XP</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Event Time Setting */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-white/80 block">
                Event Schedule Timing
              </label>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="timeType"
                    checked={formData.timeType === 'immediate'}
                    onChange={() => setFormData({ ...formData, timeType: 'immediate', scheduledTime: '' })}
                    className="accent-purple-500"
                  />
                  <span>Start when slots fill</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="timeType"
                    checked={formData.timeType === 'scheduled'}
                    onChange={() => setFormData({ ...formData, timeType: 'scheduled' })}
                    className="accent-purple-500"
                  />
                  <span>Schedule specific date & time</span>
                </label>
              </div>

              {formData.timeType === 'scheduled' && (
                <div className="pt-1">
                  <Input
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="bg-slate-900 border-white/20 text-white rounded-xl text-xs max-w-sm"
                  />
                </div>
              )}
            </div>

            {/* 4. Host Access & Password Protection Control */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Private Tournament Password Protection</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {formData.isPrivate && (
                <div className="pt-2">
                  <label className="text-[11px] text-white/60 block mb-1">Set Private Password (Players will require this password to enter)</label>
                  <Input
                    type="password"
                    placeholder="Enter private tournament password..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-slate-900 border-white/20 text-white rounded-xl text-xs max-w-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleCreateTournament}
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-11 rounded-xl"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
              Publish Tournament & Notify All Students
            </Button>
            <Button
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              className="border-white/10 text-white/70 h-11 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Bar - Horizontally Scrollable on Mobile */}
      <div className="flex gap-1.5 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
        {[
          { id: 'browse', label: 'Browse Events', icon: '🔍' },
          { id: 'my-tournaments', label: 'My Tournaments', icon: '📋', badge: myTournaments.length },
          { id: 'playing', label: 'Active Games', icon: '⚡', badge: activePlaying.length },
          { id: 'results', label: 'Results & Hall', icon: '🏆', badge: finished.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-black">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-white/40">Syncing arena tournaments...</span>
          </div>
        ) : activeTab === 'browse' ? (
          // Browse Tab
          activeTournaments.length === 0 ? (
            <div className="arena-card p-10 sm:p-14 text-center space-y-3 border border-white/5 bg-black/40">
              <Trophy className="w-12 h-12 text-yellow-500/30 mx-auto" />
              <h3 className="text-white font-bold text-base">No open tournaments available</h3>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                Be the first to host an event for your batch or click below to enter directly using an invite link or code!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Host Tournament
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCodeJoinModal(true)}
                  className="border-white/10 text-white text-xs font-bold"
                >
                  <Key className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Enter Invite Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTournaments.map(tournament => {
                const isHost = tournament.createdBy === user?.id
                return (
                  <div
                    key={tournament._id}
                    className={`arena-card rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${getTournamentColor(tournament.status)} border border-white/10 space-y-4 relative overflow-hidden`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-white text-base sm:text-lg leading-tight">{tournament.name}</h3>
                          {tournament.hasPassword && (
                            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Private
                            </Badge>
                          )}
                          {isHost && (
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                              👑 Host (You)
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/60 text-xs">
                          {tournament.mode.toUpperCase()} • {tournament.difficulty}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {getParticipationStatus(tournament)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{tournament.participants?.length || 0}/{tournament.maxParticipants} Players</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{tournament.prizeXP || tournament.prizePool} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{tournament.scheduledStartTime ? new Date(tournament.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Immediate'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleJoinTournament(tournament)}
                        disabled={actionLoading === tournament._id}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl shadow-md"
                      >
                        {actionLoading === tournament._id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : tournament.hasPassword ? (
                          <Lock className="w-3.5 h-3.5 mr-1.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {tournament.hasPassword ? 'Enter with Password' : 'Join Tournament'}
                      </Button>

                      {/* Direct invite link button */}
                      <button
                        onClick={() => handleCopyInviteLink(tournament)}
                        className="w-full text-center text-[11px] text-white/50 hover:text-white flex items-center justify-center gap-1.5 py-1"
                      >
                        {copiedCode === tournament._id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedCode === tournament._id ? 'Invite Link Copied!' : `Invite Code: ${tournament.inviteCode || 'Copy Link'}`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : activeTab === 'my-tournaments' ? (
          // My Tournaments Tab (With Host Controls)
          myTournaments.length === 0 ? (
            <div className="arena-card p-10 text-center text-white/50 space-y-3">
              <Trophy className="w-10 h-10 mx-auto text-white/20" />
              <p>You haven't joined or hosted any tournaments yet.</p>
              <Button size="sm" onClick={() => setActiveTab('browse')} className="bg-indigo-600 text-xs">
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTournaments.map(tournament => {
                const isHost = tournament.createdBy === user?.id
                return (
                  <div
                    key={tournament._id}
                    className="arena-card rounded-2xl p-4 sm:p-5 border border-white/10 bg-black/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{tournament.name}</h3>
                          {isHost && (
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                              👑 Hosting User
                            </Badge>
                          )}
                          <Badge className="bg-white/10 text-white/80 text-[10px]">
                            {tournament.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">
                          {tournament.mode.toUpperCase()} • {tournament.participants?.length}/{tournament.maxParticipants} players joined • Prize: {tournament.prizeXP || tournament.prizePool} XP
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {tournament.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => handleCopyInviteLink(tournament)}
                            variant="outline"
                            className="border-white/10 text-white/80 hover:text-white text-xs h-8"
                          >
                            {copiedCode === tournament._id ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                            {copiedCode === tournament._id ? 'Copied' : 'Share Link'}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTournament(tournament)
                            if (tournament.status === 'finished') {
                              setShowResults(true)
                            } else {
                              setShowGameMode(true)
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-8"
                        >
                          <Play className="w-3.5 h-3.5 mr-1" /> Open Bracket
                        </Button>
                      </div>
                    </div>

                    {/* Hosting User Only Controls Panel */}
                    {isHost && tournament.status === 'open' && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-purple-300 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> Hosting User Controls
                          </span>
                          <span className="font-mono text-[10px] text-white/60">
                            Invite Code: <strong className="text-white">{tournament.inviteCode}</strong>
                          </span>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                          {tournament.password ? (
                            <div className="text-[11px] text-amber-300 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Private Password: <code className="bg-black/60 px-1.5 py-0.5 rounded text-white font-mono">{tournament.password}</code>
                            </div>
                          ) : (
                            <span className="text-[11px] text-white/40">Public Tournament (Anyone with link/code can join)</span>
                          )}

                          <div className="flex items-center gap-2 ml-auto">
                            {tournament.participants?.length >= 2 && (
                              <Button
                                size="sm"
                                onClick={() => handleHostStartTournament(tournament._id)}
                                disabled={actionLoading === tournament._id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-7 px-2.5"
                              >
                                <Play className="w-3 h-3 mr-1" /> Start Now ({tournament.participants.length} Players)
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleHostCancelTournament(tournament._id)}
                              disabled={actionLoading === tournament._id}
                              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-7 px-2"
                            >
                              Cancel Event
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        ) : activeTab === 'playing' ? (
          // Playing Now Tab
          selectedTournament && showGameMode ? (
            <TournamentGame
              tournament={selectedTournament}
              user={user}
              onMatchComplete={handleMatchComplete}
            />
          ) : activePlaying.length === 0 ? (
            <div className="arena-card p-10 text-center text-white/50">
              No live active games in progress right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlaying.map(tournament => (
                <div key={tournament._id} className="arena-card rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-500/20 via-black to-black border border-amber-500/30 space-y-3">
                  <h3 className="font-black text-white text-lg">{tournament.name}</h3>
                  <p className="text-white/80 text-xs">Round {tournament.currentRound} • {tournament.participants?.length} Competitors</p>
                  
                  <Button
                    onClick={() => {
                      setSelectedTournament(tournament)
                      setShowGameMode(true)
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black text-xs h-9 rounded-xl"
                  >
                    <Zap className="w-4 h-4 mr-2" /> Enter Game Room
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : (
          // Results Tab
          finished.length === 0 ? (
            <div className="arena-card p-10 text-center text-white/50">
              No completed tournament results yet.
            </div>
          ) : (
            <div className="space-y-3">
              {finished.map(tournament => (
                <div key={tournament._id} className="arena-card rounded-xl p-4 flex items-center justify-between border border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex-1">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      {tournament.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">Winner: <strong className="text-yellow-300">{tournament.winnerName || 'Champion'}</strong> • Prize: {tournament.prizeXP || tournament.prizePool} XP</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTournament(tournament)
                      setShowResults(true)
                    }}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 text-xs font-bold"
                  >
                    View Results
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Code / Direct Link Quick Enter Modal */}
      {showCodeJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" /> Enter Tournament via Invite
              </h3>
              <button onClick={() => setShowCodeJoinModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Invite Code or Direct Link</label>
                <Input
                  placeholder="e.g. TRN-ABC123 or paste invite link..."
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Password (If tournament is private)</label>
                <Input
                  type="password"
                  placeholder="Leave empty if public..."
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleJoinViaCodeOrLink}
                disabled={actionLoading === "code_join"}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9 rounded-xl"
              >
                {actionLoading === "code_join" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Enter Tournament
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCodeJoinModal(false)}
                className="border-white/10 text-white/70 text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Prompt Modal for Protected Tournament */}
      {passwordPromptTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Private Tournament Password
              </h3>
              <button onClick={() => setPasswordPromptTournament(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              <strong>{passwordPromptTournament.name}</strong> is password protected. Enter the password set by the host to join.
            </p>

            {passwordError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {passwordError}
              </div>
            )}

            <Input
              type="password"
              placeholder="Enter password..."
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinTournament(passwordPromptTournament, enteredPassword)}
              className="bg-white/5 border-white/10 text-white rounded-xl text-xs"
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleJoinTournament(passwordPromptTournament, enteredPassword)}
                disabled={actionLoading === passwordPromptTournament._id || !enteredPassword}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9 rounded-xl"
              >
                {actionLoading === passwordPromptTournament._id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Join Tournament
              </Button>
              <Button
                variant="outline"
                onClick={() => setPasswordPromptTournament(null)}
                className="border-white/10 text-white/70 text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && selectedTournament && (
        <TournamentResult
          tournament={selectedTournament}
          onClose={() => {
            setShowResults(false)
            setSelectedTournament(null)
          }}
          onDestroyRoom={() => {
            fetchTournaments()
            setShowResults(false)
            setSelectedTournament(null)
          }}
        />
      )}
    </div>
  )
}
