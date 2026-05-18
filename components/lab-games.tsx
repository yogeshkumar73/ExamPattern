"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Gamepad2, Trophy, Swords, Zap, HelpCircle, 
  RefreshCw, TrendingUp, CheckCircle, XCircle, 
  ChevronRight, CircleDot, Play, User, Bot, AlertTriangle 
} from "lucide-react"

interface LabGamesProps {
  points: number;
  onUpdatePoints: (delta: number) => void;
  userId: string | null;
  userEmail: string | null;
}

export function LabGames({ points, onUpdatePoints, userId, userEmail }: LabGamesProps) {
  const [activeGame, setActiveGame] = useState<"math" | "word" | "prob" | "calc" | "balloon" | null>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle")
  const [playerScore, setPlayerScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [gameResult, setGameResult] = useState<"win" | "loss" | "draw" | null>(null)
  
  // Game 1: Math Speed state
  const [mathQuestion, setMathQuestion] = useState({ q: "", ans: 0 })
  const [mathInput, setMathInput] = useState("")
  
  // Game 2: Word Battle state
  const [wordClue, setWordClue] = useState({ clue: "", scrambled: "", original: "" })
  const [wordInput, setWordInput] = useState("")

  // Game 3: Probability state
  const [probQuestion, setProbQuestion] = useState({ q: "", options: [] as number[], correct: 0 })
  
  // Game 4: Derivative combination state
  const [calcPair, setCalcPair] = useState({ f: "", df: "", options: [] as string[] })

  // Game 5: Balloon Math state
  const [balloons, setBalloons] = useState<Array<{ id: number; val: string; isCorrect: boolean; popped: boolean }>>([])
  const [balloonTarget, setBalloonTarget] = useState("")

  // Common timers
  const [timeLeft, setTimeLeft] = useState(30)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const botTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  
  useEffect(() => {
    // Load mock leaderboard or live users
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          const sorted = [...data.users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5)
          setLeaderboard(sorted)
        }
      })
      .catch(() => {
        // Fallback leaderboard
        setLeaderboard([
          { name: "Kabir Sharma", points: 540, rank: "Gold" },
          { name: "Alice Vance", points: 150, rank: "Bronze" },
          { name: "Rohan Gupta", points: 120, rank: "Bronze" }
        ])
      })
  }, [points])

  // Timer hook
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (gameState === "playing" && timeLeft === 0) {
      endGame()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [gameState, timeLeft])

  // Bot Competitor simulation hook
  useEffect(() => {
    if (gameState === "playing") {
      const interval = activeGame === "balloon" ? 2200 : 3500 // Bot speeds based on game type
      botTimerRef.current = setInterval(() => {
        // Simulating Bot answering correctly or popping balloon 70% probability
        if (Math.random() < 0.7) {
          setBotScore(prev => prev + 10)
          if (activeGame === "balloon") {
            // Bot pops one correct balloon
            setBalloons(prev => {
              const correctUnpopped = prev.find(b => b.isCorrect && !b.popped)
              if (correctUnpopped) {
                return prev.map(b => b.id === correctUnpopped.id ? { ...b, popped: true } : b)
              }
              return prev
            })
          }
        }
      }, interval)
    }
    return () => {
      if (botTimerRef.current) clearInterval(botTimerRef.current)
    }
  }, [gameState, activeGame])

  const startGame = (game: "math" | "word" | "prob" | "calc" | "balloon") => {
    setActiveGame(game)
    setGameState("playing")
    setPlayerScore(0)
    setBotScore(0)
    setTimeLeft(30)
    setGameResult(null)

    if (game === "math") generateMathQuestion()
    else if (game === "word") generateWordQuestion()
    else if (game === "prob") generateProbQuestion()
    else if (game === "calc") generateCalcQuestion()
    else if (game === "balloon") generateBalloons()
  }

  const endGame = async () => {
    setGameState("finished")
    if (timerRef.current) clearTimeout(timerRef.current)
    if (botTimerRef.current) clearInterval(botTimerRef.current)

    let outcome: "win" | "loss" | "draw" = "draw"
    let pointDelta = 0

    if (playerScore > botScore) {
      outcome = "win"
      pointDelta = 50
    } else if (playerScore < botScore) {
      outcome = "loss"
      pointDelta = -20
    }

    setGameResult(outcome)

    // Update Profile points securely on server
    if (userId && userEmail && pointDelta !== 0) {
      onUpdatePoints(pointDelta)
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            email: userEmail,
            points: Math.max(0, points + pointDelta)
          })
        })
      } catch (err) {
        console.warn("Could not sync points with server:", err)
      }
    }
  }

  // --- GAME GENERATORS & ACTIONS ---

  // Game 1: Logic & Speed Math
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 5
    const num2 = Math.floor(Math.random() * 15) + 3
    const operators = ["+", "-", "*"]
    const op = operators[Math.floor(Math.random() * operators.length)]
    
    let ans = 0
    if (op === "+") ans = num1 + num2
    else if (op === "-") ans = num1 - num2
    else if (op === "*") ans = num1 * num2

    setMathQuestion({ q: `${num1} ${op} ${num2}`, ans })
    setMathInput("")
  }

  const submitMathAnswer = () => {
    if (parseInt(mathInput) === mathQuestion.ans) {
      setPlayerScore(prev => prev + 10)
      generateMathQuestion()
    } else {
      setPlayerScore(prev => Math.max(0, prev - 5))
    }
  }

  // Game 2: Logical Word Decipher
  const generateWordQuestion = () => {
    const database = [
      { original: "ALGORITHM", clue: "A step-by-step procedure for solving a problem." },
      { original: "COMPILER", clue: "Translates high-level source code to machine code." },
      { original: "DATABASE", clue: "Structured set of data stored in a computer." },
      { original: "RECURSION", clue: "A function calling itself to solve subproblems." },
      { original: "VARIABLES", clue: "Container used to store data values." }
    ]
    const selected = database[Math.floor(Math.random() * database.length)]
    const scrambled = selected.original.split('').sort(() => Math.random() - 0.5).join('')
    
    setWordClue({ clue: selected.clue, scrambled, original: selected.original })
    setWordInput("")
  }

  const submitWordAnswer = () => {
    if (wordInput.toUpperCase() === wordClue.original) {
      setPlayerScore(prev => prev + 15)
      generateWordQuestion()
    } else {
      setPlayerScore(prev => Math.max(0, prev - 5))
    }
  }

  // Game 3: Mathematical Probability
  const generateProbQuestion = () => {
    const probabilityQuestions = [
      { q: "What is the probability of rolling a sum of 7 with two fair 6-sided dice? (x / 36)", options: [4, 6, 8], correct: 6 },
      { q: "If you draw 1 card from standard deck, what is the probability it is an Ace? (x / 52)", options: [2, 4, 13], correct: 4 },
      { q: "A bag has 3 red and 7 blue marbles. What is the probability of picking red? (%)", options: [30, 50, 70], correct: 30 },
      { q: "Probability of flipping 3 heads in a row with fair coin? (1 / x)", options: [4, 6, 8], correct: 8 }
    ]
    const selected = probabilityQuestions[Math.floor(Math.random() * probabilityQuestions.length)]
    setProbQuestion(selected)
  }

  const submitProbAnswer = (selectedOpt: number) => {
    if (selectedOpt === probQuestion.correct) {
      setPlayerScore(prev => prev + 10)
    } else {
      setPlayerScore(prev => Math.max(0, prev - 5))
    }
    generateProbQuestion()
  }

  // Game 4: Logarithmic Derivative Combinations
  const generateCalcQuestion = () => {
    const calculusDatabase = [
      { f: "log_e(x)", df: "1 / x" },
      { f: "x^3", df: "3x^2" },
      { f: "e^(2x)", df: "2e^(2x)" },
      { f: "sin(x)", df: "cos(x)" },
      { f: "cos(x)", df: "-sin(x)" }
    ]
    const selected = calculusDatabase[Math.floor(Math.random() * calculusDatabase.length)]
    
    // Mix options
    const allOptions = Array.from(new Set([
      selected.df, 
      "3x^2", "1 / x", "e^x", "cos(x)", "-sin(x)", "2e^(2x)"
    ])).slice(0, 3)
    if (!allOptions.includes(selected.df)) {
      allOptions[0] = selected.df
    }

    setCalcPair({ 
      f: selected.f, 
      df: selected.df, 
      options: allOptions.sort(() => Math.random() - 0.5) 
    })
  }

  const submitCalcAnswer = (selectedDf: string) => {
    if (selectedDf === calcPair.df) {
      setPlayerScore(prev => prev + 20)
    } else {
      setPlayerScore(prev => Math.max(0, prev - 5))
    }
    generateCalcQuestion()
  }

  // Game 5: Balloon Math POP
  const generateBalloons = () => {
    const mathPuzzles = [
      { target: "Find target equal to 8", correctVal: "2^3", options: ["2^3", "2+3", "9-2", "log_2(8)"] },
      { target: "Find derivative of x^2", correctVal: "2x", options: ["2x", "x", "2x^2", "x^2"] },
      { target: "Find value of log_3(9)", correctVal: "2", options: ["2", "3", "9", "1"] }
    ]
    const selected = mathPuzzles[Math.floor(Math.random() * mathPuzzles.length)]
    setBalloonTarget(selected.target)

    const mappedBalloons = selected.options.map((opt, i) => ({
      id: i,
      val: opt,
      isCorrect: opt === selected.correctVal,
      popped: false
    })).sort(() => Math.random() - 0.5)

    setBalloons(mappedBalloons)
  }

  const popBalloon = (balloonId: number) => {
    setBalloons(prev => prev.map(b => {
      if (b.id === balloonId) {
        if (b.isCorrect) {
          setPlayerScore(score => score + 25)
          setTimeout(() => generateBalloons(), 800)
        } else {
          setPlayerScore(score => Math.max(0, score - 10))
        }
        return { ...b, popped: true }
      }
      return b
    }))
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {gameState === "idle" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Select Arena */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-indigo-500/20 shadow-2xl glass-morphism">
              <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20">
                <CardTitle className="flex items-center gap-2 text-2xl font-black text-indigo-500">
                  <Gamepad2 className="w-8 h-8" /> LAB BATTLE ARENA
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground">
                  Challenge Bot competitors in logic games. Win to upgrade your ranking!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "math",
                    title: "Logic Speed Math",
                    desc: "Quickly match operators and solve logical arithmetic equations.",
                    icon: <Zap className="w-8 h-8 text-yellow-500" />
                  },
                  {
                    id: "word",
                    title: "Term Battle Decipher",
                    desc: "Deduce terms, scramble logic, and identify missing sequences.",
                    icon: <Swords className="w-8 h-8 text-rose-500" />
                  },
                  {
                    id: "prob",
                    title: "Probability Matrix",
                    desc: "Calculate real-time dice and card probability matrices.",
                    icon: <CircleDot className="w-8 h-8 text-emerald-500" />
                  },
                  {
                    id: "calc",
                    title: "Logarithmic Derivative Combinator",
                    desc: "Match dynamic limits, logarithm properties, and derivatives.",
                    icon: <TrendingUp className="w-8 h-8 text-cyan-500" />
                  },
                  {
                    id: "balloon",
                    title: "Balloon POP Mathematics",
                    desc: "Pop math balloons containing correct derivative/limit targets.",
                    icon: <Play className="w-8 h-8 text-indigo-500 animate-pulse" />
                  }
                ].map(game => (
                  <Card key={game.id} className="border hover:border-indigo-500 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-muted/40 rounded-xl mb-2">{game.icon}</div>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-500 border-indigo-500/20">AI vs Player</Badge>
                      </div>
                      <CardTitle className="text-lg font-black">{game.title}</CardTitle>
                      <CardDescription className="text-xs">{game.desc}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button onClick={() => startGame(game.id as any)} className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold gap-2 text-white">
                        <Play className="w-4 h-4" /> Start Battle
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Column */}
          <div className="space-y-6">
            <Card className="border-2 border-yellow-500/20 shadow-2xl glass-morphism">
              <CardHeader className="bg-yellow-500/10 border-b border-yellow-500/20">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-yellow-600">
                  <Trophy className="w-6 h-6" /> GLOBAL LEADERBOARD
                </CardTitle>
                <CardDescription className="text-xs">Top ranking experimenters in the lab</CardDescription>
              </CardHeader>
              <CardContent className="p-4 divide-y">
                {leaderboard.map((u, i) => (
                  <div key={i} className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0 ? "bg-yellow-500 text-black font-black" :
                        i === 1 ? "bg-slate-300 text-black font-black" :
                        i === 2 ? "bg-amber-600 text-white font-black" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">Tier: {u.rank || "Bronze"}</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 text-xs font-bold">
                      {u.points} PTS
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* --- PLAYING STATE SCREEN --- */}
      {gameState === "playing" && (
        <Card className="border-4 border-indigo-500 shadow-2xl overflow-hidden glass-morphism max-w-4xl mx-auto">
          {/* Battle Header */}
          <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 flex flex-row justify-between items-center px-6 py-4">
            <div className="flex items-center gap-2">
              <Swords className="w-6 h-6 text-indigo-500 animate-pulse" />
              <CardTitle className="text-lg font-black uppercase text-indigo-500">Live AI Duel</CardTitle>
            </div>
            <div className="flex gap-4 items-center">
              <Badge variant="outline" className="text-lg py-1 px-3 border-indigo-500 text-indigo-500 animate-pulse">
                ⏰ {timeLeft}s Left
              </Badge>
              <Button variant="destructive" size="sm" onClick={endGame} className="font-bold">Surrender</Button>
            </div>
          </CardHeader>

          {/* Scores Panel */}
          <div className="grid grid-cols-2 divide-x border-b bg-muted/20">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <User className="w-5 h-5 text-indigo-500" />
                <span className="text-xs uppercase font-black text-muted-foreground">Your Score</span>
              </div>
              <h3 className="text-3xl font-black text-indigo-500">{playerScore}</h3>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Bot className="w-5 h-5 text-rose-500" />
                <span className="text-xs uppercase font-black text-muted-foreground">QuantumBot AI</span>
              </div>
              <h3 className="text-3xl font-black text-rose-500">{botScore}</h3>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Game 1: Logic Math */}
            {activeGame === "math" && (
              <div className="space-y-6 max-w-md mx-auto text-center">
                <Badge className="bg-yellow-500 text-black font-black uppercase">LOGIC ARITHMETIC DRILL</Badge>
                <h3 className="text-5xl font-black tracking-widest bg-muted/40 py-6 rounded-2xl border-2">
                  {mathQuestion.q} = ?
                </h3>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={mathInput}
                    onChange={(e) => setMathInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitMathAnswer()}
                    placeholder="Type answer and press Enter..."
                    className="h-14 text-xl text-center border-2"
                  />
                  <Button onClick={submitMathAnswer} className="h-14 px-8 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-lg">
                    SUBMIT
                  </Button>
                </div>
              </div>
            )}

            {/* Game 2: Scrambled Word Battle */}
            {activeGame === "word" && (
              <div className="space-y-6 max-w-lg mx-auto text-center">
                <Badge className="bg-rose-500 text-white font-black uppercase">TERM DECIPHER CHALLENGE</Badge>
                <div className="bg-muted/40 p-6 rounded-2xl border-2 space-y-3">
                  <h3 className="text-3xl font-black tracking-widest text-indigo-500 uppercase">{wordClue.scrambled}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{wordClue.clue}</p>
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitWordAnswer()}
                    placeholder="Decipher logic term..."
                    className="h-14 text-xl text-center border-2 uppercase"
                  />
                  <Button onClick={submitWordAnswer} className="h-14 px-8 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-lg">
                    SOLVE
                  </Button>
                </div>
              </div>
            )}

            {/* Game 3: Probability Matrix */}
            {activeGame === "prob" && (
              <div className="space-y-6 max-w-lg mx-auto text-center">
                <Badge className="bg-emerald-500 text-white font-black uppercase">PROBABILITY PREDICTOR</Badge>
                <div className="bg-muted/40 p-6 rounded-2xl border-2">
                  <h3 className="text-xl font-black leading-relaxed">{probQuestion.q}</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {probQuestion.options.map((opt, i) => (
                    <Button 
                      key={i} 
                      onClick={() => submitProbAnswer(opt)}
                      className="h-16 text-lg font-black bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Game 4: Log Derivative Combinations */}
            {activeGame === "calc" && (
              <div className="space-y-6 max-w-lg mx-auto text-center">
                <Badge className="bg-cyan-500 text-white font-black uppercase">CALCULUS COMBINATOR</Badge>
                <div className="bg-muted/40 p-6 rounded-2xl border-2 space-y-2">
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Find Derivative of</p>
                  <h3 className="text-4xl font-black">{calcPair.f}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {calcPair.options.map((opt, i) => (
                    <Button 
                      key={i} 
                      onClick={() => submitCalcAnswer(opt)}
                      className="h-16 text-md font-black bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl border-none"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Game 5: Balloon POP Math */}
            {activeGame === "balloon" && (
              <div className="space-y-6 max-w-xl mx-auto text-center">
                <Badge className="bg-indigo-500 text-white font-black uppercase">BALLOON MATHEMATICS POP</Badge>
                <div className="bg-indigo-500/10 p-4 rounded-xl border-2 border-dashed border-indigo-500/30">
                  <p className="text-sm font-black text-indigo-600">{balloonTarget}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {balloons.map((b) => (
                    <button
                      key={b.id}
                      disabled={b.popped}
                      onClick={() => popBalloon(b.id)}
                      className={`h-28 rounded-full flex flex-col items-center justify-center font-black transition-all shadow-lg ${
                        b.popped 
                          ? "bg-muted text-muted-foreground scale-95 border-2 border-dashed" 
                          : "bg-gradient-to-b from-indigo-400 to-indigo-600 text-white hover:scale-105 border-none cursor-pointer"
                      }`}
                    >
                      {b.popped ? "💥 POP" : b.val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- RESULTS SCREEN --- */}
      {gameState === "finished" && (
        <Card className="border-4 border-indigo-500 shadow-2xl overflow-hidden glass-morphism max-w-md mx-auto text-center">
          <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 py-8">
            <div className="flex justify-center mb-4">
              {gameResult === "win" ? (
                <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>
              ) : gameResult === "loss" ? (
                <div className="w-20 h-20 bg-destructive/20 border-2 border-destructive rounded-full flex items-center justify-center text-destructive animate-pulse">
                  <XCircle className="w-12 h-12" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center text-yellow-500">
                  <AlertTriangle className="w-12 h-12" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl font-black">
              {gameResult === "win" ? "🏆 VICTORY!" : gameResult === "loss" ? "💔 DEFEAT!" : "🤝 DRAW MATCH!"}
            </CardTitle>
            <CardDescription className="font-bold text-sm uppercase mt-2">
              {gameResult === "win" ? "+50 Points earned" : gameResult === "loss" ? "-20 Points deducted" : "No point change"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl">
              <span className="font-black text-sm uppercase">Your Final Score</span>
              <Badge className="bg-indigo-500 font-bold">{playerScore}</Badge>
            </div>
            <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl">
              <span className="font-black text-sm uppercase">QuantumBot AI Score</span>
              <Badge variant="destructive" className="font-bold">{botScore}</Badge>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 border-t p-4 flex gap-3">
            <Button onClick={() => startGame(activeGame!)} className="flex-1 bg-indigo-500 hover:bg-indigo-600 font-black gap-2 text-white">
              <RefreshCw className="w-4 h-4" /> Rematch
            </Button>
            <Button onClick={() => setGameState("idle")} variant="outline" className="flex-1 font-black">
              Arena Lobby
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
