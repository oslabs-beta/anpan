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
    try {
      const result = await this.client.json.get(ulid);
      if (result === null) {
        throw new Error(`Key ${ulid} not found`);
      }
      return result;
    } catch (error) {
      console.error('Error fetching from Redis:', error);
      throw error;
    }
    // return await this.client.json.get(ulid);
  }

  async remove(ulid: string): Promise<void> {
    const exists = await this.client.json.get(ulid);
    if (exists === null) {
      throw new Error(`Key ${ulid} does not exist`);
    }
    await this.client.json.del(ulid);
  }

  async expire(ulid: string, seconds: number): Promise<void> {
    const value = await this.client.json.get(ulid);
    if (value === null) {
      throw new Error(`Key ${ulid} does not exist`);
    }
    await this.client.expire(ulid, seconds);
  }

  async save(entity: object): Promise<object> {
    // loop through entity
    // check if entity has key which matches schema key
    for (let [key, value] of Object.entries(entity)) {
      if (!this.schema.fields.hasOwnProperty(key))
        throw new Error(`schema does not have field ${key}`);

      // check if the type of the property matches the "type" property of the corresponding schema field
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

  //Will fetch/return all entities in current repository...& all MUST be JSON types.
  async getAllEntities(): Promise<object[]> {
    try {
      const allKeys = await this.client.keys('*');
      const entities = [];

      for (const key of allKeys) {
        const entity = await this.fetch(key);
        entities.push(entity);
      }

      return entities;
      // return allKeys;
    } catch (error) {
      console.error('Error fetching all entities:', error);
      throw error;
    }
  }

  //Will fetch/return first matching entity field value that matches queried string
  async getByString(query: string): Promise<object | object[]> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        //Had to create assertion to allow accessing properties by string index...
        const entityObj: { [key: string]: any } = entity;
        // const results = [];
        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'string' &&
            entityObj[field].includes(query)
          ) {
            results.push(entityObj);
          }
        }
      }
      if(results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific string:', error);
      throw error;
    }
  }

  //Will fetch/return first matching entity field value that matches queried number
  async getByNumber(query: number): Promise<object | object[]> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        //Had to create assertion to allow accessing properties by string index...
        const entityObj: { [key: string]: any } = entity;
        // const results = [];
        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'number' &&
            entityObj[field] === query
          ) {
            results.push(entityObj);
          }
        }
      }
      if(results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific number:', error);
      throw error;
    }
  }

  async getByBoolean(query: boolean): Promise<object | object[]> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        //Had to create assertion to allow accessing properties by string index...
        const entityObj: { [key: string]: any } = entity;
        // const results = [];
        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'boolean' &&
            entityObj[field] === query
          ) {
            results.push(entityObj);
          }
        }
      }
      if(results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific boolean:', error);
      throw error;
    }
  }
}
