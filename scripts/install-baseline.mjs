import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const { devDependencies } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const packages = Object.keys(devDependencies)
  .filter(name => name.startsWith('@deepseek-ai/dsh-'))
  .map(name => `${name}@0.1.1-rc.2`)
packages.push('@deepseek-ai/cordis@4.0.1')
// Older Harness publishes these runtime imports as peers. Install them
// explicitly instead of resolving the entire optional host/plugin ecosystem.
for (const name of ['brand', 'attachment', 'invariants', 'timeout', 'typert-protocol']) {
  packages.push(`@deepseek-ai/dsh-${name}@0.1.1-rc.2`)
}

// Only node_modules changes. npm ci restores the normal pinned environment.
execFileSync(process.execPath, [process.env.npm_execpath, 'install', '--no-save', '--package-lock=false', '--legacy-peer-deps', ...packages], {
  stdio: 'inherit',
})
