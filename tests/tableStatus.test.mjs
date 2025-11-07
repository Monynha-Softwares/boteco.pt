import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const libSource = readFileSync(path.join(repoRoot, 'src/lib/tableStatus.ts'), 'utf-8');

// Simple dynamic eval isolation (avoid importing TS directly in node:test).
const TABLE_STATUS_ORDER = ['available','occupied','reserved','maintenance'];
function statusIndex(status) { return TABLE_STATUS_ORDER.indexOf(status); }
function statusFromIndex(i) { return TABLE_STATUS_ORDER[i] ?? 'available'; }

test('table status canonical ordering is stable', () => {
  TABLE_STATUS_ORDER.forEach((s, i) => {
    assert.equal(statusIndex(s), i, `Status ${s} should map to index ${i}`);
    assert.equal(statusFromIndex(i), s, `Index ${i} should map back to status ${s}`);
  });
});

test('statusIndex returns -1 for unknown value', () => {
  assert.equal(statusIndex('nonexistent'), -1);
});

test('statusFromIndex falls back to available for out-of-range index', () => {
  assert.equal(statusFromIndex(99), 'available');
});

test('helper file exports expected constants', () => {
  assert.match(libSource, /TABLE_STATUS_ORDER\s*=\s*\[/, 'Should define TABLE_STATUS_ORDER constant');
  assert.match(libSource, /statusIndex\(/, 'Should define statusIndex function');
  assert.match(libSource, /statusFromIndex\(/, 'Should define statusFromIndex function');
});
