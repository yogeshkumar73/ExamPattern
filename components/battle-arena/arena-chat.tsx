"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react"
import { Send, Hash, MessageSquare, Users, Swords, Bot, Menu, X, ShieldCheck, Bell, Clock, ChevronRight } from "lucide-react"
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
  const [latestNotification, setLatestNotification] = useState<{
    id: string
    roomId: string
    senderName: string
    senderAvatar: string
    message: string
    timestamp: string
  } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const currentRoom =
  ROOMS.find((room) => room.id === activeRoom) ?? ROOMS[0];

const getAvatar = (avatar?: string, name?: string) => {
  if (avatar?.trim()) return avatar;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User"
  )}&background=6366f1&color=ffffff`;
};

  useEffect(() => {
    // Load history
    const loadHistory = async () => {
      try {
       const res = await fetch(
  `/api/chat?roomId=${activeRoom}`
);

const data = await res.json();

setMessages(data.messages);
        if (data.messages?.length > 0) {
          setMessages(data.messages)
        } else {
          setMessages(generateMockMessages(activeRoom, 12))
        }
      } catch {
        setMessages(generateMockMessages(activeRoom, 12))
      }
    }
    loadHistory()
    setOnline(['AlgoMaster', 'CodeNinja', 'MathGenius'])
  }, [activeRoom])

  useEffect(() => {
    if (!user?.id || !socket) return;
    
    // Join real-time room
    socket.emit('join-chat-room', { roomId: activeRoom, userId: user.id, name: user.name });

    const handleNewMessage = (msg: Message) => {
      if (msg.roomId === activeRoom && msg.senderId !== user.id) {
        setMessages(prev => [...prev, msg]);
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
          if (Array.isArray(data.messages)) setMessages(data.messages);
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
  }, [activeRoom, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user) return
    setSending(true)
    const msg: Message = {
      id: `local-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
     senderAvatar: getAvatar(user.avatar, user.name),
      message: input.trim(),
      timestamp: new Date().toISOString(),
      type: 'arena',
    }
    setMessages(prev => [...prev, msg])
    setInput('')
    setSending(false)

    // Live update others via WebSocket
    socket?.emit('send-message', {
      roomId: activeRoom,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      message: msg.message,
      type: 'arena'
    });

    // Persist to API
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: activeRoom, senderId: user.id, senderName: user.name, senderAvatar: user.avatar, message: msg.message }),
    }).catch(() => {})
  }

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  return (
    <div className="flex flex-col gap-3 h-[650px]">
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
            <span>12h Auto-Store • 1 AM Reset</span>
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

            <Hash className="w-4 h-4 text-indigo-400 ml-1" />
            <span className="text-white font-black text-sm tracking-wide">
              {currentRoom.label}
            </span>

            {/* Security & 12h Retention Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 ml-2">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>12h Auto-Wipe • 1 AM Nightly</span>
            </div>

            <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-semibold">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>{online.length + 18} online</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
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
          <div className="flex gap-2 border-t border-white/10 p-2.5 sm:p-3 bg-white/[0.01]">
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
              placeholder={user ? `Message #${currentRoom.label}...` : "Sign in to chat"}
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
