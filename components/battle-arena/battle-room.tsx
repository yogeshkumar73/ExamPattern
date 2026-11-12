"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Clock, Flag, CheckCircle, XCircle, Loader2, Code2, Brain,
  Calculator, BookOpen, TrendingUp, Shuffle, Zap, Trophy, AlertTriangle,
  Palette
} from "lucide-react"
import Editor from "@monaco-editor/react"
import { ColorBallArena } from "./color-ball-arena"
import { DuelVoiceChat } from "./duel-voice-chat"

interface Question {
  _id: string
  category: string
  difficulty: string
  title: string
  description: string
  options?: string[]
  correctAnswer?: string
  boilerplate?: string
  xpReward: number
  pointsReward: number
  timeLimit: number
  explanation?: string
  hint?: string
  tags?: string[]
  topic?: string
}

interface BattleRoomProps {
  config: {
    mode: string
    difficulty: string
    battleType: string
    duelId?: string
    topic?: string
    document?: string
    opponent?: any
    teamSize?: number
    blueTeam?: any[]
    redTeam?: any[]
    roomCode?: string
    isPrivate?: boolean
  }
  user: any
  onBattleEnd: (result: any) => void
}

const MODE_CONFIG: Record<string, { label: string; icon: any; color: string; gradient: string }> = {
  coding:     { label: 'Coding Battle',    icon: Code2,       color: '#3b82f6', gradient: 'from-blue-600 to-cyan-500' },
  puzzle:     { label: 'Puzzle Battle',    icon: Brain,       color: '#8b5cf6', gradient: 'from-violet-600 to-purple-500' },
  math:       { label: 'Math Battle',      icon: Calculator,  color: '#10b981', gradient: 'from-emerald-600 to-teal-500' },
  gk:         { label: 'GK Battle',        icon: BookOpen,    color: '#f59e0b', gradient: 'from-amber-600 to-orange-500' },
  prediction: { label: 'Prediction Game',  icon: TrendingUp,  color: '#ec4899', gradient: 'from-pink-600 to-rose-500' },
  color:      { label: 'Color Match Battle', icon: Palette,   color: '#f43f5e', gradient: 'from-rose-500 via-purple-500 to-indigo-500' },
  mixed:      { label: 'Mixed Mode',       icon: Shuffle,     color: '#f97316', gradient: 'from-orange-600 to-red-500' },
  topicdoc:   { label: 'Topic & Doc AI',   icon: BookOpen,    color: '#06b6d4', gradient: 'from-cyan-600 to-blue-500' },
  custom:     { label: 'Topic & Document AI', icon: TrendingUp, color: '#06b6d4', gradient: 'from-cyan-600 to-blue-500' },
  document:   { label: 'Topic & Document AI', icon: TrendingUp, color: '#06b6d4', gradient: 'from-cyan-600 to-blue-500' },
}

const DIFF_XP: Record<string, number> = {
  beginner: 50, intermediate: 100, advanced: 200, expert: 400, master: 700, grandmaster: 1000,
}

// Question attempt count increases with difficulty level
const ATTEMPTS_SCALE: Record<string, number> = {
  beginner: 15,
  intermediate: 20,
  advanced: 25,
  expert: 30,
  master: 35,
  grandmaster: 40,
}

// Time per question scales dynamically with difficulty level
const TIME_MAP: Record<string, number> = {
  beginner: 90,
  intermediate: 75,
  advanced: 60,
  expert: 45,
  master: 35,
  grandmaster: 25,
}

