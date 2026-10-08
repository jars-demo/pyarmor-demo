import type { Metadata } from 'next'

import { CHAPTERS, TOTAL_MINUTES } from '@/lib/chapters'
import { IS_STATIC_SITE, REPO_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Workshop',
  description: 'Thirteen hands-on chapters: protect a FastAPI app with PyArmor, verify it, ship it in Docker, and learn the real security boundary.',
  alternates: { canonical: '/workshop/' },
}

export default function WorkshopIndex() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">Workshop</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">From readable source to a protected container</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {CHAPTERS.length} chapters, about {Math.round(TOTAL_MINUTES / 60)} hours. Every command was run with PyArmor 9.2.7, and every
        command explains what it does, why, and what you should see.
      </p>

      <section aria-labelledby="start" className="card mt-8 p-6">
        <h2 id="start" className="text-lg font-semibold">
          Before you start
        </h2>
        <p className="mt-2 text-muted">
          You run everything on your own machine: Git, <a className="text-accent underline" href="https://docs.astral.sh/uv/">uv</a> and,
          for chapters 09–10, Docker. {IS_STATIC_SITE ? 'This website hosts the guide only; there is no hosted API.' : ''}
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-paper-2 p-4 font-mono text-[13px]">
          {`git clone ${REPO_URL}.git\ncd pyarmor-demo\nuv sync`}
        </pre>
      </section>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.slug}>
            <a href={`/workshop/${chapter.slug}/`} className="card block h-full p-5 transition-colors hover:border-accent">
              <div className="flex items-center justify-between text-xs font-medium text-faint">
                <span className="font-mono">{chapter.number}</span>
                <span>{chapter.minutes} min</span>
              </div>
              <h2 className="mt-2 font-semibold">{chapter.title}</h2>
              <p className="mt-1 text-sm text-muted">{chapter.summary}</p>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
