export interface Fields {
  [index: string]: {
    type: string;
  };
}
export interface Client {
  json: {
    set: Function;
    get: Function;
    del: Function;
  };
  expire: Function;
}
export type StructureOption = 'HASH' | 'JSON';
