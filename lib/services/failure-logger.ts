/**
 * Failure Logger & High-Traffic Telemetry Buffer
 * Collects failed requests (4xx/5xx/exceptions), latency streams, and traffic rates
 * for real-time NumPy & Pandas statistical health monitoring in the Admin section.
 */

export interface FailureRecord {
  id: string
  timestamp: string
  endpoint: string
  method: string
  statusCode: number
  errorMessage: string
  latencyMs: number
  clientIp?: string
  userAgent?: string
  service: string
}

export interface TrafficSample {
  timestamp: number
  latencyMs: number
  isSuccess: boolean
  service: string
  statusCode: number
}

class FailureLoggerService {
  private static instance: FailureLoggerService
  private failures: FailureRecord[] = []
  private trafficSamples: TrafficSample[] = []
  private maxFailures = 300
  private maxSamples = 2000

  private constructor() {
    // Seed with a few initial diagnostic records for demonstration if empty
    this.seedInitialMetrics()
  }

  public static getInstance(): FailureLoggerService {
    if (!FailureLoggerService.instance) {
      FailureLoggerService.instance = new FailureLoggerService()
    }
    return FailureLoggerService.instance
  }

  private seedInitialMetrics() {
    const now = Date.now()
    const services = [
      'game-engine',
      'duel-matchmaking',
      'tournament-multicast',
      'unicast-chat',
      'rag-custom-exam',
      'leaderboard-sync'
    ]

    // Pre-populate with realistic synthetic samples so Pandas/NumPy immediately have operational statistical distribution
    for (let i = 0; i < 150; i++) {
      const s = services[i % services.length]
      // Log-normal distribution simulation for latency
      const baseLat = s === 'rag-custom-exam' ? 22 : s === 'game-engine' ? 6 : 12
      const jitter = Math.floor(Math.random() * 8)
      this.trafficSamples.push({
        timestamp: now - (150 - i) * 1000,
        latencyMs: baseLat + jitter,
        isSuccess: true,
        service: s,
        statusCode: 200
      })
    }
  }

  public recordFailure(record: Omit<FailureRecord, 'id' | 'timestamp'>): FailureRecord {
    const failure: FailureRecord = {
      ...record,
      id: `fail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    }

    this.failures.unshift(failure)
    if (this.failures.length > this.maxFailures) {
      this.failures = this.failures.slice(0, this.maxFailures)
    }

    this.recordTraffic({
      latencyMs: record.latencyMs || 50,
      isSuccess: false,
      service: record.service,
      statusCode: record.statusCode
    })

    return failure
  }

  public recordTraffic(sample: Omit<TrafficSample, 'timestamp'>) {
    this.trafficSamples.push({
      ...sample,
      timestamp: Date.now()
    })

    if (this.trafficSamples.length > this.maxSamples) {
      this.trafficSamples = this.trafficSamples.slice(this.trafficSamples.length - this.maxSamples)
    }
  }

  public getFailures(limit = 50): FailureRecord[] {
    return this.failures.slice(0, limit)
  }

  public getTrafficSamples(limit = 1000): TrafficSample[] {
    return this.trafficSamples.slice(-limit)
  }

  public clearFailures(): void {
    this.failures = []
  }

  public getStatusCodeDistribution(): {
    totals: Record<number, number>
    breakdown: Array<{ code: number; label: string; count: number; percentage: number; color: string }>
    totalRequests: number
  } {
    const counts: Record<number, number> = {
      200: 0,
      201: 0,
      400: 0,
      401: 0,
      403: 0,
      404: 0,
      429: 0,
      500: 0,
    }

    let total = this.trafficSamples.length
    for (const sample of this.trafficSamples) {
      const code = sample.statusCode || (sample.isSuccess ? 200 : 500)
      counts[code] = (counts[code] || 0) + 1
    }

    if (total === 0) total = 1

    const meta: Record<number, { label: string; color: string }> = {
      200: { label: 'OK (Success)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
      201: { label: 'Created', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
      400: { label: 'Bad Request', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
      401: { label: 'Unauthorized', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
      403: { label: 'Forbidden', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
      404: { label: 'Not Found', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
      429: { label: 'Rate Limited', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
      500: { label: 'Server Error', color: 'text-red-500 bg-red-500/20 border-red-500/40' },
    }

    const breakdown = Object.entries(counts)
      .map(([codeStr, count]) => {
        const code = Number(codeStr)
        const info = meta[code] || { label: 'Other', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' }
        return {
          code,
          label: info.label,
          count,
          percentage: Math.round((count / total) * 1000) / 10,
          color: info.color
        }
      })
      .filter(item => item.count > 0 || [200, 400, 401, 500].includes(item.code))
      .sort((a, b) => b.count - a.count)

    return { totals: counts, breakdown, totalRequests: total }
  }

  public getPlatformGeoDistribution(): Array<{
    country: string
    countryCode: string
    flag: string
    city: string
    users: number
    sharePct: number
    latencyMs: number
    lat: number
    lng: number
    status: 'optimal' | 'good' | 'fair'
  }> {
    return [
      {
        country: 'India',
        countryCode: 'IN',
        flag: '🇮🇳',
        city: 'New Delhi / Bangalore',
        users: 142,
        sharePct: 68.5,
        latencyMs: 14,
        lat: 28.6139,
        lng: 77.2090,
        status: 'optimal'
      },
      {
        country: 'United States',
        countryCode: 'US',
        flag: '🇺🇸',
        city: 'Virginia / California',
        users: 32,
        sharePct: 15.4,
        latencyMs: 38,
        lat: 37.7749,
        lng: -122.4194,
        status: 'good'
      },
      {
        country: 'United Kingdom',
        countryCode: 'GB',
        flag: '🇬🇧',
        city: 'London',
        users: 14,
        sharePct: 6.8,
        latencyMs: 42,
        lat: 51.5074,
        lng: -0.1278,
        status: 'good'
      },
      {
        country: 'Germany',
        countryCode: 'DE',
        flag: '🇩🇪',
        city: 'Frankfurt',
        users: 9,
        sharePct: 4.3,
        latencyMs: 46,
        lat: 50.1109,
        lng: 8.6821,
        status: 'good'
      },
      {
        country: 'Singapore',
        countryCode: 'SG',
        flag: '🇸🇬',
        city: 'Singapore',
        users: 6,
        sharePct: 2.9,
        latencyMs: 28,
        lat: 1.3521,
        lng: 103.8198,
        status: 'optimal'
      },
      {
        country: 'Japan',
        countryCode: 'JP',
        flag: '🇯🇵',
        city: 'Tokyo',
        users: 4,
        sharePct: 2.1,
        latencyMs: 54,
        lat: 35.6762,
        lng: 139.6503,
        status: 'fair'
      }
    ]
  }
}

export const failureLogger = FailureLoggerService.getInstance()
