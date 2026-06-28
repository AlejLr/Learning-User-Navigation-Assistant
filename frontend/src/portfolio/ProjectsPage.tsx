import { useMemo, useState } from 'react'
import { projects } from '../content/projects'
import { ProjectCard } from './ProjectCard'
import type { ProjectStatus } from '../content/types'

const STACK_TAGS = new Set([
  'Python', 'FastAPI', 'React', 'Docker', 'GIS', 'Scrum', 'Streamlit',
  'Flask', 'Stata', 'Vector Search', 'LLM', 'Full-Stack',
])

const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  planned: 'Planned',
}

function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-')
}

export function ProjectsPage() {
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState('')
  const [stack, setStack] = useState('')

  const { topicOptions, stackOptions } = useMemo(() => {
    const topics = new Set<string>()
    const stacks = new Set<string>()
    projects.forEach(p => p.tags.forEach(tag => {
      (STACK_TAGS.has(tag) ? stacks : topics).add(tag)
    }))
    return { topicOptions: Array.from(topics).sort(), stackOptions: Array.from(stacks).sort() }
  }, [])

  const visible = projects.filter(p => {
    const slugs = p.tags.map(tagSlug)
    if (topic && !slugs.includes(tagSlug(topic))) return false
    if (stack && !slugs.includes(tagSlug(stack))) return false
    if (status && p.status !== status) return false
    return true
  })

  const completed = visible.filter(p => p.status === 'completed')
  const inProgressOrPlanned = visible.filter(p => p.status !== 'completed')

  function clearFilters() { setTopic(''); setStatus(''); setStack('') }
  const hasFilters = Boolean(topic || status || stack)

  return (
    <main id="main-content" className="container" style={{ marginTop: '2rem' }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a> <span aria-hidden="true">›</span>{' '}
        <span aria-current="page">Projects</span>
      </nav>

      <section className="page-hero" aria-labelledby="projects-title">
        <h1 id="projects-title">All projects</h1>
        <p>
          Completed, in-progress, and planned work across AI, data science,
          econometrics, and software engineering. Use the filters to narrow by topic, status, or stack.
        </p>
      </section>

      <div className="filter-panel" aria-label="Project filters">
        <div className="filter-panel-header">
          <span className="filter-label">Filter projects</span>
          <p className="filter-hint">Narrow by topic, status, or stack.</p>
        </div>

        <div className="filter-grid">
          <label className="filter-field" htmlFor="topic-filter">
            <span>Topic</span>
            <select id="topic-filter" value={topic} onChange={e => setTopic(e.target.value)}>
              <option value="">All topics</option>
              {topicOptions.map(t => <option value={t} key={t}>{t}</option>)}
            </select>
          </label>

          <label className="filter-field" htmlFor="status-filter">
            <span>Status</span>
            <select id="status-filter" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="filter-field" htmlFor="stack-filter">
            <span>Stack</span>
            <select id="stack-filter" value={stack} onChange={e => setStack(e.target.value)}>
              <option value="">All stacks</option>
              {stackOptions.map(s => <option value={s} key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        {hasFilters && (
          <div className="filter-actions">
            <button type="button" className="filter-reset" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="projects-count" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </p>

      {completed.length > 0 && (
        <section className="project-group project-group--completed" aria-labelledby="completed-projects-title">
          <div className="project-group-header">
            <div>
              <h3 id="completed-projects-title">Completed projects</h3>
              <p>Finished work and the strongest evidence of what I can deliver end-to-end.</p>
            </div>
            <span className="project-group-pill">
              {completed.length} project{completed.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="project-group-body">
            {completed.map((project, i) => (
              <ProjectCard project={project} key={project.slug} delay={i * 60} />
            ))}
          </div>
        </section>
      )}

      {inProgressOrPlanned.length > 0 && (
        <section className="project-group project-group--planned" aria-labelledby="exploring-projects-title">
          <div className="project-group-header">
            <div>
              <h3 id="exploring-projects-title">In progress and planned</h3>
              <p>Ideas and work-in-progress, kept separate so the finished projects stay dominant.</p>
            </div>
            <span className="project-group-pill">
              {inProgressOrPlanned.length} project{inProgressOrPlanned.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="project-group-body">
            {inProgressOrPlanned.map((project, i) => (
              <ProjectCard project={project} key={project.slug} delay={i * 60} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
