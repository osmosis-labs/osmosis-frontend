import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { TokenSelectLimit } from "~/components/control/token-select-limit";
import { LimitInput } from "~/components/input/limit-input";
import { LimitPriceSelector } from "~/components/place-limit-tool/limit-price-selector";
import { LimitTradeDetails } from "~/components/place-limit-tool/limit-trade-details";
import { TRADE_TYPES } from "~/components/swap-tool/order-type-selector";
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect } from "~/hooks";
import { OrderDirection, usePlaceLimit } from "~/hooks/limit-orders";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { ReviewLimitOrderModal } from "~/modals/review-limit-order";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export interface PlaceLimitToolProps {
  orderDirection: OrderDirection;
}

export const PlaceLimitTool: FunctionComponent<PlaceLimitToolProps> = observer(
  () => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const { selectableBaseAssets, isLoading: orderbookAssetsLoading } =
      useOrderbookSelectableDenoms();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const [{ base, quote, tab, type }, set] = useQueryStates({
      base: parseAsString.withDefault("OSMO"),
      quote: parseAsString.withDefault("USDC"),
      type: parseAsStringLiteral(TRADE_TYPES).withDefault("market"),
      tab: parseAsString,
    });

    const setBase = useCallback((base: string) => set({ base }), [set]);

    const orderDirection = useMemo(
      () => (tab === "buy" ? OrderDirection.Bid : OrderDirection.Ask),
      [tab]
    );

    const { onOpenWalletSelect } = useWalletSelect();

    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      orderDirection,
      useQueryParams: false,
      baseDenom: base,
      quoteDenom: quote,
    });

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    // const isSwapToolLoading = false;
    const hasFunds = true;

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
            <p className="body2 p-4 text-center font-light text-osmoverse-400">
              Enter an amount to{" "}
              {orderDirection === OrderDirection.Bid ? "buy" : "sell"}
            </p>
            <LimitInput
              onChange={swapState.inAmountInput.setAmount}
              baseAsset={swapState.inAmountInput.balance!}
              tokenAmount={swapState.inAmountInput.inputAmount}
              price={swapState.priceState.price}
            />
          </div>
          {type === "limit" ? (
            <LimitPriceSelector
              swapState={swapState}
              orderDirection={orderDirection}
            />
          ) : (
            <div className="inline-flex items-center gap-1 py-3.5">
              <span className="body2 text-osmoverse-300">
                {swapState.baseDenom} price ≈{" "}
                {formatPretty(swapState.priceState.spotPrice ?? new Dec(0))}{" "}
                {swapState.quoteDenom}
              </span>
            </div>
          )}
          <LimitTradeDetails swapState={swapState} />
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
                    swapState.insufficientFunds ||
                    !swapState.inAmountInput.inputAmount ||
                    swapState.inAmountInput.inputAmount === "0" ||
                    (!swapState.priceState.isValidPrice &&
                      swapState.priceState.orderPrice.length > 0)
                  }
                  isLoading={
                    !swapState.isBalancesFetched ||
                    swapState.isMakerFeeLoading ||
                    orderbookAssetsLoading
                  }
                  loadingText={"Loading..."}
                  onClick={() => setReviewOpen(true)}
                >
                  <h6>
                    {orderDirection === OrderDirection.Bid ? "Buy" : "Sell"}
                  </h6>
                </Button>
              ) : (
                <Button onClick={() => setReviewOpen(true)}>
                  <h6>Add funds</h6>
                </Button>
              )}
            </>
          )}
        </div>
        <ReviewLimitOrderModal
          placeLimitState={swapState}
          orderDirection={orderDirection}
          isOpen={reviewOpen}
          makerFee={swapState.makerFee}
          onRequestClose={() => setReviewOpen(false)}
          orderType="limit"
        />
      </>
    );
  }
);
