"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Sparkles, Zap, Crosshair, Award, Volume2, Flame, Eye } from "lucide-react"

interface ColorBall {
  id: number
  optionText: string
  label: string
  color: string
  textColor: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  isCorrect: boolean
  scale: number
  popped: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  radius: number
  life: number
}

interface ColorBallArenaProps {
  options: string[]
  correctAnswer: string
  onHitAnswer: (answer: string) => void
  disabled?: boolean
  difficulty?: string
  questionTitle?: string
}

// Comprehensive color resolver mapping color names, RGB & Hex codes
const COLOR_MAP: Record<string, string> = {
  red: "#EF4444",
  "pure red": "#FF0000",
  green: "#22C55E",
  "pure green": "#00FF00",
  blue: "#3B82F6",
  "pure blue": "#0000FF",
  yellow: "#EAB308",
  "pure yellow": "#FFFF00",
  orange: "#F97316",
  purple: "#A855F7",
  violet: "#8B5CF6",
  cyan: "#06B6D4",
  "pure cyan": "#00FFFF",
  magenta: "#EC4899",
  "pure magenta": "#FF00FF",
  white: "#F8FAFC",
  "pure white": "#FFFFFF",
  black: "#0F172A",
  "pure black": "#000000",
  gray: "#64748B",
  "medium gray": "#808080",
  pink: "#F43F5E",
  maroon: "#881337",
  navy: "#1E3A8A",
  teal: "#0D9488",
  olive: "#65A30D",
  coral: "#FB7185",
  emerald: "#10B981",
  cobalt: "#2563EB",
  azure: "#38BDF8",
  crimson: "#BE123C",
  amber: "#F59E0B",
  gold: "#FACC15",
  lime: "#84CC16",
  tangerine: "#FB923C",
  brown: "#78350F",
  rust: "#9A3412",
  turquoise: "#14B8A6",
  indigo: "#6366F1",
  scarlet: "#DC2626",
  peach: "#FDBA74",
  ochre: "#D97706",
}

function resolveColor(text: string, index: number): string {
  // 1. Direct hex match
  const hexMatch = text.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/)
  if (hexMatch) return hexMatch[0]

  // 2. Direct RGB match
  const rgbMatch = text.match(/rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i)
  if (rgbMatch) return rgbMatch[0]

  // 3. Lowercase keyword match
  const lower = text.toLowerCase()
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, "i")
    if (regex.test(lower)) {
      return hex
    }
  }

  // 4. Fallback vibrant wheel
  const fallbackWheel = [
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#22C55E", // Green
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
  ]
  return fallbackWheel[index % fallbackWheel.length]
}

function getContrastColor(hexColor: string): string {
  // If dark hex, return white, otherwise black
  if (hexColor.startsWith("#") && hexColor.length === 7) {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 150 ? "#000000" : "#FFFFFF"
  }
  return "#FFFFFF"
}

