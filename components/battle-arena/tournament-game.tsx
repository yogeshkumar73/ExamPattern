"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Swords, CheckCircle, XCircle, Clock, Loader2, Play, Trophy } from "lucide-react"

interface TournamentGameProps {
  tournament: any
  user: any
  onMatchComplete: (round: number, match: number, winnerId: string, score1: number, score2: number) => void
}

export function TournamentGame({ tournament, user, onMatchComplete }: TournamentGameProps) {
  const [activeMatch, setActiveMatch] = useState<any>(null)
  const [matchStarted, setMatchStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes per match
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Find first pending match for current round
  useEffect(() => {
    if (tournament?.bracket) {
      const pending = tournament.bracket.find(
        (m: any) => 
          m.status === 'pending' && 
          (m.player1Id === user?.id || m.player2Id === user?.id)
      )
      setActiveMatch(pending)
      if (pending?.status === 'active') {
        setMatchStarted(true)
      }
    }
  }, [tournament, user])

  // Countdown timer
  useEffect(() => {
    if (!matchStarted || !activeMatch) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Auto-submit when time's up
          handleSubmitMatch('timeout')
          return 300
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [matchStarted, activeMatch])

  const handleStartMatch = async () => {
    if (!activeMatch) return
    setMatchStarted(true)
    setTimeLeft(300)
    setPlayer1Score(0)
    setPlayer2Score(0)

    try {
      await fetch('/api/arena/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: tournament._id,
          round: activeMatch.round,
          match: activeMatch.match,
          action: 'start',
        })
      })
    } catch (e) {
      console.error('Failed to start match:', e)
    }
  }

  const handleSubmitMatch = async (reason = 'completed') => {
    if (!activeMatch || submitting) return
    setSubmitting(true)

    try {
      const winnerId = player1Score > player2Score ? activeMatch.player1Id : activeMatch.player2Id
      await fetch('/api/arena/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: tournament._id,
          round: activeMatch.round,
          match: activeMatch.match,
          winnerId,
          player1Score,
          player2Score,
        })
      })

      onMatchComplete(activeMatch.round, activeMatch.match, winnerId, player1Score, player2Score)
      setMatchStarted(false)
      setPlayer1Score(0)
      setPlayer2Score(0)
    } catch (e) {
      console.error('Failed to submit match:', e)
    }
    setSubmitting(false)
  }

  if (!activeMatch || !tournament?.status === 'active') {
    return (
      <div className="arena-card rounded-2xl p-6 text-center space-y-3">
        <p className="text-white/60">No active matches for you right now</p>
      </div>
    )
  }

  const player1 = tournament.participants.find((p: any) => p.userId === activeMatch.player1Id)
  const player2 = tournament.participants.find((p: any) => p.userId === activeMatch.player2Id)
  const isPlayer1 = user?.id === activeMatch.player1Id

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Match Header */}
      <div className="arena-card rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-white">
            Round {activeMatch.round} • Match {activeMatch.match}
          </span>
        </div>
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          {tournament.mode.toUpperCase()}
        </Badge>
      </div>

      {/* Match Arena */}
      <div className="arena-card rounded-2xl p-6 space-y-4">
        {/* Players Section */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Player 1 */}
          <div className={`p-4 rounded-xl text-center space-y-2 ${isPlayer1 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5'}`}>
            <img
              src={player1?.avatar || 'https://ui-avatars.com/api/?name=Player1'}
              alt={player1?.name}
              className="w-16 h-16 rounded-full mx-auto object-cover"
            />
            <p className="font-bold text-white text-sm truncate">{player1?.name}</p>
            <p className="text-2xl font-black text-white">{player1Score}</p>
          </div>

          {/* vs */}
          <div className="text-center">
            <p className="text-white/40 font-bold text-sm">VS</p>
            {matchStarted && (
              <p className="text-xl font-black text-yellow-400">{formatTime(timeLeft)}</p>
            )}
          </div>

          {/* Player 2 */}
          <div className={`p-4 rounded-xl text-center space-y-2 ${!isPlayer1 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5'}`}>
            <img
              src={player2?.avatar || 'https://ui-avatars.com/api/?name=Player2'}
              alt={player2?.name}
              className="w-16 h-16 rounded-full mx-auto object-cover"
            />
            <p className="font-bold text-white text-sm truncate">{player2?.name}</p>
            <p className="text-2xl font-black text-white">{player2Score}</p>
          </div>
        </div>

        {!matchStarted ? (
          // Ready State
          <Button
            onClick={handleStartMatch}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> Start Match
          </Button>
        ) : (
          // Active Match Controls
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-sm text-white/60">Player 1 Score</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPlayer1Score(Math.max(0, player1Score - 1))}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    -
                  </Button>
                  <div className="flex-1 bg-white/10 rounded-lg flex items-center justify-center text-xl font-black text-white">
                    {player1Score}
                  </div>
                  <Button
                    onClick={() => setPlayer1Score(player1Score + 1)}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white/60">Player 2 Score</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPlayer2Score(Math.max(0, player2Score - 1))}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    -
                  </Button>
                  <div className="flex-1 bg-white/10 rounded-lg flex items-center justify-center text-xl font-black text-white">
                    {player2Score}
                  </div>
                  <Button
                    onClick={() => setPlayer2Score(player2Score + 1)}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSubmitMatch('completed')}
              disabled={submitting || player1Score === player2Score}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" /> Submit Result
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Match Status */}
      <div className="text-sm text-white/50 text-center">
        {!matchStarted ? (
          <p>Both players must be ready to start</p>
        ) : (
          <p>
            {timeLeft < 60 && timeLeft > 0
              ? `⚠️ ${formatTime(timeLeft)} remaining`
              : `Time: ${formatTime(timeLeft)}`}
          </p>
        )}
      </div>
    </div>
  )
}
