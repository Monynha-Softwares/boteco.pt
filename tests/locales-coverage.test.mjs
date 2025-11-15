import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

function getPath(obj, path) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (!cur || typeof cur !== 'object' || !(p in cur)) return undefined
    cur = cur[p]
  }
  return cur
}

const keys = [
  'cta.title',
  'cta.subtitle',
  'cta.primary',
  'cta.secondary',
  'features.heading',
  'features.lead',
  'features.campaigns',
  'features.scheduler',
  'features.blockquote',
  'features.creator',
  'faqs.title',
  'faqs.refundHeading',
  'faqs.refundBody',
  'faqs.refundStep1',
  'faqs.refundStep2',
  'faqs.refundStep3',
  'faqs.cancelHeading',
  'faqs.cancelBody',
  'faqs.upgradeHeading',
  'faqs.upgradeBody',
  'faqs.supportHeading',
  'faqs.supportBody'
]

test('locales contain expected keys (en and pt-BR)', async () => {
  const enRaw = await readFile('locales/en.json', 'utf8')
  const ptRaw = await readFile('locales/pt-BR.json', 'utf8')
  const en = JSON.parse(enRaw)
  const pt = JSON.parse(ptRaw)

  for (const k of keys) {
    assert.ok(getPath(en, k) !== undefined, `Missing key ${k} in locales/en.json`)
    assert.ok(getPath(pt, k) !== undefined, `Missing key ${k} in locales/pt-BR.json`)
  }
})
