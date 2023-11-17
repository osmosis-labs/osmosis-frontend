export type Head<T extends any[]> = T extends [...infer Head, any]
  ? Head
  : any[];
