"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react"
import { Send, Hash, MessageSquare, Users, Swords, Bot } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { io, Socket } from "socket.io-client"

let socket: Socket;
if (typeof window !== "undefined") {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", { path: "/socket.io" });
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

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.emit('leave-chat-room', { roomId: activeRoom, userId: user.id });
      socket.off('new-message', handleNewMessage);
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
    socket.emit('send-message', {
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
      {/* Sidebar: Rooms */}
      <div className="arena-card p-3 flex flex-col gap-2">
        <div className="text-white/60 text-xs font-black uppercase tracking-widest px-2 py-1">Channels</div>
        {ROOMS.map(room => {
          const Icon = room.icon
          return (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeRoom === room.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: activeRoom === room.id ? room.color : undefined }} />
              <span className="text-sm font-bold truncate">{room.label}</span>
            </button>
          )
        })}

        <div className="text-white/60 text-xs font-black uppercase tracking-widest px-2 py-1 mt-2 border-t border-white/10 pt-3">Online Now</div>
        {online.map(name => (
          <div key={name} className="flex items-center gap-2 px-2 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-xs">{name}</span>
          </div>
        ))}
      </div>

      {/* Main Chat */}
      <div className="lg:col-span-3 arena-card flex flex-col overflow-hidden">
        {/* Room Header */}
        <div className="p-3 border-b border-white/10 flex items-center gap-2">
          <Hash className="w-4 h-4 text-indigo-400" />
          <span className="text-white font-black text-sm">{ROOMS.find(r => r.id === activeRoom)?.label}</span>
          <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {online.length + Math.floor(Math.random() * 15) + 20} online
          </div>
        </div>

       {/* Messages */}
<div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.length === 0 ? (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-white/20" />
        <p className="text-sm text-white/50">
          No messages yet.
        </p>
        <p className="text-xs text-white/30">
          Start the conversation 👋
        </p>
      </div>
    </div>
  ) : (
    messages.map((msg, index) => {
      const isOwn = msg.senderId === user?.id;

      const messageKey =
        msg.id?.trim() ||
        `${msg.senderId}-${msg.timestamp}-${index}`;

      return (
        <div
          key={messageKey}
          className={`flex gap-3 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          {!isOwn && (
            <Image
              src={getAvatar(
                msg.senderAvatar,
                msg.senderName
              )}
              alt={msg.senderName}
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
            />
          )}

          <div
            className={`flex max-w-[75%] flex-col ${
              isOwn ? "items-end" : "items-start"
            }`}
          >
            {!isOwn && (
              <span className="mb-1 px-1 text-[11px] font-semibold text-white/50">
                {msg.senderName}
              </span>
            )}

            <div
              className={`rounded-2xl px-4 py-2 text-sm break-words whitespace-pre-wrap ${
                isOwn
                  ? "chat-bubble-self text-white"
                  : "chat-bubble-other text-white/90"
              }`}
            >
              {msg.message}
            </div>

            <span className="mt-1 px-1 text-[10px] text-white/30">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        </div>
      );
    })
  )}

  <div ref={bottomRef} />
</div>

{/* Input */}
<div className="flex gap-2 border-t border-white/10 p-3">
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
    placeholder={
      user
        ? `Message #${currentRoom.label}...`
        : "Sign in to chat"
    }
    disabled={!user || sending}
    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
  />

  <button
    type="button"
    aria-label="Send Message"
    onClick={sendMessage}
    disabled={!user || !input.trim() || sending}
    className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Send className="h-5 w-5 text-white" />
  </button>
</div>
      </div>
    </div>
  )
}
