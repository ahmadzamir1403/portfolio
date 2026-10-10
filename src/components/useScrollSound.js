import { useCallback, useEffect, useRef, useState } from 'react'

export default function useScrollSound(active) {
  const [enabled, setEnabled] = useState(true)
  const contextRef = useRef(null)
  const lastScroll = useRef(-Infinity)

  const unlock = useCallback(() => {
    if (!enabled) return
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    try {
      contextRef.current ??= new AudioContext()
      if (contextRef.current.state === 'suspended') contextRef.current.resume().catch(() => {})
    } catch { /* Browsers without audio permission still support navigation. */ }
  }, [enabled])

  useEffect(() => {
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [unlock])

  useEffect(() => () => {
    contextRef.current?.close().catch(() => {})
    contextRef.current = null
  }, [])

  const play = useCallback(() => {
    const context = contextRef.current
    const now = performance.now()
    if (!active || !enabled || document.hidden || context?.state !== 'running') return
    const gap = now - lastScroll.current
    lastScroll.current = now
    // Only strike at the start of a scroll burst, including momentum and snap.
    if (gap < 220) return
    const start = context.currentTime
    // One rounded, low resonance with a short tail: a single "tung".
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(680, start)
    oscillator.frequency.exponentialRampToValueAtTime(560, start + .07)
    envelope.gain.setValueAtTime(0, start)
    envelope.gain.linearRampToValueAtTime(.045, start + .003)
    envelope.gain.exponentialRampToValueAtTime(.0001, start + .18)
    oscillator.connect(envelope)
    envelope.connect(context.destination)
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
    oscillator.start(start)
    oscillator.stop(start + .19)
  }, [active, enabled])

  return { enabled, toggle: () => setEnabled(value => !value), play }
}
