'use client'

import { useState } from 'react'

import { CopyButton } from './CopyButton'

export type CompareExample = {
  id: string
  title: string
  file: string
  original: string
  protected: string
  protectedBytes: number
  originalHtml: string
  protectedHtml: string
  check: string
  result: string
}

function Pane({ title, badge, code, html, expanded, wrap = false }: { title: string; badge: string; code: string; html: string; expanded: boolean; wrap?: boolean }) {
  return (
    <section aria-label={title} className="card flex min-w-0 flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{title}</h3>
          <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-muted">{badge}</span>
        </div>
        <CopyButton text={code} />
      </header>
      <div
        tabIndex={0}
        aria-label={`${title} code`}
        className={`numbered overflow-auto bg-paper-2 ${wrap ? 'wrap' : ''} ${expanded ? 'max-h-none' : 'max-h-[26rem]'}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}

export function CodeCompare({ examples }: { examples: CompareExample[] }) {
  const [activeId, setActiveId] = useState(examples[0]?.id)
  const [expanded, setExpanded] = useState(false)
  const active = examples.find((e) => e.id === activeId) ?? examples[0]
  if (!active) return null

  return (
    <div>
      <div role="tablist" aria-label="Examples" className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            type="button"
            role="tab"
            id={`tab-${example.id}`}
            aria-selected={example.id === active.id}
            aria-controls="compare-panel"
            onClick={() => setActiveId(example.id)}
            className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-muted hover:text-text aria-selected:border-accent aria-selected:bg-accent-soft aria-selected:text-accent"
          >
            {example.title}
          </button>
        ))}
      </div>

      <div id="compare-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <code className="font-mono text-xs">{active.file}</code>
          <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="font-medium text-accent hover:underline">
            {expanded ? 'Collapse code' : 'Expand code'}
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Pane title="Original Python" badge="readable source" code={active.original} html={active.originalHtml} expanded={expanded} />
          <Pane
            title="Protected output"
            badge={`${active.protectedBytes.toLocaleString('en')} bytes, shortened`}
            code={active.protected}
            html={active.protectedHtml}
            expanded={expanded}
            wrap
          />
        </div>

        <div className="card mt-4 flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center">
          <span className="font-semibold text-ok">✓ Same result from both builds</span>
          <code className="min-w-0 break-all font-mono text-xs text-muted">
            {active.check} → {active.result}
          </code>
        </div>
      </div>
    </div>
  )
}
