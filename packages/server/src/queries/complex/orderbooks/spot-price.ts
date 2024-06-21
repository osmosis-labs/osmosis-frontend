import { Dec } from "@keplr-wallet/unit";
import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryOrderbookSpotPrice } from "../../osmosis";

const orderbookSpotPriceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getOrderbookSpotPrice({
  orderbookAddress,
  chainList,
  quoteAssetDenom,
  baseAssetDenom,
}: {
  orderbookAddress: string;
  quoteAssetDenom: string;
  baseAssetDenom: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: orderbookSpotPriceCache,
    key: `orderbookSpotPrice-${orderbookAddress}-${quoteAssetDenom}-${baseAssetDenom}`,
    ttl: 1000 * 60 * 2, // 2 minutes
    getFreshValue: () =>
      queryOrderbookSpotPrice({
        orderbookAddress,
        chainList,
        quoteAssetDenom,
        baseAssetDenom,
      }).then(({ data }) => new Dec(data.spot_price)),
  });
}
