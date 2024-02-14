import type { Fields, StructureOption } from "./types";

export class Schema {
  name: string;
  fields: Fields;
  structureOption: StructureOption;

  constructor(
    schemaName: string,
    fields: Fields,
    structureOption: StructureOption = "JSON"
  ) {
    this.name = schemaName;
    this.fields = fields;

    this.structureOption = structureOption;

    //Creating Entries here
    for (let [key, value] of Object.entries(fields)) {
      if (typeof value !== "object")
        throw new Error("properties must be objects");
      if (!value.hasOwnProperty("type"))
        throw new Error("property must have a type");
      if (
        value.type !== "boolean" &&
        value.type !== "date" &&
        value.type !== "number" &&
        value.type !== "number[]" &&
        value.type !== "point" &&
        value.type !== "string" &&
        value.type !== "string[]" &&
        value.type !== "text"
      ) {
        throw new Error(`${value.type} is not a valid data type`);
      }
    }
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

  //Create Update Method:
  //One to Update Fields on a Schema
  // updateFields(newFields: Fields): void {
  //   //Error checking
  //   for (let [key, value] of Object.entries(newFields)) {
  //     if (typeof value !== 'object')
  //       throw new Error('Property must be an object');
  //     if (!value.hasOwnProperty('type'))
  //       throw new Error('Property must include a type');
  //     if (
  //       value.type !== 'boolean' &&
  //       value.type !== 'date' &&
  //       value.type !== 'number' &&
  //       value.type !== 'number[]' &&
  //       value.type !== 'point' &&
  //       value.type !== 'string' &&
  //       value.type !== 'string[]' &&
  //       value.type !== 'text'
  //     )
  //       throw new Error(`${value.type} is not a valid data type`);

  //     //Overwrite/Reassign updated fields
  //     this.fields = { ...this.fields, ...newFields };
  //   }
  // }

  //Create Delete Method:
  //One to Delete a Schema
  //One to Delete a Field on a Schema
//   deleteField(fieldName: string): void {
//     if (!this.fields.hasOwnProperty(fieldName)) {
//       throw new Error(`${fieldName} does not exist in schema`);
//     }

//     //delete the field if it exists
//     delete this.fields[fieldName];
//   }
}
