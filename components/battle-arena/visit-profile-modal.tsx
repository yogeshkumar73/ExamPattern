'use client'

import React, { useState, useEffect } from 'react'
import {
  X, Trophy, Zap, Target, Flame, Shield, Star, Globe, MapPin,
  MessageSquare, Swords, UserPlus, Check, Clock, Award, BookOpen,
  GraduationCap, Sparkles, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface VisitProfileModalProps {
  user: {
    userId?: string
    id?: string
    _id?: string
    name: string
    email?: string
    avatar?: string
    photoUrl?: string
    arenaRank?: string
    xp?: number
    level?: number
    wins?: number
    losses?: number
    winRate?: number
    currentStreak?: number
    accuracy?: number
    badges?: string[]
    country?: string
    countryCode?: string
    city?: string
    stream?: string
    course?: string
    department?: string
    bio?: string
    arenaPoints?: number
    categoryXP?: number
  } | null
  currentUser: any
  isOpen: boolean
  onClose: () => void
  onStartChat?: (user: any) => void
  onStartDuel?: (user: any) => void
}

const RANK_ICONS: Record<string, string> = {
  Unranked: '⬜', Bronze: '🥉', Silver: '🥈', Gold: '🥇',
  Platinum: '💠', Diamond: '💎', Master: '👑', Grandmaster: '🌟',
}

const RANK_GRADIENTS: Record<string, string> = {
  Unranked:    'from-slate-700 via-slate-800 to-black',
  Bronze:      'from-amber-900/60 via-amber-950 to-black',
  Silver:      'from-slate-600/60 via-slate-900 to-black',
  Gold:        'from-yellow-700/60 via-amber-950 to-black',
  Platinum:    'from-cyan-800/60 via-cyan-950 to-black',
  Diamond:     'from-blue-700/60 via-indigo-950 to-black',
  Master:      'from-purple-800/60 via-purple-950 to-black',
  Grandmaster: 'from-rose-800/60 via-red-950 to-black',
}

function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🇮🇳'
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return '🌍'
  }
}

