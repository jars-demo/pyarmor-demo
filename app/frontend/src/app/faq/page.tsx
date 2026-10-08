import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Straight answers about Python obfuscation and PyArmor: encryption, reverse engineering, secrets, Docker and production use.',
  alternates: { canonical: '/faq/' },
}

const FAQ = [
  {
    q: 'What is Python obfuscation?',
    a: 'Transforming Python code so it still runs but is much harder to read and understand. PyArmor replaces each module with a small stub and an encrypted payload, which its runtime decodes in memory when the module is imported.',
  },
  {
    q: 'Why would I obfuscate Python?',
    a: 'Python usually ships as readable source. If you deliver software to customers or partners who run it on their own machines, obfuscation makes it much harder for them to read, copy or modify your logic.',
  },
  {
    q: 'Does PyArmor encrypt my source code?',
    a: 'It uses encryption (AES, RSA) internally, but the result is obfuscation, not secrecy in the cryptographic sense. To run, the code must be decoded, and what is needed for that ships with the app inside the runtime. Treat it as raising the reverse-engineering effort, not as encrypted storage.',
  },
  {
    q: 'Can obfuscated Python be reverse engineered?',
    a: 'With enough time, skill and access, the behaviour of any program that runs on a machine you do not control can be studied. Obfuscation makes that much more expensive. It does not make it impossible, and no honest tool claims it does for code running in an attacker-controlled environment.',
  },
  {
    q: 'Does obfuscation protect secrets?',
    a: 'No. A secret the code uses must exist in plain form in memory when it is used, and often appears in requests, logs and error reports. The workshop shows constants being read from a protected module at runtime.',
  },
  {
    q: 'Should I put API keys in protected code?',
    a: 'Never. Keep secrets out of code entirely, protected or not. Inject them at runtime from a secrets manager, scope them narrowly, and rotate them.',
  },
  {
    q: 'Does Docker make source code secure?',
    a: 'No. Anyone with the image can list its files, read its layers and inspect its environment variables. A multi-stage build can keep source out of the final image, but the image itself is fully readable to whoever has it.',
  },
  {
    q: 'Does PyArmor replace access control?',
    a: 'No. Access control decides who can reach your servers, containers and data. Obfuscation only affects how readable your shipped code is.',
  },
  {
    q: 'Does PyArmor replace a secrets manager?',
    a: 'No. They solve different problems: a secrets manager stores, scopes, audits and rotates credentials. Obfuscation does none of that.',
  },
  {
    q: 'Should I use PyArmor in production?',
    a: 'Yes, when you ship code to environments you do not control and the logic is worth protecting, with a proper license (the trial is not for commercial products that earn real money). It adds little for code that only runs on your own servers, where access control matters far more.',
  },
  {
    q: 'What happens if someone gets shell access?',
    a: 'Then they control the execution environment. They can run the app, call its functions, read environment variables and files, watch inputs and outputs, and inspect the process. Obfuscation is not the boundary at that point: access control, isolation, monitoring and secrets management are.',
  },
  {
    q: 'Which PyArmor version does this workshop use?',
    a: 'PyArmor 9.2.7 (trial) on Python 3.12. Commands such as pyarmor obfuscate or pyarmor pack belong to PyArmor 7 and earlier; the current command is pyarmor gen.',
  },
]

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">FAQ</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h1>
      <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-paper">
        {FAQ.map((item) => (
          <details key={item.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {item.q}
              <span aria-hidden="true" className="text-faint transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
