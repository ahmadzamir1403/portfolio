import { useEffect, useRef, useState } from 'react'
import LandingParticles from './LandingParticles'
import ReactiveName from './ReactiveName'
import WelcomeSky from './WelcomeSky'
import './WelcomeScreen.css'

export default function WelcomeScreen({ paused, entryTargetRef, onToggleMotion, onEnter, onPrepareEnter }) {
  const [leaving, setLeaving] = useState(false)
  const enterRef = useRef(null)
  const portraitRef = useRef(null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    enterRef.current?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = previous }
  }, [])

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(onEnter, 900)
    return () => window.clearTimeout(timer)
  }, [leaving, onEnter])

  function enter() {
    if (leaving) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onEnter()
    else {
      onPrepareEnter?.(portraitRef.current?.getBoundingClientRect())
      setLeaving(true)
    }
  }

  return <section className={`welcome-screen ${leaving ? 'is-leaving' : ''}`} aria-label="Welcome to Ahmad Zamir's portfolio">
    <LandingParticles paused={paused} entering={leaving} targetRef={entryTargetRef} />
    <WelcomeSky paused={paused || leaving} />
    <div className="welcome-top"><span className="welcome-brand" aria-hidden="true">az /</span></div>
    <button className="welcome-motion" type="button" onClick={onToggleMotion} aria-label={paused ? 'Play background animation' : 'Pause background animation'}>{paused ? 'Play ambience' : 'Pause ambience'}</button>
    <div className="welcome-identity">
      <div ref={portraitRef} className="portrait-frame welcome-portrait"><img className="intro-portrait" src="/images/ahmad-zamir.png" alt="Ahmad Zamir" width="160" height="160" fetchPriority="high" /></div>
      
      
      <ReactiveName onActivate={enter} />
      <p className="welcome-subtitle">Computer Science student at UiTM.</p>
    </div>
    <button ref={enterRef} className="welcome-enter" type="button" onClick={enter} aria-label="Enter Ahmad Zamir's portfolio" aria-disabled={leaving}>
      <span className="welcome-prompt"><span className="welcome-enter-label">Press anywhere to enter</span></span>
    </button>
    
  </section>
}
