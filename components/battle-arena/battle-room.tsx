"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Clock, Flag, CheckCircle, XCircle, Loader2, Code2, Brain,
  Calculator, BookOpen, TrendingUp, Shuffle, Zap, Trophy, AlertTriangle
} from "lucide-react"
import Editor from "@monaco-editor/react"

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
}

interface BattleRoomProps {
  config: {
    mode: string
    difficulty: string
    battleType: string
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
  mixed:      { label: 'Mixed Mode',       icon: Shuffle,     color: '#f97316', gradient: 'from-orange-600 to-red-500' },
}

const DIFF_XP: Record<string, number> = {
  beginner: 50, intermediate: 100, advanced: 200, expert: 400, master: 700, grandmaster: 1000,
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

  const timerRef = useRef<any>(null)
  const totalTimerRef = useRef<any>(null)
  const opponentTimerRef = useRef<any>(null)

  const modeConfig = MODE_CONFIG[config.mode] || MODE_CONFIG.math
  const ModeIcon = modeConfig.icon

  // Load questions from OpenAI
  useEffect(() => {
    const load = async () => {
      try {
        // Determine actual category (mixed picks random)
        const categories = ['coding', 'puzzle', 'math', 'gk', 'prediction']
        const mode = config.mode === 'mixed'
          ? categories[Math.floor(Math.random() * categories.length)]
          : config.mode

        // Try to get AI-generated questions first
        try {
          const res = await fetch('/api/arena/ai-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'generate-questions',
              mode,
              difficulty: config.difficulty,
              count: 5,
            })
          })
          const data = await res.json()
          if (data.success && data.questions?.length > 0) {
            const formattedQuestions = data.questions.map((q: any) => ({
              _id: q.id,
              category: mode,
              difficulty: config.difficulty,
              title: q.title,
              description: q.description,
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              xpReward: DIFF_XP[config.difficulty] || 50,
              pointsReward: q.points || 100,
              timeLimit: q.timeLimit || 60,
            }))
            setQuestions(formattedQuestions)
            if (formattedQuestions[0]?.boilerplate) setCode(formattedQuestions[0].boilerplate)
            setPhase('countdown')
            return
          }
        } catch (e) {
          console.warn('AI question generation failed, falling back:', e)
        }

        // Fallback to traditional API
        const userQuery = user?.id ? `&userId=${encodeURIComponent(user.id)}` : ''
        const res = await fetch(`/api/arena/questions?category=${mode}&difficulty=${config.difficulty}&count=5${userQuery}`)
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        const data = await res.json()
        if (data.questions?.length > 0) {
          setQuestions(data.questions)
          if (data.questions[0].boilerplate) setCode(data.questions[0].boilerplate)
          setPhase('countdown')
          return
        }

        // Last resort fallback
        setQuestions([{
          _id: '1', category: 'math', difficulty: config.difficulty,
          title: 'Quick Calculation', description: 'What is 15 × 7?',
          options: ['95', '100', '105', '110'], correctAnswer: '105',
          xpReward: DIFF_XP[config.difficulty] || 50, pointsReward: 100, timeLimit: 60,
        }])
        setPhase('countdown')
      } catch (e) {
        console.error('Load failed:', e)
        setQuestions([{
          _id: '1', category: 'math', difficulty: config.difficulty,
          title: 'Quick Calculation', description: 'What is 15 × 7?',
          options: ['95', '100', '105', '110'], correctAnswer: '105',
          xpReward: DIFF_XP[config.difficulty] || 50, pointsReward: 100, timeLimit: 60,
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

  // Total battle timer
  useEffect(() => {
    if (phase !== 'playing') return
    setTotalTimeLeft(300)
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) { clearInterval(totalTimerRef.current); endBattle(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(totalTimerRef.current)
  }, [phase])

  // Opponent AI simulation
  useEffect(() => {
    if (phase !== 'playing') return
    const speedMs = config.battleType === 'pve'
      ? { beginner: 12000, intermediate: 9000, advanced: 7000, expert: 5000, master: 4000, grandmaster: 3000 }[config.difficulty] || 8000
      : 15000
    opponentTimerRef.current = setInterval(() => {
      setOpponentScore(prev => {
        const add = Math.floor(Math.random() * (DIFF_XP[config.difficulty] || 50)) + 20
        return prev + add
      })
      setOpponentProgress(prev => Math.min(100, prev + Math.floor(Math.random() * 25) + 10))
    }, speedMs)
    return () => clearInterval(opponentTimerRef.current)
  }, [phase])

  const handleAnswer = useCallback((answer: string | null) => {
    if (showResult) return
    clearInterval(timerRef.current)
    setSelectedAnswer(answer)
    const q = questions[currentQ]
    const correct = answer !== null && answer === q?.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)
    setTotalAnswered(prev => prev + 1)

    if (correct) {
      const xpGain = Math.floor((q?.xpReward || 50) * (questionTimeLeft / (q?.timeLimit || 60)))
      setPlayerScore(prev => prev + xpGain)
      setPlayerCorrect(prev => prev + 1)
    }

    // Move to next question after 1.5s
    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      if (currentQ + 1 >= questions.length) {
        endBattle()
      } else {
        setCurrentQ(prev => prev + 1)
        if (questions[currentQ + 1]?.boilerplate) {
          setCode(questions[currentQ + 1].boilerplate)
        }
      }
    }, 1500)
  }, [showResult, currentQ, questions, questionTimeLeft])

  const endBattle = () => {
    clearInterval(timerRef.current)
    clearInterval(totalTimerRef.current)
    clearInterval(opponentTimerRef.current)
    const result = playerScore > opponentScore ? 'win' : playerScore < opponentScore ? 'loss' : 'draw'
    const xpGained = result === 'win'
      ? DIFF_XP[config.difficulty] * 5
      : result === 'draw' ? DIFF_XP[config.difficulty] * 2
      : DIFF_XP[config.difficulty]
    setFinalResult(result)
    setPhase('finished')

    // Record to API
    if (user?.id) {
      fetch('/api/arena/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          result, mode: config.mode, difficulty: config.difficulty,
          score: playerScore,
          accuracy: totalAnswered > 0 ? Math.round((playerCorrect / totalAnswered) * 100) : 0,
          xpGained,
          pointsGained: result === 'win' ? 200 : result === 'draw' ? 50 : 0,
          opponentName: config.battleType === 'pve' ? 'AI Overlord' : 'Opponent',
          battleId: `battle-${Date.now()}`,
        }),
      }).catch(() => {})
    }
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
    const xpGained = finalResult === 'win'
      ? DIFF_XP[config.difficulty] * 5
      : finalResult === 'draw' ? DIFF_XP[config.difficulty] * 2
      : DIFF_XP[config.difficulty]
    const accuracy = totalAnswered > 0 ? Math.round((playerCorrect / totalAnswered) * 100) : 0

    return (
      <div className="min-h-[60vh] arena-bg rounded-2xl flex items-center justify-center p-6">
        <div className="arena-victory max-w-md w-full">
          <div className="arena-card p-8 text-center space-y-6">
            {/* Result Icon */}
            <div className="relative inline-block">
              {finalResult === 'win' ? (
                <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mx-auto">
                  <Trophy className="w-14 h-14 text-yellow-400" />
                </div>
              ) : finalResult === 'loss' ? (
                <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto">
                  <XCircle className="w-14 h-14 text-red-400" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-14 h-14 text-blue-400" />
                </div>
              )}
            </div>

            <div>
              <div className="text-4xl font-black text-white mb-1">
                {finalResult === 'win' ? '🏆 VICTORY!' : finalResult === 'loss' ? '💔 DEFEAT' : '🤝 DRAW'}
              </div>
              <div className="text-white/50 text-sm">
                {config.mode.toUpperCase()} • {config.difficulty.toUpperCase()}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Your Score', value: playerScore, color: '#22c55e' },
                { label: 'Opp. Score', value: opponentScore, color: '#ef4444' },
                { label: 'Accuracy', value: `${accuracy}%`, color: '#f59e0b' },
                { label: 'Correct', value: `${playerCorrect}/${totalAnswered}`, color: '#3b82f6' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* XP Reward */}
            <div className="flex items-center justify-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 font-black">+{xpGained} XP Earned</span>
            </div>

            <div className="flex gap-3">
              <Button
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

  return (
    <div className="arena-bg rounded-2xl min-h-screen p-4 space-y-4">
      {/* Battle Header */}
      <div className="arena-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${modeConfig.color}20` }}>
            <ModeIcon className="w-4 h-4" style={{ color: modeConfig.color }} />
          </div>
          <div>
            <div className="text-white font-black text-sm">{modeConfig.label}</div>
            <div className="text-white/40 text-xs">{config.difficulty.toUpperCase()} • Q{currentQ + 1}/{questions.length}</div>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-lg ${totalTimeLeft < 60 ? 'text-red-400 border-red-500/40 bg-red-500/10 animate-pulse' : 'text-white border-white/10 bg-white/5'}`}>
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

      {/* Progress Bars */}
      <div className="arena-card p-4 space-y-3">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-indigo-400">YOU — {playerScore} pts</span>
            <span className="text-indigo-400">{playerProgress}%</span>
          </div>
          <div className="h-3 bg-indigo-500/20 rounded-full overflow-hidden battle-progress">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${playerProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-rose-400">{config.battleType === 'pve' ? 'AI OVERLORD' : 'OPPONENT'} — {opponentScore} pts</span>
            <span className="text-rose-400">{opponentProgress}%</span>
          </div>
          <div className="h-3 bg-rose-500/20 rounded-full overflow-hidden battle-progress">
            <div className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${opponentProgress}%` }} />
          </div>
        </div>
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

            {/* MCQ Options */}
            {!isCodingMode && q.options && q.options.length > 0 && (
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
                      className={`p-3 rounded-xl border transition-all text-left text-sm font-medium flex items-center gap-3 ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                      {showResult && opt === q.correctAnswer && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                      {showResult && selectedAnswer === opt && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
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

            {/* Answer feedback */}
            {showResult && (
              <div className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm ${isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {isCorrect
                  ? <><CheckCircle className="w-4 h-4" /> Correct! +{Math.floor(q.xpReward * (questionTimeLeft / q.timeLimit))} XP</>
                  : selectedAnswer
                    ? <><XCircle className="w-4 h-4" /> Wrong! Correct: {q.correctAnswer}</>
                    : <><AlertTriangle className="w-4 h-4" /> Time's up!</>
                }
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
