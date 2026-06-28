import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { ProjectContent } from '../content/types'
import { useInView } from '../hooks/useInView'

interface Props {
  project: ProjectContent
  delay?: number
}

const statusLabel: Record<ProjectContent['status'], string> = {
  completed: '',
  'in-progress': 'In progress',
  planned: 'Planned',
}

export function ProjectCard({ project, delay = 0 }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  const badge = statusLabel[project.status]

  return (
    <article
      ref={ref}
      className={`project-card${inView ? ' card--in' : ''}`}
      style={{ '--delay': `${delay}ms` } as CSSProperties}
    >
      <h3>
        {project.title}
        {badge && <span className="status-chip">{badge}</span>}
      </h3>
      <p>{project.cardSummary}</p>
      <div className="tag-list" aria-label="Tags">
        {project.tags.map(tag => (
          <span className="tag-chip" key={tag}>{tag}</span>
        ))}
      </div>
      <div className="project-links">
        <Link className="btn" to={`/projects/${project.slug}`}>Project page</Link>
        {project.links.map(link => (
          <a
            className="btn-outline"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            key={link.url}
          >
            {link.label}
          </a>
        ))}
      </div>
    </article>
  )
}
