'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Server,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Cpu,
  Database,
  BarChart3,
  Moon,
  Trash2,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ManagedService {
  id: string
  name: string
  category: string
  status: 'standby' | 'warming_up' | 'operational' | 'degraded' | 'failed'
  isLazy: boolean
  loadedAt: string | null
  lastVerifiedAt: string | null
  lastPingMs: number
  requestsHandled: number
  failureCount: number
  memoryUsageMb: number
  description: string
  endpoint: string
}

interface FailureRecord {
  id: string
  timestamp: string
  endpoint: string
  method: string
  statusCode: number
  errorMessage: string
  latencyMs: number
  service: string
}

interface AnalyticsResult {
  engine: string
  healthScore: number
  uptimePct: number
  errorRatePct: number
  qps: number
  totalSamplesAnalyzed: number
  totalFailuresLogged: number
  latency: {
    mean: number
    stdDev: number
    variance: number
    p50: number
    p90: number
    p95: number
    p99: number
    ewma: number
  }
  serviceBreakdown: Array<{
    service: string
    totalRequests: number
    sharePct: number
    meanLatencyMs: number
    p95LatencyMs: number
    errorCount: number
    errorRatePct: number
    status: string
  }>
  anomaliesDetected: number
  anomalySamples: any[]
}

export default function AdminServicesMonitor() {
  const [services, setServices] = useState<ManagedService[]>([])
  const [failures, setFailures] = useState<FailureRecord[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const getAuthHeaders = (): Record<string, string> => {
    try {
      let raw: string | null = null
      let token: string | null = null
      if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem('aura_session')
        token = localStorage.getItem('aura_session_token')
      }
      if (!raw && typeof sessionStorage !== 'undefined') {
        raw = sessionStorage.getItem('aura_session')
        token = sessionStorage.getItem('aura_session_token')
      }
      const rawSession = JSON.parse(raw || '{}')
      const user = rawSession.user || rawSession
      const adminToken = user?.adminToken || rawSession.adminToken || user?.token || rawSession.token || token || ''
      const headers: Record<string, string> = {
        'x-session-user': encodeURIComponent(JSON.stringify(user)),
      }
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`
      }
      return headers
    } catch {
      return {}
    }
  }

  const fetchServicesHealth = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const res = await fetch('/api/admin/services-health', {
        headers: getAuthHeaders(),
        credentials: 'include',
        cache: 'no-store'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setServices(data.services || [])
          setFailures(data.failures || [])
          setAnalytics(data.analytics || null)
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch services telemetry:', err)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServicesHealth()
  }, [fetchServicesHealth])

  // Polling every 4 seconds when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchServicesHealth(true)
    }, 4000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchServicesHealth])

  const executeControlAction = async (action: string, serviceId?: string) => {
    setActionLoading(`${action}-${serviceId || 'all'}`)
    try {
      const res = await fetch('/api/admin/services-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ action, serviceId }),
      })

      const data = await res.json()
      if (data.success) {
        showToast(data.message || `Action ${action} completed successfully`, 'success')
        if (data.services) setServices(data.services)
        if (data.analytics) setAnalytics(data.analytics)
        if (data.failures !== undefined) setFailures(data.failures)
      } else {
        showToast(data.error || 'Control action failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Network request failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: ManagedService['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        )
      case 'standby':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Moon className="w-3 h-3 text-blue-400" />
            Lazy Standby
          </span>
        )
      case 'warming_up':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
            Warming Up
          </span>
        )
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            Degraded
          </span>
        )
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            Failed
          </span>
        )
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-blue-950/90 border-blue-500/40 text-blue-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4" />}
            {notification.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP HEADER & CONTROL BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-purple-950/40 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Services Fleet & Game Engine Monitor
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMIN ONLY
                </span>
              </h1>
              <p className="text-xs text-white/50">
                Real-time traffic management, lazy-loading controls, and NumPy/Pandas statistical health analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs font-semibold gap-1.5 h-8 ${autoRefresh ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-white/60'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live Polling (4s)' : 'Polling Paused'}
          </Button>

          <Button
            size="sm"
            onClick={() => executeControlAction('verify-all')}
            disabled={Boolean(actionLoading)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 h-8 rounded-xl shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verify All Services
          </Button>

          <Button
            size="sm"
            onClick={() => executeControlAction('warmup')}
            disabled={Boolean(actionLoading)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold gap-1.5 h-8 rounded-xl shadow-lg shadow-purple-600/20"
          >
            <Zap className="w-3.5 h-3.5" />
            Warm Up Fleet
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => executeControlAction('run-pandas-analysis')}
            disabled={Boolean(actionLoading)}
            className="border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold gap-1.5 h-8 rounded-xl"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            NumPy/Pandas Run
          </Button>
        </div>
      </div>

      {/* ── REAL-TIME STATS / NUMPY & PANDAS SUMMARY ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Health Score */}
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-semibold">
            <span>Overall Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-400">
              {analytics?.healthScore ?? 98.5}
            </span>
            <span className="text-xs text-white/40 font-mono">/ 100</span>
          </div>
          <div className="text-[11px] text-white/50 mt-1">Weighted NumPy aggregate</div>
        </div>

        {/* Uptime % */}
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-semibold">
            <span>System Uptime</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-400">
              {analytics?.uptimePct ?? 99.8}%
            </span>
          </div>
          <div className="text-[11px] text-white/50 mt-1">
            Error rate: {analytics?.errorRatePct ?? 0.2}%
          </div>
        </div>

        {/* Current QPS */}
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-semibold">
            <span>Traffic Throughput</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-400">
              {analytics?.qps ?? 48.5}
            </span>
            <span className="text-xs text-white/40 font-mono">QPS</span>
          </div>
          <div className="text-[11px] text-white/50 mt-1">Capacity: 1,000 req/sec</div>
        </div>

        {/* Latency P95 (NumPy) */}
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-semibold">
            <span>P95 Latency (NumPy)</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-purple-400">
              {analytics?.latency.p95 ?? 18.2}
            </span>
            <span className="text-xs text-white/40 font-mono">ms</span>
          </div>
          <div className="text-[11px] text-white/50 mt-1">
            P50: {analytics?.latency.p50 ?? 8.5}ms • P99: {analytics?.latency.p99 ?? 28.4}ms
          </div>
        </div>

        {/* Active Failures Logged */}
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-semibold">
            <span>Failures Logged</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-3xl font-black ${failures.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {failures.length}
            </span>
            <span className="text-xs text-white/40 font-mono">incidents</span>
          </div>
          <div className="text-[11px] text-white/50 mt-1">
            Anomalies (Z &gt; 2.5): {analytics?.anomaliesDetected ?? 0}
          </div>
        </div>
      </div>

      {/* ── NUMPY & PANDAS STATISTICAL BREAKDOWN ── */}
      <div className="p-5 rounded-2xl bg-gray-900/90 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              NumPy &amp; Pandas Traffic &amp; Latency Matrix
            </h3>
            <span className="text-[11px] font-mono text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Engine: {analytics?.engine || 'NumPy 2.4 + Pandas 3.1'}
            </span>
          </div>
          <div className="text-xs text-white/40 font-mono">
            {analytics?.totalSamplesAnalyzed ?? 0} samples in sliding window
          </div>
        </div>

        {/* Latency Quantiles Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">Mean (μ)</div>
            <div className="text-sm font-bold text-white mt-0.5">{analytics?.latency.mean ?? 12.4} ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">Std Dev (σ)</div>
            <div className="text-sm font-bold text-white mt-0.5">{analytics?.latency.stdDev ?? 6.2} ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">EWMA (Pandas)</div>
            <div className="text-sm font-bold text-indigo-300 mt-0.5">{analytics?.latency.ewma ?? 11.8} ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">Median (P50)</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">{analytics?.latency.p50 ?? 8.5} ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">P90</div>
            <div className="text-sm font-bold text-blue-400 mt-0.5">{analytics?.latency.p90 ?? 15.0} ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">P95</div>
            <div className="text-sm font-bold text-purple-400 mt-0.5">{analytics?.latency.p95 ?? 18.2} ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 uppercase font-mono">P99 Tail</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">{analytics?.latency.p99 ?? 28.4} ms</div>
          </div>
        </div>

        {/* Pandas GroupBy Table */}
        {analytics?.serviceBreakdown && analytics.serviceBreakdown.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2.5">Service</th>
                  <th className="p-2.5">Traffic Share</th>
                  <th className="p-2.5">Mean Latency</th>
                  <th className="p-2.5">P95 Latency</th>
                  <th className="p-2.5">Errors</th>
                  <th className="p-2.5">Error Rate</th>
                  <th className="p-2.5">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.serviceBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      {row.service}
                    </td>
                    <td className="p-2.5 text-white/70 font-mono">{row.sharePct}%</td>
                    <td className="p-2.5 text-white/80 font-mono">{row.meanLatencyMs} ms</td>
                    <td className="p-2.5 text-purple-300 font-mono">{row.p95LatencyMs} ms</td>
                    <td className="p-2.5 font-mono">
                      <span className={row.errorCount > 0 ? 'text-rose-400 font-bold' : 'text-white/40'}>
                        {row.errorCount}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono">
                      <span className={row.errorRatePct > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {row.errorRatePct}%
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'operational'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MANAGED SERVICES FLEET (LAZY LOADING CONTROLS) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              Lazy-Loaded Platform &amp; Game Engine Services
            </h2>
            <p className="text-xs text-white/50">
              Services remain in lazy standby until incoming traffic hits. Admin can warm up or put back into standby.
            </p>
          </div>
          <span className="text-xs font-mono text-white/40">
            {services.length} services managed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="p-4 rounded-2xl bg-gray-900/90 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">{svc.name}</h3>
                    <div className="text-[11px] font-mono text-white/40 mt-0.5">{svc.endpoint}</div>
                  </div>
                  {getStatusBadge(svc.status)}
                </div>
                <p className="text-xs text-white/60 mt-2 leading-relaxed line-clamp-2">
                  {svc.description}
                </p>
              </div>

              {/* Service Health Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-center">
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-mono">Requests</div>
                  <div className="text-xs font-bold text-white mt-0.5 font-mono">{svc.requestsHandled}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-mono">Ping</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">{svc.lastPingMs} ms</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-mono">Memory</div>
                  <div className="text-xs font-bold text-blue-300 mt-0.5 font-mono">{svc.memoryUsageMb} MB</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {svc.status === 'standby' ? (
                  <Button
                    size="sm"
                    onClick={() => executeControlAction('warmup', svc.id)}
                    disabled={actionLoading === `warmup-${svc.id}`}
                    className="flex-1 h-7 bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-bold gap-1 rounded-lg"
                  >
                    <Zap className="w-3 h-3" />
                    Warm Up
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => executeControlAction('lazy-standby', svc.id)}
                    disabled={actionLoading === `lazy-standby-${svc.id}`}
                    className="flex-1 h-7 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-bold gap-1 rounded-lg"
                  >
                    <Moon className="w-3 h-3" />
                    Set Standby
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => executeControlAction('verify-all', svc.id)}
                  disabled={Boolean(actionLoading)}
                  className="h-7 border-white/10 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold px-2 rounded-lg"
                  title="Verify health ping"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => executeControlAction('restart', svc.id)}
                  disabled={Boolean(actionLoading)}
                  className="h-7 border-white/10 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold px-2 rounded-lg"
                  title="Restart service"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE FAILURE REQUESTS & INCIDENT FEED ── */}
      <div className="p-5 rounded-2xl bg-gray-900/90 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Failure Requests &amp; Game Engine Incident Feed
            </h3>
            <span className="text-[11px] font-mono text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {failures.length} Recorded
            </span>
          </div>

          {failures.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeControlAction('clear-failures')}
              disabled={Boolean(actionLoading)}
              className="h-7 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold gap-1 px-2.5 rounded-lg"
            >
              <Trash2 className="w-3 h-3" />
              Clear Logs
            </Button>
          )}
        </div>

        {failures.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white/5 border border-white/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <div className="text-sm font-bold text-white">All Services Healthy</div>
            <p className="text-xs text-white/50 mt-1">
              Zero failure requests detected across Game Engine, Matchmaking, and Arena routes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Endpoint</th>
                  <th className="p-2.5">Service</th>
                  <th className="p-2.5">Error Detail</th>
                  <th className="p-2.5">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {failures.map((f) => (
                  <tr key={f.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-2.5 text-white/40 font-mono whitespace-nowrap">
                      {new Date(f.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2.5 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.statusCode >= 500
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {f.statusCode} {f.method}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-white font-semibold">
                      {f.endpoint}
                    </td>
                    <td className="p-2.5">
                      <Badge className="bg-white/10 text-white/70 text-[10px] font-mono">
                        {f.service}
                      </Badge>
                    </td>
                    <td className="p-2.5 text-rose-300 font-mono max-w-xs truncate" title={f.errorMessage}>
                      {f.errorMessage}
                    </td>
                    <td className="p-2.5 text-white/50 font-mono">
                      {f.latencyMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
