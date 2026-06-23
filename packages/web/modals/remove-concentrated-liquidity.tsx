import { Disclosure } from "@headlessui/react";
import type {
  PositionHistoricalPerformance,
  UserPosition,
  UserPositionDetails,
} from "@osmosis-labs/server";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { Spinner } from "~/components/loaders/spinner";
import { tError } from "~/components/localization";
import { RouteLane } from "~/components/swap-tool/split-route";
import { Checkbox } from "~/components/ui/checkbox";
import { EntityImage } from "~/components/ui/entity-image";
import { RecapRow } from "~/components/ui/recap-row";
import { Slider } from "~/components/ui/slider";
import { useConnectWalletModalRedirect, useTranslation } from "~/hooks";
import {
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
} from "~/hooks/fiat-getters";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useRemoveConcentratedLiquidityConfig } from "~/hooks/ui-config/use-remove-concentrated-liquidity-config";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";

export const RemoveConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    position: UserPosition;
    status: UserPositionDetails["status"];
    claimableRewardCoins: PositionHistoricalPerformance["claimableRewardCoins"];
  } & ModalBaseProps
> = observer((props) => {
  const {
    poolId,
    status,
    claimableRewardCoins,
    position: {
      currentCoins: [positionBaseAsset, positionQuoteAsset],
    },
  } = props;

  const { t } = useTranslation();
  const { chainStore, accountStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const {
    config,
    removeLiquidity,
    zapOutLiquidity,
    zapQuote,
    zapSlippageConfig,
    requiredSwap,
    currentBaseValueFraction,
    quoteInSync,
    swapMinOut,
    isPoolLoading,
  } = useRemoveConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    props.position
  );

  const baseAsset = config.effectiveLiquidityAmounts?.base;
  const quoteAsset = config.effectiveLiquidityAmounts?.quote;
  const baseCurrency = positionBaseAsset.currency;
  const quoteCurrency = positionQuoteAsset.currency;

  // The output-mix target is `undefined` until the user moves the slider (= the
  // no-swap state). When undefined, the slider renders at the position's current
  // value split (the no-swap point) so the handle still shows where "no swap"
  // sits. No seeding effect and no lossy default: undefined is the no-swap
  // signal end to end.
  const displayMixFraction =
    config.targetBaseValueFraction ?? currentBaseValueFraction;
  const setTargetMix = (fraction: number | undefined) =>
    config.setTargetBaseValueFraction(fraction);

  const { price: baseAssetPrice, isLoading: isLoadingBaseAssetPrice } =
    usePrice(baseAsset?.currency);
  const { price: quoteAssetPrice, isLoading: isLoadingQuoteAssetPrice } =
    usePrice(quoteAsset?.currency);

  const baseAssetValue =
    baseAssetPrice && baseAsset
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          baseAsset.toDec().mul(baseAssetPrice.toDec())
        )
      : undefined;
  const quoteAssetValue =
    quoteAssetPrice && quoteAsset
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          quoteAsset.toDec().mul(quoteAssetPrice.toDec())
        )
      : undefined;

  // Single-asset exit (zap-out) is hidden entirely on superfluid-staked /
  // unstaking positions: those have lock/unbonding handling the swap+withdraw
  // composition doesn't account for. The user sees the plain two-asset
  // withdrawal only, no banner (discoverable as "missing", not "broken").
  const isSuperfluid =
    status === "superfluidStaked" || status === "superfluidUnstaking";
  const singleAssetExitEnabled = !isSuperfluid;

  const needsSwap = singleAssetExitEnabled && Boolean(requiredSwap?.needsSwap);
  const quote = zapQuote.quote;

  // Whole-position value in vs out: the total value being withdrawn, and the
  // total value the user ends holding after the swap (the retained side at full
  // value plus the swapped side's value minus impact + fee). The gap is the
  // swap cost, expressed against the entire position.
  const positionValueIn =
    baseAssetValue && quoteAssetValue
      ? baseAssetValue.add(quoteAssetValue)
      : undefined;

  // Price of the side being swapped, used to value the swapped slice and to
  // express the swapped amount as a % of the whole position's value.
  const swapSidePrice =
    requiredSwap?.swapSide === "base" ? baseAssetPrice : quoteAssetPrice;
  const swapInValue =
    requiredSwap && swapSidePrice
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          new CoinPretty(
            requiredSwap.tokenInCurrency,
            requiredSwap.swapInAmount
          )
            .toDec()
            .mul(swapSidePrice.toDec())
        )
      : undefined;

  // Value lost on the swapped slice (impact + fee), then the whole-position
  // value out. Uses the swap tool's fiat method so value out can't exceed in.
  const swapValueOut =
    quote && swapInValue && swapSidePrice && requiredSwap
      ? getTokenOutFiatValue(
          quote.priceImpactTokenOut?.toDec(),
          swapInValue.toDec()
        ).sub(
          getTokenInFeeAmountFiatValue(
            requiredSwap.tokenInCurrency,
            quote.tokenInFeeAmount,
            swapSidePrice
          )
        )
      : undefined;
  const swapCost =
    swapInValue && swapValueOut
      ? swapInValue.toDec().sub(swapValueOut.toDec())
      : undefined;
  const positionValueOut =
    positionValueIn && swapCost
      ? new PricePretty(
          DEFAULT_VS_CURRENCY,
          positionValueIn.toDec().sub(swapCost)
        )
      : positionValueIn;

  // % of the position's value being swapped (not the slider position).
  const swapPercentOfPosition =
    swapInValue && positionValueIn && positionValueIn.toDec().isPositive()
      ? new RatePretty(swapInValue.toDec().quo(positionValueIn.toDec()))
      : undefined;

  // Minimum holdings after exit, per token: the retained (un-swapped) side at
  // its firm withdrawn amount, plus the target side's withdrawn amount plus the
  // swap's slippage-floored output. Drops any side that rounds to zero (e.g. a
  // full single-asset exit leaves only the target). Covers both symbols, since
  // a mix exit returns both.
  const minReceivedCoins: CoinPretty[] = (() => {
    if (
      !needsSwap ||
      !requiredSwap ||
      !quote ||
      !swapMinOut ||
      !baseAsset ||
      !quoteAsset
    )
      return [];
    const swapSideWithdrawn =
      requiredSwap.swapSide === "base" ? baseAsset : quoteAsset;
    const targetSideWithdrawn =
      requiredSwap.swapSide === "base" ? quoteAsset : baseAsset;

    // Retained amount of the sold side = withdrawn minus what we swap.
    const retained = swapSideWithdrawn.sub(
      new CoinPretty(swapSideWithdrawn.currency, requiredSwap.swapInAmount)
    );
    // Target side: its own withdrawn amount plus the swap's minimum output.
    const targetTotal = targetSideWithdrawn.add(swapMinOut);

    return [targetTotal, retained].filter((c) => c.toDec().isPositive());
  })();

  // High price-impact guard, mirroring the zap-in: a large-loss swap requires an
  // explicit Confirm before it can be submitted.
  const [costAcknowledged, setCostAcknowledged] = useState(false);
  const highCost = Boolean(
    needsSwap && quote?.priceImpactTokenOut?.toDec().lt(new Dec(-0.1))
  );

  // Reset the acknowledgement when the trade context changes, so a prior
  // confirm can't carry over to a different high-impact swap. Keyed on the live
  // swap amount (changes when the user moves the mix, not on the 5s refetch) and
  // whether the warning is showing.
  const costContextKey = `${
    requiredSwap?.swapInAmount.toString() ?? ""
  }:${highCost}`;
  useEffect(() => {
    setCostAcknowledged(false);
  }, [costContextKey]);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        config.error !== undefined ||
        isSendingMsg ||
        // Block submission while a needed swap quote isn't ready, or while the
        // quote (debounced) doesn't yet reflect the live slider target, so we
        // never execute a stale target mix.
        (needsSwap && (zapQuote.isLoading || !quote || !quoteInSync)) ||
        // The user chose a real target mix but the pool data needed to compute
        // the swap is still loading, so we can't tell if it needs a swap yet.
        // Block only while that query is in flight (not once it has settled), so
        // a never-resolving query can't trap the user with no path to withdraw;
        // once settled with no computable swap, submit falls through to a plain
        // withdrawal. (No target = the explicit no-swap state, which is fine.)
        (singleAssetExitEnabled &&
          config.targetBaseValueFraction !== undefined &&
          !requiredSwap &&
          isPoolLoading) ||
        (highCost && !costAcknowledged),
      onClick: () =>
        (needsSwap ? zapOutLiquidity() : removeLiquidity())
          .then(() => props.onRequestClose())
          .catch(console.error),
      children: config.error
        ? t(...tError(config.error))
        : t("clPositions.removeLiquidity"),
    },
    props.onRequestClose
  );

  const totalFiat =
    baseAssetValue && quoteAssetValue
      ? baseAssetValue.add(quoteAssetValue)
      : undefined;

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      className="!max-w-[500px]"
      title={t("clPositions.removeLiquidity")}
    >
      <div className="pt-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="pl-4 text-subtitle1 font-subtitle1 xs:pl-0">
              {t("clPositions.yourPosition")}
            </div>
            <MyPositionStatus className="xs:px-0" status={status} negative />
          </div>
          <div className="mb-8 flex justify-between rounded-xl bg-osmoverse-700 px-5 py-3 text-osmoverse-100 xs:flex-wrap xs:gap-y-2 xs:px-3">
            <AssetAmount amount={positionBaseAsset} />
            <AssetAmount amount={positionQuoteAsset} />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-9">
        <SkeletonLoader
          isLoaded={!isLoadingBaseAssetPrice || !isLoadingQuoteAssetPrice}
        >
          <h2>
            {DEFAULT_VS_CURRENCY.symbol}
            {totalFiat?.toDec().toString(2) ?? "0.00"}
          </h2>
        </SkeletonLoader>
        <div className="flex w-full flex-col items-center gap-6">
          <Slider
            variant="secondary"
            value={[Math.round(config.percentage * 100)]}
            onValueChange={(value: number[]) => {
              config.setPercentage(Number((value[0] / 100).toFixed(2)));
            }}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex w-full gap-2 px-5">
            <PresetPercentageButton onClick={() => config.setPercentage(0.25)}>
              25%
            </PresetPercentageButton>
            <PresetPercentageButton onClick={() => config.setPercentage(0.5)}>
              50%
            </PresetPercentageButton>
            <PresetPercentageButton onClick={() => config.setPercentage(0.75)}>
              75%
            </PresetPercentageButton>
            <PresetPercentageButton onClick={() => config.setPercentage(1)}>
              {t("components.MAX")}
            </PresetPercentageButton>
          </div>
        </div>

        {/* Output-mix slider: target value split. Ends are clickable token
            icons (all token0 / all token1); the handle starts at the position's
            current ratio (no swap). Moving it off that point swaps one side.
            Hidden on superfluid positions. */}
        {singleAssetExitEnabled && (
          <div className="flex w-full flex-col gap-3">
            <div className="pl-4 text-subtitle1 font-subtitle1 xs:pl-0">
              {t("clPositions.receiveAs")}
            </div>
            <div className="flex w-full items-center gap-3">
              <AssetIconButton
                currency={baseCurrency}
                onClick={() => setTargetMix(1)}
              />
              <Slider
                className="flex-1"
                variant="secondary"
                // Left end = base (matches the left icon), right end = quote.
                // The slider position is the quote-value fraction, the inverse of
                // the base-value fraction, so the handle sits under the icon it
                // favours. When no target is chosen it renders at the current
                // ratio (the no-swap point); falls back to center until that
                // loads.
                value={[Math.round((1 - (displayMixFraction ?? 0.5)) * 100)]}
                onValueChange={(value: number[]) => {
                  setTargetMix(Number((1 - value[0] / 100).toFixed(2)));
                }}
                onValueCommit={(value: number[]) => {
                  // Released within 2% of the current ratio: return to the
                  // explicit no-swap state (undefined) rather than a near-equal
                  // numeric target, so a near-miss never triggers a tiny swap.
                  const target = 1 - value[0] / 100;
                  if (
                    currentBaseValueFraction !== undefined &&
                    Math.abs(target - currentBaseValueFraction) <= 0.02
                  ) {
                    setTargetMix(undefined);
                  }
                }}
                min={0}
                max={100}
                step={1}
              />
              <AssetIconButton
                currency={quoteCurrency}
                onClick={() => setTargetMix(0)}
              />
            </div>

            {needsSwap && requiredSwap && (
              <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-900 p-4">
                <p className="body2 text-center text-osmoverse-200">
                  {t("clPositions.swapBreakdown", {
                    swapAmount: formatPretty(
                      new CoinPretty(
                        requiredSwap.tokenInCurrency,
                        requiredSwap.swapInAmount
                      ).hideDenom(true)
                    ),
                    inDenom: requiredSwap.tokenInCurrency.coinDenom,
                    swapPercent: formatPretty(
                      (swapPercentOfPosition ?? new RatePretty(0)).maxDecimals(
                        0
                      )
                    ),
                    outDenom: requiredSwap.tokenOutCurrency.coinDenom,
                  })}
                </p>

                {zapQuote.isLoading || !quoteInSync ? (
                  // Show loading while the quote is fetching OR while the
                  // debounced target is still catching up to the live slider, so
                  // we never render a stale breakdown (fees/min/route for the old
                  // target) or a "value loss" error for an in-flight mix change.
                  <div className="flex items-center justify-center gap-2 py-2 text-osmoverse-300">
                    <Spinner className="!h-4 !w-4" />
                    <span className="caption">
                      {t("addConcentratedLiquidity.singleAsset.quoteLoading")}
                    </span>
                  </div>
                ) : !quote ? (
                  <p className="caption py-2 text-center text-rust-300">
                    {t("transfer.transferAmountTooLowValueLoss")}
                  </p>
                ) : (
                  <ZapOutBreakdown
                    quote={quote}
                    requiredSwap={requiredSwap}
                    valueOut={positionValueOut}
                    minReceivedCoins={minReceivedCoins}
                    zapSlippageConfig={zapSlippageConfig}
                  />
                )}

                {highCost && quote && quoteInSync && (
                  <div className="flex flex-col items-center gap-3 rounded-xl bg-osmoverse-825 p-3">
                    <div className="flex items-center justify-center gap-2 text-rust-300">
                      <Icon
                        id="alert-circle-filled"
                        width={16}
                        height={16}
                        className="shrink-0"
                      />
                      <p className="body2 text-center">
                        {t("transfer.priceImpactWarning", {
                          priceImpact: formatPretty(
                            quote.priceImpactTokenOut ?? new RatePretty(0)
                          ),
                        })}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <label htmlFor="cl-zap-out-cost-ack" className="body2">
                        {t("transfer.confirm")}
                      </label>
                      <Checkbox
                        id="cl-zap-out-cost-ack"
                        variant="destructive"
                        checked={costAcknowledged}
                        onCheckedChange={(checked) =>
                          setCostAcknowledged(checked === true)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {(claimableRewardCoins?.length ?? 0) > 0 && (
          <div className="flex w-full flex-col gap-3 py-3">
            <div className="pl-4 text-subtitle1 font-subtitle1 xl:pl-1">
              {t("clPositions.pendingRewards")}
            </div>
            <div className="flex flex-wrap justify-between gap-3 rounded-xl border-[1.5px]  border-osmoverse-700 px-5 py-3 xs:flex-wrap xs:gap-y-2 xs:px-3">
              {claimableRewardCoins?.map((coin) => (
                <AssetAmount
                  key={coin.currency.coinMinimalDenom}
                  className="!text-body2 !font-body2"
                  amount={coin}
                />
              ))}
            </div>
          </div>
        )}
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

/** Swap-leg breakdown for the single-asset exit, mirroring the zap-in display
 *  (receive-at-least, value in/out, swap fees, route). Copied rather than shared
 *  to keep the exit feature independent from the zap-in PR; can DRY once both
 *  have shipped. */
const ZapOutBreakdown: FunctionComponent<{
  quote: NonNullable<
    ReturnType<typeof useRemoveConcentratedLiquidityConfig>["zapQuote"]["quote"]
  >;
  requiredSwap: NonNullable<
    ReturnType<typeof useRemoveConcentratedLiquidityConfig>["requiredSwap"]
  >;
  /** Whole-position value the user ends holding after the swap. Value in is the
   *  headline total above the amount slider, so it is not repeated here. */
  valueOut?: PricePretty;
  /** Minimum holdings after exit, per token (retained side + target side's
   *  slippage-floored total). Covers both symbols for a mix exit. */
  minReceivedCoins: CoinPretty[];
  zapSlippageConfig: ReturnType<
    typeof useRemoveConcentratedLiquidityConfig
  >["zapSlippageConfig"];
}> = observer((props) => {
  const { quote, requiredSwap, valueOut, minReceivedCoins, zapSlippageConfig } =
    props;
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col">
      <RecapRow
        left={t("receiveAtLeast")}
        right={
          <span className="body2 text-right text-white-full">
            {minReceivedCoins.map((c) => formatPretty(c)).join(" + ")}
          </span>
        }
      />
      {valueOut && (
        <RecapRow
          left={t("addConcentratedLiquidity.singleAsset.valueOut")}
          right={
            <span className="body2 text-osmoverse-200">
              {formatFiatPrice(valueOut)}
            </span>
          }
        />
      )}
      {quote.swapFee && quote.tokenInFeeAmount && (
        <RecapRow
          left={t("pools.aprBreakdown.swapFees")}
          right={
            <span className="body2 text-osmoverse-200">
              {formatPretty(
                new CoinPretty(
                  requiredSwap.tokenInCurrency,
                  quote.tokenInFeeAmount
                )
              )}{" "}
              ({quote.swapFee.toString()})
            </span>
          }
        />
      )}
      <RecapRow
        left={t("swap.settings.slippage")}
        right={<SlippageInput slippageConfig={zapSlippageConfig} />}
      />
      {quote.split.length > 0 && (
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex min-h-[2rem] w-full items-center justify-between sm:min-h-[1.5rem]">
                <span className="sm:caption text-osmoverse-300">
                  {t("swap.autoRouter")}
                </span>
                <div className="flex items-center gap-1 text-wosmongton-300">
                  <span>
                    {quote.split.length}{" "}
                    {quote.split.length === 1
                      ? t("swap.route")
                      : t("swap.routes")}
                  </span>
                  <Icon
                    id="chevron-down"
                    className={classNames(
                      "h-[7px] w-3 text-wosmongton-200 transition-transform",
                      { "rotate-180": open }
                    )}
                  />
                </div>
              </Disclosure.Button>
              <Disclosure.Panel className="flex w-full flex-col gap-2 pb-2">
                {quote.split.map((route) => (
                  <RouteLane
                    key={route.pools.map(({ id }) => id).join()}
                    route={route}
                  />
                ))}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </div>
  );
});

/** Editable slippage-tolerance input for the zap-out swap leg, mirroring the
 *  zap-in / swap-tool slippage box. Copied to keep the exit feature independent
 *  from the zap-in PR; can DRY once both have shipped. */
const SlippageInput: FunctionComponent<{
  slippageConfig: ReturnType<
    typeof useRemoveConcentratedLiquidityConfig
  >["zapSlippageConfig"];
}> = observer(({ slippageConfig }) => {
  const [manualSlippage, setManualSlippage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      if (value === "" || !Number.isFinite(parsed)) {
        setManualSlippage("");
        slippageConfig.setManualSlippage(slippageConfig.defaultManualSlippage);
        return;
      }
      // Clamp to a sane range so a negative / huge / non-finite entry can't
      // produce a nonsensical minimum or break the Dec math.
      const clamped = Math.max(0, Math.min(50, parsed));
      setManualSlippage(clamped.toString());
      slippageConfig.setManualSlippage(new Dec(clamped).toString());
    },
    [slippageConfig]
  );

  return (
    <div
      className={classNames(
        "body2 flex w-fit items-center justify-center overflow-hidden rounded-lg px-2 py-0.5 text-center transition-all",
        isEditing
          ? "border-2 border-solid border-wosmongton-300 bg-osmoverse-900"
          : "border border-osmoverse-700 bg-osmoverse-850"
      )}
    >
      <AutosizeInput
        type="text"
        inputMode="decimal"
        minWidth={36}
        placeholder={slippageConfig.defaultManualSlippage + "%"}
        className="body2 w-fit bg-transparent px-0"
        inputClassName="body2 !bg-transparent text-right placeholder:text-wosmongton-300 focus:text-center transition-all focus-visible:outline-none"
        value={manualSlippage}
        onFocus={() => {
          slippageConfig.setIsManualSlippage(true);
          setIsEditing(true);
        }}
        onBlur={() => setIsEditing(false)}
        onChange={(e) => handleChange(e.target.value)}
      />
      {manualSlippage !== "" && <span className="body2">%</span>}
    </div>
  );
});

const AssetIconButton: FunctionComponent<{
  currency: { coinDenom: string; coinImageUrl?: string };
  onClick: () => void;
}> = ({ currency, onClick }) => (
  <button
    type="button"
    aria-label={currency.coinDenom}
    title={currency.coinDenom}
    onClick={onClick}
    className="h-8 w-8 shrink-0 overflow-hidden rounded-full transition-transform hover:scale-110"
  >
    <EntityImage
      logoURIs={{ png: currency.coinImageUrl }}
      name={currency.coinDenom}
      symbol={currency.coinDenom}
      height={32}
      width={32}
    />
  </button>
);

const PresetPercentageButton: FunctionComponent<{
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ selected, children, onClick, disabled }) => {
  return (
    <button
      className={classNames(
        "flex flex-1 cursor-pointer items-center justify-center",
        "rounded-lg bg-osmoverse-700 px-5 py-2 text-h6 font-h6 text-wosmongton-100 hover:bg-osmoverse-600 xs:px-3 xs:text-subtitle1",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": selected,
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const AssetAmount: FunctionComponent<{
  amount: CoinPretty;
  className?: string;
}> = ({ amount, className }) => (
  <div
    className={classNames(
      "flex shrink-0 items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2",
      className
    )}
  >
    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full">
      <EntityImage
        logoURIs={{
          png: amount.currency.coinImageUrl,
        }}
        name={amount.currency.coinDenom}
        symbol={amount.currency.coinDenom}
        height={24}
        width={24}
      />
    </div>
    <span>{formatPretty(amount, { maxDecimals: 2 })}</span>
  </div>
);
