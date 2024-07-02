import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import {
  queryOrderbookTicks,
  queryOrderbookTickUnrealizedCancelsById,
} from "../../osmosis";

const tickInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getOrderbookTickState({
  orderbookAddress,
  chainList,
  tickIds,
}: {
  orderbookAddress: string;
  chainList: Chain[];
  tickIds: number[];
}) {
  return cachified({
    cache: tickInfoCache,
    key: `orderbookTickInfo-${orderbookAddress}-${tickIds
      .sort((a, b) => a - b)
      .join(",")}`,
    ttl: 1000 * 3, // 3 seconds
    getFreshValue: () =>
      queryOrderbookTicks({ orderbookAddress, chainList, tickIds }).then(
        ({ data }) => data.ticks
      ),
  });
}

export function getOrderbookTickUnrealizedCancels({
  orderbookAddress,
  chainList,
  tickIds,
}: {
  orderbookAddress: string;
  chainList: Chain[];
  tickIds: number[];
}) {
  return cachified({
    cache: tickInfoCache,
    key: `orderbookTickUnrealizedCancels-${orderbookAddress}-${tickIds
      .sort((a, b) => a - b)
      .join(",")}`,
    ttl: 1000 * 3, // 3 seconds
    getFreshValue: () =>
      queryOrderbookTickUnrealizedCancelsById({
        orderbookAddress,
        chainList,
        tickIds,
      }).then(({ data }) => data.ticks),
  });
}
