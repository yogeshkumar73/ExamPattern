"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, UserPlus, UserMinus, Search, Check, X, ShieldAlert, Swords, Loader2,
  Code2, Brain, Calculator, BookOpen, TrendingUp, Shuffle, Palette, Sparkles, CheckCircle2,
  MessageSquare, Send, Lock, Clock, Globe, Eye, Maximize2, Minimize2
} from "lucide-react"
import { VisitProfileModal } from "./visit-profile-modal"
import { InviteFriendsSection } from "@/components/invite-friends-section"

function getCountryFlag(code?: string): string {
  if (!code || code.length !== 2) return "🌍";
  try {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
}

interface FriendsPanelProps {
  currentUser: any
  onStartDuel?: (friend: any) => void
}

const DUEL_MODES = [
  { id: 'color', label: 'Color Match Battle', icon: Palette, color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
  { id: 'math', label: 'Math Battle', icon: Calculator, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'coding', label: 'Coding Battle', icon: Code2, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'puzzle', label: 'Puzzle Battle', icon: Brain, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'gk', label: 'GK Battle', icon: BookOpen, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'prediction', label: 'Prediction Game', icon: TrendingUp, color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/10' },
  { id: 'mixed', label: 'Mixed Mode', icon: Shuffle, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
]

const DUEL_DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', dot: 'bg-emerald-400' },
  { id: 'intermediate', label: 'Intermediate', dot: 'bg-blue-400' },
  { id: 'advanced', label: 'Advanced', dot: 'bg-purple-400' },
  { id: 'expert', label: 'Expert', dot: 'bg-yellow-400' },
  { id: 'master', label: 'Master', dot: 'bg-orange-400' },
  { id: 'grandmaster', label: 'Grandmaster', dot: 'bg-rose-500' },
]

export function FriendsPanel({ currentUser, onStartDuel }: FriendsPanelProps) {
  const [friends, setFriends] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [duelChallenges, setDuelChallenges] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [challengingFriendId, setChallengingFriendId] = useState<string | null>(null)
  const [challengeSentFriend, setChallengeSentFriend] = useState<string | null>(null)
  const [targetFriendForDuel, setTargetFriendForDuel] = useState<any | null>(null)
  const [duelMode, setDuelMode] = useState<string>("color")
  const [duelDifficulty, setDuelDifficulty] = useState<string>("intermediate")
  const [duelSubmitting, setDuelSubmitting] = useState(false)

  // 1v1 Duel Waiting Lobby & 1-Minute Expiry state
  const [waitingDuel, setWaitingDuel] = useState<{
    duelId: string
    friend: any
    mode: string
    difficulty: string
    secondsRemaining: number
    status: "waiting" | "accepted" | "expired"
  } | null>(null)

  // 1-on-1 End-to-End Unicast Chat state
  const [activeChatFriend, setActiveChatFriend] = useState<any | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatSending, setChatSending] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [isChatFullScreen, setIsChatFullScreen] = useState(false)
  const [visitingProfileUser, setVisitingProfileUser] = useState<any | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    if (activeChatFriend) {
      scrollToBottom('auto')
      const timer = setTimeout(() => {
        chatInputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [activeChatFriend])

  useEffect(() => {
    scrollToBottom('smooth')
  }, [chatMessages])

  // Listen for direct chat opening requested from other tabs or VisitProfileModal
  useEffect(() => {
    const handleNavDetail = (e: any) => {
      const chatTarget = e.detail?.openChatWith
      if (chatTarget) {
        handleOpenUnicastChat(chatTarget)
      }
    }
    window.addEventListener('arena-navigate', handleNavDetail)
    window.addEventListener('open-unicast-chat', handleNavDetail)
    return () => {
      window.removeEventListener('arena-navigate', handleNavDetail)
      window.removeEventListener('open-unicast-chat', handleNavDetail)
    }
  }, [])

  const fetchUnicastMessages = async (friendId: string) => {
    if (!currentUser?.id || !friendId) return
    try {
      const res = await fetch(`/api/arena/unicast-chat?userId=${encodeURIComponent(currentUser.id)}&friendId=${encodeURIComponent(friendId)}`)
      const data = await res.json()
      if (Array.isArray(data.messages)) {
        setChatMessages(data.messages)
      }
    } catch (_) {}
  }

  const handleOpenUnicastChat = (friend: any) => {
    setActiveChatFriend(friend)
    setChatMessages([])
    setChatLoading(true)
    fetchUnicastMessages(friend._id).finally(() => setChatLoading(false))
  }

  const handleSendUnicastMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeChatFriend?._id || !currentUser?.id) return
    const text = chatInput.trim()
    setChatInput("")
    setChatSending(true)
    setTimeout(() => {
      scrollToBottom('smooth')
      chatInputRef.current?.focus()
    }, 50)

    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      senderId: currentUser.id,
      recipientId: activeChatFriend._id,
      senderName: currentUser.name || "Student",
      senderAvatar: currentUser.photoUrl || currentUser.avatar || "",
      recipientName: activeChatFriend.name,
      message: text,
      timestamp: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await fetch("/api/arena/unicast-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          recipientId: activeChatFriend._id,
          senderName: currentUser.name || "Student",
          senderAvatar: currentUser.photoUrl || currentUser.avatar || "",
          recipientName: activeChatFriend.name,
          message: text,
        }),
      })
      const data = await res.json()
      if (data.success && data.message) {
        setChatMessages(prev => prev.map(m => (m.id === optimisticMsg.id ? data.message : m)))
      }
    } catch (_) {}
    setChatSending(false)
  }

  // Poll for incoming unicast messages every 2.5s while chat is open
  useEffect(() => {
    if (!activeChatFriend?._id) return
    const interval = setInterval(() => {
      fetchUnicastMessages(activeChatFriend._id)
    }, 2500)
    return () => clearInterval(interval)
  }, [activeChatFriend])

  const handleClearUnicastChat = async () => {
    if (!activeChatFriend?._id || !currentUser?.id) return
    if (!confirm(`Clear all personal chat messages with ${activeChatFriend.name}?`)) return
    try {
      await fetch(`/api/arena/unicast-chat?userId=${encodeURIComponent(currentUser.id)}&friendId=${encodeURIComponent(activeChatFriend._id)}`, {
        method: "DELETE",
      })
      setChatMessages([])
    } catch (_) {}
  }

  // Manage 1-minute countdown & live opponent join polling
  useEffect(() => {
    if (!waitingDuel || waitingDuel.status !== "waiting") return

    const timer = setInterval(() => {
      setWaitingDuel((prev) => {
        if (!prev || prev.status !== "waiting") return prev
        if (prev.secondsRemaining <= 1) {
          // Expire the duel
          fetch("/api/arena/duel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "expire",
              duelId: prev.duelId,
              userId: currentUser?.id,
            }),
          }).catch(() => {})
          return { ...prev, secondsRemaining: 0, status: "expired" }
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 }
      })
    }, 1000)

    const pollInterval = setInterval(async () => {
      if (!waitingDuel.duelId || !currentUser?.id) return
      try {
        const res = await fetch(`/api/arena/duel?duelId=${encodeURIComponent(waitingDuel.duelId)}&userId=${encodeURIComponent(currentUser.id)}`)
        const data = await res.json()
        if (data.status === "playing" || (data.opponent && (data.opponent.status === "ready" || data.opponent.status === "playing"))) {
          setWaitingDuel((prev) => (prev ? { ...prev, status: "accepted" } : null))
          clearInterval(pollInterval)
          clearInterval(timer)
          setTimeout(() => {
            if (onStartDuel) {
              onStartDuel({
                ...waitingDuel.friend,
                mode: waitingDuel.mode,
                difficulty: waitingDuel.difficulty,
                duelId: waitingDuel.duelId,
              })
            }
            setWaitingDuel(null)
          }, 1200)
        } else if (data.status === "expired") {
          setWaitingDuel((prev) => (prev ? { ...prev, secondsRemaining: 0, status: "expired" } : null))
          clearInterval(pollInterval)
          clearInterval(timer)
        }
      } catch (_) {}
    }, 1500)

    return () => {
      clearInterval(timer)
      clearInterval(pollInterval)
    }
  }, [waitingDuel?.duelId, waitingDuel?.status, currentUser?.id, onStartDuel])

  const fetchFriendsAndRequests = async () => {
    if (!currentUser?.id) return
    try {
      const res = await fetch(`/api/arena/friends?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.friends) setFriends(data.friends)
      if (data.requests) setRequests(data.requests)
      if (data.duelChallenges) setDuelChallenges(data.duelChallenges)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchFriendsAndRequests()
    const timer = setInterval(() => {
      fetchFriendsAndRequests()
    }, 12000)
    return () => clearInterval(timer)
  }, [currentUser])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (data.users) {
        // filter out current user and existing friends/requests
        const filtered = data.users.filter((u: any) => {
          const isMe = u._id === currentUser?.id
          const isFriend = friends.some(f => f._id === u._id)
          const isReq = requests.some(r => r._id === u._id)
          const nameMatches = u.name.toLowerCase().includes(searchQuery.toLowerCase())
          return !isMe && !isFriend && !isReq && nameMatches
        })
        setSearchResults(filtered)
      }
    } catch (_) {}
  }

  const handleFriendAction = async (action: 'request' | 'accept' | 'decline' | 'remove', friendId: string) => {
    setActionLoading(friendId)
    try {
      const res = await fetch("/api/arena/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: currentUser.id, friendId })
      })
      const data = await res.json()
      if (data.success) {
        fetchFriendsAndRequests()
        // Remove from search results if added
        if (action === 'request') {
          setSearchResults(prev => prev.filter(u => u._id !== friendId))
        }
      } else {
        alert(data.error || "Failed to complete action")
      }
    } catch (_) {}
    setActionLoading(null)
  }

  const handleOpenDuelModal = (friend: any) => {
    setTargetFriendForDuel(friend)
  }

  const handleSendDuelChallenge = async () => {
    if (!currentUser?.id || !targetFriendForDuel?._id) return
    setDuelSubmitting(true)
    const friend = targetFriendForDuel
    const activeDuelId = `duel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    try {
      // 1. Initialize room in fast duel sync engine
      await fetch("/api/arena/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          duelId: activeDuelId,
          userId: currentUser.id,
          name: currentUser.name || "Student",
          avatar: currentUser.photoUrl || currentUser.avatar || "",
          mode: duelMode,
          difficulty: duelDifficulty,
        }),
      })

      // 2. Send 1v1 challenge notification to opponent
      const res = await fetch("/api/arena/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "challenge",
          userId: currentUser.id,
          friendId: friend._id,
          mode: duelMode,
          difficulty: duelDifficulty,
          duelId: activeDuelId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTargetFriendForDuel(null)
        // Enter 1-minute waiting lobby: do NOT start game without opponent!
        setWaitingDuel({
          duelId: activeDuelId,
          friend,
          mode: duelMode,
          difficulty: duelDifficulty,
          secondsRemaining: 60,
          status: "waiting",
        })
      } else {
        alert(data.error || "Failed to send challenge request")
      }
    } catch (err) {
      alert("Failed to send challenge request. Please check connection.")
    } finally {
      setDuelSubmitting(false)
    }
  }

  const handleCancelWaitingDuel = async () => {
    if (!waitingDuel?.duelId || !currentUser?.id) {
      setWaitingDuel(null)
      return
    }
    try {
      await fetch("/api/arena/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          duelId: waitingDuel.duelId,
          userId: currentUser.id,
        }),
      })
    } catch (_) {}
    setWaitingDuel(null)
  }

  const handleAcceptDuel = async (challenge: any) => {
    try {
      // Register in synchronized duel engine so challenger's lobby immediately wakes up
      await fetch("/api/arena/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          duelId: challenge.duelId,
          userId: currentUser.id,
          name: currentUser.name || "Student",
          avatar: currentUser.photoUrl || currentUser.avatar || "",
          mode: challenge.mode || "math",
          difficulty: challenge.difficulty || "intermediate",
          status: "playing",
        }),
      })

      await fetch("/api/arena/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept_duel",
          userId: currentUser.id,
          friendId: challenge.senderId,
          notificationId: challenge._id,
        }),
      })
      setDuelChallenges(prev => prev.filter(c => c._id !== challenge._id))
      if (onStartDuel) {
        onStartDuel({
          _id: challenge.senderId,
          name: challenge.senderName || challenge.challengerName || "Challenger",
          photoUrl: challenge.senderPhotoUrl || challenge.challengerPhotoUrl,
          mode: challenge.mode || "math",
          difficulty: challenge.difficulty || "intermediate",
          duelId: challenge.duelId || `duel-${Date.now()}`,
        })
      }
    } catch (err) {
      console.error("Error accepting duel:", err)
    }
  }

  const handleDeclineDuel = async (challengeId: string) => {
    try {
      await fetch("/api/arena/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline_duel",
          userId: currentUser.id,
          friendId: currentUser.id,
          notificationId: challengeId,
        }),
      })
      setDuelChallenges(prev => prev.filter(c => c._id !== challengeId))
    } catch (err) {
      console.error("Error declining duel:", err)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Friends List */}
      <div className="lg:col-span-2 space-y-4">
        {challengeSentFriend && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-indigo-400" />
              1v1 Duel challenge successfully sent to {challengeSentFriend}!
            </span>
            <button onClick={() => setChallengeSentFriend(null)} className="text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> FRIEND LIST
          </h2>
          <span className="text-xs text-white/40 font-bold">{friends.length} friends</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : friends.length === 0 ? (
          <div className="arena-card p-10 text-center text-white/40 font-medium">
            You haven't added any friends yet. Use the search panel to find classmates!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {friends.map(friend => (
              <div key={friend._id} className="arena-card p-4 flex items-center justify-between border border-white/5 bg-black/40">
                <div 
                  className="flex items-center gap-3 cursor-pointer group flex-1 mr-2"
                  onClick={() => setVisitingProfileUser(friend)}
                  title={`Click to view ${friend.name}'s profile`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={friend.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=6366f1&color=fff`}
                      alt={friend.name}
                      className="w-11 h-11 rounded-xl object-cover transition-transform group-hover:scale-105"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${friend.isOnline || Math.random() > 0.5 ? 'bg-green-500' : 'bg-white/20'}`} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                      {friend.name}
                      <Badge className="bg-indigo-600/30 text-indigo-300 text-[9px] px-1.5 py-0">Lv.{friend.level || 1}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-white/40 font-bold">{friend.arenaRank || 'Bronze'}</span>
                      <span className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                        <span>{getCountryFlag(friend.countryCode)}</span>
                        <span>{friend.city ? `${friend.city}, ` : ''}{friend.country || 'Global'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[72px]"
                    onClick={() => handleOpenUnicastChat(friend)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Chat
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[72px]"
                    disabled={challengingFriendId === friend._id}
                    onClick={() => handleOpenDuelModal(friend)}
                  >
                    <Swords className="w-3.5 h-3.5 mr-1" />
                    Duel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-white/10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    disabled={actionLoading === friend._id}
                    onClick={() => handleFriendAction('remove', friend._id)}
                  >
                    {actionLoading === friend._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Duel Challenges Section */}
        {duelChallenges.length > 0 && (
          <div className="space-y-3 pt-3">
            <h3 className="text-sm font-black text-rose-400 tracking-widest uppercase flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-400 animate-pulse" /> INCOMING DUEL CHALLENGES ({duelChallenges.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {duelChallenges.map(chal => (
                <div key={chal._id} className="arena-card p-4 flex items-center justify-between border border-rose-500/30 bg-rose-500/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={chal.senderPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(chal.senderName || 'Player')}&background=f43f5e&color=fff`}
                      alt={chal.senderName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-white font-bold text-sm flex items-center gap-1.5">
                        {chal.senderName || chal.challengerName || 'Student'}
                        <Badge className="bg-rose-500/30 text-rose-300 text-[9px] px-1.5 py-0 font-bold uppercase">Duel</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {(chal.mode || 'math').replace('-', ' ')}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {chal.difficulty || 'intermediate'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3"
                      onClick={() => handleAcceptDuel(chal)}
                    >
                      <Swords className="w-3.5 h-3.5 mr-1" /> Fight!
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => handleDeclineDuel(chal._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend Requests Section */}
        {requests.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-yellow-400" /> PENDING REQUESTS ({requests.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requests.map(req => (
                <div key={req._id} className="arena-card p-4 flex items-center justify-between border border-yellow-500/10 bg-yellow-500/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=f59e0b&color=fff`}
                      alt={req.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-white font-bold text-sm">{req.name}</div>
                      <div className="text-[10px] text-white/40 font-medium">{req.arenaRank} • Level {req.level || 1}</div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-8 bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading === req._id}
                      onClick={() => handleFriendAction('accept', req._id)}
                    >
                      {actionLoading === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-white/10 text-white/60"
                      disabled={actionLoading === req._id}
                      onClick={() => handleFriendAction('decline', req._id)}
                    >
                      {actionLoading === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Invite Friends & Search Users */}
      <div className="space-y-4">
        {/* Team Invite Section */}
        <InviteFriendsSection currentUser={currentUser} compact={true} />

        {/* Search Users Panel */}
        <div className="arena-card p-5 space-y-4">
        <h3 className="text-white font-black text-lg flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-400" /> FIND STUDENTS
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <Button className="bg-indigo-600" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {searchResults.map(u => (
            <div key={u._id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer group flex-1 mr-2"
                onClick={() => setVisitingProfileUser(u)}
                title={`Click to view ${u.name}'s profile`}
              >
                <img
                  src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                  alt={u.name}
                  className="w-9 h-9 rounded-xl object-cover transition-transform group-hover:scale-105"
                />
                <div>
                  <div className="text-white font-bold text-xs group-hover:text-indigo-300 transition-colors">{u.name}</div>
                  <div className="text-[10px] text-white/40">{u.arenaRank || 'Bronze'} • Lv.{u.level || 1}</div>
                </div>
              </div>
              <Button
                size="sm"
                className="h-7 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold"
                disabled={actionLoading === u._id}
                onClick={() => handleFriendAction('request', u._id)}
              >
                {actionLoading === u._id ? <Loader2 className="w-3 animate-spin" /> : 'Add'}
              </Button>
            </div>
          ))}
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-6 text-xs text-white/30 font-medium">No new students found.</div>
          )}
        </div>
      </div>
      </div>

      {/* Duel Challenge Config Dialog Modal */}
      {targetFriendForDuel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f111a] border border-indigo-500/30 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setTargetFriendForDuel(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  CHALLENGE TO 1v1 DUEL
                </h3>
                <p className="text-xs text-white/50">
                  Select game mode & difficulty. Opponent <span className="text-indigo-400 font-bold">{targetFriendForDuel.name}</span> will open this exact match!
                </p>
              </div>
            </div>

            {/* Select Game Mode */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white/60 tracking-wider uppercase">Select Game Mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DUEL_MODES.map(m => {
                  const Icon = m.icon
                  const isSelected = duelMode === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDuelMode(m.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-md ring-1 ring-indigo-500'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${m.color}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-bold text-white">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Select Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white/60 tracking-wider uppercase">Select Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {DUEL_DIFFICULTIES.map(d => {
                  const isSelected = duelDifficulty === d.id
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuelDifficulty(d.id)}
                      className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-white font-black ring-1 ring-indigo-500'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${d.dot}`} />
                      <span className="text-xs font-bold capitalize">{d.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
                onClick={() => setTargetFriendForDuel(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black shadow-lg"
                disabled={duelSubmitting}
                onClick={handleSendDuelChallenge}
              >
                {duelSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Swords className="w-4 h-4 mr-2" />}
                Launch 1v1 Duel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== WAITING FOR OPPONENT / DUEL LOBBY ==================== */}
      {waitingDuel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b0e17] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-center space-y-6">
            {/* Header / Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                1v1 Private Duel Challenge
              </Badge>
              {waitingDuel.status === "waiting" && (
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>{waitingDuel.secondsRemaining}s remaining</span>
                </div>
              )}
            </div>

            {/* Central Visual / Radar */}
            <div className="py-2 flex flex-col items-center justify-center">
              <div className="relative">
                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all ${
                  waitingDuel.status === "accepted"
                    ? "border-emerald-500 bg-emerald-500/10 ring-8 ring-emerald-500/20 scale-105"
                    : waitingDuel.status === "expired"
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20 animate-pulse"
                }`}>
                  <img
                    src={waitingDuel.friend?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(waitingDuel.friend?.name || 'Opponent')}&background=6366f1&color=fff`}
                    alt={waitingDuel.friend?.name}
                    className="w-20 h-20 rounded-full object-cover shadow-lg"
                  />
                </div>
                {waitingDuel.status === "waiting" && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 border-2 border-black flex items-center justify-center text-white shadow-md">
                    <Swords className="w-4 h-4 animate-bounce" />
                  </div>
                )}
                {waitingDuel.status === "accepted" && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-600 border-2 border-black flex items-center justify-center text-white shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {waitingDuel.status === "expired" && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-600 border-2 border-black flex items-center justify-center text-white shadow-md">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-lg font-black text-white">
                  {waitingDuel.friend?.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                  <span className="capitalize text-indigo-400 font-bold">{waitingDuel.mode} Mode</span>
                  <span>•</span>
                  <span className="capitalize text-emerald-400 font-bold">{waitingDuel.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {waitingDuel.status === "waiting" && (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for {waitingDuel.friend?.name} to accept challenge...</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Both combatants will launch into the exact same round simultaneously once accepted. Challenge expires automatically in 1 minute.
                </p>
              </div>
            )}

            {waitingDuel.status === "accepted" && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="text-sm font-black flex items-center justify-center gap-1.5">
                  <Swords className="w-4 h-4" /> Opponent Accepted! Launching Duel...
                </div>
                <p className="text-[11px] text-emerald-400/80">Synchronizing battle room and questions...</p>
              </div>
            )}

            {waitingDuel.status === "expired" && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                <div className="text-sm font-black flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4" /> Challenge Expired
                </div>
                <p className="text-[11px] text-white/50">
                  {waitingDuel.friend?.name} did not join within 1 minute. The challenge has been expired.
                </p>
              </div>
            )}

            {/* Duel Rules Summary */}
            <div className="text-left bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-[11px] space-y-1.5 text-white/60">
              <div className="font-black uppercase tracking-wider text-[10px] text-white/40">Duel Challenge Rules</div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400">🔒</span>
                <span>End-to-End Private 1v1 Room with live synchronized scores.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⏱️</span>
                <span>Strict 1-minute join window to prevent empty/abandoned games.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">🏆</span>
                <span>Both players attempt the same questions; winner gets +XP.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              {waitingDuel.status === "waiting" ? (
                <Button
                  variant="outline"
                  onClick={handleCancelWaitingDuel}
                  className="w-full border-white/10 hover:border-rose-500/40 text-white/70 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold h-10 rounded-xl"
                >
                  Cancel Challenge
                </Button>
              ) : (
                <Button
                  onClick={() => setWaitingDuel(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-10 rounded-xl"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 1-on-1 UNICAST CHAT MODAL ==================== */}
      {activeChatFriend && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4 bg-black/90 sm:backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`bg-[#0b0d14] flex flex-col shadow-2xl relative transition-all duration-200 overflow-hidden ${
              isChatFullScreen
                ? "fixed inset-0 z-50 h-[100dvh] w-full rounded-none border-0"
                : "h-[100dvh] w-full rounded-none border-0 sm:border-2 sm:border-emerald-500/40 sm:rounded-3xl sm:max-w-xl sm:h-[650px] sm:max-h-[90dvh]"
            }`}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 p-3.5 sm:p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={activeChatFriend.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChatFriend.name)}&background=10b981&color=fff`}
                    alt={activeChatFriend.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border border-emerald-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-black text-sm sm:text-base leading-none truncate max-w-[140px] sm:max-w-xs">
                      {activeChatFriend.name}
                    </h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold border-emerald-500/30 flex-shrink-0">
                      Unicast 1v1
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[11px] sm:text-xs text-white/50 truncate">
                    <span>{activeChatFriend.arenaRank || 'Bronze'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-indigo-300 font-semibold truncate">
                      <span>{getCountryFlag(activeChatFriend.countryCode)}</span>
                      <span className="truncate">{activeChatFriend.city ? `${activeChatFriend.city}, ` : ''}{activeChatFriend.country || 'Global'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearUnicastChat}
                  className="h-8 border-white/10 text-rose-400 hover:bg-rose-500/10 text-xs px-2 sm:px-2.5 rounded-xl font-bold"
                  title="Clear conversation"
                >
                  Clear
                </Button>
                {/* Fullscreen / Window Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsChatFullScreen(!isChatFullScreen)}
                  className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 items-center justify-center text-white/50 hover:text-white transition-colors"
                  title={isChatFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isChatFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChatFriend(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ephemeral 24H Auto-Delete Notice Banner */}
            <div className="flex-shrink-0 px-3 sm:px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-300">
              <div className="flex items-center gap-1.5 min-w-0">
                <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">End-to-End Private Chat: Connected via mutual friend acceptance.</span>
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex-shrink-0 ml-2">
                <Clock className="w-3 h-3" />
                <span>Deletes in 24h</span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 overscroll-contain">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Start your conversation with {activeChatFriend.name}</h4>
                    <p className="text-white/40 text-xs mt-1 max-w-xs">
                      Say hello! Messages in this private unicast room are stored temporarily and automatically purged after 24 hours.
                    </p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?.id
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-white/40 px-1">
                        <span>{isMe ? 'You' : msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                            : 'bg-white/10 text-white border border-white/10 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer - FIXED & ALWAYS VISIBLE */}
            <form
              onSubmit={handleSendUnicastMessage}
              className="flex-shrink-0 sticky bottom-0 z-10 p-2 sm:p-3 bg-[#0b0d14] border-t border-white/10 flex items-center gap-2 pb-safe"
            >
              <input
                ref={chatInputRef}
                type="text"
                autoComplete="off"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Message ${activeChatFriend.name} (auto-deletes in 24h)...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-3.5 sm:px-4 font-bold gap-1.5 flex-shrink-0 shadow-lg shadow-emerald-600/20"
              >
                {chatSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Visit Student Profile Modal */}
      <VisitProfileModal
        user={visitingProfileUser}
        currentUser={currentUser}
        isOpen={!!visitingProfileUser}
        onClose={() => setVisitingProfileUser(null)}
        onStartChat={(u) => handleOpenUnicastChat(u)}
        onStartDuel={(u) => handleOpenDuelModal(u)}
      />
    </div>
  )
}
