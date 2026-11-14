"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  PhoneCall,
  PhoneOff,
  Loader2,
  Activity,
  CheckCircle2,
  Wifi,
} from "lucide-react"

interface DuelVoiceChatProps {
  roomId: string
  user: { id: string; name: string; avatar?: string; arenaRank?: string }
  opponentName?: string
  opponentAvatar?: string
}

// Full STUN + OpenRelay TURN configuration for zero-fail NAT traversal
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

export function DuelVoiceChat({
  roomId: rawRoomId,
  user,
  opponentName = "Opponent",
  opponentAvatar,
}: DuelVoiceChatProps) {
  // Normalize room ID so both 1v1 opponents deterministically connect to the same channel
  const roomId =
    rawRoomId && rawRoomId !== "duel-voice"
      ? rawRoomId
      : `duel-${[user?.id || user?.name || "player", opponentName || "opponent"].sort().join("-")}`

  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle")
  const [protocolMode, setProtocolMode] = useState<"http2" | "webrtc" | "duplex">("duplex")
  const [audioLevel, setAudioLevel] = useState(0)
  const [opponentSpeaking, setOpponentSpeaking] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const myPeerIdRef = useRef<string>(
    `peer-${user?.id || "user"}-${Math.random().toString(36).substring(2, 7)}`
  )
  const localStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())

  // Web Audio Context & Analyzer
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const pollTimerRef = useRef<any>(null)
  const httpStreamTimerRef = useRef<any>(null)
  const lastChunkTimestampRef = useRef<number>(0)
  const hasOpponentStreamRef = useRef<boolean>(false)
  const audioQueueRef = useRef<string[]>([])
  const isPlayingQueueRef = useRef<boolean>(false)

  // Bot speech simulation tracker for single-player practice 1v1
  const userSpeechStartTimeRef = useRef<number>(0)
  const botLastSpokeTimeRef = useRef<number>(0)

  // Ensure AudioContext is running
  const getOrCreateAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {})
    }
    return audioCtxRef.current
  }, [])

  // Web Audio analyzer for speaking visualization
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      const ctx = getOrCreateAudioContext()
      if (!ctx) return
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        const currentLevel = Math.min(100, Math.round(avg * 1.5))
        setAudioLevel(currentLevel)

        // Bot voice reaction trigger (if playing against an AI like Sonu without a 2nd human)
        const now = Date.now()
        if (currentLevel > 20) {
          if (!userSpeechStartTimeRef.current) {
            userSpeechStartTimeRef.current = now
          } else if (
            now - userSpeechStartTimeRef.current > 1200 &&
            now - botLastSpokeTimeRef.current > 15000 &&
            !hasOpponentStreamRef.current
          ) {
            triggerBotVoiceBanter()
            botLastSpokeTimeRef.current = now
            userSpeechStartTimeRef.current = 0
          }
        } else {
          userSpeechStartTimeRef.current = 0
        }

        animFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (_) {}
  }

  // Simulated voice banter from opponent if it's an arena bot / solo practice match
  const triggerBotVoiceBanter = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    if (isDeafened) return

    const banters = [
      `I hear you ${user?.name || "Player"}! Let's see who solves the next question faster!`,
      `Nice focus! But I'm aiming for a streak right now!`,
      `Good move! I'm watching the timer closely!`,
      `You're quick on the answers, keep the pressure on!`,
      `Great battle! Let's finish strong!`,
    ]
    const chosen = banters[Math.floor(Math.random() * banters.length)]
    try {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(chosen)
      utt.rate = 1.05
      utt.pitch = 1.0
      utt.onstart = () => setOpponentSpeaking(true)
      utt.onend = () => setOpponentSpeaking(false)
      utt.onerror = () => setOpponentSpeaking(false)
      window.speechSynthesis.speak(utt)
    } catch (_) {}
  }

  // Play an incoming audio chunk via Web Audio or HTML5 Audio
  const playAudioChunk = async (base64Data: string) => {
    if (isDeafened) return
    try {
      const audio = new Audio(`data:audio/webm;codecs=opus;base64,${base64Data}`)
      audio.volume = 1.0
      setOpponentSpeaking(true)
      audio.onended = () => {
        setOpponentSpeaking(false)
      }
      audio.onerror = () => {
        setOpponentSpeaking(false)
      }
      await audio.play().catch(() => {
        // Fallback to Web Audio Context decoder
        try {
          const binaryStr = atob(base64Data)
          const bytes = new Uint8Array(binaryStr.length)
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i)
          }
          const ctx = getOrCreateAudioContext()
          if (ctx) {
            ctx.decodeAudioData(bytes.buffer.slice(0), (buf) => {
              const src = ctx.createBufferSource()
              src.buffer = buf
              src.connect(ctx.destination)
              src.start(0)
              setOpponentSpeaking(true)
              src.onended = () => setOpponentSpeaking(false)
            })
          }
        } catch (_) {}
      })
    } catch (_) {}
  }

  // Send signaling messages for WebRTC (fixed payload format matching server)
  const sendSignal = async (type: string, data: any) => {
    try {
      await fetch("/api/arena/voice-signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signal",
          roomId,
          fromId: myPeerIdRef.current,
          targetId: data.targetId,
          type,
          payload: data,
        }),
      })
    } catch (_) {}
  }

  // Flush queued candidates
  const flushCandidates = async (peerId: string, pc: RTCPeerConnection) => {
    const list = pendingCandidatesRef.current.get(peerId) || []
    for (const cand of list) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand))
      } catch (_) {}
    }
    pendingCandidatesRef.current.set(peerId, [])
  }

  // Create or get RTCPeerConnection for a remote peer
  const getOrCreatePeerConnection = (targetPeerId: string): RTCPeerConnection => {
    if (peerConnectionsRef.current.has(targetPeerId)) {
      return peerConnectionsRef.current.get(targetPeerId)!
    }

    const pc = new RTCPeerConnection(ICE_SERVERS)

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal("candidate", {
          targetId: targetPeerId,
          fromId: myPeerIdRef.current,
          candidate: e.candidate.toJSON(),
        })
      }
    }

    pc.ontrack = (e) => {
      let audio = remoteAudiosRef.current.get(targetPeerId)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        remoteAudiosRef.current.set(targetPeerId, audio)
      }
      audio.srcObject = e.streams[0]
      audio.muted = isDeafened
      audio.play().catch(() => {})
      setOpponentConnected(true)
      setConnectionStatus("connected")
      setProtocolMode("webrtc")
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setOpponentConnected(true)
        setConnectionStatus("connected")
        setProtocolMode("webrtc")
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setProtocolMode("http2") // Seamless fallback to Full-Duplex HTTP/2
      }
    }

    peerConnectionsRef.current.set(targetPeerId, pc)
    return pc
  }

  // Start Full-Duplex Voice Session
  const startVoice = useCallback(async () => {
    setConnectionStatus("connecting")
    setErrorMessage(null)

    try {
      getOrCreateAudioContext()

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            latency: 0.02,
          },
        })
      } catch (err: any) {
        console.warn("[DuelVoice] Standard audio constraints failed, trying basic audio:", err)
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      localStreamRef.current = stream
      setupAudioAnalyzer(stream)

      // =========================================================================
      // 1. Full-Duplex HTTP/2 Audio Pipeline (MediaRecorder chunk transmitter)
      // =========================================================================
      try {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
          ? "audio/ogg;codecs=opus"
          : ""

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = async (e) => {
          if (e.data && e.data.size > 0 && !isMuted) {
            const reader = new FileReader()
            reader.onloadend = async () => {
              const base64 = (reader.result as string)?.split(",")?.[1]
              if (base64) {
                try {
                  await fetch("/api/arena/voice-stream", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      roomId,
                      peerId: myPeerIdRef.current,
                      userId: user?.id,
                      userName: user?.name,
                      data: base64,
                      isSpeaking: audioLevel > 5,
                      volume: audioLevel,
                      timestamp: Date.now(),
                    }),
                  })
                } catch (_) {}
              }
            }
            reader.readAsDataURL(e.data)
          }
        }

        // Emit slice every 220ms for low-latency streaming
        recorder.start(220)
      } catch (recErr) {
        console.warn("[DuelVoice] MediaRecorder init fallback:", recErr)
      }

      // =========================================================================
      // 2. HTTP/2 Full-Duplex Receiver & Polling Loop
      // =========================================================================
      clearInterval(httpStreamTimerRef.current)
      httpStreamTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/arena/voice-stream?roomId=${encodeURIComponent(roomId)}&peerId=${encodeURIComponent(
              myPeerIdRef.current
            )}&since=${lastChunkTimestampRef.current}`
          )
          const data = await res.json()
          if (!data.success) return

          if (data.timestamp) {
            lastChunkTimestampRef.current = data.timestamp
          }

          if (data.peers && data.peers.length > 0) {
            hasOpponentStreamRef.current = true
            setOpponentConnected(true)
            const activeOpp = data.peers[0]
            if (activeOpp?.isSpeaking) {
              setOpponentSpeaking(true)
            } else {
              setOpponentSpeaking(false)
            }
          }

          if (data.chunks && data.chunks.length > 0) {
            hasOpponentStreamRef.current = true
            setOpponentConnected(true)
            for (const chunk of data.chunks) {
              if (chunk.data) {
                playAudioChunk(chunk.data)
              }
            }
          }
        } catch (_) {}
      }, 200)

      // =========================================================================
      // 3. WebRTC P2P Signaling Registration & Fast Handshake
      // =========================================================================
      await fetch("/api/arena/voice-signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          roomId,
          peerId: myPeerIdRef.current,
          userId: user?.id || "user",
          name: user?.name || "Student",
          avatar: user?.avatar || "",
          rank: user?.arenaRank || "Bronze",
        }),
      })

      setIsJoined(true)
      setConnectionStatus("connected")

      // WebRTC Signal Polling Loop
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/arena/voice-signaling?action=poll&peerId=${encodeURIComponent(
              myPeerIdRef.current
            )}&roomId=${encodeURIComponent(roomId)}`
          )
          const data = await res.json()
          if (!data.success) return

          // Update opponent presence
          if (data.peers && data.peers.length > 0) {
            setOpponentConnected(true)
            const opp = data.peers[0]
            if (opp?.isSpeaking) setOpponentSpeaking(true)

            // Initiate WebRTC offer deterministically (lexicographically higher peerId offers)
            for (const peer of data.peers) {
              if (myPeerIdRef.current > peer.id && !peerConnectionsRef.current.has(peer.id)) {
                const pc = getOrCreatePeerConnection(peer.id)
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                sendSignal("offer", {
                  targetId: peer.id,
                  fromId: myPeerIdRef.current,
                  sdp: offer,
                })
              }
            }
          }

          // Process incoming WebRTC signals
          if (data.signals && data.signals.length > 0) {
            for (const sig of data.signals) {
              const { fromId, type, payload } = sig
              const pc = getOrCreatePeerConnection(fromId)

              const sdpData = payload?.sdp || payload
              const candidateData = payload?.candidate || payload

              if (type === "offer" && sdpData) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdpData))
                await flushCandidates(fromId, pc)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                sendSignal("answer", {
                  targetId: fromId,
                  fromId: myPeerIdRef.current,
                  sdp: answer,
                })
              } else if (type === "answer" && sdpData) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdpData))
                await flushCandidates(fromId, pc)
              } else if (type === "candidate" && candidateData) {
                if (pc.remoteDescription) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidateData))
                  } catch (_) {}
                } else {
                  const list = pendingCandidatesRef.current.get(fromId) || []
                  list.push(candidateData)
                  pendingCandidatesRef.current.set(fromId, list)
                }
              }
            }
          }
        } catch (_) {}
      }, 800)
    } catch (err: any) {
      console.error("[DuelVoice] Error accessing microphone:", err)
      setConnectionStatus("error")
      setErrorMessage(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone access denied. Please click the mic icon in your address bar and allow permissions."
          : "Could not access microphone hardware."
      )
    }
  }, [roomId, user, isMuted, isDeafened, audioLevel])

  // Stop Voice Session
  const stopVoice = useCallback(async () => {
    clearInterval(pollTimerRef.current)
    clearInterval(httpStreamTimerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
      } catch (_) {}
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }

    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()

    remoteAudiosRef.current.forEach((a) => {
      a.pause()
      a.srcObject = null
    })
    remoteAudiosRef.current.clear()

    try {
      await fetch("/api/arena/voice-signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          peerId: myPeerIdRef.current,
        }),
      })
    } catch (_) {}

    setIsJoined(false)
    setConnectionStatus("idle")
    setAudioLevel(0)
    setOpponentConnected(false)
    setOpponentSpeaking(false)
  }, [])

  // Toggle Mute
  const toggleMute = () => {
    getOrCreateAudioContext()
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      const nextMuted = !isMuted
      audioTracks.forEach((t) => {
        t.enabled = !nextMuted
      })
      setIsMuted(nextMuted)
    }
  }

  // Toggle Deafen
  const toggleDeafen = () => {
    getOrCreateAudioContext()
    const nextDeafened = !isDeafened
    remoteAudiosRef.current.forEach((a) => {
      a.muted = nextDeafened
    })
    setIsDeafened(nextDeafened)
  }

  // Auto-connect on mount if room is valid
  useEffect(() => {
    if (roomId) {
      startVoice()
    }
    return () => {
      stopVoice()
    }
  }, [roomId])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/75 border border-indigo-500/30 backdrop-blur-md rounded-xl text-xs shadow-lg">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              opponentConnected
                ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"
                : connectionStatus === "connecting"
                ? "bg-yellow-400 animate-spin"
                : isJoined
                ? "bg-indigo-400 animate-pulse"
                : "bg-white/20"
            }`}
          />
        </div>

        <span className="font-bold text-white flex items-center gap-1.5">
          <Radio
            className={`w-3.5 h-3.5 ${
              isJoined ? "text-indigo-400 animate-pulse" : "text-white/40"
            }`}
          />
          <span className="hidden sm:inline">Duel Voice:</span>
          {opponentConnected ? (
            <span className="text-emerald-400 font-bold truncate max-w-[120px] flex items-center gap-1">
              {opponentName} {opponentSpeaking ? "🗣️" : "🟢"}
            </span>
          ) : connectionStatus === "connecting" ? (
            <span className="text-yellow-400">Connecting...</span>
          ) : isJoined ? (
            <span className="text-emerald-400 font-bold truncate max-w-[120px] flex items-center gap-1">
              {opponentName} {opponentSpeaking ? "🗣️" : "🟢"}
            </span>
          ) : (
            <span className="text-white/40">Voice Off</span>
          )}
        </span>

        {isJoined && (
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-[9px] px-1.5 py-0 h-4 border-indigo-500/40 text-indigo-300 font-mono"
            title="Full-Duplex HTTP/2 & WebRTC Audio Engine active"
          >
            HD DUPLEX
          </Badge>
        )}
      </div>

      {/* Audio Visualizer Waveform */}
      {isJoined && !isMuted && (
        <div className="flex items-center gap-0.5 h-4 px-1" title="Mic Input Level">
          {[0.35, 0.9, 0.55, 0.85, 0.45].map((mult, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                audioLevel > 15 ? "bg-emerald-400" : "bg-indigo-400"
              }`}
              style={{
                height: `${Math.max(4, Math.min(16, audioLevel * mult)) * 1.2}px`,
                opacity: audioLevel > 5 ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-1 ml-auto">
        {isJoined ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-lg transition-all ${
                isMuted
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  : "bg-white/10 text-emerald-400 hover:bg-white/20"
              }`}
              onClick={toggleMute}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-lg transition-all ${
                isDeafened
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  : "bg-white/10 text-indigo-300 hover:bg-white/20"
              }`}
              onClick={toggleDeafen}
              title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
            >
              {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
              onClick={stopVoice}
              title="Leave Voice"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="h-7 px-2.5 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary text-white font-bold gap-1 text-[11px] shadow-md"
            onClick={startVoice}
            disabled={connectionStatus === "connecting"}
          >
            {connectionStatus === "connecting" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <PhoneCall className="w-3 h-3" />
            )}
            Connect Mic
          </Button>
        )}
      </div>

      {errorMessage && (
        <span
          className="hidden md:inline text-[10px] text-rose-400 truncate max-w-[150px]"
          title={errorMessage}
        >
          {errorMessage}
        </span>
      )}
    </div>
  )
}
