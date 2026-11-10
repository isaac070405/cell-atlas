import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildModel } from '../src/index.js';

const cell = { id: 'hepatocyte', fractions: [
  { org: 'nucleus', value: 6 }, { org: 'mito', value: 18 }, { org: 'lyso', value: 1 },
] };

test('declared volumes equal the input fractions', () => {
  const m = buildModel(cell);
  assert.equal(m.declared.nucleus.toFixed(3), '6.000');
  assert.equal(m.declared.mito.toFixed(3), '18.000');
  assert.equal(m.remainder, 75);
});

test('same cell id gives the same layout', () => {
  assert.deepEqual(buildModel(cell).items[3].center, buildModel(cell).items[3].center);
});
