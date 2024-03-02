import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

import { queryLockableDurations } from "../../osmosis";

const lockableDurationsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getLockableDurations() {
  return cachified({
    cache: lockableDurationsCache,
    key: "lockable-durations",
    ttl: 1000 * 60 * 10, // 10 mins
    staleWhileRevalidate: 1000 * 60 * 60 * 24, // 24 hours
    getFreshValue: async () => {
      const { lockable_durations } = await queryLockableDurations();

      return lockable_durations
        .map((durationStr: string) => {
          return dayjs.duration(parseInt(durationStr.replace("s", "")) * 1000);
        })
        .sort((v1, v2) => {
          return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
        });
    },
  });
}
