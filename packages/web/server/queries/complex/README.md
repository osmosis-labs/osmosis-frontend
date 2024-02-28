# Complex Queries

This file contains complex query functions: the combination of raw query data from various sources for the specific needs of the frontend. They can be composed together to meet the specific needs of the feature you're implementing. It can also contain business logic.

## Caching

Functions are often wrapped in a caching layer to prevent unnecessary database calls and data processing. This is done using the [`cachified`](https://github.com/epicweb-dev/cachified) library. Most functions, except those that rely on real-time user data (such as bank balances), are wrapped. The actual cache implementation is passed to `cachified` to store the data: for in-memory caching we use [`lru-cache`](https://github.com/isaacs/node-lru-cache). For caching data in a remote server, we have a proxy object called `RemoteCache` that behaves similarly.

The `key` value should include all stringified inputs that needed are in `getFreshValue`.

### Cache Timing

Cachified includes two settings for specifying the lifetime of a cached value: `ttl` and `staleWhileRevalidate`. The `ttl` is the time-to-live, or the maximum time a value should be cached. The `staleWhileRevalidate` is the time a value can be served after it has expired, while the cache is being updated in the background. This is useful for ensuring that the user does not experience a delay while the cache is being updated.

With this, once a value is cached and the function is called again, the following happens:

- The `ttl` is checked against the current time. If it's still live, it's returned.
- If the current time has exceeded the `ttl` BUT NOT the `staleWhileRevalidate` time, the "stale" value is returned immediately, and a new value is created in the background for use in future requests. This ensures that the user does not experience a delay while the cache is being updated.
- If for whatever reason (often failed/slow query, a bug, etc.) the current time has exceeded `staleWhileRevalidate`, the cache is updated synchronously and the new value is returned. The user must wait for a new value to be created. This is often the case when the the underlying function is failing and the error is propagated to the user.

Example:

```javascript
// in memory cache
const cache = new LRUCache<string, Cache>({ max: 20 });
async function getAssetData({ denom }: { denom: string }) {
  return cachified({
    cache,
    key: `asset-data-${denom}`, // string inputs needed in `getFreshValue` included in key
    ttl: 1000 * 60, // 1 minute (bonus: with an explanation as to why)
    staleWhileRevalidate: 1000 * 60 * 2, // 2 minutes (some duration slightly longer than ttl, bonus: with an explanation as to why)
    getFreshValue: async ({ background }) => {
      // get fresh asset data
      // background: a boolean value that can be used to determine if value is being created in the background (ttl has expired, but not staleWhileRevalidate) or if it is created synchronously (staleWhileRevalidate has expired)
    },
  });
}
```

### Batching

We use a library called [`dataloader`](https://github.com/graphql/dataloader) to handle batched queries.

Batching is useful when working with queries that accept a list of identifiers, such as the CoinGecko price query. Instead of making a separate query for each identifier, we can batch them together and make a single query. This is especially useful when the query is slow or rate-limited. Regardless, networking overhead is reduced with this approach.

The `DataLoader` object uses the event loop for batching. For example, if you were iterating over an array of asset denoms and calling `.load(assetDenom)` on each one, the `DataLoader` would batch them together and make a single query for a batch of asset denoms in the event loop.

For an example see `getCoingeckoPrice` in assets/price.ts.

## Creating a new complex query

Recommendations:

- If the query does not rely on real-time user data (data that is subject to change from transactions initiated on frontend), it should include caching. `ttl` and `staleWhileRevalidate` should be set to reasonable values depending on how often the underlying data changes. Bonus points for adding a comment nearby explaining the rationale for why those particular values are used (example: `// 3 minutes - includes shifting price data`).
- The function should be well-documented, including the purpose of the query, the data it returns, and the caching strategy.
- Try to make the function generic:
  - The name of the function should correspond roughly to the type of data it returns, rather then the feature that is using it.
  - Prefer returning all the data returned by underlying queries, instead of specific values needed by your feature. This allows the function and its returned data to more readibly be reused in other features.
  - If it includes many params, especially optional params, it should accept an object as a parameter. Otherwise, one or two function parameters are fine.
- If values will not exceed 1MB and are especially expensive to query or calculate, the `RemoteCache` can be used. This will be shared amongst all server runtimes. Due to networking overhead, it is recommeneded to use `LRUCache` for smaller or more critical values, or values that exceed 1MB. See [Vercel limitations](https://vercel.com/docs/functions/limitations) for more information.
