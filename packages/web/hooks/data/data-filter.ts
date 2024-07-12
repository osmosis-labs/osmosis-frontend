import Fuse from "fuse.js";

import { DataProcessor } from "~/hooks/data/types";

/** Use an instance of `DataFilter` to let a user search a list of data. Powered by fuse.js.
 *  Indexes are maintained by each instance.
 */
export class DataFilter<TData> implements DataProcessor<TData[]> {
  readonly searcher: Fuse<TData>;

  constructor(readonly data: TData[], keys?: Fuse.FuseOptionKey<TData>[]) {
    this.searcher = new Fuse(data, {
      keys,
      findAllMatches: true,
      useExtendedSearch: true,
      // Set the threshold to 0.2 to allow a small amount of fuzzy search
      threshold: 0.2,
    });
  }

  process(userInput: string) {
    return this.searcher.search(userInput).map((result) => result.item);
  }
}
