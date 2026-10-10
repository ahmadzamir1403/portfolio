import { useCallback, useEffect, useRef, useState } from 'react'

const sections = ['projects', 'about', 'skills', 'contact']

export default function useSideScroll(active) {
  const trackRef = useRef(null)
  const [panel, setPanel] = useState(0)

  const navigate = useCallback((index, behavior) => {
    const track = trackRef.current
    if (!track) return
    const next = Math.max(0, Math.min(sections.length - 1, index))
    track.dataset.panel = String(next)
    track.scrollTo({ left: next * track.clientWidth, behavior: behavior || (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth') })
  }, [])

  useEffect(() => {
    if (!active) return
    const track = trackRef.current
    let frame = 0
    let lastWheel = 0
    let wheelDistance = 0
    let wheelDirection = 0

    function update() {
      frame = 0
      const next = Math.round(track.scrollLeft / Math.max(1, track.clientWidth))
      track.dataset.panel = String(next)
      setPanel(Math.max(0, Math.min(sections.length - 1, next)))
      if (track.contains(document.activeElement) && document.activeElement !== track && !track.children[next]?.contains(document.activeElement)) {
        track.focus({ preventScroll: true })
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    function followHash() {
      const index = sections.indexOf(window.location.hash.slice(1))
      if (index !== -1) navigate(index, 'instant')
    }
    function wheel(event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const direction = Math.sign(event.deltaY)
      if (!direction) return
      // Let long panels and the project rail scroll themselves first.
      for (let node = event.target; node && node !== track; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
          if ((direction > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 2) || (direction < 0 && node.scrollTop > 2)) return
        }
      }
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheel < 650) return
      if (direction !== wheelDirection) wheelDistance = 0
      wheelDirection = direction
      wheelDistance += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientHeight : 1)
      if (wheelDistance < 24) return
      wheelDistance = 0
      lastWheel = now
      navigate(Math.round(track.scrollLeft / track.clientWidth) + direction)
    }
    function keydown(event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return
      const key = event.key.toLowerCase()
      const direction = key === 'arrowright' || key === 'd' ? 1 : key === 'arrowleft' || key === 'a' ? -1 : 0
      if (!direction) return
      event.preventDefault()
      if (event.repeat) return
      navigate(Math.round(track.scrollLeft / track.clientWidth) + direction)
    }
    const observer = new ResizeObserver(() => {
      const index = Number(track.dataset.panel || 0)
      navigate(index, 'instant')
    })
    followHash()
    schedule()
    observer.observe(track)
    track.addEventListener('scroll', schedule, { passive: true })
    track.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', keydown)
    window.addEventListener('hashchange', followHash)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      track.removeEventListener('scroll', schedule)
      track.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('hashchange', followHash)
    }
  }, [active, navigate])

  return { trackRef, panel, navigate }
}