export function BattleRoom({ config, user, onBattleEnd }: BattleRoomProps) {
  const [phase, setPhase] = useState<'loading' | 'countdown' | 'playing' | 'finished'>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [playerCorrect, setPlayerCorrect] = useState(0)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60)
  const [totalTimeLeft, setTotalTimeLeft] = useState(300)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [finalResult, setFinalResult] = useState<'win' | 'loss' | 'draw' | null>(null)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [opponentProgress, setOpponentProgress] = useState(0)
  const [teammateScore, setTeammateScore] = useState(0)
  const [colorGameView, setColorGameView] = useState<'ball' | 'grid'>('ball')

  // Duel real-time synchronization state
  const [opponentLiveScore, setOpponentLiveScore] = useState<number>(0)
  const [opponentLiveAnswered, setOpponentLiveAnswered] = useState<number>(0)
  const [opponentLiveCorrect, setOpponentLiveCorrect] = useState<number>(0)
  const [opponentStatus, setOpponentStatus] = useState<'playing' | 'finished' | 'waiting'>('waiting')
  const [rematchLoading, setRematchLoading] = useState(false)
  const [duelRound, setDuelRound] = useState(1)

  const timerRef = useRef<any>(null)
  const totalTimerRef = useRef<any>(null)
  const opponentTimerRef = useRef<any>(null)
  const teammateTimerRef = useRef<any>(null)

  const modeConfig = MODE_CONFIG[config.mode] || MODE_CONFIG.math
  const ModeIcon = modeConfig.icon

  // Track answered question IDs for deduplication across refetches and sessions
  const answeredIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`answered_qs_${user?.id || 'guest'}`);
      if (stored) {
        answeredIdsRef.current = new Set(JSON.parse(stored));
      }
    } catch(e) {}
  }, [user?.id]);

  // Real-time Duel State Sync & Opponent Score Polling
  useEffect(() => {
    if (!config.duelId || !user?.id) return

    const syncDuelState = async () => {
      try {
        const res = await fetch('/api/arena/duel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync',
            duelId: config.duelId,
            userId: user.id,
            name: user.name || 'Student',
            avatar: user.avatar || user.photoUrl || '',
            score: playerScore,
            answered: totalAnswered,
            correct: playerCorrect,
            status: phase === 'finished' ? 'finished' : 'playing',
            mode: config.mode,
            difficulty: config.difficulty,
          }),
        })
        const data = await res.json()
        if (data.success && data.opponent) {
          setOpponentLiveScore(data.opponent.score || 0)
          setOpponentLiveAnswered(data.opponent.answered || 0)
          setOpponentLiveCorrect(data.opponent.correct || 0)
          setOpponentStatus(data.opponent.status || 'playing')
          setOpponentScore(data.opponent.score || 0)
          const oppTotal = questions.length || 15
          setOpponentProgress(Math.min(100, Math.round(((data.opponent.answered || 0) / oppTotal) * 100)))
        }
        if (data.round && data.round > duelRound) {
          setDuelRound(data.round)
          setPlayerScore(0)
          setPlayerCorrect(0)
          setTotalAnswered(0)
          setCurrentQ(0)
          setOpponentScore(0)
          setOpponentLiveScore(0)
          setOpponentLiveAnswered(0)
          setOpponentLiveCorrect(0)
          setOpponentStatus('playing')
          setFinalResult(null)
          setPhase('playing')
        }
      } catch (_) {}
    }

    syncDuelState()
    const syncInterval = setInterval(syncDuelState, 2500)
    return () => clearInterval(syncInterval)
  }, [config.duelId, user?.id, playerScore, totalAnswered, playerCorrect, phase, config.mode, config.difficulty, questions.length, duelRound])

  // Load questions — unified hybrid engine handles all fallback internally
  useEffect(() => {
    const load = async () => {
      try {
        // Determine actual mode (mixed picks random from all modes including topicdoc and color)
        const modes = ['coding', 'puzzle', 'math', 'gk', 'prediction', 'topicdoc', 'color']
        const mode = config.mode === 'mixed'
          ? modes[Math.floor(Math.random() * modes.length)]
          : config.mode

        // Build exclude_ids to prevent repeating answered questions (keep last 100 to avoid giant URLs)
        const excludeParam = answeredIdsRef.current.size > 0
          ? `&exclude_ids=${encodeURIComponent([...answeredIdsRef.current].slice(-100).join(','))}`
          : ''

        const topicParam = config.topic ? `&topic=${encodeURIComponent(config.topic)}` : ''
        const docParam = config.document ? `&document=${encodeURIComponent(config.document)}` : ''
        const userParam = user?.id ? `&user_id=${encodeURIComponent(user.id)}` : ''

        // Scale question attempt limit based on user difficulty level
        const targetLimit = ATTEMPTS_SCALE[config.difficulty] || 15;
        // Single unified endpoint — handles Python service → DB → memory internally
        const res = await fetch(
          `/api/arena/questions?mode=${mode}&difficulty=${config.difficulty}&limit=${targetLimit}${excludeParam}${topicParam}${docParam}${userParam}`,
          { signal: AbortSignal.timeout(8000) }
        )

        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data = await res.json()
        if (data.questions?.length > 0) {
          // Deduplicate by title to ensure no repeated questions even if API sends duplicates
          const uniqueQs = Array.from(new Map(data.questions.map((q: any) => [q.title, q])).values()) as any;
          let qs = uniqueQs;
          
          if (qs.length > targetLimit) {
            qs = qs.slice(0, targetLimit);
          }
          
          setQuestions(qs)
          if (qs[0]?.boilerplate) setCode(qs[0].boilerplate)
          setPhase('countdown')
          return
        }

        throw new Error('No questions returned')
      } catch (e) {
        console.error('[BattleRoom] Question load failed, using emergency fallback:', e)
        // Emergency single question — frontend never shows an empty state
        setQuestions([{
          _id: `fallback-${Date.now()}`,
          category: config.mode,
          difficulty: config.difficulty,
          title: 'Quick Math',
          description: 'What is 15 × 7?',
          options: ['95', '100', '105', '110'],
          correctAnswer: '105',
          explanation: '15 × 7 = 105.',
          hint: 'Multiply 15 by 7.',
          xpReward: DIFF_XP[config.difficulty] || 50,
          pointsReward: 100,
          timeLimit: 60,
        }])
        setPhase('countdown')
      }
    }
    load()
  }, [config])

  // Countdown 3-2-1
  useEffect(() => {
    if (phase !== 'countdown') return
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); setPhase('playing'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  // Question timer
  useEffect(() => {
    if (phase !== 'playing' || showResult) return
    const q = questions[currentQ]
    const limit = q?.timeLimit || 60
    setQuestionTimeLeft(limit)
    timerRef.current = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAnswer(null) // timeout = wrong
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, currentQ, showResult])

  // Total battle timer - dynamically scaled to attempts and difficulty time limit
  useEffect(() => {
    if (phase !== 'playing') return
    const perQTime = questions[0]?.timeLimit || TIME_MAP[config.difficulty] || 60
    const estTime = Math.max(300, (questions.length || 15) * Math.round(perQTime * 0.75))
    setTotalTimeLeft(estTime)
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) { clearInterval(totalTimerRef.current); endBattle(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(totalTimerRef.current)
  }, [phase, questions, config.difficulty])

  // Opponent & Team simulation (skipped when in real 1v1 duel with duelId)
  useEffect(() => {
    if (phase !== 'playing') return
    if (config.duelId) return // Live opponent scores are synced in real-time
    const speedMs = config.battleType === 'pve'
      ? { beginner: 12000, intermediate: 9000, advanced: 7000, expert: 5000, master: 4000, grandmaster: 3000 }[config.difficulty] || 8000
      : config.battleType === 'team' ? 10000 : 13000

    opponentTimerRef.current = setInterval(() => {
      setOpponentScore(prev => {
        const multiplier = config.battleType === 'team' ? (config.teamSize || 2) : 1
        const add = Math.floor(Math.random() * (DIFF_XP[config.difficulty] || 50) * multiplier) + 20
        return prev + add
      })
      setOpponentProgress(prev => Math.min(100, prev + Math.floor(Math.random() * 20) + 10))
    }, speedMs)

    // In team battle, teammate periodically scores for Blue Team
    if (config.battleType === 'team') {
      teammateTimerRef.current = setInterval(() => {
        setTeammateScore(prev => {
          const add = Math.floor(Math.random() * (DIFF_XP[config.difficulty] || 50)) + 25
          return prev + add
        })
      }, 12000)
    }

    return () => {
      clearInterval(opponentTimerRef.current)
      clearInterval(teammateTimerRef.current)
    }
  }, [phase, config.battleType, config.difficulty, config.teamSize])

  const handleAnswer = useCallback((answer: string | null) => {
    if (showResult) return
    clearInterval(timerRef.current)
    setSelectedAnswer(answer)
    const q = questions[currentQ]
    const correct = answer !== null && answer === q?.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)
    setTotalAnswered(prev => prev + 1)
    
    // Add to answered list and persist both ID and title to guarantee no repeating questions
    if (q?._id) answeredIdsRef.current.add(q._id);
    if (q?.title) answeredIdsRef.current.add(q.title);
    try {
      localStorage.setItem(
        `answered_qs_${user?.id || 'guest'}`, 
        JSON.stringify([...answeredIdsRef.current])
      )
    } catch(e) {}

    if (correct) {
      const xpGain = Math.floor((q?.xpReward || 50) * (questionTimeLeft / (q?.timeLimit || 60)))
      setPlayerScore(prev => prev + xpGain)
      setPlayerCorrect(prev => prev + 1)
    }

    // Report answer to game engine for live Grafana accuracy tracking
    fetch('/api/arena/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'answer',
        userId: user?.id,
        questionId: q?._id,
        isCorrect: correct,
        selectedAnswer: answer || '',
      }),
    }).catch(() => {})

    // Move to next question after 1.5s
    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      if (currentQ + 1 >= questions.length) {
        endBattle()
      } else {
        setCurrentQ(prev => prev + 1)
        if (questions[currentQ + 1]?.boilerplate) {
          setCode(questions[currentQ + 1].boilerplate || '')
        }
      }
    }, 1500)
  }, [showResult, currentQ, questions, questionTimeLeft])

  const endBattle = () => {
    clearInterval(timerRef.current)
    clearInterval(totalTimerRef.current)
    clearInterval(opponentTimerRef.current)
    clearInterval(teammateTimerRef.current)

    const effectiveOppScore = config.duelId ? opponentLiveScore : opponentScore
    const mySideScore = config.battleType === 'team' ? (playerScore + teammateScore) : playerScore
    const result = mySideScore > effectiveOppScore ? 'win' : mySideScore < effectiveOppScore ? 'loss' : 'draw'
    const xpGained = result === 'win'
      ? DIFF_XP[config.difficulty] * 5
      : result === 'draw' ? DIFF_XP[config.difficulty] * 2
      : DIFF_XP[config.difficulty]
    setFinalResult(result)
    setPhase('finished')

    // Sync finished state to duel room
    if (config.duelId && user?.id) {
      fetch('/api/arena/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          duelId: config.duelId,
          userId: user.id,
          name: user.name,
          avatar: user.avatar || user.photoUrl,
          score: mySideScore,
          answered: totalAnswered,
          correct: playerCorrect,
          status: 'finished',
          mode: config.mode,
          difficulty: config.difficulty,
        }),
      }).catch(() => {})
    }

    // Record to API
    if (user?.id) {
      const oppName = config.battleType === 'team'
        ? (config.redTeam?.map((r: any) => r.name).join(' & ') || 'Rivals Squad')
        : config.battleType === 'private'
        ? `Private Opponent (${config.roomCode || 'Room'})`
        : config.battleType === 'pve'
        ? 'AI Overlord'
        : (config.opponent?.name || 'Opponent')

      fetch('/api/arena/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          result,
          mode: config.mode,
          difficulty: config.difficulty,
          score: mySideScore,
          accuracy: totalAnswered > 0 ? Math.round((playerCorrect / totalAnswered) * 100) : 0,
          xpGained,
          pointsGained: result === 'win' ? 200 : result === 'draw' ? 50 : 0,
          opponentName: oppName,
          battleId: config.duelId || `battle-${Date.now()}`,
        }),
      }).catch(() => {})
    }
  }

  const handleRematch = async () => {
    if (!config.duelId) return
    setRematchLoading(true)
    try {
      await fetch('/api/arena/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rematch',
          duelId: config.duelId,
          userId: user?.id,
        }),
      })
      setPlayerScore(0)
      setPlayerCorrect(0)
      setTotalAnswered(0)
      setCurrentQ(0)
      setOpponentScore(0)
      setOpponentLiveScore(0)
      setOpponentLiveAnswered(0)
      setOpponentLiveCorrect(0)
      setOpponentStatus('playing')
      setFinalResult(null)
      setPhase('playing')
    } catch (_) {}
    setRematchLoading(false)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const playerProgress = Math.min(100, Math.round((playerScore / Math.max(1, playerScore + opponentScore + 1)) * 100))
  const q = questions[currentQ]

  // ---- COUNTDOWN SCREEN ----
  if (phase === 'countdown' || phase === 'loading') {
    return (
      <div className="min-h-[60vh] arena-bg rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-8xl font-black text-white" style={{ animation: 'countdown 0.5s ease', color: modeConfig.color }}>
            {phase === 'loading' ? <Loader2 className="w-16 h-16 animate-spin mx-auto" /> : countdown}
          </div>
          <div className="text-white/60 font-bold tracking-widest uppercase">
            {phase === 'loading' ? 'Loading Challenge...' : countdown > 0 ? 'Get Ready!' : 'FIGHT!'}
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-black" style={{ background: `${modeConfig.color}20`, color: modeConfig.color, border: `1px solid ${modeConfig.color}40` }}>
              {modeConfig.label}
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-black bg-white/10 text-white">
              {config.difficulty.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- FINISHED SCREEN ----
  if (phase === 'finished') {
    const oppFinalScore = config.duelId ? opponentLiveScore : opponentScore
    const xpGained = finalResult === 'win'
      ? DIFF_XP[config.difficulty] * 5
      : finalResult === 'draw' ? DIFF_XP[config.difficulty] * 2
      : DIFF_XP[config.difficulty]
    const accuracy = totalAnswered > 0 ? Math.round((playerCorrect / totalAnswered) * 100) : 0
    const oppAccuracy = opponentLiveAnswered > 0 ? Math.round((opponentLiveCorrect / opponentLiveAnswered) * 100) : 75

    // In a live duel: if you finished earlier, do NOT kick anyone out!
    // Display the live opponent progress and comparative scoreboard while they finish
    if (config.duelId && opponentStatus !== 'finished') {
      return (
        <div className="min-h-[70vh] arena-bg rounded-2xl flex items-center justify-center p-4">
          <div className="arena-card max-w-xl w-full p-6 sm:p-8 space-y-6 border border-indigo-500/30 bg-[#0c0d14]">
            {/* Duel Voice Bar at Top */}
            <div className="flex justify-center">
              <DuelVoiceChat
                roomId={config.duelId || 'duel-voice'}
                user={user}
                opponentName={config.opponent?.name || 'Opponent'}
                opponentAvatar={config.opponent?.photoUrl || config.opponent?.avatar}
              />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide">WAITING FOR OPPONENT</h2>
              <p className="text-xs sm:text-sm text-white/60">
                You completed your questions! <span className="text-rose-400 font-bold">{config.opponent?.name || 'Opponent'}</span> is still playing.
              </p>
              <div className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 inline-block">
                🛡️ You will not be kicked out! Speak with your opponent via voice chat.
              </div>
            </div>

            {/* Live Head-to-Head Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <div className="text-[11px] text-emerald-300 font-black uppercase flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> YOU (DONE)
                </div>
                <div className="text-3xl font-black text-white mt-1">{playerScore}</div>
                <div className="text-xs text-white/50 mt-1 font-semibold">{playerCorrect}/{totalAnswered} Correct ({accuracy}%)</div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center">
                <div className="text-[11px] text-rose-300 font-black uppercase flex items-center justify-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {config.opponent?.name || 'OPPONENT'} (PLAYING)
                </div>
                <div className="text-3xl font-black text-white mt-1">{opponentLiveScore}</div>
                <div className="text-xs text-white/50 mt-1 font-semibold">Q {opponentLiveAnswered}/{questions.length} answered</div>
              </div>
            </div>

            {/* Opponent Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-white/60">
                <span>{config.opponent?.name || 'Opponent'} Progress</span>
                <span>{opponentProgress}%</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/10 text-white/50 hover:text-white hover:bg-white/5"
              onClick={() => onBattleEnd({ result: finalResult || 'draw', xpGained, pointsGained: 0 })}
            >
              Leave Duel Early
            </Button>
          </div>
        </div>
      )
    }

    // Both players finished: Full Head-to-Head Scoreboard Comparison Card
    return (
      <div className="min-h-[70vh] arena-bg rounded-2xl flex items-center justify-center p-4 sm:p-6">
        <div className="arena-victory max-w-xl w-full">
          <div className="arena-card p-6 sm:p-8 space-y-6 bg-[#0c0d14] border border-white/10">
            {/* Voice Widget */}
            {(config.duelId || config.battleType === '1v1') && (
              <div className="flex justify-center">
                <DuelVoiceChat
                  roomId={config.duelId || 'duel-voice'}
                  user={user}
                  opponentName={config.opponent?.name || 'Opponent'}
                  opponentAvatar={config.opponent?.photoUrl || config.opponent?.avatar}
                />
              </div>
            )}

            {/* Result Header */}
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                {finalResult === 'win' ? (
                  <div className="w-20 h-20 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20">
                    <Trophy className="w-10 h-10 text-yellow-400" />
                  </div>
                ) : finalResult === 'loss' ? (
                  <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                    <XCircle className="w-10 h-10 text-rose-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                    <CheckCircle className="w-10 h-10 text-blue-400" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">
                  {finalResult === 'win' ? '🏆 VICTORY!' : finalResult === 'loss' ? '💔 DEFEAT' : '🤝 TIED DUEL!'}
                </h1>
                <div className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">
                  {config.mode.toUpperCase()} • {config.difficulty.toUpperCase()} • 1v1 DUEL
                </div>
              </div>
            </div>

            {/* Side-by-Side Head-to-Head Score Comparison */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              {/* Left: You */}
              <div className="text-center space-y-2 border-r border-white/10 pr-2">
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={user?.avatar || user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'You')}&background=6366f1&color=fff`}
                    alt="You"
                    className="w-10 h-10 rounded-xl object-cover border border-indigo-500"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">{user?.name || 'You'}</div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1 py-0 font-bold">Player</Badge>
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-emerald-400">{playerScore}</div>
                <div className="space-y-1 text-xs text-white/60">
                  <div>Accuracy: <span className="font-bold text-white">{accuracy}%</span></div>
                  <div>Correct: <span className="font-bold text-white">{playerCorrect}/{totalAnswered}</span></div>
                </div>
              </div>

              {/* Right: Opponent */}
              <div className="text-center space-y-2 pl-2">
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={config.opponent?.photoUrl || config.opponent?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(config.opponent?.name || 'Opponent')}&background=f43f5e&color=fff`}
                    alt="Opponent"
                    className="w-10 h-10 rounded-xl object-cover border border-rose-500"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">{config.opponent?.name || 'Opponent'}</div>
                    <Badge className="bg-rose-500/20 text-rose-300 text-[9px] px-1 py-0 font-bold">Rival</Badge>
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-rose-400">{oppFinalScore}</div>
                <div className="space-y-1 text-xs text-white/60">
                  <div>Accuracy: <span className="font-bold text-white">{oppAccuracy}%</span></div>
                  <div>Correct: <span className="font-bold text-white">{opponentLiveCorrect || Math.round(oppFinalScore / 60)}/{questions.length}</span></div>
                </div>
              </div>
            </div>

            {/* Score Comparison Delta Banner */}
            <div className="text-center py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">
              {playerScore > oppFinalScore ? (
                <span className="text-emerald-400">🔥 You outperformed your opponent by +{playerScore - oppFinalScore} points!</span>
              ) : playerScore < oppFinalScore ? (
                <span className="text-rose-400">⚔️ Opponent took the lead by +{oppFinalScore - playerScore} points. Demand a rematch!</span>
              ) : (
                <span className="text-blue-400">🤝 Perfectly matched! Both scored {playerScore} points.</span>
              )}
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
              <div className="flex items-center justify-center gap-2 p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-400 font-black text-xs">+{xpGained} XP</span>
              </div>
              <div className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl ${
                finalResult === 'win' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                finalResult === 'draw' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <Trophy className="w-4 h-4" />
                <span className="font-black text-xs">
                  {finalResult === 'win' ? '+200' : finalResult === 'draw' ? '+50' : '0'} Rank Pts
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {config.duelId && (
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black gap-2 shadow-lg"
                  disabled={rematchLoading}
                  onClick={handleRematch}
                >
                  {rematchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
                  Play Rematch
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 border font-bold"
                onClick={() => onBattleEnd({ result: finalResult, xpGained, pointsGained: finalResult === 'win' ? 200 : 0 })}
              >
                Return to Arena
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- PLAYING STATE ----
  const isCodingMode = q?.boilerplate !== undefined && q?.boilerplate !== '' && config.mode === 'coding'
  const isColorMode = config.mode === 'color' || q?.category === 'color'

  return (
    <div className="arena-bg rounded-2xl min-h-screen p-4 space-y-4">
      {/* Battle Header */}
      <div className="arena-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${modeConfig.color}20` }}>
            <ModeIcon className="w-4 h-4" style={{ color: modeConfig.color }} />
          </div>
          <div>
            <div className="text-white font-black text-sm flex items-center gap-2">
              {modeConfig.label}
              {config.duelId && (
                <span className="bg-gradient-to-r from-rose-500/20 to-indigo-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  1v1 DUEL
                </span>
              )}
              {config.battleType === 'private' && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.2 rounded font-mono">
                  {config.roomCode || 'PRIVATE'}
                </span>
              )}
              {config.battleType === 'team' && (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {config.teamSize || 2}v{config.teamSize || 2} TEAM
                </span>
              )}
              {config.battleType === '1v1' && !config.duelId && (
                <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] px-1.5 py-0.2 rounded font-bold">
                  1v1 RANKED
                </span>
              )}
            </div>
            <div className="text-white/40 text-xs">
              {config.difficulty.toUpperCase()} • Q{currentQ + 1}/{questions.length}
              {config.opponent?.name && config.battleType !== 'pve' && config.battleType !== 'team' && (
                <span className="text-white/60 ml-1.5 font-bold">vs {config.opponent.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* In-Game Duel Voice Chat Bar */}
        {(config.duelId || config.battleType === '1v1' || config.battleType === 'private') && (
          <div className="flex-1 max-w-md mx-auto">
            <DuelVoiceChat
              roomId={config.duelId || config.roomCode || 'duel-voice'}
              user={user}
              opponentName={config.opponent?.name || 'Opponent'}
              opponentAvatar={config.opponent?.photoUrl || config.opponent?.avatar}
            />
          </div>
        )}

        {/* Timer & Surrender */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border font-mono font-black text-base sm:text-lg ${totalTimeLeft < 60 ? 'text-red-400 border-red-500/40 bg-red-500/10 animate-pulse' : 'text-white border-white/10 bg-white/5'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(totalTimeLeft)}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => endBattle()}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold"
          >
            <Flag className="w-3 h-3 mr-1" /> Surrender
          </Button>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="arena-card p-4 space-y-3">
        {config.duelId ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-400">YOU — {playerScore} pts</span>
                <span className="text-emerald-400">{playerProgress}%</span>
              </div>
              <div className="h-3 bg-emerald-500/20 rounded-full overflow-hidden battle-progress">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${playerProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-400">{config.opponent?.name || 'OPPONENT'} — {opponentLiveScore} pts</span>
                <span className="text-rose-400">{opponentProgress}%</span>
              </div>
              <div className="h-3 bg-rose-500/20 rounded-full overflow-hidden battle-progress">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : config.battleType === 'team' ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-cyan-400">BLUE TEAM (YOUR SQUAD) — {playerScore + teammateScore} pts</span>
                <span className="text-cyan-400">
                  {Math.min(100, Math.round(((playerScore + teammateScore) / Math.max(1, playerScore + teammateScore + opponentScore)) * 100))}%
                </span>
              </div>
              <div className="h-3 bg-cyan-500/20 rounded-full overflow-hidden battle-progress">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((playerScore + teammateScore) / Math.max(1, playerScore + teammateScore + opponentScore)) * 100))}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/50 pt-0.5">
                <span>You: {playerScore} pts</span> • <span>Teammate: {teammateScore} pts</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-400">RED TEAM (RIVALS) — {opponentScore} pts</span>
                <span className="text-rose-400">{opponentProgress}%</span>
              </div>
              <div className="h-3 bg-rose-500/20 rounded-full overflow-hidden battle-progress">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-white/50 pt-0.5">
                {config.redTeam?.map((r: any) => r.name).join(' & ') || 'Rivals Squad'}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-indigo-400">YOU — {playerScore} pts (Correct: {playerCorrect}/{totalAnswered})</span>
                <span className="text-indigo-400">{playerProgress}%</span>
              </div>
              <div className="h-3 bg-indigo-500/20 rounded-full overflow-hidden battle-progress">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${playerProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-400">{config.battleType === 'pve' ? 'AI OVERLORD' : (config.opponent?.name ? config.opponent.name.toUpperCase() : 'OPPONENT')} — {opponentScore} pts</span>
                <span className="text-rose-400">{opponentProgress}%</span>
              </div>
              <div className="h-3 bg-rose-500/20 rounded-full overflow-hidden battle-progress">
                <div className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${opponentProgress}%` }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Question Area */}
      {q && (
        <div className={`grid gap-4 ${isCodingMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="arena-card p-5 space-y-4">
            {/* Question timer bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${questionTimeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                  style={{ width: `${(questionTimeLeft / (q.timeLimit || 60)) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-black w-8 text-right ${questionTimeLeft < 10 ? 'text-red-400' : 'text-white/60'}`}>
                {questionTimeLeft}s
              </span>
            </div>

            <div>
              <div className="text-white/40 text-xs font-bold uppercase mb-1">Q{currentQ + 1} of {questions.length}</div>
              <h3 className="text-white font-black text-lg">{q.title}</h3>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">{q.description}</p>
            </div>

            {/* XP reward indicator */}
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold">+{q.xpReward} XP for correct answer</span>
            </div>

            {/* Color Battle View Toggle */}
            {!isCodingMode && isColorMode && (
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-rose-400" />
                  {colorGameView === 'ball' ? '🎯 Interactive Hit-the-Ball Arena' : '📋 Option List View'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setColorGameView('ball')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      colorGameView === 'ball'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    🎯 Hit the Ball
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorGameView('grid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      colorGameView === 'grid'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    📋 List View
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Hit the Ball Arena */}
            {!isCodingMode && isColorMode && colorGameView === 'ball' && q.options && q.options.length > 0 && (
              <ColorBallArena
                options={q.options}
                correctAnswer={q.correctAnswer || ''}
                onHitAnswer={(opt) => !showResult && handleAnswer(opt)}
                disabled={showResult}
                difficulty={config.difficulty}
                questionTitle={q.title}
              />
            )}

            {/* Standard MCQ Options (Grid / List view) */}
            {!isCodingMode && (!isColorMode || colorGameView === 'grid') && q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, i) => {
                  let optStyle = 'border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5'
                  if (showResult && selectedAnswer === opt) {
                    optStyle = isCorrect
                      ? 'border-green-500 bg-green-500/20 text-green-300'
                      : 'border-red-500 bg-red-500/20 text-red-300'
                  } else if (showResult && opt === q.correctAnswer) {
                    optStyle = 'border-green-500 bg-green-500/10 text-green-300'
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => !showResult && handleAnswer(opt)}
                      disabled={showResult}
                      className={`p-3 rounded-xl border transition-all text-left text-xs sm:text-sm font-medium flex items-center gap-2 sm:gap-3 ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {(() => {
                        const hex = opt.match(/#([0-9A-Fa-f]{6})\b/)?.[0]
                        return hex ? (
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                        ) : null
                      })()}
                      <span className="flex-1 break-words">{opt}</span>
                      {showResult && opt === q.correctAnswer && <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />}
                      {showResult && selectedAnswer === opt && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Coding submit button */}
            {isCodingMode && (
              <Button
                onClick={() => handleAnswer(code ? 'correct' : null)}
                disabled={showResult || !code.trim()}
                className="w-full font-black gap-2"
                style={{ background: modeConfig.color }}
              >
                {showResult ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                SUBMIT SOLUTION
              </Button>
            )}

            {/* Answer feedback & mathematical explanation */}
            {showResult && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm ${isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isCorrect
                    ? <><CheckCircle className="w-4 h-4" /> Correct! +{Math.floor(q.xpReward * (questionTimeLeft / q.timeLimit))} XP</>
                    : selectedAnswer
                      ? <><XCircle className="w-4 h-4" /> Wrong! Correct: {q.correctAnswer}</>
                      : <><AlertTriangle className="w-4 h-4" /> Time&apos;s up! Correct: {q.correctAnswer}</>
                  }
                </div>
                {q.explanation && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 leading-relaxed">
                    <span className="font-bold text-indigo-400">💡 Analysis & Formula: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Code Editor for Coding Mode */}
          {isCodingMode && (
            <div className="arena-card overflow-hidden" style={{ height: '400px' }}>
              <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
