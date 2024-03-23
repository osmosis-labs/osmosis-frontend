import DataLoader from "dataloader";

/** Batching DataLoader with Vercel Edge compatible batching scheduler.
 *
 *  DataLoader creates a public API for loading data from a particular
 *  data back-end with unique keys such as the id column of a SQL table
 *  or document name in a MongoDB database, given a batch loading function.
 *
 *  Each DataLoader instance contains a unique memoized cache. Use caution
 *  when used in long-lived applications or those which serve many users
 *  with different access permissions and consider creating a new instance
 *  per web request.
 */
export class EdgeDataLoader<K, V, C = K> extends DataLoader<K, V, C> {
  constructor(...args: ConstructorParameters<typeof DataLoader<K, V, C>>) {
    super(args[0], {
      // workaround to work on Vercel Edge runtime
      // prevents access of process.nextTick
      batchScheduleFn: (cb) => setTimeout(cb, 0),
      ...args[1],
    } as ConstructorParameters<typeof DataLoader<K, V, C>>[1]);
  }
}
