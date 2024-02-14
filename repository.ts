const ULID = require("ulid");
import { Schema } from "./schema.ts";
import type { Client } from "./types.ts";

export class Repository {
  schema: Schema;
  client: Client;

  constructor(schema: Schema, client: Client) {
    this.schema = schema;
    this.client = client;
  }
  async save(entity: object) {
    //intialize object type that takes a string "key" as the key name and a string ('not found') as the value.  This object will be populated with the required fields as set in the optional "required: true" parameter during schema instantiation. The following lines iterate thru the schema of the entity fields to identify the required keys

    const requiredKeys: { [index: string]: string } = {};
    for (let k = 0; k < Object.entries(this.schema.fields).length; k++) {
      let keyName = Object.keys(this.schema.fields)[k];
      console.log("**key: ", keyName);
      if (this.schema.fields[keyName].required) {
        if (this.schema.fields[keyName].required === true) {
          requiredKeys[keyName] = "notFound";
        }
      }
    }

    // loop through entity
    // check if entity has key which matches schema key
    for (let [key, value] of Object.entries(entity)) {
      if (!this.schema.fields.hasOwnProperty(key))
        throw new Error(`schema does not have field ${key}`);
      //check to see if this is a required key; if it is, annotate "Found" on the requiredKeys object
      if (requiredKeys.hasOwnProperty(key)) {
        requiredKeys[key] = "Found";
      }

      // check if the type of the property matches the "type" proprty of the corresponding schema field
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
          if (!(value instanceof Date))
            throw new Error(`${key} must be of type Date`);
          break;
        case "point":
          if (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            Object.keys(value).length === 2 &&
            typeof value.latitude === "number" &&
            typeof value.longitude === "number"
          )
            throw new Error(`${key} must be of type point`);
          break;
      }
    }
    //check to see if the requiredKeys object has any keys with value notFound. If so, throw error.
    console.log("**requiredKeys at end of looping is: ", requiredKeys);
    if (Object.values(requiredKeys).includes("notFound"))
      throw new Error(
        `must provide all required fields as specified in schema definition`
      );
  }

  return;
}
