import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { QuoteDirection } from "@osmosis-labs/tx";
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
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { Button } from "~/components/ui/button";
import { EventPage } from "~/config";
import { DefaultSlippage } from "~/config/swap";
import {
  useDisclosure,
  useFeatureFlags,
  useSlippageConfig,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { MIN_ORDER_VALUE, usePlaceLimit } from "~/hooks/limit-orders";
import { mulPrice } from "~/hooks/queries/assets/use-coin-fiat-value";
import {
  useAmountWithSlippage,
  useDynamicSlippageConfig,
} from "~/hooks/use-swap";
import { AddFundsModal } from "~/modals/add-funds";
import { ReviewOrder } from "~/modals/review-order";
import { useStore } from "~/stores";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";
import { countDecimals, trimPlaceholderZeros } from "~/utils/number";

interface PlaceLimitToolProps {
  page: EventPage;
  initialBaseDenom?: string;
  initialQuoteDenom?: string;
  onOrderSuccess?: (baseDenom?: string, quoteDenom?: string) => void;
}

/* Roundes a given number to the given precision
 * i.e. roundUpToDecimal(0.23456, 2) = 0.24
 */
function roundUpToDecimal(value: number, precision: number) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.ceil(value * multiplier) / multiplier;
}

/**
 * Fixes a given string representation of a number to the given decimal count
 * Rounds to the decimal count if rounding is true
 */
const fixDecimalCount = (
  value: string,
  decimalCount = 18,
  rounding = false
) => {
  if (rounding) {
    return roundUpToDecimal(parseFloat(value), decimalCount).toString();
  }
  const split = value.split(".");
  const result =
    split[0] +
    (decimalCount > 0 ? "." + split[1].substring(0, decimalCount) : "");
  return result;
};

/**
 * Transforms a given amount to the given decimal count and handles period inputs
 * Rounds to the decimal count if rounding is true
 */
