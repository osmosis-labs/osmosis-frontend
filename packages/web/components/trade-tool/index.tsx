import Link from "next/link";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
import { ClientOnly } from "~/components/client-only";
import { PlaceLimitTool } from "~/components/place-limit-tool";
import { AltSwapTool } from "~/components/swap-tool/alt";
import { OrderTypeSelector } from "~/components/swap-tool/order-type-selector";
import {
  SwapToolTab,
  SwapToolTabs,
} from "~/components/swap-tool/swap-tool-tabs";
import { OrderDirection } from "~/hooks/limit-orders";

export interface TradeToolProps {}

export const TradeTool: FunctionComponent<TradeToolProps> = () => {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<SwapToolTab>(Object.values(SwapToolTab)).withDefault(
      SwapToolTab.SWAP
    )
  );

  // Mock
  const unclaimedOrders = Array(0)
    .fill(null)
    .map((i) => i + 1);

  return (
    <ClientOnly>
      <div className="relative flex flex-col gap-6 md:gap-6 md:px-3 md:pb-4 md:pt-4">
        <div className="flex w-full items-center justify-between">
          <SwapToolTabs activeTab={tab} setTab={setTab} />
          <div className="flex items-center gap-3">
            {tab !== SwapToolTab.SWAP && <OrderTypeSelector />}
            <Link
              href={"/transactions?tab=orders&from=swap"}
              className="relative flex h-12 w-12 items-center justify-center overflow-visible rounded-full bg-osmoverse-825 transition-colors hover:bg-osmoverse-700"
            >
              <Icon
                id="history-uncolored"
                width={24}
                height={24}
                className="h-6 w-6 text-wosmongton-200"
              />
              {unclaimedOrders.length > 0 && (
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#A51399]">
                  <span className="text-xs leading-[14px]">
                    {unclaimedOrders.length}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
        {useMemo(() => {
          switch (tab) {
            case SwapToolTab.BUY:
              return <PlaceLimitTool orderDirection={OrderDirection.Bid} />;
            case SwapToolTab.SELL:
              return <PlaceLimitTool orderDirection={OrderDirection.Ask} />;
            case SwapToolTab.SWAP:
            default:
              return (
                <AltSwapTool
                  useOtherCurrencies
                  useQueryParams
                  page="Swap Page"
                />
              );
          }
        }, [tab])}
      </div>
    </ClientOnly>
  );
};
