import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { Repository, Schema } from '../src/index.ts';
import type { Client, Entity } from '../src/types.ts';

describe('Repository', () => {
  let schema: Schema;
  let repo: Repository;
  let client: Client;
  let entity: Entity;

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

    // create a false/test entity
    entity = {
      aBoolean: true,
      aNumber: 4,
      aString: 'this is a test entity',
    };

    repo = new Repository(schema, client);
  });

  describe('fetch', () => {
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

  describe('remove', () => {
    test('client get is called', () => {
      repo.remove('fakeULID');
      expect(client.json.get).toHaveBeenCalled();
    });

    test('client del is called', async () => {
      await repo.remove('fakeULID');
      expect(client.json.del).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    test('client set is called', () => {
      repo.save(entity);
      expect(client.json.set).toHaveBeenCalled();
    });
  });
});
