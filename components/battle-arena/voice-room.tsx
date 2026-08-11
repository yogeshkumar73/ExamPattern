"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic, MicOff, Volume2, VolumeX, PhoneOff, Users, Loader2,
  Sparkles, Settings, Radio, Wifi, WifiOff, AlertCircle, ChevronDown,
  PhoneCall, Signal
} from "lucide-react"
import { io, Socket } from "socket.io-client"

// ─── ICE Configuration: UDP-first STUN pool + TURN fallback ────────────────
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
}

// ─── Channels ────────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: "global-lounge",   name: "Global Lounge",   desc: "Open voice for all students",   emoji: "🌐" },
  { id: "coding-room-1",   name: "Coding Room 1",   desc: "P2P pair programming support",  emoji: "💻" },
  { id: "math-discussion", name: "Math Discussion", desc: "Algebra / Geometry debate",      emoji: "📐" },
  { id: "gk-trivia",       name: "GK Trivia Group", desc: "Chill and chat general facts",   emoji: "🧠" },
  { id: "interview-prep",  name: "Interview Prep",  desc: "Mock interview practice room",   emoji: "🎯" },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface VoiceRoomProps {
  user: { id: string; name: string; avatar: string; arenaRank?: string }
}

interface Peer {
  id: string
  userId: string
  name: string
  avatar: string
  rank?: string
  isMuted?: boolean
  iceState?: RTCIceConnectionState
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "failed" | "permission-denied" | "no-device"

// ─── Audio level helper ───────────────────────────────────────────────────────
function createAnalyser(stream: MediaStream, ctx: AudioContext): AnalyserNode {
  const src = ctx.createMediaStreamSource(stream)
  const an = ctx.createAnalyser()
  an.fftSize = 256
  an.smoothingTimeConstant = 0.7
  src.connect(an)
  return an
}

function getLevel(an: AnalyserNode): number {
  const data = new Uint8Array(an.frequencyBinCount)
  an.getByteFrequencyData(data)
  const avg = data.reduce((s, v) => s + v, 0) / data.length
  return Math.min(100, Math.round(avg * 1.5))
}

// ─── Component ────────────────────────────────────────────────────────────────
export function VoiceRoom({ user }: VoiceRoomProps) {
  const [activeChannel, setActiveChannel]   = useState(CHANNELS[0])
  const [status, setStatus]                 = useState<ConnectionStatus>("idle")
  const [joined, setJoined]                 = useState(false)
  const [isMuted, setIsMuted]               = useState(false)
  const [isDeafened, setIsDeafened]         = useState(false)
  const [isPTT, setIsPTT]                   = useState(false)
  const [pttActive, setPttActive]           = useState(false)
  const [peers, setPeers]                   = useState<Peer[]>([])
  const [speakingLevels, setSpeakingLevels] = useState<Record<string, number>>({})
  const [peerVolumes, setPeerVolumes]       = useState<Record<string, number>>({})
  const [channelCounts, setChannelCounts]   = useState<Record<string, number>>({})
  const [latency, setLatency]               = useState<number | null>(null)
  const [showSettings, setShowSettings]     = useState(false)
  const [micDevices, setMicDevices]         = useState<MediaDeviceInfo[]>([])
  const [selectedMic, setSelectedMic]       = useState<string>("")
  const [errorMsg, setErrorMsg]             = useState<string | null>(null)

  const socketRef         = useRef<Socket | null>(null)
  const localStreamRef    = useRef<MediaStream | null>(null)
  const peerConns         = useRef<Record<string, RTCPeerConnection>>({})
  const remoteAudios      = useRef<Record<string, HTMLAudioElement>>({})
  const gainNodes         = useRef<Record<string, GainNode>>({})
  const audioCtxRef       = useRef<AudioContext | null>(null)
  const localAnalyser     = useRef<AnalyserNode | null>(null)
  const remoteAnalysers   = useRef<Record<string, AnalyserNode>>({})
  const animFrameRef      = useRef<number>(0)
  const pingIntervalRef   = useRef<NodeJS.Timeout | null>(null)
  const pendingCandidates = useRef<Record<string, RTCIceCandidateInit[]>>({})

  // ── Socket (once) ──────────────────────────────────────────────────────
  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    })
    socketRef.current = s

    s.on("disconnect", () => { setJoined(false); setStatus("idle"); setPeers([]) })
    s.on("voice-room-counts", (c: Record<string, number>) => setChannelCounts(c))
    s.on("voice-pong", (sent: number) => setLatency(Date.now() - sent))
    s.on("peer-mute-status", ({ socketId, isMuted: m }: { socketId: string; isMuted: boolean }) => {
      setPeers(prev => prev.map(p => p.id === socketId ? { ...p, isMuted: m } : p))
    })
    return () => { s.disconnect() }
  }, [])

  // ── Create RTCPeerConnection ────────────────────────────────────────────
  const createPC = useCallback((peerId: string): RTCPeerConnection => {
    if (peerConns.current[peerId]) return peerConns.current[peerId]
    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConns.current[peerId] = pc
    pendingCandidates.current[peerId] = []

    localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!))

    pc.onicecandidate = e => {
      if (e.candidate) socketRef.current?.emit("candidate", { targetId: peerId, candidate: e.candidate })
    }
    pc.oniceconnectionstatechange = () => {
      setPeers(prev => prev.map(p => p.id === peerId ? { ...p, iceState: pc.iceConnectionState } : p))
    }
    pc.ontrack = e => {
      const stream = e.streams[0] || new MediaStream([e.track])
      if (!remoteAudios.current[peerId]) {
        const audio = new Audio()
        audio.autoplay = true
        audio.srcObject = stream
        remoteAudios.current[peerId] = audio
      } else {
        ;(remoteAudios.current[peerId].srcObject as MediaStream)?.addTrack(e.track)
      }
      const ctx = audioCtxRef.current
      if (ctx && !gainNodes.current[peerId]) {
        const src = ctx.createMediaStreamSource(stream)
        const gain = ctx.createGain()
        const an = ctx.createAnalyser()
        an.fftSize = 256
        an.smoothingTimeConstant = 0.7
        src.connect(gain)
        gain.connect(an)
        gain.connect(ctx.destination)
        gainNodes.current[peerId] = gain
        remoteAnalysers.current[peerId] = an
      }
    }
    return pc
  }, [])

  // ── Flush queued ICE candidates ─────────────────────────────────────────
  const flushCandidates = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    for (const c of (pendingCandidates.current[peerId] || [])) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)) } catch {}
    }
    pendingCandidates.current[peerId] = []
  }, [])

  // ── Signaling events ────────────────────────────────────────────────────
  useEffect(() => {
    const s = socketRef.current
    if (!s) return

    const onVoiceJoined = () => { setStatus("connected"); setJoined(true); setErrorMsg(null) }
    const onVoiceError  = ({ message }: { message: string }) => { setErrorMsg(message); setStatus("failed") }

    const onExistingUsers = (users: any[]) => {
      setPeers(prev => {
        const merged = [...prev]
        users.forEach(u => { if (!merged.some(p => p.id === u.socketId)) merged.push({ id: u.socketId, userId: u.userId, name: u.name, avatar: u.avatar }) })
        return merged
      })
    }
    const onUserJoined = (u: any) => {
      setPeers(prev => prev.some(p => p.id === u.socketId) ? prev : [...prev, { id: u.socketId, userId: u.userId, name: u.name, avatar: u.avatar }])
      createPC(u.socketId)
    }
    const onCreateOffer = async (targetId: string) => {
      if (!localStreamRef.current) return
      const pc = createPC(targetId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      s.emit("offer", { targetId, offer })
    }
    const onOffer = async (fromId: string, offer: RTCSessionDescriptionInit) => {
      const pc = createPC(fromId)
      if (!pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        await flushCandidates(fromId, pc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        s.emit("answer", { targetId: fromId, answer: pc.localDescription })
      }
    }
    const onAnswer = async (fromId: string, answer: RTCSessionDescriptionInit) => {
      const pc = peerConns.current[fromId]
      if (pc && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
        await flushCandidates(fromId, pc)
      }
    }
    const onCandidate = async (fromId: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConns.current[fromId]
      if (!pc || !pc.remoteDescription) {
        if (!pendingCandidates.current[fromId]) pendingCandidates.current[fromId] = []
        pendingCandidates.current[fromId].push(candidate)
        return
      }
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch {}
    }
    const onUserLeft = (socketId: string) => {
      setPeers(prev => prev.filter(p => p.id !== socketId))
      peerConns.current[socketId]?.close()
      delete peerConns.current[socketId]
      delete remoteAudios.current[socketId]
      delete gainNodes.current[socketId]
      delete remoteAnalysers.current[socketId]
      delete pendingCandidates.current[socketId]
    }

    s.on("voice-joined",   onVoiceJoined)
    s.on("voice-error",    onVoiceError)
    s.on("existing-users", onExistingUsers)
    s.on("user-joined",    onUserJoined)
    s.on("create-offer",   onCreateOffer)
    s.on("offer",          onOffer)
    s.on("answer",         onAnswer)
    s.on("candidate",      onCandidate)
    s.on("user-left",      onUserLeft)

    return () => {
      s.off("voice-joined",   onVoiceJoined)
      s.off("voice-error",    onVoiceError)
      s.off("existing-users", onExistingUsers)
      s.off("user-joined",    onUserJoined)
      s.off("create-offer",   onCreateOffer)
      s.off("offer",          onOffer)
      s.off("answer",         onAnswer)
      s.off("candidate",      onCandidate)
      s.off("user-left",      onUserLeft)
    }
  }, [createPC, flushCandidates])

  // ── Real audio level animation loop ────────────────────────────────────
  useEffect(() => {
    if (!joined) return
    const tick = () => {
      const levels: Record<string, number> = {}
      levels[user.id] = (localAnalyser.current && !isMuted) ? getLevel(localAnalyser.current) : 0
      peers.forEach(p => { levels[p.id] = remoteAnalysers.current[p.id] ? getLevel(remoteAnalysers.current[p.id]) : 0 })
      setSpeakingLevels(levels)
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [joined, peers, isMuted, user.id])

  // ── Latency ping ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return
    pingIntervalRef.current = setInterval(() => socketRef.current?.emit("voice-ping", Date.now()), 3000)
    return () => { if (pingIntervalRef.current) clearInterval(pingIntervalRef.current) }
  }, [joined])

  // ── PTT keyboard (Space) ────────────────────────────────────────────────
  useEffect(() => {
    if (!joined || !isPTT) return
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        setPttActive(true)
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = true })
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setPttActive(false)
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false })
      }
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up) }
  }, [joined, isPTT])

  // ── Deafen: mute all remote audio elements ──────────────────────────────
  useEffect(() => {
    Object.values(remoteAudios.current).forEach(el => { el.muted = isDeafened })
  }, [isDeafened])

  // ── Enumerate mic devices ───────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then(d => setMicDevices(d.filter(x => x.kind === "audioinput")))
      .catch(() => {})
  }, [])

  // ── Join ────────────────────────────────────────────────────────────────
  const handleJoin = async (channel = activeChannel) => {
    setStatus("connecting")
    setErrorMsg(null)
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      })
      localStreamRef.current = stream
      localAnalyser.current = createAnalyser(stream, ctx)

      if (isPTT) stream.getAudioTracks().forEach(t => { t.enabled = false })

      socketRef.current?.emit("join-lobby", { userId: user.id, name: user.name, avatar: user.avatar })
      socketRef.current?.emit("join-voice-room", { roomId: channel.id, userId: user.id })
      socketRef.current?.emit("mute-status", { isMuted: false })
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError" ? "Microphone permission denied. Please allow mic access and try again." :
        err?.name === "NotFoundError"   ? "No microphone found. Please connect a mic and try again." :
                                          "Could not access microphone. Please check your device settings."
      setErrorMsg(msg)
      setStatus(err?.name === "NotAllowedError" ? "permission-denied" : "no-device")
    }
  }

  // ── Leave ────────────────────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    localAnalyser.current = null
    Object.values(peerConns.current).forEach(pc => pc.close())
    peerConns.current = {}
    Object.values(remoteAudios.current).forEach(a => { a.srcObject = null })
    remoteAudios.current = {}
    gainNodes.current = {}
    remoteAnalysers.current = {}
    pendingCandidates.current = {}
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    socketRef.current?.emit("leave-voice-room", { roomId: activeChannel.id, userId: user.id })
    setPeers([])
    setJoined(false)
    setStatus("idle")
    setIsMuted(false)
    setIsDeafened(false)
    setPttActive(false)
    setSpeakingLevels({})
    setLatency(null)
  }, [activeChannel.id, user.id])

  // ── Toggle mute ──────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (!localStreamRef.current) return
    const next = !isMuted
    setIsMuted(next)
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !next })
    socketRef.current?.emit("mute-status", { isMuted: next })
  }

  // ── Switch channel ───────────────────────────────────────────────────────
  const switchChannel = async (ch: typeof CHANNELS[0]) => {
    if (ch.id === activeChannel.id) return
    if (joined) {
      socketRef.current?.emit("leave-voice-room", { roomId: activeChannel.id, userId: user.id })
      Object.values(peerConns.current).forEach(pc => pc.close())
      peerConns.current = {}
      Object.values(remoteAudios.current).forEach(a => { a.srcObject = null })
      remoteAudios.current = {}
      gainNodes.current = {}
      remoteAnalysers.current = {}
      pendingCandidates.current = {}
      setPeers([])
      setJoined(false)
      setStatus("idle")
    }
    setActiveChannel(ch)
    await handleJoin(ch)
  }

  // ── Per-peer volume ──────────────────────────────────────────────────────
  const setPeerVolume = (peerId: string, vol: number) => {
    setPeerVolumes(prev => ({ ...prev, [peerId]: vol }))
    if (gainNodes.current[peerId]) gainNodes.current[peerId].gain.value = vol / 100
    if (remoteAudios.current[peerId]) remoteAudios.current[peerId].volume = Math.min(vol / 100, 1)
  }

  const latencyColor = latency === null ? "text-white/40" : latency < 80 ? "text-green-400" : latency < 200 ? "text-yellow-400" : "text-red-400"

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Left: Main Controls ────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">
        <div className="arena-card p-6 flex flex-col items-center justify-center text-center space-y-4">

          {/* Icon */}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all
            ${joined ? "bg-green-500/10 border-2 border-green-500/40 arena-rgb-glow" : "bg-indigo-500/10 border-2 border-indigo-500/30"}`}>
            {joined && (speakingLevels[user.id] || 0) > 15 && (
              <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            )}
            <Mic className={`w-9 h-9 relative z-10 ${joined ? "text-green-400" : "text-indigo-400"}`} />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white tracking-wide">ARENA VOICE LOBBY</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm">
              Real-time WebRTC audio with STUN/TURN servers — UDP-first, low-latency. Talk with other coders in the arena.
            </p>
            <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-bold uppercase text-white/30">
              <span>● 5 STUN</span><span>● TURN failover</span><span>● Opus 48kHz</span>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-left w-full max-w-sm">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{errorMsg}</p>
            </div>
          )}

          {/* Active channel badge */}
          {joined && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-xs font-bold text-green-300">{activeChannel.name}</span>
              {latency !== null && (
                <span className={`text-[10px] font-mono ${latencyColor}`}>{latency}ms</span>
              )}
            </div>
          )}

          {/* Join / Controls */}
          {!joined ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <Button
                id="voice-join-btn"
                onClick={() => handleJoin()}
                disabled={status === "connecting"}
                className="h-12 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                {status === "connecting"
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Connecting…</>
                  : <><PhoneCall className="w-4 h-4 mr-2" /> Join Voice Room</>}
              </Button>

              <button
                onClick={() => setShowSettings(s => !s)}
                className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Audio Settings
                <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? "rotate-180" : ""}`} />
              </button>

              {showSettings && (
                <div className="w-full bg-white/5 rounded-xl p-4 space-y-3 text-left border border-white/10">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase font-bold block mb-1.5">Microphone</label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-lg text-white text-xs px-3 py-2 outline-none"
                      value={selectedMic}
                      onChange={e => setSelectedMic(e.target.value)}
                    >
                      <option value="">System Default</option>
                      {micDevices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/50 uppercase font-bold">Push-to-Talk</div>
                      <div className="text-[10px] text-white/30">Hold Space key to speak</div>
                    </div>
                    <button
                      onClick={() => setIsPTT(p => !p)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${isPTT ? "bg-indigo-600" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPTT ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Mute */}
              <Button
                id="voice-mute-btn"
                variant={isMuted ? "destructive" : "outline"}
                className={`h-11 px-4 rounded-xl border-white/10 font-bold text-xs uppercase gap-2 ${!isMuted ? "text-white hover:border-white/30" : ""}`}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>

              {/* Deafen */}
              <Button
                id="voice-deafen-btn"
                variant={isDeafened ? "destructive" : "outline"}
                className={`h-11 px-4 rounded-xl border-white/10 font-bold text-xs uppercase gap-2 ${!isDeafened ? "text-white hover:border-white/30" : ""}`}
                onClick={() => setIsDeafened(d => !d)}
              >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isDeafened ? "Undeafen" : "Deafen"}
              </Button>

              {/* PTT Button */}
              {isPTT && (
                <button
                  id="voice-ptt-btn"
                  onPointerDown={() => {
                    setPttActive(true)
                    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = true })
                  }}
                  onPointerUp={() => {
                    setPttActive(false)
                    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false })
                  }}
                  className={`h-11 px-5 rounded-xl font-black text-xs uppercase transition-all select-none
                    ${pttActive ? "bg-green-600 text-white shadow-lg shadow-green-500/40 scale-95" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                >
                  {pttActive ? "🔴 LIVE" : "🎙 PTT (Space)"}
                </button>
              )}

              {/* Disconnect */}
              <Button
                id="voice-leave-btn"
                variant="destructive"
                className="h-11 px-5 rounded-xl font-black text-xs uppercase gap-2"
                onClick={handleLeave}
              >
                <PhoneOff className="w-4 h-4" /> Leave
              </Button>
            </div>
          )}
        </div>

        {/* Peer grid */}
        {joined && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Connected — {peers.length + 1} member{peers.length !== 0 ? "s" : ""}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Self */}
              <PeerCard
                name={`${user.name} (You)`}
                avatar={user.avatar}
                rank={user.arenaRank}
                level={speakingLevels[user.id] || 0}
                isMuted={isPTT ? !pttActive : isMuted}
                isDeafened={isDeafened}
                isSelf
                volume={100}
              />
              {/* Peers */}
              {peers.map(peer => (
                <PeerCard
                  key={peer.id}
                  name={peer.name}
                  avatar={peer.avatar}
                  rank={peer.rank}
                  level={speakingLevels[peer.id] || 0}
                  isMuted={peer.isMuted || false}
                  iceState={peer.iceState}
                  volume={peerVolumes[peer.id] ?? 100}
                  onVolumeChange={v => setPeerVolume(peer.id, v)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Channel Sidebar ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="arena-card p-5 space-y-4">
          <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <Signal className="w-4 h-4 text-indigo-400" /> Channels
          </h3>
          <div className="space-y-2">
            {CHANNELS.map(ch => {
              const isActive = joined && ch.id === activeChannel.id
              const isPending = !joined && ch.id === activeChannel.id
              return (
                <button
                  key={ch.id}
                  id={`channel-${ch.id}`}
                  onClick={() => joined ? switchChannel(ch) : setActiveChannel(ch)}
                  className={`w-full p-3 rounded-xl border text-left transition-all
                    ${isActive  ? "border-green-500/40 bg-green-500/10" :
                      isPending ? "border-indigo-500/40 bg-indigo-500/10" :
                                  "border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none">{ch.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-[11px] flex items-center gap-1.5 truncate">
                          {ch.name}
                          {isActive && <Radio className="w-2.5 h-2.5 text-green-400 animate-pulse shrink-0" />}
                          {isPending && <Sparkles className="w-2.5 h-2.5 text-indigo-400 shrink-0" />}
                        </div>
                        <div className="text-[9px] text-white/40 mt-0.5 truncate">{ch.desc}</div>
                      </div>
                    </div>
                    <Badge className={`text-[9px] shrink-0 ml-1
                      ${isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/10 text-white/50 border-transparent"}`}>
                      {isActive ? peers.length + 1 : (channelCounts[ch.id] ?? 0)}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Connection info */}
        <div className="arena-card p-4 space-y-3">
          <h3 className="text-white/60 font-black text-xs uppercase tracking-widest">Connection Info</h3>
          <div className="space-y-2 text-[11px]">
            <InfoRow label="Protocol"  value="UDP / WebRTC"                              icon={<Wifi className="w-3 h-3" />}   ok />
            <InfoRow label="Signaling" value={socketRef.current?.connected ? "Online" : "Offline"} icon={<Radio className="w-3 h-3" />} ok={socketRef.current?.connected} />
            <InfoRow label="Latency"   value={latency !== null ? `${latency} ms` : "—"}  icon={<Signal className="w-3 h-3" />} ok={latency !== null && latency < 200} />
            <InfoRow label="Peers"     value={String(peers.length)}                      icon={<Users className="w-3 h-3" />}  ok={peers.length > 0} />
            <InfoRow label="TURN"      value="Metered (fallback)"                        icon={<WifiOff className="w-3 h-3" />} ok />
          </div>
        </div>

        {/* PTT hint */}
        {joined && isPTT && (
          <div className={`arena-card p-3 border text-center text-xs font-bold uppercase transition-all
            ${pttActive ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-white/10 text-white/30"}`}>
            {pttActive ? "🔴 Transmitting…" : "Hold Space or PTT to talk"}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PeerCard ─────────────────────────────────────────────────────────────────
interface PeerCardProps {
  name: string
  avatar: string
  rank?: string
  level: number
  isMuted: boolean
  isDeafened?: boolean
  isSelf?: boolean
  iceState?: RTCIceConnectionState
  volume: number
  onVolumeChange?: (v: number) => void
}

function PeerCard({ name, avatar, rank, level, isMuted, isDeafened, isSelf, iceState, volume, onVolumeChange }: PeerCardProps) {
  const speaking = level > 12
  const qualityDot =
    iceState === "connected" || iceState === "completed" ? "bg-green-400" :
    iceState === "checking"                              ? "bg-yellow-400" :
    iceState                                             ? "bg-red-400"   :
    isSelf                                               ? "bg-green-400" :
    "bg-white/20"

  return (
    <div className="arena-card p-4 flex flex-col items-center text-center relative overflow-hidden bg-black/40 group">
      <div className="relative mb-3">
        {speaking && !isMuted && (
          <span
            className="absolute inset-0 rounded-full bg-green-500/30 border-2 border-green-400 animate-ping"
            style={{ transform: `scale(${1 + level / 180})` }}
          />
        )}
        <img
          src={avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`}
          alt={name}
          className={`w-14 h-14 rounded-full object-cover relative z-10 transition-all
            ${speaking && !isMuted ? "ring-2 ring-green-400 ring-offset-2 ring-offset-black/60" : ""}`}
        />
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black z-20 ${qualityDot}`} />
      </div>

      <div className="text-white font-bold text-[11px] truncate w-full">{name}</div>
      {rank && <div className="text-[9px] text-white/40 uppercase font-bold mt-0.5">{rank}</div>}

      {/* Level bar */}
      <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-75 ${isMuted ? "bg-red-500/40" : "bg-green-400"}`}
          style={{ width: `${isMuted ? 0 : level}%` }}
        />
      </div>

      <div className="flex gap-1 mt-2 flex-wrap justify-center">
        {isMuted && (
          <Badge className="bg-red-500/20 text-red-400 border-none text-[8px] uppercase font-bold px-1.5">
            <MicOff className="w-2.5 h-2.5 mr-0.5" /> Muted
          </Badge>
        )}
        {isDeafened && (
          <Badge className="bg-orange-500/20 text-orange-400 border-none text-[8px] uppercase font-bold px-1.5">
            <VolumeX className="w-2.5 h-2.5 mr-0.5" /> Deaf
          </Badge>
        )}
        {!isMuted && speaking && (
          <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] uppercase font-bold px-1.5">Speaking</Badge>
        )}
        {!isMuted && !speaking && (
          <Badge className="bg-white/10 text-white/40 border-none text-[8px] uppercase font-bold px-1.5">Idle</Badge>
        )}
      </div>

      {/* Volume slider (hover, non-self) */}
      {!isSelf && onVolumeChange && (
        <div className="mt-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="text-[8px] text-white/30 uppercase font-bold block mb-1">Vol {volume}%</label>
          <input
            type="range" min={0} max={150} value={volume}
            onChange={e => onVolumeChange(Number(e.target.value))}
            className="w-full h-1 accent-indigo-500 cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon, ok }: { label: string; value: string; icon: React.ReactNode; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-white/40">{icon}<span>{label}</span></div>
      <span className={`font-mono font-bold ${ok ? "text-green-400" : "text-white/30"}`}>{value}</span>
    </div>
  )
}


