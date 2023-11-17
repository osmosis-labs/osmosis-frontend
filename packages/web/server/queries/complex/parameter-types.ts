export type Search = {
  query: string;
};

export type Sort<TKeyPaths extends string = string> = {
  keyPath: TKeyPaths;
  direction: "asc" | "desc";
};
