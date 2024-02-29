import type { Fields, StructureOption } from './types';

export class Schema {
  private name: string;
  private fields: Fields;
  structureOption: StructureOption;

  constructor(
    schemaName: string,
    fields: Fields,
    structureOption: StructureOption = 'JSON'
  ) {
    this.name = schemaName;
    this.fields = fields;
    this.structureOption = structureOption;
  }

  //Create Fetch/Get Methods:
  //One for Schema Name
  getSchemaName(): string {
    return this.name;
  }
  //One for all Fields
  getAllFields(): Fields {
    return this.fields;
  }
}
