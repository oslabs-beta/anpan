// export interface Fields {
//   [index: string]: {
//     type: string}
//     }

export interface Fields {
  [index: string]: {
    type: string | boolean;
    isRequired?: boolean;
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

export interface Entity {
  entityKeyName?: string;
}
