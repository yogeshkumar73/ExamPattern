'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Swords, Shield, Users, Lock, Unlock, Zap, Trophy, Play, CheckCircle2,
  AlertCircle, Clock, FileText, Upload, Sparkles, RefreshCw, Send, ArrowRight,
  Crown, Share2, Copy, Check, Eye, HelpCircle, Flame, Target, Award,
  ChevronRight, ArrowLeft, BarChart3, Binary, BookOpen, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CustomExamArenaProps {
  currentUser: {
    id: string
    name: string
    avatar?: string
    email?: string
    level?: number
    arenaRank?: string
  } | null
  onBackToLobby?: () => void
}

interface Question {
  id: string
  question: string
  type: 'mcq' | 'written'
  options?: string[]
  correctOption?: number
  modelAnswer?: string
  keyPoints?: string[]
  points: number
}

interface Participant {
  userId: string
  name: string
  avatar?: string
  team: 'alpha' | 'beta' | 'none'
  score: number
  rank?: number
  completed: boolean
  isHost: boolean
  answers: {
    questionId: string
    userAnswer: string
    similarityScore: number
    awardedPoints: number
    feedback: string
  }[]
}

interface RoomData {
  _id: string
  roomId: string
  title: string
  hostId: string
  hostName: string
  hostAvatar?: string
  roomCode: string
  password?: string
  isPrivate: boolean
  matchType: '1v1' | 'team' | 'open'
  examFormat: 'mcqs' | 'written' | 'mixed'
  maxPlayers: number
  timeLimitMinutes: number
  documentName?: string
  documentContent?: string
  status: 'waiting' | 'in_progress' | 'completed' | 'expired'
  questions: Question[]
  participants: Participant[]
  teamScores: {
    alpha: number
    beta: number
  }
  startedAt?: string
  expiresAt?: string
}

