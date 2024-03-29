import { describe, expect, test, beforeEach } from "bun:test";
import { Schema } from "../src";

describe("Schema", () => {
  let schema: Schema;

  describe("that defines fields", () => {
    beforeEach(() => {
      schema = new Schema("TestEntity", {
        aBoolean: { type: "boolean" },
        aNumber: { type: "number" },
        aString: { type: "string" },
      });
    });

    test("returns a field by name", () => {
      const field = schema.getAllFields().aBoolean;
      expect(field).toBeDefined();
      // expect(field.aBoolean).toBe('aBoolean')
      expect(field.type).toBe("boolean");
    });

    test("returns schema name", () => {
      const schemaName = schema.getSchemaName();
      expect(schemaName).toBeDefined();
      expect(schemaName).toBe("TestEntity");
    });
  });
});
