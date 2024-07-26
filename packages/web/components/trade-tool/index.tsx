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
import {
  useOrderbookAllActiveOrders,
  useOrderbookClaimableOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";

export interface TradeToolProps {
  swapToolProps?: SwapToolProps;
  page: EventPage;
}

export const TradeTool: FunctionComponent<TradeToolProps> = observer(
  ({ page, swapToolProps }) => {
    const { logEvent } = useAmplitudeAnalytics();
    const [tab, setTab] = useQueryState(
      "tab",
      parseAsStringEnum<SwapToolTab>(Object.values(SwapToolTab)).withDefault(
        SwapToolTab.SWAP
      )
    );
    const { t } = useTranslation();

    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const { count } = useOrderbookClaimableOrders({
      userAddress: wallet?.address ?? "",
    });

    const { orders } = useOrderbookAllActiveOrders({
      userAddress: wallet?.address ?? "",
      pageSize: 100,
    });

    const openOrders = useMemo(
      () =>
        orders.filter(
          ({ status }) => status === "open" || status === "partiallyFilled"
        ),
      [orders]
    );

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);
    return (
      <ClientOnly>
        <div className="relative flex flex-col gap-3 rounded-3xl bg-osmoverse-900 px-5 pt-5 pb-4">
          <div className="flex w-full items-center justify-between">
            <SwapToolTabs activeTab={tab} setTab={setTab} />
            <div className="flex items-center gap-2">
              {tab !== SwapToolTab.SWAP && <OrderTypeSelector />}
              {/* {wallet?.isWalletConnected && (
                <Link
                  href={"/transactions?tab=orders&fromPage=swap"}
                  className="relative flex h-12 w-12 items-center justify-center overflow-visible rounded-full bg-osmoverse-825 transition-colors hover:bg-osmoverse-700"
                >
                  <Icon
                    id="history-uncolored"
                    width={24}
                    height={24}
                    className="h-6 w-6 text-wosmongton-200"
                  />
                  {count > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#A51399]">
                      <span className="text-xs leading-[14px]">{count}</span>
                    </div>
                  )}
                </Link>
              )} */}
            </div>
          </div>
          {useMemo(() => {
            switch (tab) {
              case SwapToolTab.BUY:
                return <PlaceLimitTool page={page} />;
              case SwapToolTab.SELL:
                return <PlaceLimitTool page={page} />;
              case SwapToolTab.SWAP:
              default:
                return (
                  <AltSwapTool
                    useOtherCurrencies
                    useQueryParams
                    page={page}
                    {...swapToolProps}
                  />
                );
            }
          }, [page, swapToolProps, tab])}
          {wallet?.isWalletConnected && openOrders.length > 0 && (
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
      </ClientOnly>
    );
  }
);
