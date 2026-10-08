import type { ReactNode } from 'react'

// A plain bento cell: hairline border, label, title, content, optional link. No shadows or fills.
export function BentoCard({
  label,
  title,
  href,
  linkText = 'Read more',
  className = '',
  children,
}: {
  label: string
  title: string
  href?: string
  linkText?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <section className={`card flex min-w-0 flex-col p-5 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-wider text-faint">{label}</p>
      <h3 className="mt-1.5 font-semibold">{title}</h3>
      {children && <div className="mt-3 min-w-0 flex-1 text-sm text-muted">{children}</div>}
      {href && (
        <a href={href} className="mt-4 self-start text-sm font-medium text-accent hover:underline">
          {linkText} →
        </a>
      )}
    </section>
  )
}

// A small monospaced block for real command output inside a card.
export function Snippet({ children, tone }: { children: string; tone?: 'ok' | 'danger' }) {
  const color = tone === 'ok' ? 'text-ok' : tone === 'danger' ? 'text-danger' : 'text-text'
  return (
    <pre className={`h-full overflow-x-auto whitespace-pre-wrap [overflow-wrap:anywhere] rounded-lg border border-line bg-paper-2 px-3 py-2 font-mono text-[12px] leading-relaxed ${color}`}>
      {children}
    </pre>
  )
}
