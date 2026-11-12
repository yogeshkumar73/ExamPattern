import { NextRequest, NextResponse } from 'next/server'
import { lazyServiceManager } from '@/lib/services/lazy-service-manager'
import { failureLogger } from '@/lib/services/failure-logger'
import { runNumPyPandasAnalysis } from '@/lib/services/service-analyzer-bridge'
import { verifyAdminRequest, secureJson } from '@/lib/security'

export async function GET(request: NextRequest) {
  const auth = verifyAdminRequest(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.reason || 'Unauthorized: Service health monitor is restricted to administrators.' },
      { status: 401 }
    )
  }

  try {
    // 1. Gather all lazy-managed services
    const services = lazyServiceManager.getAllServices()

    // 2. Fetch recent failure logs & metrics
    const failures = failureLogger.getFailures(40)
    const statusCodes = failureLogger.getStatusCodeDistribution()
    const geoDistribution = failureLogger.getPlatformGeoDistribution()

    // 3. Execute NumPy & Pandas statistical analysis
    const analytics = await runNumPyPandasAnalysis()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      services,
      failures,
      statusCodes,
      geoDistribution,
      analytics,
      summary: {
        totalServices: services.length,
        operationalCount: services.filter(s => s.status === 'operational').length,
        standbyLazyCount: services.filter(s => s.status === 'standby').length,
        degradedCount: services.filter(s => s.status === 'degraded' || s.status === 'failed').length,
        systemHealth: analytics.healthScore,
        uptime: analytics.uptimePct
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch services health telemetry' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyAdminRequest(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.reason || 'Unauthorized: Service controls can only be operated by administrators.' },
      { status: 401 }
    )
  }

  try {
    let body: any = {}
    try {
      const text = await request.text()
      if (text) {
        // Strip any wrapping single quotes if command-line tool sent them
        const cleaned = text.trim().replace(/^'|'$/g, '')
        body = JSON.parse(cleaned)
      }
    } catch (_) {
      body = {}
    }
    const action = body.action || 'verify-all'
    const serviceId = body.serviceId

    switch (action) {
      case 'verify-all': {
        const verifyResult = await lazyServiceManager.verifyAllServices()
        for (const [sId, res] of Object.entries(verifyResult.results)) {
          failureLogger.recordTraffic({
            latencyMs: (res as any)?.latencyMs || 8,
            isSuccess: true,
            service: sId,
            statusCode: 200
          })
        }
        const analytics = await runNumPyPandasAnalysis()
        return NextResponse.json({
          success: true,
          message: `Successfully verified ${verifyResult.verifiedCount} platform services.`,
          services: lazyServiceManager.getAllServices(),
          verifyResult,
          analytics
        })
      }

      case 'warmup': {
        if (!serviceId) {
          // Warm up all services
          for (const svc of lazyServiceManager.getAllServices()) {
            lazyServiceManager.warmupService(svc.id)
          }
          return NextResponse.json({
            success: true,
            message: 'All services warmed up into active operational state.',
            services: lazyServiceManager.getAllServices()
          })
        }
        const ok = lazyServiceManager.warmupService(serviceId)
        return NextResponse.json({
          success: ok,
          message: ok ? `Service '${serviceId}' warmed up and ready.` : `Service '${serviceId}' not found.`,
          services: lazyServiceManager.getAllServices()
        })
      }

      case 'lazy-standby': {
        if (!serviceId) {
          return NextResponse.json({ success: false, error: 'serviceId is required for lazy-standby' }, { status: 400 })
        }
        const ok = lazyServiceManager.setLazyStandby(serviceId)
        return NextResponse.json({
          success: ok,
          message: ok ? `Service '${serviceId}' placed into lazy standby (memory trimmed).` : `Service '${serviceId}' not found.`,
          services: lazyServiceManager.getAllServices()
        })
      }

      case 'restart': {
        if (!serviceId) {
          return NextResponse.json({ success: false, error: 'serviceId is required for restart' }, { status: 400 })
        }
        const ok = lazyServiceManager.restartService(serviceId)
        return NextResponse.json({
          success: ok,
          message: ok ? `Service '${serviceId}' restarted successfully.` : `Service '${serviceId}' not found.`,
          services: lazyServiceManager.getAllServices()
        })
      }

      case 'clear-failures': {
        failureLogger.clearFailures()
        return NextResponse.json({
          success: true,
          message: 'Failure request log queue cleared.',
          failures: []
        })
      }

      case 'record-failure': {
        // Log a failed request directly from another API route or game engine component
        const rec = failureLogger.recordFailure({
          endpoint: body.endpoint || '/api/unknown',
          method: body.method || 'POST',
          statusCode: body.statusCode || 500,
          errorMessage: body.errorMessage || 'Internal service error',
          latencyMs: body.latencyMs || 60,
          service: body.service || 'game-engine',
          clientIp: body.clientIp,
          userAgent: body.userAgent
        })
        if (body.service) {
          lazyServiceManager.incrementFailure(body.service)
        }
        return NextResponse.json({ success: true, failure: rec })
      }

      case 'run-pandas-analysis': {
        const analytics = await runNumPyPandasAnalysis()
        return NextResponse.json({
          success: true,
          message: 'NumPy and Pandas statistical telemetry recalculation completed.',
          analytics
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unrecognized action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error processing service management action' },
      { status: 500 }
    )
  }
}
