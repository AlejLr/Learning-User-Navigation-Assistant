import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getProjectBySlug } from '../content/projects'
import { slugify } from '../utils/slugify'

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined

  if (!project) {
    return (
      <main id="main-content" className="container" style={{ marginTop: '2rem' }}>
        <p>Project not found.</p>
        <Link className="btn" to="/projects">Back to Projects</Link>
      </main>
    )
  }

  return (
    <main id="main-content" className="container" style={{ marginTop: '2rem' }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden="true">›</span>{' '}
        <Link to="/projects">Projects</Link> <span aria-hidden="true">›</span>{' '}
        <span aria-current="page">{project.title}</span>
      </nav>

      <section className="page-hero" aria-labelledby="project-title">
        <h1 id="project-title">{project.title}</h1>
        <p>{project.hero.description}</p>

        {project.hero.kpis && (
          <div className="kpi-grid">
            {project.hero.kpis.map(kpi => (
              <div className="kpi" id={slugify(kpi.label)} key={kpi.label}>
                <div className="label">{kpi.label}</div>
                <div className="value">{kpi.value}</div>
              </div>
            ))}
          </div>
        )}

        {project.links.length > 0 && (
          <div className="project-links">
            {project.links.map(link => (
              <a className="btn" href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </section>

      {project.sections.length === 0 ? (
        <section className="card">
          <h3>Coming soon</h3>
          <p>This project page is still being written. Check back soon, or ask LUNA about it.</p>
        </section>
      ) : (
        project.sections.map(section => (
          <section className="card" id={slugify(section.heading)} key={section.heading}>
            <h3>{section.heading}</h3>
            <ReactMarkdown>{section.body}</ReactMarkdown>
          </section>
        ))
      )}

      <div className="project-page-footer">
        <Link className="btn-outline" to="/projects">← Back to Projects</Link>
      </div>
    </main>
  )
}
