"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, X, Sparkles, CheckCircle2, ShieldCheck, Flame } from "lucide-react"

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
  const firstWinner = rankings[0]
  const secondRunnerUp = rankings[1]

  const firstCoins = tournament.firstPrizeCoins || 200
  const firstBadge = tournament.firstPrizeBadge || "👑 Tournament Grand Champion"
  const secondCoins = tournament.secondPrizeCoins || 100
  const secondBadge = tournament.secondPrizeBadge || "🥈 Elite Runner-Up"

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-purple-500/30 shadow-2xl bg-slate-950">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/20 text-black font-black">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">Official Tournament Match Complete</div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{tournament.name}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tournament Quick Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Mode</span>
              <span className="font-black text-purple-300 uppercase">{tournament.mode}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Participants</span>
              <span className="font-black text-white">{tournament.participants?.length || rankings.length} Players</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Host Room Code</span>
              <span className="font-mono font-bold text-amber-300">#{tournament.inviteCode || "TRN-LIVE"}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Prize Pool</span>
              <span className="font-black text-emerald-400">{firstCoins + secondCoins} Coins</span>
            </div>
          </div>

          {/* ── PODIUM CEREMONY: 1st Winner & 2nd Runner-Up ──────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1st Place Champion */}
            {firstWinner && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-black border-2 border-amber-500/50 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs px-2.5 py-0.5">
                    🥇 1ST PLACE WINNER
                  </Badge>
                  <span className="text-amber-300 text-xs font-mono font-black">{firstWinner.finalScore} PTS</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-amber-500/20 flex items-center justify-center font-black text-base text-amber-300">
                    {firstWinner.userAvatar ? (
                      <img src={firstWinner.userAvatar} alt={firstWinner.userName} className="w-full h-full object-cover" />
                    ) : (
                      firstWinner.userName?.charAt(0) || "W"
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white truncate">{firstWinner.userName}</h3>
                    <div className="text-[11px] text-amber-300/80 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Grand Champion
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-200">Awarded: +{firstCoins} Coins</span>
                  <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-400/40">
                    {firstBadge}
                  </Badge>
                </div>
              </div>
            )}

            {/* 2nd Place Runner-Up */}
            {secondRunnerUp && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-400/20 via-slate-900 to-black border-2 border-slate-400/40 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gradient-to-r from-slate-300 to-slate-400 text-black font-black text-xs px-2.5 py-0.5">
                    🥈 2ND PLACE RUNNER-UP
                  </Badge>
                  <span className="text-slate-300 text-xs font-mono font-black">{secondRunnerUp.finalScore} PTS</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full ring-2 ring-slate-400 overflow-hidden bg-slate-400/20 flex items-center justify-center font-black text-base text-slate-200">
                    {secondRunnerUp.userAvatar ? (
                      <img src={secondRunnerUp.userAvatar} alt={secondRunnerUp.userName} className="w-full h-full object-cover" />
                    ) : (
                      secondRunnerUp.userName?.charAt(0) || "R"
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white truncate">{secondRunnerUp.userName}</h3>
                    <div className="text-[11px] text-slate-300/80 font-bold flex items-center gap-1">
                      <Medal className="w-3 h-3 text-slate-300" /> Elite Finalist
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-400/10 border border-slate-400/30 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Awarded: +{secondCoins} Coins</span>
                  <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-400/40">
                    {secondBadge}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Prize Settlement Confirmation Notice */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Prize distribution verified: 1st Place credited <strong>{firstCoins} Coins</strong>; 2nd Place credited <strong>{secondCoins} Coins</strong>.</span>
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 font-mono">
              Debited & Settled
            </Badge>
          </div>

          {/* ── COMPLETE COMPARATIVE LEADERBOARD ───────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Complete Participant Comparison
            </h3>

            {rankings.length === 0 ? (
              <div className="text-center py-6 text-white/50 text-xs">No rankings available</div>
            ) : (
              <div className="space-y-2">
                {rankings.map((rank: any, idx: number) => {
                  const isFirst = idx === 0
                  const isSecond = idx === 1
                  const isThird = idx === 2

                  return (
                    <div
                      key={rank.userId || idx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition ${
                        isFirst
                          ? "bg-amber-500/10 border-amber-500/40"
                          : isSecond
                          ? "bg-slate-400/10 border-slate-400/40"
                          : isThird
                          ? "bg-amber-800/10 border-amber-700/30"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs text-white flex-shrink-0">
                          {isFirst ? "🥇" : isSecond ? "🥈" : isThird ? "🥉" : `#${idx + 1}`}
                        </div>

                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                          {rank.userAvatar ? (
                            <img src={rank.userAvatar} alt={rank.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-white text-[10px]">{rank.userName?.charAt(0) || "U"}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-black text-white truncate flex items-center gap-1.5">
                            <span>{rank.userName}</span>
                            {isFirst && <Badge className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0 border-none">Champion</Badge>}
                            {isSecond && <Badge className="bg-slate-400/20 text-slate-300 text-[9px] px-1.5 py-0 border-none">Runner-Up</Badge>}
                          </div>
                          <span className="text-[10px] text-white/40 font-mono">Rank #{idx + 1}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4 flex-shrink-0">
                        <div>
                          <div className="font-black text-sm text-purple-300 font-mono">{rank.finalScore} PTS</div>
                          <div className="text-[10px] text-white/40">Score</div>
                        </div>

                        {isFirst ? (
                          <Badge className="bg-amber-500 text-black font-black text-[10px]">+{firstCoins} Coins</Badge>
                        ) : isSecond ? (
                          <Badge className="bg-slate-300 text-black font-black text-[10px]">+{secondCoins} Coins</Badge>
                        ) : (
                          <Badge variant="outline" className="text-white/40 border-white/10 text-[10px]">Completed</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 rounded-xl text-xs shadow-lg"
            >
              Back to Tournaments Lobby
            </Button>
            <Button
              onClick={handleDestroyRoom}
              disabled={destroying}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold h-11 rounded-xl text-xs"
            >
              {destroying ? "Closing..." : "Close & Auto-Clean Room"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
