import {
  makeGammShareCurrency,
  makeUnlistedAssetCurrency,
  type Pool,
} from "@osmosis-labs/server";
import {
  type AddLiquidityPoolData,
  ObservableAddLiquidityConfig,
} from "@osmosis-labs/stores";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Converts a tRPC share pool (weighted or stable) into the plain data the add liquidity config consumes.
 *  Pool assets and amounts come from the raw chain pool, in chain order; currencies come from the pool's reserve coins,
 *  falling back to a minimal currency for denoms missing there (e.g. unlisted assets, or empty reserves on testnet).
 *  Returns undefined for other pool types. */
export function makeAddLiquidityPoolData(
  pool: Pick<Pool, "id" | "type" | "raw" | "reserveCoins">
): AddLiquidityPoolData | undefined {
  if (pool.type !== "weighted" && pool.type !== "stable") return;

  const raw = pool.raw as {
    total_shares?: { amount: string };
    total_weight?: string;
    pool_params?: { swap_fee: string };
    pool_assets?: {
      weight: string;
      token: { denom: string; amount: string };
    }[];
    pool_liquidity?: { denom: string; amount: string }[];
    scaling_factors?: string[];
    scaling_factor_controller?: string;
  };
  if (!raw.total_shares) return;

  const rawAssets =
    pool.type === "weighted"
      ? raw.pool_assets?.map(({ token, weight }) => ({
          ...token,
          weight: new Int(weight),
        }))
      : raw.pool_liquidity;
  if (!rawAssets) return;

  const assets: AddLiquidityPoolData["assets"] = [];
  for (const { denom, amount, weight } of rawAssets as {
    denom: string;
    amount: string;
    weight?: Int;
  }[]) {
    const currency =
      pool.reserveCoins.find((coin) => coin.currency.coinMinimalDenom === denom)
        ?.currency ?? makeUnlistedAssetCurrency(denom);

    assets.push({ amount: new CoinPretty(currency, new Int(amount)), weight });
  }

  return {
    type: pool.type,
    totalShare: new CoinPretty(
      makeGammShareCurrency(pool.id),
      new Int(raw.total_shares.amount)
    ),
    assets,
    totalWeight: raw.total_weight ? new Int(raw.total_weight) : undefined,
    swapFee: new Dec(raw.pool_params?.swap_fee ?? 0),
    stableSwapInfo:
      pool.type === "stable" && raw.scaling_factors
        ? {
            scalingFactorController: raw.scaling_factor_controller ?? "",
            scalingFactor: raw.scaling_factors,
          }
        : undefined,
  };
}

/** Maintains a single instance of `ObservableAddLiquidityConfig` for React view lifecycle.
 *  Updates `poolId` and `bech32Address` on render, and feeds the pool and the user's balances
 *  from tRPC into the config.
 */
export function useAddLiquidityConfig(
  osmosisChainId: string,
  poolId: string
): {
  config: ObservableAddLiquidityConfig;
  addLiquidity: () => Promise<void>;
} {
  const { accountStore } = useStore();

  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

  const { data: pool } = api.local.pools.getPool.useQuery({ poolId });
  const { data: balances } = api.local.balances.getUserBalances.useQuery(
    { bech32Address: address },
    { enabled: Boolean(address) }
  );

  const poolData = useMemo(
    () =>
      pool && pool.id === poolId ? makeAddLiquidityPoolData(pool) : undefined,
    [pool, poolId]
  );

  // Seed with already available (e.g. cached) data so the first paint is initialized.
  // Later updates are pushed from effects below.
  const [config] = useState(() => {
    const config = new ObservableAddLiquidityConfig(poolId, address);
    config.setPool(poolData);
    config.setBalances(address ? balances : undefined);
    return config;
  });
  config.setSender(address);
  config.setPoolId(poolId);

  useEffect(() => {
    config.setPool(poolData);
  }, [config, poolData]);
  useEffect(() => {
    config.setBalances(address ? balances : undefined);
  }, [config, address, balances]);

  const addLiquidity = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const pool = config.pool;
        if (!pool) {
          throw new Error(`Pool #${config.poolId} is not loaded`);
        }

        if (config.isSingleAmountIn && config.singleAmountInConfig) {
          await account?.osmosis.sendJoinSwapExternAmountInMsg(
            config.poolId,
            pool,
            {
              currency: config.singleAmountInConfig.sendCurrency,
              amount: config.singleAmountInConfig.amount,
            },
            undefined,
            undefined,
            () => resolve()
          );
        } else if (config.shareOutAmount) {
          await account?.osmosis.sendJoinPoolMsg(
            config.poolId,
            pool,
            config.shareOutAmount.toDec().toString(),
            undefined,
            undefined,
            () => resolve()
          );
        }
      } catch (e: any) {
        console.error(e);
        reject(e.message);
      }
    });
  }, [account, config]);

  return { config, addLiquidity };
}