const transformAmount = (
  value: string,
  decimalCount = 18,
  rounding = false
) => {
  let updatedValue = value;
  if (value.endsWith(".") && value.length === 1) {
    updatedValue = value + "0";
  }

  if (value.startsWith(".")) {
    updatedValue = "0" + value;
  }

  const decimals = countDecimals(updatedValue);
  return decimals > decimalCount
    ? fixDecimalCount(updatedValue, decimalCount, rounding)
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
    const [quoteType, setQuoteType] = useState<QuoteDirection>("out-given-in");
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();
    const inputRef = useRef<HTMLInputElement>(null);
    const featureFlags = useFeatureFlags();

    const [{ from, quote, tab, type }, set] = useQueryStates({
      from: parseAsString.withDefault(initialBaseDenom || "ATOM"),
      quote: parseAsString.withDefault(initialQuoteDenom || "USDC"),
      type: parseAsStringLiteral(TRADE_TYPES).withDefault("market"),
      tab: parseAsString,
      to: parseAsString,
    });
    const [isSendingTx, setIsSendingTx] = useState(false);

    const [focused, setFocused] = useState<"fiat" | "token">(
      !featureFlags.inGivenOut && tab === "sell" ? "token" : "fiat"
    );

    const [fiatAmount, setFiatAmount] = useState<string>("");

    const setBase = useCallback((base: string) => set({ from: base }), [set]);

    useEffect(() => {
      if (from === quote) {
        if (quote === "USDC") {
          set({ quote: "USDT" });
        } else {
          set({ quote: "USDC" });
        }
      }
    }, [from, quote, set]);

    const orderDirection = useMemo(
      () => (tab === "buy" ? "bid" : "ask"),
      [tab]
    );

    const { onOpenWalletSelect } = useWalletSelect();

    const slippageConfig = useSlippageConfig({
      defaultSlippage: quoteType === "in-given-out" ? "0.1" : "0.1",
      selectedIndex: quoteType === "in-given-out" ? 0 : 0,
    });

    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      orderDirection,
      useQueryParams: false,
      baseDenom: from,
      quoteDenom: quote,
      type,
      page,
      maxSlippage: slippageConfig.slippage.toDec(),
      quoteType,
    });

    const resetSlippage = useCallback(() => {
      const defaultSlippage =
        quoteType === "in-given-out" ? DefaultSlippage : DefaultSlippage;
      if (
        slippageConfig.slippage.toDec() ===
        new Dec(defaultSlippage).quo(DecUtils.getTenExponentN(2))
      ) {
        return;
      }
      slippageConfig.select(quoteType === "in-given-out" ? 0 : 0);
      slippageConfig.setDefaultSlippage(defaultSlippage);
    }, [quoteType, slippageConfig]);

    useEffect(() => {
      if (!featureFlags.inGivenOut && quoteType === "in-given-out") {
        setQuoteType("out-given-in");

        setFocused(tab === "buy" ? "fiat" : "token");
      }
    }, [featureFlags.inGivenOut, quoteType, tab]);

    useDynamicSlippageConfig({
      slippageConfig,
      feeError: swapState.marketState.networkFeeError,
      quoteType,
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

    const { amountWithSlippage, fiatAmountWithSlippage } =
      useAmountWithSlippage({
        swapState: swapState.marketState,
        slippageConfig,
        quoteType,
      });

    const setAmountSafe = useCallback(
      (
        amountType: "fiat" | "token",
        value?: string,
        maxDecimals: number = 2,
        rounding: boolean = false
      ) => {
        resetSlippage();
        const update =
          amountType === "fiat"
            ? setFiatAmount
            : swapState.inAmountInput.setAmount;
        const isMarketOutAmount =
          (tab === "sell" && amountType === "fiat") ||
          (tab === "buy" && amountType === "token");
        const setMarketAmount = isMarketOutAmount
          ? swapState.marketState.outAmountInput.setAmount
          : swapState.marketState.inAmountInput.setAmount;
        const setOppositeMarketAmount = isMarketOutAmount
          ? swapState.marketState.inAmountInput.setAmount
          : swapState.marketState.outAmountInput.setAmount;

        setQuoteType(
          !isMarketOutAmount || !featureFlags.inGivenOut
            ? "out-given-in"
            : "in-given-out"
        );

        // If value is empty clear values
        if (!value?.trim()) {
          if (type === "market") {
            setMarketAmount("");
            setOppositeMarketAmount("");
          }
          return update("");
        }

        const updatedValue = transformAmount(
          value,
          amountType === "fiat"
            ? maxDecimals
            : swapState.baseAsset?.coinDecimals,
          rounding
        ).trim();

        if (
          !isValidNumericalRawInput(updatedValue) ||
          updatedValue.length > 26 ||
          (updatedValue.length > 0 && updatedValue.startsWith("-"))
        ) {
          return;
        }

        if (type === "market" || (amountType === "fiat" && tab === "buy")) {
          setMarketAmount(updatedValue);
        }
        const isFocused = focused === amountType;

        const formattedValue = !isFocused
          ? trimPlaceholderZeros(updatedValue)
          : updatedValue;
        update(formattedValue);
      },
      [
        focused,
        swapState.baseAsset?.coinDecimals,
        swapState.inAmountInput,
        swapState.marketState.inAmountInput.setAmount,
        swapState.marketState.outAmountInput.setAmount,
        tab,
        type,
        resetSlippage,
        featureFlags.inGivenOut,
      ]
    );

    // Adjusts the token value when the user updates the fiat value
    useEffect(() => {
      if (
        focused !== "token" ||
        !swapState.priceState.price ||
        type === "market"
      )
        return;

      const value = tokenAmount.length > 0 ? new Dec(tokenAmount) : undefined;
      const fiatValue = value
        ? swapState.priceState.price.mul(value)
        : undefined;

      setAmountSafe("fiat", fiatValue ? fiatValue.toString() : undefined, 10);
    }, [
      focused,
      setAmountSafe,
      swapState.priceState.price,
      tokenAmount,
      swapState.marketState.inAmountInput,
      tab,
      type,
    ]);

    // Adjusts the token value when the user updates the fiat value
    useEffect(() => {
      if (
        focused !== "fiat" ||
        !swapState.priceState.price ||
        type === "market"
      )
        return;

      const value =
        fiatAmount && fiatAmount.length > 0 ? fiatAmount : undefined;
      const tokenValue = value
        ? new Dec(value).quo(swapState.priceState.price)
        : undefined;

      // When setting the token amount for a sell we want to round up due to
      // rounding occuring when dividing the fiat amount by the token price.
      // Without rounding there is a common case where the user inputs $1
      // but the actual token value is only $0.99 (0.999999....) and the
      // user is unable to place the order. With rounding we overestimate by a value of
      // 1*10^(-tokenDecimals).
      setAmountSafe(
        "token",
        tokenValue ? tokenValue.toString() : undefined,
        swapState.baseAsset?.coinDecimals,
        true
      );
    }, [
      fiatAmount,
      setAmountSafe,
      focused,
      swapState.priceState.price,
      type,
      swapState.baseAsset?.coinDecimals,
    ]);

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

    const inputValue = useMemo(() => {
      const shouldTrim = (amount: string) =>
        parseInt(amount) !== 0 && !amount.endsWith(".");
      if (type === "market") {
        if (tab === "sell") {
          return focused === "fiat"
            ? transformAmount(
                swapState.marketState.outAmountInput.inputAmount ?? "",
                2
              )
            : shouldTrim(swapState.marketState.inAmountInput.inputAmount)
            ? trimPlaceholderZeros(
                swapState.marketState.inAmountInput.inputAmount
              )
            : swapState.marketState.inAmountInput.inputAmount ?? "";
        } else {
          return focused === "fiat"
            ? transformAmount(
                swapState.marketState.inAmountInput.inputAmount ?? "",
                2
              )
            : shouldTrim(swapState.marketState.outAmountInput.inputAmount)
            ? trimPlaceholderZeros(
                swapState.marketState.outAmountInput.inputAmount
              )
            : swapState.marketState.outAmountInput.inputAmount ?? "";
        }
      }
      return focused === "fiat"
        ? transformAmount(fiatAmount, 2)
        : shouldTrim(swapState.inAmountInput.inputAmount)
        ? trimPlaceholderZeros(swapState.inAmountInput.inputAmount)
        : swapState.inAmountInput.inputAmount ?? "";
    }, [
      focused,
      tab,
      type,
      swapState.inAmountInput.inputAmount,
      swapState.marketState.inAmountInput.inputAmount,
      swapState.marketState.outAmountInput.inputAmount,
      fiatAmount,
    ]);

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
          Boolean(swapState.marketState.error) ||
          Boolean(swapState.marketState.networkFeeError)
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
      swapState.marketState.networkFeeError,
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

      if (
        swapState.isMarket &&
        !!swapState.marketState.networkFeeError &&
        (swapState.marketState.isSlippageOverBalance ||
          swapState.marketState.networkFeeError.message.includes(
            "insufficient funds"
          ))
      ) {
        return t("swap.slippageOverBalance");
      }
    }, [
      swapState.error,
      swapState.isMarket,
      swapState.marketState.networkFeeError,
      swapState.marketState.isSlippageOverBalance,
      t,
    ]);

    const nonFocusedDisplayAmount = useMemo(() => {
      const formatInputAsPrice = (inputAmount: string | undefined) =>
        formatFiatPrice(
          new PricePretty(DEFAULT_VS_CURRENCY, inputAmount || "0")
        );
      const getTrimmedAmount = (inputAmount: string | undefined) =>
        trimPlaceholderZeros(inputAmount ?? "") ?? "";
      const handleMarketTab = () => {
        if (tab === "sell") {
          return focused === "fiat"
            ? transformAmount(
                getTrimmedAmount(
                  swapState.marketState.inAmountInput.inputAmount
                ),
                10
              )
            : formatInputAsPrice(
                swapState.marketState.outAmountInput.inputAmount
              );
        } else {
          return focused === "fiat"
            ? transformAmount(
                getTrimmedAmount(
                  swapState.marketState.outAmountInput.inputAmount
                ),
                10
              )
            : formatInputAsPrice(
                swapState.marketState.inAmountInput.inputAmount
              );
        }
      };

      if (type === "market") {
        return handleMarketTab();
      } else {
        return focused === "fiat"
          ? transformAmount(swapState.inAmountInput.inputAmount, 10)
          : formatInputAsPrice(fiatAmount);
      }
    }, [
      focused,
      swapState.marketState.inAmountInput.inputAmount,
      swapState.marketState.outAmountInput.inputAmount,
      type,
      tab,
      fiatAmount,
      swapState.inAmountInput.inputAmount,
    ]);

    const isInputLessThanOneCent = useMemo(() => {
      if (focused !== "fiat") return false;

      let inputValueRaw = "0";
      if (tab === "buy" && type === "market") {
        inputValueRaw = swapState.marketState.inAmountInput.inputAmount;
      } else if (tab === "sell" && type === "market") {
        inputValueRaw = swapState.marketState.outAmountInput.inputAmount;
      } else {
        inputValueRaw = fiatAmount;
      }

      const valueDec = new Dec(inputValueRaw || "0");

      return !valueDec.isZero() && valueDec.lt(new Dec(0.01));
    }, [
      tab,
      type,
      swapState.marketState.inAmountInput.inputAmount,
      swapState.marketState.outAmountInput.inputAmount,
      fiatAmount,
      focused,
    ]);

    const { tokenBalance, fiatBalance } = useMemo(() => {
      if (tab === "buy") {
        const fiatBalance = mulPrice(
          swapState.quoteTokenBalance,
          swapState.quoteAssetPrice,
          DEFAULT_VS_CURRENCY
        );
        return { tokenBalance: swapState.quoteTokenBalance, fiatBalance };
      } else if (tab === "sell") {
        const fiatBalance = mulPrice(
          swapState.baseTokenBalance,
          swapState.baseAssetPrice,
          DEFAULT_VS_CURRENCY
        );
        return { tokenBalance: swapState.baseTokenBalance, fiatBalance };
      }

      return {
        tokenBalance: undefined,
        fiatBalance: undefined,
      };
    }, [
      tab,
      swapState.quoteTokenBalance,
      swapState.quoteAssetPrice,
      swapState.baseTokenBalance,
      swapState.baseAssetPrice,
    ]);

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
                  focused === "fiat" || tab === "buy"
                    ? formatFiatPrice(
                        fiatBalance ?? new PricePretty(DEFAULT_VS_CURRENCY, "0")
                      )
                    : formatPretty(tokenBalance ?? new Dec(0), {
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
                      {isInputLessThanOneCent && "<"}$
                    </span>
                  )
                }
                ref={inputRef}
                inputValue={
                  isInputLessThanOneCent && focused === "fiat"
                    ? "0.01"
                    : inputValue
                }
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
                onClick={() => {
                  setFocused((p) => (p === "fiat" ? "token" : "fiat"));
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                disabled={!featureFlags.inGivenOut && type === "market"}
              >
                {(featureFlags.inGivenOut || type === "limit") && (
                  <Icon
                    id="switch"
                    width={16}
                    height={16}
                    className="text-wosmongton-300"
                  />
                )}
                <span className="body2 sm:caption flex text-wosmongton-300 transition-opacity sm:my-px sm:py-2">
                  {nonFocusedDisplayAmount || "0"}{" "}
                  {focused === "fiat" && (
                    <span className="ml-1">
                      {swapState.baseAsset?.coinDenom}
                    </span>
                  )}{" "}
                  {type === "market" &&
                    swapState.marketState.quote?.priceImpactTokenOut && (
                      <GenericDisclaimer
                        title={t("tradeDetails.outputDifference.header")}
                        body={t("tradeDetails.outputDifference.content")}
                        disabled={swapState.marketState.quote?.priceImpactTokenOut
                          .toDec()
                          .lt(new Dec(0.01))}
                        childWrapperClassName={classNames(
                          "ml-1 text-osmoverse-500 !cursor-pointer !pointer-events-auto",
                          {
                            hidden:
                              swapState.marketState.quote?.priceImpactTokenOut
                                .toDec()
                                .lt(new Dec(0.01)),
                          }
                        )}
                        tooltipClassName="!cursor-pointer"
                      >
                        &#40;-
                        {formatPretty(
                          swapState.marketState.quote?.priceImpactTokenOut
                        )}
                        &#41;
                      </GenericDisclaimer>
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
            resetSlippage();
          }}
          amountWithSlippage={amountWithSlippage}
          fiatAmountWithSlippage={fiatAmountWithSlippage}
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
          quoteType={swapState.marketState.quoteType}
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
