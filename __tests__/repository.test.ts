import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { Repository, Schema } from '..';
import type { Client } from '../types.ts'

describe('Repository', () => {
  let schema: Schema;
  let repo: Repository;
  let client: Client;
  
  describe('fetch', ()=> {
    // create a false client
    beforeEach(() => {
      schema = new Schema('TestEntity', {
        aBoolean: { type: 'boolean' },
        aNumber: { type: 'number' },
        aString: { type: 'string' },
      });
      client = 
        {
          json: {
            set: mock(() => {}),
            get: mock(() => {}),
            del: mock(() => {}),
          },
          expire: mock(() => {}),
          keys: mock(() => {}),
        }
      
      repo = new Repository(schema, client)
    })
  })
});
