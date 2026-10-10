import { useEffect, useRef } from 'react'
import './ScrollSpace.css'
import MoonBattle from './MoonBattle'

const stars = Array.from({ length: 112 }, (_, index) => ({
  x: (index * 347 + 79) % 1600,
  y: (index * 173 + 43) % 1000,
  radius: index % 13 === 0 ? 1.8 : 0.65 + (index % 4) * 0.22,
  opacity: 0.2 + (index % 6) * 0.1,
}))

export default function ScrollSpace({ active, paused, trackRef }) {
  const backdropRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const backdrop = backdropRef.current
    const track = trackRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    function update() {
      frame = 0
      const range = Math.max(1, track.scrollWidth - track.clientWidth)
      const linear = Math.max(0, Math.min(1, track.scrollLeft / range))
      const progress = linear * linear * (3 - 2 * linear)
      const moon = Math.max(0, Math.min(1, (progress - 0.35) / 0.65))
      backdrop.style.setProperty('--space-progress', progress.toFixed(4))
      backdrop.style.setProperty('--moon-reveal', moon.toFixed(4))
      backdrop.style.setProperty('--battle-play-state', !paused && !motion.matches && moon > 0.05 ? 'running' : 'paused')
      backdrop.style.setProperty('--space-drift', !paused && !motion.matches ? -progress * 55 + 'px' : '0px')
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    track.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    motion.addEventListener('change', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      track.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [active, paused, trackRef])

  return <div className="scroll-space" ref={backdropRef} aria-hidden="true">
    <div className="scroll-nebula" />
    <svg className="scroll-stars" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs><radialGradient id="scroll-starlight"><stop stopColor="#e6e3de" stopOpacity=".35" /><stop offset="1" stopColor="#e6e3de" stopOpacity="0" /></radialGradient></defs>
      {stars.map((star, index) => <g key={index} opacity={star.opacity} className={index % 2 ? 'star-secondary' : undefined}>
        {star.radius > 1.5 && <circle cx={star.x} cy={star.y} r="10" fill="url(#scroll-starlight)" />}
        <circle cx={star.x} cy={star.y} r={star.radius} fill={index % 9 ? '#edebe7' : '#ddd9d2'} />
      </g>)}
    </svg>
    <div className="scroll-moon"><img className="scroll-moon-disc" src="/images/moon.png" width="512" height="512" alt="" draggable="false" /><MoonBattle paused={!active || paused} /></div>
    <div className="scroll-vignette" />
  </div>
}
