import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { parseAsString, useQueryStates } from "nuqs";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { TokenSelectLimit } from "~/components/control/token-select-limit";
import { LimitInput } from "~/components/input/limit-input";
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect } from "~/hooks";
import { OrderDirection } from "~/hooks/limit-orders";
import {
  useOrderbook,
  useOrderbookSelectableDenoms,
  useOrderbookSpotPrice,
} from "~/hooks/limit-orders/use-orderbook";
import { useSwap } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export interface PlaceMarketToolProps {
  orderDirection: OrderDirection;
}

export const PlaceMarketTool: FunctionComponent<PlaceMarketToolProps> =
  observer(() => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const { selectableBaseAssets, isLoading: orderbookAssetsLoading } =
      useOrderbookSelectableDenoms();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const [{ base, quote, tab }, set] = useQueryStates({
      base: parseAsString.withDefault("OSMO"),
      quote: parseAsString.withDefault("USDC"),
      tab: parseAsString,
    });

    const { contractAddress, poolId } = useOrderbook({
      baseDenom: base,
      quoteDenom: quote,
    });

    const setBase = useCallback((base: string) => set({ base }), [set]);

    const orderDirection = useMemo(
      () => (tab === "buy" ? OrderDirection.Bid : OrderDirection.Ask),
      [tab]
    );

    const { spotPrice, isLoading: isSpotPriceLoading } = useOrderbookSpotPrice({
      orderbookAddress: contractAddress,
      quoteAssetDenom: orderDirection === OrderDirection.Bid ? quote : base,
      baseAssetDenom: orderDirection === OrderDirection.Bid ? base : quote,
    });

    const { onOpenWalletSelect } = useWalletSelect();

    const swapState = useSwap({
      initialFromDenom: base,
      initialToDenom: quote,
      useQueryParams: false,
      useOtherCurrencies: false,
      forceSwapInPoolId: poolId,
      maxSlippage: new Dec(0.01),
    });

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    // const isSwapToolLoading = false;
    const hasFunds = true;

    return (
      <>
        <div className="flex flex-col gap-3">
          {swapState.fromAsset && swapState.toAsset && (
            <TokenSelectLimit
              selectableAssets={selectableBaseAssets}
              baseAsset={swapState.fromAsset}
              quoteAsset={swapState.toAsset}
              baseBalance={swapState.inAmountInput.balance}
              quoteBalance={undefined}
              onTokenSelect={setBase}
              disabled={false}
              orderDirection={orderDirection}
            />
          )}
          <div className="relative flex flex-col rounded-2xl bg-osmoverse-1000">
            <p className="body2 p-4 text-center font-light text-osmoverse-400">
              Enter an amount to{" "}
              {orderDirection === OrderDirection.Bid ? "buy" : "sell"}
            </p>
            <LimitInput
              onChange={swapState.inAmountInput.setAmount}
              baseAsset={swapState.inAmountInput.balance!}
              tokenAmount={swapState.inAmountInput.inputAmount}
              price={spotPrice}
            />
          </div>
          <div className="inline-flex items-center gap-1 py-3.5">
            <span className="body2 text-osmoverse-300">
              {base} price ≈ {formatPretty(spotPrice ?? new Dec(0))} {quote}
            </span>
          </div>
          {/* <LimitTradeDetails swapState={swapState} /> */}
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
                    !swapState.inAmountInput.inputAmount ||
                    swapState.inAmountInput.inputAmount === "0"
                  }
                  isLoading={orderbookAssetsLoading || isSpotPriceLoading}
                  loadingText={"Loading..."}
                  onClick={() => swapState.sendTradeTokenInTx()}
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
        {/* <ReviewLimitOrderModal
          placeLimitState={swapState}
          orderDirection={orderDirection}
          isOpen={reviewOpen}
          makerFee={swapState.makerFee}
          onRequestClose={() => setReviewOpen(false)}
          orderType="limit"
        /> */}
      </>
    );
  });
