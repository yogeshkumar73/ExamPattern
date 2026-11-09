"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Send,
  MessageSquare,
  Users,
  Swords,
  BookOpen,
  Award,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Mail,
  User,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export interface NotificationItem {
  _id: string
  userId: string
  recipientEmail?: string
  recipientName?: string
  senderId?: string
  senderName?: string
  senderPhotoUrl?: string
  senderEmail?: string
  title: string
  message: string
  category: "message" | "direct_message" | "study_invite" | "battle_challenge" | "achievement" | "General" | "system"
  priority: "low" | "normal" | "high" | "urgent"
  actionUrl?: string
  isRead: boolean
  createdAt: string
}

export interface StudentRecipient {
  _id: string
  name: string
  email?: string
  shortId?: string
  photoUrl?: string
  stream?: string
  rank?: string
  level?: number
}

interface NotificationsCenterProps {
  currentUserId?: string
  currentUserEmail?: string
  currentUserName?: string
  currentUserPhotoUrl?: string
  isAdmin?: boolean
  variant?: "button" | "embedded"
  onNavigate?: (step: string) => void
}

export function NotificationsCenter({
  currentUserId,
  currentUserEmail,
  currentUserName,
  currentUserPhotoUrl,
  isAdmin = false,
  variant = "button",
  onNavigate,
}: NotificationsCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"inbox" | "compose">("inbox")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Compose State
  const [recipients, setRecipients] = useState<StudentRecipient[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const [customRecipientEmail, setCustomRecipientEmail] = useState("")
  const [messageTitle, setMessageTitle] = useState("")
  const [messageBody, setMessageBody] = useState("")
  const [messageCategory, setMessageCategory] = useState<string>("direct_message")
  const [messagePriority, setMessagePriority] = useState<string>("normal")
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  // Connection & Following State
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set())
  const [connectingUser, setConnectingUser] = useState<string | null>(null)

  // Resolve user identification
  const effectiveUserId = currentUserId || currentUserEmail || "student-guest"

  // Load notifications
  const loadNotifications = useCallback(async (silent = false) => {
    if (!effectiveUserId) return
    if (!silent) setIsLoading(true)

    try {
      const param = currentUserEmail ? `email=${encodeURIComponent(currentUserEmail)}` : `userId=${encodeURIComponent(effectiveUserId)}`
      const res = await fetch(`/api/notifications?${param}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount || data.notifications.filter((n: NotificationItem) => !n.isRead).length)
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [effectiveUserId, currentUserEmail])

  // Load recipients
  const loadRecipients = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?action=recipients${currentUserId ? `&userId=${currentUserId}` : ""}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.recipients)) {
        setRecipients(data.recipients)
      }
    } catch (err) {
      console.warn("Failed to load recipients:", err)
    }
  }, [currentUserId])

  // Initial load and periodic polling every 15s
  useEffect(() => {
    loadNotifications()
    loadRecipients()

    const interval = setInterval(() => {
      loadNotifications(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [loadNotifications, loadRecipients])

  // Mark single notification read
  const handleMarkRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
    } catch (err) {
      console.warn("Error marking notification read:", err)
    }
  }

  // Mark all notifications read
  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)

      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markAll: true,
          userId: currentUserId,
          email: currentUserEmail,
        }),
      })
    } catch (err) {
      console.warn("Error marking all read:", err)
    }
  }

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: "DELETE",
      })
    } catch (err) {
      console.warn("Error deleting notification:", err)
    }
  }

  // Accept friend request & create follower connection
  const handleAcceptConnection = async (notif: NotificationItem) => {
    if (!notif.senderId || !currentUserId) return
    setConnectingUser(notif.senderId)
    try {
      // 1. Accept friend request in Arena
      await fetch('/api/arena/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          userId: currentUserId,
          friendId: notif.senderId,
        }),
      })

      // 2. Follow user mutually
      await fetch(`/api/users/${notif.senderId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId }),
      }).catch(() => {})

      // 3. Mark notification as read
      await handleMarkRead(notif._id)

      setConnectedUsers(prev => new Set(prev).add(notif.senderId!))
    } catch (err) {
      console.warn("Error accepting connection:", err)
    } finally {
      setConnectingUser(null)
    }
  }

  // Pre-fill reply for admin
  const handleReplyToSender = (notif: NotificationItem) => {
    if (isAdmin && (notif.senderEmail || notif.senderId)) {
      setSelectedRecipientId(notif.senderId || "")
      setCustomRecipientEmail(notif.senderId ? `#${notif.senderId.slice(-6).toUpperCase()}` : "")
      setMessageTitle(`Re: ${notif.title}`)
      setMessageCategory("direct_message")
      setActiveTab("compose")
    }
  }

  // Send new notification message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!messageTitle.trim() || !messageBody.trim()) {
      setSendError("Please enter both a title and message.")
      return
    }

    setIsSending(true)
    setSendError(null)
    setSendSuccess(null)

    // Determine target recipient
    let targetRecipientId = selectedRecipientId
    let targetEmail = customRecipientEmail
    let targetName = ""

    const matched = recipients.find(r => r._id === selectedRecipientId)
    if (matched) {
      targetEmail = matched.email || ""
      targetName = matched.name
    }

    if (!targetRecipientId && !targetEmail) {
      setSendError("Please select a recipient student or specify an ID.")
      setIsSending(false)
      return
    }

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetRecipientId,
          recipientEmail: targetEmail,
          recipientName: targetName,
          senderId: currentUserId || "user",
          senderName: currentUserName || "Student",
          senderPhotoUrl: currentUserPhotoUrl || "",
          senderEmail: currentUserEmail || "",
          title: messageTitle.trim(),
          message: messageBody.trim(),
          category: messageCategory,
          priority: messagePriority,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSendSuccess(`Message successfully sent to ${targetName || targetEmail || "student"}!`)
        setMessageTitle("")
        setMessageBody("")
        setSelectedRecipientId("")
        setCustomRecipientEmail("")
        setTimeout(() => {
          setSendSuccess(null)
          setActiveTab("inbox")
          loadNotifications(true)
        }, 1800)
      } else {
        setSendError(data.message || "Failed to send message.")
      }
    } catch (err) {
      console.error("Failed to send message:", err)
      setSendError("Network error sending notification.")
    } finally {
      setIsSending(false)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (categoryFilter === "unread") return !n.isRead
    if (categoryFilter === "direct") return n.category === "direct_message" || n.category === "message"
    if (categoryFilter === "invites") return n.category === "study_invite" || n.category === "battle_challenge"
    return true
  })

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
      if (diff < 60) return "just now"
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
      return `${Math.floor(diff / 86400)}d ago`
    } catch {
      return "recently"
    }
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "direct_message":
      case "message":
        return <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px]">Message</Badge>
      case "study_invite":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">Study Invite</Badge>
      case "battle_challenge":
        return <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">Battle</Badge>
      case "achievement":
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">Achievement</Badge>
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px]">Notice</Badge>
    }
  }

  // --- Content Body (shared between Sheet and Embedded view) ---
  const renderContent = () => (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Button
                size="sm"
                variant={activeTab === "inbox" ? "default" : "outline"}
                onClick={() => setActiveTab("inbox")}
                className="text-xs h-8 font-bold gap-1 rounded-lg"
              >
                <Bell className="w-3.5 h-3.5" /> Inbox
                {unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant={activeTab === "compose" ? "default" : "outline"}
                onClick={() => setActiveTab("compose")}
                className="text-xs h-8 font-bold gap-1 rounded-lg"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-primary" /> Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
          )}
        </div>

        {activeTab === "inbox" && notifications.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllRead}
              className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground font-semibold"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => loadNotifications()}
              className="h-7 w-7 p-0 text-muted-foreground"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        )}
      </div>

      {/* --- INBOX TAB --- */}
      {activeTab === "inbox" && (
        <div className="flex flex-col flex-1 min-h-0 space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "direct", label: "Messages" },
              { id: "invites", label: "Invites & Battles" },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-full font-bold transition-all text-[11px] whitespace-nowrap ${
                  categoryFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[550px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Bell className="w-10 h-10 opacity-30 mb-2" />
                <p className="font-bold text-sm">No notifications found</p>
                <p className="text-xs mt-1">Messages and alerts sent to you will appear here.</p>
              </div>
            ) : (
              filteredNotifications.map(item => (
                <div
                  key={item._id}
                  className={`p-3.5 rounded-2xl border transition-all text-left relative group ${
                    item.isRead
                      ? "bg-muted/20 border-border/40 opacity-85 hover:opacity-100"
                      : "bg-primary/5 border-primary/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Sender Avatar */}
                    <div className="w-9 h-9 rounded-full bg-muted border overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs">
                      {item.senderPhotoUrl ? (
                        <img src={item.senderPhotoUrl} alt={item.senderName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-black text-xs truncate text-foreground">{item.senderName || "Aura Member"}</span>
                          {item.senderId && (
                            <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded">
                              #{item.senderId.slice(-6).toUpperCase()}
                            </span>
                          )}
                          {getCategoryBadge(item.category)}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-foreground leading-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.message}</p>

                      {/* Action buttons - Profile redirect, Friend accept & connect, Chat */}
                      <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                        {!item.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkRead(item._id)}
                            className="h-6 px-2 text-[10px] font-bold text-primary"
                          >
                            <Check className="w-3 h-3 mr-1" /> Mark Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (onNavigate) {
                              setIsOpen(false);
                              onNavigate("profile");
                            }
                          }}
                          className="h-6 px-2 text-[10px] font-bold text-indigo-500 hover:bg-indigo-500/10"
                        >
                          <User className="w-3 h-3 mr-1" /> Profile
                        </Button>
                        {item.senderId && item.senderId !== currentUserId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={connectedUsers.has(item.senderId) || connectingUser === item.senderId}
                            onClick={() => handleAcceptConnection(item)}
                            className="h-6 px-2 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500/10"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {connectedUsers.has(item.senderId)
                              ? "Connected"
                              : connectingUser === item.senderId
                              ? "Connecting..."
                              : "Accept & Connect"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (onNavigate) {
                              setIsOpen(false);
                              onNavigate("chat");
                            }
                          }}
                          className="h-6 px-2 text-[10px] font-bold text-cyan-500 hover:bg-cyan-500/10"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" /> Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNotification(item._id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 ml-auto"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- COMPOSE TAB (Admin Only) --- */}
      {isAdmin && activeTab === "compose" && (
        <form onSubmit={handleSendMessage} className="space-y-4 flex-1 overflow-y-auto pr-1">
          {sendSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" /> {sendSuccess}
            </div>
          )}
          {sendError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {sendError}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Recipient Student</label>
            <Select value={selectedRecipientId} onValueChange={(val) => {
              setSelectedRecipientId(val)
              const r = recipients.find(x => x._id === val)
              if (r) setCustomRecipientEmail(r.shortId || r._id)
            }}>
              <SelectTrigger className="h-11 font-medium bg-background border-2 rounded-xl">
                <SelectValue placeholder="Choose a registered student..." />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(r => (
                  <SelectItem key={r._id} value={r._id}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{r.name}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                        {r.shortId || `#${r._id.slice(-6).toUpperCase()}`}
                      </span>
                      {r.rank && <Badge variant="outline" className="text-[9px] py-0">{r.rank}</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Or Enter Recipient ID (or &apos;all&apos; for broadcast)</label>
            <Input
              type="text"
              value={customRecipientEmail}
              onChange={e => setCustomRecipientEmail(e.target.value)}
              placeholder="e.g. #3F9A1B, user ID, or 'all'"
              className="h-10 font-medium bg-background border-2 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Message Type</label>
              <Select value={messageCategory} onValueChange={setMessageCategory}>
                <SelectTrigger className="h-10 font-medium bg-background border-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_message">Direct Message</SelectItem>
                  <SelectItem value="study_invite">Study Session Invite</SelectItem>
                  <SelectItem value="battle_challenge">Battle Challenge</SelectItem>
                  <SelectItem value="achievement">Kudos / Praise</SelectItem>
                  <SelectItem value="system">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Priority</label>
              <Select value={messagePriority} onValueChange={setMessagePriority}>
                <SelectTrigger className="h-10 font-medium bg-background border-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Notification Subject / Title</label>
            <Input
              value={messageTitle}
              onChange={e => setMessageTitle(e.target.value)}
              placeholder="e.g. Let's study for GATE exam together..."
              className="h-10 font-medium bg-background border-2 rounded-xl"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Message Content</label>
            <Textarea
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              placeholder="Type your message to inform the student..."
              rows={4}
              className="resize-none font-medium bg-background border-2 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={isSending}
            className="w-full h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Sending Notification...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Send Notification Message
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )

  // --- EMBEDDED VARIANT (for Student Profile Tab) ---
  if (variant === "embedded") {
    return (
      <div className="bg-card border-2 rounded-3xl p-6 shadow-xl">
        <div className="mb-4 text-left">
          <h3 className="text-xl font-black text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notifications & User-to-User Messages
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Send real-time alerts to other students and read incoming messages end-to-end.
          </p>
        </div>
        {renderContent()}
      </div>
    )
  }

  // --- BUTTON + SHEET VARIANT (for Header / Dashboard Bell) ---
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-xl border-primary/20 bg-muted/20 hover:bg-muted/40 transition-colors"
          aria-label="View Notifications"
          title="Notifications & Messages"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-background animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[450px] p-6 flex flex-col justify-between">
        <SheetHeader className="text-left border-b pb-3 mb-2">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-black">
              <Bell className="w-5 h-5 text-primary" /> Notifications & Messages
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-rose-500 text-white text-[10px] font-bold">
                {unreadCount} Unread
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        {renderContent()}
      </SheetContent>
    </Sheet>
  )
}
