// The workshop chapters, in order. The content lives in /workshop/*.md at the repository root (the
// single source of truth, also readable on GitHub); this list adds the titles and timings the site
// needs for navigation. Keep it in step with the files.
export type Chapter = {
  slug: string
  number: string
  title: string
  minutes: number
  summary: string
}

export const CHAPTERS: Chapter[] = [
  { slug: '00-introduction', number: '00', title: 'Introduction', minutes: 10, summary: 'Code protection, obfuscation and the threat model' },
  { slug: '01-project-setup', number: '01', title: 'Project Setup', minutes: 10, summary: 'Clone, install with uv, run the baseline tests' },
  { slug: '02-explore-source', number: '02', title: 'Explore Source', minutes: 10, summary: 'Read the app and find the logic worth protecting' },
  { slug: '03-baseline-app', number: '03', title: 'Baseline App', minutes: 10, summary: 'Call every endpoint and record the answers' },
  { slug: '04-pyarmor-setup', number: '04', title: 'PyArmor Setup', minutes: 5, summary: 'Version, CLI, trial limits and licensing' },
  { slug: '05-obfuscation', number: '05', title: 'Obfuscation', minutes: 15, summary: 'Protect a script, then the package, and verify it' },
  { slug: '06-runtime', number: '06', title: 'Runtime', minutes: 15, summary: 'Break it three ways, add an expiry date' },
  { slug: '07-compare', number: '07', title: 'Original vs Protected', minutes: 15, summary: 'What changed, what did not, and why it works' },
  { slug: '08-packaging', number: '08', title: 'Packaging', minutes: 15, summary: 'Archives and PyInstaller bundles' },
  { slug: '09-docker', number: '09', title: 'Docker', minutes: 20, summary: 'A two-stage image with no source, inspected' },
  { slug: '10-deployment', number: '10', title: 'Deployment', minutes: 15, summary: 'Reverse proxy, HTTPS, health checks, logs' },
  { slug: '11-security-reality', number: '11', title: 'Security Reality', minutes: 15, summary: 'What obfuscation protects, and what it cannot' },
  { slug: '12-best-practices', number: '12', title: 'Best Practices', minutes: 15, summary: 'The production checklist' },
]

export const TOTAL_MINUTES = CHAPTERS.reduce((sum, c) => sum + c.minutes, 0)

export function chapterIndex(slug: string): number {
  return CHAPTERS.findIndex((c) => c.slug === slug)
}
