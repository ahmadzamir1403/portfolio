import { useCallback, useEffect, useRef, useState } from 'react'
import { github, projects } from './data/projects'
import './App.css'
import ParticleBackground from './components/ParticleBackground'
import WelcomeScreen from './components/WelcomeScreen'
import ReactiveName from './components/ReactiveName'
import ScrollSpace from './components/ScrollSpace'

const linkedin = 'https://www.linkedin.com/in/ahmad-zamir-823105232'
const email = 'https://mail.google.com/mail/?view=cm&fs=1&to=ahmadzamir1403%40gmail.com'

function ProjectArt({ project, small = false }) {
  return <div className={`project-art art-${project.theme} project-art-${project.id} ${small ? 'art-small thumbnail-art' : 'featured-illustration'}`} aria-hidden="true">
    <img src={small ? project.thumbnail : project.artwork} alt="" width="320" height="256" draggable="false" />
  </div>
}

function ProjectGallery({ project }) {
  const [selected, setSelected] = useState(0)
  const screenshot = project.screenshots[selected]
  function step(direction) {
    setSelected(index => (index + direction + project.screenshots.length) % project.screenshots.length)
  }
  return <div className="project-gallery" role="region" aria-label={`${project.title} screenshot gallery`} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      step(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }}>
    <div className="gallery-stage">
      <a className="gallery-preview" href={screenshot.src} target="_blank" rel="noreferrer" aria-label={`Open ${screenshot.label} screenshot in full size`}>
        {project.screenshots.map((item, index) => <img key={item.src} className={`gallery-slide ${index === selected ? 'is-active' : ''}`} src={item.src} alt={`${project.title}: ${item.label}`} aria-hidden={index !== selected} width="1920" height="980" draggable="false" />)}
      </a>
      <button className="gallery-arrow gallery-arrow-prev" type="button" aria-label="Previous screenshot" onClick={() => step(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
      </button>
      <button className="gallery-arrow gallery-arrow-next" type="button" aria-label="Next screenshot" onClick={() => step(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
      </button>
      <span className="gallery-count" aria-hidden="true">{selected + 1} / {project.screenshots.length}</span>
    </div>
    <p className="sr-only" role="status">{screenshot.label}, screenshot {selected + 1} of {project.screenshots.length}</p>
    <div className="gallery-options" role="group" aria-label={`${project.title} screenshots`}>
      {project.screenshots.map((item, index) => <button type="button" key={item.src} aria-pressed={selected === index} onClick={() => setSelected(index)}>
        <img src={item.src} alt="" width="192" height="98" loading="lazy" />
        <span>{item.label}</span>
      </button>)}
    </div>
  </div>
}

export default function App() {
  const [selected, setSelected] = useState(0)
  const [launch, setLaunch] = useState(null)
  const [hasSelectedProject, setHasSelectedProject] = useState(false)
  const launchSequence = useRef(0)
  const [ambiencePaused, setAmbiencePaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [entered, setEntered] = useState(() => Boolean(window.location.hash))
  const mainRef = useRef(null)
  const featuredArtRef = useRef(null)
  const enteredFromWelcome = useRef(false)
  const enterPortfolio = useCallback(() => {
    enteredFromWelcome.current = true
    setEntered(true)
  }, [])
  useEffect(() => {
    if (entered && enteredFromWelcome.current) mainRef.current?.focus({ preventScroll: true })
  }, [entered])
  const tiles = useRef([])
  const project = projects[selected]
  useEffect(() => {
    if (!launch) return
    const cancel = () => setLaunch(null)
    const timeout = window.setTimeout(cancel, 700)
    window.addEventListener('resize', cancel)
    window.addEventListener('scroll', cancel, true)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('resize', cancel)
      window.removeEventListener('scroll', cancel, true)
    }
  }, [launch])
  function selectProject(index, cinematic = true) {
    if (index === selected) return
    setSelected(index)
    setHasSelectedProject(true)
    setLaunch(null)
    ++launchSequence.current
    if (!cinematic || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = tiles.current[index]?.firstElementChild.getBoundingClientRect()
    const destination = featuredArtRef.current?.getBoundingClientRect()
    if (!rect || !destination) return
    const scale = Math.min(2.1, destination.width * .7 / rect.width, (window.innerHeight - 48) / rect.height)
    const halfHeight = rect.height * scale / 2
    const targetY = Math.max(halfHeight + 24, Math.min(window.innerHeight - halfHeight - 24, destination.top + destination.height / 2))
    setLaunch({
      id: launchSequence.current,
      index,
      x: rect.left + rect.width / 2 - window.innerWidth / 2,
      y: rect.top + rect.height / 2 - window.innerHeight / 2,
      width: rect.width,
      height: rect.height,
      targetX: destination.left + destination.width / 2 - window.innerWidth / 2,
      targetY: targetY - window.innerHeight / 2,
      scale,
    })
  }
  function navigateProjects(event, index) {
    let next
    if (event.key === 'ArrowRight') next = (index + 1) % projects.length
    if (event.key === 'ArrowLeft') next = (index - 1 + projects.length) % projects.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = projects.length - 1
    if (next !== undefined) {
      event.preventDefault()
      selectProject(next, false)
      tiles.current[next]?.focus({ preventScroll: true })
      tiles.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }
  return <>
    {!entered && <WelcomeScreen paused={ambiencePaused} onToggleMotion={() => setAmbiencePaused(value => !value)} onEnter={enterPortfolio} />}
    <div inert={!entered} aria-hidden={!entered}>
    {launch && <div key={launch.id} className="project-launch" aria-hidden="true" onAnimationEnd={event => { if (event.target === event.currentTarget) setLaunch(null) }}>
      <div className="project-launch-tile" style={{ '--launch-x': `${launch.x}px`, '--launch-y': `${launch.y}px`, '--launch-width': `${launch.width}px`, '--launch-height': `${launch.height}px`, '--launch-target-x': `${launch.targetX}px`, '--launch-target-y': `${launch.targetY}px`, '--launch-scale': launch.scale }}>
        <ProjectArt project={projects[launch.index]} small />
      </div>
    </div>}
    <a className="skip-link" href="#main">Skip to content</a>
    <div className={`console theme-${project.theme}`} id="top">
      <ScrollSpace active={entered} paused={ambiencePaused} />
      <div className="ambient" aria-hidden="true" />
      <ParticleBackground paused={!entered || ambiencePaused} />
      <header className="site-header shell">
        <a href="#top" className="brand" aria-label="Ahmad Zamir home">az<span> / </span></a>
        <nav aria-label="Main navigation"><a className="nav-work" href="#projects">Work</a><a href="#about">About</a><a href="#skills">Skills</a><a href="#contact">Contact</a></nav>
        <div className="header-contact-card">
        <nav className="header-socials" aria-label="Social and contact links"><a href={github} target="_blank" rel="noreferrer">GitHub</a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={email} target="_blank" rel="noreferrer">Email</a><a href="https://wa.me/60132418482" target="_blank" rel="noreferrer">WhatsApp</a></nav>
        <button className="ambient-toggle" type="button" onClick={() => setAmbiencePaused(value => !value)} aria-label={ambiencePaused ? 'Play background animation' : 'Pause background animation'} title={ambiencePaused ? 'Play background animation' : 'Pause background animation'}>
          <svg viewBox="0 0 12 12" aria-hidden="true">{ambiencePaused ? <path d="M3 1.5 10 6 3 10.5Z" /> : <path d="M2.5 2h2v8h-2zm5 0h2v8h-2z" />}</svg>
        </button>
        </div>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        <section className="intro shell" aria-labelledby="intro-title">
          <div className="portrait-frame"><img className="intro-portrait" src="/images/ahmad-zamir.png" alt="Ahmad Zamir" width="160" height="160" fetchPriority="high" /></div>
          <div className="intro-identity">
            <ReactiveName id="intro-title" />
            <p className="intro-description">Computer Science student at UiTM.</p>
          </div>
        </section>
        <section id="projects" className="work shell" aria-labelledby="work-title">
          <div className="section-heading"><h2 id="work-title">Selected work</h2><span className="section-counter">0{selected + 1} <span>/ 0{projects.length}</span></span></div>
          <div className="project-rail" role="group" aria-label="Choose a featured project">
            {projects.map((item, index) => <button key={item.id} ref={el => { tiles.current[index] = el }} className={`project-tile ${index === selected ? 'is-selected' : ''}`} aria-pressed={index === selected} aria-controls="project-details" onClick={() => selectProject(index)} onKeyDown={event => navigateProjects(event, index)}>
              <ProjectArt project={item} small /><span className="tile-title">{item.title}</span>
            </button>)}
            <a className="all-work" href={github + '?tab=repositories'} target="_blank" rel="noreferrer"><span>More on GitHub</span></a>
          </div>
          <div className={`featured ${hasSelectedProject ? 'project-entering' : ''}`} id="project-details">
            <div className="featured-copy" key={project.id}>
              <p className="eyebrow"><span className="tiny-line" />{project.category}</p>
              <h3>{project.title}</h3><p className="project-description">{project.description}</p>
              <ul className="tags" aria-label="Technologies">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              <a className="button" href={project.url || github + '/' + project.id} target={project.url?.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">{project.actionLabel || 'View on GitHub'}</a>
              
            </div>
            <div ref={featuredArtRef} className={`featured-art ${project.screenshots ? 'has-gallery' : ''}`} key={project.id + '-art'}>{project.screenshots ? <ProjectGallery project={project} /> : <ProjectArt project={project} />}</div>
          </div>
          <p className="sr-only" role="status">Selected project: {project.title}</p>
          
        </section>
        <section id="about" className="about shell section-block" aria-labelledby="about-title">
          <div><h2 id="about-title">About me</h2></div>
          <div className="about-copy"><p>I'm Ahmad, a Computer Science student at UiTM interested in data analysis and full-stack development.</p><p>I build web apps and workflow automations, including a résumé screening tool for my final-year project and an internship logbook. I enjoy working with data and building tools that make everyday tasks easier.</p><p>I’m proficient with AI tools for research, coding, and problem-solving, using them to explore ideas and improve my workflow.</p><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn</a></div>
        </section>
        <section id="skills" className="shell section-block skills" aria-labelledby="skills-title">
          <div className="skills-heading"><h2 id="skills-title">Skills</h2></div>
          <div className="skill-grid">{[
            ['01', 'Web development', 'TypeScript · JavaScript', 'React · Next.js · HTML · CSS'],
            ['02', 'Data & backend', 'Python · SQL', 'Node.js · PostgreSQL · Supabase'],
            ['03', 'Automation & tooling', 'Docker · n8n', 'Git · CI/CD · Java'],
            ['04', 'AI tools', 'Research · Coding · Problem-solving', 'Proficient in AI-assisted workflows'],
          ].map(([, title, primary, secondary]) => <article className="skill-card" key={title}><h3>{title}</h3><p>{primary}</p><span>{secondary}</span></article>)}</div>
        </section>
        <section id="contact" className="contact shell section-block" aria-labelledby="contact-title"><div className="contact-panel"><div><h2 id="contact-title">Get in touch</h2><a className="contact-address" href={email} target="_blank" rel="noreferrer">ahmadzamir1403@gmail.com</a></div><div className="contact-actions"><a className="button" href={email} target="_blank" rel="noreferrer">Email me</a><a className="button contact-whatsapp" href="https://wa.me/60132418482" target="_blank" rel="noreferrer">WhatsApp</a></div></div></section>
      </main>
      <footer className="shell footer"><span>© {new Date().getFullYear()} Ahmad Zamir</span><a href="#top">Back to top</a></footer>
    </div>
    </div>
  </>
}
