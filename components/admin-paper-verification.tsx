"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  FileText,
  CheckCircle2,
  XSquare,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  CheckSquare,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Trash2,
  X
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNav } from "@/hooks/use-nav"

interface PaperItem {
  _id: string
  paperId: string
  title: string
  description?: string
  examType: string
  stream: string
  section: string
  subject: string
  syllabus?: string
  year: number
  fileName?: string
  fileType?: string
  fileSize?: number
  uploaderName?: string
  uploaderEmail?: string
  isApproved: boolean
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt?: string
}

interface AdminPaperVerificationProps {
  onCountChange?: (count: number) => void
}

export function AdminPaperVerification({ onCountChange }: AdminPaperVerificationProps) {
  const { setStep } = useNav()
  const [papers, setPapers] = useState<PaperItem[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "all">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [inspectPaper, setInspectPaper] = useState<PaperItem | null>(null)

  const [stats, setStats] = useState({
    total: 0,
    pendingCount: 0,
    approvedCount: 0,
  })

  const fetchPapers = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/admin/papers-moderation?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok && data.success) {
        setPapers(data.papers || [])
        if (data.stats) {
          setStats(data.stats)
          if (onCountChange) {
            onCountChange(data.stats.pendingCount)
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch papers for moderation:", err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, onCountChange])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  const handleApprove = async (paperId: string) => {
    setActionLoadingId(paperId)
    try {
      const res = await fetch("/api/admin/papers-moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          action: "approve",
        }),
      })
      if (res.ok) {
        // Optimistically update
        setPapers(prev =>
          prev.map(p => (p._id === paperId || p.paperId === paperId ? { ...p, isApproved: true } : p))
        )
        fetchPapers()
      }
    } catch (err) {
      console.error("Failed to approve paper:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (paperId: string) => {
    setActionLoadingId(paperId)
    try {
      const res = await fetch("/api/admin/papers-moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          action: "reject",
          rejectionReason: rejectionReason.trim() || "Paper does not meet verification guidelines",
        }),
      })
      if (res.ok) {
        setPapers(prev =>
          prev.map(p =>
            p._id === paperId || p.paperId === paperId
              ? { ...p, isApproved: false, rejectionReason: rejectionReason.trim() }
              : p
          )
        )
        setRejectionModalId(null)
        setRejectionReason("")
        fetchPapers()
      }
    } catch (err) {
      console.error("Failed to reject paper:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      for (const id of selectedIds) {
        await fetch("/api/admin/papers-moderation", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperId: id, action: "approve" }),
        })
      }
      setSelectedIds([])
      fetchPapers()
    } catch (err) {
      console.error("Bulk approve error:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === papers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(papers.map(p => p._id))
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Standard Size"
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Verification Card */}
        <Card className="border-2 border-amber-500/30 bg-amber-500/5 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-xs font-black uppercase tracking-wider">Pending Verification</span>
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {stats.pendingCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Student uploads waiting for admin inspection & approval
          </p>
        </Card>

        {/* Approved & Live Card */}
        <Card className="border-2 border-emerald-500/30 bg-emerald-500/5 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-xs font-black uppercase tracking-wider">Approved &amp; Live</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {stats.approvedCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Verified papers published in public Paper Repository
          </p>
        </Card>

        {/* Total Paper Submissions */}
        <Card className="border-2 border-primary/20 bg-muted/10 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-primary mb-1">
            <span className="text-xs font-black uppercase tracking-wider">Total Submissions</span>
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Archive papers catalogued across all exams & streams
          </p>
        </Card>
      </div>

      {/* 2. Filter Toolbar & Search Bar */}
      <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Past Paper Verification &amp; Moderation
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Review syllabus, metadata, and verify student uploads before publishing to the Community Archive.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPapers}
              disabled={loading}
              className="gap-2 font-bold text-xs h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("repository")}
              className="gap-2 font-bold text-xs h-9 border-primary/30 text-primary hover:bg-primary/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Repository
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Status Filter Buttons & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-xl border border-border/40 w-fit">
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                ⏳ Pending ({stats.pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                ✅ Approved ({stats.approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                📁 All ({stats.total})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, subject, student..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Bulk Action Strip */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl animate-in fade-in">
              <span className="text-xs font-black text-amber-500">
                {selectedIds.length} paper{selectedIds.length > 1 ? "s" : ""} selected for moderation
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black h-8 gap-1.5 shadow-sm"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Approve Selected ({selectedIds.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-bold h-8"
                >
                  Deselect
                </Button>
              </div>
            </div>
          )}

          {/* 3. Paper Verification List */}
          {loading && (
            <div className="py-16 text-center text-muted-foreground font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              Loading paper submissions for verification...
            </div>
          )}

          {!loading && papers.length === 0 && (
            <div className="py-16 text-center text-muted-foreground space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <h3 className="font-black text-lg text-foreground">
                No papers found matching filter
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                {statusFilter === "pending"
                  ? "All uploaded papers have been verified and approved by the admin team!"
                  : "No submissions recorded for this section."}
              </p>
            </div>
          )}

          {!loading && papers.length > 0 && (
            <div className="space-y-4">
              {/* Select All Row */}
              <div className="flex items-center justify-between p-2.5 bg-muted/15 rounded-lg border border-border/30 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === papers.length && papers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span>Select All ({papers.length} items)</span>
                </label>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Showing {papers.length} submissions
                </span>
              </div>

              {/* Cards Grid */}
              {papers.map(p => {
                const isSelected = selectedIds.includes(p._id)
                const isPending = !p.isApproved

                return (
                  <Card
                    key={p._id}
                    className={`border-2 p-4 transition-all rounded-xl space-y-4 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isPending
                        ? "border-amber-500/30 bg-muted/10 hover:border-amber-500/60"
                        : "border-border/40 bg-card hover:border-primary/30"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p._id)}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/20 uppercase"
                            >
                              {p.section || p.examType || "General"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] text-muted-foreground border-border/50"
                            >
                              Year {p.year || "2024"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            >
                              {p.subject}
                            </Badge>

                            {/* Status Badge */}
                            {p.isApproved ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black gap-1">
                                <CheckCircle2 className="w-3 h-3" /> VERIFIED &amp; APPROVED
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black gap-1 animate-pulse">
                                <Clock className="w-3 h-3" /> PENDING VERIFICATION
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-black text-base text-foreground mt-1.5 leading-snug">
                            {p.title}
                          </h3>
                        </div>
                      </div>

                      {/* File Details Tag */}
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[10px] font-mono border-border/40">
                          {p.fileName || "paper.pdf"}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatFileSize(p.fileSize)}
                        </p>
                      </div>
                    </div>

                    {/* Syllabus Snippet & Description */}
                    {p.syllabus && (
                      <div className="p-3 bg-muted/20 border border-border/30 rounded-lg text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          <span>Extracted Syllabus / Units:</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed line-clamp-2">
                          {p.syllabus}
                        </p>
                      </div>
                    )}

                    {p.description && !p.syllabus && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/10 p-2.5 rounded-lg">
                        &quot;{p.description}&quot;
                      </p>
                    )}

                    {/* Rejection Reason Notice if rejected */}
                    {p.rejectionReason && !p.isApproved && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Rejection feedback: {p.rejectionReason}</span>
                      </div>
                    )}

                    {/* Footer Row: Uploader Metadata + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/30">
                      {/* Uploader Meta */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>Uploaded by: <strong className="text-foreground">{p.uploaderName || "Student"}</strong></span>
                        {p.createdAt && (
                          <span className="font-mono text-[11px]">
                            • {new Date(p.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Admin Decision Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Inspect modal button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectPaper(p)}
                          className="h-8 text-xs font-bold gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          Inspect Paper Data
                        </Button>

                        {/* Approve Button */}
                        {!p.isApproved ? (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(p._id)}
                            disabled={actionLoadingId === p._id}
                            className="h-8 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve &amp; Load to Repository
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="h-8 text-xs font-bold text-emerald-500 bg-emerald-500/10 gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Live in Repository
                          </Button>
                        )}

                        {/* Reject / Dismiss Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectionModalId(p._id)
                            setRejectionReason("")
                          }}
                          disabled={actionLoadingId === p._id}
                          className="h-8 text-xs font-bold text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5"
                        >
                          <XSquare className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Inline Rejection Box */}
                    {rejectionModalId === p._id && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 animate-in fade-in">
                        <label className="text-xs font-bold text-rose-300">
                          Specify reason for rejecting this paper:
                        </label>
                        <Input
                          placeholder="e.g. Incomplete questions, wrong syllabus year, blurry scan..."
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          className="text-xs h-9 bg-background"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRejectionModalId(null)}
                            className="text-xs h-7"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(p._id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-7"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Full Paper Inspection Modal */}
      {inspectPaper && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <Card className="max-w-2xl w-full border-2 shadow-2xl bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-black">
                  Paper Data &amp; Verification Inspection
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectPaper(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Title</span>
                <h2 className="text-xl font-black text-foreground">{inspectPaper.title}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-[10px] text-muted-foreground block font-bold">EXAM SECTION</span>
                  <span className="font-bold text-foreground">{inspectPaper.section || inspectPaper.examType}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-[10px] text-muted-foreground block font-bold">SUBJECT</span>
                  <span className="font-bold text-foreground">{inspectPaper.subject}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-[10px] text-muted-foreground block font-bold">ACADEMIC YEAR</span>
                  <span className="font-bold text-foreground">{inspectPaper.year}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-[10px] text-muted-foreground block font-bold">STATUS</span>
                  <span className={`font-black ${inspectPaper.isApproved ? "text-emerald-500" : "text-amber-500"}`}>
                    {inspectPaper.isApproved ? "APPROVED" : "PENDING"}
                  </span>
                </div>
              </div>

              {inspectPaper.syllabus && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Extracted Syllabus Units:
                  </span>
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-mono">
                    {inspectPaper.syllabus}
                  </div>
                </div>
              )}

              {inspectPaper.description && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground">Description &amp; Overview:</span>
                  <div className="p-3 bg-muted/15 border border-border/40 rounded-xl text-xs text-muted-foreground leading-relaxed">
                    {inspectPaper.description}
                  </div>
                </div>
              )}

              <div className="bg-muted/20 p-3 rounded-xl border border-border/40 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded File:</span>
                  <span className="font-mono font-bold text-foreground">{inspectPaper.fileName || "paper.pdf"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploader Student:</span>
                  <span className="font-bold text-foreground">{inspectPaper.uploaderName || "Student"}</span>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setInspectPaper(null)}
                  className="text-xs font-bold"
                >
                  Close Inspection
                </Button>

                {!inspectPaper.isApproved && (
                  <Button
                    onClick={() => {
                      handleApprove(inspectPaper._id)
                      setInspectPaper(null)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Authorize &amp; Publish Paper
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
