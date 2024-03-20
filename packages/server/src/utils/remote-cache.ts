import { isNil } from "@osmosis-labs/utils";
import { createClient, VercelKV } from "@vercel/kv";
import { Cache as CachifiedCache, CacheEntry, totalTtl } from "cachified";
import { LRUCache } from "lru-cache";

import { KV_STORE_REST_API_TOKEN, KV_STORE_REST_API_URL } from "../env";
import { DEFAULT_LRU_OPTIONS } from "./cache";
import { superjson } from "./superjson";

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
export class RemoteCache implements CachifiedCache {
  protected kvStore: VercelKV | null = null;

  protected fallbackCache: CachifiedCache | null = null;

  name = "RemoteCache:" + this.keyPrefix;

  /** To avoid data integrity issues in the shared cache, we need to prefix all keys per environment.
   *
   *  ref: https://vercel.com/docs/projects/environment-variables/system-environment-variables
   *
   *  The environment identifiers include:
   *  - The current commit hash of the frontend stack, to avoid unexpected data types across deployments.
   *  - The current Osmosis node environment (e.g. mainnet, testnet, etc.), to avoid unexpected data values across environments.
   *  - The current Vercel env, to avoid unexpected data types and values across deployments.
   */
  get keyPrefix() {
    return `${process.env.VERCEL_GIT_COMMIT_SHA ?? "localdev"}-${
      this.chainId
    }-${process.env.VERCEL_ENV ?? process.env.NODE_ENV}--`;
  }

  constructor(readonly chainId: string) {
    if (!isTestEnv) {
      const url = KV_STORE_REST_API_URL;
      const token = KV_STORE_REST_API_TOKEN;

      if (!url || !token) {
        console.error(
          "RemoteCache requires KV_STORE_REST_API_URL and KV_STORE_REST_API_TOKEN environment variables to be set. Falling back to in memory cache."
        );

        this.fallbackCache = new LRUCache<string, CacheEntry>(
          DEFAULT_LRU_OPTIONS
        );
        return;
      }

      try {
        this.kvStore = createClient({
          url,
          token,
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

    const value = await this.kvStore!.get(this.keyPrefix + key);
    // Cache miss: `volume === null`
    if (!value || isNil(value) || typeof value !== "object") {
      return null;
    }

    // Vercel KV provides value as a JSON-serialized JS object
    return superjson.parse(JSON.stringify(value)) as CacheEntry<T>;
  }

  async set<T>(key: string, value: CacheEntry<T>) {
    if (this.fallbackCache) {
      this.fallbackCache.set(key, value);
      return;
    }

    const ttl = totalTtl(value?.metadata);
    const createdTime = value?.metadata?.createdTime;

    await this.kvStore!.set(
      this.keyPrefix + key,
      superjson.stringify(value),
      ttl > 0 && ttl < Infinity && typeof createdTime === "number"
        ? {
            // convert the exat to seconds by dividing by 1000
            // ref: https://redis.io/commands/set/
            exat: Math.ceil((ttl + createdTime) / 1000),
          }
        : undefined
    ).catch((e) => {
      console.error(
        "Failed to set value in RemoteCache:",
        e instanceof Error ? e.message : e
      );
      return e;
    });
  }

  async delete(key: string) {
    if (this.fallbackCache) {
      this.fallbackCache.delete(key);
      return;
    }

    await this.kvStore!.del(this.keyPrefix + key);
  }
}
