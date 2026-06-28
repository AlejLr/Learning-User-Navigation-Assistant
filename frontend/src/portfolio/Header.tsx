import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import about from '../content/about.json'

export function Header() {
  const location = useLocation()
  const isHome     = location.pathname === '/'
  const isProjects = location.pathname.startsWith('/projects')
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the route changes (e.g. tapping a link).
  useEffect(() => { setMenuOpen(false) }, [location.pathname, location.hash])

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          {about.name}
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        <nav
          className={`site-nav ${menuOpen ? 'is-open' : ''}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          <Link to="/" className={isHome ? 'active' : undefined}>Home</Link>
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
