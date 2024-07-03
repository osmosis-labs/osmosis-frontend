import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryPools } from "../../sidecar";

const orderbookPoolsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const orderBookCodeIds = [865];

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
      queryPools().then((data) => {
        return data
          .filter((pool) =>
            orderBookCodeIds.includes((pool as any).chain_model.code_id)
          )
          .map((pool) => {
            return {
              baseDenom: (pool as any).balances[1].denom,
              quoteDenom: (pool as any).balances[0].denom,
              contractAddress: (pool as any).chain_model.contract_address,
              poolId: (pool as any).pool_id,
            };
          }) as Orderbook[];
      }),
  });
}
