import { projects } from '../data/projects'
import { sectionItems } from '../data/sections'

export default function SectionPreview({ index }) {
  return <div className="section-preview-content">
    <div className="section-preview-heading"><span className="preview-kicker">Ahmad Zamir</span><h2>{sectionItems[index].label}</h2></div>
    {index === 0 && <div className="preview-projects">{projects.map(project => <div className="preview-project" key={project.id}><img src={project.thumbnail} alt="" width="160" height="110" /><h3>{project.title}</h3><p>{project.category}</p></div>)}</div>}
    {index === 1 && <div className="preview-about"><img src="/images/ahmad-zamir.png" alt="Ahmad Zamir" width="100" height="100" /><div><h3>About me</h3><p>I'm Ahmad, a Computer Science student at UiTM interested in data analysis and full-stack development.</p><p>I build web apps and workflow automations.</p></div></div>}
    {index === 2 && <div className="preview-skills">{[
      ['Web development', 'TypeScript · JavaScript · React · Next.js'],
      ['Data & backend', 'Python · SQL · Node.js · PostgreSQL'],
      ['Automation & tooling', 'Docker · n8n · Git · Java'],
      ['AI tools', 'Research · Coding · Problem-solving'],
    ].map(([title, detail]) => <div key={title}><h3>{title}</h3><p>{detail}</p></div>)}</div>}
    {index === 3 && <div className="preview-contact"><h3>Get in touch</h3><p>ahmadzamir1403@gmail.com</p><div className="preview-contact-channels"><span>Email me</span><span>WhatsApp</span></div></div>}
  </div>
}
