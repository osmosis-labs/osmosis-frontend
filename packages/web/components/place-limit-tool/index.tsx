import { WalletStatus } from "@cosmos-kit/core";
import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { TokenSelectLimit } from "~/components/control/token-select-limit";
import { TRADE_TYPES } from "~/components/swap-tool/order-type-selector";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { OrderDirection, usePlaceLimit } from "~/hooks/limit-orders";
import { useOrderbookPool } from "~/hooks/limit-orders/use-orderbook-pool";
import { ReviewLimitOrderModal } from "~/modals/review-limit-order";
import { useStore } from "~/stores";

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
  ({ orderDirection = OrderDirection.Bid }) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const [base, setBase] = useQueryState(
      "base",
      parseAsString.withDefault("ION")
    );
    const [quote] = useQueryState("base", parseAsString.withDefault("USDC"));
    const [type] = useQueryState(
      "type",
      parseAsStringLiteral(TRADE_TYPES).withDefault("market")
    );

    const { poolId, orderbookContractAddress } = useOrderbookPool({
      baseDenom: base,
      quoteDenom: quote,
    });

    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      poolId,
      orderDirection,
      useQueryParams: false,
      orderbookContractAddress,
      baseDenom: base,
      quoteDenom: quote,
    });
    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const isSwapToolLoading = false;

    return (
      <>
        <div className="flex flex-col gap-3">
          <TokenSelectLimit
            selectableAssets={[swapState.baseAsset, swapState.quoteAsset]}
            baseAsset={swapState.baseAsset}
            quoteAsset={swapState.quoteAsset}
            baseBalance={swapState.baseTokenBalance}
            quoteBalance={swapState.quoteTokenBalance}
            onTokenSelect={setBase}
            disabled={false}
            orderDirection={orderDirection}
          />
          <div className="flex flex-col rounded-2xl bg-osmoverse-1000">
            <p className="body2 p-4 text-center font-light text-osmoverse-400">
              Enter an amount to buy
            </p>
            <div className="flex flex-col gap-2">
              <div className="relative flex w-full items-center justify-center pb-2">
                <h3 className="self-center text-wosmongton-400">$0</h3>
                <button className="absolute right-4 flex items-center justify-center rounded-5xl border border-osmoverse-700 py-1.5 px-3 opacity-50 transition-opacity hover:opacity-100">
                  <span className="body2 text-wosmongton-200">Max</span>
                </button>
              </div>
              <div className="flex w-full items-center justify-center gap-1 pb-5">
                <p className="text-wosmongton-200">0 {quote}</p>
                <button className="flex items-center">
                  <Icon
                    id="arrow-right"
                    className="h-6 w-4 rotate-90 text-wosmongton-200"
                    width={16}
                    height={24}
                  />
                  <Icon
                    id="arrow-right"
                    className="-ml-1 h-6 w-4 -rotate-90 text-wosmongton-200"
                    width={16}
                    height={24}
                  />
                </button>
              </div>
            </div>
          </div>
          {type === "limit" && (
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
          )}
          <Button
            disabled={
              swapState.insufficientFunds ||
              !swapState.inAmountInput.inputAmount ||
              swapState.inAmountInput.inputAmount === "0"
            }
            isLoading={!swapState.isBalancesFetched}
            loadingText={"Loading..."}
            onClick={() => setReviewOpen(true)}
          >
            {account?.walletStatus === WalletStatus.Connected ||
            isSwapToolLoading ? (
              t("place-limit.reviewOrder")
            ) : (
              <h6 className="flex items-center gap-3">
                <Icon id="wallet" className="h-6 w-6" />
                {t("connectWallet")}
              </h6>
            )}
          </Button>
        </div>
        <ReviewLimitOrderModal
          placeLimitState={swapState}
          orderDirection={orderDirection}
          isOpen={reviewOpen}
          onRequestClose={() => setReviewOpen(false)}
          orderType="limit"
        />
      </>
    );
  }
);
