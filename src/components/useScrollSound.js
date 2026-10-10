import { useCallback, useEffect, useRef, useState } from 'react'

export default function useScrollSound(active) {
  const [enabled, setEnabled] = useState(true)
  const contextRef = useRef(null)
  const lastSound = useRef(0)

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
    if (!active || !enabled || document.hidden || context?.state !== 'running' || now - lastSound.current < 240) return
    lastSound.current = now
    const start = context.currentTime
    // A clear high resonance and quickly fading upper modes suggest a light glass clink.
    for (const [frequency, volume, decay] of [[2640, .018, .32], [4039, .007, .18], [6494, .003, .075]]) {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      envelope.gain.setValueAtTime(0, start)
      envelope.gain.linearRampToValueAtTime(volume, start + .0015)
      envelope.gain.exponentialRampToValueAtTime(.0001, start + decay)
      oscillator.connect(envelope)
      envelope.connect(context.destination)
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
      oscillator.start(start)
      oscillator.stop(start + decay + .01)
    }
  }, [active, enabled])

  return { enabled, toggle: () => setEnabled(value => !value), play }
}
