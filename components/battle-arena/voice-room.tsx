"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Mic, MicOff, Volume2, VolumeX, PhoneOff, Users, Loader2,
  Sparkles, Settings, Radio, Wifi, WifiOff, AlertCircle, ChevronDown,
  PhoneCall, Signal, Plus, Bot, Headphones, Sliders, CheckCircle2,
  X, Volume1
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
export interface Channel {
  id: string
  name: string
  desc: string
  emoji: string
  isCustom?: boolean
  createdBy?: string
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: "global-lounge",   name: "Global Lounge",   desc: "Open voice for all arena students",   emoji: "🌐" },
  { id: "coding-room-1",   name: "Coding Room 1",   desc: "P2P pair programming & debugging",   emoji: "💻" },
  { id: "math-discussion", name: "Math Arena",      desc: "Algebra, Calculus & Logic debate",     emoji: "📐" },
  { id: "gk-trivia",       name: "GK Trivia Hub",   desc: "Casual general knowledge voice chat",  emoji: "🧠" },
  { id: "interview-prep",  name: "Interview Room",  desc: "Mock technical interview practice",   emoji: "🎯" },
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
  isSpeaking?: boolean
  iceState?: RTCIceConnectionState
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "failed" | "permission-denied" | "no-device"

// ─── Sound FX Synthesizer (Zero External Dependencies) ────────────────────────
function playSoundEffect(type: "join" | "leave" | "mute" | "unmute", ctx: AudioContext | null) {
  if (!ctx || ctx.state === "suspended") return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime

    if (type === "join") {
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.15)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else if (type === "leave") {
      osc.frequency.setValueAtTime(500, now)
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.18)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else if (type === "mute") {
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.setValueAtTime(300, now + 0.08)
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
      osc.start(now)
      osc.stop(now + 0.16)
    } else if (type === "unmute") {
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.setValueAtTime(450, now + 0.08)
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
      osc.start(now)
      osc.stop(now + 0.16)
    }
  } catch {}
}

// ─── Audio level helper ───────────────────────────────────────────────────────
function createAnalyser(stream: MediaStream, ctx: AudioContext): AnalyserNode {
  const src = ctx.createMediaStreamSource(stream)
  const an = ctx.createAnalyser()
  an.fftSize = 256
  an.smoothingTimeConstant = 0.65
  src.connect(an)
  return an
}

