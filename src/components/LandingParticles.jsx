import { useEffect, useRef } from 'react'
import { createParticleLine, scatterParticleLine, stepParticleLine } from './landingParticleMotion'
import './ParticleBackground.css'

export default function LandingParticles({ paused }) {
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
    const screen = canvas.closest('.welcome-screen')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let particles = []
    let width = 0
    let height = 0
    let frame = 0
    let previous = 0
    let lastDraw = 0
    let elapsed = 0
    const canAnimate = () => !pausedRef.current && !motion.matches && !document.hidden

    function settle() {
      for (const particle of particles) {
        particle.x = particle.homeX
        particle.y = particle.homeY
        particle.vx = 0
        particle.vy = 0
        particle.flight = 0
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        const opacity = (.24 + particle.depth * .5) * (.8 + Math.sin(elapsed * .6 + particle.phase) * .2)
        const color = particle.depth > .96 ? '244, 225, 188' : particle.depth > .65 ? '208, 179, 133' : '177, 145, 103'
        context.fillStyle = 'rgba(' + color + ',' + opacity + ')'
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      }
    }
    function resize() {
      const oldWidth = width
      const oldHeight = height
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const next = createParticleLine(width < 640 ? 230 : 420, width, height, { scattered: !particles.length && !pausedRef.current && !motion.matches })
      if (particles.length && oldWidth && oldHeight) {
        // Keep the entrance in progress when layout or device orientation changes.
        next.forEach((particle, index) => {
          const previous = particles[Math.floor(index * particles.length / next.length)]
          particle.homeX = previous.homeX * width / oldWidth
          particle.homeY = previous.homeY * height / oldHeight
          particle.spreadY = previous.spreadY * height / oldHeight
          particle.phase = previous.phase
          particle.x = previous.x * width / oldWidth
          particle.y = previous.y * height / oldHeight
          particle.vx = previous.vx * width / oldWidth
          particle.vy = previous.vy * height / oldHeight
          particle.flight = previous.flight
        })
      }
      particles = next
      if (motion.matches) settle()
      draw()
    }
    function tick(now) {
      if (!canAnimate()) { frame = 0; return }
      if (now - lastDraw >= 1000 / 30) {
        const delta = previous ? Math.min((now - previous) / 1000, .05) : 0
        previous = now
        lastDraw = now
        elapsed += delta
        stepParticleLine(particles, delta, elapsed)
        draw()
      }
      frame = window.requestAnimationFrame(tick)
    }
    function scatter(event) {
      if (!canAnimate() || event.button !== 0) return
      if (event.target.closest('.welcome-motion')) return
      const bounds = canvas.getBoundingClientRect()
      scatterParticleLine(particles, event.detail === 0 ? width / 2 : event.clientX - bounds.left, event.detail === 0 ? height / 2 : event.clientY - bounds.top)
    }
    function sync() {
      window.cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      lastDraw = 0
      if (motion.matches) settle()
      if (canAnimate()) frame = window.requestAnimationFrame(tick)
      else if (!document.hidden) draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    syncRef.current = sync
    sync()
    screen.addEventListener('click', scatter)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    return () => {
      window.cancelAnimationFrame(frame)
      syncRef.current = null
      observer.disconnect()
      screen.removeEventListener('click', scatter)
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [])

  return <div className="particle-background landing-particles" aria-hidden="true"><canvas ref={canvasRef} /></div>
}
