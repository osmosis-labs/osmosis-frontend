import { Redis } from "@upstash/redis";
import { Cache, CacheEntry } from "cachified";

import { KV_STORE_REST_API_URL } from "../env";
import { KV_STORE_REST_API_TOKEN } from "../env";

export const REDIS_DEFAULT_TTL = 1000 * 60 * 60 * 24 * 7;

export function getRedisClient() {
  return new Redis({
    url: KV_STORE_REST_API_URL!,
    token: KV_STORE_REST_API_TOKEN!,
  });
}

export const redisKvStoreAdapter = (store: Redis): Cache => ({
  set: <T>(key: string, value: CacheEntry<T>) => {
    value.metadata.ttl;
    return store.set(key, value, {
      px: value.metadata.ttl ?? REDIS_DEFAULT_TTL,
    });
  },
  get: <T>(key: string) => {
    return store.get<T>(key);
  },
  delete: (key) => {
    return store.del(key);
  },
});
