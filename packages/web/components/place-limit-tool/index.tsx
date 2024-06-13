import { WalletStatus } from "@cosmos-kit/core";
import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { TokenSelectLimit } from "~/components/control/token-select-limit";
import { LimitInput } from "~/components/input/limit-input";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { OrderDirection, usePlaceLimit } from "~/hooks/limit-orders";
import {
  useOrderbook,
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
  ({ orderDirection = OrderDirection.Bid }) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const {
      selectableBaseDenoms,
      selectableQuoteDenoms,
      selectableBaseAssets,
    } = useOrderbookSelectableDenoms();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const [baseDenom, setBaseDenom] = useState<string>("OSMO");
    const [quoteDenom, setQuoteDenom] = useState<string>("USDC");

    useEffect(() => {
      if (selectableBaseDenoms.length > 0) {
        const baseDenom = selectableBaseDenoms[0];
        setBaseDenom(baseDenom);
      }
    }, [selectableBaseDenoms, selectableQuoteDenoms]);
    useEffect(() => {
      if (Object.keys(selectableQuoteDenoms).length > 0) {
        const quoteDenom = selectableQuoteDenoms[baseDenom][0];
        setQuoteDenom(quoteDenom);
      }
    }, [selectableQuoteDenoms, baseDenom]);

    const { poolId, contractAddress, makerFee } = useOrderbook({
      baseDenom,
      quoteDenom,
    });
    const swapState = usePlaceLimit({
      osmosisChainId: accountStore.osmosisChainId,
      poolId,
      orderDirection,
      useQueryParams: false,
      orderbookContractAddress: contractAddress,
      baseDenom,
      quoteDenom,
    });
    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const isSwapToolLoading = false;

    return (
      <>
        <div className="flex flex-col gap-3">
          <TokenSelectLimit
            selectableAssets={selectableBaseAssets as any[]}
            baseAsset={swapState.baseAsset}
            quoteAsset={swapState.quoteAsset}
            baseBalance={swapState.baseTokenBalance}
            quoteBalance={swapState.quoteTokenBalance}
            onTokenSelect={(newDenom) => setBaseDenom(newDenom)}
            disabled={false}
            orderDirection={orderDirection}
          />
          <div className="px-4 py-[22px] transition-all md:rounded-xl md:py-2.5 md:px-3">
            <div className="flex place-content-end items-center transition-opacity">
              <div className="flex items-center gap-1.5">
                <Tooltip
                  content={
                    <div className="text-center">
                      {t("swap.maxButtonErrorNoBalance")}
                    </div>
                  }
                  disabled={!swapState.inAmountInput.notEnoughBalanceForMax}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className={classNames(
                      "text-wosmongton-300",
                      swapState.inAmountInput.isMaxValue &&
                        !swapState.inAmountInput
                          .isLoadingCurrentBalanceNetworkFee &&
                        !swapState.inAmountInput.hasErrorWithCurrentBalanceQuote
                        ? "bg-wosmongton-100/20"
                        : "bg-transparent"
                    )}
                    disabled={
                      !swapState.inAmountInput.balance ||
                      swapState.inAmountInput.balance.toDec().isZero() ||
                      swapState.inAmountInput.notEnoughBalanceForMax
                    }
                    isLoading={false}
                    loadingText={t("swap.MAX")}
                    classes={{
                      spinner: "!h-3 !w-3",
                      spinnerContainer: "!gap-1",
                    }}
                    onClick={() => swapState.inAmountInput.toggleMax()}
                  >
                    {t("swap.MAX")}
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="mt-3 flex place-content-between items-center">
              <div className="flex w-full flex-col items-center">
                <LimitInput
                  onChange={swapState.inAmountInput.setAmount}
                  baseAsset={swapState.inAmountInput.balance!}
                  tokenAmount={swapState.inAmountInput.inputAmount}
                  price={swapState.priceState.price}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex place-content-between items-center text-body1">
            <div className="flex w-full flex-col">
              <div>
                <span
                  className={classNames(
                    "w-full bg-transparent text-white-full focus:outline-none"
                  )}
                >{`When ${swapState.baseDenom} price is at `}</span>
                <span
                  className={classNames(
                    "w-full bg-transparent text-wosmongton-300 focus:outline-none "
                  )}
                >{`$${formatPretty(swapState.priceState.price)}`}</span>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-row place-content-between items-center rounded-xl border border-osmoverse-700 py-3 px-6">
            <div className="h-full">
              <span>{`${swapState.priceState.percentAdjusted
                .mul(new Dec(100))
                .round()
                .abs()}% `}</span>
              <span className="text-osmoverse-400">
                {orderDirection === OrderDirection.Bid ? "below" : "above"}{" "}
                current price
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {useMemo(
                () =>
                  percentAdjustmentOptions.map(({ label, value }) => (
                    <button
                      className="rounded-xl border border-osmoverse-700 py-1 px-3 text-white-full text-wosmongton-200"
                      key={`limit-price-adjust-${label}`}
                      onClick={() =>
                        swapState.priceState.adjustByPercentage(
                          orderDirection == OrderDirection.Bid
                            ? value.neg()
                            : value
                        )
                      }
                    >
                      {label}
                    </button>
                  )),
                [swapState.priceState, orderDirection]
              )}
            </div>
          </div>
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
          makerFee={makerFee}
          onRequestClose={() => setReviewOpen(false)}
          orderType="limit"
        />
      </>
    );
  }
);
