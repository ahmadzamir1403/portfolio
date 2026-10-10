import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { beginParticleEntry, createParticleLine, ENTRY_PARTICLE_DURATION, stepParticleEntry, stepParticleLine } from './landingParticleMotion'
import './ParticleBackground.css'

const colors = ['244, 225, 188', '208, 179, 133', '177, 145, 103']

export default function LandingParticles({ paused, entering, returning, targetRef }) {
  const canvasRef = useRef(null)
  const pausedRef = useRef(paused)
  const enteringRef = useRef(entering)
  const returningRef = useRef(returning)
  const syncRef = useRef(null)

  useEffect(() => {
    pausedRef.current = paused
    enteringRef.current = entering
    returningRef.current = returning
    syncRef.current?.()
  }, [paused, entering, returning])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return
    // Reuse small glow textures instead of rebuilding gradients every frame.
    const glows = colors.map(color => {
      const sprite = document.createElement('canvas')
      sprite.width = sprite.height = 64
      const glowContext = sprite.getContext('2d')
      const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32)
      gradient.addColorStop(0, `rgba(${color},.4)`)
      gradient.addColorStop(.4, `rgba(${color},.12)`)
      gradient.addColorStop(1, `rgba(${color},0)`)
      glowContext.fillStyle = gradient
      glowContext.fillRect(0, 0, 64, 64)
      return sprite
    })
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compact = window.matchMedia('(max-width: 640px), (pointer: coarse)')
    let target = { x: 0, y: 0, radius: 26 }
    let particles = []
    let width = 0
    let height = 0
    let frame = 0
    let previous = 0
    let lastDraw = 0
    let elapsed = 0
    let entryStart = null
    let entryProgress = 0
    let returnStart = null
    let returnFrom = .74
    const canAnimate = () => (!pausedRef.current || enteringRef.current || returningRef.current) && !motion.matches && !document.hidden

    function draw() {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        const opacity = (.24 + particle.depth * .5) * particle.opacity
        const colorIndex = particle.depth > .96 ? 0 : particle.depth > .65 ? 1 : 2
        const glowRadius = particle.radius * 3.5
        context.globalAlpha = opacity
        context.drawImage(glows[colorIndex], particle.x - glowRadius, particle.y - glowRadius, glowRadius * 2, glowRadius * 2)
        context.fillStyle = `rgb(${colors[colorIndex]})`
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
    }
    function resize() {
      const oldWidth = width
      const oldHeight = height
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) return
      const bounds = canvas.getBoundingClientRect()
      const portrait = targetRef.current?.getBoundingClientRect()
      target = portrait ? { x: portrait.left + portrait.width / 2 - bounds.left, y: portrait.top + portrait.height / 2 - bounds.top, radius: portrait.width / 2 + 4 } : { x: width / 2, y: height * .35, radius: 26 }
      const ratio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1 : 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (entryStart !== null || returnStart !== null) {
        // Keep the same dust during rotation and retarget its remaining flight.
        for (const particle of particles) {
          particle.entryX *= width / Math.max(1, oldWidth)
          particle.entryY *= height / Math.max(1, oldHeight)
          particle.scatterX *= width / Math.max(1, oldWidth)
          particle.scatterY *= height / Math.max(1, oldHeight)
          particle.homeX *= width / Math.max(1, oldWidth)
          particle.homeY *= height / Math.max(1, oldHeight)
          particle.spreadY *= height / Math.max(1, oldHeight)
          particle.lineWidth = width
          particle.lineHeight = height
        }
        if (returnStart !== null) {
          const progress = Math.min(1, (performance.now() - returnStart) / ENTRY_PARTICLE_DURATION)
          stepParticleEntry(particles, returnFrom * (1 - progress), target)
        } else {
          entryProgress = (performance.now() - entryStart) / ENTRY_PARTICLE_DURATION
          stepParticleEntry(particles, entryProgress, target)
        }
      } else {
        const next = createParticleLine(compact.matches ? 160 : 460, width, height, { scattered: !particles.length && !pausedRef.current && !motion.matches })
        if (particles.length && oldWidth && oldHeight) {
          next.forEach((particle, index) => {
            const previous = particles[Math.floor(index * particles.length / next.length)]
            particle.x = previous.x * width / oldWidth
            particle.y = previous.y * height / oldHeight
            particle.vx = previous.vx * width / oldWidth
            particle.vy = previous.vy * height / oldHeight
            particle.flight = previous.flight
          })
        }
        particles = next
      }
      draw()
    }
    function tick(now) {
      if (!canAnimate()) { frame = 0; return }
      if (now - lastDraw >= 1000 / (compact.matches ? 24 : 30)) {
        const delta = previous ? Math.min((now - previous) / 1000, .05) : 0
        previous = now
        lastDraw = now
        elapsed += delta
        if (returnStart !== null) {
          const progress = Math.min(1, (now - returnStart) / ENTRY_PARTICLE_DURATION)
          stepParticleEntry(particles, returnFrom * (1 - progress), target)
          draw()
          if (progress >= 1) { frame = 0; return }
        } else if (entryStart !== null) {
          entryProgress = (now - entryStart) / ENTRY_PARTICLE_DURATION
          stepParticleEntry(particles, entryProgress, target)
          draw()
          // Leave the completed ring painted, with no ongoing animation work.
          if (entryProgress >= 1) { frame = 0; return }
        } else {
          stepParticleLine(particles, delta, elapsed)
          draw()
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    function sync() {
      window.cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      lastDraw = 0
      if (returningRef.current && returnStart === null) {
        if (entryStart === null) {
          // A direct section link may not have played the entrance first.
          beginParticleEntry(particles, width, height)
          entryProgress = .74
          stepParticleEntry(particles, entryProgress, target)
          draw()
        }
        returnFrom = Math.min(.74, entryProgress)
        returnStart = performance.now()
      } else if (!returningRef.current && (returnStart !== null || (!enteringRef.current && entryStart !== null))) {
        stepParticleEntry(particles, 0, target)
        for (const particle of particles) {
          particle.vx = 0
          particle.vy = 0
          particle.flight = 0
        }
        entryStart = null
        returnStart = null
        entryProgress = 0
      }
      if (enteringRef.current && entryStart === null && returnStart === null) {
        beginParticleEntry(particles, width, height)
        entryProgress = 0
        entryStart = performance.now()
      }
      if (canAnimate()) frame = window.requestAnimationFrame(tick)
      else if (!document.hidden) draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    if (targetRef.current) observer.observe(targetRef.current)
    const header = targetRef.current?.closest('.site-header')
    if (header) observer.observe(header)
    resize()
    syncRef.current = sync
    sync()
    document.fonts?.ready.then(() => { if (syncRef.current === sync) resize() })
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    compact.addEventListener('change', resize)
    return () => {
      window.cancelAnimationFrame(frame)
      syncRef.current = null
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
      compact.removeEventListener('change', resize)
    }
  }, [targetRef])

  // Keep the dust above the fading welcome screen in viewport coordinates.
  return createPortal(<div className="particle-background landing-particles" aria-hidden="true"><canvas ref={canvasRef} /></div>, document.body)
}
