import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const [archive] = JSON.parse(execFileSync(process.execPath, [process.env.npm_execpath, 'pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
}))
const files = new Set(archive.files.map(file => file.path))
for (const path of ['package.json', 'cordis.patch.yml', 'lib/index.js', 'lib/index.d.ts', 'lib/client.js', 'lib/client.d.ts', 'lib/types.js', 'lib/types.d.ts']) {
  assert(files.has(path), `Missing package entry: ${path}`)
}
assert(![...files].some(path => /^(tests|scripts|node_modules)\//.test(path)), 'Development files leaked into package')
const client = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
assert(client.includes('window.__ModuleLoader__.load('), 'Missing ModuleLoader registration')
assert(client.includes('require("@deepseek-ai/dsh-client-runtime/client")'), 'Client runtime must remain external')
assert(!/document\.(querySelector|head|createElement)|\.closest\(/.test(client), 'Client bundle accesses host DOM')
assert(client.includes('pointer-events:none'), 'Missing bundled overlay stylesheet')
console.log(`Package validated: ${archive.files.length} files, ${archive.size} bytes (dry run; no archive created).`)
