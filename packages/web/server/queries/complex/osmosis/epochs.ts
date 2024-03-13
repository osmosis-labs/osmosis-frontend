import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryEpochs } from "~/server/queries/osmosis/epochs";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const epochsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getEpochs() {
  return cachified({
    cache: epochsCache,
    key: "epochs",
    ttl: 1000 * 30, // 30 seconds
    getFreshValue: () => queryEpochs().then(({ epochs }) => epochs),
  });
}
