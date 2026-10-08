import type { NextConfig } from 'next'

// A fully static site (out/): served by nginx in Docker, and by Vercel at pyarmor.jishanahmed.in.
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
}

export default config
