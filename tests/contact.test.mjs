import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('Contact page exists and has form elements', async () => {
  const content = await readFile('app/(landing)/contact/page.tsx', 'utf8')
  assert.ok(content.includes('<form'), 'Contact page should contain a <form>')
  assert.ok(content.includes('input type="email"'), 'Contact form should include email input')
  assert.ok(content.includes('textarea'), 'Contact form should include a textarea')
})
