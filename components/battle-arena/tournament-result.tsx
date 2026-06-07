"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, X } from "lucide-react"

interface TournamentResultProps {
  tournament: any
  onClose: () => void
  onDestroyRoom: () => void
}

export function TournamentResult({ tournament, onClose, onDestroyRoom }: TournamentResultProps) {
  const [destroying, setDestroying] = useState(false)

  const handleDestroyRoom = async () => {
    setDestroying(true)
    try {
      await fetch(`/api/arena/tournaments/finish?id=${tournament._id}`, { method: 'DELETE' })
      onDestroyRoom()
    } catch (e) {
      console.error('Failed to destroy room:', e)
    }
    setDestroying(false)
  }

  const rankings = tournament.rankings || []
  const medalIcons = [
    { icon: '🥇', color: 'from-yellow-500 to-yellow-600', label: 'Champion' },
    { icon: '🥈', color: 'from-slate-400 to-slate-500', label: 'Runner-up' },
    { icon: '🥉', color: 'from-orange-400 to-orange-500', label: 'Third Place' },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="arena-card rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-black text-white">Tournament Results</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tournament Info */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm text-white/70">
            <div className="flex justify-between">
              <span>Tournament:</span>
              <span className="font-bold">{tournament.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-bold uppercase">{tournament.mode}</span>
            </div>
            <div className="flex justify-between">
              <span>Participants:</span>
              <span className="font-bold">{tournament.participants?.length || 0}</span>
            </div>
          </div>

          {/* Rankings */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5" /> Final Rankings
            </h3>

            {rankings.length === 0 ? (
              <div className="text-center py-8 text-white/50">No rankings available</div>
            ) : (
              <div className="space-y-2">
                {rankings.map((rank: any, idx: number) => {
                  const medal = medalIcons[idx] || { icon: `#${idx + 1}`, color: 'from-gray-500 to-gray-600', label: `Place ${idx + 1}` }
                  const isMedal = idx < 3

                  return (
                    <div
                      key={rank.userId}
                      className={`rounded-lg p-4 flex items-center gap-4 ${
                        isMedal
                          ? `bg-gradient-to-r ${medal.color}`
                          : 'bg-white/5 hover:bg-white/10'
                      } transition`}
                    >
                      {/* Rank */}
                      <div className="text-3xl font-black w-12 text-center">
                        {isMedal ? medal.icon : `#${idx + 1}`}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          {rank.userAvatar && (
                            <img
                              src={rank.userAvatar}
                              alt={rank.userName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{rank.userName}</p>
                            <p className="text-xs text-white/50 truncate">ID: {rank.userId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{rank.finalScore}</p>
                        <p className="text-xs text-white/60">Points</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold"
            >
              Close
            </Button>
            <Button
              onClick={handleDestroyRoom}
              disabled={destroying}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold"
            >
              {destroying ? 'Destroying...' : 'Destroy Room'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
