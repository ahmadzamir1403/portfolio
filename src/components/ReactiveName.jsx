import './ReactiveName.css'

export default function ReactiveName({ id, onActivate }) {
  function reactToPointer(event) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const element = event.currentTarget
    const bounds = element.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    element.style.setProperty('--name-x', x * 100 + '%')
    element.style.setProperty('--name-y', y * 100 + '%')
    element.style.setProperty('--name-tilt-x', (0.5 - y) * 5 + 'deg')
    element.style.setProperty('--name-tilt-y', (x - 0.5) * 5 + 'deg')
  }
  function resetPointer(event) {
    event.currentTarget.style.setProperty('--name-tilt-x', '0deg')
    event.currentTarget.style.setProperty('--name-tilt-y', '0deg')
  }
  const wordmark = <span className="name-wordmark"><span className="name-text">Ahmad Zamir</span><span className="name-dot">.</span></span>
  return <h1 id={id} className="reactive-name" onPointerMove={reactToPointer} onPointerLeave={resetPointer} onPointerCancel={resetPointer}>
    {onActivate ? <button className="name-trigger" type="button" onClick={onActivate} aria-label="Enter Ahmad Zamir's portfolio">{wordmark}</button> : wordmark}
  </h1>
}
