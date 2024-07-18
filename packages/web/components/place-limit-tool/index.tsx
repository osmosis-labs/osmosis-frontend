import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { TokenSelectLimit } from "~/components/control/token-select-limit";
import { LimitInput } from "~/components/input/limit-input";
import { LimitPriceSelector } from "~/components/place-limit-tool/limit-price-selector";
import { LimitTradeDetails } from "~/components/place-limit-tool/limit-trade-details";
import { TRADE_TYPES } from "~/components/swap-tool/order-type-selector";
import { TradeDetails } from "~/components/swap-tool/trade-details";
import { Button } from "~/components/ui/button";
import { EventPage } from "~/config";
import { useTranslation, useWalletSelect } from "~/hooks";
import { usePlaceLimit } from "~/hooks/limit-orders";
import { useOrderbookAllActiveOrders } from "~/hooks/limit-orders/use-orderbook";
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
    const [{ base, quote, tab, type }, set] = useQueryStates({
      base: parseAsString.withDefault("OSMO"),
      quote: parseAsString.withDefault("USDC"),
      type: parseAsStringLiteral(TRADE_TYPES).withDefault("market"),
      tab: parseAsString,
    });

    const setBase = useCallback((base: string) => set({ base }), [set]);

    const orderDirection = useMemo(
      () => (tab === "buy" ? "bid" : "ask"),
      [tab]
    );

    const { onOpenWalletSelect } = useWalletSelect();

    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      orderDirection,
      useQueryParams: false,
      baseDenom: base,
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
        swapState.priceState.adjustByPercentage(new Dec(0));
      }
    }, [swapState.priceState, type]);

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const { orders } = useOrderbookAllActiveOrders({
      userAddress: account?.address ?? "",
      pageSize: 100,
    });

    const openOrders = useMemo(
      () =>
        orders.filter(
          ({ status }) => status === "open" || status === "partiallyFilled"
        ),
      [orders]
    );

    // const isSwapToolLoading = false;
    const hasFunds = true;

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
    return (
      <>
        <div className="flex flex-col gap-3">
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
                isMarketLoading || swapState.marketState.inAmountInput.isTyping
              }
              quoteBalance={swapState.quoteTokenBalance?.toDec()}
              baseBalance={swapState.baseTokenBalance?.toDec()}
              insufficientFunds={swapState.insufficientFunds}
            />
          </div>
          <>
            {type === "limit" && (
              <LimitPriceSelector
                swapState={swapState}
                orderDirection={orderDirection}
              />
            )}
            {!swapState.isMarket && <LimitTradeDetails swapState={swapState} />}
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
                    (!swapState.isMarket &&
                      swapState.priceState.orderPrice.length > 0) ||
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
                  loadingText={t("assets.transfer.loading")}
                  onClick={() => setReviewOpen(true)}
                >
                  <h6>{buttonText}</h6>
                </Button>
              ) : (
                <Button onClick={() => setReviewOpen(true)}>
                  <h6>{t("limitOrders.addFunds")}</h6>
                </Button>
              )}
            </>
          )}
          {account?.isWalletConnected && openOrders.length > 0 && (
            <Link
              href="/transactions?tab=orders&fromPage=swap"
              className="my-3 flex items-center justify-between rounded-2xl bg-osmoverse-850 py-4 px-5"
            >
              <div className="flex items-center gap-2">
                <Icon
                  id="history-uncolored"
                  width={24}
                  height={24}
                  className="text-osmoverse-500"
                />
                <span className="subtitle1 text-osmoverse-200">
                  {t("limitOrders.openOrders")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-wosmongton-200">{openOrders.length}</span>
                <div className="flex h-6 w-6 items-center justify-center">
                  <Icon
                    id="chevron-right"
                    width={10}
                    height={17}
                    className="text-wosmongton-200"
                  />
                </div>
              </div>
            </Link>
          )}
        </div>
        <ReviewLimitOrderModal
          placeLimitState={swapState}
          orderDirection={orderDirection}
          isOpen={reviewOpen}
          makerFee={swapState.makerFee}
          onRequestClose={() => setReviewOpen(false)}
        />
      </>
    );
  }
);
