import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { Repository, Schema } from '..';
import type { Client, Entity } from '../types.ts';

describe('Repository', () => {
  let schema: Schema;
  let repo: Repository;
  let client: Client;
  let entity: Entity;

  describe('fetch', () => {
    beforeEach(() => {
      schema = new Schema('TestEntity', {
        aBoolean: { type: 'boolean' },
      });

      // create a mock client
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

      // create mock entity
      entity = {
        h: true,
      };
    });

    test('client get is called', () => {
      repo.fetch('fakeULID');
      expect(client.json.get).toHaveBeenCalled();
    });

    test('throws error if client get returns null', () => {
      client.json.get = mock(() => null);
      expect(() => repo.fetch('fakeULID')).toThrow(Error);
    });

    test('returns mock entity with entityKeyName', async () => {
      client.json.get = mock(() => entity);
      const expected = { ...entity, entityKeyName: 'fakeULID' };
      expect(await repo.fetch('fakeULID')).toEqual(expected);
    });
  });
});
