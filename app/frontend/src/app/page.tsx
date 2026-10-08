import { CodeBlock } from '@/components/CodeBlock'
import { CHAPTERS, TOTAL_MINUTES } from '@/lib/chapters'
import { PYARMOR_VERSION, REPO_URL } from '@/lib/site'

// The workflow, with real output lines (chapters 05 and 07).
const SESSION = `$ uv run pyarmor gen -O build/protected -r --exclude app/frontend app
INFO     obfuscate scripts OK

$ head -n 2 build/protected/app/backend/business_logic/scoring.py
# Pyarmor ${PYARMOR_VERSION} (trial), 000000, non-profits, 2026-10-08T09:17:16.748765
from pyarmor_runtime_000000 import __pyarmor__

$ uv run python scripts/verify.py --tests
  ✓ every module is obfuscated and present
  ✓ no function names, constant names or long strings found as plain text
38 passed in 0.12s
  ✓ the protected build passes the same tests as the original`

const PIPELINE = [
  ['Source', 'app/backend/'],
  ['Obfuscate', 'pyarmor gen -r'],
  ['Verify', 'scripts/verify.py'],
  ['Docker', 'no source inside'],
  ['Deploy', 'proxy + HTTPS'],
]

const SCENARIOS = [
  ['A', 'Source available', 'Repository or plain .py files', 'Nothing protected', 'danger'],
  ['B', 'Protected artifact', 'Obfuscated app + runtime', 'Reading and reuse get much harder', 'ok'],
  ['C', 'Environment controlled', 'Shell, files, memory, env vars', 'Not the boundary: protect the host', 'danger'],
] as const

const GITHUB_ICON =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Hands-on workshop</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Protect Python Applications</h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            A hands-on lab for Python code obfuscation, runtime protection, packaging, and deployment.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/workshop/" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
              Start Workshop <span aria-hidden="true">→</span>
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-semibold hover:border-accent"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d={GITHUB_ICON} />
              </svg>
              View on GitHub
            </a>
          </div>
          <p className="mt-7 font-mono text-xs text-faint">
            PyArmor {PYARMOR_VERSION} · Python 3.12 · FastAPI · Docker · {CHAPTERS.length} chapters · ~{Math.round(TOTAL_MINUTES / 60)} h
          </p>
        </div>
        <CodeBlock lang="text" title="terminal" code={SESSION} wrap />
      </section>

      <section aria-labelledby="pipeline" className="border-t border-line py-12">
        <h2 id="pipeline" className="text-xl font-[650]">
          Pipeline
        </h2>
        <ol className="mt-5 grid gap-2 sm:grid-cols-5">
          {PIPELINE.map(([step, detail], i) => (
            <li key={step} className="card px-4 py-3">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <p className="font-semibold">{step}</p>
              <p className="font-mono text-xs text-muted">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="threat" className="border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="threat" className="text-xl font-[650]">
            Threat model
          </h2>
          <a href="/security/" className="text-sm font-medium text-accent hover:underline">
            Security model →
          </a>
        </div>
        <div className="table-wrap mt-5">
          <table>
            <thead>
              <tr>
                <th scope="col">Scenario</th>
                <th scope="col">Attacker has</th>
                <th scope="col">Obfuscation</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map(([id, name, has, effect, tone]) => (
                <tr key={id}>
                  <td className="font-medium">
                    <span className="mr-2 font-mono text-faint">{id}</span>
                    {name}
                  </td>
                  <td className="text-muted">{has}</td>
                  <td className={tone === 'ok' ? 'text-ok' : 'text-danger'}>{effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="chapters" className="border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="chapters" className="text-xl font-[650]">
            Chapters
          </h2>
          <span className="text-sm text-muted">~{Math.round(TOTAL_MINUTES / 60)} hours</span>
        </div>
        <ol className="mt-5 divide-y divide-line rounded-xl border border-line bg-paper">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.slug}>
              <a href={`/workshop/${chapter.slug}/`} className="flex items-center gap-4 px-4 py-3 hover:bg-paper-2">
                <span className="w-6 font-mono text-xs text-faint">{chapter.number}</span>
                <span className="flex-1 font-medium">{chapter.title}</span>
                <span className="hidden flex-[2] text-sm text-muted sm:block">{chapter.summary}</span>
                <span className="font-mono text-xs text-faint">{chapter.minutes}m</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="run" className="border-t border-line py-12">
        <h2 id="run" className="text-xl font-[650]">
          Run it locally
        </h2>
        <p className="mt-2 text-sm text-muted">
          Site + live Lab on <code className="font-mono">:3300</code>, protected API on <code className="font-mono">:8300</code>. No account, no keys.
        </p>
        <div className="mt-5 max-w-2xl">
          <CodeBlock lang="bash" code={`git clone ${REPO_URL}.git\ncd pyarmor-demo\ndocker compose up -d --build`} />
        </div>
      </section>
    </div>
  )
}
