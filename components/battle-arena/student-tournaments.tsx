"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Trophy, Users, Plus, Loader2, Play, Clock, Target, User,
  ChevronRight, Lock, Calendar, Zap, Award
} from "lucide-react"
import { TournamentGame } from "./tournament-game"
import { TournamentResult } from "./tournament-result"

interface StudentTournamentsProps {
  user: any
}

const GAME_MODES = [
  { id: 'coding', label: 'Coding', icon: '💻', color: 'from-blue-600 to-cyan-500' },
  { id: 'math', label: 'Math', icon: '🔢', color: 'from-green-600 to-teal-500' },
  { id: 'puzzle', label: 'Puzzle', icon: '🧩', color: 'from-purple-600 to-pink-500' },
  { id: 'gk', label: 'GK', icon: '🧠', color: 'from-yellow-600 to-orange-500' },
]

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: '#22c55e' },
  { id: 'intermediate', label: 'Intermediate', color: '#3b82f6' },
  { id: 'advanced', label: 'Advanced', color: '#8b5cf6' },
]

export function StudentTournaments({ user }: StudentTournamentsProps) {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('browse') // browse, my-tournaments, playing, results
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGameMode, setShowGameMode] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<any>(null)

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    mode: 'coding',
    difficulty: 'intermediate',
    maxParticipants: 8,
  })

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/arena/tournaments')
      if (!res.ok) return
      const data = await res.json()
      if (data.tournaments) setTournaments(data.tournaments)
    } catch (e) {
      console.error('Failed to fetch tournaments:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTournaments()
    const interval = setInterval(fetchTournaments, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateTournament = async () => {
    if (!formData.name.trim()) {
      alert('Please enter tournament name')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: formData.name,
          mode: formData.mode,
          difficulty: formData.difficulty,
          maxParticipants: formData.maxParticipants,
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar,
        })
      })
      const data = await res.json()
      if (data.success) {
        setFormData({ name: '', mode: 'coding', difficulty: 'intermediate', maxParticipants: 8 })
        setShowCreateForm(false)
        fetchTournaments()
      } else {
        alert(data.error || 'Failed to create tournament')
      }
    } catch (e) {
      console.error('Failed to create tournament:', e)
      alert('Error creating tournament')
    }
    setCreating(false)
  }

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      const res = await fetch('/api/arena/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          tournamentId,
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar,
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchTournaments()
      } else {
        alert(data.error || 'Failed to join tournament')
      }
    } catch (e) {
      console.error('Failed to join tournament:', e)
      alert('Error joining tournament')
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
    if (status === 'open') return 'from-green-500 to-emerald-500'
    if (status === 'active') return 'from-yellow-500 to-orange-500'
    return 'from-gray-500 to-slate-500'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-black text-white">Tournaments</h2>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Host Tournament
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="arena-card rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Create Tournament</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-white/60">Tournament Name</label>
              <Input
                placeholder="e.g. Code Jam Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-white/60">Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full mt-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
                >
                  {GAME_MODES.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full mt-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60">Players</label>
                <select
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="w-full mt-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value={4}>4 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={16}>16 Players</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCreateTournament}
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Tournament
            </Button>
            <Button
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              className="flex-1 border-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'browse', label: 'Browse', icon: '🔍' },
          { id: 'my-tournaments', label: 'My Tournaments', icon: '📋', badge: myTournaments.length },
          { id: 'playing', label: 'Playing Now', icon: '⚡', badge: activePlaying.length },
          { id: 'results', label: 'Results', icon: '🏆', badge: finished.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-white border-b-indigo-500'
                : 'text-white/60 border-b-transparent hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <Badge className="bg-red-500 text-white">{tab.badge}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : activeTab === 'browse' ? (
          // Browse Active Tournaments
          activeTournaments.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No tournaments available. Create one or check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTournaments.map(tournament => (
                <div key={tournament._id} className={`arena-card rounded-2xl p-4 bg-gradient-to-br ${getTournamentColor(tournament.status)} space-y-3`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">{tournament.name}</h3>
                      <p className="text-white/70 text-sm">{tournament.mode.toUpperCase()} • {tournament.difficulty}</p>
                    </div>
                    <Badge className="bg-white/20 text-white">{getParticipationStatus(tournament)}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tournament.participants?.length || 0}/{tournament.maxParticipants}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {tournament.prizeXP} XP
                    </div>
                  </div>

                  <Button
                    onClick={() => handleJoinTournament(tournament._id)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                  >
                    <Play className="w-4 h-4 mr-2" /> Join Tournament
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'my-tournaments' ? (
          // My Tournaments
          myTournaments.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              You haven't joined any tournaments yet
            </div>
          ) : (
            <div className="space-y-3">
              {myTournaments.map(tournament => (
                <div key={tournament._id} className="arena-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{tournament.name}</h3>
                    <p className="text-sm text-white/60">
                      {tournament.mode.toUpperCase()} • {tournament.participants?.length}/{tournament.maxParticipants} players
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedTournament(tournament)
                      if (tournament.status === 'finished') {
                        setShowResults(true)
                      } else {
                        setShowGameMode(true)
                      }
                    }}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'playing' ? (
          // Playing Now
          selectedTournament && showGameMode ? (
            <TournamentGame
              tournament={selectedTournament}
              user={user}
              onMatchComplete={handleMatchComplete}
            />
          ) : activePlaying.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No active games right now
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlaying.map(tournament => (
                <div key={tournament._id} className="arena-card rounded-2xl p-4 bg-gradient-to-br from-yellow-500 to-orange-500 space-y-3">
                  <h3 className="font-bold text-white text-lg">{tournament.name}</h3>
                  <p className="text-white/90 text-sm">Round {tournament.currentRound} • {tournament.participants?.length} competitors</p>
                  
                  <Button
                    onClick={() => {
                      setSelectedTournament(tournament)
                      setShowGameMode(true)
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                  >
                    <Zap className="w-4 h-4 mr-2" /> Play Now
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : (
          // Results
          finished.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No finished tournaments yet
            </div>
          ) : (
            <div className="space-y-3">
              {finished.map(tournament => (
                <div key={tournament._id} className="arena-card rounded-xl p-4 flex items-center justify-between border border-yellow-500/20">
                  <div className="flex-1">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-white/60">Winner: {tournament.winnerName}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedTournament(tournament)
                      setShowResults(true)
                    }}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300"
                  >
                    View Results
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

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
