import MoonBattle from './MoonBattle'
import './WelcomeSky.css'

const stars = Array.from({ length: 44 }, (_, index) => ({
  x: (index * 211 + 97) % 1600,
  y: (index * 67 + 31) % 350,
  size: index % 9 === 0 ? 1.7 : 0.7 + (index % 3) * 0.3,
  opacity: 0.2 + (index % 5) * 0.1,
}))

export default function WelcomeSky({ paused = false }) {
  return <div className="welcome-space" aria-hidden="true">
    <div className="space-nebula" />
    <svg className="space-starfield" viewBox="0 0 1600 400" fill="none" preserveAspectRatio="xMidYMid slice">
      <defs><radialGradient id="sky-star-glow"><stop stopColor="#b6eaff" stopOpacity=".4" /><stop offset="1" stopColor="#b6eaff" stopOpacity="0" /></radialGradient></defs>
      {stars.map((star, index) => <g key={index} opacity={star.opacity}>
        {star.size > 1.5 && <circle cx={star.x} cy={star.y} r="11" fill="url(#sky-star-glow)" />}
        <circle cx={star.x} cy={star.y} r={star.size} fill="#d3efff" />
      </g>)}
      <g stroke="#a3dcff" strokeWidth=".7" opacity=".15">
        <path d="m230 155 75-48 72 28 58-58 65 38" />
        <path d="m305 107 29 87 43-59" />
      </g>
      <g fill="#d6efff" opacity=".7">
        {[[230,155],[305,107],[377,135],[435,77],[500,115],[334,194]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="1.8" />)}
      </g>
      <path d="M-100 320Q700-110 1700 90" stroke="#9fdfff" strokeOpacity=".08" />
      <path d="M-100 348Q700-40 1700 130" stroke="#9fdfff" strokeOpacity=".05" />
      <g stroke="#d7f5ff" strokeLinecap="round" opacity=".65">
        <path d="M623 61v8m-4-4h8M877 172v6m-3-3h6M1390 260v8m-4-4h8" />
      </g>
    </svg>
    <div className="space-moon"><img src="/images/moon.png" width="512" height="512" alt="" draggable="false" /><MoonBattle paused={paused} /></div>
  </div>
}
