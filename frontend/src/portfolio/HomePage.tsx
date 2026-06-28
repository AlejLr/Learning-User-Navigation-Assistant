import type { RefObject } from 'react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import about from '../content/about.json'
import courses from '../content/courses.json'
import { projects, featuredSlugs } from '../content/projects'
import { useInView } from '../hooks/useInView'
import { ProjectCard } from './ProjectCard'

export function HomePage() {
  const location = useLocation()
  const featured = featuredSlugs
    .map(slug => projects.find(p => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  // Scroll-to-hash for SPA navigation
  useEffect(() => {
    if (!location.hash) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  // Container-level observers for cert list and contact grid
  const { ref: certsRef, inView: certsInView } = useInView<HTMLDivElement>()
  const { ref: contactRef, inView: contactInView } = useInView<HTMLDivElement>()

  return (
    <main id="main-content">
      <section className="hero-section" aria-label="Introduction">
        <p className="eyebrow">{about.eyebrow}</p>
        <h1 className="hero-headline">{about.heroHeadline}</h1>
        <p className="hero-description">{about.heroDescription}</p>
        <p className="hero-stats">
          {about.heroStats.map((stat, i) => (
            <span key={stat}>
              {i > 0 && <span aria-hidden="true">· </span>}
              {stat}
            </span>
          ))}
        </p>
        <div className="hero-ctas">
          <Link className="btn" to="/projects">View all projects</Link>
          <a className="btn-outline" href={about.cvUrl} download>Download CV</a>
        </div>
      </section>

      <section id="about" className="container">
        <h2>About me</h2>
        {about.aboutText.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section id="projects" className="container">
        <h2>Featured projects</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: 0 }}>
          A selection of my strongest work across AI, business analytics, and data science.
        </p>
        <div className="featured-grid">
          {featured.map((project, i) => (
            <ProjectCard project={project} key={project.slug} delay={i * 70} />
          ))}
        </div>
        <div className="section-cta">
          <Link className="btn-outline" to="/projects">View all projects →</Link>
        </div>
      </section>

      <section id="courses" className="container">
        <h2>Courses & certifications</h2>
        {/* ref on the list container — CSS nth-child stagger handles per-item timing */}
        <div
          ref={certsRef as RefObject<HTMLDivElement>}
          className={`cert-list${certsInView ? ' card--in' : ''}`}
        >
          {courses.map(course => (
            <div className="cert-item" key={course.name}>
              <div className="cert-header">
                <span className="cert-name">{course.name}</span>
                <span className="cert-badge">{course.badge}</span>
              </div>
              <p className="cert-detail">{course.detail}</p>
              <a
                className="btn-outline"
                href={course.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View certificate
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="container">
        <h2>Contact</h2>
        {/* ref on the grid container — CSS nth-child stagger handles per-item timing */}
        <div
          ref={contactRef as RefObject<HTMLDivElement>}
          className={`contact-grid${contactInView ? ' card--in' : ''}`}
          aria-label="Contact links"
        >
          <a className="contact-item" href={`mailto:${about.contact.email}`}>
            <img className="contact-icon" src="/assets/icon/email.png" alt="Email icon" />
            Email
          </a>
          <a
            className="contact-item"
            href={about.contact.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="contact-icon" src="/assets/icon/GitHub.png" alt="GitHub icon" />
            GitHub
          </a>
          <a
            className="contact-item"
            href={about.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="contact-icon" src="/assets/icon/linkedin.png" alt="LinkedIn icon" />
            LinkedIn
          </a>
        </div>
      </section>
    </main>
  )
}
