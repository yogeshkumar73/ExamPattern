"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react"
import { Send, Hash, MessageSquare, Users, Swords, Bot, Menu, X, ShieldCheck, Bell, Clock, ChevronRight, Lock } from "lucide-react"

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
import type { LucideIcon } from "lucide-react"
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null;
if (typeof window !== "undefined") {
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "");
  if (socketUrl) {
    socket = io(socketUrl, { path: "/socket.io" });
  }
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  message: string
  timestamp: string
  type: string
  roomId?: string
  isSystem?: boolean
}

interface ChatRoom {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

const ROOMS: ChatRoom[] = [
  {
    id: "arena-lobby",
    label: "Arena Lobby",
    icon: Hash,
    color: "#6366f1",
  },
  {
    id: "coding-chat",
    label: "Coding Hub",
    icon: MessageSquare,
    color: "#3b82f6",
  },
  {
    id: "math-chat",
    label: "Math Hub",
    icon: MessageSquare,
    color: "#10b981",
  },
  {
    id: "gk-chat",
    label: "GK Hub",
    icon: MessageSquare,
    color: "#f59e0b",
  },
]
// Generate mock messages for demo
function generateMockMessages(roomId: string, count: number): Message[] {
  const users = [
    {
      id: "u1",
      name: "AlgoMaster",
      avatar: "https://ui-avatars.com/api/?name=AM&background=6366f1&color=fff",
    },
    {
      id: "u2",
      name: "CodeNinja",
      avatar: "https://ui-avatars.com/api/?name=CN&background=8b5cf6&color=fff",
    },
    {
      id: "u3",
      name: "MathGenius",
      avatar: "https://ui-avatars.com/api/?name=MG&background=10b981&color=fff",
    },
    {
      id: "u4",
      name: "BrainStorm",
      avatar: "https://ui-avatars.com/api/?name=BS&background=f59e0b&color=fff",
    },
  ];

  const defaultMessages = [
    "Welcome to the Arena! 👋",
    "Be respectful to other players.",
    "Challenge your friends and climb the leaderboard!",
    "Good luck and have fun! 🚀",
  ];

  return Array.from({ length: count }, (_, i) => {
    const u = users[i % users.length];

    return {
      id: `mock-${i}`,
      senderId: u.id,
      senderName: u.name,
      senderAvatar: u.avatar,
      message: defaultMessages[i % defaultMessages.length],
      timestamp: new Date(
        Date.now() - (count - i) * 90000
      ).toISOString(),
      type: "arena",
    };
  });
}

interface ArenaChatProps {
  user: any
}

export function ArenaChat({ user }: ArenaChatProps) {
  const [activeRoom, setActiveRoom] = useState('arena-lobby')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [online, setOnline] = useState<string[]>([])
  const [isSidebarFolded, setIsSidebarFolded] = useState(true)
  const [unreadRooms, setUnreadRooms] = useState<Record<string, boolean>>({})
  const [friends, setFriends] = useState<any[]>([])
  const [latestNotification, setLatestNotification] = useState<{
    id: string
    roomId: string
    senderName: string
    senderAvatar: string
    message: string
    timestamp: string
  } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastTimestampRef = useRef<string>('')

  // Fetch connected friends for direct 1-on-1 unicast messaging
  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/arena/friends?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.friends)) setFriends(data.friends)
      })
      .catch(() => {})
  }, [user?.id])

  // Active friend for DM room
  const activeFriend = activeRoom.startsWith('dm-')
    ? friends.find(f => activeRoom.includes(String(f._id)))
    : null

  const currentRoom =
    ROOMS.find((room) => room.id === activeRoom) ?? {
      id: activeRoom,
      label: activeFriend ? `${activeFriend.name}` : (activeRoom.startsWith('dm-') ? 'Direct Message' : 'Chat Hub'),
      icon: activeRoom.startsWith('dm-') ? Lock : Hash,
      color: activeRoom.startsWith('dm-') ? '#10b981' : '#6366f1',
    };

  const getAvatar = (avatar?: string, name?: string) => {
    if (avatar?.trim()) return avatar;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User"
    )}&background=6366f1&color=ffffff`;
  };

  const handleSelectRoom = (roomId: string) => {
    if (roomId === activeRoom) return;
    setActiveRoom(roomId);
    setIsSidebarFolded(true);
    setUnreadRooms(prev => ({ ...prev, [roomId]: false }));
    lastTimestampRef.current = '';
  };

  // ── Load history & Real-Time Sync Loop ──────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    lastTimestampRef.current = '';

    const isUnicast = activeRoom.startsWith('dm-') && activeFriend?._id;

    const loadHistory = async () => {
      try {
        const url = isUnicast
          ? `/api/arena/unicast-chat?userId=${encodeURIComponent(user.id)}&friendId=${encodeURIComponent(activeFriend._id)}`
          : `/api/chat?roomId=${activeRoom}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!isMounted) return;

        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
          if (data.messages.length > 0) {
            lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
          }
        } else {
          setMessages([]);
        }
      } catch {
        if (isMounted) setMessages([]);
      }
    };

    loadHistory();
    setOnline(['AlgoMaster', 'CodeNinja', 'MathGenius']);

    // Real-time polling
    const pollInterval = setInterval(async () => {
      try {
        if (isUnicast) {
          const res = await fetch(
            `/api/arena/unicast-chat?userId=${encodeURIComponent(user.id)}&friendId=${encodeURIComponent(activeFriend._id)}`
          );
          if (!isMounted || !res.ok) return;
          const data = await res.json();
          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        } else {
          if (!lastTimestampRef.current) return;
          const res = await fetch(
            `/api/chat?roomId=${activeRoom}&since=${encodeURIComponent(lastTimestampRef.current)}`
          );
          if (!isMounted || !res.ok) return;
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newOnes = data.messages.filter((m: Message) => !existingIds.has(m.id));
              if (newOnes.length === 0) return prev;
              return [...prev, ...newOnes];
            });
            lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
          }
        }
      } catch {}
    }, isUnicast ? 2500 : 1200);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeRoom, activeFriend, user?.id]);

  // ── Socket.io Listener (when available on custom servers/dev) ───────────────
  useEffect(() => {
    if (!user?.id || !socket) return;
    
    // Join real-time room
    socket.emit('join-chat-room', { roomId: activeRoom, userId: user.id, name: user.name });

    const handleNewMessage = (msg: Message) => {
      if (msg.roomId === activeRoom && msg.senderId !== user.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.timestamp) lastTimestampRef.current = msg.timestamp;
      }
    };

    const handleChatNotification = (notif: any) => {
      if (!notif || notif.senderId === user.id) return;
      if (notif.roomId !== activeRoom) {
        setUnreadRooms(prev => ({ ...prev, [notif.roomId]: true }));
      }
      setLatestNotification({
        id: notif.id || String(Date.now()),
        roomId: notif.roomId,
        senderName: notif.senderName || "User",
        senderAvatar: notif.senderAvatar || "",
        message: notif.message || "",
        timestamp: notif.timestamp || new Date().toISOString(),
      });
      setTimeout(() => {
        setLatestNotification(curr => (curr?.id === notif.id ? null : curr));
      }, 6000);
    };

    const handleNightlyRestore = () => {
      fetch(`/api/chat?roomId=${activeRoom}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
            if (data.messages.length > 0) {
              lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
            }
          }
        })
        .catch(() => {});
    };

    socket.on('new-message', handleNewMessage);
    socket.on('chat-notification', handleChatNotification);
    socket.on('chat-nightly-restored', handleNightlyRestore);

    return () => {
      socket.emit('leave-chat-room', { roomId: activeRoom, userId: user.id });
      socket.off('new-message', handleNewMessage);
      socket.off('chat-notification', handleChatNotification);
      socket.off('chat-nightly-restored', handleNightlyRestore);
    };
  }, [activeRoom, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send Message with Optimistic Update & Multi-Service Multicast ───────────
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user || sending) return;
    setSending(true);

    const tempId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const optimisticMsg: Message = {
      id: tempId,
      roomId: activeRoom,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: getAvatar(user.avatar, user.name),
      message: trimmed,
      timestamp: new Date().toISOString(),
      type: activeRoom.startsWith('dm-') ? 'dm' : 'arena',
    };

    // Instant local rendering (0ms lag)
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');

    // Multicast to Socket.IO if connected
    socket?.emit('send-message', {
      roomId: activeRoom,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      message: trimmed,
      type: 'arena',
    });

    // Multicast to Database API & Serverless Sync
    try {
      if (activeFriend) {
        // Dedicated 1-on-1 Personal Unicast Endpoint
        const res = await fetch('/api/arena/unicast-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            recipientId: activeFriend._id,
            senderName: user.name,
            senderAvatar: user.avatar,
            recipientName: activeFriend.name,
            message: trimmed,
          }),
        });
        const data = await res.json();
        if (data.success && data.message) {
          setMessages(prev =>
            prev.map(m => (m.id === tempId ? data.message : m))
          );
        }
      } else {
        // Public Community Arena Chat
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: activeRoom,
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar,
            message: trimmed,
            type: 'arena',
          }),
        });

        const data = await res.json();
        if (data.success && data.message) {
          setMessages(prev =>
            prev.map(m => (m.id === tempId ? data.message : m))
          );
          lastTimestampRef.current = data.message.timestamp;
        }
      }
    } catch (err) {
      console.warn('[Chat] Message persistence failed:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  return (
    <div className="flex flex-col gap-3 h-[calc(100dvh-12rem)] min-h-[520px] sm:h-[650px]">
      {/* Real-time Notification Banner for All Users */}
      {latestNotification && (
        <div
          onClick={() => handleSelectRoom(latestNotification.roomId)}
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-950/95 via-purple-950/90 to-background border border-indigo-500/40 shadow-xl cursor-pointer hover:border-indigo-400 transition-all animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <Image
                src={getAvatar(latestNotification.senderAvatar, latestNotification.senderName)}
                alt={latestNotification.senderName}
                width={26}
                height={26}
                unoptimized
                className="h-6 w-6 rounded-md object-cover border border-indigo-400/40"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">
                <span className="text-indigo-300">@{latestNotification.senderName}</span> in{" "}
                <span className="text-indigo-200">#{latestNotification.roomId}</span>
              </p>
              <p className="text-[11px] text-white/70 truncate">{latestNotification.message}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={(e) => {
              e.stopPropagation();
              setLatestNotification(null);
            }}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0 relative">
        {/* Sidebar: Rooms (Foldable on Mobile) */}
        <div
          className={`arena-card p-3 flex flex-col gap-2 transition-all duration-300 ${
            isSidebarFolded
              ? "hidden lg:flex"
              : "fixed inset-x-4 top-24 z-50 max-h-[80vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-indigo-500/30 shadow-2xl lg:relative lg:inset-auto lg:top-auto lg:z-auto lg:max-h-none lg:bg-transparent lg:border-white/10"
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-white/60 text-xs font-black uppercase tracking-widest">Channels</span>
            {/* Mobile close/fold button */}
            <button
              type="button"
              onClick={() => setIsSidebarFolded(true)}
              className="lg:hidden p-1 rounded-md text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {ROOMS.map(room => {
            const Icon = room.icon;
            const hasUnread = unreadRooms[room.id];
            return (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeRoom === room.id
                    ? 'bg-indigo-600/30 border border-indigo-500/40 text-white shadow-md'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: activeRoom === room.id ? room.color : undefined }} />
                  <span className="text-sm font-bold truncate">{room.label}</span>
                </div>
                {hasUnread && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30 animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Direct Messages (Friends) */}
          <div className="text-white/60 text-xs font-black uppercase tracking-widest px-2 py-1 mt-2 border-t border-white/10 pt-3 flex items-center justify-between">
            <span>Direct Messages</span>
            <span className="text-[10px] text-emerald-400 font-bold">{friends.length} Friends</span>
          </div>

          {friends.length === 0 ? (
            <div className="px-3 py-1.5 text-[11px] text-white/30 italic">No friends connected yet</div>
          ) : (
            friends.map(friend => {
              const dmRoomId = `dm-${[user.id, friend._id].sort().join('-')}`
              const isSelected = activeRoom === dmRoomId
              return (
                <button
                  key={friend._id}
                  onClick={() => handleSelectRoom(dmRoomId)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-600/30 border border-emerald-500/40 text-white shadow-md'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.photoUrl || getAvatar(undefined, friend.name)}
                        alt={friend.name}
                        className="w-6 h-6 rounded-lg object-cover"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${friend.isOnline || true ? 'bg-emerald-500' : 'bg-white/20'}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold truncate block">{friend.name}</span>
                      <span className="text-[9px] text-white/40 block leading-tight">
                        {getCountryFlag(friend.countryCode)} {friend.city ? `${friend.city}, ` : ''}{friend.country || 'Global'}
                      </span>
                    </div>
                  </div>
                  <Lock className="w-3 h-3 text-emerald-400/80 flex-shrink-0" />
                </button>
              )
            })
          )}

          <div className="text-white/60 text-xs font-black uppercase tracking-widest px-2 py-1 mt-2 border-t border-white/10 pt-3 flex items-center justify-between">
            <span>Online Now</span>
            <span className="text-[10px] text-emerald-400 font-bold">Live</span>
          </div>
          {online.map(name => (
            <div key={name} className="flex items-center gap-2 px-2 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-xs truncate">{name}</span>
            </div>
          ))}

          {/* Retention notice on sidebar */}
          <div className="mt-auto pt-3 border-t border-white/10 px-2 text-[10px] text-white/40 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>24h Auto-Expiry Active</span>
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="lg:col-span-3 arena-card flex flex-col overflow-hidden h-full">
          {/* Room Header */}
          <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-white/[0.02]">
            {/* Mobile Fold Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarFolded(!isSidebarFolded)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-600/30 transition-colors"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Channels</span>
              {Object.values(unreadRooms).some(Boolean) && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {activeRoom.startsWith('dm-') ? (
              <div className="flex items-center gap-2.5 ml-1 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={activeFriend?.photoUrl || getAvatar(undefined, activeFriend?.name)}
                    alt={activeFriend?.name || "Friend"}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-black" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-black text-sm tracking-wide truncate">
                      {activeFriend?.name || 'Friend Unicast Chat'}
                    </span>
                    <span className="text-[10px] text-indigo-300 font-semibold hidden sm:inline-flex items-center gap-1">
                      {getCountryFlag(activeFriend?.countryCode)} {activeFriend?.country || 'Global'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-300 ml-auto">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Unicast • 24h Auto-Expiry</span>
                </div>
              </div>
            ) : (
              <>
                <Hash className="w-4 h-4 text-indigo-400 ml-1" />
                <span className="text-white font-black text-sm tracking-wide">
                  {currentRoom.label}
                </span>

                <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 ml-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>24h Auto-Delete • Ephemeral</span>
                </div>

                <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span>{online.length + 18} online</span>
                </div>
              </>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3.5 overscroll-contain">
            {activeRoom.startsWith('dm-') && (
              <div className="p-3 mb-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>1-on-1 Unicast Chat:</strong> End-to-end messages strictly between you and {activeFriend?.name || 'your friend'}.
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>Deletes in 1 Day</span>
                </div>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center p-6">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-white/20" />
                  <p className="text-sm font-bold text-white/60">No messages yet in #{currentRoom.label}</p>
                  <p className="text-xs text-white/30 mt-1">Start the conversation with your fellow arena students 👋</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.senderId === user?.id;
                const messageKey = msg.id?.trim() || `${msg.senderId}-${msg.timestamp}-${index}`;

                return (
                  <div
                    key={messageKey}
                    className={`flex gap-2.5 sm:gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    {!isOwn && (
                      <Image
                        src={getAvatar(msg.senderAvatar, msg.senderName)}
                        alt={msg.senderName}
                        width={32}
                        height={32}
                        unoptimized
                        className="h-8 w-8 rounded-xl object-cover flex-shrink-0 border border-white/10"
                      />
                    )}

                    <div className={`flex max-w-[85%] sm:max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      {!isOwn && (
                        <span className="mb-1 px-1 text-[11px] font-bold text-white/60">
                          {msg.senderName}
                        </span>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed shadow-md ${
                          isOwn
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-slate-800/90 border border-white/10 text-white/90 rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                      </div>

                      <span className="mt-1 px-1 text-[10px] text-white/30 font-medium">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <div className="flex gap-2 border-t border-white/10 p-2.5 sm:p-3 bg-slate-950/80 flex-shrink-0 sticky bottom-0 z-10 pb-safe">
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={500}
              aria-label="Chat message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={user ? (activeRoom.startsWith('dm-') ? `Direct message @${activeFriend?.name || 'Friend'} (auto-deletes in 24h)...` : `Message #${currentRoom.label}...`) : "Sign in to chat"}
              disabled={!user || sending}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              aria-label="Send Message"
              onClick={sendMessage}
              disabled={!user || !input.trim() || sending}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-indigo-600 transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-indigo-600/30 flex-shrink-0"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
