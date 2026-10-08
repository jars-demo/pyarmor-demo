import type { Metadata } from 'next'

import { Markdown } from '@/components/Markdown'
import { loadChapter } from '@/lib/markdown'

// Deliberately low-key: linked from the footer and chapter 12 only, not in the nav or sitemap.
export const metadata: Metadata = {
  title: 'Protect your own project',
  description: 'Apply the workshop workflow to a Python project you own.',
  alternates: { canonical: '/protect-your-project/' },
  robots: { index: false, follow: true },
}

export default async function ProtectYourProjectPage() {
  const { meta, body } = await loadChapter('protect-your-project')
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="border-b border-line pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Protect your own project</h1>
        {meta && <p className="mt-3 text-muted">⏱ {meta}</p>}
      </header>
      <div className="mt-8">
        <Markdown source={body} />
      </div>
    </article>
  )
}
