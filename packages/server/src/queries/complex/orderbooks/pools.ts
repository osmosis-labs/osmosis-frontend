import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { ChainCosmwasmPool, queryPools } from "../../sidecar";
import { queryCanonicalOrderbooks } from "../../sidecar/orderbooks";

const orderbookPoolsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export interface Orderbook {
  baseDenom: string;
  quoteDenom: string;
  contractAddress: string;
  poolId: string;
}

export function getOrderbookPools() {
  return cachified({
    cache: orderbookPoolsCache,
    key: `orderbookPools`,
    ttl: 1000 * 60 * 60, // 1 hour
    getFreshValue: () =>
      queryCanonicalOrderbooks().then(async (data) => {
        const pools = await queryPools({
          poolIds: data.map((pool) => pool.pool_id.toString()),
        });
        return data.map((orderbook) => {
          const pool = pools.find(
            (pool) =>
              (pool.chain_model as ChainCosmwasmPool).pool_id ===
              orderbook.pool_id
          );

          return {
            baseDenom: orderbook.base,
            quoteDenom: orderbook.quote,
            contractAddress: (pool!.chain_model as ChainCosmwasmPool)
              .contract_address,
            poolId: orderbook.pool_id.toString(),
          };
        }) as Orderbook[];
      }),
  });
}
