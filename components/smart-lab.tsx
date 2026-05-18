"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNav } from "@/hooks/use-nav"
import { Brain, Trophy, Gamepad2, Users, Star, Lock, Code2, Users2, Swords } from "lucide-react"
import { LabGames } from "@/components/lab-games"

export function SmartLab() {
  const { isRegistered } = useNav()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLabApproved, setIsLabApproved] = useState(false) // Default false for security
  const [isBlocked, setIsBlocked] = useState(false)
  const [points, setPoints] = useState(0)
  const [rank, setRank] = useState("Bronze")

  useEffect(() => {
    const saved = localStorage.getItem("aura_session")
    if (saved) {
      const session = JSON.parse(saved)
      if (session?.user?.email) {
        setUserId(session.user.id)
        setUserEmail(session.user.email)
        
        // Fetch current live approval and status from server
        fetch(`/api/profile?email=${session.user.email}`)
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setIsLabApproved(data.user.isLabApproved || false)
              setIsBlocked(data.user.status === "Inactive")
              if (data.user.points !== undefined) {
                setPoints(data.user.points)
                const p = data.user.points
                if (p >= 1000) setRank("Platinum")
                else if (p >= 500) setRank("Gold")
                else if (p >= 200) setRank("Silver")
                else setRank("Bronze")
              }
            }
          })
          .catch(err => {
            console.warn("Could not fetch profile from server, using local fallback:", err)
            // Fallback: load points from localStorage
            const localPoints = localStorage.getItem(`points_${session.user.id}`)
            if (localPoints) {
              setPoints(parseInt(localPoints))
              const p = parseInt(localPoints)
              if (p >= 1000) setRank("Platinum")
              else if (p >= 500) setRank("Gold")
              else if (p >= 200) setRank("Silver")
            }
          })
      }
    }
  }, [])

  const updatePoints = (delta: number) => {
    if (!userId) return
    const newPoints = Math.max(0, points + delta)
    setPoints(newPoints)
    localStorage.setItem(`points_${userId}`, newPoints.toString())
    
    if (newPoints >= 1000) setRank("Platinum")
    else if (newPoints >= 500) setRank("Gold")
    else if (newPoints >= 200) setRank("Silver")
    else setRank("Bronze")
  }

  // Live game actions managed by LabGames subcomponent

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
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Lock className="w-20 h-20 text-destructive animate-pulse" />
        <h2 className="text-3xl font-black">LAB ACCESS RESTRICTED</h2>
        <p className="text-muted-foreground font-bold">Your ID is registered, but pending Admin Approval for Lab access.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 max-w-6xl animate-in fade-in zoom-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Brain className="w-10 h-10 text-indigo-500" /> 
            SMART EXPERIMENT LAB
          </h1>
          <p className="text-muted-foreground font-bold">Coding, Practice, and Activities Room</p>
        </div>
        
        <div className="flex gap-4">
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg py-1 px-4 flex gap-2">
            <Star className="w-5 h-5 fill-current" /> {points} PTS
          </Badge>
          <Badge className="bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-lg py-1 px-4 flex gap-2">
            <Trophy className="w-5 h-5" /> {rank} TIER
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-2 gap-2 mb-8 bg-muted/50 rounded-2xl">
          <TabsTrigger value="games" className="rounded-xl font-bold py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <Gamepad2 className="w-4 h-4 mr-2" /> Games & Quizzes
          </TabsTrigger>
          <TabsTrigger value="coding" className="rounded-xl font-bold py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Code2 className="w-4 h-4 mr-2" /> Coding Practice
          </TabsTrigger>
          <TabsTrigger value="interview" className="rounded-xl font-bold py-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" /> Interview Prep
          </TabsTrigger>
          <TabsTrigger value="community" className="rounded-xl font-bold py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Users2 className="w-4 h-4 mr-2" /> Group Discussion
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

        <TabsContent value="coding">
          <Card className="border-2 shadow-xl border-dashed h-[400px] flex items-center justify-center bg-muted/10">
            <div className="text-center">
              <Code2 className="w-16 h-16 mx-auto text-blue-500 mb-4 opacity-50" />
              <h3 className="text-2xl font-black">IDE Editor Workspace</h3>
              <p className="text-muted-foreground">Sandbox environment loading...</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="interview">
          <Card className="border-2 shadow-xl border-purple-500/20 bg-purple-500/5 h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-purple-500 mb-4 opacity-50" />
              <h3 className="text-2xl font-black">Mock Interview Room</h3>
              <p className="text-muted-foreground">Connecting to AI Interviewer...</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          <Card className="border-2 shadow-xl border-orange-500/20 bg-orange-500/5 h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Users2 className="w-16 h-16 mx-auto text-orange-500 mb-4 opacity-50" />
              <h3 className="text-2xl font-black">Group Discussion Rooms</h3>
              <p className="text-muted-foreground">Room controlled & regulated by Admins.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
