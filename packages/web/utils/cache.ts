import { isNil } from "@osmosis-labs/utils";
import { createClient, VercelKV } from "@vercel/kv";
import { Cache, CacheEntry, totalTtl } from "cachified";
import { LRUCache } from "lru-cache";

import { superjson } from "~/utils/superjson";

export const DEFAULT_LRU_OPTIONS: LRUCache.Options<
  string,
  CacheEntry<unknown>,
  unknown
> = {
  max: 500,
};

export const LARGE_LRU_OPTIONS: LRUCache.Options<
  string,
  CacheEntry<unknown>,
  unknown
> = {
  max: 1_500,
};

const isTestEnv = process.env.NODE_ENV === "test";

// Client implementation inspired by: https://github.com/mannyv123/cachified-redis-adapter/blob/main/src/index.ts
/** `cachified`-compatible implementation of a cache living on a remote resource.
 *
 *  Values must be serializeable via `superjson` transformer.
 *
 *  NOTE: Uses an LRUCache in test environment to avoid hitting the remote resource as Vercel KV createClient secret env vars are not available in GH action.
 *
 *  WARNING: Only available in dev/prod node runtime (not browser).
 *
 *  Falls back to in-memory cache if the remote client is not able to be created.
 */
export class RemoteCache implements Cache {
  protected kvStore: VercelKV | null = null;

  protected fallbackCache: Cache | null = null;

  name = "RemoteCache";

  constructor() {
    if (!isTestEnv) {
      try {
        this.kvStore = createClient({
          url: process.env.TWITTER_KV_STORE_REST_API_URL!,
          token: process.env.TWITTER_KV_STORE_REST_API_TOKEN!,
        });
      } catch (e) {
        console.error(
          "Failed to create RemoteCache client. Falling back to in-memory cache..",
          e instanceof Error ? e.message : e
        );
        this.fallbackCache = new LRUCache<string, CacheEntry>(
          DEFAULT_LRU_OPTIONS
        );
      }
    } else {
      console.warn(
        "RemoteCache is not available in test environment. Falling back to in-memory cache.."
      );
      this.fallbackCache = new LRUCache<string, CacheEntry>(
        DEFAULT_LRU_OPTIONS
      );
    }
  }

  async get<T>(key: string) {
    if (this.fallbackCache) {
      return this.fallbackCache.get(key);
    }

    const value = await this.kvStore!.get(key);
    if (isNil(value) || typeof value !== "string") {
      return null;
    }
    // Note that parse can potentially throw an error here and the expectation is that the user of the adapter catches it
    return superjson.parse(value) as CacheEntry<T>;
  }

  async set<T>(key: string, value: CacheEntry<T>) {
    if (this.fallbackCache) {
      this.fallbackCache.set(key, value);
      return;
    }

    const ttl = totalTtl(value?.metadata);
    const createdTime = value?.metadata?.createdTime;

    await this.kvStore!.set(
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
    if (this.fallbackCache) {
      this.fallbackCache.delete(key);
      return;
    }

    await this.kvStore!.del(key);
  }
}
