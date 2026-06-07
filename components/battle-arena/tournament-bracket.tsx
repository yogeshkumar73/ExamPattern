"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Shield, Calendar, Users, Swords, Play, Plus, Loader2 } from "lucide-react"

interface TournamentBracketProps {
  user: any
}

export function TournamentBracket({ user }: TournamentBracketProps) {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [activeTournament, setActiveTournament] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [tName, setTName] = useState("")
  const [tMode, setTMode] = useState("coding")
  const [tDifficulty, setTDifficulty] = useState("intermediate")
  const [tMax, setTMax] = useState(8)

  const fetchTournaments = async () => {
    try {
      const res = await fetch("/api/arena/tournaments")
      if (!res.ok) {
        console.error("Failed to fetch tournaments:", res.status)
        return
      }
      const data = await res.json()
      if (data.tournaments) setTournaments(data.tournaments)
    } catch (e) {
      console.error("Failed to fetch tournaments:", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTournaments()
    const interval = setInterval(fetchTournaments, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async () => {
    if (!tName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/arena/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: tName,
          mode: tMode,
          difficulty: tDifficulty,
          maxParticipants: tMax,
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar,
        })
      })
      const data = await res.json()
      if (data.success) {
        setTName("")
        fetchTournaments()
      }
    } catch (e) {
      console.error("Failed to create tournament:", e)
    }
    setCreating(false)
  }

  const handleJoin = async (id: string) => {
    try {
      const res = await fetch("/api/arena/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          tournamentId: id,
          userId: user?.id,
          userName: user?.name,
          avatar: user?.avatar,
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchTournaments()
        if (activeTournament?._id === id) {
          setActiveTournament(data.tournament)
        }
      } else {
        alert(data.error || "Failed to join tournament")
      }
    } catch (e) {
      console.error("Failed to join tournament:", e)
      alert("Error joining tournament")
    }
  }

  const handleSimulateMatch = async (tournamentId: string, round: number, match: number, winnerId: string) => {
    try {
      const res = await fetch("/api/arena/tournaments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, round, match, winnerId })
      })
      const data = await res.json()
      if (data.success) {
        setActiveTournament(data.tournament)
        fetchTournaments()
      } else {
        alert(data.error || "Failed to submit match result")
      }
    } catch (e) {
      console.error("Failed to submit match result:", e)
      alert("Error submitting match result")
    }
  }

  const renderBracket = (t: any) => {
    // Standard 8 player bracket renderer
    const round1 = t.bracket.filter((m: any) => m.round === 1)
    const round2 = t.bracket.filter((m: any) => m.round === 2)
    const round3 = t.bracket.filter((m: any) => m.round === 3)

    const getPlayerName = (uid: string | null) => {
      if (!uid) return "TBD"
      const p = t.participants.find((p: any) => p.userId === uid)
      return p ? p.name : "Unknown Player"
    }

    const MatchCard = ({ matchObj }: { matchObj: any }) => {
      const isWinner = (uid: string | null) => matchObj.winnerId && matchObj.winnerId === uid
      const isLoser = (uid: string | null) => matchObj.winnerId && matchObj.winnerId !== uid

      return (
        <div className="arena-card p-3 w-56 space-y-2 relative border border-white/10 bg-black/40">
          <div className="text-[10px] text-white/40 font-bold">MATCH {matchObj.match}</div>
          <div className="space-y-1">
            <div className={`flex justify-between items-center text-xs p-1.5 rounded-lg ${isWinner(matchObj.player1Id) ? 'bg-green-500/10 text-green-400 font-bold' : isLoser(matchObj.player1Id) ? 'text-white/30 line-through' : 'text-white/80'}`}>
              <span>{getPlayerName(matchObj.player1Id)}</span>
              {isWinner(matchObj.player1Id) && <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
            </div>
            <div className={`flex justify-between items-center text-xs p-1.5 rounded-lg ${isWinner(matchObj.player2Id) ? 'bg-green-500/10 text-green-400 font-bold' : isLoser(matchObj.player2Id) ? 'text-white/30 line-through' : 'text-white/80'}`}>
              <span>{getPlayerName(matchObj.player2Id)}</span>
              {isWinner(matchObj.player2Id) && <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
            </div>
          </div>
          {matchObj.status === 'pending' && matchObj.player1Id && matchObj.player2Id && user && (
            <div className="flex gap-1 pt-1">
              <Button size="sm" className="h-6 text-[10px] font-black w-1/2 bg-indigo-600" onClick={() => handleSimulateMatch(t._id, matchObj.round, matchObj.match, matchObj.player1Id)}>
                P1 Win
              </Button>
              <Button size="sm" className="h-6 text-[10px] font-black w-1/2 bg-violet-600" onClick={() => handleSimulateMatch(t._id, matchObj.round, matchObj.match, matchObj.player2Id)}>
                P2 Win
              </Button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-black text-white">{t.name}</h3>
            <p className="text-xs text-white/50">{t.mode.toUpperCase()} • {t.difficulty.toUpperCase()} • Prize: {t.prizeXP} XP</p>
          </div>
          <Button variant="outline" className="border-white/10 text-white/70" onClick={() => setActiveTournament(null)}>
            Back to List
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-10 overflow-x-auto min-w-[600px]">
          {/* Round 1 */}
          <div className="space-y-8 flex flex-col justify-around h-[400px]">
            <div className="text-center font-bold text-xs text-indigo-400 tracking-widest uppercase">Round 1 (Quarter)</div>
            {round1.map((m: any) => <MatchCard key={m._id || m.match} matchObj={m} />)}
          </div>

          {/* Round 2 */}
          <div className="space-y-16 flex flex-col justify-around h-[400px]">
            <div className="text-center font-bold text-xs text-violet-400 tracking-widest uppercase">Round 2 (Semi)</div>
            {round2.map((m: any) => <MatchCard key={m._id || m.match} matchObj={m} />)}
          </div>

          {/* Round 3 */}
          <div className="space-y-24 flex flex-col justify-around h-[400px]">
            <div className="text-center font-bold text-xs text-yellow-400 tracking-widest uppercase">Round 3 (Finals)</div>
            {round3.map((m: any) => <MatchCard key={m._id || m.match} matchObj={m} />)}
          </div>
        </div>

        {t.status === 'finished' && (
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-center space-y-3">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
            <h4 className="text-2xl font-black text-white">TOURNAMENT WINNER</h4>
            <div className="text-xl font-bold text-yellow-400">{getPlayerName(t.winnerId)}</div>
            <p className="text-xs text-white/50">Winner awarded +{t.prizeXP} XP & Gold Crown badge 👑</p>
          </div>
        )}
      </div>
    )
  }

  if (activeTournament) {
    return (
      <div className="arena-card p-6">
        {renderBracket(activeTournament)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Active/Open Tournaments */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> LIVE TOURNAMENTS
          </h2>
          <span className="text-xs text-white/40 font-bold">{tournaments.length} events open</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="arena-card p-10 text-center text-white/40 font-medium">
            No active tournaments. Create one below to challenge other students!
          </div>
        ) : (
          <div className="grid gap-3">
            {tournaments.map((t: any) => {
              const joined = t.participants.some((p: any) => p.userId === user?.id)
              const count = t.participants.length
              const isFull = count >= t.maxParticipants

              return (
                <div key={t._id} className="arena-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 bg-black/40 hover:border-white/10 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-black">{t.name}</h3>
                      <Badge className="bg-indigo-600 text-white text-[10px] uppercase font-bold">{t.mode}</Badge>
                      <Badge className="bg-white/10 text-white/70 text-[10px] capitalize font-bold">{t.status}</Badge>
                    </div>
                    <p className="text-xs text-white/50">Difficulty: {t.difficulty.toUpperCase()} | Max: {t.maxParticipants} players</p>
                    <div className="flex items-center gap-4 text-[11px] text-white/40 font-bold pt-1">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {count}/{t.maxParticipants} Registered</span>
                      <span>Prize: {t.prizeXP} XP</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-initial border-white/10 text-white" onClick={() => setActiveTournament(t)}>
                      View Bracket
                    </Button>
                    {t.status === 'open' && (
                      <Button
                        disabled={joined || isFull}
                        className={`flex-1 md:flex-initial font-bold ${joined ? 'bg-green-600/20 text-green-400' : isFull ? 'bg-white/10 text-white/40' : 'bg-indigo-600'}`}
                        onClick={() => handleJoin(t._id)}
                      >
                        {joined ? 'Registered' : isFull ? 'Full' : 'Join Event'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: Host Tournament Card */}
      <div className="arena-card p-5 space-y-4">
        <h3 className="text-white font-black text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" /> HOST TOURNAMENT
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40 font-bold uppercase">Event Name</label>
            <input
              type="text"
              placeholder="e.g. Code Jam Pro"
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 font-bold uppercase">Game Mode</label>
            <select
              value={tMode}
              onChange={(e) => setTMode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="coding" className="bg-black">Coding Battle</option>
              <option value="math" className="bg-black">Math Battle</option>
              <option value="puzzle" className="bg-black">Puzzle Battle</option>
              <option value="gk" className="bg-black">GK Quiz</option>
              <option value="prediction" className="bg-black">Prediction Game</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 font-bold uppercase">Difficulty</label>
            <select
              value={tDifficulty}
              onChange={(e) => setTDifficulty(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="beginner" className="bg-black">Beginner</option>
              <option value="intermediate" className="bg-black">Intermediate</option>
              <option value="advanced" className="bg-black">Advanced</option>
              <option value="expert" className="bg-black">Expert</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 font-bold uppercase">Participants Limit</label>
            <select
              value={tMax}
              onChange={(e) => setTMax(parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="4" className="bg-black">4 Players (Semi + Final)</option>
              <option value="8" className="bg-black">8 Players (Quarter + Semi + Final)</option>
            </select>
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating || !tName.trim()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider rounded-xl mt-4"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Swords className="w-4 h-4 mr-2" />}
            Host Tournament
          </Button>
        </div>
      </div>
    </div>
  )
}
