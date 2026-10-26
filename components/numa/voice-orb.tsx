'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

export const ORB_LABELS: Record<OrbState, string> = {
  idle: 'Tap to talk',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
}

type VoiceOrbProps = {
  state: OrbState
  onActivate?: () => void
  size?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
  /**
   * Returns the current audio amplitude (0–1). Pass this once a real microphone
   * or speech output is connected; without it the orb uses gentle procedural motion.
   */
  getLevel?: () => number
}

/** Builds a `getLevel` reader from a Web Audio AnalyserNode (RMS of the time-domain signal). */
export function createAnalyserLevel(analyser: AnalyserNode): () => number {
  const buffer = new Uint8Array(analyser.fftSize)
  return () => {
    analyser.getByteTimeDomainData(buffer)
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      const v = (buffer[i] - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / buffer.length) * 3)
  }
}

type RGB = readonly [number, number, number]

// Numa signature palette — exact brand values.
const VIOLET: RGB = [139, 92, 246] // #8B5CF6
const LAVENDER: RGB = [167, 139, 250] // #A78BFA
const BLUE: RGB = [59, 130, 246] // #3B82F6
const MAGENTA: RGB = [217, 70, 239] // #D946EF
const PEARL: RGB = [242, 236, 255]

const rgba = (c: RGB, a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${a < 0 ? 0 : a > 1 ? 1 : a.toFixed(3)})`

const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]

type Params = {
  energy: number
  ringSpeed: number
  swirl: number
  ripple: number
  ribbon: number
  gather: number
  pulse: number
  scale: number
}

const STATE_PARAMS: Record<OrbState, Params> = {
  idle: { energy: 0.5, ringSpeed: 1, swirl: 0.12, ripple: 0.14, ribbon: 0.45, gather: 0, pulse: 0, scale: 1 },
  listening: { energy: 0.72, ringSpeed: 1.35, swirl: 0.18, ripple: 1, ribbon: 0.6, gather: 0, pulse: 0.45, scale: 1.04 },
  thinking: { energy: 0.66, ringSpeed: 2.6, swirl: 1, ripple: 0.22, ribbon: 0.5, gather: 1, pulse: 0.1, scale: 0.97 },
  speaking: { energy: 0.86, ringSpeed: 1.6, swirl: 0.3, ripple: 0.5, ribbon: 1, gather: 0.15, pulse: 1, scale: 1.03 },
}

const PARAM_KEYS = Object.keys(STATE_PARAMS.idle) as (keyof Params)[]

const RINGS = [
  { r: 1.34, tiltX: 1.18, tiltZ: 0.32, precess: 0.08, dash: 3, speed: 0.55, color: LAVENDER, width: 1.1 },
  { r: 1.52, tiltX: 1.36, tiltZ: -0.62, precess: -0.05, dash: 2, speed: -0.38, color: BLUE, width: 0.85 },
  { r: 1.2, tiltX: 0.52, tiltZ: 1.12, precess: 0.1, dash: 4, speed: 0.7, color: VIOLET, width: 0.8 },
  { r: 1.43, tiltX: -0.74, tiltZ: 0.46, precess: -0.07, dash: 5, speed: 0.44, color: MAGENTA, width: 0.7 },
] as const

const RIBBONS = [
  { base: 1.08, tiltX: 0.38, tiltZ: 0.5, k: 3, lift: 0.34, speed: 0.42, span: 1.35, from: VIOLET, to: BLUE, width: 1 },
  { base: 1.2, tiltX: -0.52, tiltZ: -0.34, k: 2, lift: 0.4, speed: -0.34, span: 1.2, from: LAVENDER, to: MAGENTA, width: 0.85 },
  { base: 0.96, tiltX: 0.92, tiltZ: -1.02, k: 4, lift: 0.26, speed: 0.5, span: 1.1, from: BLUE, to: LAVENDER, width: 0.72 },
  { base: 1.28, tiltX: -1.12, tiltZ: 0.88, k: 3, lift: 0.3, speed: -0.46, span: 1.25, from: MAGENTA, to: VIOLET, width: 0.6 },
] as const

const RING_SEGMENTS = 110
const RIBBON_SEGMENTS = 64
const PERSPECTIVE = 5
const CANVAS_SCALE = 1.7
const CORE_RATIO = 0.36

type Particle = {
  r: number
  theta: number
  phi: number
  speed: number
  size: number
  twinkle: number
  seed: number
  spark: boolean
  color: RGB
}

function makeParticles(count: number): Particle[] {
  const palette = [LAVENDER, VIOLET, BLUE, PEARL, MAGENTA]
  return Array.from({ length: count }, (_, i) => ({
    r: 1.35 + Math.random() * 0.95,
    theta: Math.random() * Math.PI * 2,
    phi: 0.35 + Math.random() * (Math.PI - 0.7),
    speed: (0.04 + Math.random() * 0.1) * (Math.random() < 0.5 ? -1 : 1),
    size: 0.5 + Math.random() * 1.1,
    twinkle: 0.6 + Math.random() * 2.2,
    seed: Math.random() * 100,
    spark: i % 7 === 0,
    color: palette[i % palette.length],
  }))
}

export function VoiceOrb({
  state,
  onActivate,
  size,
  disabled,
  className,
  ariaLabel,
  getLevel,
}: VoiceOrbProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)
  const levelRef = useRef(getLevel)
  const hoverRef = useRef(false)
  const redrawRef = useRef<(() => void) | null>(null)

  stateRef.current = state
  levelRef.current = getLevel

  useEffect(() => {
    redrawRef.current?.()
  }, [state])

  useEffect(() => {
    const canvas = canvasRef.current
    const button = buttonRef.current
    if (!canvas || !button) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = motionQuery.matches

    const cur: Params = { ...STATE_PARAMS[stateRef.current] }
    let time = 0
    let ringPhase = 0
    let ribbonPhase = 0
    let swirlPhase = 0
    let wavePhase = 0
    let particlePhase = 0
    let level = 0

    let dpr = 1
    let width = 0
    let particles: Particle[] = []

    const ringPts = RINGS.map(() => new Float32Array((RING_SEGMENTS + 1) * 4))
    const ribbonPts = RIBBONS.map(() => new Float32Array((RIBBON_SEGMENTS + 1) * 4))

    const resize = () => {
      // Read both dimensions; clamp to the smaller so the canvas is ALWAYS
      // square even if a parent ever lays the button out non-square (the
      // CSS should prevent this, but we keep the rendering robust).
      const cssW = canvas.clientWidth
      const cssH = canvas.clientHeight
      if (!cssW || !cssH) return
      const css = Math.min(cssW, cssH)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.round(css * dpr)
      canvas.width = width
      canvas.height = width
      const orbCss = css / CANVAS_SCALE
      particles = makeParticles(Math.round(Math.min(72, Math.max(16, orbCss / 3.4))))
    }

    const project = (
      out: Float32Array,
      idx: number,
      x: number,
      y: number,
      z: number,
      cx: number,
      cy: number,
      R: number,
    ) => {
      const p = PERSPECTIVE / (PERSPECTIVE - z)
      out[idx] = cx + x * R * p
      out[idx + 1] = cy + y * R * p
      out[idx + 2] = z
      out[idx + 3] = p
    }

    const computeGeometry = (cx: number, cy: number, R: number, amp: number) => {
      RINGS.forEach((ring, ri) => {
        const pts = ringPts[ri]
        const tx = ring.tiltX + Math.sin(time * 0.8 + ri * 2) * 0.14 * cur.swirl
        const tz = ring.tiltZ
        const ty = ringPhase * ring.precess
        const cX = Math.cos(tx), sX = Math.sin(tx)
        const cZ = Math.cos(tz), sZ = Math.sin(tz)
        const cY = Math.cos(ty), sY = Math.sin(ty)
        for (let i = 0; i <= RING_SEGMENTS; i++) {
          const th = (i / RING_SEGMENTS) * Math.PI * 2
          let x = ring.r * Math.cos(th)
          let y = 0
          let z = ring.r * Math.sin(th)
          const y1 = y * cX - z * sX
          z = y * sX + z * cX
          y = y1
          const x1 = x * cZ - y * sZ
          y = x * sZ + y * cZ
          x = x1
          const x2 = x * cY + z * sY
          z = -x * sY + z * cY
          x = x2
          project(pts, i * 4, x, y, z, cx, cy, R)
        }
      })

      RIBBONS.forEach((rb, bi) => {
        const pts = ribbonPts[bi]
        const ph = ribbonPhase * rb.speed + bi * 1.7
        const start = ph * 0.6
        const span = rb.span * Math.PI
        const ty = ribbonPhase * 0.05 * (bi % 2 ? -1 : 1)
        const cX = Math.cos(rb.tiltX), sX = Math.sin(rb.tiltX)
        const cZ = Math.cos(rb.tiltZ), sZ = Math.sin(rb.tiltZ)
        const cY = Math.cos(ty), sY = Math.sin(ty)
        for (let i = 0; i <= RIBBON_SEGMENTS; i++) {
          const u = i / RIBBON_SEGMENTS
          const th = start + u * span
          const r = rb.base + 0.16 * amp * Math.sin(rb.k * th + ph * 1.3 + bi)
          let x = r * Math.cos(th)
          let y =
            rb.lift * amp * 0.8 * Math.sin(2 * th + ph + bi) +
            0.08 * amp * Math.sin(5 * th - ph * 2)
          let z = r * Math.sin(th)
          const y1 = y * cX - z * sX
          z = y * sX + z * cX
          y = y1
          const x1 = x * cZ - y * sZ
          y = x * sZ + y * cZ
          x = x1
          const x2 = x * cY + z * sY
          z = -x * sY + z * cY
          x = x2
          project(pts, i * 4, x, y, z, cx, cy, R)
        }
      })
    }

    const depthFactor = (z: number) => {
      const d = 0.5 + 0.5 * ((z + 1.5) / 3)
      return d < 0.35 ? 0.35 : d > 1 ? 1 : d
    }

    const drawRings = (front: boolean, unit: number) => {
      RINGS.forEach((ring, ri) => {
        const pts = ringPts[ri]
        for (let i = 0; i < RING_SEGMENTS; i++) {
          const a = i * 4
          const b = a + 4
          const zm = (pts[a + 2] + pts[b + 2]) * 0.5
          if (front !== zm > 0) continue
          const th = (i / RING_SEGMENTS) * Math.PI * 2
          const bright = Math.pow(0.5 + 0.5 * Math.cos(th * ring.dash - ringPhase * ring.speed * 2), 4)
          const depth = depthFactor(zm)
          const p = pts[a + 3]
          const alpha = (0.14 + 0.55 * bright) * depth * (0.55 + 0.45 * cur.energy)
          ctx.beginPath()
          ctx.moveTo(pts[a], pts[a + 1])
          ctx.lineTo(pts[b], pts[b + 1])
          if (bright > 0.35) {
            ctx.lineWidth = unit * ring.width * 5 * p
            ctx.strokeStyle = rgba(ring.color, alpha * 0.12)
            ctx.stroke()
          }
          ctx.lineWidth = Math.max(dpr * 0.6, unit * ring.width * (1 + bright) * p)
          ctx.strokeStyle = rgba(mix(ring.color, PEARL, bright * 0.5), alpha)
          ctx.stroke()
        }
      })
    }

    const drawRibbons = (front: boolean, unit: number) => {
      const swell = 1 + level * cur.pulse * 0.7
      RIBBONS.forEach((rb, bi) => {
        const pts = ribbonPts[bi]
        const ph = ribbonPhase * rb.speed + bi * 1.7
        for (let i = 0; i < RIBBON_SEGMENTS; i++) {
          const a = i * 4
          const b = a + 4
          const zm = (pts[a + 2] + pts[b + 2]) * 0.5
          if (front !== zm > 0) continue
          const u = (i + 0.5) / RIBBON_SEGMENTS
          const taper = Math.pow(Math.sin(Math.PI * u), 1.6)
          const twist = Math.abs(Math.sin(u * Math.PI * 3 + ph))
          const p = pts[a + 3]
          const w = unit * 13 * rb.width * taper * (0.22 + 0.78 * twist) * p * swell
          if (w < 0.2) continue
          const color = mix(rb.from, rb.to, u)
          const alpha = taper * depthFactor(zm) * (0.45 + 0.6 * cur.energy)
          ctx.beginPath()
          ctx.moveTo(pts[a], pts[a + 1])
          ctx.lineTo(pts[b], pts[b + 1])
          ctx.lineWidth = w * 2.4
          ctx.strokeStyle = rgba(color, alpha * 0.05)
          ctx.stroke()
          ctx.lineWidth = w
          ctx.strokeStyle = rgba(color, alpha * 0.15)
          ctx.stroke()
          ctx.lineWidth = Math.max(dpr * 0.5, w * 0.16)
          ctx.strokeStyle = rgba(mix(color, PEARL, 0.45), alpha * (0.2 + 0.4 * twist))
          ctx.stroke()
        }
      })
    }

    const drawParticles = (front: boolean, cx: number, cy: number, R: number, unit: number) => {
      const spread = 1 + 0.12 * cur.ripple + level * cur.ripple * 0.1 - 0.14 * cur.gather
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]
        const ang = pt.theta + particlePhase * pt.speed
        const rr = pt.r * spread
        const sp = Math.sin(pt.phi)
        const x = rr * sp * Math.cos(ang)
        const z = rr * sp * Math.sin(ang)
        if (front !== z > 0) continue
        const y = rr * Math.cos(pt.phi) * 0.72 + Math.sin(time * 0.35 + pt.seed) * 0.07
        const p = PERSPECTIVE / (PERSPECTIVE - z)
        const sx = cx + x * R * p
        const sy = cy + y * R * p
        const tw = 0.5 + 0.5 * Math.sin(time * pt.twinkle + pt.seed)
        const alpha = (0.25 + 0.75 * tw) * depthFactor(z) * (0.45 + 0.55 * cur.energy)
        const s = Math.max(dpr * 0.6, unit * pt.size * p)
        if (pt.spark) {
          ctx.fillStyle = rgba(pt.color, alpha * 0.12)
          ctx.beginPath()
          ctx.arc(sx, sy, s * 5, 0, Math.PI * 2)
          ctx.fill()
          if (tw > 0.7) {
            const l = s * 6 * tw
            ctx.lineWidth = Math.max(dpr * 0.5, s * 0.35)
            ctx.strokeStyle = rgba(PEARL, alpha * 0.55)
            ctx.beginPath()
            ctx.moveTo(sx - l, sy)
            ctx.lineTo(sx + l, sy)
            ctx.moveTo(sx, sy - l)
            ctx.lineTo(sx, sy + l)
            ctx.stroke()
          }
        }
        ctx.fillStyle = rgba(pt.spark ? PEARL : pt.color, alpha * (pt.spark ? 1 : 0.7))
        ctx.beginPath()
        ctx.arc(sx, sy, pt.spark ? s * 1.2 : s, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawCore = (cx: number, cy: number, Rc: number, unit: number) => {
      ctx.globalCompositeOperation = 'source-over'
      const body = ctx.createRadialGradient(cx - Rc * 0.28, cy - Rc * 0.32, Rc * 0.04, cx, cy, Rc)
      body.addColorStop(0, rgba([218, 204, 255], 0.92))
      body.addColorStop(0.42, rgba(VIOLET, 0.76))
      body.addColorStop(0.82, rgba([64, 34, 172], 0.82))
      body.addColorStop(1, rgba([28, 16, 92], 0.92))
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.arc(cx, cy, Rc, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, Rc, 0, Math.PI * 2)
      ctx.clip()
      ctx.globalCompositeOperation = 'lighter'

      // Four-colour internal light blobs — each colour is present in the core.
      const blobColors: RGB[] = [LAVENDER, BLUE, MAGENTA, VIOLET]
      const orbit = Rc * 0.48 * (1 - cur.gather * 0.65)
      for (let i = 0; i < blobColors.length; i++) {
        const ang = swirlPhase * (i % 2 ? -0.7 : 1) + (i * Math.PI) / 2
        const bx = cx + Math.cos(ang) * orbit
        const by = cy + Math.sin(ang * 1.3) * orbit * 0.8
        const br = Rc * (0.55 + 0.1 * Math.sin(time * 0.9 + i))
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br)
        g.addColorStop(0, rgba(blobColors[i], 0.22 + 0.14 * cur.energy))
        g.addColorStop(1, rgba(blobColors[i], 0))
        ctx.fillStyle = g
        ctx.fillRect(cx - Rc, cy - Rc, Rc * 2, Rc * 2)
      }

      // Swirling internal detail — gentle in idle, concentrated in thinking.
      if (cur.swirl > 0.02) {
        for (let arm = 0; arm < 3; arm++) {
          ctx.beginPath()
          for (let s = 0; s <= 28; s++) {
            const u = s / 28
            const rr = Rc * (0.9 - 0.78 * u)
            const ang = swirlPhase * 1.4 + (arm * Math.PI * 2) / 3 + u * 3.4
            const x = cx + Math.cos(ang) * rr
            const y = cy + Math.sin(ang) * rr * 0.9
            if (s === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.lineWidth = unit * 7
          ctx.strokeStyle = rgba(VIOLET, 0.09 * cur.swirl)
          ctx.stroke()
          ctx.lineWidth = unit * 1.6
          ctx.strokeStyle = rgba(LAVENDER, 0.28 * cur.swirl)
          ctx.stroke()
        }
      }

      const nucleusR = Rc * (0.3 + 0.18 * cur.gather + 0.12 * level * cur.pulse)
      const nucleus = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucleusR)
      nucleus.addColorStop(0, rgba(PEARL, 0.32 + 0.35 * cur.gather + 0.3 * level * cur.pulse))
      nucleus.addColorStop(0.5, rgba(LAVENDER, 0.14 + 0.15 * cur.gather))
      nucleus.addColorStop(1, rgba(LAVENDER, 0))
      ctx.fillStyle = nucleus
      ctx.fillRect(cx - Rc, cy - Rc, Rc * 2, Rc * 2)

      // Cool blue caustic at the lower hemisphere — the blue accent in the core.
      const caustic = ctx.createLinearGradient(cx, cy + Rc * 0.2, cx, cy + Rc)
      caustic.addColorStop(0, rgba(BLUE, 0))
      caustic.addColorStop(1, rgba(BLUE, 0.24))
      ctx.fillStyle = caustic
      ctx.beginPath()
      ctx.ellipse(cx + Rc * 0.08, cy + Rc * 0.62, Rc * 0.62, Rc * 0.3, -0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Glass rim — luminous lavender edge.
      ctx.globalCompositeOperation = 'lighter'
      const rim = ctx.createRadialGradient(cx, cy, Rc * 0.72, cx, cy, Rc)
      rim.addColorStop(0, rgba(LAVENDER, 0))
      rim.addColorStop(0.85, rgba(LAVENDER, 0.16))
      rim.addColorStop(1, rgba(PEARL, 0.45))
      ctx.fillStyle = rim
      ctx.beginPath()
      ctx.arc(cx, cy, Rc, 0, Math.PI * 2)
      ctx.fill()

      // Subtle magenta rim arc for restrained luminous accent.
      ctx.lineWidth = unit * 2.2
      ctx.strokeStyle = rgba(MAGENTA, 0.3)
      ctx.beginPath()
      ctx.arc(cx, cy, Rc * 0.93, Math.PI * 0.12, Math.PI * 0.62)
      ctx.stroke()
      ctx.lineWidth = unit * 2
      ctx.strokeStyle = rgba(BLUE, 0.34)
      ctx.beginPath()
      ctx.arc(cx, cy, Rc * 0.88, Math.PI * 0.2, Math.PI * 0.72)
      ctx.stroke()

      // Specular highlight — glass depth.
      ctx.globalCompositeOperation = 'screen'
      const sx = cx - Rc * 0.34
      const sy = cy - Rc * 0.42
      const spec = ctx.createRadialGradient(sx, sy, 0, sx, sy, Rc * 0.42)
      spec.addColorStop(0, 'rgba(255,255,255,0.6)')
      spec.addColorStop(0.35, rgba(PEARL, 0.18))
      spec.addColorStop(1, rgba(PEARL, 0))
      ctx.fillStyle = spec
      ctx.beginPath()
      ctx.ellipse(sx, sy, Rc * 0.42, Rc * 0.28, -0.6, 0, Math.PI * 2)
      ctx.fill()
    }

    const draw = () => {
      if (!width) return
      const cx = width / 2
      const cy = width / 2
      const R = (width / CANVAS_SCALE) * CORE_RATIO
      const unit = R / 100
      const breathe = reduced ? 0 : Math.sin(time * 1.05) * 0.022
      const hover = hoverRef.current ? 0.02 : 0
      const Rc = R * (cur.scale + breathe + hover + level * cur.pulse * 0.045)
      const amp = 0.6 + 0.8 * cur.ribbon + level * cur.pulse * 0.6

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, width, width)
      ctx.lineCap = 'butt'
      computeGeometry(cx, cy, R, amp)

      ctx.globalCompositeOperation = 'lighter'
      const glowE = cur.energy + (hoverRef.current ? 0.1 : 0) + level * 0.2
      // Multicolour halo — violet/lavender dominate, blue + magenta add contrast.
      const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 2.35)
      glow.addColorStop(0, rgba(VIOLET, 0.12 + 0.2 * glowE))
      glow.addColorStop(0.4, rgba(LAVENDER, 0.05 + 0.07 * glowE))
      glow.addColorStop(0.72, rgba(BLUE, 0.03 + 0.04 * glowE))
      glow.addColorStop(1, rgba(VIOLET, 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, width)

      // Soft magenta accent halo, offset, for restrained luminous accent.
      const mh = ctx.createRadialGradient(cx + R * 0.3, cy - R * 0.2, R * 0.3, cx + R * 0.3, cy - R * 0.2, R * 1.8)
      mh.addColorStop(0, rgba(MAGENTA, 0.04 + 0.06 * glowE))
      mh.addColorStop(1, rgba(MAGENTA, 0))
      ctx.fillStyle = mh
      ctx.fillRect(0, 0, width, width)

      // Outer transparent waves — ripple. Each wave gets a different colour
      // so the four hues blend in the outer ripple instead of being monochrome.
      const rippleColors: RGB[] = [VIOLET, LAVENDER, BLUE, MAGENTA]
      for (let i = 0; i < 4; i++) {
        let w = (wavePhase + i / 4) % 1
        if (reduced) w = (i + 1) / 5
        const radius = R * (1.12 + 1.15 * w) * (1 + level * cur.ripple * 0.06)
        const fade = (1 - w) * (1 - w)
        const alpha = fade * (0.05 + 0.32 * cur.ripple + level * cur.ripple * 0.25)
        ctx.lineWidth = R * 0.09 * (1 - w * 0.5)
        ctx.strokeStyle = rgba(rippleColors[i], alpha * 0.16)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = Math.max(dpr * 0.6, unit * 1.1)
        ctx.strokeStyle = rgba(mix(rippleColors[i], LAVENDER, 0.3), alpha)
        ctx.stroke()
      }

      drawParticles(false, cx, cy, R, unit)
      drawRings(false, unit)
      drawRibbons(false, unit)

      drawCore(cx, cy, Rc, unit)

      ctx.globalCompositeOperation = 'lighter'
      drawRibbons(true, unit)
      drawRings(true, unit)
      drawParticles(true, cx, cy, R, unit)
      ctx.globalCompositeOperation = 'source-over'

      button.dataset.ready = 'true'
    }

    const step = (dt: number) => {
      const target = STATE_PARAMS[stateRef.current]
      const k = 1 - Math.exp(-dt * 2.6)
      for (const key of PARAM_KEYS) cur[key] += (target[key] - cur[key]) * k

      time += dt
      ringPhase += dt * 0.6 * cur.ringSpeed
      ribbonPhase += dt * (0.55 + 0.5 * cur.ribbon)
      swirlPhase += dt * (0.25 + 1.6 * cur.swirl)
      wavePhase += dt * (0.07 + 0.32 * cur.ripple)
      particlePhase += dt * (1 + 1.5 * cur.gather + 0.5 * cur.ripple)

      const s = stateRef.current
      let raw = 0
      const reader = levelRef.current
      if (reader && (s === 'listening' || s === 'speaking')) {
        raw = Math.min(1, Math.max(0, reader()))
      } else if (s === 'speaking') {
        raw = 0.35 + 0.65 * Math.abs(Math.sin(time * 5.2) * Math.sin(time * 1.7 + 0.6))
      } else if (s === 'listening') {
        raw = 0.2 + 0.2 * Math.sin(time * 2.1) * Math.sin(time * 0.7)
      }
      const lk = 1 - Math.exp(-dt * (raw > level ? 18 : 6))
      level += (raw - level) * lk
    }

    let raf = 0
    let last = 0
    let visible = true

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      step(dt)
      draw()
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (raf || reduced || !visible || document.hidden) return
      last = 0
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const drawStatic = () => {
      Object.assign(cur, STATE_PARAMS[stateRef.current])
      time = 2
      ringPhase = 1.2
      ribbonPhase = 1.4
      swirlPhase = 0.8
      level = stateRef.current === 'speaking' ? 0.5 : 0
      draw()
    }

    redrawRef.current = () => {
      if (reduced) drawStatic()
    }

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) drawStatic()
      else draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    const onMotion = (e: MediaQueryListEvent) => {
      reduced = e.matches
      if (reduced) {
        stop()
        drawStatic()
      } else start()
    }
    motionQuery.addEventListener('change', onMotion)

    resize()
    if (reduced) drawStatic()
    else start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotion)
      redrawRef.current = null
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      type="button"
      data-state={state}
      onClick={onActivate}
      onPointerEnter={() => (hoverRef.current = true)}
      onPointerLeave={() => (hoverRef.current = false)}
      disabled={disabled}
      aria-label={ariaLabel ?? `Numa voice: ${ORB_LABELS[state]}`}
      aria-pressed={state === 'listening'}
      className={cn('numa-orb disabled:cursor-not-allowed disabled:opacity-60', className)}
      style={size ? ({ '--orb-size': size } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} className="numa-orb__canvas" aria-hidden="true" />
    </button>
  )
}
