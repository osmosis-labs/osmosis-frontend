import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { ChainCosmwasmPool, queryPools } from "../../sidecar";

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
          .filter((pool) => {
            const chainModel = pool.chain_model as ChainCosmwasmPool;
            return orderBookCodeIds.includes(chainModel.code_id);
          })
          .map((pool) => {
            const chainModel = pool.chain_model as ChainCosmwasmPool;
            return {
              baseDenom: pool.balances[1].denom,
              quoteDenom: pool.balances[0].denom,
              contractAddress: chainModel.contract_address,
              poolId: chainModel.pool_id.toString(),
            };
          }) as Orderbook[];
      }),
  });
}
