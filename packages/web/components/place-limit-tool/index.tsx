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
import { usePlaceLimit } from "~/hooks/limit-orders";
import { AddFundsModal } from "~/modals/add-funds";
import { ReviewOrder } from "~/modals/review-order";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { countDecimals, trimPlaceholderZeros } from "~/utils/number";

export interface PlaceLimitToolProps {
  page: EventPage;
}

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
    ? parseFloat(updatedValue).toFixed(decimalCount).toString()
    : updatedValue;
};

export const PlaceLimitTool: FunctionComponent<PlaceLimitToolProps> = observer(
  ({ page }: PlaceLimitToolProps) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    // const fromAssetsPage = useMemo(() => page === "Token Info Page", [page]);

    const [{ from, quote, tab, type }, set] = useQueryStates({
      from: parseAsString.withDefault("ATOM"),
      quote: parseAsString.withDefault("USDC"),
      type: parseAsStringLiteral(TRADE_TYPES).withDefault("market"),
      tab: parseAsString,
      to: parseAsString,
    });
    const [isSendingTx, setIsSendingTx] = useState(false);

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

    const buttonText = useMemo(() => {
      if (swapState.error) {
        return t(swapState.error);
      } else {
        return orderDirection === "bid"
          ? t("portfolio.buy")
          : t("limitOrders.sell");
      }
    }, [orderDirection, swapState.error, t]);

    // const price = useMemo(
    //   () =>
    //     type === "market"
    //       ? orderDirection === "bid"
    //         ? swapState.priceState.askSpotPrice!
    //         : swapState.priceState.bidSpotPrice!
    //       : swapState.priceState.price,
    //   [
    //     orderDirection,
    //     swapState.priceState.askSpotPrice,
    //     swapState.priceState.bidSpotPrice,
    //     swapState.priceState.price,
    //     type,
    //   ]
    // );

    const tokenAmount = useMemo(
      () => swapState.inAmountInput.inputAmount,
      [swapState.inAmountInput.inputAmount]
    );

    const isMarketLoading = useMemo(() => {
      return (
        swapState.isMarket &&
        (swapState.marketState.isQuoteLoading ||
          Boolean(swapState.marketState.isLoadingNetworkFee) ||
          swapState.marketState.inAmountInput.isTyping) &&
        !Boolean(swapState.marketState.error)
      );
    }, [
      swapState.isMarket,
      swapState.marketState.isLoadingNetworkFee,
      swapState.marketState.isQuoteLoading,
      swapState.marketState.inAmountInput.isTyping,
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

    const [focused, setFocused] = useState<"fiat" | "token">(
      tab === "buy" ? "fiat" : "token"
    );

    const [fiatAmount, setFiatAmount] = useState<string>("");

    const setAmountSafe = useCallback(
      (amountType: "fiat" | "token", value?: string) => {
        const update =
          amountType === "fiat"
            ? setFiatAmount
            : swapState.inAmountInput.setAmount;
        const setMarketAmount = swapState.marketState.inAmountInput.setAmount;

        if (!value?.trim()) {
          if (amountType === "fiat") {
            setMarketAmount("");
          }
          return update("");
        }

        const updatedValue = transformAmount(
          value,
          amountType === "fiat" ? 6 : swapState.baseAsset?.coinDecimals
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

    // useEffect(() => {
    //   if (tokenAmount.length === 0 && focused === "fiat") {
    //     setAmountSafe("fiat", "");
    //     if (tab === "buy") {
    //       swapState.marketState.inAmountInput.setAmount("");
    //     }
    //   }

    //   if (focused !== "token" || !price) return;

    //   const value = tokenAmount.length > 0 ? new Dec(tokenAmount) : undefined;
    //   const fiatValue = value ? price.mul(value) : undefined;

    //   setAmountSafe("fiat", fiatValue ? fiatValue.toString() : undefined);
    // }, [
    //   focused,
    //   price,
    //   setAmountSafe,
    //   tokenAmount,
    //   swapState.marketState.inAmountInput,
    //   tab,
    // ]);

    // useEffect(() => {
    //   if (focused !== "fiat" || !price) return;

    //   const value =
    //     fiatAmount && fiatAmount.length > 0 ? fiatAmount : undefined;
    //   const tokenValue = value ? new Dec(value).quo(price) : undefined;
    //   setAmountSafe("token", tokenValue ? tokenValue.toString() : undefined);
    // }, [price, fiatAmount, setAmountSafe, focused]);

    const expectedOutput = useMemo(
      () => swapState.marketState.quote?.amount.toDec(),
      [swapState.marketState.quote?.amount]
    );

    const toggleMax = useCallback(() => {
      if (tab === "buy") {
        return setAmountSafe(
          "fiat",
          swapState.quoteTokenBalance?.toDec().toString() ?? ""
        );
      }

      return setAmountSafe(
        "token",
        swapState.baseTokenBalance?.toDec().toString() ?? ""
      );
    }, [
      tab,
      setAmountSafe,
      swapState.baseTokenBalance,
      swapState.quoteTokenBalance,
    ]);

    return (
      <>
        <div className="flex flex-col">
          <AssetFieldset>
            <AssetFieldsetHeader>
              <AssetFieldsetHeaderLabel>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.enterAnAmountTo")}{" "}
                  {orderDirection === "bid"
                    ? t("portfolio.buy").toLowerCase()
                    : t("limitOrders.sell").toLowerCase()}
                </span>
              </AssetFieldsetHeaderLabel>
              <AssetFieldsetHeaderBalance
                className={classNames({ "opacity-0": !hasFunds })}
                availableBalance={
                  tab === "buy"
                    ? swapState.quoteAsset?.usdValue &&
                      formatPretty(swapState.quoteAsset?.usdValue)
                    : swapState.baseTokenBalance &&
                      formatPretty(swapState.baseTokenBalance)
                }
                onMax={toggleMax}
              />
            </AssetFieldsetHeader>
            <div className="flex items-center justify-between py-3">
              <AssetFieldsetInput
                inputPrefix={focused === "fiat" && <h3>$</h3>}
                inputValue={
                  focused === "fiat"
                    ? type === "market" && tab === "sell"
                      ? trimPlaceholderZeros(
                          (expectedOutput ?? new Dec(0)).toString()
                        )
                      : fiatAmount
                    : type === "market" && tab === "buy"
                    ? trimPlaceholderZeros(
                        (expectedOutput ?? new Dec(0)).toString()
                      )
                    : tokenAmount
                }
                onInputChange={(e) => setAmountSafe(focused, e.target.value)}
              />
              <AssetFieldsetTokenSelector
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
              />
            </div>
            <AssetFieldsetFooter>
              <button
                type="button"
                className="inline-flex items-center gap-2 disabled:pointer-events-none disabled:cursor-default"
                disabled={type === "market"}
                onClick={() => {
                  setFocused((p) => (p === "fiat" ? "token" : "fiat"));
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
                  className={classNames("body2 h-5 transition-opacity", {
                    "text-osmoverse-300": type === "market",
                    "text-wosmongton-300": type === "limit",
                  })}
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
              <PriceSelector />
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
            ) : hasFunds ? (
              <Button
                disabled={
                  Boolean(swapState.error) ||
                  isMarketLoading ||
                  (swapState.isMarket &&
                    (swapState.marketState.inAmountInput.isEmpty ||
                      swapState.marketState.inAmountInput.amount
                        ?.toDec()
                        .isZero())) ||
                  !swapState.isBalancesFetched ||
                  swapState.isMakerFeeLoading
                }
                isLoading={
                  !swapState.isBalancesFetched ||
                  (!swapState.isMarket && swapState.isMakerFeeLoading) ||
                  isMarketLoading
                }
                loadingText={<h6>{t("assets.transfer.loading")}</h6>}
                onClick={() => setReviewOpen(true)}
              >
                <h6>{buttonText}</h6>
              </Button>
            ) : (
              <Button onClick={openAddFundsModal}>
                <h6>{t("limitOrders.addFunds")}</h6>
              </Button>
            )}
          </div>
          <TradeDetails
            swapState={swapState.marketState}
            type={type}
            isMakerFeeLoading={swapState.isMakerFeeLoading}
            makerFee={swapState.makerFee}
            // inDenom={swapState.baseAsset?.coinDenom}
            // inPrice={
            //   new PricePretty(
            //     DEFAULT_VS_CURRENCY,
            //     swapState.priceState.spotPrice
            //   )
            // }
          />
        </div>
        <ReviewOrder
          title="Review trade"
          confirmAction={async () => {
            setIsSendingTx(true);
            await swapState.placeLimit();
            swapState.reset();
            setReviewOpen(false);
            setIsSendingTx(false);
          }}
          outAmountLessSlippage={outAmountLessSlippage}
          outFiatAmountLessSlippage={outFiatAmountLessSlippage}
          isConfirmationDisabled={isSendingTx}
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          swapState={swapState.marketState}
          orderType={type}
          percentAdjusted={swapState.priceState.percentAdjusted}
          limitPriceFiat={swapState.priceState.priceFiat}
          baseDenom={swapState.baseAsset?.coinDenom}
          slippageConfig={slippageConfig}
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

// function SwapArrows() {
//   return (
//     <div className="ml-1 flex h-12 w-14 items-center">
//       <Icon
//         id="arrow-right"
//         className="h-full w-auto rotate-90 text-wosmongton-200"
//         width={16}
//         height={24}
//       />
//       <Icon
//         id="arrow-right"
//         className="-ml-1 h-full w-auto -rotate-90 text-wosmongton-200"
//         width={16}
//         height={24}
//       />
//     </div>
//   );
// }
