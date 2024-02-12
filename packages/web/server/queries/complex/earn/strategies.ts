import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { queryEarnStrategies } from "~/server/queries/numia/earn";

const earnStrategiesCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export async function getEarnStrategies() {
  return await cachified({
    cache: earnStrategiesCache,
    ttl: 1000 * 60 * 60,
    key: "earn-strategies",
    getFreshValue: async () => {
      try {
        const data = await queryEarnStrategies();
        return data;
      } catch (error) {
        return [];
      }
    },
  });
}
