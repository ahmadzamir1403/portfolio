import { useEffect, useId, useState } from 'react'
import './MoonBattle.css'

export default function MoonBattle({ paused = false }) {
  const edgeFilterId = useId().replaceAll(':', '')
  const [hidden, setHidden] = useState(() => document.hidden)
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  return (
    <>
      <svg className="battle-filter-defs" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id={edgeFilterId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feComponentTransfer in="SourceAlpha" result="solid-alpha">
              <feFuncA type="discrete" tableValues="0 0 0 1" />
            </feComponentTransfer>
            <feMorphology in="solid-alpha" operator="erode" radius="0.18" result="trimmed-alpha" />
            <feComposite in="SourceGraphic" in2="trimmed-alpha" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className={`moon-battle ${paused || hidden ? 'is-paused' : ''}`} aria-hidden="true" style={{ '--battle-edge-filter': `url(#${edgeFilterId})` }}>
        <svg className="eva-at-field" viewBox="0 0 100 100" overflow="visible">
          {Array.from({ length: 7 }, (_, i) => (
            <polygon key={i} points="50,2 84,16 98,50 84,84 50,98 16,84 2,50 16,16"
              transform={`translate(50 50) scale(${1 - i * .12}) translate(-50 -50)`} />
          ))}
        </svg>
        <i className="eva-shield-hit" />
      </div>
    </>
  )
}
