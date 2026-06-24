import type { ProjectContent } from '../types'
import sdg from './sdg.json'
import smanalyzer from './smanalyzer.json'
import routeguesser from './routeguesser.json'
import stata from './stata.json'
import luna from './luna.json'
import pepadb from './pepadb.json'
import esg from './esg.json'
import ecosim from './ecosim.json'

export const projects: ProjectContent[] = [
  sdg,
  smanalyzer,
  routeguesser,
  stata,
  luna,
  pepadb,
  esg,
  ecosim,
] as ProjectContent[]

export const featuredSlugs = ['sdg', 'smanalyzer', 'stata']

export function getProjectBySlug(slug: string): ProjectContent | undefined {
  return projects.find(p => p.slug === slug)
}
