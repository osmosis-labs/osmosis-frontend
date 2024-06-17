import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryOrderbookSpotPrice } from "../../osmosis";

const spotPriceCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getOrderbookSpotPrice({
  orderbookAddress,
  chainList,
  tokenInDenom,
  tokenOutDenom,
}: {
  orderbookAddress: string;
  chainList: Chain[];
  tokenInDenom: string;
  tokenOutDenom: string;
}) {
  return cachified({
    cache: spotPriceCache,
    key: `orderbookSpotPrice-${orderbookAddress}-${tokenInDenom}-${tokenOutDenom}`,
    ttl: 1000 * 60 * 2, // 2 minutes
    getFreshValue: () =>
      queryOrderbookSpotPrice({
        orderbookAddress,
        chainList,
        tokenInDenom,
        tokenOutDenom,
      }).then(({ data }: { data: { spot_price: string } }) => data.spot_price),
  });
}
