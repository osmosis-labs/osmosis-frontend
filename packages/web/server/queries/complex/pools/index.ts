import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { search, SearchSchema } from "~/utils/search";

import { queryBalances } from "../../cosmos";
import { PoolRawResponse, queryPools } from "../../osmosis";
import { calcAssetValue, getAsset } from "../assets";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { TransmuterPoolCodeIds } from "./env";

export type PoolType =
  | "weighted"
  | "stable"
  | "concentrated"
  | "cosmwasm-transmuter"
  | "cosmwasm";

export type Pool = {
  id: string;
  type: PoolType;
  raw: PoolRawResponse;
  reserveCoins: CoinPretty[];
  totalFiatValueLocked: PricePretty;
};

const PoolFilterSchema = z.object({
  search: SearchSchema.optional(),
  id: z.string().optional(),
  type: z.enum([
    "concentrated",
    "weighted",
    "stable",
    "transmuter",
    "cosmwasm",
  ]),
});
/** Params for filtering pools. */
export type PoolFilter = z.infer<typeof PoolFilterSchema>;

const searchablePoolKeys = ["id", "type", "coinDenoms"];

export async function getPools(params?: PoolFilter): Promise<Pool[]> {
  let rawPools = await getCachedRawPools();

  if (params?.id) {
    rawPools = rawPools.filter((pool) => getPoolIdFromRaw(pool) === params.id);
  }
  if (params?.type) {
    rawPools = rawPools.filter(
      (pool) => getPoolTypeFromRaw(pool) === params.type
    );
  }

  let pools = (
    await Promise.all(
      rawPools.map(async (rawPool) => {
        // filter for only valid pools
        if (!isValidPool(rawPool)) return;

        const reserveCoins = await getPoolReserveFromRaw(rawPool);

        return {
          id: getPoolIdFromRaw(rawPool),
          type: getPoolTypeFromRaw(rawPool),
          raw: rawPool,
          reserveCoins,
          coinDenoms: reserveCoins.flatMap((coin) => [
            coin.denom,
            coin.currency.coinMinimalDenom,
          ]),
          totalFiatValueLocked: await getTotalFiatValueLockedFromReserves(
            reserveCoins
          ),
        };
      })
    )
  ).filter((pool): pool is NonNullable<typeof pool> => Boolean(pool));

  if (params?.search) {
    pools = search(pools, searchablePoolKeys, params.search);
  }

  return pools;
}

const rawPoolsCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Pools from node, lightly cached. */
function getCachedRawPools(): Promise<PoolRawResponse[]> {
  return cachified({
    cache: rawPoolsCache,
    key: "raw-pools",
    ttl: 500,
    getFreshValue: () => queryPools().then(({ pools }) => pools),
  });
}

async function isValidPool(raw: PoolRawResponse) {
  const reserve = await getPoolReserveFromRaw(raw);

  if (reserve.length === 0) return false;
  return true;
}

function getPoolIdFromRaw(raw: PoolRawResponse) {
  if (raw["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
    return raw.pool_id;
  }
  return raw.id;
}

/** @throws Unknown pool type. */
function getPoolTypeFromRaw(raw: PoolRawResponse): PoolType {
  if (raw["@type"] === "/osmosis.gamm.v1beta1.Pool") {
    return "weighted";
  } else if (
    raw["@type"] === "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
  ) {
    return "stable";
  } else if (raw["@type"] === "/osmosis.concentratedliquidity.v1beta1.Pool") {
    return "concentrated";
  } else if (raw["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
    if (TransmuterPoolCodeIds.includes(raw.code_id)) {
      return "cosmwasm-transmuter";
    }

    return "cosmwasm";
  }

  throw new Error("Unkonwn pool type");
}

export async function getPoolReserveFromRaw(raw: PoolRawResponse) {
  let reserveCoins: { denom: string; amount: string }[];

  if (raw["@type"] === "/osmosis.gamm.v1beta1.Pool") {
    reserveCoins = raw.pool_assets.map((asset) => asset.token);
  } else if (
    raw["@type"] === "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
  ) {
    reserveCoins = raw.pool_liquidity;
  } else if (raw["@type"] === "/osmosis.concentratedliquidity.v1beta1.Pool") {
    reserveCoins = await getCachedPoolReserves(raw.address);
  } else if (raw["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
    reserveCoins = await getCachedPoolReserves(raw.contract_address);
  } else {
    throw new Error("Unknown pool type of id: " + getPoolIdFromRaw(raw));
  }

  return await Promise.all(
    reserveCoins.map(async (coin) => {
      const asset = await getAsset({ anyDenom: coin.denom });
      if (!asset)
        throw new Error(
          `Unknown asset in pool ${getPoolIdFromRaw(raw)}: ` + coin.denom
        );
      return new CoinPretty(asset, coin.amount);
    })
  );
}

const poolReservesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Lightly cached pool amounts from node. */
export function getCachedPoolReserves(
  poolAddress: string
): Promise<{ denom: string; amount: string }[]> {
  return cachified({
    cache: poolReservesCache,
    key: `pool-reserves-${poolAddress}`,
    ttl: 300,
    getFreshValue: async () => {
      const balances = (await queryBalances(poolAddress)).balances;

      if (balances.length < 2) {
        throw new Error("Invalid pool balances for pool at " + poolAddress);
      }

      return balances;
    },
  });
}

export async function getTotalFiatValueLockedFromReserves(
  reserves: CoinPretty[]
) {
  const assetValues = await Promise.all(
    reserves.map((coin) =>
      calcAssetValue({
        anyDenom: coin.currency.coinMinimalDenom,
        amount: coin.toCoin().amount,
      })
    )
  );

  const total = assetValues.reduce<Dec>(
    (acc, val) => (val ? acc.add(val) : acc),
    new Dec(0)
  );

  return new PricePretty(DEFAULT_VS_CURRENCY, total);
}
