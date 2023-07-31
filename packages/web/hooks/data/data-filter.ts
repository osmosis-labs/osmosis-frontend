import Fuse from "fuse.js";

import { DataProcessor } from "./types";

/** Use an instance of `DataFilter` to let a user search a list of data. Powered by fuse.js.
 *  Indexes are maintained by each instance.
 */
export class DataFilter<TData> implements DataProcessor<TData[]> {
  readonly searcher: Fuse<TData>;

  constructor(readonly data: TData[], keys?: string[]) {
    this.searcher = new Fuse(data, {
      keys: keys,
      findAllMatches: true,
      useExtendedSearch: true,
    });
  }

  process(userInput: string) {
    return this.searcher.search(userInput).map((result) => result.item);
  }
}
