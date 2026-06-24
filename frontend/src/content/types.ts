export type ProjectStatus = 'completed' | 'in-progress' | 'planned'

export interface Kpi {
  label: string
  value: string
}

export interface ProjectLink {
  label: string
  url: string
}

export interface ProjectSection {
  heading: string
  /** Markdown — rendered with react-markdown on the page, flattened to plain text for the KB. */
  body: string
}

export interface ProjectContent {
  slug: string
  title: string
  status: ProjectStatus
  /** True for projects that exist as cards/routes but have no real content yet. */
  stub: boolean
  category: string
  tags: string[]
  /** Short text used on project list/home cards. */
  cardSummary: string
  hero: {
    description: string
    kpis?: Kpi[]
  }
  links: ProjectLink[]
  sections: ProjectSection[]
}
