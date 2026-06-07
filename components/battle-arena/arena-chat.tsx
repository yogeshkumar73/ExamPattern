"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Hash, MessageSquare, Users, Swords, Bot } from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  message: string
  timestamp: string
  type: string
  isSystem?: boolean
}

const ROOMS = [
  { id: 'arena-lobby', label: 'Arena Lobby', icon: Hash, color: '#6366f1' },
  { id: 'coding-chat', label: 'Coding Hub', icon: MessageSquare, color: '#3b82f6' },
  { id: 'math-chat',   label: 'Math Hub',   icon: MessageSquare, color: '#10b981' },
  { id: 'gk-chat',     label: 'GK Hub',     icon: MessageSquare, color: '#f59e0b' },
]

// Generate mock messages for demo
function generateMockMessages(roomId: string, count: number): Message[] {
  const users = [
    { id: 'u1', name: 'AlgoMaster', avatar: 'https://ui-avatars.com/api/?name=AM&background=6366f1&color=fff' },
    { id: 'u2', name: 'CodeNinja', avatar: 'https://ui-avatars.com/api/?name=CN&background=8b5cf6&color=fff' },
    { id: 'u3', name: 'MathGenius', avatar: 'https://ui-avatars.com/api/?name=MG&background=10b981&color=fff' },
    { id: 'u4', name: 'BrainStorm', avatar: 'https://ui-avatars.com/api/?name=BS&background=f59e0b&color=fff' },
  ]
  const messages = [
    "Anyone up for a 1v1 coding battle? 🎯",
    "Just hit Diamond rank! 💎",
    "GK questions in expert mode are brutal 😅",
    "Who wants to team up for 2v2?",
    "The prediction puzzles are addictive!",
    "Just unlocked Arena Champion badge 🏆",
    "Math battle intermediate = actually hard lol",
    "Anyone else grinding for Grandmaster?",
    "gg wp to whoever I just battled",
    "Love this arena! Best study app ever 🔥",
    "The XP system is so satisfying",
    "New tournament starting! Join up 👑",
  ]
  return Array.from({ length: count }, (_, i) => {
    const u = users[i % users.length]
    return {
      id: `mock-${i}`,
      senderId: u.id,
      senderName: u.name,
      senderAvatar: u.avatar,
      message: messages[i % messages.length],
      timestamp: new Date(Date.now() - (count - i) * 90000).toISOString(),
      type: 'arena',
    }
  })
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

  useEffect(() => {
    // Load history
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/chat?roomId=${activeRoom}&limit=30`)
        const data = await res.json()
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user) return
    setSending(true)
    const msg: Message = {
      id: `local-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      message: input.trim(),
      timestamp: new Date().toISOString(),
      type: 'arena',
    }
    setMessages(prev => [...prev, msg])
    setInput('')
    setSending(false)

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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const isOwn = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && (
                  <img src={msg.senderAvatar} alt={msg.senderName}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 self-end" />
                )}
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isOwn && (
                    <span className="text-white/50 text-[10px] font-bold px-1">{msg.senderName}</span>
                  )}
                  <div className={`px-3 py-2 text-sm ${isOwn ? 'chat-bubble-self text-white' : 'chat-bubble-other text-white/90'}`}>
                    {msg.message}
                  </div>
                  <span className="text-white/20 text-[10px] px-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={user ? `Message #${ROOMS.find(r => r.id === activeRoom)?.label}...` : 'Log in to chat'}
            disabled={!user || sending}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={!user || !input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
