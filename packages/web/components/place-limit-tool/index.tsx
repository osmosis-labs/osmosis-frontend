import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
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

import { TokenSelectLimit } from "~/components/control/token-select-limit";
import { LimitInput } from "~/components/input/limit-input";
import { LimitPriceSelector } from "~/components/place-limit-tool/limit-price-selector";
import { LimitTradeDetails } from "~/components/place-limit-tool/limit-trade-details";
import { TRADE_TYPES } from "~/components/swap-tool/order-type-selector";
import { TradeDetails } from "~/components/swap-tool/trade-details";
import { Button } from "~/components/ui/button";
import { EventPage } from "~/config";
import { useDisclosure, useTranslation, useWalletSelect } from "~/hooks";
import { usePlaceLimit } from "~/hooks/limit-orders";
import { AddFundsModal } from "~/modals/add-funds";
import { ReviewLimitOrderModal } from "~/modals/review-limit-order";
import { useStore } from "~/stores";

export interface PlaceLimitToolProps {
  page: EventPage;
}

const WHALE_MESSAGE_THRESHOLD = 100;

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
    const fromAssetsPage = useMemo(() => page === "Token Info Page", [page]);
    const [{ from, quote, tab, type }, set] = useQueryStates({
      from: parseAsString.withDefault("ATOM"),
      quote: parseAsString.withDefault("USDC"),
      type: parseAsStringLiteral(TRADE_TYPES).withDefault("market"),
      tab: parseAsString,
      to: parseAsString,
    });

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

    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      orderDirection,
      useQueryParams: false,
      baseDenom: from,
      quoteDenom: quote,
      type,
      page,
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

    const getInputWidgetLabel = () => {
      switch (true) {
        case swapState.insufficientFunds:
          return t("limitOrders.insufficientFunds");
        case +swapState.inAmountInput.inputAmount > WHALE_MESSAGE_THRESHOLD:
          return t("limitOrders.watchOut");
        default:
          return (
            <>
              {t("limitOrders.enterAnAmountTo")}{" "}
              {orderDirection === "bid"
                ? t("portfolio.buy").toLowerCase()
                : t("limitOrders.sell").toLowerCase()}
            </>
          );
      }
    };

    const buttonText = useMemo(() => {
      if (swapState.error) {
        return t(swapState.error);
      } else {
        return orderDirection === "bid"
          ? t("portfolio.buy")
          : t("limitOrders.sell");
      }
    }, [orderDirection, swapState.error, t]);

    const isMarketLoading = useMemo(() => {
      return (
        swapState.isMarket &&
        (swapState.marketState.isQuoteLoading ||
          Boolean(swapState.marketState.isLoadingNetworkFee)) &&
        !Boolean(swapState.marketState.error)
      );
    }, [
      swapState.isMarket,
      swapState.marketState.isLoadingNetworkFee,
      swapState.marketState.isQuoteLoading,
      swapState.marketState.error,
    ]);

    const selectableBaseAssets = useMemo(() => {
      return swapState.marketState.selectableAssets.filter(
        (asset) => asset.coinDenom !== swapState.quoteAsset!.coinDenom
      );
    }, [swapState.marketState.selectableAssets, swapState.quoteAsset]);
    return (
      <>
        <div className="flex flex-col gap-3">
          <div
            className={classNames("flex gap-3", {
              "flex-col": !fromAssetsPage,
              "flex-col-reverse": fromAssetsPage,
            })}
          >
            <TokenSelectLimit
              selectableAssets={selectableBaseAssets}
              baseAsset={swapState.baseAsset!}
              quoteAsset={swapState.quoteAsset!}
              baseBalance={swapState.baseTokenBalance!}
              quoteBalance={swapState.quoteTokenBalance!}
              onTokenSelect={setBase}
              disabled={false}
              orderDirection={orderDirection}
            />
            {type === "limit" && (
              <LimitPriceSelector
                swapState={swapState}
                orderDirection={orderDirection}
              />
            )}
            <div className="relative flex flex-col rounded-2xl bg-osmoverse-1000">
              <p
                className={classNames(
                  "body2 p-4 text-center text-osmoverse-400",
                  { "text-rust-300": swapState.insufficientFunds }
                )}
              >
                {getInputWidgetLabel()}
              </p>
              <LimitInput
                onChange={swapState.inAmountInput.setAmount}
                baseAsset={swapState.baseAsset!}
                tokenAmount={swapState.inAmountInput.inputAmount}
                price={
                  type === "market"
                    ? orderDirection === "bid"
                      ? swapState.priceState.askSpotPrice!
                      : swapState.priceState.bidSpotPrice!
                    : swapState.priceState.price
                }
                disableSwitching={type === "market"}
                setMarketAmount={swapState.marketState.inAmountInput.setAmount}
                quoteAssetPrice={swapState.quoteAssetPrice.toDec()}
                expectedOutput={swapState.marketState.quote?.amount.toDec()}
                expectedOutputLoading={
                  swapState.marketState.inAmountInput.isTyping ||
                  swapState.marketState.isQuoteLoading ||
                  !!swapState.marketState.isLoadingNetworkFee
                }
                quoteBalance={swapState.quoteTokenBalance?.toDec()}
                baseBalance={swapState.baseTokenBalance?.toDec()}
                insufficientFunds={swapState.insufficientFunds}
              />
            </div>
          </div>
          <div
            className={classNames("flex gap-3", {
              "flex-col": !fromAssetsPage,
              "flex-col-reverse": fromAssetsPage,
            })}
          >
            <>
              {!swapState.isMarket && (
                <LimitTradeDetails swapState={swapState} />
              )}
              {swapState.isMarket && (
                <TradeDetails
                  swapState={swapState.marketState}
                  inDenom={swapState.baseAsset?.coinDenom}
                  inPrice={
                    new PricePretty(
                      DEFAULT_VS_CURRENCY,
                      swapState.priceState.spotPrice
                    )
                  }
                />
              )}
            </>
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
                <h6 className="">{t("connectWallet")}</h6>
              </Button>
            ) : (
              <>
                {hasFunds ? (
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
              </>
            )}
          </div>
        </div>
        <ReviewLimitOrderModal
          placeLimitState={swapState}
          orderDirection={orderDirection}
          isOpen={reviewOpen}
          makerFee={swapState.makerFee}
          onRequestClose={() => setReviewOpen(false)}
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
