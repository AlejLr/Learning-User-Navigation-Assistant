import { Link } from 'react-router-dom'
import type { ProjectContent } from '../content/types'

interface Props {
  project: ProjectContent
}

const statusLabel: Record<ProjectContent['status'], string> = {
  completed: '',
  'in-progress': 'In progress',
  planned: 'Planned',
}

export function ProjectCard({ project }: Props) {
  const badge = statusLabel[project.status]
  return (
    <article className="project-card">
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
      <p>
        <Link className="btn" to={`/projects/${project.slug}`}>Project page</Link>
        {project.links.map(link => (
          <a className="btn-outline" href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>
            {link.label}
          </a>
        ))}
      </p>
    </article>
  )
}
