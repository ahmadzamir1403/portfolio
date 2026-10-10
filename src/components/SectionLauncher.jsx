import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import SectionNavigation from './SectionNavigation'
import { sectionItems } from '../data/sections'
import WelcomeSky from './WelcomeSky'
import SectionPreview from './SectionPreview'
import './SectionLauncher.css'

export default function SectionLauncher({ active = true, portraitRef, dockRef, paused, onNavigate, onFinish, onBack }) {
  const launcherRef = useRef(null)
  const openingRef = useRef(false)
  const previewRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [selection, setSelection] = useState(null)

  useLayoutEffect(() => {
    const portrait = portraitRef.current
    const destination = dockRef.current
    if (!portrait || !destination) return
    // Measure the real page portrait so the menu and its ring dock in one place.
    function alignPortrait() {
      const rect = destination.getBoundingClientRect()
      Object.assign(portrait.style, {
        left: rect.left + 'px', top: rect.top + 'px', right: 'auto',
        width: rect.width + 'px', height: rect.height + 'px',
      })
    }
    alignPortrait()
    const observer = new ResizeObserver(alignPortrait)
    observer.observe(destination)
    const header = destination.closest('.site-header')
    if (header) observer.observe(header)
    window.addEventListener('resize', alignPortrait)
    let mounted = true
    document.fonts?.ready.then(() => { if (mounted) alignPortrait() })
    return () => {
      mounted = false
      observer.disconnect()
      window.removeEventListener('resize', alignPortrait)
    }
  }, [portraitRef, dockRef])

  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    launcherRef.current.querySelector('.section-menu a')?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = previous }
  }, [active])

  useEffect(() => {
    if (!selection) return
    const timer = window.setTimeout(onFinish, 1400)
    return () => window.clearTimeout(timer)
  }, [selection, onFinish])

  function choose(event, index) {
    event.preventDefault()
    if (openingRef.current) return
    openingRef.current = true
    const rect = previewRef.current.getBoundingClientRect()
    setPreview(index)
    onNavigate(event, index)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onFinish()
      return
    }
    setSelection({ index, x: rect.left, y: rect.top, width: rect.width, height: rect.height,
      dx: window.innerWidth / 2 - rect.left - rect.width / 2,
      dy: window.innerHeight / 2 - rect.top - rect.height / 2 })
  }

  return <section ref={launcherRef} className={`section-launcher ${selection ? 'is-opening' : ''}`} inert={!active} aria-hidden={!active} style={{ visibility: active ? 'visible' : 'hidden' }} aria-label="Choose a portfolio section">
    <WelcomeSky paused={paused || !active || Boolean(selection)} />
    <div ref={portraitRef} aria-hidden="true" className="portrait-frame launcher-portrait"><img className="intro-portrait" src="/images/ahmad-zamir.png" alt="Ahmad Zamir" width="48" height="48" /></div>
    <span className="launcher-brand" aria-hidden="true">az /</span>
    <button className="launcher-back" type="button" onClick={() => { setPreview(null); onBack() }} disabled={Boolean(selection)}>← Landing</button>
    <div className="launcher-layout">
      <SectionNavigation panel={selection?.index ?? -1} active={active && !selection} disabled={Boolean(selection)} onNavigate={choose} onPreview={setPreview} onPreviewEnd={() => setPreview(null)} previewIndex={preview} />
      <div ref={previewRef} className={`launcher-preview ${preview === null ? 'is-empty' : ''}`} id="section-preview" role="region" aria-hidden={preview === null} aria-label={preview === null ? undefined : sectionItems[preview].label + ' preview'}>
        {preview !== null && <><div key={preview} className="launcher-preview-page"><SectionPreview index={preview} /></div>
        <span className="launcher-preview-caption">{sectionItems[preview].label} preview</span></>}
      </div>
      <span className="sr-only" role="status">{preview !== null ? `Previewing ${sectionItems[preview].label}. Select its icon to open the full section.` : ''}</span>
    </div>
    {selection && <div className="launcher-flight launcher-preview-flight" aria-hidden="true" style={{
      left: selection.x, top: selection.y, width: selection.width, height: selection.height,
      '--menu-zoom-x': selection.dx + 'px', '--menu-zoom-y': selection.dy + 'px',
    }}>
      <SectionPreview index={selection.index} />
    </div>}
  </section>
}
