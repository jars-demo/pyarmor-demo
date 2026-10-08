import type { Metadata } from 'next'

import { CodeBlock } from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'Learn',
  description: 'The concepts behind Python code protection: source exposure, bytecode, obfuscation, the PyArmor runtime and its limits.',
  alternates: { canonical: '/learn/' },
}

const CONCEPTS = [
  {
    id: 'exposure',
    title: 'Python ships as source',
    body: 'Python is interpreted: the files you deploy are the files you wrote. Anyone with access to them can read every function, constant and comment.',
    detail: 'Python compiles source to bytecode and caches it in __pycache__/*.pyc. Bytecode is not protection: it keeps every name and constant, and decompilers turn it back into readable Python. The workshop shows this with the standard dis module.',
  },
  {
    id: 'obfuscation',
    title: 'Obfuscation',
    body: 'Transforming code so it still runs but no longer reads like the original. It raises the effort needed to understand and reuse the logic.',
    detail: 'Obfuscation is not encryption of your app: the means to run the code must ship with it. It is a cost for the reader, not a wall.',
  },
  {
    id: 'pyarmor',
    title: 'What PyArmor does',
    body: 'pyarmor gen rewrites each module into a three-line stub that hands an encrypted payload to a runtime extension.',
    detail: 'Each function is also obfuscated on its own and restored only while it runs ("wrap mode"). Options add expiry dates (-e), device binding (-b), private mode (--private) and PyInstaller packing (--pack).',
  },
  {
    id: 'runtime',
    title: 'The runtime',
    body: 'pyarmor_runtime_000000 is a compiled extension that decodes protected code in memory. No runtime, no app.',
    detail: 'The runtime is built for one platform and one CPython minor version. A build made on Python 3.12 does not load on 3.11, which is why the Docker image builds and runs on the same base image.',
  },
  {
    id: 'packaging',
    title: 'Packaging',
    body: 'A protected app is four parts: protected code, the runtime, third-party dependencies, and a matching Python interpreter.',
    detail: 'Ship them as an archive, a PyInstaller bundle (PyInstaller alone does not protect code), or a container image. Dependencies such as FastAPI stay unobfuscated.',
  },
  {
    id: 'limits',
    title: 'The limits',
    body: 'Once loaded, code runs in a process. Whoever controls that process can see what it holds: values, secrets, inputs and outputs.',
    detail: 'That is why obfuscation is one layer. Secrets belong in a secrets manager, servers need access control, and releases need a trusted pipeline.',
  },
]

const PROTECTED = `# Pyarmor 9.2.7 (trial), 000000, non-profits, 2026-10-08T09:17:16
from pyarmor_runtime_000000 import __pyarmor__
__pyarmor__(__name__, __file__, b'PY000000\\x00\\x03\\x0c\\x00\\xcb\\r\\r\\n\\x80...')`

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">
        Six concepts. The workshop proves each one on a real app.
      </p>

      <div className="mt-10 space-y-3">
        {CONCEPTS.map((concept, i) => (
          <details key={concept.id} id={concept.id} className="card group p-5" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-start gap-4">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft font-mono text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{concept.title}</span>
                <span className="mt-1 block text-sm text-muted">{concept.body}</span>
              </span>
              <span aria-hidden="true" className="text-faint transition-transform group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed">{concept.detail}</p>
          </details>
        ))}
      </div>

      <section aria-labelledby="looks" className="mt-12">
        <h2 id="looks" className="text-2xl font-[650] tracking-tight">
          What a protected module looks like
        </h2>
        <p className="mt-3 text-muted">
          This is the start of a real file from the workshop. The whole module is these three lines; the third one is several kilobytes long.
        </p>
        <div className="mt-5">
          <CodeBlock lang="python" title="build/protected/app/backend/business_logic/scoring.py" code={PROTECTED} />
        </div>
        <a href="/workshop/00-introduction/" className="mt-8 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
          Start the workshop
        </a>
      </section>
    </div>
  )
}
