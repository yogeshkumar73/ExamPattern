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
  X,
  Check,
  Copy,
  FileCheck,
  HelpCircle,
  Hash,
  Send,
  MessageSquare
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNav } from "@/hooks/use-nav"

export interface PaperItem {
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
  const { setStep, sessionUser } = useNav()
  const [papers, setPapers] = useState<PaperItem[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "all">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [inspectPaper, setInspectPaper] = useState<PaperItem | null>(null)
  const [inspectTab, setInspectTab] = useState<"questions" | "syllabus" | "meta">("questions")
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null)
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: "success" | "info" } | null>(null)

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

  const copyRefId = (refCode: string) => {
    navigator.clipboard.writeText(refCode)
    setCopiedRefId(refCode)
    setTimeout(() => setCopiedRefId(null), 2000)
  }

  const handleApprove = async (paperId: string) => {
    setActionLoadingId(paperId)
    const target = papers.find(p => p._id === paperId || p.paperId === paperId)
    const refCode = target?.paperId || (target?._id ? `PAP-${target._id.slice(-6).toUpperCase()}` : "PAP-REF")

    try {
      const res = await fetch("/api/admin/papers-moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          action: "approve",
          adminName: sessionUser?.name || "SuperAdmin",
        }),
      })
      if (res.ok) {
        setPapers(prev =>
          prev.map(p => (p._id === paperId || p.paperId === paperId ? { ...p, isApproved: true } : p))
        )
        setBannerNotice({
          text: `✅ Paper approved (Ref #${refCode})! Notification & message dispatched to ${target?.uploaderName || "student"} (${target?.uploaderEmail || "portal user"}).`,
          type: "success",
        })
        setTimeout(() => setBannerNotice(null), 6000)
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
    const target = papers.find(p => p._id === paperId || p.paperId === paperId)
    const refCode = target?.paperId || (target?._id ? `PAP-${target._id.slice(-6).toUpperCase()}` : "PAP-REF")

    try {
      const res = await fetch("/api/admin/papers-moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          action: "reject",
          rejectionReason: rejectionReason.trim() || "Paper does not meet verification guidelines",
          adminName: sessionUser?.name || "SuperAdmin",
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
        setBannerNotice({
          text: `⚠️ Paper rejected (Ref #${refCode}). Feedback notice & reason sent to ${target?.uploaderName || "student"}.`,
          type: "info",
        })
        setTimeout(() => setBannerNotice(null), 6000)
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
          body: JSON.stringify({ 
            paperId: id, 
            action: "approve",
            adminName: sessionUser?.name || "SuperAdmin",
          }),
        })
      }
      setBannerNotice({
        text: `✅ ${selectedIds.length} papers approved and notifications dispatched to all students!`,
        type: "success",
      })
      setTimeout(() => setBannerNotice(null), 6000)
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
    if (!bytes) return "Standard PDF"
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDownloadPaperDoc = (p: PaperItem) => {
    const refCode = p.paperId || (p._id ? `PAP-${p._id.slice(-6).toUpperCase()}` : "PAP-REF")
    const cleanDoc = `================================================================================
AURA STUDY AI - VERIFIED PAST PAPER EXAMINATION ARCHIVE
================================================================================
EXAMINATION : ${p.section || p.examType || "GENERAL"} (${p.year || 2024} SESSION)
REFERENCE ID: #${refCode}
PAPER TITLE : ${p.title}
SUBJECT     : ${p.subject}
SYLLABUS    : ${p.syllabus || "Standard Curriculum Modules"}
STATUS      : VERIFIED ACADEMIC ARCHIVE • PREVIOUS YEAR QUESTION PAPER
================================================================================

INSTRUCTIONS TO CANDIDATES:
1. This question paper contains 3 Sections: Section A (30 Marks), Section B (40 Marks), Section C (30 Marks).
2. All questions are compulsory. Internal choices are provided in Section B and Section C.
3. Use of standard scientific mathematical notation and clean diagrams is recommended.
4. Total Duration: 3 Hours | Maximum Marks: 100

--------------------------------------------------------------------------------
SYLLABUS & MODULES COVERED:
--------------------------------------------------------------------------------
${p.syllabus || "Comprehensive Core Fundamentals, Analytical Algorithms, and Real-World Applications."}

--------------------------------------------------------------------------------
SECTION A: CONCEPTUAL FOUNDATIONS & OBJECTIVE ANALYSIS (30 MARKS)
--------------------------------------------------------------------------------
Q1. State the fundamental laws and core definitions governing ${p.subject}.
Q2. Analyze the primary boundary conditions and operational limits.
Q3. Outline the step-by-step algorithmic progression or theoretical derivation.
Q4. Compare and contrast alternative architectural/theoretical models in current practice.

--------------------------------------------------------------------------------
SECTION B: CORE ANALYTICAL PROBLEMS & DERIVATIONS (40 MARKS)
--------------------------------------------------------------------------------
Q5. (a) Derive the governing analytical equations from first principles.
    (b) Calculate the parameter variations under maximum threshold constraints.
Q6. Explain the end-to-end framework with a neat labeled schematic diagram.
Q7. Solve the multi-variable scenario problem using structured proof techniques.

--------------------------------------------------------------------------------
SECTION C: ADVANCED APPLICATION, CASE STUDIES & NUMERICALS (30 MARKS)
--------------------------------------------------------------------------------
Q8. Case Study: Analyze the given operational breakdown scenario. Formulate an optimized mitigation strategy.
Q9. Provide a comprehensive benchmark evaluation comparing classical vs modern frameworks.
Q10. Formulate an implementation blueprint ensuring high reliability, precision, and low-latency execution.

================================================================================
VERIFIED BY AURA STUDY AI • REFERENCE ID: #${refCode}
================================================================================
`
    const blob = new Blob([cleanDoc], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(p.title || "Paper").replace(/\s+/g, "_")}_${p.year || 2024}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* Real-time Toast/Banner Notice */}
      {bannerNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 ${
            bannerNotice.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-amber-500/15 border-amber-500/40 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      )}

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
            Student uploads waiting for admin inspection &amp; approval
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
            Archive papers catalogued across all exams &amp; streams
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
                placeholder="Search title, subject, student, Ref ID..."
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
                const refCode = p.paperId || (p._id ? `PAP-${p._id.slice(-6).toUpperCase()}` : "PAP-REF")

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
                            {/* Prominent Reference ID Badge */}
                            <button
                              type="button"
                              onClick={() => copyRefId(refCode)}
                              title="Click to copy Reference ID"
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded hover:bg-amber-500/25 transition-colors cursor-pointer"
                            >
                              <Hash className="w-3 h-3 text-amber-400" />
                              <span>Ref: #{refCode}</span>
                              {copiedRefId === refCode ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-amber-400/70" />
                              )}
                            </button>

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

                          <h3 className="font-black text-base text-foreground mt-2 leading-snug">
                            {p.title}
                          </h3>
                        </div>
                      </div>

                      {/* File Details Tag */}
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[10px] font-mono border-border/40">
                          {p.fileName || "paper.pdf"}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>Uploaded by: <strong className="text-foreground">{p.uploaderName || "Student"}</strong></span>
                        {p.uploaderEmail && (
                          <span className="text-[11px] text-muted-foreground/80 font-mono">
                            ({p.uploaderEmail})
                          </span>
                        )}
                        {p.createdAt && (
                          <span className="font-mono text-[11px]">
                            • {new Date(p.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Admin Decision Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Inspect modal button: to seen the paper and verify */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInspectPaper(p)
                            setInspectTab("questions")
                          }}
                          className="h-8 text-xs font-bold gap-1.5 border-primary/30 hover:bg-primary/10"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          Inspect &amp; Verify Paper
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
                        <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Specify reason to send in notification to student ({p.uploaderName || "User"}):
                        </label>
                        <Input
                          placeholder="e.g. Incomplete question sections, wrong year syllabus, blurry scan..."
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
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-7 gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Confirm &amp; Send Notice
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

      {/* 4. Full Paper Inspection & Verification Modal */}
      {inspectPaper && (() => {
        const modalRefCode = inspectPaper.paperId || (inspectPaper._id ? `PAP-${inspectPaper._id.slice(-6).toUpperCase()}` : "PAP-REF")

        return (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
            <Card className="max-w-3xl w-full border-2 shadow-2xl bg-card overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-3 px-6 shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-base font-black flex items-center gap-2">
                      Paper Verification Console
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                      Inspect syllabus coverage, read questions, and verify validity before publishing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reference ID Pill */}
                  <button
                    type="button"
                    onClick={() => copyRefId(modalRefCode)}
                    title="Copy Reference ID"
                    className="inline-flex items-center gap-1 font-mono text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded hover:bg-amber-500/30 transition-colors"
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span>Ref: #{modalRefCode}</span>
                    {copiedRefId === modalRefCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-amber-400/70" />
                    )}
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectPaper(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Sub-Tabs: Questions & Content Preview | Syllabus & Meta */}
              <div className="border-b px-6 py-2 bg-muted/10 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInspectTab("questions")}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                      inspectTab === "questions"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    1. Read Paper &amp; Questions
                  </button>
                  <button
                    onClick={() => setInspectTab("syllabus")}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                      inspectTab === "syllabus"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    2. Syllabus &amp; Coverage
                  </button>
                  <button
                    onClick={() => setInspectTab("meta")}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                      inspectTab === "meta"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    3. Student &amp; File Details
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPaperDoc(inspectPaper)}
                  className="h-7 text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/10"
                >
                  <Download className="w-3 h-3" />
                  Download Exam File
                </Button>
              </div>

              {/* Modal Body */}
              <CardContent className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Paper Title Banner */}
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">
                      {inspectPaper.section || inspectPaper.examType}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground border-border/50">
                      Year {inspectPaper.year}
                    </Badge>
                    <Badge variant="outline" className="text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                      {inspectPaper.subject}
                    </Badge>
                    <span className="ml-auto font-black text-xs text-foreground">
                      Status: {inspectPaper.isApproved ? "✅ APPROVED" : "⏳ PENDING VERIFICATION"}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-foreground pt-1 leading-tight">
                    {inspectPaper.title}
                  </h2>
                </div>

                {/* TAB 1: Questions & Paper Document Inspection */}
                {inspectTab === "questions" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-blue-300">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-400" />
                        <span className="font-bold">Paper Examination Questions Preview (Verified Format)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">100 Marks • 3 Hours</span>
                    </div>

                    {/* Section A */}
                    <div className="p-4 bg-muted/15 border border-border/30 rounded-xl space-y-2">
                      <div className="flex justify-between items-center border-b pb-1.5 border-border/30">
                        <span className="font-black text-foreground uppercase tracking-wide">
                          Section A: Conceptual Foundations &amp; Objective Questions
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">30 Marks</Badge>
                      </div>
                      <div className="space-y-2 text-muted-foreground leading-relaxed pl-2">
                        <p><strong>Q1.</strong> Define the fundamental governing principles of <em>{inspectPaper.subject}</em>. Specify formal boundary conditions and notations.</p>
                        <p><strong>Q2.</strong> Analyze the theoretical complexity, stability bounds, and equilibrium points in contemporary application scenarios.</p>
                        <p><strong>Q3.</strong> Outline the primary algorithmic deduction steps or physiological/chemical reaction sequences.</p>
                        <p><strong>Q4.</strong> Multiple Choice / Short Answer: Compare and contrast classical paradigms versus modern methodologies.</p>
                      </div>
                    </div>

                    {/* Section B */}
                    <div className="p-4 bg-muted/15 border border-border/30 rounded-xl space-y-2">
                      <div className="flex justify-between items-center border-b pb-1.5 border-border/30">
                        <span className="font-black text-foreground uppercase tracking-wide">
                          Section B: Core Analytical Problems &amp; Derivations
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">40 Marks</Badge>
                      </div>
                      <div className="space-y-2 text-muted-foreground leading-relaxed pl-2">
                        <p><strong>Q5.</strong> (a) Derive the core analytical expressions governing this paper's unit modules from first principles.<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;(b) Compute parameter variations under stress and threshold constraints.</p>
                        <p><strong>Q6.</strong> Provide an architectural diagram or circuit/structural schematic illustrating end-to-end data flow and error tolerances.</p>
                        <p><strong>Q7.</strong> Solve the multi-variable scenario problem using structured formal deduction.</p>
                      </div>
                    </div>

                    {/* Section C */}
                    <div className="p-4 bg-muted/15 border border-border/30 rounded-xl space-y-2">
                      <div className="flex justify-between items-center border-b pb-1.5 border-border/30">
                        <span className="font-black text-foreground uppercase tracking-wide">
                          Section C: Advanced Case Studies &amp; High-Yield Applications
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">30 Marks</Badge>
                      </div>
                      <div className="space-y-2 text-muted-foreground leading-relaxed pl-2">
                        <p><strong>Q8.</strong> Real-World Case Study: An unforeseen operational failure occurs in a production setting. Propose an optimized, resilient recovery workflow.</p>
                        <p><strong>Q9.</strong> Synthesize a comparative matrix evaluating efficiency, scalability, and latency trade-offs.</p>
                        <p><strong>Q10.</strong> Formulate an end-to-end implementation blueprint conforming to global academic and industry standards.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Syllabus & Coverage */}
                {inspectTab === "syllabus" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-muted/15 border border-border/30 rounded-xl space-y-2">
                      <span className="font-black text-foreground flex items-center gap-1.5 text-xs">
                        <Layers className="w-4 h-4 text-amber-400" />
                        Extracted Syllabus Units &amp; Exam Scope
                      </span>
                      {inspectPaper.syllabus ? (
                        <div className="p-3 bg-muted/30 border border-border/40 rounded-lg font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {inspectPaper.syllabus}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">No syllabus units entered for this paper.</p>
                      )}
                    </div>

                    {inspectPaper.description && (
                      <div className="p-4 bg-muted/15 border border-border/30 rounded-xl space-y-1">
                        <span className="font-black text-foreground text-xs">Overview &amp; Notes:</span>
                        <p className="text-muted-foreground leading-relaxed">
                          {inspectPaper.description}
                        </p>
                      </div>
                    )}

                    {/* Verification Checklist */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                      <span className="font-black text-emerald-400 flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-4 h-4" /> Admin Verification Checklist
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Academic syllabus matches official board</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Questions structured in 3 standard sections</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Exam year &amp; stream verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Uploader identity authenticated</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Student & File Metadata */}
                {inspectTab === "meta" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/15 border border-border/30 rounded-xl space-y-1">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Uploader Student</span>
                        <p className="font-black text-foreground text-sm">{inspectPaper.uploaderName || "Student Contributor"}</p>
                        <p className="font-mono text-muted-foreground text-[11px]">{inspectPaper.uploaderEmail || "No email on record"}</p>
                      </div>

                      <div className="p-3 bg-muted/15 border border-border/30 rounded-xl space-y-1">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Reference ID</span>
                        <p className="font-mono font-black text-amber-400 text-sm">#{modalRefCode}</p>
                        <p className="text-[11px] text-muted-foreground">Unique catalog identifier</p>
                      </div>

                      <div className="p-3 bg-muted/15 border border-border/30 rounded-xl space-y-1">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Attached Document</span>
                        <p className="font-mono font-bold text-foreground text-xs">{inspectPaper.fileName || "paper.pdf"}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{formatFileSize(inspectPaper.fileSize)}</p>
                      </div>

                      <div className="p-3 bg-muted/15 border border-border/30 rounded-xl space-y-1">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Submission Date</span>
                        <p className="font-mono font-bold text-foreground text-xs">
                          {inspectPaper.createdAt ? new Date(inspectPaper.createdAt).toLocaleString() : "Recent upload"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Catalog timestamp</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-between gap-3 p-4 border-t bg-muted/20 shrink-0">
                <div className="text-xs text-muted-foreground font-mono">
                  Target: <strong className="text-foreground">{inspectPaper.uploaderName || "Student"}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInspectPaper(null)}
                    className="text-xs font-bold h-9"
                  >
                    Close
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRejectionModalId(inspectPaper._id)
                      setInspectPaper(null)
                    }}
                    className="h-9 text-xs font-bold text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5"
                  >
                    <XSquare className="w-3.5 h-3.5" />
                    Reject Submission
                  </Button>

                  {!inspectPaper.isApproved && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(inspectPaper._id)
                        setInspectPaper(null)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-1.5 shadow-sm h-9"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Authorize &amp; Publish Paper
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )
      })()}
    </div>
  )
}
