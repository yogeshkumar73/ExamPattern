"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Coins,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Award,
  ArrowRight,
  TrendingUp,
  UserCheck
} from "lucide-react"

interface InviteFriendsSectionProps {
  currentUser?: any
  compact?: boolean
  onCoinsUpdated?: (newCoins: number) => void
}

const BASE_INVITE_URL = "https://exampattern.netlify.app"

export function InviteFriendsSection({ currentUser, compact = false, onCoinsUpdated }: InviteFriendsSectionProps) {
  const [teamCode, setTeamCode] = useState<string>("")
  const [inviteLink, setInviteLink] = useState<string>("")
  const [coins, setCoins] = useState<number>(0)
  const [referralCount, setReferralCount] = useState<number>(0)
  const [referralEarnings, setReferralEarnings] = useState<number>(0)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [redeemCodeInput, setRedeemCodeInput] = useState("")
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [recentReferred, setRecentReferred] = useState<any[]>([])

  useEffect(() => {
    // Determine userId / email
    const userId = currentUser?._id || currentUser?.id
    const email = currentUser?.email

    // Compute initial fallback code
    const initialCode = currentUser?.referralCode || `TEAM-${String(userId || "STUDENT").substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
    setTeamCode(initialCode)
    setInviteLink(`${BASE_INVITE_URL}/?ref=${initialCode}`)
    setCoins(currentUser?.coins || 0)
    setReferralCount(currentUser?.referralCount || 0)
    setReferralEarnings(currentUser?.referralEarnings || (currentUser?.referralCount || 0) * 200)

    if (userId || email) {
      fetch(`/api/user/referral?userId=${encodeURIComponent(userId || "")}&email=${encodeURIComponent(email || "")}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTeamCode(data.referralCode || initialCode)
            setInviteLink(data.inviteLink || `${BASE_INVITE_URL}/?ref=${data.referralCode || initialCode}`)
            setCoins(data.coins ?? (currentUser?.coins || 0))
            setReferralCount(data.referralCount ?? 0)
            setReferralEarnings(data.referralEarnings ?? 0)
            if (Array.isArray(data.referredStudents)) {
              setRecentReferred(data.referredStudents)
            }
          }
        })
        .catch((err) => console.warn("Failed to load referral stats:", err))
    }
  }, [currentUser])

  const handleCopyLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyCode = () => {
    if (!teamCode) return
    navigator.clipboard.writeText(teamCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚀 Join my team on Aura Study AI! Use my team invite code *${teamCode}* to get 100 free coins and practice questions together:\n\n${inviteLink}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join my team on Aura Study AI",
          text: `Use my team code ${teamCode} to get 100 bonus coins on Aura Study AI!`,
          url: inviteLink,
        })
      } catch (_) {}
    } else {
      handleCopyLink()
    }
  }

  const handleRedeemCode = async () => {
    const code = redeemCodeInput.trim().toUpperCase()
    if (!code) {
      setRedeemMessage({ text: "Please enter a valid team invite code.", type: "error" })
      return
    }

    setRedeemLoading(true)
    setRedeemMessage(null)

    try {
      const res = await fetch("/api/user/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redeem",
          inviteCode: code,
          userId: currentUser?._id || currentUser?.id,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setRedeemMessage({ text: data.message || "Team code redeemed successfully! +100 Coins added.", type: "success" })
        setCoins(data.coins)
        if (onCoinsUpdated) onCoinsUpdated(data.coins)
        setRedeemCodeInput("")
      } else {
        setRedeemMessage({ text: data.error || "Failed to redeem team code.", type: "error" })
      }
    } catch (err: any) {
      setRedeemMessage({ text: err.message || "Network error. Please try again.", type: "error" })
    } finally {
      setRedeemLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              🪙
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                Invite Friends <Badge className="bg-amber-500 text-black text-[9px] font-black">+200 COINS</Badge>
              </div>
              <div className="text-[11px] text-white/60">Share platform link with your team code</div>
            </div>
          </div>
        </div>

        {/* Team Code & Link Quick Copy */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5">
          <span className="text-xs font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
            {teamCode}
          </span>
          <div className="flex-1 truncate text-[11px] text-white/50 font-mono">
            {inviteLink}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
            onClick={handleCopyLink}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 border-white/20 text-white hover:bg-white/10 font-bold text-xs gap-1.5"
            onClick={handleNativeShare}
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner Card */}
      <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-background to-indigo-950/20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <CardHeader className="relative pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white flex items-center justify-center shadow-lg text-2xl font-black">
                🪙
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  Invite Friends & Earn Coins
                  <Badge className="bg-amber-500 text-black font-black text-xs px-2.5 py-0.5 shadow">
                    +200 COINS / FRIEND
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Share the application platform link with your personal team code. When any student joins, you get 200 coins instantly!
                </CardDescription>
              </div>
            </div>

            {/* Current Balance */}
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2 self-start sm:self-auto">
              <span className="text-2xl">🪙</span>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-400 block tracking-wider">
                  Your Balance
                </span>
                <span className="text-xl font-black text-white">{coins} Coins</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6 pt-4">
          {/* Key Stats Counter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-xs text-muted-foreground font-bold block mb-1">Per Referral</span>
              <span className="text-lg font-black text-amber-400">+200 🪙</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-xs text-muted-foreground font-bold block mb-1">Friends Joined</span>
              <span className="text-lg font-black text-indigo-400">{referralCount} Students</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-xs text-muted-foreground font-bold block mb-1">Total Earned</span>
              <span className="text-lg font-black text-emerald-400">{referralEarnings} 🪙</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-xs text-muted-foreground font-bold block mb-1">Friend Bonus</span>
              <span className="text-lg font-black text-purple-400">+100 🪙</span>
            </div>
          </div>

          {/* Share Box 1: Team Code */}
          <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" /> Your Personal Team Invite Code
              </label>
              <span className="text-[11px] text-muted-foreground">Give this code to friends during registration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 border border-amber-500/30 rounded-xl px-4 py-2.5 font-mono text-lg font-black text-amber-300 tracking-wider flex items-center justify-between">
                <span>{teamCode}</span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px] font-bold">
                  Active
                </Badge>
              </div>
              <Button
                onClick={handleCopyCode}
                className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-black px-4"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>

          {/* Share Box 2: Direct Platform Link */}
          <div className="p-5 rounded-2xl bg-black/40 border border-indigo-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-indigo-400" /> Platform Invite Link (With Auto-Applied Code)
              </label>
              <span className="text-[11px] text-muted-foreground">Direct link to student practice application</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-white/5 border border-indigo-500/30 rounded-xl px-4 py-2.5 font-mono text-xs sm:text-sm text-white/80 truncate">
                {inviteLink}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 font-bold px-4 flex-1 sm:flex-none"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </Button>
                <Button
                  onClick={handleWhatsAppShare}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 flex-1 sm:flex-none"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
                <Button
                  onClick={handleNativeShare}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 flex-1 sm:flex-none"
                >
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          </div>

          {/* How It Works Progression */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Share Your Link</h4>
              <p className="text-xs text-muted-foreground">
                Send your team invite link ({BASE_INVITE_URL}) or code to classmates, study groups, or friends.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Friend Registers</h4>
              <p className="text-xs text-muted-foreground">
                Your friend registers on the platform. The invite code links them directly into your academic team.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Get +200 Coins Credit</h4>
              <p className="text-xs text-muted-foreground">
                200 coins are automatically credited to your balance, and your friend receives 100 coins welcome bonus!
              </p>
            </div>
          </div>

          {/* Redeem a Friend's Code Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-white">Have a teammate's invite code?</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter team invite code (e.g. TEAM-ABC123)"
                value={redeemCodeInput}
                onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                className="max-w-md bg-black/40 border-white/10 text-sm font-mono uppercase"
              />
              <Button
                onClick={handleRedeemCode}
                disabled={redeemLoading || !redeemCodeInput.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-black font-black"
              >
                {redeemLoading ? "Redeeming..." : "Redeem +100 Coins"}
              </Button>
            </div>
            {redeemMessage && (
              <p className={`text-xs font-bold ${redeemMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                {redeemMessage.text}
              </p>
            )}
          </div>

          {/* Recent Referrals List */}
          {recentReferred.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Your Team Members ({recentReferred.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {recentReferred.map((ref, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                        {ref.name?.charAt(0) || "S"}
                      </div>
                      <span className="font-bold text-white truncate max-w-[120px]">{ref.name}</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border-emerald-500/30">
                      +200 🪙
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
export default InviteFriendsSection
