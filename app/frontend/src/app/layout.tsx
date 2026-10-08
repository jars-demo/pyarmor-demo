import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SITE_URL } from '@/lib/site'

import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

const TITLE = 'PyArmor Demo — Python Code Obfuscation Workshop'
const DESCRIPTION =
  'Hands-on PyArmor workshop for Python code obfuscation, runtime protection, Docker packaging, deployment, and security fundamentals.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · PyArmor Demo' },
  description: DESCRIPTION,
  applicationName: 'pyarmor-demo',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'PyArmor Demo',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { color: '#ffffff' },
  ],
}

// The brand is white-first: light unless the visitor picked dark with the toggle. Runs before
// first paint, so there is no flash.
const THEME_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem('theme')==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
