import { useEffect, useRef } from 'react'
import './SectionNavigation.css'

import { sectionItems } from '../data/sections'

export function SectionIcon({ index }) {
  return <span className="section-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={sectionItems[index].path} /></svg></span>
}

export default function SectionNavigation({ panel, onNavigate, active, disabled = false, onPreview, onPreviewEnd, previewIndex }) {
  const menuRef = useRef(null)
  const linksRef = useRef([])

  useEffect(() => {
    if (!active) return
    const menu = menuRef.current
    const link = linksRef.current[Math.max(0, panel)]
    const reveal = () => menu.scrollTo({
      left: link.offsetLeft - menu.offsetLeft - (menu.clientWidth - link.offsetWidth) / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
    reveal()
    const observer = new ResizeObserver(reveal)
    observer.observe(menu)
    return () => observer.disconnect()
  }, [panel, active])

  function moveFocus(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    let next
    if (event.key === 'ArrowRight') next = (index + 1) % sectionItems.length
    if (event.key === 'ArrowLeft') next = (index - 1 + sectionItems.length) % sectionItems.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = sectionItems.length - 1
    if (next === undefined) return
    event.preventDefault()
    event.stopPropagation()
    linksRef.current[next].focus({ preventScroll: true })
    const menu = menuRef.current
    const link = linksRef.current[next]
    menu.scrollTo({ left: link.offsetLeft - menu.offsetLeft - (menu.clientWidth - link.offsetWidth) / 2, behavior: 'instant' })
  }

  return <nav ref={menuRef} className="section-menu" aria-label="Main navigation" inert={disabled}>
    {sectionItems.map((section, index) => <a
      key={section.hash}
      ref={element => { linksRef.current[index] = element }}
      className={`section-menu-link ${panel === index ? 'is-active' : ''} ${previewIndex === index ? 'is-previewed' : ''}`}
      aria-current={panel === index ? 'page' : undefined}
      href={'#' + section.hash}
      onPointerEnter={event => { if (event.pointerType === 'mouse') onPreview?.(index) }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') onPreviewEnd?.() }}
      onClick={event => onNavigate(event, index)}
      onKeyDown={event => moveFocus(event, index)}
    >
      <SectionIcon index={index} />
      <span>{section.label}</span>
    </a>)}
  </nav>
}
