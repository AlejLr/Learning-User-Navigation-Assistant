import { useMemo, useState } from 'react'
import { projects } from '../content/projects'
import { ProjectCard } from './ProjectCard'

function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-')
}

export function ProjectsPage() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  const allTags = useMemo(() => {
    const set = new Set<string>()
    projects.forEach(p => p.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [])

  const visible = projects.filter(p => {
    if (selectedTags.size === 0) return true
    const slugs = p.tags.map(tagSlug)
    return Array.from(selectedTags).every(tag => slugs.includes(tag))
  })

  function toggleTag(tag: string) {
    const slug = tagSlug(tag)
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <main id="main-content" className="container" style={{ marginTop: '2rem' }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a> <span aria-hidden="true">›</span> <span aria-current="page">Projects</span>
      </nav>

      <section className="page-hero" aria-labelledby="projects-title">
        <h1 id="projects-title">All Projects</h1>
        <p>
          A selection of completed, in-progress, and planned projects across AI, data science,
          econometrics, and software engineering. Use the tags to filter by topic and tech stack.
        </p>
      </section>

      <div className="filter-panel" aria-label="Project filters">
        <div className="filter-panel-header">
          <span className="filter-label">Filter projects</span>
          <p className="filter-hint">Narrow by tag.</p>
        </div>
        <div className="tag-filter-list" style={{ marginTop: '0.85rem' }}>
          {allTags.map(tag => {
            const slug = tagSlug(tag)
            const active = selectedTags.has(slug)
            return (
              <button
                key={tag}
                type="button"
                className={`tag-filter${active ? ' active' : ''}`}
                aria-pressed={active}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            )
          })}
        </div>
        {selectedTags.size > 0 && (
          <div className="filter-actions">
            <button type="button" className="filter-reset" onClick={() => setSelectedTags(new Set())}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="projects-count" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </p>

      <div className="project-group-body">
        {visible.map(project => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>
    </main>
  )
}
