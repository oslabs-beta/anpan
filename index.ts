const ULID = require('ulid');

class Schema {
  name: string;
  fields: object;
  structureOption: string;

  constructor(
    schemaName: string,
    fields: object,
    structureOption: string = 'JSON'
  ) {
    this.name = schemaName;
    this.fields = fields;
    this.structureOption = structureOption;

    for (let [key, value] of Object.entries(fields)) {
      if (typeof value !== 'object')
        throw new Error('properties must be objects');
      if (!value.hasOwnProperty('type'))
        throw new Error('property must have a type');
      if (
        value.type !== 'boolean' &&
        value.type !== 'date' &&
        value.type !== 'number' &&
        value.type !== 'number[]' &&
        value.type !== 'point' &&
        value.type !== 'string' &&
        value.type !== 'string[]' &&
        value.type !== 'text'
      )
        throw new Error(`${value.type} is not a valid data type`);
    }
  }
}
//import { createClient, createCluster, RediSearchSchema, SearchOptions } from 'redis'
class Repository {
  schema: object;
  client: object;

  constructor(schema: object, client: object) {
    this.schema = schema;
    this.client = client;
  }
  async save(entity: object) {
    // loop through entity
    // check if entity has key which matches schema key
    for (let [key, value] of Object.entries(entity)) {
      console.log(this.schema);
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
      }
    }

    // const EntityKeyName = Symbol(ULID.ulid());
    // entity['EntityKeyName'] = EntityKeyName;

    // need to generate the EntityKeyName
    // const keyName = entity[EntityKeyName]!;

    // await this.client.json.set(EntityKeyName.toString(), '$', entity);
    await this.client.json.set(ULID.ulid(), '$', entity);

    // await this.client.set('test1', 'may');
    return;
  }
}

// const bicycles = new Schema('bicycles', {
//   model: { type: 'string' },
// });
// const flyer = {
//   model: 5,
// };
// bicycles.save(flyer);
// console.log(bicycles);

module.exports = {
  sayHi: () => {
    console.log('Anpan says hi!');
    return;
  },
  Schema,
  Repository,
};
