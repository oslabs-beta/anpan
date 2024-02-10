import type { Fields, StructureOption } from './types';

export class Schema {
  name: string;
  fields: Fields;
  structureOption: StructureOption;

  constructor(
    schemaName: string,
    fields: Fields,
    structureOption: StructureOption = 'JSON'
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
