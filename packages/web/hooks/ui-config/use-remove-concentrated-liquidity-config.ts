import { ChainGetter } from "@osmosis-labs/keplr-stores";
import {
  BigDec,
  calcZapOutRouteDegradation,
  calcZapOutSwapAmount,
} from "@osmosis-labs/math";
import type {
  ConcentratedPoolRawResponse,
  UserPosition,
} from "@osmosis-labs/server";
import { ObservableRemoveConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { useEffect } from "react";
import { useCallback, useState } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
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
  /** The enforced swap-leg minimum output (target-side currency), matching what
   *  the tx submits, so the "receive at least" display can't overstate it.
   *  Undefined when no swap is needed or the quote isn't ready. */
  swapMinOut: CoinPretty | undefined;
  /** The sold-side amount the swap message actually spends (sold-side
   *  currency). The swap spends from the whole account balance, so when the
   *  wallet already holds the sold denom the modal sizes a caution row
   *  against this. Undefined when no swap is needed or the plan isn't ready. */
  swapExecutedIn: CoinPretty | undefined;
  /** Whether the pool query (source of the spot price the swap math needs) is
   *  still loading. The consumer only blocks a chosen mix while this is true, so
   *  a never-resolving query can't trap the user with no path to withdraw. */
  isPoolLoading: boolean;
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
  const { data: pool, isLoading: isPoolLoading } =
    api.local.pools.getPool.useQuery({ poolId });
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

  // Portion of the quoted swap routed through the position's OWN pool. The
  // withdraw leg executes FIRST and removes the withdrawn liquidity from
  // exactly the depths the SQS quote assumed, so a min-out derived from the
  // raw quote can exceed what the thinner post-withdraw book delivers and
  // revert the whole tx. In an acyclic route this pair pool can only appear
  // as a direct single-hop route (any other placement revisits a denom), so
  // the routed amount is known exactly from the split. When it is non-zero,
  // the pool's live tick depths are fetched and the expected output of that
  // slice is degraded by a post-withdraw simulation (see `swapExecution`).
  const poolRoutedInput = (zapQuote.quote?.split ?? [])
    .filter((route) => route.pools.length === 1 && route.pools[0].id === poolId)
    .reduce((sum, route) => sum.add(route.initialAmount), new Int(0));
  const needsDepthAdjustment = poolRoutedInput.gt(new Int(0));
  const { data: liquidityDepths } =
    api.local.concentratedLiquidity.getLiquidityPerTickRange.useQuery(
      { poolId },
      { enabled: needsDepthAdjustment }
    );

  // The swap-leg execution plan: the slippage-scaled per-leg routes and the
  // resulting tokenOutMinAmount. Derived once and used both for submission and
  // for the "receive at least" display, so the UI shows exactly what the tx
  // enforces (no drift between the displayed minimum and the on-chain floor).
  const slippageMultiplier = new Dec(1).sub(zapSlippageConfig.slippage.toDec());
  const swapExecution = (() => {
    if (!quotedSwap?.needsSwap || !zapQuote.quote) return undefined;

    // Each leg's tokenIn is the conservative LOWER BOUND of the projected
    // withdrawn amount of the sold side, fixed at sign time. NOTE the swap
    // message spends from the whole account balance, not specifically from
    // the withdrawal's outputs: if spot drift beyond the slippage buffer
    // makes the withdraw deliver less than this input, the tx reverts only
    // when the wallet holds none of the sold denom; an existing balance
    // covers the shortfall and is swapped instead. That residual is surfaced
    // to the user as a caution row when such a balance exists (the modal
    // reads `swapExecutedIn` for it). Truncation is per-leg, so the actual
    // total input is slightly below the full quote input.
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

    // The min-out tracks the ACTUAL scaled input, not the full quote output:
    // scale the expected output by the realised input ratio (sum of scaled leg
    // inputs / full quote input), then apply slippage. Output scales ~linearly
    // with input at the same rate, so a min-out tied to the larger full-quote
    // output would make the swap revert even when the withdraw succeeds.
    const fullInput = zapQuote.quote.split.reduce(
      (sum, route) => sum.add(new Dec(route.initialAmount)),
      new Dec(0)
    );
    const scaledInput = routes.reduce(
      (sum, route) => sum.add(new Dec(route.tokenInAmount)),
      new Dec(0)
    );
    const inputRatio = fullInput.isZero()
      ? new Dec(0)
      : scaledInput.quo(fullInput);
    const outMicro = new Int(zapQuote.quote.amount.toCoin().amount);
    let expectedOut = new Dec(outMicro);

    // Degrade the pool-routed slice of the expected output for the liquidity
    // the withdraw removes before the swap runs. FAIL CLOSED while the data
    // this requires is missing: returning undefined here blocks submission
    // (and the breakdown shows its loading state) rather than composing a
    // min-out the post-withdraw book may not deliver.
    if (needsDepthAdjustment) {
      if (
        !currentSqrtPrice ||
        !liquidityDepths ||
        liquidityDepths.length === 0 ||
        !config.effectiveLiquidity
      )
        return undefined;
      const degradation = calcZapOutRouteDegradation({
        swapInAmount: poolRoutedInput,
        swapSide: quotedSwap.swapSide,
        currentSqrtPrice,
        liquidityDepths,
        withdrawnLiquidity: new Dec(config.effectiveLiquidity.toString()),
        positionLowerTick: new Int(position.position.position.lower_tick),
        positionUpperTick: new Int(position.position.position.upper_tick),
      });
      // Applied to the WHOLE expected output, not weighted by the pool
      // route's input share: split routes can carry different average
      // execution rates, so the input share can understate the own-pool
      // route's output contribution and leave the floor above the
      // post-withdraw result. The quote gives no per-route outputs, so the
      // conservative whole-output application is the safe choice; it only
      // over-degrades (weaker floor, never a self-inflicted revert), and is
      // exact in the dominant case of a single direct route.
      expectedOut = expectedOut.mul(degradation);
    }

    const tokenOutMinAmount = expectedOut
      .mul(inputRatio)
      .mul(slippageMultiplier)
      .truncate();

    return {
      routes,
      tokenOutMinAmount,
      tokenInCoinMinimalDenom: quotedSwap.tokenInCurrency.coinMinimalDenom,
      /** The enforced minimum output, as the target-side currency. */
      swapMinOut: new CoinPretty(
        quotedSwap.tokenOutCurrency,
        tokenOutMinAmount
      ),
      /** The total sold-side amount the swap message actually spends (sum of
       *  the scaled leg inputs), as the sold-side currency. The wallet-balance
       *  caution row is sized against this. */
      swapExecutedIn: new CoinPretty(
        quotedSwap.tokenInCurrency,
        scaledInput.truncate()
      ),
    };
  })();

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
        // Failures after broadcasting are surfaced by the global tx-event
        // toast; failures BEFORE it (preflight: stale quote, dust floors)
        // have no other user-visible surface, so they are toasted below.
        // Mirrors the zap-in flow.
        const rejectPreflight = (message: string) => {
          displayToast(
            { titleTranslationKey: "errors.generic", captionElement: message },
            ToastType.ERROR
          );
          reject(message);
        };
        let broadcastAttempted = false;
        try {
          const liquidity = config.effectiveLiquidity;
          if (!liquidity) return rejectPreflight("Invalid liquidity");
          if (!account) return rejectPreflight("No account");
          // Submit against the debounced swap the quote was computed for, not
          // the live (possibly mid-drag) one. `swapExecution` is the shared
          // scaled-routes + min-out plan, also used by the breakdown display.
          if (!quotedSwap?.needsSwap || !swapExecution)
            return rejectPreflight("Swap quote not ready");

          const { routes, tokenOutMinAmount, tokenInCoinMinimalDenom } =
            swapExecution;

          // The swap leg's tokenIn is the conservative LOWER BOUND of the
          // projected withdrawn amount of the sold side, fixed at sign time.
          // MsgWithdrawPosition carries no minima, so this lower bound plus
          // the swap's tokenOutMinAmount are the only slippage guards; the
          // swap spends from the account balance, so beyond-tolerance drift
          // draws on any pre-existing sold-denom balance instead of
          // reverting (see sendZapOutOfConcentratedPositionMsg's doc and the
          // modal's caution row).
          const swapInLowerBound = new Dec(quotedSwap.swapInAmount)
            .mul(slippageMultiplier)
            .truncate();
          if (swapInLowerBound.lte(new Int(0)))
            return rejectPreflight("Swap input too small after slippage");
          if (tokenOutMinAmount.lte(new Int(0)))
            return rejectPreflight("Swap output floor rounds to zero");

          logEvent([
            EventName.ConcentratedLiquidity.removeLiquidityClicked,
            {
              liquidityUSD: Number(liquidity.toString()),
              poolId,
              positionId: position.id,
              isSingleAsset: true,
            },
          ]);

          broadcastAttempted = true;
          await account.osmosis.sendZapOutOfConcentratedPositionMsg(
            position.id,
            liquidity.toString(),
            {
              routes,
              tokenInCoinMinimalDenom,
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
          const message = e instanceof Error ? e.message : String(e);
          // Broadcast failures already toast via the global tx-event handler.
          if (!broadcastAttempted) rejectPreflight(message);
          else reject(message);
        }
      }),
    [
      config.effectiveLiquidity,
      config.percentage,
      account,
      quotedSwap,
      swapExecution,
      slippageMultiplier,
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
    swapMinOut: swapExecution?.swapMinOut,
    swapExecutedIn: swapExecution?.swapExecutedIn,
    isPoolLoading,
  };
}
