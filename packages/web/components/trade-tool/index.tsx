import { observer } from "mobx-react-lite";
import Link from "next/link";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { FunctionComponent, useEffect, useMemo } from "react";

import { Icon } from "~/components/assets";
import { ClientOnly } from "~/components/client-only";
import { PlaceLimitTool } from "~/components/place-limit-tool";
import type { SwapToolProps } from "~/components/swap-tool";
import { AltSwapTool } from "~/components/swap-tool/alt";
import { OrderTypeSelector } from "~/components/swap-tool/order-type-selector";
import {
  SwapToolTab,
  SwapToolTabs,
} from "~/components/swap-tool/swap-tool-tabs";
import { EventName, EventPage } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { PreviousTrade } from "~/pages";
import { useStore } from "~/stores";

export interface TradeToolProps {
  swapToolProps?: SwapToolProps;
  page: EventPage;
  previousTrade?: PreviousTrade;
  setPreviousTrade: (trade: PreviousTrade) => void;
}

export const TradeTool: FunctionComponent<TradeToolProps> = observer(
  ({ page, swapToolProps, previousTrade, setPreviousTrade }) => {
    const { logEvent } = useAmplitudeAnalytics();
    const { t } = useTranslation();
    const [tab, setTab] = useQueryState(
      "tab",
      parseAsStringEnum<SwapToolTab>(Object.values(SwapToolTab)).withDefault(
        SwapToolTab.SWAP
      )
    );

    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    useEffect(() => {
      switch (tab) {
        case SwapToolTab.BUY:
          logEvent([EventName.LimitOrder.buySelected]);
          break;
        case SwapToolTab.SELL:
          logEvent([EventName.LimitOrder.sellSelected]);
          break;
        case SwapToolTab.SWAP:
          logEvent([EventName.LimitOrder.swapSelected]);
          break;
      }

      /**
       * Dependencies are disabled for this hook as we only want to emit
       * events when the user changes tabs.
       */
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);
    return (
      <ClientOnly>
        <div className="relative flex flex-col gap-3 rounded-3xl bg-osmoverse-900 px-5 pt-5 pb-3 sm:px-4 sm:pt-4 sm:pb-2">
          <div className="flex w-full items-center justify-between md:gap-2">
            <SwapToolTabs activeTab={tab} setTab={setTab} />
            <div className="flex items-center gap-2">
              {tab !== SwapToolTab.SWAP && (
                <OrderTypeSelector
                  initialBaseDenom={previousTrade?.baseDenom}
                  initialQuoteDenom={previousTrade?.quoteDenom}
                />
              )}
            </div>
          </div>
          {useMemo(() => {
            switch (tab) {
              case SwapToolTab.BUY:
                return (
                  <PlaceLimitTool
                    key="tool-buy"
                    page={page}
                    initialBaseDenom={previousTrade?.baseDenom}
                    initialQuoteDenom={previousTrade?.quoteDenom}
                    onOrderSuccess={(baseDenom, quoteDenom) => {
                      setPreviousTrade({
                        sendTokenDenom: quoteDenom ?? "",
                        outTokenDenom: baseDenom ?? "",
                        baseDenom: baseDenom ?? "",
                        quoteDenom: quoteDenom ?? "",
                      });
                    }}
                  />
                );
              case SwapToolTab.SELL:
                return (
                  <PlaceLimitTool
                    key="tool-sell"
                    page={page}
                    initialBaseDenom={previousTrade?.baseDenom}
                    initialQuoteDenom={previousTrade?.quoteDenom}
                    onOrderSuccess={(baseDenom, quoteDenom) => {
                      setPreviousTrade({
                        sendTokenDenom: baseDenom ?? "",
                        outTokenDenom: quoteDenom ?? "",
                        baseDenom: baseDenom ?? "",
                        quoteDenom: quoteDenom ?? "",
                      });
                    }}
                  />
                );
              case SwapToolTab.SWAP:
              default:
                return (
                  <AltSwapTool
                    useOtherCurrencies
                    useQueryParams
                    page={page}
                    onSwapSuccess={({ sendTokenDenom, outTokenDenom }) => {
                      setPreviousTrade({
                        sendTokenDenom,
                        outTokenDenom,
                        baseDenom: previousTrade?.baseDenom ?? "",
                        quoteDenom: previousTrade?.quoteDenom ?? "",
                      });
                    }}
                    initialSendTokenDenom={previousTrade?.sendTokenDenom}
                    initialOutTokenDenom={previousTrade?.outTokenDenom}
                    {...swapToolProps}
                  />
                );
            }
          }, [page, swapToolProps, tab, previousTrade, setPreviousTrade])}
        </div>
        {wallet?.isWalletConnected && (
          <Link
            href="/transactions?tab=orders&fromPage=swap"
            className="my-3 flex items-center justify-between rounded-2xl border border-solid border-osmoverse-800/50 bg-osmoverse-1000 py-2 px-4 hover:bg-osmoverse-850"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center">
                <Icon
                  id="history-uncolored"
                  width={24}
                  height={24}
                  className="text-osmoverse-400"
                />
              </div>
              <span className="subtitle1 text-osmoverse-300">
                {t("limitOrders.orderHistory")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={7}
                  height={12}
                  className="text-osmoverse-400"
                />
              </div>
            </div>
          </Link>
        )}
      </ClientOnly>
    );
  }
);
