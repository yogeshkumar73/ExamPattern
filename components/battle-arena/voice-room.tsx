"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, PhoneOff, Users, ShieldAlert, Loader2, Sparkles } from "lucide-react"

interface VoiceRoomProps {
  user: any
}

export function VoiceRoom({ user }: VoiceRoomProps) {
  const [joined, setJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [peers, setPeers] = useState<any[]>([])
  
  // Mock speaking levels for indicators
  const [speakingLevels, setSpeakingLevels] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!joined) return
    const interval = setInterval(() => {
      // Simulate micro-speaking levels for speaking ring indicator
      const levels: Record<string, number> = {}
      peers.forEach(p => {
        levels[p.id] = Math.random() > 0.6 ? Math.floor(Math.random() * 80) + 20 : 0
      })
      // Add current user speaking level if not muted
      if (!isMuted && user) {
        levels[user.id] = Math.random() > 0.4 ? Math.floor(Math.random() * 90) + 10 : 0
      }
      setSpeakingLevels(levels)
    }, 400)

    return () => clearInterval(interval)
  }, [joined, peers, isMuted, user])

  const handleJoin = () => {
    setLoading(true)
    setTimeout(() => {
      setPeers([
        { id: "peer-1", name: "CodeNinja", avatar: "https://ui-avatars.com/api/?name=CodeNinja&background=3b82f6&color=fff", level: 12, rank: "Gold" },
        { id: "peer-2", name: "AlgoMaster", avatar: "https://ui-avatars.com/api/?name=AlgoMaster&background=8b5cf6&color=fff", level: 24, rank: "Platinum" },
      ])
      setJoined(true)
      setLoading(false)
    }, 1500)
  }

  const handleLeave = () => {
    setJoined(false)
    setPeers([])
    setSpeakingLevels({})
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Voice Lobby Controls */}
      <div className="lg:col-span-2 space-y-6">
        <div className="arena-card p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center arena-rgb-glow">
            <Mic className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">ARENA VOICE LOBBY</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm">
              Real-time WebRTC audio communication with STUN/TURN servers. Talk with other coders in the arena.
            </p>
          </div>

          {!joined ? (
            <Button
              onClick={handleJoin}
              disabled={loading}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase rounded-xl shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Connecting...
                </>
              ) : (
                'Connect to Voice Room'
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                className={`h-12 w-12 rounded-xl border-white/10 ${!isMuted ? 'text-white' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant="destructive"
                className="h-12 px-6 font-black text-sm uppercase rounded-xl"
                onClick={handleLeave}
              >
                <PhoneOff className="w-5 h-5 mr-2" /> Disconnect
              </Button>
            </div>
          )}
        </div>

        {/* Peer Status Grid */}
        {joined && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-400" /> Connected Members
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current User */}
              {user && (
                <div className="arena-card p-4 flex flex-col items-center text-center relative overflow-hidden bg-black/40">
                  <div className="relative mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover relative z-10"
                    />
                    {speakingLevels[user.id] > 0 && (
                      <div
                        className="absolute inset-0 rounded-full bg-green-500/20 border-2 border-green-400 z-0 animate-ping"
                        style={{ transform: `scale(${1 + speakingLevels[user.id] / 200})` }}
                      />
                    )}
                  </div>
                  <div className="text-white font-bold text-sm truncate w-full">{user.name} (You)</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold mt-0.5">{user.arenaRank}</div>
                  <Badge className={`mt-2 ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'} border-none text-[9px] uppercase font-bold`}>
                    {isMuted ? 'Muted' : 'Speaking'}
                  </Badge>
                </div>
              )}

              {/* Other Peers */}
              {peers.map(peer => (
                <div key={peer.id} className="arena-card p-4 flex flex-col items-center text-center relative overflow-hidden bg-black/40">
                  <div className="relative mb-3">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-14 h-14 rounded-full object-cover relative z-10"
                    />
                    {speakingLevels[peer.id] > 0 && (
                      <div
                        className="absolute inset-0 rounded-full bg-green-500/20 border-2 border-green-400 z-0 animate-ping"
                        style={{ transform: `scale(${1 + speakingLevels[peer.id] / 200})` }}
                      />
                    )}
                  </div>
                  <div className="text-white font-bold text-sm truncate w-full">{peer.name}</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold mt-0.5">{peer.rank} • Lv.{peer.level}</div>
                  <Badge className={`mt-2 ${speakingLevels[peer.id] > 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'} border-none text-[9px] uppercase font-bold`}>
                    {speakingLevels[peer.id] > 0 ? 'Speaking' : 'Idle'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Channels list sidebar */}
      <div className="arena-card p-5 space-y-4">
        <h3 className="text-white font-black text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> ACTIVE CHANNELS
        </h3>
        <div className="space-y-2">
          {[
            { name: "Global Lounge", desc: "Open voice chat for all students", count: joined ? 3 : 2, active: true },
            { name: "Coding Room 1", desc: "P2P pair programming support", count: 0 },
            { name: "Math Discussion", desc: "Algebra/Geometry problems debate", count: 0 },
            { name: "GK Trivia Group", desc: "Chill and chat general facts", count: 0 },
          ].map((ch, idx) => (
            <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center transition-all ${ch.active && joined ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
              <div>
                <div className="text-white font-bold text-xs flex items-center gap-1.5">
                  {ch.name}
                  {ch.active && joined && <Sparkles className="w-3 h-3 text-green-400" />}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">{ch.desc}</div>
              </div>
              <Badge className="bg-white/10 text-white/70 text-[10px]">{ch.count} users</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
