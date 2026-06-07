"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserMinus, Search, Check, X, ShieldAlert, Swords, Loader2 } from "lucide-react"

interface FriendsPanelProps {
  currentUser: any
}

export function FriendsPanel({ currentUser }: FriendsPanelProps) {
  const [friends, setFriends] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchFriendsAndRequests = async () => {
    if (!currentUser?.id) return
    try {
      const res = await fetch(`/api/arena/friends?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.friends) setFriends(data.friends)
      if (data.requests) setRequests(data.requests)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchFriendsAndRequests()
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

  const handleChallenge = (friend: any) => {
    alert(`Challenge request sent to ${friend.name}! (Simulated 1v1 Battle room opening)`)
    // Normally, this triggers a socket message to challenge friend.
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Friends List */}
      <div className="lg:col-span-2 space-y-4">
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
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={friend.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=6366f1&color=fff`}
                      alt={friend.name}
                      className="w-11 h-11 rounded-xl object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${friend.isOnline || Math.random() > 0.5 ? 'bg-green-500' : 'bg-white/20'}`} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm flex items-center gap-1.5">
                      {friend.name}
                      <Badge className="bg-indigo-600/30 text-indigo-300 text-[9px] px-1.5 py-0">Lv.{friend.level || 1}</Badge>
                    </div>
                    <div className="text-[11px] text-white/40 font-bold">{friend.arenaRank || 'Bronze'}</div>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleChallenge(friend)}
                  >
                    <Swords className="w-3.5 h-3.5 mr-1" /> Duel
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

      {/* Right: Search Users Panel */}
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
              <div className="flex items-center gap-3">
                <img
                  src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                  alt={u.name}
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <div className="text-white font-bold text-xs">{u.name}</div>
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
  )
}
