import {
  makeGammShareCurrency,
  makeUnlistedAssetCurrency,
  type Pool,
} from "@osmosis-labs/server";
import {
  type AddLiquidityPoolData,
  ObservableAddLiquidityConfig,
  type OsmosisAccountImpl,
} from "@osmosis-labs/stores";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Converts a tRPC share pool (weighted or stable) into the plain data the add liquidity config consumes.
 *  Pool assets and amounts come from the raw chain pool, in chain order; currencies come from the pool's reserve coins,
 *  falling back to a minimal currency for denoms missing there (e.g. unlisted assets, or empty reserves on testnet).
 *  Returns undefined for other pool types or incomplete raw pools. */
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
  // A missing fee must not silently become a zero fee in join estimates
  if (!raw.total_shares || !raw.pool_params?.swap_fee) return;

  const rawAssets =
    pool.type === "weighted"
      ? raw.pool_assets?.map(({ token, weight }) => ({
          ...token,
          weight: new Int(weight),
        }))
      : raw.pool_liquidity;
  if (!rawAssets) return;

  const assets: AddLiquidityPoolData["assets"] = [];
  let hasGuessedCurrency = false;
  for (const { denom, amount, weight } of rawAssets as {
    denom: string;
    amount: string;
    weight?: Int;
  }[]) {
    let currency = pool.reserveCoins.find(
      (coin) => coin.currency.coinMinimalDenom === denom
    )?.currency;
    if (!currency) {
      currency = makeUnlistedAssetCurrency(denom);
      hasGuessedCurrency = true;
    }

    assets.push({ amount: new CoinPretty(currency, new Int(amount)), weight });
  }

  return {
    id: pool.id,
    type: pool.type,
    totalShare: new CoinPretty(
      makeGammShareCurrency(pool.id),
      new Int(raw.total_shares.amount)
    ),
    assets,
    totalWeight: raw.total_weight ? new Int(raw.total_weight) : undefined,
    swapFee: new Dec(raw.pool_params.swap_fee),
    hasGuessedCurrency,
    stableSwapInfo:
      pool.type === "stable" && raw.scaling_factors
        ? {
            scalingFactorController: raw.scaling_factor_controller ?? "",
            scalingFactor: raw.scaling_factors,
          }
        : undefined,
  };
}

/** Sends the join msg for the config's current input.
 *  The pool is fetched fresh first: the config may have been seeded from persisted/cached data,
 *  and the msg's slippage bounds must come from current reserves. Amounts typed by the user are kept. */
export async function sendAddLiquidity({
  config,
  osmosis,
  fetchPool,
  onFulfill,
}: {
  config: ObservableAddLiquidityConfig;
  osmosis: Pick<
    OsmosisAccountImpl,
    "sendJoinPoolMsg" | "sendJoinSwapExternAmountInMsg"
  >;
  fetchPool: () => Promise<Parameters<typeof makeAddLiquidityPoolData>[0]>;
  onFulfill: () => void;
}) {
  const poolId = config.poolId;
  const singleAmountIn =
    config.isSingleAmountIn && config.singleAmountInConfig
      ? {
          currency: config.singleAmountInConfig.sendCurrency,
          amount: config.singleAmountInConfig.amount,
        }
      : undefined;
  const shareOutAmount = config.shareOutAmount?.toDec().toString();
  if (!singleAmountIn && !shareOutAmount) return;

  const freshPool = makeAddLiquidityPoolData(await fetchPool());
  if (!freshPool) {
    throw new Error(`Pool #${poolId} is not a joinable share pool`);
  }

  if (singleAmountIn) {
    await osmosis.sendJoinSwapExternAmountInMsg(
      poolId,
      freshPool,
      singleAmountIn,
      undefined,
      undefined,
      onFulfill
    );
  } else if (shareOutAmount) {
    await osmosis.sendJoinPoolMsg(
      poolId,
      freshPool,
      shareOutAmount,
      undefined,
      undefined,
      onFulfill
    );
  }
}

/** Maintains a single instance of `ObservableAddLiquidityConfig` for React view lifecycle.
 *  Updates `poolId` and `bech32Address` in effects, and feeds the pool and the user's balances
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

  useEffect(() => {
    config.setSender(address);
    config.setPoolId(poolId);
  }, [config, address, poolId]);
  useEffect(() => {
    config.setPool(poolData);
  }, [config, poolData]);
  useEffect(() => {
    config.setBalances(address ? balances : undefined);
  }, [config, address, balances]);

  const apiUtils = api.useUtils();
  const addLiquidity = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!account) return;

        await sendAddLiquidity({
          config,
          osmosis: account.osmosis,
          fetchPool: () =>
            apiUtils.local.pools.getPool.fetch({ poolId }, { staleTime: 0 }),
          onFulfill: resolve,
        });
      } catch (e: any) {
        console.error(e);
        reject(e.message);
      }
    });
  }, [account, apiUtils, config, poolId]);

  return { config, addLiquidity };
}
