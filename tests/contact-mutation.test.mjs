import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('Contact page uses createLead convex mutation', async () => {
  const content = await readFile('app/(landing)/contact/page.tsx', 'utf8')
  assert.ok(content.includes('useMutation(api.leads.create)'), 'The contact page should call useMutation(api.leads.create)')
})
