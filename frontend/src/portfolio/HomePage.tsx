import { Link } from 'react-router-dom'
import about from '../content/about.json'
import courses from '../content/courses.json'
import { projects, featuredSlugs } from '../content/projects'
import { ProjectCard } from './ProjectCard'

export function HomePage() {
  const featured = featuredSlugs
    .map(slug => projects.find(p => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <main id="main-content">
      <section className="container" style={{ marginTop: '2rem' }} aria-label="Introduction">
        <div className="hero">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2>{about.heroHeadline}</h2>
          <p>{about.heroDescription}</p>
          <p className="hero-stats">
            {about.heroStats.map((stat, i) => (
              <span key={stat}>
                {i > 0 && <span aria-hidden="true">· </span>}
                {stat}{' '}
              </span>
            ))}
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link className="btn" to="/projects">View all projects</Link>
            <a className="btn-outline" href={about.cvUrl} download>Download CV</a>
          </div>
        </div>
      </section>

      <section id="about" className="container">
        <h2>About Me</h2>
        {about.aboutText.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section id="projects" className="container">
        <h2>Featured Projects</h2>
        <p>A selection of my strongest work across AI, business analytics, and data science.</p>
        <div className="featured-grid">
          {featured.map(project => (
            <ProjectCard project={project} key={project.slug} />
          ))}
        </div>
        <div className="section-cta">
          <Link className="btn-outline" to="/projects">View all projects →</Link>
        </div>
      </section>

      <section id="courses" className="container">
        <h2>Courses & Certifications</h2>
        <div className="cert-list">
          {courses.map(course => (
            <div className="cert-item" key={course.name}>
              <div className="cert-header">
                <span className="cert-name">{course.name}</span>
                <span className="cert-badge">{course.badge}</span>
              </div>
              <p className="cert-detail">{course.detail}</p>
              <a className="btn-outline" href={course.certificateUrl} target="_blank" rel="noopener noreferrer">
                View certificate
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="container">
        <h2>Contact</h2>
        <div className="contact-grid" aria-label="Contact links">
          <div className="contact-item">
            <img className="contact-icon" src="/assets/icon/email.png" alt="Email icon" />
            <a href={`mailto:${about.contact.email}`}>Email</a>
          </div>
          <div className="contact-item">
            <img className="contact-icon" src="/assets/icon/GitHub.png" alt="GitHub icon" />
            <a href={about.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <div className="contact-item">
            <img className="contact-icon" src="/assets/icon/linkedin.png" alt="LinkedIn icon" />
            <a href={about.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>
    </main>
  )
}
