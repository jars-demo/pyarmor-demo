import { CodeBlock } from '@/components/CodeBlock'
import { CHAPTERS, TOTAL_MINUTES } from '@/lib/chapters'
import { PYARMOR_VERSION, REPO_URL } from '@/lib/site'

const BADGES = ['Python', 'FastAPI', 'PyArmor', 'Docker', 'Security']

const PIPELINE = [
  { step: 'Source', detail: 'Readable FastAPI app with business logic worth protecting', file: 'app/backend/' },
  { step: 'Obfuscate', detail: `pyarmor gen -r with PyArmor ${PYARMOR_VERSION}, checked by verify.py`, file: 'scripts/obfuscate.py' },
  { step: 'Protected build', detail: 'Obfuscated modules + the PyArmor runtime, same test results', file: 'build/protected/' },
  { step: 'Docker', detail: 'Two-stage image: no source, no PyArmor, non-root, read-only', file: 'app/backend/Dockerfile' },
  { step: 'Deploy', detail: 'Behind a reverse proxy with HTTPS and health checks', file: 'deploy/' },
]

const LEARN = [
  { title: 'How Python exposes code', text: 'Why source and even bytecode give your logic away, and what obfuscation changes.' },
  { title: 'Protect a real app', text: 'Obfuscate a FastAPI package, run it, and prove it behaves exactly like the original.' },
  { title: 'The runtime', text: 'What the PyArmor runtime is, three ways to break it, and build expiry and device binding.' },
  { title: 'Package and ship', text: 'Archives, PyInstaller bundles, and a Docker image that contains no source at all.' },
  { title: 'Inspect like an attacker', text: 'Look inside the image and the running process, and see what is still visible.' },
  { title: 'The real boundary', text: 'Where obfuscation stops, and the controls that protect secrets and servers.' },
]

const SCENARIOS = [
  { level: 'High exposure', tone: 'danger', title: 'Source available', text: 'The attacker has your repository. Nothing is protected.' },
  { level: 'Raised effort', tone: 'warn', title: 'Protected artifact', text: 'The attacker has the obfuscated app. Reading and copying the logic gets much harder.' },
  { level: 'Not the boundary', tone: 'danger', title: 'Execution environment controlled', text: 'The attacker controls the machine. Obfuscation is not the defence here.' },
] as const

export default function Home() {
  return (
    <>
      <section className="border-b border-line bg-linear-to-br from-[var(--hero-from)] to-[var(--hero-to)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Hands-on workshop</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-text sm:text-[56px] sm:leading-[1.05]">Protect Python Applications</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              A hands-on lab for Python code obfuscation, runtime protection, packaging, and deployment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/workshop/" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
                Start Workshop <span aria-hidden="true">→</span>
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-text hover:border-accent"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
              {BADGES.map((badge) => (
                <li key={badge} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                  {badge}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-faint">
              {CHAPTERS.length} chapters · about {Math.round(TOTAL_MINUTES / 60)} hours · tested with PyArmor {PYARMOR_VERSION}
            </p>
          </div>

          <div aria-hidden="true" className="relative mx-auto hidden aspect-square w-full max-w-[420px] sm:block">
            <div className="absolute inset-[8%] rounded-full bg-accent-soft" />
            <div className="absolute inset-[20%] rounded-full border border-line bg-paper/60" />
            <img src="/brand/mark-512.png" alt="" width={512} height={512} className="absolute inset-[22%] size-[56%] drop-shadow-xl" />
            <div className="card absolute left-0 top-[18%] px-3 py-2 font-mono text-xs">
              <span className="text-faint">$</span> pyarmor gen -r app
            </div>
            <div className="card absolute bottom-[16%] right-0 flex items-center gap-2 px-3 py-2 text-xs font-medium">
              <span className="size-2 rounded-full bg-ok" /> Same results, no readable source
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pipeline" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 id="pipeline" className="text-2xl font-[650] tracking-tight">
          The pipeline you will build
        </h2>
        <ol className="mt-8 grid gap-3 md:grid-cols-5">
          {PIPELINE.map((item, i) => (
            <li key={item.step} className="card relative p-4">
              <p className="font-mono text-xs text-faint">0{i + 1}</p>
              <p className="mt-1 font-semibold uppercase tracking-wide">{item.step}</p>
              <p className="mt-2 text-sm text-muted">{item.detail}</p>
              <p className="mt-3 truncate font-mono text-[11px] text-accent">{item.file}</p>
              {i < PIPELINE.length - 1 && (
                <span aria-hidden="true" className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 text-faint md:-right-3 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="learn" className="border-y border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 id="learn" className="text-2xl font-[650] tracking-tight">
            What you will learn
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEARN.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-bg p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="threat" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="threat" className="text-2xl font-[650] tracking-tight">
              Obfuscation raises the effort. It is not a vault.
            </h2>
            <p className="mt-3 text-muted">
              How much it helps depends on what the attacker holds. The workshop tests all three cases, with evidence.
            </p>
          </div>
          <a href="/security/" className="text-sm font-semibold text-accent hover:underline">
            The security model →
          </a>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SCENARIOS.map((s) => (
            <div key={s.title} className={`card border-t-4 p-5 ${s.tone === 'warn' ? 'border-t-warn' : 'border-t-danger'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${s.tone === 'warn' ? 'text-warn' : 'text-danger'}`}>{s.level}</p>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="quickstart" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h2 id="quickstart" className="text-2xl font-[650] tracking-tight">
              Run it on your machine
            </h2>
            <p className="mt-3 text-muted">
              Everything runs locally. This website hosts the guide; the protected API runs on your computer with Docker or uv. No account
              and no API keys.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li>
                <strong className="text-text">http://localhost:3300</strong> · this site, with a live Lab
              </li>
              <li>
                <strong className="text-text">http://localhost:8300/docs</strong> · the protected API
              </li>
            </ul>
          </div>
          <CodeBlock lang="bash" code={`git clone ${REPO_URL}.git\ncd pyarmor-demo\ndocker compose up -d --build`} />
        </div>
      </section>
    </>
  )
}
