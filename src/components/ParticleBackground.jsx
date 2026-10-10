import { useEffect, useRef } from 'react'
import './ParticleBackground.css'

// Seeded positions keep the atmosphere stable across project changes.
function createParticles(count) {
  let seed = 721
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  return Array.from({ length: count }, () => ({
    x: random(), y: random(), radius: 0.6 + random() * 1.7,
    depth: random(), phase: random() * Math.PI * 2,
    speed: 0.006 + random() * 0.012, warm: random() > 0.72, offsetX: 0, offsetY: 0,
  }))
}

export default function ParticleBackground({ paused }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compact = window.matchMedia('(max-width: 640px), (pointer: coarse)')
    let particles = createParticles(compact.matches ? 20 : 82)
    let width = 0
    let height = 0
    let frame = 0
    let elapsed = 0
    let previous = 0
    let lastDraw = 0
    let bounds = canvas.getBoundingClientRect()
    const pointer = { x: 0, y: 0, active: false }
    const follow = { x: 0, y: 0, strength: 0, parallaxX: 0, parallaxY: 0 }
    const backdrop = canvas.parentElement
    const canAnimate = () => !paused && !motion.matches && !document.hidden

    function draw() {
      if (!width || !height) return
      context.clearRect(0, 0, width, height)
      const time = elapsed / 1000
      const interactive = canAnimate() && !compact.matches && pointer.active
      follow.x += (pointer.x - follow.x) * 0.075
      follow.y += (pointer.y - follow.y) * 0.12
      follow.strength += ((interactive ? 1 : 0) - follow.strength) * 0.09
      const targetX = interactive ? (pointer.x / width - 0.5) * 30 : 0
      const targetY = interactive ? (pointer.y / height - 0.5) * 22 : 0
      follow.parallaxX += (targetX - follow.parallaxX) * 0.06
      follow.parallaxY += (targetY - follow.parallaxY) * 0.06
      if (!compact.matches) {
        backdrop.style.setProperty('--parallax-x', follow.parallaxX + 'px')
        backdrop.style.setProperty('--parallax-y', follow.parallaxY + 'px')
        backdrop.style.setProperty('--pointer-x', follow.x + 'px')
        backdrop.style.setProperty('--pointer-y', follow.y + 'px')
        backdrop.style.setProperty('--pointer-opacity', follow.strength.toFixed(3))
      }
      for (const particle of particles) {
        let x = (particle.x * width + Math.sin(time * 0.09 + particle.phase) * (10 + particle.depth * 20) + width) % width
        let y = ((particle.y - time * particle.speed * 0.04) % 1 + 1) % 1 * height
        x += follow.parallaxX * (0.3 + particle.depth)
        y += follow.parallaxY * (0.3 + particle.depth)
        const dx = x - follow.x
        const dy = y - follow.y
        const distance = Math.hypot(dx, dy)
        const influence = Math.max(0, 1 - distance / 175) ** 2 * follow.strength
        const push = influence * (18 + particle.depth * 20)
        particle.offsetX += (dx / Math.max(distance, 1) * push - particle.offsetX) * 0.1
        particle.offsetY += (dy / Math.max(distance, 1) * push - particle.offsetY) * 0.1
        x += particle.offsetX
        y += particle.offsetY
        const shimmer = 0.7 + Math.sin(time * 0.55 + particle.phase) * 0.3
        // A quiet left side keeps the main text clear. More light lives on the right.
        const edgeFade = Math.min(1, y / 90, (height - y) / 150)
        const opacity = (0.14 + particle.depth * 0.42 + influence * 0.14) * shimmer * Math.max(0, edgeFade) * (x < width * 0.42 ? 0.5 : 1)
        const color = particle.warm ? '197, 161, 108' : '151, 123, 83'
        const radius = particle.radius * (0.6 + particle.depth)
        if (!compact.matches && particle.depth > 0.62) {
          const glow = context.createRadialGradient(x, y, 0, x, y, radius * 6)
          glow.addColorStop(0, 'rgba(' + color + ',' + opacity * 0.24 + ')')
          glow.addColorStop(1, 'rgba(' + color + ',0)')
          context.fillStyle = glow
          context.beginPath()
          context.arc(x, y, radius * 6, 0, Math.PI * 2)
          context.fill()
        }
        context.fillStyle = 'rgba(' + color + ',' + opacity + ')'
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()
      }
    }
    function resize() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1 : 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (width && height) draw()
    }
    function tick(now) {
      if (!canAnimate()) { frame = 0; return }
      if (previous) elapsed += Math.min(now - previous, 100)
      previous = now
      if (now - lastDraw >= 1000 / (compact.matches ? 24 : 30)) { draw(); lastDraw = now }
      frame = window.requestAnimationFrame(tick)
    }
    function movePointer(event) {
      if (!canAnimate() || compact.matches || event.isPrimary === false) return
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (x < 0 || x > width || y < 0 || y > height) { pointer.active = false; return }
      if (!pointer.active) { follow.x = x; follow.y = y }
      pointer.x = x
      pointer.y = y
      pointer.active = true
    }
    function startTouch(event) { if (event.pointerType === 'touch') movePointer(event) }
    function resetPointer() { pointer.active = false }
    function releasePointer(event) { if (event.pointerType !== 'mouse') resetPointer() }
    function leaveWindow(event) { if (!event.relatedTarget) resetPointer() }
    function updateBounds() { bounds = canvas.getBoundingClientRect(); resetPointer() }
    function sync() {
      window.cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      resetPointer()
      if (!canAnimate()) {
        follow.strength = 0
        follow.parallaxX = 0
        follow.parallaxY = 0
      }
      if (canAnimate()) frame = window.requestAnimationFrame(tick)
      else if (!document.hidden && width && height) draw()
    }
    function changeDensity() {
      particles = createParticles(compact.matches ? 20 : 82)
      resize()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    sync()
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    compact.addEventListener('change', changeDensity)
    window.addEventListener('pointermove', movePointer, { passive: true })
    window.addEventListener('pointerdown', startTouch, { passive: true })
    window.addEventListener('pointerup', releasePointer, { passive: true })
    window.addEventListener('pointercancel', resetPointer)
    window.addEventListener('pointerout', leaveWindow)
    window.addEventListener('blur', resetPointer)
    window.addEventListener('scroll', updateBounds, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
      compact.removeEventListener('change', changeDensity)
      window.removeEventListener('pointermove', movePointer)
      window.removeEventListener('pointerdown', startTouch)
      window.removeEventListener('pointerup', releasePointer)
      window.removeEventListener('pointercancel', resetPointer)
      window.removeEventListener('pointerout', leaveWindow)
      window.removeEventListener('blur', resetPointer)
      window.removeEventListener('scroll', updateBounds)
    }
  }, [paused])

  return <div className={`particle-background ${paused ? 'is-paused' : ''}`} aria-hidden="true">
    <div className="reactive-light">
      <div className="light-ribbon ribbon-back" />
      <div className="light-ribbon ribbon-front" />
      <div className="horizon-light" />
    </div>
    <div className="cursor-aura" />
    <canvas ref={canvasRef} />
  </div>
}
