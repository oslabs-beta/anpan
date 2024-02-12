const ULID = require('ulid');
import { Schema } from './schema.ts';
import type { Client } from './types.ts';

export class Repository {
  schema: Schema;
  client: Client;

  constructor(schema: Schema, client: Client) {
    this.schema = schema;
    this.client = client;
  }

  async fetch(ulid: string) {
    return await this.client.json.get(ulid);
  }

  async save(entity: object) {
    // loop through entity
    // check if entity has key which matches schema key
    for (let [key, value] of Object.entries(entity)) {
      if (!this.schema.fields.hasOwnProperty(key))
        throw new Error(`schema does not have field ${key}`);

      // check if the type of the property matches the "type" proprty of the corresponding schema field
      switch (this.schema.fields[key].type) {
        case 'string':
          if (typeof value !== 'string')
            throw new Error(`${key} must be of type string`);
          break;
        case 'boolean':
          if (typeof value !== 'boolean')
            throw new Error(`${key} must be of type boolean`);
          break;
        case 'number':
          if (typeof value !== 'number')
            throw new Error(`${key} must be of type number`);
          break;
        case 'date':
          if (!(value instanceof Date))
            throw new Error(`${key} must be of type Date`);
          break;
        case 'point':
          if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            Object.keys(value).length === 2 &&
            typeof value.latitude === 'number' &&
            typeof value.longitude === 'number'
          )
            throw new Error(`${key} must be of type point`);
          break;
        case 'string[]':
          if (Array.isArray(value)) {
            value.forEach((el) => {
              if (typeof el !== 'string')
                throw new Error(`${key} must be of type string[]`);
            });
          } else throw new Error(`${key} must be of type string[]`);
          break;
        case 'number[]':
          if (Array.isArray(value)) {
            value.forEach((el) => {
              if (typeof el !== 'number')
                throw new Error(`${key} must be of type string[]`);
            });
          } else throw new Error(`${key} must be of type string[]`);
          break;
      }
    }

    const entityKeyName = ULID.ulid();
    await this.client.json.set(entityKeyName, '$', entity);

    return { ...entity, entityKeyName }; // necessary to stringify?
  }
}
