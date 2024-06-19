import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
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
import { LimitTradeDetails } from "~/components/place-limit-tool/limit-trade-details";
import { TRADE_TYPES } from "~/components/swap-tool/order-type-selector";
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect } from "~/hooks";
import { OrderDirection, usePlaceLimit } from "~/hooks/limit-orders";
import {
  useOrderbookAllActiveOrders,
  useOrderbookSelectableDenoms,
} from "~/hooks/limit-orders/use-orderbook";
import { ReviewLimitOrderModal } from "~/modals/review-limit-order";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export interface PlaceLimitToolProps {
  orderDirection: OrderDirection;
}

const percentAdjustmentOptions = [
  { value: new Dec(0), label: "0%" },
  { value: new Dec(0.02), label: "2%" },
  { value: new Dec(0.05), label: "5%" },
  { value: new Dec(0.1), label: "10%" },
];

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
    });
    console.log(orders);

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
            <>
              <div className="inline-flex items-center gap-1 pt-6">
                <span className="body2 text-osmoverse-300">
                  When {swapState.baseDenom} price is
                </span>
                <button className="body2 inline-flex items-center gap-1 text-wosmongton-300">
                  <span>
                    {`${swapState.priceState.percentAdjusted
                      .mul(new Dec(100))
                      .round()
                      .abs()}%`}
                  </span>
                  <span>
                    {orderDirection === OrderDirection.Bid ? "below" : "above"}{" "}
                    current price
                  </span>
                  <Icon
                    id="arrows-swap-16"
                    className="h-4 w-4 text-wosmongton-300"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
              <div className="flex w-full items-center justify-between rounded-2xl bg-osmoverse-1000 py-3 px-5">
                <div className="inline-flex items-center gap-1 py-1">
                  {/** TODO: Dynamic width */}
                  <input
                    type="text"
                    className="w-[92px] bg-transparent text-white-full"
                    value={"$123456.01"}
                  />
                  <span className="text-osmoverse-400">=</span>
                  <span className="text-osmoverse-400">1 {base}</span>
                </div>
                <div className="flex items-center gap-1">
                  {percentAdjustmentOptions.map(({ label, value }) => (
                    <button
                      className="flex h-8 items-center rounded-5xl border border-osmoverse-700 px-3"
                      key={`limit-price-adjust-${label}`}
                      onClick={() =>
                        swapState.priceState.adjustByPercentage(
                          orderDirection == OrderDirection.Bid
                            ? value.neg()
                            : value
                        )
                      }
                    >
                      <span className="body2 text-wosmongton-200">
                        {label !== "0%" &&
                          (orderDirection === OrderDirection.Bid ? "-" : "+")}
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="inline-flex items-center gap-1 py-3.5">
              <span className="body2 text-osmoverse-300">
                {swapState.baseDenom} price ≈{" "}
                {formatPretty(swapState.quoteAssetPrice ?? new Dec(0))}{" "}
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
                    swapState.inAmountInput.inputAmount === "0"
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
