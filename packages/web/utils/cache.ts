import { isNil } from "@osmosis-labs/utils";
import { createClient, VercelKV } from "@vercel/kv";
import { Cache, CacheEntry, totalTtl } from "cachified";
import { LRUCache } from "lru-cache";

import { superjson } from "~/utils/superjson";

const isTestEnv = process.env.NODE_ENV === "test";

// inspired by: https://github.com/mannyv123/cachified-redis-adapter/blob/main/src/index.ts
/** `cachified`-compatible implementation of a cache living on a remote resource.
 *
 *  Data must be serializeable via `superjson` adapter.
 *
 *  NOTE: uses an LRUCache in test environment to avoid hitting the remote resource.
 *
 *  WARNING: only available in node runtime.
 */
export class RemoteCache implements Cache {
  protected kvStore: VercelKV | null = null;

  protected testEnvKvStore = isTestEnv
    ? new LRUCache<string, CacheEntry>({ max: 50 })
    : null;

  name = "RemoteCache";

  constructor() {
    if (!isTestEnv) {
      this.kvStore = createClient({
        url: process.env.TWITTER_KV_STORE_REST_API_URL!,
        token: process.env.TWITTER_KV_STORE_REST_API_TOKEN!,
      });
    }
  }

  async get<T>(key: string) {
    if (this.testEnvKvStore) {
      return this.testEnvKvStore.get(key);
    }

    const value = await this.kvStore!.get(key);
    if (isNil(value) || typeof value !== "string") {
      return null;
    }
    // Note that parse can potentially throw an error here and the expectation is that the user of the adapter catches it
    return superjson.parse(value) as CacheEntry<T>;
  }

  async set<T>(key: string, value: CacheEntry<T>) {
    if (this.testEnvKvStore) {
      this.testEnvKvStore.set(key, value);
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
    if (this.testEnvKvStore) {
      this.testEnvKvStore.delete(key);
      return;
    }

    await this.kvStore!.del(key);
  }
}
