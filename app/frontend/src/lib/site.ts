// Build flavours. `npm run build` (and Docker) makes the full app: the Lab page calls the API.
// `npm run build:static` (Vercel) makes the public site: same pages, but the Lab page explains how
// to run the API locally, because pyarmor.jishanahmed.in hosts no backend.
export const IS_STATIC_SITE = process.env.NEXT_PUBLIC_SITE_MODE === 'static'

// Empty in Docker (nginx proxies /api on the same origin); http://localhost:8300 in `npm run dev`.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export const SITE_URL = 'https://pyarmor.jishanahmed.in'
export const REPO_URL = 'https://github.com/jars-demo/pyarmor-demo'
export const PYARMOR_VERSION = '9.2.7'

export const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/learn/', label: 'Learn' },
  { href: '/workshop/', label: 'Workshop' },
  { href: '/playground/', label: 'Playground' },
  { href: '/lab/', label: 'Lab' },
  { href: '/architecture/', label: 'Architecture' },
  { href: '/security/', label: 'Security Model' },
  { href: '/faq/', label: 'FAQ' },
] as const

export const JARS_LINKS = [
  { href: 'https://github.com/jars-demo', label: 'GitHub' },
  { href: 'https://github.com/jars-demo/jars-skills', label: 'JARS Skills' },
  { href: 'https://skills.jishanahmed.in', label: 'skills.jishanahmed.in' },
] as const
