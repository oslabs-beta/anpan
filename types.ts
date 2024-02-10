export interface Fields {
  [index: string]: {
    type: string;
  };
}
export interface Client {
  json: {
    set: Function;
  };
}
export type StructureOption = 'HASH' | 'JSON';
