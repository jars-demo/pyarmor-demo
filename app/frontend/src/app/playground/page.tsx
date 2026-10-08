import type { Metadata } from 'next'

import { CodeCompare, type CompareExample } from '@/components/CodeCompare'
import data from '@/data/playground.json'
import { highlight } from '@/lib/markdown'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Real PyArmor output next to the original Python: a function, business logic, a class, a FastAPI endpoint and a utility module.',
  alternates: { canonical: '/playground/' },
}

const EXPLAIN = [
  {
    title: 'What changed?',
    items: [
      'The file is three lines: a comment, an import of the PyArmor runtime, and one call with an encrypted payload.',
      'Function names, constants, strings and comments cannot be found as text in the file.',
      'Each function is obfuscated on its own, and restored only while it runs.',
    ],
  },
  {
    title: 'What did not change?',
    items: [
      'What the code does: every example returns the same value from both builds (below).',
      'Its interface: names you import, function signatures, HTTP routes.',
      'Values the code uses at runtime: once loaded, the process can still see them.',
    ],
  },
  {
    title: 'Why does it still run?',
    items: [
      'On import, the runtime (a compiled extension) decrypts the payload into code objects in memory.',
      'Python then executes the same instructions as before; they are just not stored readably on disk.',
      'That is obfuscation, not encryption: the means to run the code ships with the code.',
    ],
  },
]

export default async function PlaygroundPage() {
  const examples: CompareExample[] = await Promise.all(
    data.examples.map(async (example) => ({
      id: example.id,
      title: example.title,
      file: example.file,
      original: example.original,
      protected: example.protected,
      protectedBytes: example.protected_bytes,
      originalHtml: await highlight(example.original, 'python'),
      protectedHtml: await highlight(example.protected, 'python'),
      check: example.check,
      result: example.result,
    })),
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">Playground</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Before and after PyArmor</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">
        Pick an example and compare the original source with what PyArmor actually produced for it.
      </p>

      <p className="mt-6 max-w-3xl rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-sm">
        <strong>Pre-generated, real output.</strong> Every protected file here was produced by {data.pyarmor} on Python {data.python} (
        {data.generated}) with <code className="font-mono">scripts/gen_playground.py</code>, which also checked that both builds return the
        same result. Nothing runs in your browser and no code is sent anywhere. Want to run it yourself? Follow the{' '}
        <a className="text-accent underline" href="/workshop/05-obfuscation/">
          obfuscation chapter
        </a>
        .
      </p>

      <div className="mt-10">
        <CodeCompare examples={examples} />
      </div>

      <section aria-labelledby="explain" className="mt-12">
        <h2 id="explain" className="sr-only">
          Explanation
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {EXPLAIN.map((block) => (
            <div key={block.title} className="card p-5">
              <h3 className="font-semibold">{block.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent">
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
