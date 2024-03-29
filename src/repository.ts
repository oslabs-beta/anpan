const ULID = require('ulid');
import { Schema } from './schema.ts';
import type { Client, Entity, Point } from './types.ts';

export class Repository {
  schema: Schema;
  client: Client;

  constructor(schema: Schema, client: Client) {
    this.schema = schema;
    this.client = client;
  }

  //Fetch requires a ULID parameter
  //Will search w/ULID to return back either null | object
  async fetch(ulid: string) {
    try {
      const result = await this.client.json.get(ulid);
      if (result === null) {
        throw new Error(`Key ${ulid} not found`);
      }
      return { ...result, entityKeyName: ulid };
    } catch (error) {
      console.error('Error fetching from Redis:', error);
      throw error;
    }
  }

  //Remove requires a ULID parameter
  //Will search w/ULID to delete found Entity and return void | null
  async remove(ulid: string): Promise<void> {
    try {
      const exists = await this.client.json.get(ulid);
      if (exists === null) {
        throw new Error(`Key ${ulid} does not exist`);
      }
      await this.client.json.del(ulid);
    } catch (error) {
      console.error('Error removing entity:', error);
      throw error;
    }
  }

  //Expire requires a ULID & Number parameters
  //Will search w/ULID and set timer of expiration on an entity
  //Will return void | null
  async expire(ulid: string, seconds: number): Promise<void> {
    const value = await this.client.json.get(ulid);
    if (value === null) {
      throw new Error(`Key ${ulid} does not exist`);
    }
    await this.client.expire(ulid, seconds);
  }

  //Save requires an Entity type parameter
  async save(entity: Entity): Promise<object> {
    const schemaFields = this.schema.getAllFields();

    //intialize object type that takes a string "key" as the key name and a string ('not found') as the value.  
    //This object will be populated with the required fields as set in the optional "isRequired: true" parameter during schema instantiation. 
    //The following lines iterate thru the schema of the entity fields to identify the required keys
    const requiredKeys: { [index: string]: string } = {};
    for (let k = 0; k < Object.entries(schemaFields).length; k++) {
      let keyName = Object.keys(schemaFields)[k];
      
      if (schemaFields[keyName].isRequired) {
        if (schemaFields[keyName].isRequired === true) {
          requiredKeys[keyName] = 'notFound';
        }
      }
    }

  
    //Check if entity has key which matches schema key
    //Check to see if the requiredKeys object has a property whose key matches the entity key that is being iterated on
    //If it does, change the value of the requiredKeys property to "Found", indicating that the isRequired key is present
    //Check if the type of the property matches the "type" property of the corresponding schema field
    for (let [key, value] of Object.entries(entity)) {
      if (key === 'entityKeyName') continue; 
      if (!schemaFields.hasOwnProperty(key))
        throw new Error(`schema does not have field ${key}`);

      if (requiredKeys.hasOwnProperty(key)) {
        requiredKeys[key] = 'Found';
      }

      switch (schemaFields[key].type) {
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
          if (
            !(value instanceof Date) &&
            !(typeof value === 'string' && !isNaN(new Date(value).getTime()))
          )
            
            throw new Error(`${key} must be of type Date, got ${value}`);
          break;
        case 'point':
          if (
            !(value as Point)
          ) {
            throw new Error(`${key} must be of type point`);
          }
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

    //Check to see if the requiredKeys object has any keys remaining with value of notFound. 
    //This would indicate a required field in the schema that was not found in the entity that was passed in as argument. 
    //(more specically, a property on the requiredKeys object whose value remains "notFound")
    if (Object.values(requiredKeys).includes('notFound')) {
      throw new Error(
        `must provide all required fields as specified in schema definition`
      );
    }

    const entityKeyName = entity.entityKeyName
      ? entity.entityKeyName
      : ULID.ulid();
    
    await this.client.json.set(entityKeyName, '$', entity);

    return { ...entity, entityKeyName };
  }

  //getAllEntities requires no parameters
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
    } catch (error) {
      console.error('Error fetching all entities:', error);
      throw error;
    }
  }

  //getByString requires a String type parameter
  //Will search by query string for an Entity w/matching field value.
  //Returns an object | object[] | null
  async getByString(query: string): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        const entityObj: { [key: string]: any } = entity;

        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'string' &&
            entityObj[field].includes(query)
          ) {
            results.push(entityObj);
          }
        }
      }
      if (results.length === 0) return null;
      if (results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific string:', error);
      throw error;
    }
  }

  //getByNumber requires a Number type parameter
  //Will search by query number for an Entity w/matching field value.
  //Returns an object | object[] | null
  async getByNumber(query: number): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        const entityObj: { [key: string]: any } = entity;

        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'number' &&
            entityObj[field] === query
          ) {
            results.push(entityObj);
          }
        }
      }
      if (results.length === 0) return null;
      if (results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific number:', error);
      throw error;
    }
  }

  //getByBoolean requires a Boolean type parameter
  //Will search by query boolean for an Entity w/matching field flag.
  //Returns an object | object[] | null
  async getByBoolean(query: boolean): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        const entityObj: { [key: string]: any } = entity;

        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'boolean' &&
            entityObj[field] === query
          ) {
            results.push(entityObj);
          }
        }
      }
      if (results.length === 0) return null;
      if (results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific boolean:', error);
      throw error;
    }
  }

  //getByDate requires three String type parameters
  //Must be in order of Year, Month, Day
  //Will search by query string for a Entity w/matching field value.
  //Returns an object | object[] | null
  async getByDate(
    year: string,
    month: string,
    day: string
  ): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const queryDate = `${year}-${month}-${day}`;
      const results: object[] = [];
      for (const entity of allEntities) {
        const entityObj: { [key: string]: any } = entity;

        for (const field in entityObj) {
          if (
            typeof entityObj[field] === 'string' &&
            entityObj[field].includes(queryDate)
          ) {
            results.push(entityObj);
          }
        }
      }
      if (results.length === 0) return null;
      if (results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching specific date:', error);
      throw error;
    }
  }

  //getByArray requires a String | Boolean | Number type parameter
  //Will search by query string for an Entity w/matching field value.
  //Returns an object | object[] | null
  async getByArray(
    query: string | boolean | number
  ): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        const entityObj: { [key: string]: any } = entity;

        for (const field in entityObj) {
          if (
            Array.isArray(entityObj[field]) &&
            entityObj[field].includes(query)
          ) {
            results.push(entityObj);
          }
        }
      }
      if (results.length === 0) return null;
      if (results.length === 1) return results[0];
      return results;
    } catch (error) {
      console.error('Error fetching in getOf:', error);
      throw error;
    }
  }
}
