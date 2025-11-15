import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const convexDir = 'convex'
const patterns = [
  'query({',
  'mutation({',
  'internalQuery({',
  'internalMutation({',
  'action({',
  'internalAction({',
] // intentionally exclude httpAction because it returns a Response

test('convex functions include returns validators', async () => {
  const files = ['users.ts', 'paymentAttempts.ts', 'http.ts']
  for (const file of files) {
    const filePath = join(convexDir, file)
    const content = await readFile(filePath, 'utf8')
    for (const pattern of patterns) {
      let idx = content.indexOf(pattern)
      while (idx !== -1) {
        // check if 'returns:' appears within the next 120 chars or next 10 lines
        const searchWindow = content.slice(idx, idx + 800)
        const hasReturns = /returns\s*:/m.test(searchWindow)
        assert.ok(hasReturns, `${pattern} in ${filePath} must include a 'returns:' validator`)
        idx = content.indexOf(pattern, idx + 1)
      }
    }
  }
})
