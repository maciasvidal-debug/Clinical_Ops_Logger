import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { generateId } from './id_utils.ts';

describe('generateId', () => {
  it('should generate a string', () => {
    const id = generateId();
    assert.strictEqual(typeof id, 'string');
  });

  it('should generate a valid UUID', () => {
    const id = generateId();
    // UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(id, uuidRegex);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.notStrictEqual(id1, id2);
  });
});
