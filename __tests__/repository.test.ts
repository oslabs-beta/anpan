import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { Repository, Schema } from '..';
import type { Client } from '../types.ts';

describe('Repository', () => {
  let schema: Schema;
  let repo: Repository;
  let client: Client;

  describe('fetch', () => {
    beforeEach(() => {
      schema = new Schema('TestEntity', {
        aBoolean: { type: 'boolean' },
        aNumber: { type: 'number' },
        aString: { type: 'string' },
      });
      // create a false client
      client = {
        json: {
          set: mock(() => {}),
          get: mock(() => {}),
          del: mock(() => {}),
        },
        expire: mock(() => {}),
        keys: mock(() => {}),
      };

      repo = new Repository(schema, client);
    });

    test('client get is called', () => {
      repo.fetch('fakeULID');
      expect(client.json.get).toHaveBeenCalled();
    });
  });
});
