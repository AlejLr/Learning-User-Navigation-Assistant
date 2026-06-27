/** Turns a heading or KPI label into a stable DOM id, e.g. "Results and impact" -> "results-and-impact". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
