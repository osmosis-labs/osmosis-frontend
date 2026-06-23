import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { BigDec, calcZapOutSwapAmount } from "@osmosis-labs/math";
import type {
  ConcentratedPoolRawResponse,
  UserPosition,
} from "@osmosis-labs/server";
import { ObservableRemoveConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { Dec, Int } from "@osmosis-labs/unit";
import { useEffect } from "react";
import { useCallback, useState } from "react";

import { EventName } from "~/config";
import { useSlippageConfig } from "~/hooks/ui-config/use-slippage-config";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useDebouncedState } from "~/hooks/use-debounced-state";
import { useZapOutQuote } from "~/hooks/use-zap-out-quote";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** The swap leg a single-asset (zap-out) exit requires to reach the target
 *  value split, plus the input-state classification used by the modal/submit. */
export interface ZapOutRequiredSwap {
  swapSide: "base" | "quote";
  /** Micro amount of `swapSide` the swap leg should sell (projected). */
  swapInAmount: Int;
  tokenInCurrency: UserPosition["currentCoins"][number]["currency"];
  tokenOutCurrency: UserPosition["currentCoins"][number]["currency"];
  needsSwap: boolean;
}

export function useRemoveConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  position: UserPosition
): {
  config: ObservableRemoveConcentratedLiquidityConfig;
  removeLiquidity: () => Promise<void>;
  zapOutLiquidity: () => Promise<void>;
  zapQuote: ReturnType<typeof useZapOutQuote>;
  zapSlippageConfig: ReturnType<typeof useSlippageConfig>;
  requiredSwap: ZapOutRequiredSwap | undefined;
  /** Value split the position currently holds in base; the no-swap point the
   *  output-mix slider handle starts at. Undefined until prices/amounts load. */
  currentBaseValueFraction: number | undefined;
  /** True when the (debounced) quote reflects the live slider target. Submission
   *  must be blocked while false, or it would execute a stale target mix. */
  quoteInSync: boolean;
} {
  const { accountStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();
  const apiUtils = api.useUtils();

  const account = accountStore.getWallet(osmosisChainId);

  // Single-asset exit reuses the user's general swap slippage scope.
  const zapSlippageConfig = useSlippageConfig();

  const [config] = useState(
    () =>
      new ObservableRemoveConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        {
          baseAsset: position.currentCoins[0],
          quoteAsset: position.currentCoins[1],
          liquidity: position.liquidity,
        }
      )
  );

  useEffect(() => {
    config.setPosition({
      baseAsset: position.currentCoins[0],
      quoteAsset: position.currentCoins[1],
      liquidity: position.liquidity,
    });
  }, [config, position]);

  // The pool's current sqrt price (micro basis) is what the swap executes
  // against, so the value-rebalance math uses it rather than fiat oracle prices.
  const { data: pool } = api.local.pools.getPool.useQuery({ poolId });
  const currentSqrtPrice =
    pool?.type === "concentrated"
      ? new BigDec((pool.raw as ConcentratedPoolRawResponse).current_sqrt_price)
      : undefined;

  // The value split the position currently holds in base (token0), at spot. This
  // is the no-swap point the output-mix slider starts at.
  const withdrawn = config.effectiveLiquidityAmounts;
  const currentBaseValueFraction = (() => {
    if (!currentSqrtPrice || currentSqrtPrice.isZero() || !withdrawn)
      return undefined;
    const spot = currentSqrtPrice.mul(currentSqrtPrice);
    const baseValue = new BigDec(new Int(withdrawn.base.toCoin().amount)).mul(
      spot
    );
    const total = baseValue.add(
      new BigDec(new Int(withdrawn.quote.toCoin().amount))
    );
    if (total.lte(new BigDec(0))) return undefined;
    return Number(baseValue.quo(total).toString());
  })();

  // Compute the swap leg for a given target value-split. An `undefined` target
  // is the explicit no-swap state (withdraw at the current ratio), so no swap is
  // computed and no float-equality is involved — `needsSwap` is driven purely by
  // whether the user has chosen a real target, not by comparing fractions.
  const computeRequiredSwap = (
    targetFraction: number | undefined
  ): ZapOutRequiredSwap | undefined => {
    if (targetFraction === undefined) return undefined;
    if (!currentSqrtPrice || !withdrawn) return undefined;

    const baseWithdrawn = new Int(withdrawn.base.toCoin().amount);
    const quoteWithdrawn = new Int(withdrawn.quote.toCoin().amount);
    if (baseWithdrawn.lte(new Int(0)) && quoteWithdrawn.lte(new Int(0)))
      return undefined;

    const { swapSide, swapInAmount } = calcZapOutSwapAmount({
      baseWithdrawn,
      quoteWithdrawn,
      currentSqrtPrice,
      targetBaseValueFraction: new BigDec(targetFraction.toString()),
    });

    const baseCurrency = withdrawn.base.currency;
    const quoteCurrency = withdrawn.quote.currency;
    const tokenInCurrency = swapSide === "base" ? baseCurrency : quoteCurrency;
    const tokenOutCurrency = swapSide === "base" ? quoteCurrency : baseCurrency;

    return {
      swapSide,
      swapInAmount,
      tokenInCurrency,
      tokenOutCurrency,
      needsSwap: swapInAmount.gt(new Int(0)),
    };
  };

  // Live swap for the instant display (the "X will be swapped" line, the
  // slider, value/percent breakdown).
  const requiredSwap = computeRequiredSwap(config.targetBaseValueFraction);

  // Debounced swap that drives the actual quote, so dragging the slider doesn't
  // fire a quote on every tick — only after it settles for 500ms. The instant
  // display above still reflects the live target.
  const [debouncedTargetFraction, setDebouncedTargetFraction] =
    useDebouncedState(config.targetBaseValueFraction, 500);
  useEffect(() => {
    setDebouncedTargetFraction(config.targetBaseValueFraction);
  }, [config.targetBaseValueFraction, setDebouncedTargetFraction]);
  const quotedSwap = computeRequiredSwap(debouncedTargetFraction);

  // Whether the quote (debounced) reflects the live slider target. While the
  // user is mid-drag the debounced value lags, so the quote and the displayed
  // mix differ; submitting then would execute a stale target. The consumer
  // blocks submission until this is true.
  const quoteInSync =
    debouncedTargetFraction === config.targetBaseValueFraction;

  // Quote the (debounced) swap leg (exact-in). Disabled when no swap is needed
  // (handle at the no-swap point), so it never queries unnecessarily.
  const zapQuote = useZapOutQuote({
    tokenInAmount: quotedSwap?.swapInAmount.toString() ?? "0",
    tokenInDenom: quotedSwap?.tokenInCurrency.coinMinimalDenom ?? "",
    tokenOutDenom: quotedSwap?.tokenOutCurrency.coinMinimalDenom ?? "",
    enabled: Boolean(quotedSwap?.needsSwap),
  });

  const removeLiquidity = useCallback(
    () =>
      new Promise<void>(async (resolve, reject) => {
        try {
          const liquidity = config.effectiveLiquidity;
          if (!liquidity) {
            return Promise.reject("Invalid liquidity");
          }
          if (!account) {
            return Promise.reject("No account");
          }

          logEvent([
            EventName.ConcentratedLiquidity.removeLiquidityClicked,
            {
              liquidityUSD: Number(liquidity.toString()),
              poolId,
              positionId: position.id,
            },
          ]);

          account.osmosis
            .sendWithdrawConcentratedLiquidityPositionMsg(
              position.id,
              liquidity,
              undefined,
              (tx) => {
                if (tx.code) {
                  reject(tx.rawLog);
                } else {
                  logEvent([
                    EventName.ConcentratedLiquidity.removeLiquidityCompleted,
                    {
                      liquidityUSD: Number(liquidity.toString()),
                      poolId,
                      positionId: position.id,
                      percentage: config.percentage.toString(),
                    },
                  ]);

                  // refresh tick data
                  apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange
                    .invalidate({ poolId })
                    .finally(() => resolve());
                }
              }
            )
            .catch(reject);
        } catch (e: any) {
          reject(e);
        }
      }),
    [
      config.effectiveLiquidity,
      config.percentage,
      account,
      logEvent,
      poolId,
      position.id,
      apiUtils,
    ]
  );

  const zapOutLiquidity = useCallback(
    () =>
      new Promise<void>(async (resolve, reject) => {
        try {
          const liquidity = config.effectiveLiquidity;
          if (!liquidity) return reject("Invalid liquidity");
          if (!account) return reject("No account");
          // Submit against the debounced swap the quote was computed for, not
          // the live (possibly mid-drag) one.
          if (!quotedSwap?.needsSwap || !zapQuote.quote)
            return reject("Swap quote not ready");

          const slippageMultiplier = new Dec(1).sub(
            zapSlippageConfig.slippage.toDec()
          );

          // The swap leg's tokenIn must be the conservative LOWER BOUND of the
          // projected withdrawn amount of the side being sold: it is fixed at
          // sign time, and if it exceeds what the withdraw actually yields the
          // swap (and whole tx) reverts. MsgWithdrawPosition carries no minima,
          // so this lower bound plus the swap's tokenOutMinAmount are the only
          // slippage guards.
          const swapInLowerBound = new Dec(quotedSwap.swapInAmount)
            .mul(slippageMultiplier)
            .truncate();
          if (swapInLowerBound.lte(new Int(0)))
            return reject("Swap input too small after slippage");

          const outMicro = new Int(zapQuote.quote.amount.toCoin().amount);
          const tokenOutMinAmount = new Dec(outMicro)
            .mul(slippageMultiplier)
            .truncate();
          if (tokenOutMinAmount.lte(new Int(0)))
            return reject("Swap output floor rounds to zero");

          // Swap route(s) from the SQS quote, verbatim, but with the swap leg's
          // tokenInAmount replaced by the conservative lower bound.
          const routes = zapQuote.quote.split.map((route) => ({
            pools: route.pools.map((routePool, i: number) => ({
              id: routePool.id,
              tokenOutDenom: route.tokenOutDenoms[i],
            })),
            tokenInAmount: new Dec(route.initialAmount)
              .mul(slippageMultiplier)
              .truncate()
              .toString(),
          }));

          logEvent([
            EventName.ConcentratedLiquidity.removeLiquidityClicked,
            {
              liquidityUSD: Number(liquidity.toString()),
              poolId,
              positionId: position.id,
              isSingleAsset: true,
            },
          ]);

          await account.osmosis.sendZapOutOfConcentratedPositionMsg(
            position.id,
            liquidity.toString(),
            {
              routes,
              tokenInCoinMinimalDenom:
                quotedSwap.tokenInCurrency.coinMinimalDenom,
              tokenOutMinAmount: tokenOutMinAmount.toString(),
            },
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else {
                logEvent([
                  EventName.ConcentratedLiquidity.removeLiquidityCompleted,
                  {
                    liquidityUSD: Number(liquidity.toString()),
                    poolId,
                    positionId: position.id,
                    percentage: config.percentage.toString(),
                    isSingleAsset: true,
                  },
                ]);
                apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange
                  .invalidate({ poolId })
                  .finally(() => resolve());
              }
            }
          );
        } catch (e: unknown) {
          console.error(e);
          reject(e instanceof Error ? e.message : String(e));
        }
      }),
    [
      config.effectiveLiquidity,
      config.percentage,
      account,
      quotedSwap,
      zapQuote.quote,
      zapSlippageConfig,
      logEvent,
      poolId,
      position.id,
      apiUtils,
    ]
  );

  return {
    config,
    removeLiquidity,
    zapOutLiquidity,
    zapQuote,
    zapSlippageConfig,
    requiredSwap,
    currentBaseValueFraction,
    quoteInSync,
  };
}
