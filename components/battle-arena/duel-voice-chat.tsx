"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, Radio, PhoneCall, PhoneOff, Loader2 } from "lucide-react"

interface DuelVoiceChatProps {
  roomId: string
  user: { id: string; name: string; avatar?: string; arenaRank?: string }
  opponentName?: string
  opponentAvatar?: string
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

export function DuelVoiceChat({ roomId, user, opponentName = "Opponent", opponentAvatar }: DuelVoiceChatProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const [opponentSpeaking, setOpponentSpeaking] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const myPeerIdRef = useRef<string>(`peer-${user?.id || "guest"}-${Math.random().toString(36).substring(2, 7)}`)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const pollTimerRef = useRef<any>(null)

  // Web Audio analyzer for speaking visualization
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx
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
        setAudioLevel(Math.min(100, Math.round(avg * 1.5)))
        animFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (_) {}
  }

  // Send signaling messages
  const sendSignal = async (type: string, payload: any) => {
    try {
      await fetch("/api/arena/voice-signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signal",
          type,
          payload,
        }),
      })
    } catch (_) {}
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
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setOpponentConnected(true)
        setConnectionStatus("connected")
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setOpponentConnected(false)
      }
    }

    peerConnectionsRef.current.set(targetPeerId, pc)
    return pc
  }

  // Start Voice Session
  const startVoice = useCallback(async () => {
    setConnectionStatus("connecting")
    setErrorMessage(null)

    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
      } catch (err: any) {
        console.warn("[DuelVoice] Standard audio constraints failed, trying basic audio:", err)
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      localStreamRef.current = stream
      setupAudioAnalyzer(stream)

      // Register with signaling server
      await fetch("/api/arena/voice-signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          roomId,
          peerId: myPeerIdRef.current,
          userId: user?.id || "guest",
          name: user?.name || "Student",
          avatar: user?.avatar || "",
          rank: user?.arenaRank || "Bronze",
        }),
      })

      setIsJoined(true)
      setConnectionStatus("connected")

      // Start signaling poll loop
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/arena/voice-signaling?action=poll&peerId=${myPeerIdRef.current}&roomId=${roomId}`
          )
          const data = await res.json()
          if (!data.success) return

          // Update opponent presence
          if (data.peers && data.peers.length > 0) {
            setOpponentConnected(true)
            const opp = data.peers[0]
            if (opp?.isSpeaking) setOpponentSpeaking(true)
            else setOpponentSpeaking(false)

            // Initiate WebRTC offer if we are higher peerId lexicographically (prevents glare)
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
          } else {
            setOpponentConnected(false)
          }

          // Process incoming WebRTC signals
          if (data.signals && data.signals.length > 0) {
            for (const sig of data.signals) {
              const { fromId, type, payload } = sig
              const pc = getOrCreatePeerConnection(fromId)

              if (type === "offer" && payload?.sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                sendSignal("answer", {
                  targetId: fromId,
                  fromId: myPeerIdRef.current,
                  sdp: answer,
                })
              } else if (type === "answer" && payload?.sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
              } else if (type === "candidate" && payload?.candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
                } catch (_) {}
              }
            }
          }
        } catch (_) {}
      }, 2000)
    } catch (err: any) {
      console.error("[DuelVoice] Error accessing microphone:", err)
      setConnectionStatus("error")
      setErrorMessage(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone access denied. Please allow microphone permissions in your browser."
          : "Could not access microphone."
      )
    }
  }, [roomId, user])

  // Stop Voice Session
  const stopVoice = useCallback(async () => {
    clearInterval(pollTimerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})

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
  }, [])

  // Toggle Mute
  const toggleMute = () => {
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
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-white/10 backdrop-blur-md rounded-xl text-xs">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              opponentConnected
                ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"
                : connectionStatus === "connecting"
                ? "bg-yellow-400 animate-spin"
                : isJoined
                ? "bg-indigo-400"
                : "bg-white/20"
            }`}
          />
        </div>

        <span className="font-bold text-white flex items-center gap-1.5">
          <Radio className={`w-3.5 h-3.5 ${isJoined ? "text-indigo-400 animate-pulse" : "text-white/40"}`} />
          <span className="hidden sm:inline">Duel Voice:</span>
          {opponentConnected ? (
            <span className="text-emerald-400 font-bold truncate max-w-[120px]">
              {opponentName} {opponentSpeaking ? "🗣️" : "🟢"}
            </span>
          ) : connectionStatus === "connecting" ? (
            <span className="text-yellow-400">Connecting...</span>
          ) : isJoined ? (
            <span className="text-white/60">Waiting for {opponentName}...</span>
          ) : (
            <span className="text-white/40">Voice Off</span>
          )}
        </span>
      </div>

      {/* Audio Visualizer Waveform */}
      {isJoined && !isMuted && (
        <div className="flex items-center gap-0.5 h-4 px-1">
          {[0.4, 0.9, 0.6, 0.8].map((mult, i) => (
            <div
              key={i}
              className="w-1 bg-indigo-400 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, Math.min(16, (audioLevel * mult)))}px`,
                opacity: audioLevel > 5 ? 1 : 0.3,
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
              className={`h-7 w-7 p-0 rounded-lg ${
                isMuted
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  : "bg-white/5 text-emerald-400 hover:bg-white/10"
              }`}
              onClick={toggleMute}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-lg ${
                isDeafened
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  : "bg-white/5 text-indigo-300 hover:bg-white/10"
              }`}
              onClick={toggleDeafen}
              title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
            >
              {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
              onClick={stopVoice}
              title="Leave Voice"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 text-[11px]"
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
        <span className="hidden md:inline text-[10px] text-rose-400 truncate max-w-[150px]" title={errorMessage}>
          {errorMessage}
        </span>
      )}
    </div>
  )
}