export function CustomExamArena({ currentUser, onBackToLobby }: CustomExamArenaProps) {
  // Navigation inside Custom Arena
  // 'browse' | 'create' | 'lobby' | 'exam' | 'results'
  const [view, setView] = useState<'browse' | 'create' | 'lobby' | 'exam' | 'results'>('browse')
  
  // Public games state
  const [publicRooms, setPublicRooms] = useState<RoomData[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFormat, setFilterFormat] = useState<'all' | 'mcqs' | 'written' | 'mixed'>('all')

  // Active joined room
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  // Quick Join with Code & Password modal
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinPasswordInput, setJoinPasswordInput] = useState('')
  const [joiningLoading, setJoiningLoading] = useState(false)

  // Creation form state
  const [createTitle, setCreateTitle] = useState('')
  const [createMatchType, setCreateMatchType] = useState<'1v1' | 'team' | 'open'>('team')
  const [createExamFormat, setCreateExamFormat] = useState<'mcqs' | 'written' | 'mixed'>('mcqs')
  const [createIsPrivate, setCreateIsPrivate] = useState(false)
  const [createPassword, setCreatePassword] = useState('')
  const [createMaxPlayers, setCreateMaxPlayers] = useState(4)
  const [createQuestionCount, setCreateQuestionCount] = useState(5)
  const [createTimeLimit, setCreateTimeLimit] = useState(10)
  const [createDocType, setCreateDocType] = useState<'text' | 'pdf'>('text')
  const [createDocName, setCreateDocName] = useState('')
  const [createDocContent, setCreateDocContent] = useState('')
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<string | null>(null)
  const [creatingLoading, setCreatingLoading] = useState(false)

  // Exam execution state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null)
  const [writtenAnswerInput, setWrittenAnswerInput] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [lastSubmissionFeedback, setLastSubmissionFeedback] = useState<any>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(600)
  const [examFinished, setExamFinished] = useState(false)

  // Host Rule Edit Modal
  const [isEditingRules, setIsEditingRules] = useState(false)
  const [editTimeLimit, setEditTimeLimit] = useState(10)
  const [editMaxPlayers, setEditMaxPlayers] = useState(4)

  const isHost = currentRoom?.hostId === currentUser?.id

  // 1. Fetch public rooms
  const fetchPublicRooms = async () => {
    setLoadingRooms(true)
    try {
      const res = await fetch('/api/arena/custom-room?type=public')
      if (res.ok) {
        const data = await res.json()
        setPublicRooms(data.rooms || [])
      }
    } catch (e) {
      console.error('Failed to fetch custom rooms', e)
    } finally {
      setLoadingRooms(false)
    }
  }

  useEffect(() => {
    fetchPublicRooms()
    const iv = setInterval(fetchPublicRooms, 8000)
    return () => clearInterval(iv)
  }, [])

  // 2. Poll room details when in lobby or exam
  useEffect(() => {
    if (!currentRoom || view === 'browse' || view === 'create') return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena/custom-room?roomId=${currentRoom.roomId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.room) {
            setCurrentRoom(data.room)
            if ((data.room.status === 'in_progress' || data.room.status === 'playing') && view === 'lobby') {
              setView('exam')
            } else if (data.room.status === 'completed' && view === 'exam') {
              setView('results')
            }
          }
        }
      } catch (e) {
        console.error('Error polling room state', e)
      }
    }, 2500)

    return () => clearInterval(pollInterval)
  }, [currentRoom?.roomId, view])

  // 3. Countdown timer during exam
  useEffect(() => {
    if (view !== 'exam' || !currentRoom) return

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [view, currentRoom?.roomId])

  // File upload reader with RAG PDF text extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCreateDocName(file.name)
    setIsExtractingPdf(true)
    setExtractionStatus('Extracting document text using RAG engine...')

    // 1. Send to serverless /api/extract-text for high-fidelity PDF extraction
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.text && data.text.trim().length > 20) {
          setCreateDocContent(data.text.trim())
          setExtractionStatus(`✓ Extracted ${data.text.trim().length} chars from ${file.name}`)
          setIsExtractingPdf(false)
          return
        }
      }
    } catch (err) {
      console.warn('Server text extraction fallback to client reader:', err)
    }

    // 2. Client fallback reader
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCreateDocContent(text || '')
      setExtractionStatus(text ? `✓ Loaded ${file.name}` : null)
      setIsExtractingPdf(false)
    }
    reader.readAsText(file)
  }

  // CREATE ROOM HANDLER
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingLoading(true)
    setRoomError(null)

    try {
      const effectiveHostId = currentUser?.id || 'host-student'
      const effectiveHostName = currentUser?.name || 'Host Student'
      const effectiveHostAvatar = currentUser?.avatar || ''

      const payload = {
        title: createTitle || 'Custom Syllabus Clash',
        hostId: effectiveHostId,
        hostName: effectiveHostName,
        hostAvatar: effectiveHostAvatar,
        userId: effectiveHostId,
        userName: effectiveHostName,
        userAvatar: effectiveHostAvatar,
        matchType: createMatchType,
        examFormat: createExamFormat,
        isPrivate: createIsPrivate,
        password: createPassword,
        maxPlayers: Number(createMaxPlayers),
        timeLimitMinutes: Number(createTimeLimit),
        timeLimitSeconds: Number(createTimeLimit) * 60,
        questionCount: Number(createQuestionCount),
        documentType: createDocType,
        documentSource: createDocType === 'pdf' ? 'pdf' : 'text',
        documentName: createDocName || (createDocType === 'pdf' ? 'Uploaded PDF Document' : 'Custom Document'),
        documentContent: createDocContent || createTitle,
      }

      const res = await fetch('/api/arena/custom-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to create room')
      }

      setCurrentRoom(data.room)
      setView('lobby')
    } catch (err: any) {
      setRoomError(err.message || 'Room creation failed')
    } finally {
      setCreatingLoading(false)
    }
  }

  // JOIN ROOM HANDLER (By code or public Join Now)
  const handleJoinRoom = async (roomCode: string, passwordAttempt?: string) => {
    if (!currentUser) return
    setJoiningLoading(true)
    setRoomError(null)

    try {
      const res = await fetch('/api/arena/custom-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomCode,
          password: passwordAttempt,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join room')
      }

      setCurrentRoom(data.room)
      setJoinModalOpen(false)
      if (data.room.status === 'in_progress' || data.room.status === 'playing') {
        setView('exam')
      } else {
        setView('lobby')
      }
    } catch (err: any) {
      setRoomError(err.message || 'Could not join room')
    } finally {
      setJoiningLoading(false)
    }
  }

  // CHANGE TEAM HANDLER
  const handleChangeTeam = async (targetTeam: 'alpha' | 'beta') => {
    if (!currentRoom || !currentUser) return
    const teamName = targetTeam === 'alpha' ? 'Team Alpha' : 'Team Beta'
    try {
      const res = await fetch('/api/arena/custom-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_team',
          roomId: currentRoom.roomId,
          userId: currentUser.id,
          team: teamName,
        }),
      })
      const data = await res.json()
      if (res.ok && data.room) {
        setCurrentRoom(data.room)
      }
    } catch (e) {
      console.error('Failed to change team', e)
    }
  }

  // HOST UPDATE RULES
  const handleHostUpdateRules = async () => {
    if (!currentRoom || !currentUser || !isHost) return
    try {
      const res = await fetch('/api/arena/custom-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_rules',
          roomId: currentRoom.roomId,
          userId: currentUser.id,
          timeLimitMinutes: editTimeLimit,
          maxPlayers: editMaxPlayers,
        }),
      })
      const data = await res.json()
      if (res.ok && data.room) {
        setCurrentRoom(data.room)
        setIsEditingRules(false)
      } else {
        setRoomError(data.error || 'Failed to update rules')
      }
    } catch (e) {
      console.error('Rule update error', e)
    }
  }

  // HOST START GAME
  const handleStartClash = async () => {
    if (!currentRoom || !currentUser || !isHost) return
    try {
      const res = await fetch('/api/arena/custom-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          roomId: currentRoom.roomId,
          userId: currentUser.id,
        }),
      })
      const data = await res.json()
      if (res.ok && data.room) {
        setCurrentRoom(data.room)
        setRemainingSeconds((data.room.timeLimitMinutes || 10) * 60)
        setView('exam')
      }
    } catch (e) {
      console.error('Start match failed', e)
    }
  }

  // SUBMIT WRITTEN OR MCQ ANSWER
  const handleSubmitAnswer = async () => {
    if (!currentRoom || !currentUser) return
    const activeQ = currentRoom.questions[currentQuestionIndex]
    if (!activeQ) return

    setSubmittingAnswer(true)
    try {
      const answerVal = activeQ.type === 'mcq'
        ? String(selectedMcqOption ?? '')
        : writtenAnswerInput

      const res = await fetch('/api/arena/custom-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_answer',
          roomId: currentRoom.roomId,
          userId: currentUser.id,
          questionId: activeQ.id,
          answer: answerVal,
          studentAnswer: answerVal,
        }),
      })

      const data = await res.json()
      if (res.ok && data.room) {
        setCurrentRoom(data.room)
        setLastSubmissionFeedback(data.evaluation)
        
        // Advance to next question automatically if available
        if (currentQuestionIndex < currentRoom.questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedMcqOption(null)
            setWrittenAnswerInput('')
            setLastSubmissionFeedback(null)
          }, 1200)
        }
      }
    } catch (e) {
      console.error('Error submitting answer', e)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  // FINISH EXAM
  const handleFinishExam = async () => {
    if (!currentRoom || !currentUser) return
    try {
      const res = await fetch('/api/arena/custom-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finish',
          roomId: currentRoom.roomId,
          userId: currentUser.id,
        }),
      })
      const data = await res.json()
      if (res.ok && data.room) {
        setCurrentRoom(data.room)
      }
    } catch (e) {
      console.error('Error finishing exam', e)
    } finally {
      setExamFinished(true)
      setView('results')
    }
  }

  // Filtered public rooms
  const filteredRooms = publicRooms.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.documentName && r.documentName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFormat = filterFormat === 'all' || r.examFormat === filterFormat
    return matchesSearch && matchesFormat
  })

  // Get current user's participant profile
  const myParticipant = currentRoom?.participants.find(p => p.userId === currentUser?.id)

  // Sort participants by score for rankings
  const rankedParticipants = [...(currentRoom?.participants || [])].sort((a, b) => b.score - a.score)
  const alphaParticipants = (currentRoom?.participants || []).filter(p => p.team === 'alpha' || p.team === 'Team Alpha').sort((a, b) => b.score - a.score)
  const betaParticipants = (currentRoom?.participants || []).filter(p => p.team === 'beta' || p.team === 'Team Beta').sort((a, b) => b.score - a.score)

  // =========================================================================
  // VIEW 1: BROWSE PUBLIC ROOMS & LIVE GAMES
  // =========================================================================
  if (view === 'browse') {
    return (
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="arena-card p-6 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-black border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/40 text-xs">
                ⚡ Custom Study Arena
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Python ML Answer Verification
              </Badge>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              STUDY CLASH ROOMS
            </h2>
            <p className="text-xs text-white/60 max-w-xl mt-1">
              Create your own syllabus or document clash room, invite classmates 1-to-1 or team-vs-team, or jump into live public games. Powered by NumPy vector similarity and machine learning evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={() => setJoinModalOpen(true)}
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Join with Code
            </Button>
            <Button
              onClick={() => {
                setRoomError(null)
                setView('create')
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> + Create Clash Room
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 border border-white/10 p-3 rounded-xl">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search rooms, syllabus, or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              {(['all', 'mcqs', 'written', 'mixed'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFilterFormat(fmt)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                    filterFormat === fmt ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={fetchPublicRooms}
              className="text-white/60 hover:text-white h-8 px-2"
              title="Refresh Live Games"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRooms ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Live Public Games Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE PUBLIC GAMES ({filteredRooms.length})
            </h3>
            <span className="text-[11px] text-white/40">Synchronized same-paper solving</span>
          </div>

          {loadingRooms && filteredRooms.length === 0 ? (
            <div className="text-center py-16 arena-card">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-white/50">Scanning live games across arena...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-16 arena-card border-dashed border-white/10 p-8">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">No live public rooms open right now</p>
              <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
                Be the first to host an exam clash! Upload a syllabus or document, set the time limit, and battle your classmates.
              </p>
              <Button
                onClick={() => setView('create')}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                + Create Public Clash
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRooms.map((room) => {
                const isFull = room.participants.length >= room.maxPlayers
                const isMatchInProgress = room.status === 'in_progress' || room.status === 'playing'

                return (
                  <div
                    key={room._id || room.roomId}
                    className="arena-card p-5 border-white/10 hover:border-purple-500/50 bg-black/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                            {room.matchType === 'team' ? '🛡️ Team Battle' : room.matchType === '1v1' ? '⚔️ 1v1 Duel' : '🌐 Open Match'}
                          </span>
                          <h4 className="text-white font-bold text-base leading-snug line-clamp-1 group-hover:text-purple-300 transition-colors">
                            {room.title}
                          </h4>
                        </div>
                        <Badge
                          className={`text-[10px] uppercase font-bold ${
                            isMatchInProgress
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {isMatchInProgress ? 'Playing' : 'Lobby'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-white/70 mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Host:</span>
                          <span className="font-bold text-white flex items-center gap-1">
                            {room.hostName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Exam Format:</span>
                          <span className="font-mono text-purple-300 font-bold uppercase text-[11px]">
                            {room.examFormat}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Questions & Time:</span>
                          <span className="text-white/90">
                            {room.questions?.length || 5} Qs • {room.timeLimitMinutes} mins
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Students:</span>
                          <span className={`font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {room.participants.length} / {room.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-white/40">
                        Code: {room.roomCode}
                      </span>
                      <Button
                        onClick={() => handleJoinRoom(room.roomCode)}
                        disabled={isFull || joiningLoading}
                        className={`text-xs font-bold px-3 py-1.5 h-8 ${
                          isFull
                            ? 'bg-white/10 text-white/40'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                        }`}
                      >
                        {isFull ? 'Full' : 'Join Now ⚡'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal: Join with Room Code & Password */}
        {joinModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="arena-card max-w-md w-full p-6 border-purple-500/40 bg-zinc-950 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" /> Enter Private Clash Room
                </h3>
                <button
                  onClick={() => setJoinModalOpen(false)}
                  className="text-white/40 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {roomError && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                  {roomError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-white/70 block mb-1">Room Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CLASH-47A1"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/70 block mb-1">
                    Password <span className="text-white/40">(if private)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter room password..."
                    value={joinPasswordInput}
                    onChange={(e) => setJoinPasswordInput(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={() => setJoinModalOpen(false)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleJoinRoom(joinCodeInput, joinPasswordInput)}
                  disabled={!joinCodeInput || joiningLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  {joiningLoading ? 'Connecting...' : 'Enter Clash ⚡'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: CREATE ROOM (HOST SETS RULES & FEEDS DOCUMENT)
  // =========================================================================
  if (view === 'create') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('browse')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-black text-white">Create Study Clash Room</h2>
              <p className="text-xs text-white/50">Host controls all rules, time limits, and question papers</p>
            </div>
          </div>
          <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 text-xs">
            Creator Authority
          </Badge>
        </div>

        {roomError && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {roomError}
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Room Basics */}
          <div className="arena-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" /> 1. Room Identity & Match Type
            </h3>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Clash Title / Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Physics Final Exam Clash 2026, DBMS Mid-Term Mock"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: '1v1', label: '1v1 Duel Clash', desc: 'Direct 1-on-1 friend battle' },
                { id: 'team', label: 'Team Battle', desc: 'Team Alpha vs Team Beta' },
                { id: 'open', label: 'Multi-Student Free-for-All', desc: 'Ranked individual scores' },
              ].map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setCreateMatchType(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    createMatchType === t.id
                      ? 'border-purple-500 bg-purple-950/40 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{t.label}</div>
                  <div className="text-[10px] text-white/40 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Privacy switch */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  {createIsPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                  {createIsPrivate ? 'Private Room (Code & Password Protected)' : 'Public Room (Visible in Live Games)'}
                </div>
                <p className="text-[11px] text-white/40">
                  {createIsPrivate
                    ? 'Only students with your team code & password can join'
                    : 'Any student can see and join with 1-click Join Now button'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreateIsPrivate(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !createIsPrivate ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/50'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setCreateIsPrivate(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    createIsPrivate ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/50'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>

            {createIsPrivate && (
              <div className="pt-2 animate-in fade-in">
                <label className="text-xs font-bold text-white/70 block mb-1">Set Room Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter a secret password for your squad..."
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Exam Rules & Format */}
          <div className="arena-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> 2. Exam Rules & Format (Creator Governed)
            </h3>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-2">Select Exam Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'mcqs', label: 'MCQs Only', desc: '4 options with instant grading' },
                  { id: 'written', label: 'Written Only', desc: 'Subjective with Python ML score' },
                  { id: 'mixed', label: 'Mixed Paper', desc: 'Both MCQs & written answers' },
                ].map(f => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setCreateExamFormat(f.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      createExamFormat === f.id
                        ? 'border-purple-500 bg-purple-950/40 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{f.label}</div>
                    <div className="text-[10px] text-white/40 mt-1">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Max Students Allowed</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={createMaxPlayers}
                  onChange={(e) => setCreateMaxPlayers(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Number of Questions</label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={createQuestionCount}
                  onChange={(e) => setCreateQuestionCount(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={createTimeLimit}
                  onChange={(e) => setCreateTimeLimit(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Document / Syllabus Feed */}
          <div className="arena-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> 3. Feed Input Document / Syllabus
              </h3>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCreateDocType('text')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    createDocType === 'text' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/50'
                  }`}
                >
                  Text / Syllabus
                </button>
                <button
                  type="button"
                  onClick={() => setCreateDocType('pdf')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    createDocType === 'pdf' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/50'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {createDocType === 'pdf' ? (
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-400/60 transition-all bg-black/40">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-white mb-1">
                  {createDocName ? `Selected: ${createDocName}` : 'Upload PDF or syllabus text file'}
                </p>
                {isExtractingPdf ? (
                  <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold py-1 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>RAG Engine: Extracting PDF document text...</span>
                  </div>
                ) : extractionStatus ? (
                  <div className="text-emerald-400 text-xs font-bold py-1 mb-2 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{extractionStatus}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-white/40 mb-3">RAG AI extracts topics, generates balanced MCQs and grading matrix</p>
                )}
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.json"
                  onChange={handleFileUpload}
                  className="text-xs text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <textarea
                  rows={4}
                  placeholder="Paste your syllabus chapters, exam topics, key formulas, or sample exam questions here... NumPy & Pandas will generate balanced questions."
                  value={createDocContent}
                  onChange={(e) => setCreateDocContent(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs font-mono text-white/90 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setView('browse')}
              className="text-white/60 hover:text-white text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creatingLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2 shadow-lg shadow-purple-600/30"
            >
              {creatingLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> Generating Exam & Creating Room...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2" /> Generate Questions & Open Room
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  // =========================================================================
  // VIEW 3: IN-ROOM LOBBY (HOST RULES, INVITE, TEAM SELECTION)
  // =========================================================================
  if (view === 'lobby' && currentRoom) {
    return (
      <div className="space-y-6">
        {/* Lobby Top Bar */}
        <div className="arena-card p-6 bg-gradient-to-r from-purple-950/50 via-zinc-950 to-black border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/40 text-xs uppercase font-mono">
                {currentRoom.matchType === 'team' ? '🛡️ Team Battle' : currentRoom.matchType === '1v1' ? '⚔️ 1v1 Clash' : '🌐 Multi-Student'}
              </Badge>
              <Badge className="bg-white/10 text-white/80 border-white/20 text-xs font-mono">
                Format: {currentRoom.examFormat.toUpperCase()}
              </Badge>
              {currentRoom.isPrivate ? (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                  🔒 Private
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                  ⚡ Public Live
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-black text-white">{currentRoom.title}</h2>
            <p className="text-xs text-white/50">
              Host: <span className="text-white font-bold">{currentRoom.hostName}</span> • Paper: {currentRoom.questions.length} Questions • Limit: {currentRoom.timeLimitMinutes} Mins
            </p>
          </div>

          {/* Share Code & Host Start Clash */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-black/60 border border-white/20 rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-white/40 mr-2 uppercase">Code:</span>
              <span className="text-xs font-mono font-black text-purple-300 mr-2">
                {currentRoom.roomCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentRoom.roomCode)
                  setCopiedCode(true)
                  setTimeout(() => setCopiedCode(false), 2000)
                }}
                className="text-white/60 hover:text-white"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isHost ? (
              <>
                <Button
                  onClick={() => setIsEditingRules(true)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                >
                  Edit Rules
                </Button>
                <Button
                  onClick={handleStartClash}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 shadow-lg shadow-emerald-600/30"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> START CLASH FOR ALL
                </Button>
              </>
            ) : (
              <div className="text-xs font-bold text-amber-400 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Waiting for Host ({currentRoom.hostName}) to start...
              </div>
            )}
          </div>
        </div>

        {/* Rule Edit Modal (Only for Host) */}
        {isEditingRules && isHost && (
          <div className="arena-card p-5 border-amber-500/40 bg-amber-950/20 space-y-4 animate-in fade-in">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Host Rule Controller
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/70 block mb-1">Adjust Time Limit (Minutes)</label>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={editTimeLimit}
                  onChange={(e) => setEditTimeLimit(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 block mb-1">Max Players Allowed</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={editMaxPlayers}
                  onChange={(e) => setEditMaxPlayers(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditingRules(false)} className="text-xs text-white/60">
                Cancel
              </Button>
              <Button size="sm" onClick={handleHostUpdateRules} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">
                Save Rules
              </Button>
            </div>
          </div>
        )}

        {/* Team Allocation & Players Grid */}
        {currentRoom.matchType === 'team' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Alpha */}
            <div className="arena-card p-5 border-blue-500/40 bg-blue-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                <div>
                  <h3 className="text-white font-black text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" /> TEAM ALPHA (BLUE)
                  </h3>
                  <span className="text-[11px] text-blue-300/60 font-mono">
                    {alphaParticipants.length} Members
                  </span>
                </div>
                {myParticipant?.team !== 'alpha' && (
                  <Button
                    size="sm"
                    onClick={() => handleChangeTeam('alpha')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold h-7"
                  >
                    Join Team Alpha
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {alphaParticipants.map(p => (
                  <div key={p.userId} className="flex items-center justify-between bg-black/40 border border-blue-500/20 rounded-xl p-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-600/40 border border-blue-400/40 flex items-center justify-center font-bold text-white text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-bold flex items-center gap-1.5">
                          {p.name}
                          {p.isHost && <Crown className="w-3 h-3 text-amber-400" />}
                          {p.userId === currentUser?.id && <span className="text-[10px] text-blue-400">(You)</span>}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Ready</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Beta */}
            <div className="arena-card p-5 border-rose-500/40 bg-rose-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <div>
                  <h3 className="text-white font-black text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-400" /> TEAM BETA (RED)
                  </h3>
                  <span className="text-[11px] text-rose-300/60 font-mono">
                    {betaParticipants.length} Members
                  </span>
                </div>
                {myParticipant?.team !== 'beta' && (
                  <Button
                    size="sm"
                    onClick={() => handleChangeTeam('beta')}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold h-7"
                  >
                    Join Team Beta
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {betaParticipants.map(p => (
                  <div key={p.userId} className="flex items-center justify-between bg-black/40 border border-rose-500/20 rounded-xl p-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-600/40 border border-rose-400/40 flex items-center justify-center font-bold text-white text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-bold flex items-center gap-1.5">
                          {p.name}
                          {p.isHost && <Crown className="w-3 h-3 text-amber-400" />}
                          {p.userId === currentUser?.id && <span className="text-[10px] text-rose-400">(You)</span>}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">Ready</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Multi-User / 1v1 List */
          <div className="arena-card p-5 space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> CONNECTED STUDENTS ({currentRoom.participants.length} / {currentRoom.maxPlayers})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentRoom.participants.map(p => (
                <div key={p.userId} className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/30 flex items-center justify-center font-bold text-white">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-bold flex items-center gap-1">
                        {p.name}
                        {p.isHost && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-white/40">
                        {p.userId === currentUser?.id ? 'You' : 'Classmate'}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">Connected</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => setView('browse')}
            className="text-white/60 hover:text-white text-xs"
          >
            ← Leave Lobby
          </Button>
          <div className="text-xs text-white/40 font-mono">
            Same paper will be synchronized for all joined players
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 4: SYNCHRONIZED EXAM GAMEPLAY (MCQS & WRITTEN WITH PYTHON ML)
  // =========================================================================
  if (view === 'exam' && currentRoom) {
    const activeQ = currentRoom.questions[currentQuestionIndex]
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    return (
      <div className="space-y-6">
        {/* Top Synchronized Bar */}
        <div className="arena-card p-4 bg-black/60 border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 text-white font-bold text-xs uppercase px-2.5 py-1">
              Q {currentQuestionIndex + 1} of {currentRoom.questions.length}
            </Badge>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {currentRoom.title}
            </span>
          </div>

          {/* Synchronized Timer & Team Scores */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {currentRoom.matchType === 'team' && (
              <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-xl border border-white/10 text-xs">
                <span className="text-blue-400 font-bold">Alpha: {currentRoom.teamScores?.alpha || 0}</span>
                <span className="text-white/30">|</span>
                <span className="text-rose-400 font-bold">Beta: {currentRoom.teamScores?.beta || 0}</span>
              </div>
            )}

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-xs ${
              remainingSeconds < 60
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-white/5 text-white/90 border-white/10'
            }`}>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <Button
              size="sm"
              onClick={handleFinishExam}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold h-7"
            >
              Finish Paper
            </Button>
          </div>
        </div>

        {/* Question Solving Container */}
        {activeQ ? (
          <div className="arena-card p-6 border-white/10 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-purple-400 uppercase font-bold">
                  {activeQ.type === 'mcq' ? '📝 Multiple Choice Question' : '✍️ Written / Subjective Answer'}
                </span>
                <span className="text-xs text-white/50">{activeQ.points || 10} Points</span>
              </div>
              <h3 className="text-lg font-bold text-white leading-relaxed">
                {activeQ.question}
              </h3>
            </div>

            {/* MCQ INTERFACE */}
            {activeQ.type === 'mcq' && activeQ.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activeQ.options.map((opt, idx) => {
                  const isSelected = selectedMcqOption === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMcqOption(idx)}
                      className={`p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/40 text-white shadow-lg shadow-purple-600/20'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* WRITTEN / SUBJECTIVE INTERFACE (POWERED BY PYTHON ML) */}
            {activeQ.type === 'written' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Write your detailed technical answer below:</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                    NumPy Vector + Pandas Keyword ML Scoring
                  </Badge>
                </div>
                <textarea
                  rows={6}
                  value={writtenAnswerInput}
                  onChange={(e) => setWrittenAnswerInput(e.target.value)}
                  placeholder="Explain concepts clearly, mentioning key principles, formulas, and relevant terms..."
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-4 text-xs font-mono text-white/90 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {/* ML Evaluation Feedback Box */}
            {lastSubmissionFeedback && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Python ML Evaluation Result
                  </span>
                  <Badge className="bg-cyan-500/30 text-cyan-200 border-cyan-400 text-xs font-mono">
                    Score: {lastSubmissionFeedback.awardedPoints} Pts ({Math.round((lastSubmissionFeedback.similarityScore || 0) * 100)}% match)
                  </Badge>
                </div>
                <p className="text-xs text-white/80">
                  {lastSubmissionFeedback.feedback}
                </p>
              </div>
            )}

            {/* Question Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
                  setSelectedMcqOption(null)
                  setWrittenAnswerInput('')
                  setLastSubmissionFeedback(null)
                }}
                className="text-white/60 hover:text-white text-xs"
              >
                ← Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer || (activeQ.type === 'mcq' ? selectedMcqOption === null : !writtenAnswerInput.trim())}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-5 shadow-lg shadow-purple-600/30"
                >
                  {submittingAnswer ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> Verifying with ML...
                    </>
                  ) : (
                    <>
                      Verify & Submit Q{currentQuestionIndex + 1} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 arena-card">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-2">Paper Completed!</h4>
            <p className="text-xs text-white/50 mb-4">Click below to view the finalized scoreboard and team rankings.</p>
            <Button onClick={handleFinishExam} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold">
              View Final Results
            </Button>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // VIEW 5: RESULTS & TEAM RANKINGS (OUTSIDE AND POST-MATCH SUMMARY)
  // =========================================================================
  if (view === 'results' && currentRoom) {
    const isTeamBattle = currentRoom.matchType === 'team'
    const alphaScore = currentRoom.teamScores?.alpha ?? (currentRoom.teamScores as any)?.['Team Alpha'] ?? 0
    const betaScore = currentRoom.teamScores?.beta ?? (currentRoom.teamScores as any)?.['Team Beta'] ?? 0
    const winningTeam = alphaScore > betaScore
      ? 'Team Alpha'
      : betaScore > alphaScore
      ? 'Team Beta'
      : 'Tie'

    return (
      <div className="space-y-6">
        {/* Results Banner */}
        <div className="arena-card p-6 bg-gradient-to-r from-purple-950/60 via-zinc-950 to-black border-purple-500/40 text-center space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-black text-white tracking-tight">CLASH COMPLETED!</h2>
          <p className="text-xs text-white/60 max-w-md mx-auto">
            Paper evaluation complete. Scores recorded via machine learning semantic similarity and grading matrices.
          </p>

          {isTeamBattle && (
            <div className="inline-block bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl mt-2">
              <span className="text-xs uppercase text-white/40 block font-mono">Winning Team</span>
              <span className="text-lg font-black text-amber-400">{winningTeam} 👑</span>
            </div>
          )}
        </div>

        {/* Team Score Comparison & Inside-Team Ranking */}
        {isTeamBattle && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Alpha Breakdown */}
            <div className="arena-card p-5 border-blue-500/40 bg-blue-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" /> TEAM ALPHA TOTAL
                </h3>
                <span className="text-xl font-black text-blue-400 font-mono">
                  {alphaScore} Pts
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-white/40 uppercase block mb-2">
                  Inside-Team Leaderboard (Ranked)
                </span>
                <div className="space-y-2">
                  {alphaParticipants.map((p, idx) => (
                    <div key={p.userId} className="flex items-center justify-between bg-black/40 border border-blue-500/20 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="text-white font-bold">
                          {p.name} {p.userId === currentUser?.id && '(You)'}
                        </span>
                        {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="font-mono font-bold text-blue-300">{p.score} Pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Beta Breakdown */}
            <div className="arena-card p-5 border-rose-500/40 bg-rose-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" /> TEAM BETA TOTAL
                </h3>
                <span className="text-xl font-black text-rose-400 font-mono">
                  {betaScore} Pts
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-white/40 uppercase block mb-2">
                  Inside-Team Leaderboard (Ranked)
                </span>
                <div className="space-y-2">
                  {betaParticipants.map((p, idx) => (
                    <div key={p.userId} className="flex items-center justify-between bg-black/40 border border-rose-500/20 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="text-white font-bold">
                          {p.name} {p.userId === currentUser?.id && '(You)'}
                        </span>
                        {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="font-mono font-bold text-rose-300">{p.score} Pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overall Individual Leaderboard */}
        <div className="arena-card p-5 space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> OVERALL INDIVIDUAL STANDINGS
          </h3>
          <div className="space-y-2">
            {rankedParticipants.map((p, idx) => (
              <div
                key={p.userId}
                className={`flex items-center justify-between rounded-xl p-3 border text-xs ${
                  p.userId === currentUser?.id
                    ? 'border-purple-500 bg-purple-950/30'
                    : 'border-white/10 bg-black/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-white font-bold flex items-center gap-2">
                      {p.name}
                      {p.userId === currentUser?.id && <Badge className="bg-purple-600/30 text-purple-300 text-[10px]">You</Badge>}
                    </div>
                    {isTeamBattle && (
                      <span className={`text-[10px] font-mono ${p.team === 'alpha' ? 'text-blue-400' : 'text-rose-400'}`}>
                        {p.team === 'alpha' ? 'Team Alpha' : 'Team Beta'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-amber-400 font-mono">{p.score}</span>
                  <span className="text-[10px] text-white/40 block">Points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Clash Browser */}
        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={() => {
              setCurrentRoom(null)
              setView('browse')
              fetchPublicRooms()
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
          >
            ← Back to Study Clash Rooms
          </Button>

          {onBackToLobby && (
            <Button
              onClick={onBackToLobby}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
            >
              Return to Battle Arena
            </Button>
          )}
        </div>
      </div>
    )
  }

  return null
}
