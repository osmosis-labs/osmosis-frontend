import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

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
