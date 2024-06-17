import { parseAsStringEnum, useQueryState } from "nuqs";
import { FunctionComponent, useMemo } from "react";

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

  return (
    <ClientOnly>
      <div className="relative flex flex-col gap-6 overflow-hidden md:gap-6 md:px-3 md:pb-4 md:pt-4">
        <div className="flex w-full items-center justify-between">
          <SwapToolTabs activeTab={tab} setTab={setTab} />
          {tab !== SwapToolTab.SWAP && <OrderTypeSelector />}
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
