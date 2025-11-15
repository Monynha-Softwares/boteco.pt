import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('app/layout sets HTML lang to pt-BR', async () => {
  const content = await readFile('app/layout.tsx', 'utf8')
  assert.ok(content.includes('lang="pt-BR"'), 'Expected lang="pt-BR" in app/layout.tsx')
})

test('app/layout uses LanguageProvider', async () => {
  const content = await readFile('app/layout.tsx', 'utf8')
  assert.ok(content.includes('LanguageProvider'), 'Expected LanguageProvider to be imported/used in app/layout.tsx')
})
