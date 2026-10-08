// `npm run build:static`: the public static build. Same pages, but the Lab page
// shows how to run the API locally instead of calling it. A script rather than an inline env var,
// so it also works in Windows shells.
import { spawnSync } from 'node:child_process'

const result = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_SITE_MODE: 'static' },
})
process.exit(result.status ?? 1)
