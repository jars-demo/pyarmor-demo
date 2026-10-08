import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'From developer to client: how source becomes a protected build, a Docker image and a deployed FastAPI service.',
  alternates: { canonical: '/architecture/' },
}

type Box = { id: string; title: string; sub: string; tone?: 'accent' | 'muted' }

function Node({ box }: { box: Box }) {
  return (
    <a
      href={`#${box.id}`}
      className={`block rounded-xl border px-4 py-3 text-center hover:border-accent ${box.tone === 'accent' ? 'border-accent/40 bg-accent-soft' : 'border-line bg-paper'}`}
    >
      <span className="block text-sm font-semibold">{box.title}</span>
      <span className="block font-mono text-[11px] text-muted">{box.sub}</span>
    </a>
  )
}

function Arrow() {
  return (
    <div aria-hidden="true" className="flex justify-center py-1 text-faint">
      ↓
    </div>
  )
}

const COMPONENTS = [
  { id: 'developer', title: 'Developer', where: 'your machine', text: 'Writes and tests the readable source. Runs the workshop commands with uv.' },
  { id: 'source', title: 'Python source', where: 'app/backend/', text: 'The FastAPI app. business_logic/ holds the scoring model worth protecting. Never shipped.' },
  { id: 'build', title: 'PyArmor build', where: 'scripts/obfuscate.py · verify.py', text: 'Runs pyarmor gen -O build/protected -r app, fails on PyArmor errors (it exits 0 on some), then checks every module is obfuscated and the tests still pass.' },
  { id: 'protected', title: 'Protected application', where: 'build/protected/app/', text: 'The same package structure; each .py is a three-line stub with an encrypted payload.' },
  { id: 'runtime', title: 'Runtime components', where: 'build/protected/pyarmor_runtime_000000/', text: 'A compiled extension that decodes the protected code in memory. Tied to one platform and one Python minor version.' },
  { id: 'image', title: 'Docker image', where: 'app/backend/Dockerfile', text: 'Two stages: the builder obfuscates, the runtime image gets only the protected build and hash-pinned dependencies. Non-root, read-only code.' },
  { id: 'deployment', title: 'Deployment', where: 'docker-compose.yml · deploy/', text: 'Locally: published on 127.0.0.1 only. On a server: behind Caddy with HTTPS, health checks, log rotation and a restart policy.' },
  { id: 'api', title: 'FastAPI API', where: ':8300', text: '/health, /api/info (reports the build), /api/analyze, /api/report. Identical answers from both builds.' },
  { id: 'client', title: 'Client', where: 'curl · the Lab page · your app', text: 'Sees only HTTP. Cannot tell the builds apart except through /api/info, which reports it on purpose.' },
]

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Architecture</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">Each box links to what it is and where it lives in the repo.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <figure aria-label="Architecture diagram" className="card p-5 lg:sticky lg:top-24 lg:self-start">
          <Node box={{ id: 'developer', title: 'Developer', sub: 'uv · git' }} />
          <Arrow />
          <Node box={{ id: 'source', title: 'Python source', sub: 'app/backend/' }} />
          <Arrow />
          <Node box={{ id: 'build', title: 'PyArmor build', sub: 'pyarmor gen -r', tone: 'accent' }} />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <Arrow />
              <Node box={{ id: 'protected', title: 'Protected app', sub: 'app/ (obfuscated)', tone: 'accent' }} />
            </div>
            <div>
              <Arrow />
              <Node box={{ id: 'runtime', title: 'Runtime', sub: 'pyarmor_runtime_*', tone: 'accent' }} />
            </div>
          </div>
          <Arrow />
          <Node box={{ id: 'image', title: 'Docker image', sub: 'no source inside' }} />
          <Arrow />
          <Node box={{ id: 'deployment', title: 'Deployment', sub: 'proxy · HTTPS' }} />
          <Arrow />
          <Node box={{ id: 'api', title: 'FastAPI API', sub: ':8300' }} />
          <Arrow />
          <Node box={{ id: 'client', title: 'Client', sub: 'HTTP only' }} />
          <figcaption className="mt-4 text-center text-xs text-muted">Highlighted: what PyArmor produces</figcaption>
        </figure>

        <ol className="space-y-4">
          {COMPONENTS.map((c, i) => (
            <li key={c.id} id={c.id} className="card scroll-mt-24 p-5 target:border-accent">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">
                  <span className="mr-2 font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                  {c.title}
                </h2>
                <code className="font-mono text-xs text-accent">{c.where}</code>
              </div>
              <p className="mt-2 text-sm text-muted">{c.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
