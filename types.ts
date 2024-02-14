// export interface Fields {
//   [index: string]: {
//     type: string}
//     }

export interface Fields {
  [index: string]: {
    type: string | boolean,
    required?: boolean;
  };
}

export interface Client {
  json: {
    set: Function;
    get: Function;
    del: Function;
  };
  expire: Function;
  keys: Function;
}
export type StructureOption = "HASH" | "JSON";
