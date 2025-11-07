// Unit test for computeOccupancy helper
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { computeOccupancy } from '../src/lib/api/tables.utils.ts';

const mk = (status) => ({ status });

test('computeOccupancy handles empty', () => {
  const res = computeOccupancy([]);
  assert.equal(res.occupied, 0);
  assert.equal(res.total, 0);
  assert.equal(res.occupancyRate, 0);
});

test('computeOccupancy basic math', () => {
  const tables = [mk('available'), mk('occupied'), mk('occupied'), mk('maintenance')];
  const res = computeOccupancy(tables);
  assert.equal(res.occupied, 2);
  assert.equal(res.total, 3); // 4 total - 1 maintenance
  assert.equal(res.occupancyRate, 2 / 3);
});
