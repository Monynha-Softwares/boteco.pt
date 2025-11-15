import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('Header uses locale provider and routes are english', async () => {
  const content = await readFile('app/(landing)/header.tsx', 'utf8')
  assert.ok(content.includes('useLanguage'), 'Header should use useLanguage hook')
  assert.ok(content.includes("LanguageSwitcher"), 'Header should include LanguageSwitcher')
  // Ensure English routes are present
  assert.ok(content.includes('/about'), 'Expected /about route in header')
  assert.ok(content.includes('/pricing'), 'Expected /pricing route in header')
  assert.ok(content.includes('/solutions'), 'Expected /solutions route in header')
})
