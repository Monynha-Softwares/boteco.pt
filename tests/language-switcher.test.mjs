import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('LanguageSwitcher exists and uses useLanguage', async () => {
  const content = await readFile('components/LanguageSwitcher.tsx', 'utf8')
  assert.ok(content.includes('useLanguage'), 'LanguageSwitcher should use useLanguage hook')
  assert.ok(content.includes("PT"), 'LanguageSwitcher should render a PT control')
  assert.ok(content.includes("EN"), 'LanguageSwitcher should render an EN control')
})
