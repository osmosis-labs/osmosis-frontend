import { WalletStatus } from "@cosmos-kit/core";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useRef } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation, useWindowSize } from "~/hooks";
import { usePlaceLimit } from "~/hooks/limit-orders";
import { useStore } from "~/stores";
import { formatCoinMaxDecimalsByOne, formatPretty } from "~/utils/formatter";

export interface PlaceLimitToolProps {}

export const PlaceLimitTool: FunctionComponent<PlaceLimitToolProps> = observer(
  () => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const swapState = usePlaceLimit({
      osmosisChainId: "localosmosis",
      orderbookContractAddress:
        "osmo1svmdh0ega4jg44xc3gg36tkjpzrzlrgajv6v6c2wf0ul8m3gjajs0dps9w",
      useQueryParams: false,
    });
    const fromAmountInputEl = useRef<HTMLInputElement | null>(null);
    const { isMobile } = useWindowSize();
    const account = accountStore.getWallet("localosmosis");

    const isSwapToolLoading = false;

    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-osmoverse-900 px-4 py-[22px] transition-all md:rounded-xl md:py-2.5 md:px-3">
          <div className="flex place-content-between items-center transition-opacity">
            <div className="flex">
              <span className="caption text-xs text-white-full">
                {t("swap.available")}
              </span>
              <span className="caption ml-1.5 text-xs text-wosmongton-300">
                {formatCoinMaxDecimalsByOne(
                  swapState.inAmountInput?.balance,
                  2,
                  Math.min(swapState.fromAsset?.coinDecimals ?? 0, 8)
                ) || "0 " + (swapState.fromAsset?.coinDenom ?? "")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className={classNames(
                  "text-wosmongton-300",
                  swapState.inAmountInput.fraction === 0.5
                    ? "bg-wosmongton-100/20"
                    : "bg-transparent"
                )}
                disabled={
                  !swapState.inAmountInput.balance ||
                  swapState.inAmountInput.balance.toDec().isZero()
                }
                onClick={() => swapState.inAmountInput.toggleHalf()}
              >
                {t("swap.HALF")}
              </Button>
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
            <div className="flex w-full flex-col items-end">
              <input
                ref={fromAmountInputEl}
                type="number"
                className={classNames(
                  "w-full bg-transparent text-right text-white-full placeholder:text-white-disabled focus:outline-none md:text-subtitle1",
                  "text-h5 font-h5 md:font-subtitle1"
                )}
                placeholder="0"
                onChange={(e) => {
                  e.preventDefault();
                  if (e.target.value.length <= (isMobile ? 19 : 26)) {
                    swapState.inAmountInput.setAmount(e.target.value);
                  }
                }}
                value={swapState.inAmountInput.inputAmount}
              />
              <span
                className={classNames(
                  "subtitle1 md:caption whitespace-nowrap text-osmoverse-300 transition-opacity",
                  !swapState.inAmountInput.fiatValue ||
                    swapState.inAmountInput.fiatValue.toDec().isZero()
                    ? "opacity-0"
                    : "opacity-100"
                )}
              >{`≈ ${
                swapState.inAmountInput.fiatValue &&
                swapState.inAmountInput.fiatValue.toString().length > 15
                  ? formatPretty(swapState.inAmountInput.fiatValue)
                  : swapState.inAmountInput.fiatValue?.toString() ?? "0"
              }`}</span>
            </div>
          </div>
        </div>
        <Button
          disabled={false}
          isLoading={false}
          loadingText={"Loading..."}
          onClick={() => swapState.placeLimit("ask")}
        >
          {account?.walletStatus === WalletStatus.Connected ||
          isSwapToolLoading ? (
            "Place Order"
          ) : (
            <h6 className="flex items-center gap-3">
              <Icon id="wallet" className="h-6 w-6" />
              {t("connectWallet")}
            </h6>
          )}
        </Button>
      </div>
    );
  }
);
