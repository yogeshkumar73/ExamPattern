"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export function StudentArenaRequest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadUserStatus()
    
    // Auto-refresh every 30 seconds if pending
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadUserStatus()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadUserStatus = () => {
    try {
      const session = localStorage.getItem('aura_session')
      if (session) {
        const parsed = JSON.parse(session)
        setUser(parsed.user || null)
      }
    } catch (e) {
      console.error('Failed to load user:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = async () => {
    if (!user?.id) {
      alert('Please log in first')
      return
    }

    try {
      setRequesting(true)
      const response = await fetch('/api/user/arena-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          action: 'request'
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Update local session
        const updated = { ...user, arenaApprovalStatus: 'pending', arenaAccessRequestedAt: new Date().toISOString() }
        localStorage.setItem('aura_session', JSON.stringify({ user: updated }))
        setUser(updated)
        alert('Arena access request sent! Waiting for admin approval.')
      } else {
        alert(data.error || data.message || 'Failed to request access')
      }
    } catch (error) {
      console.error('Request error:', error)
      alert('Network error. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Card className="border-2 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse text-muted-foreground">Loading arena status...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = user?.arenaApprovalStatus || 'none'
  const requestedAt = user?.arenaAccessRequestedAt ? new Date(user.arenaAccessRequestedAt) : null
  const approvedAt = user?.arenaApprovedAt ? new Date(user.arenaApprovedAt) : null

  return (
    <div className="container mx-auto py-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Zap className="w-10 h-10 text-orange-500 animate-pulse" /> 
            BATTLE ARENA ACCESS
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Request Competition Access</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 font-bold border-orange-500 text-orange-500 w-fit">COMPETITIVE GAMING SYSTEM</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-2 shadow-2xl overflow-hidden glass-morphism">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" /> Arena Access Management
              </CardTitle>
              <CardDescription>
                {status === 'approved' 
                  ? 'Your arena access is approved! You can now compete.' 
                  : status === 'pending'
                  ? 'Your request is pending admin review.'
                  : status === 'rejected'
                  ? 'Your request was rejected. You can request again.'
                  : 'Request access to the battle arena to compete with other students.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              {/* Status Display */}
              <div className="rounded-2xl border-2 border-muted/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">Current Status</span>
                  {status === 'approved' && (
                    <Badge className="bg-emerald-500 text-white font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> APPROVED
                    </Badge>
                  )}
                  {status === 'pending' && (
                    <Badge className="bg-amber-500 text-white font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" /> PENDING
                    </Badge>
                  )}
                  {status === 'rejected' && (
                    <Badge className="bg-red-500 text-white font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> REJECTED
                    </Badge>
                  )}
                  {status === 'none' && (
                    <Badge variant="outline" className="font-bold">NOT REQUESTED</Badge>
                  )}
                </div>

                {/* Approval Info */}
                {status === 'approved' && approvedAt && (
                  <div className="text-sm text-muted-foreground">
                    <p>✓ Approved on {approvedAt.toLocaleDateString()} at {approvedAt.toLocaleTimeString()}</p>
                    {user?.arenaApprovedBy && <p>✓ Approved by: {user.arenaApprovedBy}</p>}
                  </div>
                )}

                {/* Request Timeline */}
                {status === 'pending' && requestedAt && (
                  <div className="text-sm text-muted-foreground">
                    <p>⏳ Requested on {requestedAt.toLocaleDateString()} at {requestedAt.toLocaleTimeString()}</p>
                    <p className="mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> 
                      Your request is under review. Admins typically respond within 24-48 hours.
                    </p>
                  </div>
                )}

                {/* Rejection Info */}
                {status === 'rejected' && (
                  <div className="space-y-2">
                    {user?.arenaApprovalReason && (
                      <div className="text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-bold text-red-700 dark:text-red-300">Rejection Reason:</p>
                        <p className="text-red-600 dark:text-red-400 mt-1">{user.arenaApprovalReason}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">You can request again after addressing the feedback.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {status === 'none' && (
                  <Button 
                    onClick={handleRequestAccess}
                    disabled={requesting}
                    className="w-full h-12 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {requesting ? 'Requesting...' : 'Request Arena Access'}
                  </Button>
                )}

                {status === 'pending' && (
                  <div className="space-y-3">
                    <Button 
                      disabled
                      className="w-full h-12 text-base font-bold"
                      variant="outline"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      Waiting for Admin Review
                    </Button>
                    <Button 
                      onClick={loadUserStatus}
                      variant="secondary"
                      className="w-full h-10 text-sm font-bold"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check Status Again
                    </Button>
                  </div>
                )}

                {status === 'approved' && (
                  <Button 
                    disabled
                    className="w-full h-12 text-base font-bold bg-emerald-500 text-white"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Access Granted - Ready to Battle!
                  </Button>
                )}

                {status === 'rejected' && (
                  <Button 
                    onClick={handleRequestAccess}
                    disabled={requesting}
                    className="w-full h-12 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {requesting ? 'Requesting...' : 'Request Again'}
                  </Button>
                )}
              </div>

              {/* Auto Refresh Toggle */}
              {status === 'pending' && (
                <div className="pt-4 border-t flex items-center justify-between">
                  <label className="text-sm font-bold text-muted-foreground">Auto-refresh every 30 seconds</label>
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 rounded border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">What is Arena?</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-3">
              <div>
                <p className="font-bold text-orange-500">⚡ Competitive Gaming</p>
                <p className="text-muted-foreground text-xs">Participate in real-time battles with other students</p>
              </div>
              <div>
                <p className="font-bold text-blue-500">🏆 Tournaments</p>
                <p className="text-muted-foreground text-xs">Join tournaments and compete for rankings</p>
              </div>
              <div>
                <p className="font-bold text-emerald-500">📊 Leaderboards</p>
                <p className="text-muted-foreground text-xs">Track your rank and performance against peers</p>
              </div>
              <div>
                <p className="font-bold text-purple-500">🎯 Skill Growth</p>
                <p className="text-muted-foreground text-xs">Improve your knowledge through competitive learning</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              <div className="flex gap-2">
                <span className="font-bold text-orange-500">1.</span>
                <span>Request access above</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-500">2.</span>
                <span>Admin reviews your profile</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-500">3.</span>
                <span>Get approved and start competing</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-500">4.</span>
                <span>Climb the leaderboard!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
