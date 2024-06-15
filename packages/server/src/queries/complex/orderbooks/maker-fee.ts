import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryOrderbookMakerFee } from "../../osmosis";

const makerFeeCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getOrderbookMakerFee({
  orderbookAddress,
  chainList,
}: {
  orderbookAddress: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: makerFeeCache,
    key: `orderbookMakerFee-${orderbookAddress}`,
    ttl: 1000 * 60 * 60 * 4, // 4 hours
    getFreshValue: () =>
      queryOrderbookMakerFee({ orderbookAddress, chainList }).then(
        ({ data }) => data
      ),
  });
}
