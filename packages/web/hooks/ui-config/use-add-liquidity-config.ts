import type { Pool } from "@osmosis-labs/server";
import {
  makeGammShareCurrency,
  makeUnlistedAssetCurrency,
} from "@osmosis-labs/server";
import type { OsmosisAccountImpl } from "@osmosis-labs/stores";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import type {
  AddLiquidityPoolData,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "@osmosis-labs/types";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { displayToast, ToastType } from "~/components/alert";
import { AssetLists } from "~/config/generated/asset-lists";
import { api } from "~/utils/trpc";

import { useWallet } from "../use-wallet";

/** Converts a tRPC share pool (weighted or stable) into the plain data the add liquidity config consumes.
 *  Pool assets and amounts come from the raw chain pool, in chain order; currencies come from the pool's reserve coins,
 *  falling back to a minimal currency for denoms missing there (e.g. unlisted assets, or empty reserves on testnet).
 *  Returns undefined for other pool types or incomplete raw pools. */
export function makeAddLiquidityPoolData(
  pool: Pick<Pool, "id" | "type" | "raw" | "reserveCoins">
): AddLiquidityPoolData | undefined {
  if (pool.type !== "weighted" && pool.type !== "stable") return;

  // Partial: sidecar and chain raw pools don't always carry every field
  const raw = pool.raw as Partial<WeightedPoolRawResponse> &
    Partial<StablePoolRawResponse>;
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
    // The server's chain fallback also puts guessed currencies in the
    // reserve coins (and a persisted pool can hold one from an older build),
    // so only a matching asset list entry proves the decimals.
    const listed = getAssetFromAssetList({
      coinMinimalDenom: denom,
      assetLists: AssetLists,
    });
    if (!currency || !listed || listed.decimals !== currency.coinDecimals) {
      hasGuessedCurrency = true;
    }
    if (!currency) currency = makeUnlistedAssetCurrency(denom);

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

  let freshPool: AddLiquidityPoolData | undefined;
  try {
    freshPool = makeAddLiquidityPoolData(await fetchPool());
  } catch (e) {
    throw new AddLiquidityPreflightError(`Failed to fetch pool #${poolId}`, {
      cause: e,
    });
  }
  if (!freshPool) {
    throw new AddLiquidityPreflightError(
      `Pool #${poolId} is not a joinable share pool`
    );
  }
  // Typed amounts are in the config's currencies; if the fresh pool resolves
  // any asset with other decimals, the amounts would not mean what the user
  // saw. Refresh the config (which clears the inputs) instead of sending.
  const decimalsByDenom = new Map(
    freshPool.assets.map(({ amount: { currency } }) => [
      currency.coinMinimalDenom,
      currency.coinDecimals,
    ])
  );
  const currencyChanged = config.poolAssetConfigs.some(
    ({ sendCurrency }) =>
      decimalsByDenom.get(sendCurrency.coinMinimalDenom) !==
      sendCurrency.coinDecimals
  );
  if (currencyChanged) {
    config.setPool(freshPool);
    throw new AddLiquidityPreflightError(
      `Pool #${poolId} asset details changed; amounts need re-entering`
    );
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

/** A join that stopped before anything was signed, e.g. the fresh pool fetch failed. */
export class AddLiquidityPreflightError extends Error {}

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
  const { wallet: account, address: walletAddress } = useWallet(osmosisChainId);
  const address = walletAddress ?? "";

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
  // The button only disables once the tx is signing, which is after the fresh
  // pool fetch, so ignore clicks while a submit is already in flight.
  const isSubmittingRef = useRef(false);
  const addLiquidity = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
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
        // Failures before signing skip the account store's failed tx toast
        if (e instanceof AddLiquidityPreflightError) {
          displayToast(
            { titleTranslationKey: "errors.uhOhSomethingWentWrong" },
            ToastType.ERROR
          );
        }
        reject(e.message);
      } finally {
        isSubmittingRef.current = false;
      }
    });
  }, [account, apiUtils, config, poolId]);

  return { config, addLiquidity };
}
