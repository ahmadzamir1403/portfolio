import { useCallback, useEffect, useRef, useState } from 'react'

export default function useClickSound() {
  const [enabled, setEnabled] = useState(true)
  const contextRef = useRef(null)
  const enabledRef = useRef(true)

  const unlock = useCallback(() => {
    if (!enabledRef.current) return null
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return null
    try {
      contextRef.current ??= new AudioContext()
      if (contextRef.current.state === 'suspended') contextRef.current.resume().catch(() => {})
      return contextRef.current
    } catch { return null }
  }, [])

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
    if (!enabledRef.current || document.hidden) return
    const context = unlock()
    if (!context) return
    function strike() {
      if (!enabledRef.current || document.hidden || context.state !== 'running') return
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
    }
    if (context.state === 'running') strike()
    else if (context.state === 'suspended') context.resume().then(strike).catch(() => {})
  }, [unlock])

  useEffect(() => {
    // Capture once per actual click, including touch and keyboard activation.
    window.addEventListener('click', play, { capture: true })
    return () => window.removeEventListener('click', play, { capture: true })
  }, [play])

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current
    setEnabled(enabledRef.current)
  }, [])

  return { enabled, toggle }
}