export function VisitProfileModal({
  user,
  currentUser,
  isOpen,
  onClose,
  onStartChat,
  onStartDuel,
}: VisitProfileModalProps) {
  const [profileData, setProfileData] = useState<any>(user)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending' | 'sent'>('none')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const effectiveUserId = user?.userId || user?.id || user?._id || ''
  const isMe = currentUser?.id && (currentUser.id === effectiveUserId || currentUser.email === user?.email)

  // Fetch full user profile and check friend connection
  useEffect(() => {
    if (!isOpen || !user) return

    setProfileData(user)
    setFriendStatus('none')
    setActionMessage(null)

    let isMounted = true

    const fetchFullProfile = async () => {
      setLoadingDetails(true)
      try {
        const queryParam = effectiveUserId
          ? `userId=${encodeURIComponent(effectiveUserId)}`
          : `email=${encodeURIComponent(user.email || user.name)}`
        
        const res = await fetch(`/api/profile?${queryParam}`)
        if (res.ok) {
          const data = await res.json()
          if (data.user && isMounted) {
            setProfileData((prev: any) => ({
              ...prev,
              ...data.user,
              country: data.user.country || prev?.country || 'India',
              countryCode: data.user.countryCode || prev?.countryCode || 'IN',
              city: data.user.city || prev?.city || 'New Delhi',
            }))
          }
        }
      } catch (err) {
        console.warn('Error fetching full profile details:', err)
      } finally {
        if (isMounted) setLoadingDetails(false)
      }
    }

    const checkFriendState = async () => {
      if (!currentUser?.id || isMe) return
      try {
        const res = await fetch(`/api/arena/friends?userId=${encodeURIComponent(currentUser.id)}`)
        if (res.ok) {
          const data = await res.json()
          const friendsList = data.friends || []
          const reqList = data.requests || []

          const isFriend = friendsList.some(
            (f: any) => String(f._id || f.id || f.userId) === String(effectiveUserId) || (user.email && f.email === user.email)
          )
          if (isFriend) {
            if (isMounted) setFriendStatus('friends')
            return
          }

          const isPending = reqList.some(
            (r: any) => String(r._id || r.id || r.userId) === String(effectiveUserId) || (user.email && r.email === user.email)
          )
          if (isPending) {
            if (isMounted) setFriendStatus('pending')
          }
        }
      } catch (e) {
        console.warn('Error checking friend state:', e)
      }
    }

    fetchFullProfile()
    checkFriendState()

    return () => {
      isMounted = false
    }
  }, [isOpen, effectiveUserId, user?.email])

  if (!isOpen || !user) return null

  const rankTier = profileData?.arenaRank || user?.arenaRank || 'Gold'
  const gradientClass = RANK_GRADIENTS[rankTier] || RANK_GRADIENTS.Gold
  const flagEmoji = getCountryFlag(profileData?.countryCode)
  const countryName = profileData?.country || 'India'
  const cityName = profileData?.city ? `${profileData.city}, ` : ''

  // 1. Send Friend Request
  const handleSendFriendRequest = async () => {
    if (!currentUser?.id || actionLoading) return
    setActionLoading(true)
    setActionMessage(null)

    try {
      const res = await fetch('/api/arena/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          userId: currentUser.id,
          userName: currentUser.name || 'Student',
          friendId: effectiveUserId,
          friendName: profileData?.name || user?.name,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setFriendStatus('sent')
        setActionMessage('Friend request sent successfully!')
      } else {
        setActionMessage(data.error || 'Could not send request')
      }
    } catch (e) {
      setActionMessage('Failed to send friend request')
    } finally {
      setActionLoading(false)
    }
  }

  // 2. Open Direct 1v1 Chat
  const handleChatClick = () => {
    if (onStartChat) {
      onStartChat({
        _id: effectiveUserId,
        id: effectiveUserId,
        name: profileData?.name || user?.name,
        avatar: profileData?.avatar || user?.avatar || profileData?.photoUrl,
        arenaRank: rankTier,
        country: countryName,
        countryCode: profileData?.countryCode || 'IN',
        city: profileData?.city || '',
      })
      onClose()
    } else {
      // Dispatch arena navigation to friends tab and open unicast chat
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('arena-navigate', {
            detail: {
              tab: 'friends',
              openChatWith: {
                _id: effectiveUserId,
                id: effectiveUserId,
                name: profileData?.name || user?.name,
                avatar: profileData?.avatar || user?.avatar || profileData?.photoUrl,
                arenaRank: rankTier,
                country: countryName,
                countryCode: profileData?.countryCode || 'IN',
                city: profileData?.city || '',
              },
            },
          })
        )
        onClose()
      }
    }
  }

  // 3. Challenge to 1v1 Duel
  const handleDuelClick = () => {
    if (onStartDuel) {
      onStartDuel({
        _id: effectiveUserId,
        id: effectiveUserId,
        name: profileData?.name || user?.name,
        avatar: profileData?.avatar || user?.avatar || profileData?.photoUrl,
        arenaRank: rankTier,
      })
      onClose()
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('arena-navigate', {
            detail: {
              tab: 'friends',
              duel: 1,
              targetUser: {
                _id: effectiveUserId,
                id: effectiveUserId,
                name: profileData?.name || user?.name,
              },
            },
          })
        )
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl space-y-0 text-white">
        
        {/* Cover Header Banner */}
        <div className={`relative h-28 bg-gradient-to-r ${gradientClass} p-4 flex items-start justify-between`}>
          <div className="flex items-center gap-2">
            <Badge className="bg-black/50 backdrop-blur-md text-white border-white/20 text-xs font-mono font-bold">
              {RANK_ICONS[rankTier] || '🥇'} {rankTier} Division
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Student
            </Badge>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar & Key Profile Identity */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-3.5">
              <div className="relative">
                <img
                  src={
                    profileData?.avatar ||
                    profileData?.photoUrl ||
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`
                  }
                  alt={profileData?.name || user?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-zinc-950 shadow-xl bg-zinc-900"
                />
                <div className="absolute -bottom-1 -right-1 text-sm bg-black/70 px-1 py-0.5 rounded-lg border border-white/20">
                  {RANK_ICONS[rankTier] || '🥇'}
                </div>
              </div>

              <div className="mb-1">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  {profileData?.name || user?.name}
                  {isMe && (
                    <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-500/50 text-[10px]">
                      YOU
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Level {profileData?.level || user?.level || 1} • {profileData?.arenaPoints || user?.arenaPoints || user?.xp || 0} Arena Pts
                </p>
              </div>
            </div>

            {/* Country & Location Badge (from IP or user profile) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-2 self-start sm:self-auto">
              <span className="text-lg leading-none">{flagEmoji}</span>
              <div className="text-left">
                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{cityName}{countryName}</span>
                </div>
                <div className="text-[9px] text-white/40 uppercase tracking-wider font-mono">
                  Location Verified
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info & Bio */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-white/70">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                Stream & Course:
              </span>
              <span className="font-mono text-purple-300 font-bold uppercase text-[11px]">
                {profileData?.stream || profileData?.course || 'General Academic'}
              </span>
            </div>
            {profileData?.bio && (
              <p className="text-white/60 text-[11px] pt-1 border-t border-white/5">
                "{profileData.bio}"
              </p>
            )}
          </div>

          {/* Performance & Combat Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
            <div className="bg-black/50 border border-white/10 rounded-xl p-2.5">
              <div className="text-xs text-white/40 mb-0.5">Win / Loss</div>
              <div className="text-sm font-black text-emerald-400">
                {profileData?.wins ?? user?.wins ?? 0}
                <span className="text-white/30 text-xs"> / </span>
                <span className="text-rose-400">{profileData?.losses ?? user?.losses ?? 0}</span>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-2.5">
              <div className="text-xs text-white/40 mb-0.5">Win Rate</div>
              <div className="text-sm font-black text-amber-400">
                {profileData?.winRate ?? user?.winRate ?? 0}%
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-2.5">
              <div className="text-xs text-white/40 mb-0.5">Streak</div>
              <div className="text-sm font-black text-orange-400 flex items-center justify-center gap-0.5">
                <Flame className="w-3.5 h-3.5" />
                {profileData?.currentStreak ?? user?.currentStreak ?? 0}
              </div>
            </div>
          </div>

          {/* Badges strip */}
          {Array.isArray(profileData?.badges) && profileData.badges.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              <span className="text-[10px] text-white/40 uppercase font-bold mr-1">Badges:</span>
              {profileData.badges.map((b: string, idx: number) => (
                <Badge key={idx} className="bg-white/10 text-white border-white/10 text-xs px-2 py-0.5">
                  {b}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Message / Feedback */}
          {actionMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs text-center font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              {actionMessage}
            </div>
          )}

          {/* Action Buttons: Friend Request, Direct Unicast Chat, Duel */}
          {!isMe && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              {/* 1. Friend Request Button */}
              {friendStatus === 'friends' ? (
                <Button
                  disabled
                  size="sm"
                  className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold h-9"
                >
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Friends ✓
                </Button>
              ) : friendStatus === 'sent' ? (
                <Button
                  disabled
                  size="sm"
                  className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold h-9"
                >
                  <Clock className="w-3.5 h-3.5 mr-1" /> Sent
                </Button>
              ) : (
                <Button
                  onClick={handleSendFriendRequest}
                  disabled={actionLoading}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 shadow-md shadow-indigo-600/20"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Friend
                    </>
                  )}
                </Button>
              )}

              {/* 2. Direct 1v1 Chat Button */}
              <Button
                onClick={handleChatClick}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> 1v1 Chat
              </Button>

              {/* 3. Challenge 1v1 Duel Button */}
              <Button
                onClick={handleDuelClick}
                size="sm"
                className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold h-9 shadow-md shadow-rose-600/20"
              >
                <Swords className="w-3.5 h-3.5 mr-1" /> Duel ⚔️
              </Button>
            </div>
          )}

          {isMe && (
            <div className="pt-2 border-t border-white/10 text-center text-xs text-white/50">
              This is your public battle arena profile seen by other students.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
