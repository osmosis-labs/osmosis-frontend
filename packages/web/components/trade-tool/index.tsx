import { observer } from "mobx-react-lite";
import Link from "next/link";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { FunctionComponent, useMemo } from "react";

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
import { useTranslation } from "~/hooks";
import {
  useOrderbookAllActiveOrders,
  useOrderbookClaimableOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";

export interface TradeToolProps {
  fromAssetsPage?: boolean;
  swapToolProps?: SwapToolProps;
}

export const TradeTool: FunctionComponent<TradeToolProps> = observer(
  ({ fromAssetsPage, swapToolProps }) => {
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

    return (
      <ClientOnly>
        <div className="relative flex flex-col gap-3 md:gap-3 md:px-3 md:pb-4 md:pt-4">
          <div className="flex w-full items-center justify-between">
            <SwapToolTabs activeTab={tab} setTab={setTab} />
            <div className="flex items-center gap-2">
              {tab !== SwapToolTab.SWAP && <OrderTypeSelector />}
              {wallet?.isWalletConnected && (
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
              )}
            </div>
          </div>
          {useMemo(() => {
            switch (tab) {
              case SwapToolTab.BUY:
                return (
                  <PlaceLimitTool
                    fromAssetsPage={fromAssetsPage}
                    orderDirection={"bid"}
                  />
                );
              case SwapToolTab.SELL:
                return (
                  <PlaceLimitTool
                    fromAssetsPage={fromAssetsPage}
                    orderDirection={"ask"}
                  />
                );
              case SwapToolTab.SWAP:
              default:
                return (
                  <AltSwapTool
                    useOtherCurrencies
                    useQueryParams
                    page="Swap Page"
                    {...swapToolProps}
                  />
                );
            }
          }, [fromAssetsPage, swapToolProps, tab])}
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
