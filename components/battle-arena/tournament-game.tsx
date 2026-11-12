"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Swords, CheckCircle, XCircle, Clock, Loader2, Play, Trophy,
  Zap, Flame, Target, Sparkles, Award, ArrowRight, ShieldCheck,
  RotateCcw, AlertTriangle, Eye, Check, X, Terminal, Send, Code2
} from "lucide-react"
import { getStaticQuestions, type ArenaCategory, type ArenaDifficulty } from "@/lib/data/arenaQuestionBank"
import { ColorBallArena } from "./color-ball-arena"

interface TournamentGameProps {
  tournament: any
  user: any
  onMatchComplete: (round: number, match: number, winnerId: string, score1: number, score2: number) => void
  onLeave?: () => void
}

export function TournamentGame({ tournament, user, onMatchComplete, onLeave }: TournamentGameProps) {
  const [activeMatch, setActiveMatch] = useState<any>(null)
  const [matchStarted, setMatchStarted] = useState(false)
  const [matchFinished, setMatchFinished] = useState(false)
  const [matchDuration, setMatchDuration] = useState(300)
  const [timeLeft, setTimeLeft] = useState(300)

  // Scores
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [userCombo, setUserCombo] = useState(0)
  const [lastBotAction, setLastBotAction] = useState<string | null>(null)

  // Questions & Input Solution
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [codeAnswerInput, setCodeAnswerInput] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [winRewardMsg, setWinRewardMsg] = useState<string | null>(null)

  const timerRef = useRef<any>(null)
  const botIntervalRef = useRef<any>(null)

  // Find active or pending match for current user in current round
  useEffect(() => {
    if (tournament?.bracket) {
      // Find the match involving the current user in the tournament's currentRound
      const myMatch = tournament.bracket.find(
        (m: any) =>
          (m.round === tournament.currentRound || m.status !== "done") &&
          (m.player1Id === user?.id || m.player2Id === user?.id) &&
          m.status !== "done"
      ) || tournament.bracket.find(
        (m: any) =>
          (m.player1Id === user?.id || m.player2Id === user?.id) &&
          m.status !== "done"
      )

      setActiveMatch(myMatch)

      const duration = Number(tournament.matchDuration) || 300
      setMatchDuration(duration)
      setTimeLeft(duration)

      if (myMatch?.status === "active") {
        setMatchStarted(true)
      }
    }
  }, [tournament, user])

  // Load questions for the tournament mode and difficulty
  useEffect(() => {
    if (!tournament) return
    const fetchQuestions = async () => {
      setLoadingQuestions(true)
      const targetMode = (tournament.mode || "math").toLowerCase() as ArenaCategory
      const targetDiff = (tournament.difficulty || "intermediate").toLowerCase() as ArenaDifficulty
      const targetCount = Number(tournament.questionsPerMatch) || 10

      try {
        const res = await fetch(
          `/api/arena/questions?mode=${targetMode}&difficulty=${targetDiff}&limit=${targetCount}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
            setLoadingQuestions(false)
            return
          }
        }
      } catch (e) {
        console.warn("Failed to fetch API questions, falling back to static bank:", e)
      }

      // Safe static fallback
      const staticList = getStaticQuestions(targetMode, targetDiff, targetCount)
      if (staticList && staticList.length > 0) {
        setQuestions(
          staticList.map((q, i) => ({
            _id: `static-${targetMode}-${i}`,
            title: q.title,
            description: q.description,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            boilerplate: (q as any).boilerplate || "",
            tags: (q as any).tags || [],
            xpReward: q.xpReward || 50,
            pointsReward: q.pointsReward || 100,
          }))
        )
      }
      setLoadingQuestions(false)
    }

    fetchQuestions()
  }, [tournament])

  // Synchronize solution/code input when question changes
  useEffect(() => {
    const q = questions[currentQ]
    if (q) {
      setCodeAnswerInput(q.boilerplate || "")
    } else {
      setCodeAnswerInput("")
    }
    setShowResult(false)
    setSelectedAnswer(null)
    setScoreDelta(null)
  }, [currentQ, questions])

  // Countdown timer
  useEffect(() => {
    if (!matchStarted || matchFinished || !activeMatch) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleFinishMatch("timeout")
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [matchStarted, matchFinished, activeMatch])

  // Determine user orientation (Player 1 vs Player 2)
  const isPlayer1 = user?.id === activeMatch?.player1Id
  const myScore = isPlayer1 ? player1Score : player2Score
  const opponentScore = isPlayer1 ? player2Score : player1Score

  const player1 = tournament?.participants?.find((p: any) => p.userId === activeMatch?.player1Id)
  const player2 = tournament?.participants?.find((p: any) => p.userId === activeMatch?.player2Id)
  const opponentParticipant = isPlayer1 ? player2 : player1
  const isOpponentBot =
    opponentParticipant?.userId?.startsWith("bot-") ||
    opponentParticipant?.name?.includes("[AI Bot]") ||
    !opponentParticipant

  // Bot Opponent Simulation Engine
  useEffect(() => {
    if (!matchStarted || matchFinished || !activeMatch) return

    // Bot ticks every 6-9 seconds
    const diff = tournament?.difficulty || "intermediate"
    const accuracyRate =
      diff === "beginner"
        ? 0.55
        : diff === "intermediate"
        ? 0.7
        : diff === "advanced"
        ? 0.8
        : diff === "expert"
        ? 0.86
        : diff === "master"
        ? 0.92
        : 0.96

    const pointsPerQ = tournament?.rules?.pointsPerCorrect || 100

    botIntervalRef.current = setInterval(() => {
      const isBotCorrect = Math.random() < accuracyRate
      if (isBotCorrect) {
        const addedScore = pointsPerQ + Math.floor(Math.random() * 20)
        if (isPlayer1) {
          setPlayer2Score((prev) => prev + addedScore)
        } else {
          setPlayer1Score((prev) => prev + addedScore)
        }
        setLastBotAction(`+${addedScore} ${opponentParticipant?.name || "Opponent"}`)
        setTimeout(() => setLastBotAction(null), 1800)
      }
    }, 7000 + Math.random() * 3000)

    return () => clearInterval(botIntervalRef.current)
  }, [matchStarted, matchFinished, activeMatch, isPlayer1, tournament, opponentParticipant])

  // Start match
  const handleStartMatch = async () => {
    if (!activeMatch) return
    setMatchStarted(true)
    setMatchFinished(false)
    setTimeLeft(matchDuration)
    setPlayer1Score(0)
    setPlayer2Score(0)
    setCurrentQ(0)
    setUserCombo(0)

    try {
      await fetch("/api/arena/tournaments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament._id,
          round: activeMatch.round,
          match: activeMatch.match,
          action: "start",
        }),
      })
    } catch (e) {
      console.error("Failed to update tournament match start status:", e)
    }
  }

  // Handle Leaving the match
  const handleLeaveMatch = () => {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to forfeit and leave this tournament match?")) {
      clearInterval(timerRef.current)
      clearInterval(botIntervalRef.current)
      setMatchFinished(true)
      if (onLeave) {
        onLeave()
      }
    }
  }

  // Handle User Answer & Input Validation (Score increases on True, decreases on False)
  const handleAnswer = (answer: string) => {
    if (showResult || matchFinished) return
    const q = questions[currentQ]
    if (!q) return

    setSelectedAnswer(answer)
    setShowResult(true)

    const normalizedAns = String(answer || "").trim().toLowerCase()
    const normalizedCorrect = String(q.correctAnswer || "").trim().toLowerCase()

    let correct = false
    if (normalizedAns === normalizedCorrect) {
      correct = true
    } else if (normalizedCorrect && normalizedAns.includes(normalizedCorrect)) {
      correct = true
    } else if (q.options && q.options.length > 0 && answer === q.correctAnswer) {
      correct = true
    } else if (Array.isArray(q.tags) && q.tags.some((t: string) => normalizedAns.includes(t.toLowerCase()))) {
      correct = true
    } else if (
      normalizedAns.includes("return") &&
      (normalizedAns.includes("map") || normalizedAns.includes("index") || normalizedAns.includes("hash") || normalizedAns.includes("target"))
    ) {
      correct = true
    }

    setIsCorrect(correct)

    const basePts = tournament?.rules?.pointsPerCorrect || 100
    const speedBonus = Math.min(30, Math.floor(timeLeft / 10))
    const penalty = tournament?.rules?.penaltyPerWrong || 25 // Score decreases on false/incorrect

    if (correct) {
      const earned = basePts + speedBonus + userCombo * 10
      setUserCombo((c) => c + 1)
      setScoreDelta(earned)
      if (isPlayer1) {
        setPlayer1Score((s) => s + earned)
      } else {
        setPlayer2Score((s) => s + earned)
      }
    } else {
      setUserCombo(0)
      setScoreDelta(-penalty)
      if (isPlayer1) {
        setPlayer1Score((s) => Math.max(0, s - penalty))
      } else {
        setPlayer2Score((s) => Math.max(0, s - penalty))
      }
    }

    // Advance to next question after 1.4s
    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      setScoreDelta(null)

      if (currentQ + 1 >= questions.length) {
        // All questions completed!
        handleFinishMatch("questions_completed")
      } else {
        setCurrentQ((prev) => prev + 1)
      }
    }, 1400)
  }

  // Finish Match & Persist Win Rewards
  const handleFinishMatch = async (reason = "completed") => {
    if (!activeMatch || submitting || matchFinished) return
    setMatchFinished(true)
    clearInterval(timerRef.current)
    clearInterval(botIntervalRef.current)

    // Current final scores
    const finalP1 = player1Score
    const finalP2 = player2Score
    const userFinal = isPlayer1 ? finalP1 : finalP2
    const oppFinal = isPlayer1 ? finalP2 : finalP1

    const userWon = userFinal >= oppFinal
    const winnerId = userWon ? user?.id : opponentParticipant?.userId || "opponent"

    setSubmitting(true)

    try {
      // 1. Submit match result to tournament bracket API
      await fetch("/api/arena/tournaments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament._id,
          round: activeMatch.round,
          match: activeMatch.match,
          winnerId,
          player1Score: finalP1,
          player2Score: finalP2,
        }),
      })

      // 2. If User Won, persist XP, coins, wins to User Profile & Local Storage!
      if (userWon && user?.id) {
        const rewardXP = 300
        const rewardCoins = 100
        const rewardArenaPts = 50

        setWinRewardMsg(
          `🎉 MATCH VICTORY! +${rewardXP} XP, +${rewardCoins} Coins & +${rewardArenaPts} Arena Points awarded to your Profile!`
        )

        // Persist to /api/profile
        try {
          await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              updates: {
                xp: (user.xp || 0) + rewardXP,
                coins: (user.coins || 0) + rewardCoins,
                arenaPoints: (user.arenaPoints || 0) + rewardArenaPts,
                wins: (user.wins || 0) + 1,
              },
            }),
          })
        } catch (_) {}

        // Update local session storage
        try {
          const stored = localStorage.getItem("aura_session") || sessionStorage.getItem("aura_session")
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.user) {
              parsed.user.xp = (parsed.user.xp || 0) + rewardXP
              parsed.user.coins = (parsed.user.coins || 0) + rewardCoins
              parsed.user.arenaPoints = (parsed.user.arenaPoints || 0) + rewardArenaPts
              parsed.user.wins = (parsed.user.wins || 0) + 1
              localStorage.setItem("aura_session", JSON.stringify(parsed))
              sessionStorage.setItem("aura_session", JSON.stringify(parsed))
            }
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error("Error submitting tournament match:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!activeMatch) {
    return (
      <div className="arena-card rounded-2xl p-8 text-center space-y-4">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
        <h3 className="text-white font-black text-lg">No Active Match In This Round</h3>
        <p className="text-white/60 text-sm">
          You are waiting for the next bracket round or all your current tournament matches are complete.
        </p>
      </div>
    )
  }

  const currentQuestion = questions[currentQ]
  const totalScore = Math.max(1, player1Score + player2Score)
  const p1Width = Math.round((player1Score / totalScore) * 100)
  const p2Width = 100 - p1Width

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in">
      {/* ── MATCH MULTICAST HEADER ── */}
      <div className="arena-card rounded-2xl p-4 bg-gradient-to-r from-slate-950 via-black to-slate-950 border border-white/10 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-yellow-400" />
            <span className="font-black text-white text-base">
              Round {activeMatch.round} • Match {activeMatch.match}
            </span>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 uppercase text-[10px] font-black">
              {tournament.mode}
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            {lastBotAction && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                {lastBotAction}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-yellow-400">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              {formatTime(timeLeft)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveMatch}
              className="h-7 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white text-xs font-bold gap-1 px-2.5 rounded-xl transition-all"
              title="Leave and forfeit tournament match"
            >
              <X className="w-3.5 h-3.5" />
              <span>Leave Match</span>
            </Button>
          </div>
        </div>

        {/* ── MULTI-USER DUAL PLAYER CARD ── */}
        <div className="grid grid-cols-11 gap-2 items-center">
          {/* Player 1 Card */}
          <div
            className={`col-span-5 p-3 rounded-2xl border transition-all flex items-center gap-3 ${
              isPlayer1
                ? "border-blue-500/40 bg-blue-950/20 shadow-lg shadow-blue-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={player1?.avatar || "https://ui-avatars.com/api/?name=P1&background=3b82f6&color=fff"}
                alt={player1?.name || "Player 1"}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/50"
              />
              {isPlayer1 && (
                <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  YOU
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-sm truncate">{player1?.name || "Player 1"}</span>
              </div>
              <div className="text-2xl font-black text-blue-400 tracking-tight">{player1Score}</div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="col-span-1 text-center font-black text-white/30 text-xs tracking-widest">
            VS
          </div>

          {/* Player 2 Card */}
          <div
            className={`col-span-5 p-3 rounded-2xl border transition-all flex items-center justify-end gap-3 text-right ${
              !isPlayer1
                ? "border-purple-500/40 bg-purple-950/20 shadow-lg shadow-purple-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-white font-black text-sm truncate">{player2?.name || "Player 2"}</span>
                {isOpponentBot && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[9px] px-1 py-0">
                    BOT
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-black text-purple-400 tracking-tight">{player2Score}</div>
            </div>
            <div className="relative flex-shrink-0">
              <img
                src={player2?.avatar || "https://ui-avatars.com/api/?name=P2&background=a855f7&color=fff"}
                alt={player2?.name || "Player 2"}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/50"
              />
              {!isPlayer1 && (
                <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  YOU
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dual Tug-of-War Score Bar */}
        <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden flex border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
            style={{ width: `${p1Width}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
            style={{ width: `${p2Width}%` }}
          />
        </div>
      </div>

      {/* ── NOT STARTED STATE ── */}
      {!matchStarted && (
        <div className="arena-card rounded-2xl p-8 text-center space-y-5 border border-white/10 bg-black/40">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <Play className="w-8 h-8 ml-1" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              Match Ready: {tournament.name}
            </h3>
            <p className="text-white/60 text-xs max-w-md mx-auto">
              Mode: <strong className="text-white">{tournament.mode.toUpperCase()}</strong> • Difficulty:{" "}
              <strong className="text-white">{tournament.difficulty.toUpperCase()}</strong> • Duration:{" "}
              <strong className="text-white">{Math.round(matchDuration / 60)} Minutes</strong>
            </p>
          </div>

          <Button
            onClick={handleStartMatch}
            disabled={loadingQuestions}
            className="w-full max-w-md mx-auto h-12 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-black text-base rounded-xl shadow-lg shadow-green-500/30 gap-2"
          >
            {loadingQuestions ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Preparing Questions...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> START TOURNAMENT BATTLE
              </>
            )}
          </Button>
        </div>
      )}

      {/* ── ACTIVE GAMEPLAY ARENA ── */}
      {matchStarted && !matchFinished && (
        <div className="space-y-4">
          {loadingQuestions || !currentQuestion ? (
            <div className="arena-card p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-white/70 text-sm font-bold">Synchronizing Tournament Questions...</p>
            </div>
          ) : (
            <div className="arena-card p-5 sm:p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl space-y-4">
              {/* Question Header & Streak */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  {userCombo > 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black flex items-center gap-1 animate-bounce">
                      <Flame className="w-3 h-3 text-amber-400" /> {userCombo}x Streak
                    </span>
                  )}
                </div>

                <Badge className="bg-white/10 text-white/70 text-xs">
                  +{tournament.rules?.pointsPerCorrect || 100} pts
                </Badge>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                  {currentQuestion.title}
                </h4>
                {currentQuestion.description && currentQuestion.description !== currentQuestion.title && (
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* Gameplay: Color Ball Hit Arena OR MCQ Options / Code Input */}
              {tournament.mode === "color" ? (
                <div className="pt-2">
                  <ColorBallArena
                    options={currentQuestion.options || []}
                    correctAnswer={currentQuestion.correctAnswer || ""}
                    onHitAnswer={handleAnswer}
                    disabled={showResult}
                    difficulty={tournament.difficulty || "intermediate"}
                    questionTitle={currentQuestion.title}
                  />
                </div>
              ) : (() => {
                const effectiveOptions = (Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0)
                  ? currentQuestion.options
                  : (currentQuestion.title?.toLowerCase().includes("two sum") || currentQuestion.description?.toLowerCase().includes("two numbers"))
                  ? [
                      "return [map.get(complement), i]; // One-pass Hash Map O(N)",
                      "for (let i = 0; i < n; i++) for (let j = i+1; j < n; j++) if (nums[i]+nums[j]===target) return [i,j]; // O(N^2)",
                      "nums.sort(); return binarySearch(nums, target); // Loss of original indices O(N log N)",
                      "return [Math.floor(Math.random()*n), Math.floor(Math.random()*n)]; // Non-deterministic"
                    ]
                  : (currentQuestion.title?.toLowerCase().includes("palindrome"))
                  ? [
                      "s === s.split('').reverse().join(''); // String two-pointer / reversal",
                      "s.charCodeAt(0) === s.charCodeAt(s.length - 1); // Boundary check only",
                      "s.replace(/[^a-z0-9]/g, '').length % 2 === 0; // Even length check",
                      "s.indexOf(s[0]) === s.lastIndexOf(s[s.length - 1]); // Index lookup"
                    ]
                  : currentQuestion.boilerplate
                  ? [
                      `return ${currentQuestion.correctAnswer || "indices"}; // Optimal solution`,
                      `// Brute force iterative scan`,
                      `// Empty array fallback return []`,
                      `// Throw UnimplementedError()`
                    ]
                  : [
                      currentQuestion.correctAnswer || "Optimal Solution A",
                      "Alternative Solution B",
                      "Linear Fallback Solution C",
                      "Default Return Solution D"
                    ];

                return (
                  <div className="space-y-4 pt-2">
                    {/* 1. MCQ Option Cards */}
                    {effectiveOptions.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {effectiveOptions.map((opt: string, i: number) => {
                          let btnStyle = "border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5"
                          if (showResult && selectedAnswer === opt) {
                            btnStyle = isCorrect
                              ? "border-green-500 bg-green-500/20 text-green-300"
                              : "border-red-500 bg-red-500/20 text-red-300"
                          } else if (showResult && (opt === currentQuestion.correctAnswer || opt.toLowerCase().includes(String(currentQuestion.correctAnswer || "").toLowerCase()))) {
                            btnStyle = "border-green-500 bg-green-500/10 text-green-300"
                          }

                          return (
                            <button
                              key={i}
                              disabled={showResult}
                              onClick={() => handleAnswer(opt)}
                              className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all ${btnStyle}`}
                            >
                              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="flex-1 break-words font-mono text-xs">{opt}</span>
                              {showResult && (opt === currentQuestion.correctAnswer || opt.toLowerCase().includes(String(currentQuestion.correctAnswer || "").toLowerCase())) && (
                                <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />
                              )}
                              {showResult && selectedAnswer === opt && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* 2. Interactive Solution & Code Input Section */}
                    <div className="p-4 rounded-2xl bg-black/70 border border-indigo-500/30 space-y-3 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-black uppercase text-cyan-300 font-mono">
                            Solution & Code Input Section
                          </span>
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-mono">
                          Validation: +100 pts on TRUE • -25 pts on FALSE
                        </Badge>
                      </div>

                      <textarea
                        rows={4}
                        value={codeAnswerInput}
                        onChange={(e) => setCodeAnswerInput(e.target.value)}
                        disabled={showResult}
                        placeholder="Type your code solution, expression, or return answer here (e.g. return [map.get(d), i])..."
                        className="w-full bg-slate-950/90 border border-white/15 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder-white/30 focus:outline-none focus:border-cyan-400 shadow-inner"
                      />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <div className="text-[11px] text-white/50 font-mono">
                          Status: {showResult ? (isCorrect ? "✓ VALIDATED: TRUE" : "✗ VALIDATED: FALSE") : "Type solution or click option above"}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Button
                            size="sm"
                            disabled={showResult || !codeAnswerInput.trim()}
                            onClick={() => handleAnswer(codeAnswerInput)}
                            className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs h-8 px-4 gap-1.5 shadow-md shadow-indigo-600/30 rounded-xl"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Solution ⚡</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 3. Live Score Increase / Decrease Feedback Banner */}
                    {showResult && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs font-black flex items-center justify-between animate-in fade-in duration-200 ${
                          isCorrect
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm">
                              {isCorrect ? "✓ CORRECT ANSWER (TRUE)" : "✗ INCORRECT ANSWER (FALSE)"}
                            </div>
                            <div className="text-[11px] font-normal opacity-80">
                              {isCorrect
                                ? "Great job! Validated successfully. Score increased!"
                                : `Validation failed. Correct reference was: ${currentQuestion.correctAnswer || "optimal solution"}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono font-black text-sm">
                          <span className={isCorrect ? "text-emerald-400" : "text-rose-400"}>
                            {isCorrect ? `+${scoreDelta || 100} PTS` : `${scoreDelta || -25} PTS`}
                          </span>
                          <span className="block text-[9px] uppercase text-white/40">
                            {isCorrect ? "Score Increased" : "Score Decreased"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── MATCH FINISHED / RESULT SCREEN ── */}
      {matchFinished && (
        <div className="arena-card rounded-2xl p-6 sm:p-8 text-center space-y-5 border border-yellow-500/30 bg-gradient-to-b from-yellow-950/20 via-black to-black shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center mx-auto text-yellow-400">
            {myScore >= opponentScore ? (
              <Trophy className="w-10 h-10 animate-bounce" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-white/40" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-wide">
              {myScore >= opponentScore ? "🏆 MATCH VICTORY!" : "MATCH COMPLETE"}
            </h3>
            <p className="text-white/60 text-sm">
              Final Match Score: <strong className="text-blue-400">{myScore} pts</strong> vs{" "}
              <strong className="text-purple-400">{opponentScore} pts</strong>
            </p>
          </div>

          {winRewardMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 max-w-lg mx-auto">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{winRewardMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => {
                const winnerId = myScore >= opponentScore ? user?.id : opponentParticipant?.userId || "opponent"
                onMatchComplete(activeMatch.round, activeMatch.match, winnerId, player1Score, player2Score)
              }}
              className="px-8 h-11 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-black text-sm rounded-xl shadow-lg shadow-yellow-500/20"
            >
              <Trophy className="w-4 h-4 mr-2" /> Continue to Tournament Bracket
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentGame
