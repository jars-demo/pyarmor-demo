import { JARS_LINKS, PYARMOR_VERSION, REPO_URL } from '@/lib/site'

import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo size={28} />
          <p>
          Built by{' '}
          <a href="https://jishanahmed.in" target="_blank" rel="noreferrer" className="font-semibold text-text hover:text-accent">
            Mr. JARS
          </a>{' '}
          · A community workshop, not affiliated with PyArmor or Dashingsoft ·
          Tested with PyArmor {PYARMOR_VERSION}
          </p>
          <a href="/protect-your-project/" className="text-xs text-faint hover:text-accent">
            Have a project you want to protect? →
          </a>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a className="hover:text-text" href={REPO_URL} target="_blank" rel="noreferrer">
              Repository
            </a>
          </li>
          {JARS_LINKS.map((link) => (
            <li key={link.href}>
              <a className="hover:text-text" href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
