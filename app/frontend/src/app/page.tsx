import { CodeBlock } from '@/components/CodeBlock'
import { CHAPTERS, TOTAL_MINUTES } from '@/lib/chapters'
import { PYARMOR_VERSION, REPO_URL } from '@/lib/site'

const BADGES = ['PyArmor', 'Python', 'FastAPI', 'Docker', 'Security']

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
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            JARS Demo workshop · {CHAPTERS.length} chapters · about {Math.round(TOTAL_MINUTES / 60)} hours
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Protect Python Applications with PyArmor</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            A hands-on lab for Python code obfuscation, runtime protection, packaging, Docker deployment, and understanding the real
            security boundary of protected software.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/workshop/" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-text hover:opacity-90">
              Start Workshop
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-paper px-5 py-2.5 text-sm font-semibold hover:border-accent">
              View on GitHub
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
            {BADGES.map((badge) => (
              <li key={badge} className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-xs text-muted">
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <ol aria-label="The pipeline you will build" className="mt-14 grid gap-3 md:grid-cols-5">
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
          <h2 id="learn" className="text-2xl font-bold tracking-tight">
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
            <h2 id="threat" className="text-2xl font-bold tracking-tight">
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
            <h2 id="quickstart" className="text-2xl font-bold tracking-tight">
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
