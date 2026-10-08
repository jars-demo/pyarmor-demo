import type { Metadata } from 'next'

import { CodeBlock } from '@/components/CodeBlock'
import { IS_STATIC_SITE, REPO_URL } from '@/lib/site'

import { LiveLab } from './LiveLab'

export const metadata: Metadata = {
  title: 'Lab',
  description: 'Call the protected Secret Analytics API running on your own machine, and see which build answers.',
  alternates: { canonical: '/lab/' },
}

function RunLocally() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">1 · Start it</p>
        <h2 className="mt-2 text-lg font-semibold">The whole app, with Docker</h2>
        <p className="mt-2 text-sm text-muted">
          Builds the protected API (PyArmor runs inside the build) and this site.
        </p>
        <div className="mt-4">
          <CodeBlock lang="bash" code={`git clone ${REPO_URL}.git\ncd pyarmor-demo\ndocker compose up -d --build`} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Then open <strong className="text-text">http://localhost:3300/lab/</strong>. The API itself is at http://localhost:8300/docs.
        </p>
      </section>
      <section className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">2 · Or follow the workshop</p>
        <h2 className="mt-2 text-lg font-semibold">Run each build yourself</h2>
        <p className="mt-2 text-sm text-muted">
          Original or protected, with <code className="font-mono">uv</code>. The Lab works with both.
        </p>
        <div className="mt-4">
          <CodeBlock lang="bash" code={`uv sync\nuv run python scripts/obfuscate.py\ncd build/protected && uv run python -m app`} />
        </div>
        <a className="mt-4 inline-block text-sm font-semibold text-accent hover:underline" href="/workshop/01-project-setup/">
          Start with chapter 01 →
        </a>
      </section>
    </div>
  )
}

export default function LabPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Lab</h1>
      <p className="mt-2 text-muted">
        {IS_STATIC_SITE
          ? 'Calls the Secret Analytics API on your machine. This site hosts no backend.'
          : 'Calls the API on your machine. The badge shows which build answered; the answers are identical.'}
      </p>
      <div className="mt-10">{IS_STATIC_SITE ? <RunLocally /> : <LiveLab />}</div>
    </div>
  )
}
