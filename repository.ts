const ULID = require("ulid");
import { Schema } from "./schema.ts";
import type { Client, Entity } from "./types.ts";

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
      return { ...result, entityKeyName: ulid };
    } catch (error) {
      console.error("Error fetching from Redis:", error);
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
    //intialize object 'requiredkeys' that takes a string as the key name and a string as the value.
    //Using Object.entries array, iterate thru the fields object of the schema of the entity passed in as an argument.
    //Examine the name of each key in the fields object
    //if there is a key with name of "isRequired", check to see if its value is 'true'
    //if it is, create a new property on requiredKeys object with that keyname as key, and value of "not Found"

    const requiredKeys: { [index: string]: string } = {};
    for (let k = 0; k < Object.entries(this.schema.fields).length; k++) {
      let keyName = Object.keys(this.schema.fields)[k];
      // console.log('**key: ', keyName);
      if (this.schema.fields[keyName].isRequired) {
        if (this.schema.fields[keyName].isRequired === true) {
          requiredKeys[keyName] = "notFound";
        }
      }
    }

    // loop through entity
    // check if entity has key which matches schema key
    for (let [key, value] of Object.entries(entity)) {
      if (key === "entityKeyName") continue; // skip checks for ulid

      if (!this.schema.fields.hasOwnProperty(key))
        throw new Error(`schema does not have field ${key}`);

      //check to see if the requiredKeys object has a property whose key matches the entity key that is being iterated on
      //if it does, change the value of the requiredKeys property to "Found", indicating that the isRequired key is present
      if (requiredKeys.hasOwnProperty(key)) {
        requiredKeys[key] = "Found";
      }

      // check if the type of the property matches the "type" property of the corresponding schema field
      switch (this.schema.fields[key].type) {
        case "string":
          if (typeof value !== "string")
            throw new Error(`${key} must be of type string`);
          break;
        case "boolean":
          if (typeof value !== "boolean")
            throw new Error(`${key} must be of type boolean`);
          break;
        case "number":
          if (typeof value !== "number")
            throw new Error(`${key} must be of type number`);
          break;
        case "date":
          if (
            !(value instanceof Date) &&
            !(typeof value === "string" && !isNaN(new Date(value).getTime()))
          )
            // if (Object.prototype.toString.call(value) !== '[object Date]')
            throw new Error(`${key} must be of type Date, got ${value}`);
          break;
        case "point":
          if (
            value === null ||
            typeof value !== "object" ||
            Object.keys(value).length !== 2 ||
            typeof value.latitude !== "number" ||
            typeof value.longitude !== "number"
          ) {
            throw new Error(`${key} must be of type point`);
          }
          break;
        case "string[]":
          if (Array.isArray(value)) {
            value.forEach((el) => {
              if (typeof el !== "string")
                throw new Error(`${key} must be of type string[]`);
            });
          } else throw new Error(`${key} must be of type string[]`);
          break;
        case "number[]":
          if (Array.isArray(value)) {
            value.forEach((el) => {
              if (typeof el !== "number")
                throw new Error(`${key} must be of type string[]`);
            });
          } else throw new Error(`${key} must be of type string[]`);
          break;
      }
    }

    //check to see if the requiredKeys object has any keys remaining with value of notFound. This would indicate a required field in the schema that was not found in the entity that was passed in as argument (more specically, a property on the requiredKeys object whose value remains "notFound")
    //If so, throw error.

    if (Object.values(requiredKeys).includes("notFound")) {
      throw new Error(
        `must provide all required fields as specified in schema definition`
      );
    }

    // if entity has entityKeyName, already exists, so don't set a new one
    const entityKeyName = entity.entityKeyName
      ? entity.entityKeyName
      : ULID.ulid();
    // const entityKeyName = ULID.ulid();
    await this.client.json.set(entityKeyName, "$", entity);

    return { ...entity, entityKeyName };
  }

  //Will fetch/return all entities in current repository...& all MUST be JSON types.
  async getAllEntities(): Promise<object[]> {
    try {
      const allKeys = await this.client.keys("*");
      const entities = [];

      for (const key of allKeys) {
        const entity = await this.fetch(key);
        entities.push(entity);
      }

      return entities;
      // return allKeys;
    } catch (error) {
      console.error("Error fetching all entities:", error);
      throw error;
    }
  }

  //Will fetch/return first matching entity field value that matches queried string
  async getByString(query: string): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        //Had to create assertion to allow accessing properties by string index...
        const entityObj: { [key: string]: any } = entity;
        // const results = [];
        for (const field in entityObj) {
          if (
            typeof entityObj[field] === "string" &&
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
      console.error("Error fetching specific string:", error);
      throw error;
    }
  }

  //Will fetch/return first matching entity field value that matches queried number
  async getByNumber(query: number): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        //Had to create assertion to allow accessing properties by string index...
        const entityObj: { [key: string]: any } = entity;
        // const results = [];
        for (const field in entityObj) {
          if (
            typeof entityObj[field] === "number" &&
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
      console.error("Error fetching specific number:", error);
      throw error;
    }
  }

  async getByBoolean(query: boolean): Promise<object | object[] | null> {
    try {
      const allEntities: object[] = await this.getAllEntities();
      const results: object[] = [];
      for (const entity of allEntities) {
        //Had to create assertion to allow accessing properties by string index...
        const entityObj: { [key: string]: any } = entity;
        // const results = [];
        for (const field in entityObj) {
          if (
            typeof entityObj[field] === "boolean" &&
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
      console.error("Error fetching specific boolean:", error);
      throw error;
    }
  }
}
