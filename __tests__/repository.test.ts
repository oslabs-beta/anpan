import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Repository, Schema } from "..";
import type { Client } from "../types.ts";

describe("Repository", () => {
  let schema: Schema;
  let repo: Repository;
  let client: Client;

  // describe("fetch", () => {
  //   beforeEach(() => {
  //     schema = new Schema("TestEntity", {
  //       aBoolean: { type: "boolean" },
  //       aNumber: { type: "number" },
  //       aString: { type: "string" },
  //     });
  //     // create a false client
  //     client = {
  //       json: {
  //         set: mock(() => {}),
  //         get: mock(() => {}),
  //         del: mock(() => {}),
  //       },
  //       expire: mock(() => {}),
  //       keys: mock(() => {}),
  //     };

  //     repo = new Repository(schema, client);
  //   });

  //   test("client get is called", () => {
  //     repo.fetch("fakeULID");
  //     expect(client.json.get).toHaveBeenCalled();
  //   });
  // });

  describe("remove", () => {
    beforeEach(() => {
      schema = new Schema("TestEntity", {
        aBoolean: { type: "boolean" },
        aNumber: { type: "number" },
        aString: { type: "string" },
      });
      // create a false client
      client = {
        json: {
          del: mock(() => {}),
          set: mock(() => {}),
          get: mock(() => {}),
        },
        expire: mock(() => {}),
        keys: mock(() => {}),
      };

      repo = new Repository(schema, client);
    });

    // create a false/test entity
    const myEntity = {
      aBoolean: true,
      aNumber: 4,
      aString: "this is a test entity",
    };

    // test("client get is called", () => {
    //   repo.remove("fakeULID");
    //   expect(client.json.get).toHaveBeenCalled();
    // });

    test("client del is called", () => {
      repo.remove("fakeULID");
      expect(client.json.del).toHaveBeenCalled();
    });
  });

//   describe("save", () => {
//     beforeEach(() => {
//       schema = new Schema("TestEntity", {
//         aBoolean: { type: "boolean" },
//         aNumber: { type: "number" },
//         aString: { type: "string" },
//       });
//       // create a false client
//       client = {
//         json: {
//           set: mock(() => {}),
//           get: mock(() => {}),
//           del: mock(() => {}),
//         },
//         expire: mock(() => {}),
//         keys: mock(() => {}),
//       };

//       repo = new Repository(schema, client);
//       console.log("repo: ", repo);
//     });
//     //create a false/test entity
//     const myEntity = {
//       aBoolean: true,
//       aNumber: 4,
//       aString: "this is a test entity",
//     };

//     test("client set is called", () => {
//       repo.save(myEntity);
//       expect(client.json.set).toHaveBeenCalled();
//     });
//   });
});
