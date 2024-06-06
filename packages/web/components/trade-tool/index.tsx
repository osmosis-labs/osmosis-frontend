import { parseAsInteger, useQueryState } from "nuqs";
import { FunctionComponent, useMemo } from "react";

import ClientOnly from "~/components/client-only";
import { PlaceLimitTool } from "~/components/place-limit-tool";
import { SwapTool } from "~/components/swap-tool";
import {
  SwapToolTab,
  SwapToolTabs,
} from "~/components/swap-tool/swap-tool-tabs";
import { OrderDirection } from "~/hooks/limit-orders";

export interface TradeToolProps {}

export const TradeTool: FunctionComponent<TradeToolProps> = () => {
  const [tab, setTab] = useQueryState("tab", parseAsInteger.withDefault(0));

  return (
    <ClientOnly>
      <div className="relative flex flex-col gap-6 overflow-hidden md:gap-6 md:px-3 md:pb-4 md:pt-4">
        <SwapToolTabs activeTab={tab} setTab={setTab} />
        {useMemo(() => {
          switch (tab) {
            case SwapToolTab.BUY:
              return <PlaceLimitTool orderDirection={OrderDirection.Bid} />;
            case SwapToolTab.SELL:
              return <PlaceLimitTool orderDirection={OrderDirection.Ask} />;
            case SwapToolTab.SWAP:
              return (
                <SwapTool useOtherCurrencies useQueryParams page="Swap Page" />
              );
          }
        }, [tab])}
      </div>
    </ClientOnly>
  );
};
