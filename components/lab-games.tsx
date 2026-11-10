"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Trophy, Swords, Clock, AlertTriangle, CheckCircle, XCircle, Bot, User, Play, Loader2 } from "lucide-react"
import Editor from "@monaco-editor/react"

interface LabGamesProps {
  points: number;
  onUpdatePoints: (delta: number) => void;
  userId: string | null;
  userEmail: string | null;
}

interface GeneratedQuestion {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  boilerplate?: string;
  testCases?: Array<{ input: string; output: string }>;
}

const mockBattleQuestions: GeneratedQuestion[] = [
  { id: "b1", title: "Two Sum", difficulty: "Easy", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", boilerplate: "function twoSum(nums, target) {\n  \n}", category: "Array", tags: ["Array", "Hash Table"] },
  { id: "b2", title: "Reverse String", difficulty: "Easy", description: "Write a function that reverses a string. The input string is given as an array of characters s.", boilerplate: "function reverseString(s) {\n  \n}", category: "String", tags: ["String", "Two Pointers"] },
  { id: "b3", title: "Valid Palindrome", difficulty: "Easy", description: "Given a string s, return true if it is a palindrome, or false otherwise.", boilerplate: "function isPalindrome(s) {\n  \n}", category: "String", tags: ["String", "Two Pointers"] },
  { id: "b4", title: "Max Subarray", difficulty: "Medium", description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.", boilerplate: "function maxSubArray(nums) {\n  \n}", category: "Array", tags: ["Array", "Dynamic Programming"] },
  { id: "b5", title: "Longest Substring Without Repeating", difficulty: "Medium", description: "Given a string s, find the length of the longest substring without duplicate characters.", boilerplate: "function lengthOfLongestSubstring(s) {\n  \n}", category: "String", tags: ["Sliding Window", "Hash Table"] },
  { id: "b6", title: "Coin Change", difficulty: "Medium", description: "Return the fewest number of coins needed to make up a given target amount.", boilerplate: "function coinChange(coins, amount) {\n  \n}", category: "Dynamic Programming", tags: ["DP", "BFS"] },
  { id: "b7", title: "Trapping Rain Water", difficulty: "Hard", description: "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.", boilerplate: "function trap(height) {\n  \n}", category: "Algorithm", tags: ["Two Pointers", "Stack"] },
  { id: "b8", title: "Median of Two Sorted Arrays", difficulty: "Hard", description: "Given two sorted arrays, return their median with O(log(m+n)) runtime complexity.", boilerplate: "function findMedianSortedArrays(nums1, nums2) {\n  \n}", category: "Algorithm", tags: ["Binary Search", "Divide & Conquer"] }
]

export function LabGames({ points, onUpdatePoints, userId, userEmail }: LabGamesProps) {
  const [gameState, setGameState] = useState<"lobby" | "matching" | "playing" | "finished">("lobby")
  const [mode, setMode] = useState<"pvp" | "pve">("pve")
  const [question, setQuestion] = useState<GeneratedQuestion>(mockBattleQuestions[0])
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  
  const [playerProgress, setPlayerProgress] = useState(0)
  const [opponentProgress, setOpponentProgress] = useState(0)
  const [opponent, setOpponent] = useState<{
    _id?: string;
    name: string;
    photoUrl?: string;
    arenaRank?: string;
    level?: number;
    currentStreak?: number;
  } | null>(null)
  const [gameResult, setGameResult] = useState<"win" | "loss" | "draw" | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const opponentTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load real leaderboard from users API
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          const sorted = [...data.users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5)
          setLeaderboard(sorted)
        }
      })
      .catch(err => console.error("Failed to fetch leaderboard:", err))
  }, [points])

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (gameState === "playing" && timeLeft === 0) {
      endBattle("loss") // Timeout
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === "playing") {
      // Simulate opponent progress
      const intervalMs = mode === "pve" ? 5000 : 8000 // Bot is faster in PvE
      opponentTimerRef.current = setInterval(() => {
        setOpponentProgress(prev => {
          const increment = Math.floor(Math.random() * 20) + 10;
          const next = prev + increment;
          if (next >= 100) {
            endBattle("loss") // Opponent wins
            return 100;
          }
          return next;
        })
      }, intervalMs)
    }
    return () => {
      if (opponentTimerRef.current) clearInterval(opponentTimerRef.current)
    }
  }, [gameState, mode])

  /**
   * Fetch dynamic questions from AI API with RAG
   */
  const fetchDynamicQuestions = useCallback(async (difficulty: "Easy" | "Medium" | "Hard") => {
    setIsLoadingQuestions(true)
    setQuestionsError(null)
    try {
      const response = await fetch("/api/ai/content-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-questions",
          topic: "Coding Interview",
          difficulty,
          category: "Algorithm",
          count: 1
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data.questions.length > 0) {
        const generatedQuestion = data.data.questions[0]
        setQuestion({
          title: generatedQuestion.title,
          description: generatedQuestion.description,
          category: generatedQuestion.category,
          difficulty: generatedQuestion.difficulty,
          tags: generatedQuestion.tags || [],
          boilerplate: generatedQuestion.boilerplate || "",
          testCases: generatedQuestion.testCases || []
        })
        setCode(generatedQuestion.boilerplate || "")
      } else {
        throw new Error("No questions generated")
      }
    } catch (error) {
      console.warn("Failed to fetch dynamic questions, using mock:", error)
      setQuestionsError("Using cached questions")
      // Fallback to mock questions
      const mockQ = mockBattleQuestions[Math.floor(Math.random() * mockBattleQuestions.length)]
      setQuestion(mockQ)
      setCode(mockQ.boilerplate || "")
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [])

  const startMatchmaking = useCallback(async (selectedMode: "pvp" | "pve") => {
    setMode(selectedMode)
    setGameState("matching")
    setOpponent(null)
    
    // Determine difficulty and tier based on player's current points
    let difficulty: "Easy" | "Medium" | "Hard" = "Easy"
    let currentTier = "Bronze"
    if (points >= 1000) { difficulty = "Hard"; currentTier = "Platinum"; }
    else if (points >= 500) { difficulty = "Hard"; currentTier = "Gold"; }
    else if (points >= 200) { difficulty = "Medium"; currentTier = "Silver"; }

    // Start question fetch
    const qPromise = fetchDynamicQuestions(difficulty)

    if (selectedMode === "pvp") {
      try {
        const matchRes = await fetch("/api/arena/battle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "matchmake",
            userId: userId || "guest",
            rank: currentTier,
          }),
        })
        const matchData = await matchRes.json()
        if (matchData.success && matchData.opponent) {
          setOpponent(matchData.opponent)
        } else {
          setOpponent({
            name: "Cyber Contender",
            arenaRank: currentTier,
            level: 3,
            currentStreak: 1,
            photoUrl: "https://ui-avatars.com/api/?name=Cyber+Contender&background=6366f1&color=fff",
          })
        }
      } catch (e) {
        setOpponent({
          name: "Apex Striker",
          arenaRank: currentTier,
          level: 4,
          currentStreak: 2,
          photoUrl: "https://ui-avatars.com/api/?name=Apex+Striker&background=6366f1&color=fff",
        })
      }
    } else {
      setOpponent({
        name: "Aura Neural AI (Boss)",
        arenaRank: "Grandmaster",
        level: 10,
        currentStreak: 8,
        photoUrl: "",
      })
    }

    await qPromise

    // Brief delay to showcase opponent pairing
    setTimeout(() => {
      setPlayerProgress(0)
      setOpponentProgress(0)
      setTimeLeft(300)
      setGameState("playing")
    }, 2000)
  }, [points, userId, fetchDynamicQuestions])

  const endBattle = async (result: "win" | "loss" | "draw") => {
    setGameState("finished")
    setGameResult(result)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (opponentTimerRef.current) clearInterval(opponentTimerRef.current)
    
    let pointDelta = 0;
    if (result === "win") pointDelta = 100;
    if (result === "loss") pointDelta = -30;
    
    if (pointDelta !== 0 && userId) {
      onUpdatePoints(pointDelta)
    }

    // Persist battle result and XP to backend database
    try {
      await fetch("/api/arena/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "guest",
          result,
          mode: "coding",
          difficulty: question.difficulty.toLowerCase(),
          score: result === "win" ? 100 : 30,
          accuracy: result === "win" ? 95 : 40,
          xpGained: result === "win" ? 150 : 25,
          pointsGained: pointDelta,
          opponentName: opponent?.name || (mode === "pve" ? "Aura AI Boss" : "Rival"),
        }),
      })

      // Refresh leaderboard live
      const uRes = await fetch("/api/users")
      const uData = await uRes.json()
      if (uData.users) {
        const sorted = [...uData.users].sort((a: any, b: any) => (b.points || 0) - (a.points || 0)).slice(0, 5)
        setLeaderboard(sorted)
      }
    } catch (err) {
      console.warn("Failed to record battle to server:", err)
    }
  }

  const handleRunCode = async () => {
    setIsExecuting(true)
    // Simulate local execution
    setTimeout(() => {
      setIsExecuting(false)
      const randomProgress = Math.floor(Math.random() * 50) + 20;
      setPlayerProgress(prev => {
        const next = prev + randomProgress;
        if (next >= 100) {
          endBattle("win");
          return 100;
        }
        return next;
      })
    }, 1500)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {gameState === "lobby" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-indigo-500/20 shadow-2xl glass-morphism">
              <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20">
                <CardTitle className="flex items-center gap-2 text-2xl font-black text-indigo-500">
                  <Swords className="w-8 h-8" /> CODING BATTLE ARENA
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground">
                  Race against AI or real players to solve algorithms.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border hover:border-rose-500 hover:shadow-xl transition-all flex flex-col justify-between">
                  <CardHeader>
                    <div className="p-3 bg-rose-500/10 rounded-xl mb-2 w-max text-rose-500"><Bot className="w-8 h-8" /></div>
                    <CardTitle className="text-lg font-black text-rose-500">AI Boss Battle</CardTitle>
                    <CardDescription>Challenge an intelligent bot to a coding duel. Higher stakes, faster opponent.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => startMatchmaking("pve")} className="w-full bg-rose-500 hover:bg-rose-600 font-bold gap-2">
                      <Play className="w-4 h-4" /> Start PvE Match
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="border hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col justify-between">
                  <CardHeader>
                    <div className="p-3 bg-indigo-500/10 rounded-xl mb-2 w-max text-indigo-500"><User className="w-8 h-8" /></div>
                    <CardTitle className="text-lg font-black text-indigo-500">Ranked 1v1</CardTitle>
                    <CardDescription>Enter the matchmaking queue to face a player of similar skill.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => startMatchmaking("pvp")} className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold gap-2">
                      <Swords className="w-4 h-4" /> Find Opponent
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="border-2 border-yellow-500/20 shadow-2xl glass-morphism">
              <CardHeader className="bg-yellow-500/10 border-b border-yellow-500/20">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-yellow-600">
                  <Trophy className="w-6 h-6" /> ARENA LEADERBOARD
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y">
                {leaderboard.map((u, i) => (
                  <div key={i} className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black">{i + 1}</div>
                      <div>
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{u.rank}</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-600">{u.points} PTS</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {gameState === "matching" && (
        <Card className="border-2 border-indigo-500/20 shadow-2xl glass-morphism max-w-xl mx-auto py-16 text-center animate-in fade-in zoom-in duration-500">
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <h2 className="text-3xl font-black text-indigo-500 tracking-widest">
              {opponent ? "MATCH LOCKED!" : "SEARCHING ARENA..."}
            </h2>
            
            {opponent ? (
              <div className="flex items-center gap-4 bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl w-full justify-center animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-black text-white text-lg overflow-hidden">
                  {opponent.photoUrl ? (
                    <img src={opponent.photoUrl} alt={opponent.name} className="w-full h-full object-cover" />
                  ) : (
                    opponent.name.charAt(0)
                  )}
                </div>
                <div className="text-left">
                  <p className="font-black text-base text-foreground flex items-center gap-2">
                    {opponent.name}
                    <Badge variant="outline" className="text-[10px] border-indigo-400 text-indigo-400">
                      {opponent.arenaRank || "Bronze"}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground font-bold">
                    Level {opponent.level || 1} • {opponent.currentStreak || 0} Win Streak
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground font-medium uppercase text-sm">
                Finding a worthy opponent in the {mode === "pve" ? "AI Neural Matrix" : "Global Queue"}...
              </p>
            )}

            {isLoadingQuestions && (
              <div className="pt-4 border-t border-indigo-500/20 w-full">
                <p className="text-sm text-indigo-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Preparing algorithmic challenge...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {gameState === "playing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[75vh]">
          {/* Left Panel: Problem & Progress */}
          <Card className="flex flex-col border-2 border-indigo-500 shadow-2xl glass-morphism overflow-hidden">
            <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20 flex justify-between items-center">
              <Badge variant="outline" className="text-xl px-4 py-1 border-indigo-500 text-indigo-500 font-mono font-black animate-pulse">
                <Clock className="w-5 h-5 inline mr-2" /> {formatTime(timeLeft)}
              </Badge>
              <Button variant="destructive" size="sm" onClick={() => endBattle("loss")} className="font-bold uppercase">Surrender</Button>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-black text-foreground">{question.title}</h2>
                  <Badge variant={question.difficulty === "Easy" ? "secondary" : "destructive"}>{question.difficulty}</Badge>
                </div>
                <p className="text-muted-foreground font-medium">{question.description}</p>
                {question.tags && question.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {question.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                {questionsError && (
                  <div className="text-xs text-yellow-600 bg-yellow-500/10 p-2 rounded border border-yellow-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {questionsError}
                  </div>
                )}
              </div>
              
              <div className="space-y-8 pt-8 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-black uppercase text-indigo-500">
                    <span>You</span>
                    <span>{playerProgress}%</span>
                  </div>
                  <Progress value={playerProgress} className="h-4 bg-indigo-500/20" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-black uppercase text-rose-500">
                    <span>
                      {opponent ? `${opponent.name} (${opponent.arenaRank || (mode === 'pve' ? 'Boss' : 'Rival')})` : (mode === "pve" ? "Aura AI Boss" : "Opponent")}
                    </span>
                    <span>{opponentProgress}%</span>
                  </div>
                  <Progress value={opponentProgress} className="h-4 bg-rose-500/20" />
                </div>
              </div>
            </div>
          </Card>

          {/* Right Panel: Editor */}
          <Card className="flex flex-col border-2 border-slate-700 shadow-2xl overflow-hidden">
            <div className="h-full relative">
              {isLoadingQuestions ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-950">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Generating question...</p>
                  </div>
                </div>
              ) : (
                <>
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    options={{ minimap: { enabled: false }, fontSize: 16, padding: { top: 20 } }}
                  />
                  <div className="absolute bottom-4 right-4 z-10">
                    <Button 
                      size="lg" 
                      className="bg-indigo-500 hover:bg-indigo-600 font-black gap-2 shadow-xl"
                      onClick={handleRunCode}
                      disabled={isExecuting}
                    >
                      {isExecuting ? <><Loader2 className="w-5 h-5 animate-spin" /> EXECUTING...</> : <><Play className="w-5 h-5" /> SUBMIT SOLUTION</>}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {gameState === "finished" && (
        <Card className="border-4 border-indigo-500 shadow-2xl glass-morphism max-w-md mx-auto text-center mt-20">
          <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 py-8">
            <div className="flex justify-center mb-4">
              {gameResult === "win" ? (
                <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-destructive/20 border-2 border-destructive rounded-full flex items-center justify-center text-destructive animate-pulse">
                  <XCircle className="w-12 h-12" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl font-black">
              {gameResult === "win" ? "🏆 VICTORY!" : "💔 DEFEAT!"}
            </CardTitle>
            <CardDescription className="font-bold text-sm uppercase mt-2">
              {gameResult === "win" ? "+100 Rating Points" : "-30 Rating Points"}
            </CardDescription>
          </CardHeader>
          <CardFooter className="bg-muted/10 p-4 flex gap-3">
            <Button onClick={() => setGameState("lobby")} className="flex-1 bg-indigo-500 hover:bg-indigo-600 font-black">
              Return to Arena
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
