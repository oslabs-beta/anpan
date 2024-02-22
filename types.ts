// export interface Fields {
//   [index: string]: {
//     type: string}
//     }

export interface Fields {
  [index: string]: {
    // type: string | boolean; // when is this a boolean?
    type:
      | 'string'
      | 'boolean'
      | 'date'
      | 'number'
      | 'number[]'
      | 'string[]'
      | 'point'
      | 'text';
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

export type StructureOption = 'HASH' | 'JSON';

export interface Point {
  latitude: number;
  longitude: number;
}

export interface Entity {
  // entityKeyName: string;
  [key: string]: string | boolean | Date | Point;
}
