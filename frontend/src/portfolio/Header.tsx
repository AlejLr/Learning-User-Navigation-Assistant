import { Link } from 'react-router-dom'
import about from '../content/about.json'

export function Header() {
  return (
    <header>
      <div className="container">
        <h1>{about.name}</h1>
        <p className="subtitle">{about.subtitle}</p>
        <nav aria-label="Primary navigation">
          <a href="/#about">About</a>
          <Link to="/projects">Projects</Link>
          <a href="/#courses">Courses</a>
          <a href="/#contact">Contact</a>
        </nav>
      </div>
    </header>
  )
}
