import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security Model',
  description: 'Three threat scenarios for protected Python, what obfuscation does in each, and what actually protects you.',
  alternates: { canonical: '/security/' },
}

const CARDS = [
  {
    title: 'Source Available',
    who: 'Attacker has readable source: your Git repository, or a package of plain .py files.',
    severity: 'Exposed',
    meter: 3,
    tone: 'danger',
    points: ['Every function, constant and comment is readable in seconds.', 'Copying the logic into another product is trivial.', 'Shipping only .pyc files does not help: bytecode decompiles.'],
    protects: 'Nothing. Keep the repository private, or do not ship source.',
  },
  {
    title: 'Protected Artifact',
    who: 'Attacker has the obfuscated application: protected .py files and the PyArmor runtime, e.g. in an image you shipped.',
    severity: 'Effort raised',
    meter: 2,
    tone: 'warn',
    points: [
      'No readable source in the files; names and constants are not found as text.',
      'Learning the logic takes running it, observing it, or serious reverse-engineering work.',
      'Behaviour is still observable through inputs and outputs.',
    ],
    protects: 'PyArmor is designed for this case. It raises the cost of reading and reusing your code.',
  },
  {
    title: 'Execution Environment Controlled',
    who: 'Attacker controls the machine or container: shell, filesystem, processes, logs, environment variables, network.',
    severity: 'Not the boundary',
    meter: 3,
    tone: 'danger',
    points: [
      'Code is decoded in memory to run; every value it holds is visible there.',
      'Secrets passed to the app are readable: environment, files, memory, traffic.',
      'Expiry and device binding run on a machine the attacker controls.',
    ],
    protects: 'Access control, secrets management, hardening, monitoring: protect the environment itself.',
  },
] as const

const LAYERS = [
  ['PyArmor obfuscation', 'Casual reading and copying of the code you ship'],
  ['Secrets manager', 'Leaked API keys, passwords and tokens'],
  ['Identity and access control', 'Strangers reaching your servers and containers'],
  ['Container hardening', 'A compromised process doing more damage'],
  ['Dependency and image scanning', 'Known vulnerabilities in code you did not write'],
  ['Signed artifacts, protected CI', 'Tampered or unofficial builds'],
]

const slug = (title: string) => title.toLowerCase().replace(/\s+/g, '-')

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Security model</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">
        Obfuscation increases the difficulty of understanding and reusing application logic, but it does not provide absolute secrecy when
        an attacker controls the execution environment.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {CARDS.map((card) => (
          <section key={card.title} aria-labelledby={slug(card.title)} className={`card flex flex-col border-t-2 p-6 ${card.tone === 'warn' ? 'border-t-warn' : 'border-t-danger'}`}>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-xs font-semibold uppercase tracking-wider ${card.tone === 'warn' ? 'text-warn' : 'text-danger'}`}>{card.severity}</p>
            </div>
            <h2 id={slug(card.title)} className="mt-3 text-xl font-semibold">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{card.who}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {card.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="text-faint">
                    •
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg bg-paper-2 p-3 text-sm">
              <strong>What protects you: </strong>
              {card.protects}
            </p>
          </section>
        ))}
      </div>

      <blockquote className="mt-10 border-l-4 border-brand pl-5 text-lg font-medium">
        The strongest security boundary is not obfuscation alone. Protect the environment, secrets, identity, deployment, infrastructure, and
        release pipeline as well.
      </blockquote>

      <section aria-labelledby="layers" className="mt-12">
        <h2 id="layers" className="text-2xl font-[650] tracking-tight">
          Layers, and what each one is for
        </h2>
        <div className="table-wrap mt-6">
          <table>
            <thead>
              <tr>
                <th scope="col">Control</th>
                <th scope="col">Protects against</th>
              </tr>
            </thead>
            <tbody>
              {LAYERS.map(([control, against]) => (
                <tr key={control}>
                  <td className="font-medium">{control}</td>
                  <td className="text-muted">{against}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-muted">
          The evidence for every claim on this page is in the workshop:{' '}
          <a className="text-accent underline" href="/workshop/07-compare/">
            07 · Original vs protected
          </a>{' '}
          and{' '}
          <a className="text-accent underline" href="/workshop/11-security-reality/">
            11 · Security reality check
          </a>
          .
        </p>
      </section>
    </div>
  )
}
