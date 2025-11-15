import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('app/layout sets default locale to pt-BR and uses htmlLang variable', async () => {
  const content = await readFile('app/layout.tsx', 'utf8')
  assert.ok(content.includes("defaultLocale={'pt-BR'}") || content.includes('defaultLocale="pt-BR"'), 'Expected LanguageProvider defaultLocale to be pt-BR')
  assert.ok(content.includes('html lang={htmlLang') || content.includes('html lang={htmlLang}'), 'Expected html lang to use htmlLang variable')
})

test('app/layout uses LanguageProvider', async () => {
  const content = await readFile('app/layout.tsx', 'utf8')
  assert.ok(content.includes('LanguageProvider'), 'Expected LanguageProvider to be imported/used in app/layout.tsx')
})
