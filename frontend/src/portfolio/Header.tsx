import { Link, useLocation } from 'react-router-dom'
import about from '../content/about.json'

export function Header() {
  const location = useLocation()
  const isProjects = location.pathname.startsWith('/projects')

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          {about.name}
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link to="/#about">About</Link>
          <Link to="/projects" className={isProjects ? 'active' : undefined}>
            Projects
          </Link>
          <Link to="/#courses">Courses</Link>
          <Link to="/#contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
