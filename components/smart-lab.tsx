"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNav } from "@/hooks/use-nav"
import { Brain, Trophy, Gamepad2, Users, Star, Lock, Code2, Users2, Swords } from "lucide-react"
import { LabGames } from "@/components/lab-games"
import { CodingLabWorkspace } from "@/components/coding-lab-workspace"
import { InterviewPrepWorkspace } from "@/components/interview-prep-workspace"
import { BattleArena } from "@/components/battle-arena/battle-arena"
import { ArenaChat } from "@/components/battle-arena/arena-chat"

export function SmartLab() {
  const { isRegistered } = useNav()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLabApproved, setIsLabApproved] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [points, setPoints] = useState(0)
  const [rank, setRank] = useState("Bronze")
  const [isSeeding, setIsSeeding] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem("aura_session")
    if (saved) {
      const session = JSON.parse(saved)
      if (session?.user?.email) {
        setUserId(session.user.id)
        setUserEmail(session.user.email)
        setUser(session.user)

        // Fetch current live approval and status from server
        fetch(`/api/profile?email=${session.user.email}`)
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setIsLabApproved(data.user.isLabApproved || false)
              setIsBlocked(data.user.status === "Inactive")
              if (data.user.points !== undefined) {
                setPoints(data.user.points)
                updateRank(data.user.points)
              }
            }
          })
          .catch(err => {
            console.warn("Could not fetch profile from server, using local fallback:", err)
            const localPoints = localStorage.getItem(`points_${session.user.id}`)
            if (localPoints) {
              const p = parseInt(localPoints)
              setPoints(p)
              updateRank(p)
            }
          })
      }
    }
  }, [])

  const updateRank = (p: number) => {
    if (p >= 1000) setRank("Platinum")
    else if (p >= 500) setRank("Gold")
    else if (p >= 200) setRank("Silver")
    else setRank("Bronze")
  }

  const updatePoints = async (delta: number) => {
    const newPoints = Math.max(0, points + delta)
    setPoints(newPoints)
    updateRank(newPoints)

    if (userId) {
      localStorage.setItem(`points_${userId}`, newPoints.toString())
      
      // Attempt to save to backend
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, email: userEmail, points: newPoints })
        })
      } catch (e) {
        console.warn("Failed to update points on server, saved locally:", e)
      }
    }
  }

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true)
      const res = await fetch("/api/seed", { method: "POST" })
      const data = await res.json()
      if (res.ok && data.success) {
        alert("500+ questions loaded into the battle arena across all modes and levels!")
        window.location.reload()
      } else {
        throw new Error(data.message || "Failed seeding")
      }
    } catch (err: any) {
      alert(`Seeding failed: ${err.message}`)
    } finally {
      setIsSeeding(false)
    }
  }

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Lock className="w-20 h-20 text-destructive animate-bounce" />
        <h2 className="text-3xl font-black">ACCOUNT DEACTIVATED</h2>
        <p className="text-muted-foreground font-bold">Your student profile has been locked by the administrator. Contact support.</p>
      </div>
    )
  }

  if (!isRegistered || !isLabApproved) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 max-w-md mx-auto text-center animate-in zoom-in duration-500">
        <Lock className="w-20 h-20 text-indigo-500 animate-pulse" />
        <h2 className="text-3xl font-black">LAB ACCESS RESTRICTED</h2>
        <p className="text-muted-foreground font-bold leading-relaxed">
          Your ID is pending Admin Approval for Smart Lab access.
        </p>
        
        <div className="pt-6 w-full space-y-3">
          <Button 
            onClick={() => {
              setIsLabApproved(true);
              setUserId("USR-GUESTBYPASS");
              setUserEmail("guest@student.ai");
              localStorage.setItem("aura_session", JSON.stringify({
                user: {
                  id: "USR-GUESTBYPASS",
                  name: "GUEST STUDENT",
                  email: "guest@student.ai",
                  phone: "",
                  photoUrl: "",
                  branch: "Information Technology",
                  bio: "Guest tester.",
                  isLabApproved: true,
                  status: "Active"
                }
              }));
              window.location.reload(); // Reload to align states
            }} 
            className="w-full h-14 text-lg font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg border-none"
          >
            Enter as Guest (Demo Bypass)
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-3 sm:px-4 max-w-6xl animate-in fade-in zoom-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 border-b pb-6 border-indigo-500/10">
        <div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2 sm:gap-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            <Brain className="w-7 h-7 sm:w-10 sm:h-10 text-indigo-500 flex-shrink-0" /> 
            SMART EXPERIMENT LAB
          </h1>
          <p className="text-muted-foreground font-bold text-xs sm:text-sm mt-1">Coding, Practice, and Activities Room</p>
        </div>
        
        <div className="flex gap-2 sm:gap-4 flex-wrap items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10"
          >
            {isSeeding ? "Seeding..." : "Seed Questions"}
          </Button>
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs sm:text-sm py-1 px-2.5 sm:px-4 flex gap-1.5 sm:gap-2 h-8 sm:h-9 items-center border-none">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" /> {points} PTS
          </Badge>
          <Badge className="bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-xs sm:text-sm py-1 px-2.5 sm:px-4 flex gap-1.5 sm:gap-2 h-8 sm:h-9 items-center border-none">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {rank} TIER
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="coding" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto p-1.5 sm:p-2 gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-muted/50 rounded-xl sm:rounded-2xl">
          <TabsTrigger value="games" className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" /> 
            <span className="truncate">Games & Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="arena" className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-rose-500 data-[state=active]:text-white">
            <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" /> 
            <span className="truncate">Battle Arena</span>
          </TabsTrigger>
          <TabsTrigger value="coding" className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" /> 
            <span className="truncate">Coding Practice</span>
          </TabsTrigger>
          <TabsTrigger value="interview" className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" /> 
            <span className="truncate">Interview Prep</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="col-span-2 sm:col-span-1 rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Users2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" /> 
            <span className="truncate">Group Discussion</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <LabGames 
            points={points} 
            onUpdatePoints={updatePoints} 
            userId={userId} 
            userEmail={userEmail} 
          />
        </TabsContent>

        <TabsContent value="arena" className="space-y-6">
          <BattleArena userId={userId} userEmail={userEmail} />
        </TabsContent>

        <TabsContent value="coding" className="space-y-6">
          <CodingLabWorkspace points={points} onUpdatePoints={updatePoints} />
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          <InterviewPrepWorkspace />
        </TabsContent>

        <TabsContent value="community">
          <div className="space-y-4">
            <ArenaChat user={user} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
