import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('LanguageProvider file exists and defaultLocale set', async () => {
  const content = await readFile('components/LanguageProvider.tsx', 'utf8')
  assert.ok(content.includes('defaultLocale'), 'Expected defaultLocale prop to exist in LanguageProvider')
  assert.ok(content.includes("useLanguage"), 'Expected useLanguage export to exist')
})