export function ColorBallArena({
  options,
  correctAnswer,
  onHitAnswer,
  disabled = false,
  difficulty = "beginner",
  questionTitle = "Hit the Matching Ball",
}: ColorBallArenaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)

  const ballsRef = useRef<ColorBall[]>([])
  const particlesRef = useRef<Particle[]>([])
  const [hitFeedback, setHitFeedback] = useState<{ text: string; color: string; x: number; y: number } | null>(null)
  const [combo, setCombo] = useState(0)
  const [isHoveringBall, setIsHoveringBall] = useState(false)

  // Target Color resolution
  const targetColor = resolveColor(correctAnswer, 0)
  const targetContrast = getContrastColor(targetColor)

  // Initialize or re-initialize balls when options change
  useEffect(() => {
    if (!options || options.length === 0) return

    const container = containerRef.current
    const width = container ? container.clientWidth : 600
    const height = 260

    // Velocity scale based on difficulty
    const speedMultiplier =
      difficulty === "grandmaster"
        ? 2.2
        : difficulty === "master"
        ? 1.9
        : difficulty === "expert"
        ? 1.6
        : difficulty === "advanced"
        ? 1.3
        : difficulty === "intermediate"
        ? 1.1
        : 0.85

    const baseRadius = width < 480 ? 32 : 38

    const newBalls: ColorBall[] = options.map((opt, i) => {
      const ballColor = resolveColor(opt, i)
      const angle = (Math.PI * 2 * i) / options.length + Math.random() * 0.5
      const speed = (1.2 + Math.random() * 0.8) * speedMultiplier

      // Distribute starting positions nicely
      const padding = baseRadius + 15
      const startX = padding + Math.random() * (Math.max(100, width - padding * 2))
      const startY = padding + Math.random() * (height - padding * 2)

      return {
        id: i,
        optionText: opt,
        label: String.fromCharCode(65 + i),
        color: ballColor,
        textColor: getContrastColor(ballColor),
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: baseRadius,
        isCorrect: opt === correctAnswer,
        scale: 1,
        popped: false,
      }
    })

    ballsRef.current = newBalls
    particlesRef.current = []
    setHitFeedback(null)
  }, [options, correctAnswer, difficulty])

  // Spawn particle explosion
  const spawnParticles = (x: number, y: number, color: string, count: number = 24) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 2 + Math.random() * 5
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        radius: 2.5 + Math.random() * 3,
        life: 1,
      })
    }
    particlesRef.current.push(...newParticles)
  }

  // Handle hitting a ball
  const handleHitBall = useCallback(
    (ball: ColorBall, clickX: number, clickY: number) => {
      if (disabled || ball.popped) return

      spawnParticles(ball.x, ball.y, ball.color, 30)

      if (ball.isCorrect) {
        ball.popped = true
        setCombo((prev) => prev + 1)
        setHitFeedback({
          text: "💥 DIRECT HIT! +MATCH",
          color: "#22C55E",
          x: clickX,
          y: clickY,
        })
        onHitAnswer(ball.optionText)
      } else {
        setCombo(0)
        setHitFeedback({
          text: "❌ COLOR MISMATCH!",
          color: "#EF4444",
          x: clickX,
          y: clickY,
        })
        onHitAnswer(ball.optionText)
      }

      // Hide feedback after 1.2s
      setTimeout(() => {
        setHitFeedback(null)
      }, 1200)
    },
    [disabled, onHitAnswer]
  )

  // Canvas render & physics loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let lastTime = performance.now()

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const width = canvas.width
      const height = canvas.height

      // Clear with dark arena background
      ctx.clearRect(0, 0, width, height)

      // Draw subtle grid pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
      ctx.lineWidth = 1
      const gridSize = 30
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Update & render particles
      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.life -= dt * 1.5
        p.alpha = Math.max(0, p.life)

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Update & render balls
      const balls = ballsRef.current
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i]
        if (b.popped) continue

        // Physics step
        b.x += b.vx
        b.y += b.vy

        // Wall collisions with rebound
        if (b.x - b.radius < 0) {
          b.x = b.radius
          b.vx = Math.abs(b.vx)
        } else if (b.x + b.radius > width) {
          b.x = width - b.radius
          b.vx = -Math.abs(b.vx)
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius
          b.vy = Math.abs(b.vy)
        } else if (b.y + b.radius > height) {
          b.y = height - b.radius
          b.vy = -Math.abs(b.vy)
        }

        // Ball-to-ball soft deflection
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j]
          if (b2.popped) continue
          const dx = b2.x - b.x
          const dy = b2.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = b.radius + b2.radius

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.5
            const nx = dx / dist
            const ny = dy / dist

            b.x -= nx * overlap
            b.y -= ny * overlap
            b2.x += nx * overlap
            b2.y += ny * overlap

            // Swap velocities slightly
            const tempVx = b.vx
            const tempVy = b.vy
            b.vx = b2.vx
            b.vy = b2.vy
            b2.vx = tempVx
            b2.vy = tempVy
          }
        }

        // Draw outer glow shadow
        ctx.save()
        ctx.shadowColor = b.color
        ctx.shadowBlur = 18

        // Draw ball body with 3D spherical gradient
        const grad = ctx.createRadialGradient(
          b.x - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.1,
          b.x,
          b.y,
          b.radius
        )
        grad.addColorStop(0, "#FFFFFF")
        grad.addColorStop(0.3, b.color)
        grad.addColorStop(1, b.color)

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fill()

        // Ball boundary ring
        ctx.shadowBlur = 0
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
        ctx.lineWidth = 2
        ctx.stroke()

        // Shiny specular highlight spot
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)"
        ctx.beginPath()
        ctx.ellipse(
          b.x - b.radius * 0.3,
          b.y - b.radius * 0.35,
          b.radius * 0.3,
          b.radius * 0.18,
          -Math.PI / 4,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // Text inside ball: Option Letter + Short description
        ctx.fillStyle = b.textColor
        ctx.font = "bold 13px system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(b.label, b.x, b.y - (b.radius > 35 ? 7 : 0))

        if (b.radius > 35) {
          ctx.font = "bold 9px system-ui, sans-serif"
          const displayLabel = b.optionText.length > 9 ? b.optionText.slice(0, 8) + "…" : b.optionText
          ctx.fillText(displayLabel, b.x, b.y + 11)
        }

        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (container && canvas) {
        canvas.width = container.clientWidth
        canvas.height = 260
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Click on Canvas to hit ball
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Check if clicked any ball
    const balls = ballsRef.current
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i]
      if (b.popped) continue
      const dist = Math.hypot(clickX - b.x, clickY - b.y)
      if (dist <= b.radius + 6) {
        handleHitBall(b, clickX, clickY)
        return
      }
    }

    // Missed hit
    spawnParticles(clickX, clickY, "#94A3B8", 10)
    setHitFeedback({
      text: "MISSED!",
      color: "#94A3B8",
      x: clickX,
      y: clickY,
    })
    setTimeout(() => setHitFeedback(null), 800)
  }

  // Mouse move for hover cursor
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const hovering = ballsRef.current.some(
      (b) => !b.popped && Math.hypot(mx - b.x, my - b.y) <= b.radius + 4
    )
    setIsHoveringBall(hovering)
  }

  return (
    <div className="space-y-3">
      {/* Target Color Header Bar */}
      <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-rose-950/30">
        <div className="flex items-center gap-3">
          {/* Pulsing Target Orb */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full border-2 border-white/40 shadow-md flex items-center justify-center animate-pulse"
              style={{
                backgroundColor: targetColor,
                boxShadow: `0 0 20px ${targetColor}80`,
              }}
            >
              <Eye className="w-4 h-4 opacity-75" style={{ color: targetContrast }} />
            </div>
            <div
              className="absolute -inset-1 rounded-full opacity-40 animate-ping pointer-events-none"
              style={{ backgroundColor: targetColor }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-rose-400" /> TARGET TO HIT:
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-white border border-white/15">
                {correctAnswer}
              </span>
            </div>
            <div className="text-xs font-semibold text-white/80 mt-0.5">
              Aim & click the bouncing ball matching the correct color!
            </div>
          </div>
        </div>

        {/* Combo Multiplier Banner */}
        <div className="flex items-center gap-2">
          {combo > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-bounce">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> {combo}x COMBO!
            </div>
          )}
          <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-bold text-white/60">
            Speed: <span className="text-rose-400 uppercase">{difficulty}</span>
          </div>
        </div>
      </div>

      {/* Hit the Ball Interactive Canvas Arena */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-slate-950 via-black to-slate-950 shadow-2xl"
        style={{ minHeight: "260px" }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className={`w-full block select-none ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : isHoveringBall
              ? "cursor-pointer"
              : "cursor-crosshair"
          }`}
          style={{ height: "260px" }}
        />

        {/* Floating Hit Feedback Text */}
        {hitFeedback && (
          <div
            className="absolute pointer-events-none font-black text-sm sm:text-base px-3 py-1 rounded-full shadow-2xl border animate-in zoom-in-75 fade-in duration-200"
            style={{
              left: `${hitFeedback.x}px`,
              top: `${hitFeedback.y - 30}px`,
              transform: "translate(-50%, -50%)",
              backgroundColor: `${hitFeedback.color}25`,
              borderColor: hitFeedback.color,
              color: hitFeedback.color,
              boxShadow: `0 0 25px ${hitFeedback.color}80`,
            }}
          >
            {hitFeedback.text}
          </div>
        )}

        {/* Bottom Arena Controls / Instruction overlay */}
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[11px] text-white/40 pointer-events-none">
          <span className="flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-white/60" /> Click or tap any ball to hit & submit answer
          </span>
          <span className="font-mono text-[10px] text-white/30 hidden sm:inline">
            Physics: Real-time 60FPS Deflection Engine
          </span>
        </div>
      </div>

      {/* Ball Quick Strike Buttons (Touch / Keyboard Accessibility) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {options.map((opt, i) => {
          const ballColor = resolveColor(opt, i)
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                const b = ballsRef.current[i]
                if (b && containerRef.current) {
                  handleHitBall(b, b.x, b.y)
                } else {
                  onHitAnswer(opt)
                }
              }}
              className="p-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              <span
                className="w-5 h-5 rounded-full border border-white/30 shadow flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                style={{
                  backgroundColor: ballColor,
                  color: getContrastColor(ballColor),
                  boxShadow: `0 0 10px ${ballColor}60`,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-xs text-white/90 font-medium truncate flex-1 group-hover:text-white">
                {opt}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ColorBallArena
