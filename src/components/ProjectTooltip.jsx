import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ProjectTooltip({ project, anchorRef, index, onEnter, onLeave, onClose }) {
  const tooltipRef = useRef(null)
  const [position, setPosition] = useState(null)

  useLayoutEffect(() => {
    const anchor = anchorRef.current[index]
    if (!anchor || !tooltipRef.current) return
    const rect = anchor.getBoundingClientRect()
    const tooltip = tooltipRef.current.getBoundingClientRect()
    const left = Math.max(12, Math.min(window.innerWidth - tooltip.width - 12, rect.left))
    const below = rect.bottom + 12
    const top = below + tooltip.height < window.innerHeight - 12 ? below : Math.max(12, rect.top - tooltip.height - 12)
    setPosition({ left, top })
    const dismiss = event => { if (event.key === 'Escape') { event.stopPropagation(); onClose() } }
    window.addEventListener('keydown', dismiss, true)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('keydown', dismiss, true)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [anchorRef, index, onClose])

  return createPortal(<div ref={tooltipRef} id={`preview-${project.id}`} role="tooltip" className="project-tooltip" style={{ ...position, visibility: position ? 'visible' : 'hidden' }} onPointerEnter={onEnter} onPointerLeave={onLeave}>
    <p className="eyebrow">{project.category}</p>
    <h3>{project.title}</h3>
    <p>{project.description}</p>
    <ul className="tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
    <p className="tooltip-detail">{project.detail}</p>
    <span className="tooltip-hint">Select to explore this project</span>
  </div>, document.body)
}
