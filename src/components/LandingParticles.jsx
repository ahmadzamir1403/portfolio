import { useEffect, useRef } from 'react'
import { createParticleLine, stepParticleLine } from './landingParticleMotion'
import './ParticleBackground.css'

const colors = ['244, 225, 188', '208, 179, 133', '177, 145, 103']

export default function LandingParticles({ paused, targetRef }) {
  const canvasRef = useRef(null)
  const pausedRef = useRef(paused)
  const syncRef = useRef(null)

  useEffect(() => {
    pausedRef.current = paused
    syncRef.current?.()
  }, [paused])

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
    let target = { x: 0, y: 0 }
    let particles = []
    let width = 0
    let height = 0
    let frame = 0
    let previous = 0
    let lastDraw = 0
    let elapsed = 0
    const canAnimate = () => !pausedRef.current && !motion.matches && !document.hidden

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
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) return
      const bounds = canvas.getBoundingClientRect()
      const portrait = targetRef.current?.getBoundingClientRect()
      target = portrait ? { x: portrait.left + portrait.width / 2 - bounds.left, y: portrait.top + portrait.height / 2 - bounds.top } : { x: width / 2, y: height * .35 }
      const ratio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1 : 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const next = createParticleLine(compact.matches ? 160 : 460, width, height, target)
      next.forEach((particle, index) => {
        if (particles[index]) particle.progress = particles[index].progress
      })
      particles = next
      stepParticleLine(particles, 0, elapsed, width, height, target)
      draw()
    }
    function tick(now) {
      if (!canAnimate()) { frame = 0; return }
      if (now - lastDraw >= 1000 / (compact.matches ? 24 : 30)) {
        const delta = previous ? Math.min((now - previous) / 1000, .05) : 0
        previous = now
        lastDraw = now
        elapsed += delta
        stepParticleLine(particles, delta, elapsed, width, height, target)
        draw()
      }
      frame = window.requestAnimationFrame(tick)
    }
    function sync() {
      window.cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      lastDraw = 0
      if (canAnimate()) frame = window.requestAnimationFrame(tick)
      else if (!document.hidden) draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    if (targetRef.current) observer.observe(targetRef.current)
    const identity = targetRef.current?.parentElement
    if (identity) observer.observe(identity)
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

  return <div className="particle-background landing-particles" aria-hidden="true"><canvas ref={canvasRef} /></div>
}
