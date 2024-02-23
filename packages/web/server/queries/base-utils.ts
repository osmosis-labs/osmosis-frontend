import { Chain } from "@osmosis-labs/types";
import { apiClient, getChainRestUrl, isNil } from "@osmosis-labs/utils";
import { createClient, VercelKV } from "@vercel/kv";
import { Cache, CacheEntry, totalTtl } from "cachified";
import DataLoader from "dataloader";

import { ChainList } from "~/config/generated/chain-list";
import { runIfFn } from "~/utils/function";
import { superjson } from "~/utils/superjson";

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

// inspired by: https://github.com/mannyv123/cachified-redis-adapter/blob/main/src/index.ts
/** `cachified`-compatible implementation of a cache living on a remote resource. */
export class RemoteCache implements Cache {
  protected kvStore: VercelKV = createClient({
    url: process.env.TWITTER_KV_STORE_REST_API_URL!,
    token: process.env.TWITTER_KV_STORE_REST_API_TOKEN!,
  });

  name = "RemoteCache";

  async get(key: string) {
    const value = await this.kvStore.get(key);
    if (isNil(value) || typeof value !== "string") {
      return null;
    }
    // Note that parse can potentially throw an error here and the expectation is that the user of the adapter catches it
    return superjson.parse(value) as CacheEntry<unknown>;
  }

  async set(key: string, value: CacheEntry<unknown>) {
    const ttl = totalTtl(value?.metadata);
    const createdTime = value?.metadata?.createdTime;

    await this.kvStore.set(
      key,
      superjson.stringify(value),
      ttl > 0 && ttl < Infinity && typeof createdTime === "number"
        ? {
            // convert the exat to seconds by dividing by 1000
            exat: Math.ceil((ttl + createdTime) / 1000),
          }
        : undefined
    );
  }

  async delete(key: string) {
    await this.kvStore.del(key);
  }
}

export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    chainList = ChainList,
  }: {
    path: string | ((params: PathParameters) => string);
    chainList?: Chain[];
  }) =>
  async (
    ...params: PathParameters extends Record<any, any>
      ? [PathParameters & { chainId?: string }]
      : [{ chainId?: string }?]
  ): Promise<Result> => {
    const url = new URL(
      runIfFn(
        path,
        ...((params as [PathParameters & { chainId?: string }]) ?? [])
      ),
      getChainRestUrl({
        chainId:
          (params as [PathParameters & { chainId?: string }])[0]?.chainId ??
          chainList[0].chain_id,
        chainList,
      })
    );
    return apiClient<Result>(url.toString());
  };
