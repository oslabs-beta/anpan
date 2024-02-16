import { describe, expect, test } from 'bun:test';
import { beforeEach } from 'bun:test';
import { Schema } from '..';

// console.log(Schema);

describe('Schema', () => {
  let schema: Schema;
  describe('that defines fields', () => {
    beforeEach(() => {
      schema = new Schema('TestEntity', {
        aBoolean: { type: 'boolean' },
        aNumber: { type: 'number' },
        aString: { type: 'string' },
      });
    });

    // test("has a type in value", () => expect(schema.fields.aBoolean.type).toBe('boolean'))

    test('returns a field by name', () => {
      const field = schema.getAllFields().aBoolean;
      expect(field).toBeDefined();
      // expect(field.aBoolean).toBe('aBoolean')
      expect(field.type).toBe('boolean');
    });

    test('returns a field by name', () => {
      const field = schema.getAllFields().aBoolean;
      expect(field).toBeDefined();
      // expect(field.aBoolean).toBe('aBoolean')
      expect(field.type).toBe('boolean');
    });
  });
});
