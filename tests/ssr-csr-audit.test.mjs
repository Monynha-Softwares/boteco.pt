import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

async function listFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const entries = await readdir(dir, { withFileTypes: true })
  let files = []
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(await listFiles(full, extensions))
    } else if (extensions.includes(path.extname(entry.name))) {
      files.push(full)
    }
  }
  return files
}

const BROWSER_APIS = [/\bdocument\./, /\bwindow\./, /\blocalStorage\b/, /\bmatchMedia\(/, /\bnavigator\./]

test('components and app pages using browser APIs are client components', async () => {
  const root = process.cwd()
  const checkDirs = [path.join(root, 'app'), path.join(root, 'components')]
  const violations = []
  for (const dir of checkDirs) {
    const exists = (await readdir(path.dirname(dir)).catch(() => null)) !== null
    if (!exists) continue
    const files = await listFiles(dir)
    for (const file of files) {
      const content = await readFile(file, 'utf8')
      const hasApi = BROWSER_APIS.some(rx => rx.test(content))
      if (!hasApi) continue
      const isClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'")
      if (!isClient) {
        violations.push(file)
      }
    }
  }
  if (violations.length > 0) {
    assert.fail('Found files using browser APIs without "use client" prefix:\n' + violations.join('\n'))
  }
})
