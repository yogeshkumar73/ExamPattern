"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, PhoneOff, Users, Loader2, Sparkles } from "lucide-react"
import { io } from "socket.io-client"

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

const socket = io("http://localhost:3000"); // Adjust to your backend URL

interface VoiceRoomProps {
  user: { id: string; name: string; avatar: string; arenaRank?: string }
}

export function VoiceRoom({ user }: VoiceRoomProps) {
  const [joined, setJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [peers, setPeers] = useState<any[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({})
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({})
  const roomName = "global-lounge"
  const [speakingLevels, setSpeakingLevels] = useState<Record<string, number>>({})

  // Create or get existing PeerConnection for a peer
  const createPeerConnection = (peerId: string) => {
    if (peerConnections.current[peerId]) {
      return peerConnections.current[peerId]
    }

    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConnections.current[peerId] = pc

    // Add local audio tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", peerId, event.candidate)
      }
    }

    // Handle multiple tracks from the same peer by adding tracks to the same stream
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const currentStream = prev[peerId] || new MediaStream()
        currentStream.addTrack(event.track)
        return { ...prev, [peerId]: currentStream }
      })
    }

    return pc
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to signaling server")
    })

    socket.on("user-joined", (id: string) => {
      console.log("User joined:", id)
      setPeers(currentPeers => {
        if (!currentPeers.some(p => p.id === id)) {
          return [...currentPeers, { id, name: `Peer-${id.substring(0, 4)}`, avatar: "https://ui-avatars.com/api/?name=P&background=random&color=fff" }]
        }
        return currentPeers
      })

      createPeerConnection(id)

      // Existing users create offers to the joined user
      if (localStream) {
        const pc = createPeerConnection(id)
        pc.createOffer().then(offer => {
          pc.setLocalDescription(offer)
          socket.emit("offer", id, offer)
        })
      }
    })

    socket.on("user-left", (id: string) => {
      console.log("User left:", id)
      setPeers(currentPeers => currentPeers.filter(p => p.id !== id))

      if (peerConnections.current[id]) {
        peerConnections.current[id].close()
        delete peerConnections.current[id]
      }

      setRemoteStreams((streams) => {
        const updated = { ...streams }
        delete updated[id]
        return updated
      })
    })

    socket.on("offer", async (id: string, message: RTCSessionDescriptionInit) => {
      const pc = createPeerConnection(id)
      if (!pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(message))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit("answer", id, pc.localDescription)
      }
    })

    socket.on("answer", async (id: string, message: RTCSessionDescriptionInit) => {
      const pc = peerConnections.current[id]
      if (pc && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(message))
      }
    })

    socket.on("candidate", async (id: string, message: RTCIceCandidateInit) => {
      const pc = peerConnections.current[id]
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(message))
        } catch (error) {
          console.error("Error adding received ICE candidate", error)
        }
      }
    })

    return () => {
      socket.off("connect")
      socket.off("user-joined")
      socket.off("user-left")
      socket.off("offer")
      socket.off("answer")
      socket.off("candidate")

      Object.values(peerConnections.current).forEach(pc => pc.close())
      peerConnections.current = {}

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }

      socket.disconnect()
    }
  }, [localStream])

  const handleJoin = async () => {
    setLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setLocalStream(stream)
      setIsMuted(false)
      setJoined(true)
      socket.emit("join-voice-room", roomName, user.id)
    } catch (error) {
      console.error("Error accessing media devices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    Object.values(peerConnections.current).forEach(pc => pc.close())
    peerConnections.current = {}

    setRemoteStreams({})
    setPeers([])
    setJoined(false)
    socket.emit("leave-voice-room", roomName, user.id)
  }

  // Toggle mute/unmute
  const toggleMute = () => {
    if (localStream) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      localStream.getAudioTracks().forEach(track => track.enabled = !newMutedState)
    }
  }

  useEffect(() => {
    if (!joined) return

    const interval = setInterval(() => {
      const levels: Record<string, number> = {}

      peers.forEach(p => {
        levels[p.id] = Math.random() > 0.6 ? Math.floor(Math.random() * 80) + 20 : 0
      })

      if (!isMuted && user) {
        levels[user.id] = Math.random() > 0.4 ? Math.floor(Math.random() * 90) + 10 : 0
      } else {
        levels[user.id] = 0
      }

      setSpeakingLevels(levels)
    }, 400)

    return () => clearInterval(interval)
  }, [joined, peers, isMuted, user])

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
                onClick={toggleMute}
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
            { name: "Global Lounge", desc: "Open voice chat for all students", count: joined ? peers.length + 1 : 2, active: true },
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
