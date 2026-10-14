import type { Pool } from "@osmosis-labs/server";
import {
  makeGammShareCurrency,
  makeUnlistedAssetCurrency,
} from "@osmosis-labs/server";
import type { OsmosisAccountImpl } from "@osmosis-labs/stores";
import type {
  AddLiquidityPoolData,
  Currency,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "@osmosis-labs/types";
import {
  CoinPretty,
  Dec,
  Int,
  type IntPretty,
  type RatePretty,
} from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useCallback, useMemo, useReducer, useRef } from "react";

import { displayToast, ToastType } from "~/components/alert";
import { AssetLists } from "~/config/generated/asset-lists";
import { api } from "~/utils/trpc";

import { useWallet } from "../use-wallet";
import {
  type AddLiquidityAction,
  type AddLiquidityActionInput,
  type AddLiquidityContext,
  addLiquidityReducer,
  getAddLiquidityError,
  getAmounts,
  getBalance,
  getInputsScopeKey,
  getPoolAssets,
  getSingleAmountInPriceImpact,
  getSupportsSingleAmountIn,
  getTotalShare,
  getTotalWeight,
  initialAddLiquidityState,
  type PoolAsset,
  type PoolAssetCurrency,
} from "./add-liquidity";
import { getAssetAmountError } from "./create-pool";

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
  config: Pick<
    AddLiquidityConfig,
    | "poolId"
    | "isSingleAmountIn"
    | "singleAmountInConfig"
    | "shareOutAmount"
    | "poolAssetConfigs"
    | "resetInputs"
  >;
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
  // saw. Clear the inputs (the fresh pool reaches the config through the pool query) instead of sending.
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
    config.resetInputs();
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

export type AddLiquidityAssetConfig = {
  readonly sendCurrency: PoolAssetCurrency;
  readonly balance: CoinPretty;
  readonly amount: string;
  readonly error: Error | undefined;
  /** Sets the typed text only, without balancing the other assets. */
  setAmount: (amount: string) => void;
};

export type AddLiquidityConfig = {
  readonly poolId: string;
  /** The pool data the config was last given, e.g. to build join msgs. */
  readonly pool: AddLiquidityPoolData | undefined;
  readonly stableSwapInfo: AddLiquidityPoolData["stableSwapInfo"];
  readonly isSingleAmountIn: boolean;
  readonly supportsSingleAmountIn: boolean;
  readonly poolAssets: PoolAsset[];
  readonly poolAssetConfigs: AddLiquidityAssetConfig[];
  /** The config of the selected asset, only in single amount in mode. */
  readonly singleAmountInConfig: AddLiquidityAssetConfig | undefined;
  readonly singleAmountInAsset: PoolAsset | undefined;
  readonly singleAmountInBalance: CoinPretty | undefined;
  readonly singleAmountInPriceImpact: RatePretty | undefined;
  readonly totalWeight: IntPretty;
  readonly totalShare: IntPretty;
  readonly shareOutAmount: IntPretty | undefined;
  readonly error: Error | undefined;
  getBalance: (currency: Currency) => CoinPretty;
  getAmountAt: (index: number) => string;
  getSenderBalanceAt: (index: number) => CoinPretty;
  /** Sets an asset's amount and balances the others (and the share out amount) to match. */
  setAmountAt: (index: number, amount: string) => void;
  setMax: () => void;
  setIsSingleAmountIn: (value: boolean) => void;
  setSingleAmountInConfigIndex: (index: number) => void;
  /** Clears all typed amounts. */
  resetInputs: () => void;
};

/** Add liquidity input state for the React view lifecycle. The pool and the user's balances
 *  come from tRPC. The returned config changes identity whenever its state changes; its
 *  actions always use the latest pool and balances.
 */
export function useAddLiquidityConfig(
  osmosisChainId: string,
  poolId: string
): {
  config: AddLiquidityConfig;
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
  const balanceMap = useMemo(
    () =>
      new Map(
        (address ? (balances ?? []) : []).map(({ denom, amount }) => [
          denom,
          amount,
        ])
      ),
    [address, balances]
  );
  const ctx = useMemo<AddLiquidityContext>(
    () => ({ pool: poolData, balances: balanceMap }),
    [poolData, balanceMap]
  );
  const scopeKey = getInputsScopeKey(poolId, address, poolData);

  const [state, dispatch] = useReducer(
    addLiquidityReducer,
    initialAddLiquidityState
  );

  const config = useMemo<AddLiquidityConfig>(() => {
    const act = (action: AddLiquidityActionInput) =>
      dispatch({ ...action, ctx, scopeKey } as AddLiquidityAction);

    // inputs typed for another pool, sender or asset currencies don't apply
    const inputs =
      state.scopeKey === scopeKey
        ? state
        : { amounts: [], shareOutAmount: undefined };
    const amounts = getAmounts(poolData, inputs.amounts);
    const poolAssets = getPoolAssets(poolData);

    const poolAssetConfigs = poolAssets.map(
      ({ currency }, index): AddLiquidityAssetConfig => {
        const balance = getBalance(balanceMap, currency);
        return {
          sendCurrency: currency,
          balance,
          amount: amounts[index],
          error: getAssetAmountError(amounts[index], balance),
          setAmount: (amount) => act({ type: "setRawAmountAt", index, amount }),
        };
      }
    );

    const isSingleAmountIn = state.isSingleAmountIn;
    const singleAmountInConfig =
      isSingleAmountIn &&
      state.singleAmountInConfigIndex < poolAssetConfigs.length
        ? poolAssetConfigs[state.singleAmountInConfigIndex]
        : undefined;
    const singleAmountInAsset = poolAssets.find(
      (asset) =>
        asset.currency.coinMinimalDenom ===
        singleAmountInConfig?.sendCurrency.coinMinimalDenom
    );

    return {
      poolId,
      pool: poolData,
      stableSwapInfo: poolData?.stableSwapInfo,
      isSingleAmountIn,
      supportsSingleAmountIn: getSupportsSingleAmountIn(poolData),
      poolAssets,
      poolAssetConfigs,
      singleAmountInConfig,
      singleAmountInAsset,
      singleAmountInBalance: singleAmountInAsset
        ? getBalance(balanceMap, singleAmountInAsset.currency)
        : undefined,
      singleAmountInPriceImpact: isSingleAmountIn
        ? getSingleAmountInPriceImpact(poolAssets, singleAmountInConfig)
        : undefined,
      totalWeight: getTotalWeight(poolAssets),
      totalShare: getTotalShare(poolData),
      shareOutAmount: inputs.shareOutAmount,
      error: getAddLiquidityError({
        configs: poolAssetConfigs,
        isSingleAmountIn,
        singleAmountInConfig,
        shareOutAmount: inputs.shareOutAmount,
      }),
      getBalance: (currency) => getBalance(balanceMap, currency),
      getAmountAt: (index) => amounts[index],
      getSenderBalanceAt: (index) =>
        getBalance(balanceMap, poolAssets[index].currency),
      setAmountAt: (index, amount) =>
        act({ type: "setAmountAt", index, amount }),
      setMax: () => act({ type: "setMax" }),
      setIsSingleAmountIn: (value) =>
        act({ type: "setIsSingleAmountIn", value }),
      setSingleAmountInConfigIndex: (index) =>
        act({ type: "setSingleAmountInConfigIndex", index }),
      resetInputs: () => act({ type: "reset" }),
    };
  }, [state, ctx, scopeKey, poolData, balanceMap, poolId]);

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
