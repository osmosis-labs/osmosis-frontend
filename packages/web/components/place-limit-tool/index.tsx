import { Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets/icon";
import {
  AssetFieldset,
  AssetFieldsetFooter,
  AssetFieldsetHeader,
  AssetFieldsetHeaderBalance,
  AssetFieldsetHeaderLabel,
  AssetFieldsetInput,
  AssetFieldsetTokenSelector,
} from "~/components/complex/asset-fieldset";
import { LimitPriceSelector } from "~/components/place-limit-tool/limit-price-selector";
import { TRADE_TYPES } from "~/components/swap-tool/order-type-selector";
import { PriceSelector } from "~/components/swap-tool/price-selector";
import { TradeDetails } from "~/components/swap-tool/trade-details";
import { Button } from "~/components/ui/button";
import { EventPage } from "~/config";
import {
  useDisclosure,
  useSlippageConfig,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { MIN_ORDER_VALUE, usePlaceLimit } from "~/hooks/limit-orders";
import { AddFundsModal } from "~/modals/add-funds";
import { ReviewOrder } from "~/modals/review-order";
import { useStore } from "~/stores";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";
import { countDecimals, trimPlaceholderZeros } from "~/utils/number";

export interface PlaceLimitToolProps {
  page: EventPage;
  initialBaseDenom?: string;
  initialQuoteDenom?: string;
  onOrderSuccess?: (baseDenom?: string, quoteDenom?: string) => void;
}

const fixDecimalCount = (value: string, decimalCount = 18) => {
  const split = value.split(".");
  const result =
    split[0] +
    (decimalCount > 0 ? "." + split[1].substring(0, decimalCount) : "");
  return result;
};

const transformAmount = (value: string, decimalCount = 18) => {
  let updatedValue = value;
  if (value.endsWith(".") && value.length === 1) {
    updatedValue = value + "0";
  }

  if (value.startsWith(".")) {
    updatedValue = "0" + value;
  }

  const decimals = countDecimals(updatedValue);
  return decimals > decimalCount
    ? fixDecimalCount(updatedValue, decimalCount)
    : updatedValue;
};

// Certain errors we do not wish to show on the button
const NON_DISPLAY_ERRORS = [
  "errors.zeroAmount",
  "errors.emptyAmount",
  "limitOrders.priceTooLow",
  "limitOrders.priceTooHigh",
];

export const PlaceLimitTool: FunctionComponent<PlaceLimitToolProps> = observer(
  ({
    page,
    initialBaseDenom = "ATOM",
    initialQuoteDenom = "USDC",
    onOrderSuccess,
  }: PlaceLimitToolProps) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();
    const inputRef = useRef<HTMLInputElement>(null);

    const [{ from, quote, tab, type }, set] = useQueryStates({
      from: parseAsString.withDefault(initialBaseDenom || "ATOM"),
      quote: parseAsString.withDefault(initialQuoteDenom || "USDC"),
      type: parseAsStringLiteral(TRADE_TYPES).withDefault("market"),
      tab: parseAsString,
      to: parseAsString,
    });
    const [isSendingTx, setIsSendingTx] = useState(false);

    const [focused, setFocused] = useState<"fiat" | "token">(
      tab === "buy" ? "fiat" : "token"
    );

    const [fiatAmount, setFiatAmount] = useState<string>("");

    const setBase = useCallback((base: string) => set({ from: base }), [set]);

    if (from === quote) {
      if (quote === "USDC") {
        set({ quote: "USDT" });
      } else {
        set({ quote: "USDC" });
      }
    }

    const orderDirection = useMemo(
      () => (tab === "buy" ? "bid" : "ask"),
      [tab]
    );

    const { onOpenWalletSelect } = useWalletSelect();

    const slippageConfig = useSlippageConfig();

    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      orderDirection,
      useQueryParams: false,
      baseDenom: from,
      quoteDenom: quote,
      type,
      page,
      maxSlippage: slippageConfig.slippage.toDec(),
    });

    // Adjust price to base price if the type changes to "market"
    useEffect(() => {
      if (
        type === "market" &&
        swapState.priceState.percentAdjusted.abs().gt(new Dec(0))
      ) {
        swapState.priceState.reset();
      }
    }, [swapState.priceState, type]);

    useEffect(() => {
      if (type === "market" && focused === "token" && tab === "buy") {
        setFocused("fiat");
      }

      if (type === "market" && focused === "fiat" && tab === "sell") {
        setFocused("token");
      }
    }, [focused, tab, type]);

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    // const isSwapToolLoading = false;
    const hasFunds = useMemo(
      () =>
        (tab === "buy"
          ? swapState.quoteTokenBalance
          : swapState.baseTokenBalance
        )
          ?.toDec()
          .gt(new Dec(0)),
      [swapState.baseTokenBalance, swapState.quoteTokenBalance, tab]
    );

    const tokenAmount = useMemo(
      () => swapState.inAmountInput.inputAmount,
      [swapState.inAmountInput.inputAmount]
    );

    const isMarketLoading = useMemo(() => {
      return (
        swapState.isMarket &&
        swapState.marketState.isQuoteLoading &&
        !Boolean(swapState.marketState.error)
      );
    }, [
      swapState.isMarket,
      swapState.marketState.isQuoteLoading,
      swapState.marketState.error,
    ]);

    const selectableBaseAssets = useMemo(() => {
      return swapState.marketState.selectableAssets.filter(
        (asset) => asset.coinDenom !== swapState.quoteAsset!.coinDenom
      );
    }, [swapState.marketState.selectableAssets, swapState.quoteAsset]);

    const { outAmountLessSlippage, outFiatAmountLessSlippage } = useMemo(() => {
      // Compute ratio of 1 - slippage
      const oneMinusSlippage = new Dec(1).sub(slippageConfig.slippage.toDec());

      // Compute out amount less slippage
      const outAmountLessSlippage =
        swapState.marketState.quote && swapState.marketState.toAsset
          ? new IntPretty(
              swapState.marketState.quote.amount.toDec().mul(oneMinusSlippage)
            )
          : undefined;

      // Compute out fiat amount less slippage
      const outFiatAmountLessSlippage = swapState.marketState.tokenOutFiatValue
        ? new PricePretty(
            DEFAULT_VS_CURRENCY,
            swapState.marketState.tokenOutFiatValue
              ?.toDec()
              .mul(oneMinusSlippage)
          )
        : undefined;

      return { outAmountLessSlippage, outFiatAmountLessSlippage };
    }, [
      slippageConfig.slippage,
      swapState.marketState.quote,
      swapState.marketState.toAsset,
      swapState.marketState.tokenOutFiatValue,
    ]);

    const setAmountSafe = useCallback(
      (amountType: "fiat" | "token", value?: string) => {
        const update =
          amountType === "fiat"
            ? setFiatAmount
            : swapState.inAmountInput.setAmount;
        const setMarketAmount = swapState.marketState.inAmountInput.setAmount;

        // If value is empty clear values
        if (!value?.trim()) {
          if (amountType === "fiat") {
            setMarketAmount("");
          }
          return update("");
        }

        const updatedValue = transformAmount(
          value,
          amountType === "fiat" ? 2 : swapState.baseAsset?.coinDecimals
        ).trim();

        if (
          !isValidNumericalRawInput(updatedValue) ||
          updatedValue.length > 26 ||
          (updatedValue.length > 0 && updatedValue.startsWith("-"))
        ) {
          return;
        }

        const isFocused = focused === amountType;

        // Hacky solution to deal with rounding
        // TODO: Investigate a way to improve this
        if (amountType === "fiat" && tab === "buy") {
          setMarketAmount(
            new Dec(updatedValue)
              .quo(swapState.quoteAssetPrice.toDec())
              .toString()
          );
        }

        const formattedValue =
          parseFloat(updatedValue) !== 0 && !isFocused
            ? trimPlaceholderZeros(updatedValue)
            : updatedValue;

        update(formattedValue);
      },
      [
        focused,
        swapState.baseAsset?.coinDecimals,
        swapState.inAmountInput,
        swapState.marketState.inAmountInput.setAmount,
        swapState.quoteAssetPrice,
        tab,
      ]
    );

    // Adjusts the token value when the user updates the fiat value
    useEffect(() => {
      if (focused !== "token" || !swapState.priceState.price) return;

      const value = tokenAmount.length > 0 ? new Dec(tokenAmount) : undefined;
      const fiatValue = value
        ? swapState.priceState.price.mul(value)
        : undefined;

      setAmountSafe("fiat", fiatValue ? fiatValue.toString() : undefined);
    }, [
      focused,
      setAmountSafe,
      swapState.priceState.price,
      tokenAmount,
      swapState.marketState.inAmountInput,
      tab,
    ]);

    // Adjusts the token value when the user updates the fiat value
    useEffect(() => {
      if (focused !== "fiat" || !swapState.priceState.price) return;

      const value =
        fiatAmount && fiatAmount.length > 0 ? fiatAmount : undefined;
      const tokenValue = value
        ? new Dec(value).quo(swapState.priceState.price)
        : undefined;
      setAmountSafe("token", tokenValue ? tokenValue.toString() : undefined);
    }, [fiatAmount, setAmountSafe, focused, swapState.priceState.price]);

    const expectedOutput = useMemo(
      () => swapState.marketState.quote?.amount.toDec(),
      [swapState.marketState.quote?.amount]
    );

    const toggleMax = useCallback(() => {
      if (tab === "buy") {
        // Tab is buy so use quote amount

        // Determine amount based on current input
        const amount =
          focused === "fiat"
            ? swapState.quoteTokenBalance?.toDec().toString()
            : swapState.quoteTokenBalance
                ?.toDec()
                .quo(swapState.priceState.price)
                .toString();

        setAmountSafe(focused, amount);

        return;
      }

      // Tab must be sell so we use base amount

      // Determine amount based on current input
      const amount =
        focused === "token"
          ? swapState.baseTokenBalance?.toDec().toString()
          : swapState.baseTokenBalance
              ?.toDec()
              .mul(swapState.priceState.price)
              .toString();
      return setAmountSafe(focused, amount);
    }, [
      tab,
      setAmountSafe,
      swapState.baseTokenBalance,
      swapState.quoteTokenBalance,
      focused,
      swapState.priceState.price,
    ]);

    const inputValue = useMemo(
      () =>
        focused === "fiat"
          ? type === "market" && tab === "sell"
            ? trimPlaceholderZeros((expectedOutput ?? new Dec(0)).toString())
            : fiatAmount
          : type === "market" && tab === "buy"
          ? trimPlaceholderZeros((expectedOutput ?? new Dec(0)).toString())
          : tokenAmount,
      [expectedOutput, fiatAmount, focused, tab, tokenAmount, type]
    );

    const buttonText = useMemo(() => {
      return orderDirection === "bid"
        ? t("portfolio.buy")
        : t("limitOrders.sell");
    }, [orderDirection, t]);

    const isButtonDisabled = useMemo(() => {
      if (swapState.insufficientFunds) {
        return true;
      }

      if (swapState.isMarket) {
        return (
          swapState.marketState.inAmountInput.isEmpty ||
          swapState.marketState.inAmountInput.amount?.toDec().isZero() ||
          isMarketLoading ||
          Boolean(swapState.marketState.error)
        );
      }
      return Boolean(swapState.error) || !swapState.isBalancesFetched;
    }, [
      swapState.error,
      swapState.isBalancesFetched,
      swapState.isMarket,
      swapState.marketState.inAmountInput.amount,
      swapState.marketState.inAmountInput.isEmpty,
      isMarketLoading,
      swapState.insufficientFunds,
      swapState.marketState.error,
    ]);

    const isButtonLoading = useMemo(() => {
      return !swapState.isBalancesFetched;
    }, [swapState.isBalancesFetched]);

    const errorDisplay = useMemo(() => {
      if (swapState.error && !NON_DISPLAY_ERRORS.includes(swapState.error)) {
        if (swapState.error === "errors.generic") {
          return t("errors.uhOhSomethingWentWrong");
        }

        if (swapState.error === "limitOrders.belowMinimumAmount") {
          return t("limitOrders.belowMinimumAmount", {
            amount: formatFiatPrice(
              new PricePretty(DEFAULT_VS_CURRENCY, MIN_ORDER_VALUE)
            ),
          });
        }
        return t(swapState.error);
      }
    }, [swapState.error, t]);
    return (
      <>
        <div>
          <AssetFieldset>
            <AssetFieldsetHeader>
              <AssetFieldsetHeaderLabel>
                <span
                  className={classNames("body2 sm:caption text-osmoverse-300", {
                    "text-rust-400": errorDisplay,
                  })}
                >
                  {errorDisplay ? (
                    errorDisplay
                  ) : (
                    <>
                      {t("limitOrders.enterAnAmountTo")}{" "}
                      <span className="sm:hidden">
                        {orderDirection === "bid"
                          ? t("limitOrders.toBuy").toLowerCase()
                          : t("limitOrders.toSell").toLowerCase()}
                      </span>
                    </>
                  )}
                </span>
              </AssetFieldsetHeaderLabel>
              <AssetFieldsetHeaderBalance
                availableBalance={
                  tab === "buy"
                    ? swapState.quoteAsset?.usdValue &&
                      formatFiatPrice(swapState.quoteAsset?.usdValue)
                    : swapState.baseTokenBalance &&
                      formatPretty(swapState.baseTokenBalance.toDec(), {
                        minimumSignificantDigits: 6,
                        maximumSignificantDigits: 6,
                        maxDecimals: 10,
                        notation: "standard",
                      })
                }
                onMax={toggleMax}
                openAddFundsModal={openAddFundsModal}
                showAddFundsButton={!hasFunds}
              />
            </AssetFieldsetHeader>
            <div className="flex items-center justify-between py-3 ">
              <AssetFieldsetInput
                page={page}
                inputPrefix={
                  focused === "fiat" && (
                    <span
                      className={classNames({
                        "text-osmoverse-600": inputValue === "",
                      })}
                    >
                      $
                    </span>
                  )
                }
                ref={inputRef}
                inputValue={inputValue}
                onInputChange={(e) => setAmountSafe(focused, e.target.value)}
                data-testid={`trade-input-${type}`}
              />
              <AssetFieldsetTokenSelector
                page={page}
                onSelect={setBase}
                selectableAssets={selectableBaseAssets}
                orderDirection={orderDirection}
                selectedCoinDenom={swapState.baseAsset?.coinDenom}
                selectedCoinImageUrl={swapState.baseAsset?.coinImageUrl}
                fetchNextPageAssets={swapState.marketState.fetchNextPageAssets}
                hasNextPageAssets={swapState.marketState.hasNextPageAssets}
                isFetchingNextPageAssets={
                  swapState.marketState.isFetchingNextPageAssets
                }
                isLoadingSelectAssets={
                  swapState.marketState.isLoadingSelectAssets
                }
                data-testid="token-in"
                setAssetQueryInput={swapState.marketState.setAssetsQueryInput}
                assetQueryInput={swapState.marketState.assetsQueryInput}
              />
            </div>
            <AssetFieldsetFooter>
              <button
                type="button"
                className="inline-flex min-h-[2rem] flex-1 items-center gap-2 text-start disabled:pointer-events-none disabled:cursor-default"
                disabled={type === "market"}
                onClick={() => {
                  setFocused((p) => (p === "fiat" ? "token" : "fiat"));
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                {type === "limit" && (
                  <Icon
                    id="switch"
                    width={16}
                    height={16}
                    className="text-wosmongton-300"
                  />
                )}
                <span
                  className={classNames(
                    "body2 sm:caption transition-opacity sm:my-px sm:py-2",
                    {
                      "text-osmoverse-300": type === "market",
                      "text-wosmongton-300": type === "limit",
                    }
                  )}
                >
                  {focused === "token" && <span>$</span>}
                  {trimPlaceholderZeros(
                    (
                      (type === "limit"
                        ? focused === "fiat"
                          ? swapState.inAmountInput.amount?.hideDenom(true)
                          : +fiatAmount
                        : swapState.marketState.quote?.amount.hideDenom(
                            true
                          )) ?? new Dec(0)
                    ).toString()
                  )}{" "}
                  {focused === "fiat" && (
                    <span>{swapState.baseAsset?.coinDenom}</span>
                  )}{" "}
                  {type === "market" &&
                    swapState.marketState.quote?.priceImpactTokenOut && (
                      <span className="text-osmoverse-500">
                        &#40;-
                        {formatPretty(
                          swapState.marketState.quote?.priceImpactTokenOut
                        )}
                        &#41;
                      </span>
                    )}
                </span>
              </button>
              <PriceSelector
                initialBaseDenom={initialBaseDenom}
                initialQuoteDenom={initialQuoteDenom}
              />
            </AssetFieldsetFooter>
          </AssetFieldset>
          {type === "limit" && (
            <LimitPriceSelector
              swapState={swapState}
              orderDirection={orderDirection}
            />
          )}
          <div className="flex w-full flex-col py-3">
            {!account?.isWalletConnected ? (
              <Button
                onClick={() =>
                  onOpenWalletSelect({
                    walletOptions: [
                      {
                        walletType: "cosmos",
                        chainId: accountStore.osmosisChainId,
                      },
                    ],
                  })
                }
              >
                <h6>{t("connectWallet")}</h6>
              </Button>
            ) : (
              <Button
                disabled={isButtonDisabled || !hasFunds}
                isLoading={isButtonLoading}
                loadingText={<h6>{t("assets.transfer.loading")}</h6>}
                onClick={() => setReviewOpen(true)}
                data-testid={`trade-button-${tab}-${type}`}
              >
                <h6>{buttonText}</h6>
              </Button>
            )}
          </div>
          <TradeDetails
            swapState={swapState.marketState}
            type={type}
            makerFee={swapState.makerFee}
            treatAsStable={tab === "buy" ? "in" : "out"}
            tab={tab as "buy" | "sell"}
            priceOverride={
              type === "limit"
                ? new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    swapState.priceState.spotPrice
                  )
                : undefined
            }
          />
        </div>
        <ReviewOrder
          title={t("limitOrders.reviewTrade")}
          page={page}
          confirmAction={async () => {
            setIsSendingTx(true);
            await swapState.placeLimit();
            swapState.reset();
            setAmountSafe("fiat", "");
            setReviewOpen(false);
            setIsSendingTx(false);
            onOrderSuccess?.(
              swapState.baseAsset?.coinDenom,
              swapState.quoteAsset?.coinDenom
            );
          }}
          outAmountLessSlippage={outAmountLessSlippage}
          outFiatAmountLessSlippage={outFiatAmountLessSlippage}
          isConfirmationDisabled={isSendingTx}
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          expectedOutput={swapState.expectedTokenAmountOut}
          expectedOutputFiat={swapState.expectedFiatAmountOut}
          percentAdjusted={swapState.priceState.percentAdjusted}
          limitPriceFiat={swapState.priceState.priceFiat}
          baseDenom={swapState.baseAsset?.coinDenom}
          slippageConfig={slippageConfig}
          gasAmount={swapState.gas.gasAmountFiat}
          isGasLoading={swapState.gas.isLoading}
          gasError={swapState.gas.error}
          limitSetPriceLock={swapState.priceState.setPriceLock}
          inAmountToken={swapState.paymentTokenValue}
          inAmountFiat={swapState.paymentFiatValue}
          fromAsset={swapState.marketState.fromAsset}
          toAsset={swapState.marketState.toAsset}
          isBeyondOppositePrice={swapState.priceState.isBeyondOppositePrice}
        />
        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onRequestClose={closeAddFundsModal}
          /** This modal is set to "swap" mode even on sell mode
           *  as we need the same functionality on both the sell tab
           *  and the swap tab, but not on the buy tab.
           */
          from={tab === "swap" || tab === "sell" ? "swap" : "buy"}
          fromAsset={swapState.baseAsset}
          setFromAssetDenom={(e) => set({ from: e })}
          setToAssetDenom={(e) => set({ to: e })}
        />
      </>
    );
  }
);
