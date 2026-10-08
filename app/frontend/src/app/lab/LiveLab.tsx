'use client'

import { useCallback, useEffect, useState } from 'react'

import { API_URL } from '@/lib/site'

type Info = { name: string; version: string; build: 'original' | 'protected'; pyarmor_runtime: string | null; python: string; environment: string }
type Analysis = {
  score: number
  risk_score: number
  classification: string
  recommendation: { action: string; message: string; requires_review: boolean }
  features: { value_index: number; engagement_index: number }
}
type Report = { analyses: number; average_score: number | null; by_classification: Record<string, number>; last_analysis_at: string | null }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json' } })
  const body = await response.json()
  if (!response.ok) {
    const detail = Array.isArray(body?.detail) ? body.detail.map((d: { msg: string }) => d.msg).join('; ') : response.statusText
    throw new Error(`${response.status}: ${detail}`)
  }
  return body as T
}

function Slider(props: { id: string; label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={props.id} className="text-sm font-medium">
          {props.label}
        </label>
        <output htmlFor={props.id} className="font-mono text-sm text-accent">
          {props.format(props.value)}
        </output>
      </div>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--accent)]"
      />
    </div>
  )
}

export function LiveLab() {
  const [info, setInfo] = useState<Info | null>(null)
  const [offline, setOffline] = useState(false)
  const [input, setInput] = useState({ customer_value: 75000, risk_factor: 0.32, engagement: 0.78 })
  const [result, setResult] = useState<Analysis | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const connect = useCallback(async () => {
    try {
      setInfo(await api<Info>('/api/info'))
      setReport(await api<Report>('/api/report'))
      setOffline(false)
    } catch {
      setOffline(true)
    }
  }, [])

  useEffect(() => {
    connect()
  }, [connect])

  async function analyze() {
    setBusy(true)
    setError(null)
    try {
      setResult(await api<Analysis>('/api/analyze', { method: 'POST', body: JSON.stringify(input) }))
      setReport(await api<Report>('/api/report'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  if (offline) {
    return (
      <div className="card p-6" role="status">
        <h2 className="text-lg font-semibold">The API is not reachable</h2>
        <p className="mt-2 text-muted">
          The Lab talks to the API on your machine. Start it with Docker (<code className="font-mono">docker compose up -d --build</code>) or,
          for development, <code className="font-mono">uv run python -m app</code>, then try again.
        </p>
        <button type="button" onClick={connect} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-text">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section aria-labelledby="status" className="card p-6 lg:col-span-2">
        <h2 id="status" className="sr-only">
          API status
        </h2>
        {info ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${info.build === 'protected' ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}
            >
              {info.build === 'protected' ? '🔒 Protected build' : 'Original source'}
            </span>
            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              <div className="flex gap-1.5">
                <dt>Runtime</dt>
                <dd className="font-mono text-text">{info.pyarmor_runtime ?? 'none'}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Python</dt>
                <dd className="font-mono text-text">{info.python}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Environment</dt>
                <dd className="font-mono text-text">{info.environment}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="text-muted">Connecting to the API…</p>
        )}
      </section>

      <section aria-labelledby="analyze" className="card p-6">
        <h2 id="analyze" className="font-semibold">
          POST /api/analyze
        </h2>
        <div className="mt-5 space-y-5">
          <Slider
            id="customer_value"
            label="Customer value"
            value={input.customer_value}
            min={0}
            max={1000000}
            step={5000}
            format={(v) => v.toLocaleString('en')}
            onChange={(v) => setInput({ ...input, customer_value: v })}
          />
          <Slider id="risk_factor" label="Risk factor" value={input.risk_factor} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setInput({ ...input, risk_factor: v })} />
          <Slider id="engagement" label="Engagement" value={input.engagement} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setInput({ ...input, engagement: v })} />
        </div>
        <button
          type="button"
          onClick={analyze}
          disabled={busy || !info}
          className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-text disabled:opacity-60"
        >
          {busy ? 'Analyzing…' : 'Analyze customer'}
        </button>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </section>

      <section aria-labelledby="result" aria-live="polite" className="card p-6">
        <h2 id="result" className="font-semibold">
          Result
        </h2>
        {result ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-end gap-4">
              <p className="text-5xl font-bold tracking-tight">{result.score}</p>
              <p className="pb-1.5 text-sm text-muted">
                business score · <span className="font-semibold capitalize text-text">{result.classification}</span>
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-paper-2 p-3">
                <dt className="text-xs text-muted">Risk score</dt>
                <dd className="font-mono">{result.risk_score}</dd>
              </div>
              <div className="rounded-lg bg-paper-2 p-3">
                <dt className="text-xs text-muted">Value index</dt>
                <dd className="font-mono">{result.features.value_index}</dd>
              </div>
              <div className="rounded-lg bg-paper-2 p-3">
                <dt className="text-xs text-muted">Engagement index</dt>
                <dd className="font-mono">{result.features.engagement_index}</dd>
              </div>
            </dl>
            <div className="rounded-lg border border-line p-3 text-sm">
              <p className="font-mono text-xs text-accent">{result.recommendation.action}</p>
              <p className="mt-1">{result.recommendation.message}</p>
              {result.recommendation.requires_review && <p className="mt-2 font-semibold text-warn">Needs a human review (high risk).</p>}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Move the sliders and analyze a customer. The defaults are the workshop&apos;s sample customer (score 78.33).</p>
        )}
      </section>

      <section aria-labelledby="report" className="card p-6 lg:col-span-2">
        <h2 id="report" className="font-semibold">
          GET /api/report
        </h2>
        {report && (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted">Analyses</dt>
              <dd className="font-mono text-lg">{report.analyses}</dd>
            </div>
            <div>
              <dt className="text-muted">Average score</dt>
              <dd className="font-mono text-lg">{report.average_score ?? '–'}</dd>
            </div>
            {Object.entries(report.by_classification).map(([label, count]) => (
              <div key={label}>
                <dt className="capitalize text-muted">{label}</dt>
                <dd className="font-mono text-lg">{count}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  )
}
