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
  useEffect,
  useState,
} from "react";

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
import { formatPretty } from "~/utils/formatter";

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

  // Seed the output-mix slider at the position's current value split (the
  // no-swap point) once it is known. Only seed once, so the user's drag isn't
  // overwritten by later re-renders.
  const [hasSeededMix, setHasSeededMix] = useState(false);
  useEffect(() => {
    if (!hasSeededMix && currentBaseValueFraction !== undefined) {
      config.setTargetBaseValueFraction(currentBaseValueFraction);
      setHasSeededMix(true);
    }
  }, [hasSeededMix, currentBaseValueFraction, config]);

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

  // High price-impact guard, mirroring the zap-in: a large-loss swap requires an
  // explicit Confirm before it can be submitted.
  const [costAcknowledged, setCostAcknowledged] = useState(false);
  const highCost = Boolean(
    needsSwap && quote?.priceImpactTokenOut?.toDec().lt(new Dec(-0.1))
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        config.error !== undefined ||
        isSendingMsg ||
        // Block submission while a needed swap quote isn't ready.
        (needsSwap && (zapQuote.isLoading || !quote)) ||
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
                onClick={() => config.setTargetBaseValueFraction(1)}
              />
              <Slider
                className="flex-1"
                variant="secondary"
                value={[Math.round(config.targetBaseValueFraction * 100)]}
                onValueChange={(value: number[]) => {
                  config.setTargetBaseValueFraction(
                    Number((value[0] / 100).toFixed(2))
                  );
                }}
                min={0}
                max={100}
                step={1}
              />
              <AssetIconButton
                currency={quoteCurrency}
                onClick={() => config.setTargetBaseValueFraction(0)}
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
                      new RatePretty(
                        config.targetBaseValueFraction
                      ).maxDecimals(0)
                    ),
                    outDenom: requiredSwap.tokenOutCurrency.coinDenom,
                  })}
                </p>

                {zapQuote.isLoading ? (
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
                    zapSlippageConfig={zapSlippageConfig}
                  />
                )}

                {highCost && quote && (
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
          <div className="mt-8 flex w-full flex-col gap-3 py-3">
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
  zapSlippageConfig: ReturnType<
    typeof useRemoveConcentratedLiquidityConfig
  >["zapSlippageConfig"];
}> = observer(({ quote, requiredSwap, zapSlippageConfig }) => {
  const { t } = useTranslation();

  const minReceived = quote.amount.mul(
    new Dec(1).sub(zapSlippageConfig.slippage.toDec())
  );

  // Value in (the swapped side's value) vs value out (after impact + fee),
  // valued off the single token-in price, mirroring the swap tool.
  const { price: tokenInPrice } = usePrice(requiredSwap.tokenInCurrency);
  const swapInValue = tokenInPrice
    ? tokenInPrice.mul(
        new CoinPretty(requiredSwap.tokenInCurrency, requiredSwap.swapInAmount)
      )
    : undefined;
  const valueOut =
    tokenInPrice && swapInValue
      ? getTokenOutFiatValue(
          quote.priceImpactTokenOut?.toDec(),
          swapInValue.toDec()
        ).sub(
          getTokenInFeeAmountFiatValue(
            requiredSwap.tokenInCurrency,
            quote.tokenInFeeAmount,
            tokenInPrice
          )
        )
      : undefined;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col">
      <RecapRow
        left={t("receiveAtLeast")}
        right={
          <span className="body2 text-white-full">
            {formatPretty(minReceived)}
          </span>
        }
      />
      {swapInValue && (
        <RecapRow
          left={t("addConcentratedLiquidity.singleAsset.valueIn")}
          right={
            <span className="body2 text-osmoverse-200">
              {formatPretty(swapInValue, { maxDecimals: 2 })}
            </span>
          }
        />
      )}
      {valueOut && (
        <RecapRow
          left={t("addConcentratedLiquidity.singleAsset.valueOut")}
          right={
            <span className="body2 text-osmoverse-200">
              {formatPretty(valueOut, { maxDecimals: 2 })}
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