function getLevel(an: AnalyserNode): number {
  const data = new Uint8Array(an.frequencyBinCount)
  an.getByteFrequencyData(data)
  const avg = data.reduce((s, v) => s + v, 0) / data.length
  return Math.min(100, Math.round(avg * 1.6))
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VoiceRoom({ user }: VoiceRoomProps) {
  const [channels, setChannels]             = useState<Channel[]>(DEFAULT_CHANNELS)
  const [activeChannel, setActiveChannel]   = useState<Channel>(DEFAULT_CHANNELS[0])
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName]       = useState("")
  const [newRoomEmoji, setNewRoomEmoji]     = useState("🚀")
  const [micDevices, setMicDevices]         = useState<MediaDeviceInfo[]>([])
  const [selectedMic, setSelectedMic]       = useState<string>("")
  const [errorMsg, setErrorMsg]             = useState<string | null>(null)

  // Mic test VU meter in settings
  const [isTestingMic, setIsTestingMic]     = useState(false)
  const [testMicLevel, setTestMicLevel]     = useState(0)

  // AI Study Companion mode for solo students
  const [aiCompanionEnabled, setAiCompanionEnabled] = useState(false)

  // Audio constraints
  const [echoCancellation, setEchoCancellation] = useState(true)
  const [noiseSuppression, setNoiseSuppression]   = useState(true)
  const [autoGainControl, setAutoGainControl]     = useState(true)

  // Refs
  const socketRef         = useRef<Socket | null>(null)
  const localStreamRef    = useRef<MediaStream | null>(null)
  const testStreamRef     = useRef<MediaStream | null>(null)
  const testAnalyserRef   = useRef<AnalyserNode | null>(null)
  const peerConns         = useRef<Record<string, RTCPeerConnection>>({})
  const remoteAudios      = useRef<Record<string, HTMLAudioElement>>({})
  const gainNodes         = useRef<Record<string, GainNode>>({})
  const audioCtxRef       = useRef<AudioContext | null>(null)
  const localAnalyser     = useRef<AnalyserNode | null>(null)
  const remoteAnalysers   = useRef<Record<string, AnalyserNode>>({})
  const animFrameRef      = useRef<number>(0)
  const pingIntervalRef   = useRef<NodeJS.Timeout | null>(null)
  const pendingCandidates = useRef<Record<string, RTCIceCandidateInit[]>>({})

  // ── Socket Connection ───────────────────────────────────────────────────────
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:3000"
        : "")

    if (!socketUrl) {
      return
    }

    const s = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
    })
    socketRef.current = s

    s.on("connect", () => {
      s.emit("get-voice-room-counts")
      s.emit("get-custom-voice-rooms")
    })

    s.on("disconnect", () => {
      setJoined(false)
      setStatus("idle")
      setPeers([])
    })

    s.on("voice-room-counts", (counts: Record<string, number>) => {
      setChannelCounts(counts || {})
    })

    s.on("custom-voice-rooms-updated", (customList: Channel[]) => {
      if (Array.isArray(customList) && customList.length > 0) {
        setChannels(prev => {
          const merged = [...DEFAULT_CHANNELS]
          customList.forEach(c => {
            if (!merged.some(m => m.id === c.id)) {
              merged.push({ ...c, isCustom: true })
            }
          })
          return merged
        })
      }
    })

    s.on("voice-pong", (sent: number) => {
      setLatency(Date.now() - sent)
    })

    s.on("peer-mute-status", ({ socketId, isMuted: m }: { socketId: string; isMuted: boolean }) => {
      setPeers(prev => prev.map(p => p.id === socketId ? { ...p, isMuted: m } : p))
    })

    s.on("peer-speaking", ({ socketId, isSpeaking, level }: { socketId: string; isSpeaking: boolean; level: number }) => {
      setSpeakingLevels(prev => ({ ...prev, [socketId]: isSpeaking ? level : 0 }))
      setPeers(prev => prev.map(p => p.id === socketId ? { ...p, isSpeaking } : p))
    })

    return () => {
      s.disconnect()
    }
  }, [])

  // ── Create RTCPeerConnection ────────────────────────────────────────────────
  const createPC = useCallback((peerId: string): RTCPeerConnection => {
    if (peerConns.current[peerId]) return peerConns.current[peerId]

    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConns.current[peerId] = pc
    pendingCandidates.current[peerId] = []

    // Add local tracks if stream exists
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => {
        pc.addTrack(t, localStreamRef.current!)
      })
    }

    pc.onicecandidate = e => {
      if (e.candidate) {
        socketRef.current?.emit("candidate", { targetId: peerId, candidate: e.candidate })
      }
    }

    pc.oniceconnectionstatechange = () => {
      setPeers(prev => prev.map(p => p.id === peerId ? { ...p, iceState: pc.iceConnectionState } : p))
      if (pc.iceConnectionState === "failed") {
        pc.restartIce?.()
      }
    }

    // Handle incoming remote audio track
    pc.ontrack = e => {
      const stream = e.streams[0] || new MediaStream([e.track])

      // Single Web Audio API pipeline: Route through GainNode -> Analyser -> Destination
      const ctx = audioCtxRef.current
      if (ctx) {
        if (ctx.state === "suspended") ctx.resume().catch(() => {})

        if (!gainNodes.current[peerId]) {
          try {
            const src = ctx.createMediaStreamSource(stream)
            const gain = ctx.createGain()
            const an = ctx.createAnalyser()
            an.fftSize = 256
            an.smoothingTimeConstant = 0.65
            src.connect(gain)
            gain.connect(an)
            gain.connect(ctx.destination)

            const savedVol = peerVolumes[peerId] ?? 100
            gain.gain.value = (savedVol / 100) * (isDeafened ? 0 : 1)

            gainNodes.current[peerId] = gain
            remoteAnalysers.current[peerId] = an
          } catch (err) {
            console.warn("Web Audio graph connection error:", err)
          }
        }
      }

      // Keep hidden audio element MUTED so it pulls stream without echoing/double sound
      if (!remoteAudios.current[peerId]) {
        const audio = new Audio()
        audio.muted = true // MUST remain muted to prevent echo; Web Audio plays the output
        audio.autoplay = true
        audio.srcObject = stream
        audio.play().catch(() => {})
        remoteAudios.current[peerId] = audio
      } else {
        ;(remoteAudios.current[peerId].srcObject as MediaStream)?.addTrack(e.track)
      }
    }

    return pc
  }, [isDeafened, peerVolumes])

  // ── Flush Queued ICE Candidates ─────────────────────────────────────────────
  const flushCandidates = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const list = pendingCandidates.current[peerId] || []
    for (const c of list) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c))
      } catch {}
    }
    pendingCandidates.current[peerId] = []
  }, [])

  // ── WebRTC Signaling Events ─────────────────────────────────────────────────
  useEffect(() => {
    const s = socketRef.current
    if (!s) return

    const onVoiceJoined = () => {
      setStatus("connected")
      setJoined(true)
      setErrorMsg(null)
      playSoundEffect("join", audioCtxRef.current)
    }

    const onVoiceError = ({ message }: { message: string }) => {
      setErrorMsg(message)
      setStatus("failed")
    }

    const onExistingUsers = (usersList: any[]) => {
      setPeers(prev => {
        const merged = [...prev]
        usersList.forEach(u => {
          if (!merged.some(p => p.id === u.socketId)) {
            merged.push({
              id: u.socketId,
              userId: u.userId,
              name: u.name || "Student",
              avatar: u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.name || "S"}`,
              rank: u.rank || "Unranked",
              isMuted: Boolean(u.isMuted)
            })
          }
        })
        return merged
      })
    }

    const onUserJoined = (u: any) => {
      setPeers(prev => {
        if (prev.some(p => p.id === u.socketId)) return prev
        return [...prev, {
          id: u.socketId,
          userId: u.userId,
          name: u.name || "Student",
          avatar: u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.name || "S"}`,
          rank: u.rank || "Unranked",
          isMuted: Boolean(u.isMuted)
        }]
      })
      createPC(u.socketId)
      playSoundEffect("join", audioCtxRef.current)
    }

    const onCreateOffer = async (targetId: string) => {
      if (!localStreamRef.current) return
      try {
        const pc = createPC(targetId)
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          voiceActivityDetection: true
        })
        await pc.setLocalDescription(offer)
        s.emit("offer", { targetId, offer })
      } catch (err) {
        console.error("Offer creation failed:", err)
      }
    }

    const onOffer = async (fromId: string, offer: RTCSessionDescriptionInit) => {
      try {
        const pc = createPC(fromId)
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        await flushCandidates(fromId, pc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        s.emit("answer", { targetId: fromId, answer: pc.localDescription })
      } catch (err) {
        console.error("Answer negotiation failed:", err)
      }
    }

    const onAnswer = async (fromId: string, answer: RTCSessionDescriptionInit) => {
      try {
        const pc = peerConns.current[fromId]
        if (pc && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          await flushCandidates(fromId, pc)
        }
      } catch (err) {
        console.error("Remote description set failed:", err)
      }
    }

    const onCandidate = async (fromId: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConns.current[fromId]
      if (!pc || !pc.remoteDescription) {
        if (!pendingCandidates.current[fromId]) pendingCandidates.current[fromId] = []
        pendingCandidates.current[fromId].push(candidate)
        return
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {}
    }

    const onUserLeft = (socketId: string) => {
      setPeers(prev => prev.filter(p => p.id !== socketId))
      peerConns.current[socketId]?.close()
      delete peerConns.current[socketId]
      delete remoteAudios.current[socketId]
      delete gainNodes.current[socketId]
      delete remoteAnalysers.current[socketId]
      delete pendingCandidates.current[socketId]
      playSoundEffect("leave", audioCtxRef.current)
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

  // ── Audio Level Animation Loop ──────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return
    let lastSpeakingSent = false

    const tick = () => {
      const levels: Record<string, number> = {}
      const myLevel = (localAnalyser.current && !isMuted && (!isPTT || pttActive)) ? getLevel(localAnalyser.current) : 0
      levels[user.id] = myLevel

      peers.forEach(p => {
        levels[p.id] = remoteAnalysers.current[p.id] ? getLevel(remoteAnalysers.current[p.id]) : 0
      })
      setSpeakingLevels(levels)

      // Broadcast speaking state if threshold crossed
      const isSpeaking = myLevel > 18
      if (isSpeaking !== lastSpeakingSent) {
        lastSpeakingSent = isSpeaking
        socketRef.current?.emit("speaking-status", {
          roomId: activeChannel.id,
          isSpeaking,
          level: myLevel
        })
      }

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [joined, peers, isMuted, isPTT, pttActive, user.id, activeChannel.id])

  // ── Latency Ping ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return
    pingIntervalRef.current = setInterval(() => {
      socketRef.current?.emit("voice-ping", Date.now())
    }, 2500)
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
    }
  }, [joined])

  // ── Push-to-Talk & Keyboard Shortcuts (M, D, Space) ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return

      if (joined) {
        if (e.key === "m" || e.key === "M") {
          e.preventDefault()
          toggleMute()
        } else if (e.key === "d" || e.key === "D") {
          e.preventDefault()
          setIsDeafened(d => !d)
        } else if (isPTT && e.code === "Space" && !e.repeat) {
          e.preventDefault()
          setPttActive(true)
          localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = true })
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (joined && isPTT && e.code === "Space") {
        e.preventDefault()
        setPttActive(false)
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [joined, isPTT, isMuted])

  // ── Deafen: Adjust Gain Nodes for all peers ─────────────────────────────────
  useEffect(() => {
    Object.entries(gainNodes.current).forEach(([pId, gNode]) => {
      const vol = peerVolumes[pId] ?? 100
      gNode.gain.value = isDeafened ? 0 : vol / 100
    })
  }, [isDeafened, peerVolumes])

  // ── Enumerate Devices ───────────────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then(devices => {
        setMicDevices(devices.filter(d => d.kind === "audioinput"))
      })
      .catch(() => {})
  }, [])

  // ── Mic Testing VU Loop in Settings ─────────────────────────────────────────
  const startMicTest = async () => {
    try {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        }
      })
      testStreamRef.current = stream
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx
      if (ctx.state === "suspended") await ctx.resume()

      const analyser = createAnalyser(stream, ctx)
      testAnalyserRef.current = analyser
      setIsTestingMic(true)

      const checkLoop = () => {
        if (!testAnalyserRef.current) return
        setTestMicLevel(getLevel(testAnalyserRef.current))
        requestAnimationFrame(checkLoop)
      }
      requestAnimationFrame(checkLoop)
    } catch {
      setIsTestingMic(false)
    }
  }

  const stopMicTest = () => {
    testStreamRef.current?.getTracks().forEach(t => t.stop())
    testStreamRef.current = null
    testAnalyserRef.current = null
    setIsTestingMic(false)
    setTestMicLevel(0)
  }

  // ── Join Voice Room ─────────────────────────────────────────────────────────
  const handleJoin = async (channel = activeChannel) => {
    setStatus("connecting")
    setErrorMsg(null)
    stopMicTest()

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx
      if (ctx.state === "suspended") {
        await ctx.resume()
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          sampleRate: 48000,
          channelCount: 1,
        },
      })
      localStreamRef.current = stream
      localAnalyser.current = createAnalyser(stream, ctx)

      if (isPTT) {
        stream.getAudioTracks().forEach(t => { t.enabled = false })
      }

      // Propagate user metadata directly to socket
      socketRef.current?.emit("join-lobby", { userId: user.id, name: user.name, avatar: user.avatar })
      socketRef.current?.emit("join-voice-room", {
        roomId: channel.id,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        rank: user.arenaRank || "Unranked",
      })
      socketRef.current?.emit("mute-status", { isMuted: false })
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError" ? "Microphone permission denied. Allow mic access in your browser." :
        err?.name === "NotFoundError"   ? "No microphone found. Please plug in or connect a microphone." :
                                          "Could not initialize audio device. Please check settings."
      setErrorMsg(msg)
      setStatus(err?.name === "NotAllowedError" ? "permission-denied" : "no-device")
    }
  }

  // ── Leave Voice Room ────────────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)

    playSoundEffect("leave", audioCtxRef.current)

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

  // ── Toggle Mute ─────────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (!localStreamRef.current) return
    const next = !isMuted
    setIsMuted(next)
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !next })
    socketRef.current?.emit("mute-status", { isMuted: next })
    playSoundEffect(next ? "mute" : "unmute", audioCtxRef.current)
  }

  // ── Switch Channel ──────────────────────────────────────────────────────────
  const switchChannel = async (ch: Channel) => {
    if (ch.id === activeChannel.id) return
    if (joined) {
      handleLeave()
    }
    setActiveChannel(ch)
    await handleJoin(ch)
  }

  // ── Create Custom Voice Room ────────────────────────────────────────────────
  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const roomObj: Channel = {
      id,
      name: newRoomName.trim(),
      desc: "Student-created custom study room",
      emoji: newRoomEmoji || "🎙️",
      isCustom: true,
      createdBy: user.name,
    }
    socketRef.current?.emit("create-custom-voice-room", roomObj)
    setChannels(prev => [...prev, roomObj])
    setShowCreateModal(false)
    setNewRoomName("")
    if (joined) switchChannel(roomObj)
    else setActiveChannel(roomObj)
  }

  // ── Per-peer Volume Slider ──────────────────────────────────────────────────
  const setPeerVolume = (peerId: string, vol: number) => {
    setPeerVolumes(prev => ({ ...prev, [peerId]: vol }))
    if (gainNodes.current[peerId]) {
      gainNodes.current[peerId].gain.value = isDeafened ? 0 : vol / 100
    }
  }

  const latencyColor = latency === null ? "text-white/40" : latency < 75 ? "text-emerald-400" : latency < 180 ? "text-amber-400" : "text-rose-400"

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top Banner / Channel Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left: Main Voice Console ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="arena-card p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-black/60 to-black/90 border-2 border-white/10 rounded-3xl">
            
            {/* Ping / Status Pill */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${joined ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
              <span className="text-[11px] font-bold text-white/60">
                {joined ? "Online • Low Latency" : "Disconnected"}
              </span>
              {latency !== null && (
                <Badge variant="outline" className={`font-mono text-[10px] font-black border-white/10 ${latencyColor}`}>
                  {latency}ms
                </Badge>
              )}
            </div>

            {/* Glowing Microphone Avatar Icon */}
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 mt-2
              ${joined 
                ? (speakingLevels[user.id] || 0) > 15
                  ? "bg-emerald-500/20 border-4 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)] scale-105"
                  : "bg-emerald-500/10 border-2 border-emerald-500/40"
                : "bg-indigo-500/10 border-2 border-indigo-500/30"
              }`}
            >
              {joined && (speakingLevels[user.id] || 0) > 15 && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              )}
              <Mic className={`w-10 h-10 relative z-10 transition-colors ${
                joined ? (isMuted ? "text-rose-400" : "text-emerald-400") : "text-indigo-400"
              }`} />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{activeChannel.emoji}</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                  {activeChannel.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-white/60 max-w-md font-medium">
                {activeChannel.desc}
              </p>
              <div className="flex items-center justify-center gap-3 mt-3 text-[11px] font-bold text-white/40 uppercase">
                <span>● WebRTC Full Mesh</span>
                <span>● Opus 48kHz High-Fidelity</span>
                <span>● Multi-User Voice</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-left w-full max-w-md">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Join / Main Call Controls */}
            {!joined ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-sm pt-2">
                <Button
                  id="voice-join-btn"
                  onClick={() => handleJoin()}
                  disabled={status === "connecting"}
                  className="h-14 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base uppercase rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-102"
                >
                  {status === "connecting" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Connecting Audio Stream...
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-5 h-5 mr-2" /> Join {activeChannel.name}
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowSettings(s => !s)}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors py-1"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Audio & Device Settings
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettings ? "rotate-180" : ""}`} />
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {/* Mute Button */}
                <Button
                  id="voice-mute-btn"
                  variant={isMuted ? "destructive" : "outline"}
                  className={`h-12 px-5 rounded-2xl border-white/10 font-bold text-xs uppercase gap-2 transition-all ${
                    !isMuted ? "bg-white/5 text-white hover:bg-white/10 border-white/20" : "bg-rose-600 text-white"
                  }`}
                  onClick={toggleMute}
                  title="Press 'M' to toggle mute"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? "Unmute (M)" : "Mute (M)"}</span>
                </Button>

                {/* Deafen Button */}
                <Button
                  id="voice-deafen-btn"
                  variant={isDeafened ? "destructive" : "outline"}
                  className={`h-12 px-5 rounded-2xl border-white/10 font-bold text-xs uppercase gap-2 transition-all ${
                    !isDeafened ? "bg-white/5 text-white hover:bg-white/10 border-white/20" : "bg-rose-600 text-white"
                  }`}
                  onClick={() => setIsDeafened(d => !d)}
                  title="Press 'D' to toggle deafen"
                >
                  {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                  <span>{isDeafened ? "Undeafen (D)" : "Deafen (D)"}</span>
                </Button>

                {/* Push-to-Talk (PTT) Button */}
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
                    className={`h-12 px-6 rounded-2xl font-black text-xs uppercase transition-all select-none shadow-lg ${
                      pttActive ? "bg-emerald-600 text-white shadow-emerald-500/40 scale-95" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {pttActive ? "🔴 TRANSMITTING..." : "🎙 PUSH TO TALK (SPACE)"}
                  </button>
                )}

                {/* Audio Settings Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(s => !s)}
                  className="h-12 w-12 rounded-2xl border-white/15 p-0 bg-white/5 text-white/70 hover:text-white"
                  title="Audio Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Leave Button */}
                <Button
                  id="voice-leave-btn"
                  variant="destructive"
                  className="h-12 px-6 rounded-2xl font-black text-xs uppercase gap-2 shadow-lg shadow-rose-600/30"
                  onClick={handleLeave}
                >
                  <PhoneOff className="w-4 h-4" /> Disconnect
                </Button>
              </div>
            )}

            {/* Audio Settings Collapsible Panel */}
            {showSettings && (
              <div className="w-full max-w-md bg-black/60 rounded-2xl p-5 space-y-4 text-left border-2 border-white/10 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" /> Audio Device & Filters
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mic Device Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase font-bold block">Input Microphone</label>
                  <select
                    className="w-full bg-white/5 border border-white/15 rounded-xl text-white text-xs px-3 py-2.5 outline-none font-medium"
                    value={selectedMic}
                    onChange={e => setSelectedMic(e.target.value)}
                  >
                    <option value="" className="bg-zinc-900 text-white">Default Microphone</option>
                    {micDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId} className="bg-zinc-900 text-white">
                        {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mic Test VU Meter */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">Microphone Test VU Meter</span>
                    <Button
                      type="button"
                      size="sm"
                      variant={isTestingMic ? "destructive" : "secondary"}
                      onClick={isTestingMic ? stopMicTest : startMicTest}
                      className="h-7 text-[10px] font-black uppercase px-2.5 rounded-lg"
                    >
                      {isTestingMic ? "Stop Test" : "Test Mic"}
                    </Button>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                      style={{ width: `${isTestingMic ? testMicLevel : (speakingLevels[user.id] || 0)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-white/40">Speak into your mic to confirm input activity.</div>
                </div>

                {/* Push to Talk Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs text-white font-bold">Push-to-Talk (PTT)</div>
                    <div className="text-[10px] text-white/40">Hold Spacebar to transmit audio</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPTT(p => !p)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isPTT ? "bg-indigo-600" : "bg-white/20"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPTT ? "left-6" : "left-1"}`} />
                  </button>
                </div>

                {/* Audio Filters Checkboxes */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-bold text-white/70">Echo Cancel</div>
                    <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Enabled</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-bold text-white/70">Noise Filter</div>
                    <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Enabled</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-bold text-white/70">Auto Gain</div>
                    <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Active</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Multiuser Connected Peer Grid ───────────────────────────────── */}
          {joined && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Active Participants ({peers.length + 1})
                </h3>

                {peers.length === 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 font-bold">
                      Waiting for other students...
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Self Card */}
                <PeerCard
                  name={`${user.name} (You)`}
                  avatar={user.avatar}
                  rank={user.arenaRank || "Student"}
                  level={speakingLevels[user.id] || 0}
                  isMuted={isPTT ? !pttActive : isMuted}
                  isDeafened={isDeafened}
                  isSelf
                  volume={100}
                />

                {/* Remote Peers Cards */}
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

                {/* AI Study Partner Card (if enabled or alone) */}
                {aiCompanionEnabled && (
                  <div className="arena-card p-4 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-indigo-950/40 to-black/60 border border-indigo-500/30 rounded-2xl group">
                    <div className="relative mb-3">
                      <div className="w-14 h-14 rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-indigo-400">
                        <Bot className="w-7 h-7" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
                    </div>
                    <div className="text-white font-bold text-xs truncate w-full">AI Study Bot</div>
                    <div className="text-[9px] text-indigo-400 uppercase font-bold mt-0.5">Automated Coach</div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-none text-[8px] uppercase font-bold px-2 py-0.5 mt-2">
                      Active Listening
                    </Badge>
                  </div>
                )}
              </div>

              {/* Solo Helper Banner */}
              {peers.length === 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span>You are the only member in this room right now. Invite friends or practice with the AI study partner.</span>
                  </div>
                  <Button
                    size="sm"
                    variant={aiCompanionEnabled ? "destructive" : "secondary"}
                    onClick={() => setAiCompanionEnabled(e => !e)}
                    className="text-xs font-bold rounded-xl h-8 shrink-0"
                  >
                    <Bot className="w-3.5 h-3.5 mr-1" />
                    {aiCompanionEnabled ? "Dismiss AI Bot" : "Invite AI Coach"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Voice Channels Sidebar ───────────────────────────────── */}
        <div className="space-y-4">
          <div className="arena-card p-5 space-y-4 border-2 border-white/10 rounded-3xl bg-black/40">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Signal className="w-4 h-4 text-indigo-400" /> Voice Channels
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCreateModal(true)}
                className="h-7 px-2 text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 rounded-lg gap-1"
              >
                <Plus className="w-3 h-3" /> Create
              </Button>
            </div>

            {/* Channels List */}
            <div className="space-y-2">
              {channels.map(ch => {
                const isActive = joined && ch.id === activeChannel.id
                const isSelected = !joined && ch.id === activeChannel.id
                const count = isActive ? (peers.length + 1) : (channelCounts[ch.id] ?? 0)

                return (
                  <button
                    key={ch.id}
                    id={`channel-${ch.id}`}
                    onClick={() => joined ? switchChannel(ch) : setActiveChannel(ch)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all group ${
                      isActive
                        ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : isSelected
                          ? "border-indigo-500/50 bg-indigo-500/10"
                          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl leading-none flex-shrink-0">{ch.emoji}</span>
                        <div className="min-w-0">
                          <div className="text-white font-bold text-xs flex items-center gap-1.5 truncate">
                            {ch.name}
                            {isActive && <Radio className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />}
                            {isSelected && <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-white/40 mt-0.5 truncate">{ch.desc}</div>
                        </div>
                      </div>

                      <Badge className={`text-[10px] font-black shrink-0 px-2 py-0.5 rounded-lg ${
                        count > 0 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-white/10 text-white/40 border-none"
                      }`}>
                        <Users className="w-2.5 h-2.5 mr-1" /> {count}
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Connection Diagnostics Card */}
          <div className="arena-card p-4 space-y-3 border-2 border-white/10 rounded-3xl bg-black/40">
            <h3 className="text-white/60 font-black text-[10px] uppercase tracking-widest">WebRTC Diagnostics</h3>
            <div className="space-y-2 text-xs">
              <InfoRow label="Protocol" value="UDP / WebRTC Mesh" icon={<Wifi className="w-3.5 h-3.5" />} ok />
              <InfoRow
                label="Signaling Gateway"
                value={socketRef.current?.connected ? "Online (Socket.io)" : "Disconnected"}
                icon={<Radio className="w-3.5 h-3.5" />}
                ok={socketRef.current?.connected}
              />
              <InfoRow
                label="Audio Latency"
                value={latency !== null ? `${latency} ms` : "Standby"}
                icon={<Signal className="w-3.5 h-3.5" />}
                ok={latency !== null && latency < 180}
              />
              <InfoRow label="Active Peers" value={String(peers.length)} icon={<Users className="w-3.5 h-3.5" />} ok={peers.length > 0} />
              <InfoRow label="STUN / TURN" value="5 Global STUN + Metered TURN" icon={<WifiOff className="w-3.5 h-3.5" />} ok />
            </div>
          </div>

          {/* Shortcut Keys Helper */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/50 space-y-1">
            <div className="font-bold uppercase text-white/70 text-[10px]">Keyboard Shortcuts</div>
            <div className="flex justify-between"><span>Toggle Mute</span> <kbd className="px-1.5 py-0.5 bg-black/60 rounded border border-white/20 text-white font-mono">M</kbd></div>
            <div className="flex justify-between"><span>Toggle Deafen</span> <kbd className="px-1.5 py-0.5 bg-black/60 rounded border border-white/20 text-white font-mono">D</kbd></div>
            <div className="flex justify-between"><span>Push to Talk</span> <kbd className="px-1.5 py-0.5 bg-black/60 rounded border border-white/20 text-white font-mono">Space</kbd></div>
          </div>
        </div>
      </div>

      {/* ── Create Custom Room Modal ───────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-white/20 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Create Voice Channel
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-white/60">Channel Icon (Emoji)</label>
                <div className="flex gap-2">
                  {["🎙️", "📚", "💻", "🔥", "⚡", "🧠", "🎯"].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewRoomEmoji(em)}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                        newRoomEmoji === em ? "border-indigo-500 bg-indigo-500/20 scale-105" : "border-white/10 bg-white/5"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-white/60">Channel Name</label>
                <Input
                  placeholder="e.g. DSA Marathon Room"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  className="h-11 rounded-xl bg-white/5 border-white/15 text-white text-xs"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase">
                Create Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PeerCard Subcomponent ────────────────────────────────────────────────────
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

function PeerCard({
  name,
  avatar,
  rank,
  level,
  isMuted,
  isDeafened,
  isSelf,
  iceState,
  volume,
  onVolumeChange
}: PeerCardProps) {
  const speaking = level > 14
  const qualityDot =
    iceState === "connected" || iceState === "completed" ? "bg-emerald-400" :
    iceState === "checking"                              ? "bg-amber-400" :
    iceState                                             ? "bg-rose-400" :
    isSelf                                               ? "bg-emerald-400" :
    "bg-white/20"

  return (
    <div className={`arena-card p-4 flex flex-col items-center text-center relative overflow-hidden rounded-2xl border transition-all duration-200 group ${
      speaking && !isMuted 
        ? "border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/10" 
        : "border-white/10 bg-black/40 hover:border-white/20"
    }`}>
      {/* Avatar Container */}
      <div className="relative mb-3">
        {speaking && !isMuted && (
          <span
            className="absolute inset-0 rounded-full bg-emerald-500/30 border-2 border-emerald-400 animate-ping"
            style={{ transform: `scale(${1 + level / 160})` }}
          />
        )}
        <img
          src={avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`}
          alt={name}
          className={`w-14 h-14 rounded-full object-cover relative z-10 transition-all border-2 ${
            speaking && !isMuted 
              ? "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
              : "border-white/20"
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black z-20 ${qualityDot}`}
          title={`ICE: ${iceState || (isSelf ? "Self" : "Idle")}`}
        />
      </div>

      {/* Name & Rank */}
      <div className="text-white font-black text-xs truncate w-full">{name}</div>
      {rank && <div className="text-[9px] text-white/40 uppercase font-bold mt-0.5 truncate">{rank}</div>}

      {/* Live Voice Level Visualizer Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-75 ${
            isMuted ? "bg-rose-500/50" : "bg-emerald-400"
          }`}
          style={{ width: `${isMuted ? 0 : level}%` }}
        />
      </div>

      {/* Status Badges */}
      <div className="flex gap-1 mt-2.5 flex-wrap justify-center">
        {isMuted && (
          <Badge className="bg-rose-500/20 text-rose-400 border-none text-[8px] uppercase font-bold px-1.5 py-0.5">
            <MicOff className="w-2.5 h-2.5 mr-0.5" /> Muted
          </Badge>
        )}
        {isDeafened && (
          <Badge className="bg-amber-500/20 text-amber-400 border-none text-[8px] uppercase font-bold px-1.5 py-0.5">
            <VolumeX className="w-2.5 h-2.5 mr-0.5" /> Deaf
          </Badge>
        )}
        {!isMuted && speaking && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] uppercase font-bold px-1.5 py-0.5">
            Speaking
          </Badge>
        )}
        {!isMuted && !speaking && !isDeafened && (
          <Badge className="bg-white/10 text-white/40 border-none text-[8px] uppercase font-bold px-1.5 py-0.5">
            Idle
          </Badge>
        )}
      </div>

      {/* Individual Peer Volume Slider */}
      {!isSelf && onVolumeChange && (
        <div className="mt-3 w-full pt-2 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-[8px] text-white/50 uppercase font-bold mb-1">
            <span className="flex items-center gap-1"><Volume1 className="w-2.5 h-2.5" /> Volume</span>
            <span>{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            value={volume}
            onChange={e => onVolumeChange(Number(e.target.value))}
            className="w-full h-1 accent-indigo-500 cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}

// ─── InfoRow Subcomponent ─────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
  ok
}: {
  label: string
  value: string
  icon: React.ReactNode
  ok?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-white/50">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-mono font-bold text-[11px] ${ok ? "text-emerald-400" : "text-white/40"}`}>
        {value}
      </span>
    </div>
  )
}
