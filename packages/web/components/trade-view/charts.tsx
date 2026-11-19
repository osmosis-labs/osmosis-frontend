import Script from "next/script";
import { FunctionComponent, useMemo } from "react";

import { AdvancedChart } from "~/components/chart/light-weight-charts/advanced-chart";
import { ChartUnavailable } from "~/components/chart/price-historical";
import { historicalDatafeed } from "~/utils/trading-view";
import { api } from "~/utils/trpc";

/** USD price chart of a single asset, as on the asset page. */
export const AssetUsdChart: FunctionComponent<{
  coinDenom?: string;
}> = ({ coinDenom }) => {
  const apiUtils = api.useUtils();
  const datafeed = useMemo(
    () => historicalDatafeed({ apiUtils }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      {/* next/script loads a given src only once. */}
      <Script
        src="/tradingview/charting_library.standalone.js"
        strategy="afterInteractive"
      />
      {coinDenom ? (
        // A denom change switches the symbol on the live chart.
        <AdvancedChart coinDenom={coinDenom} datafeed={datafeed} />
      ) : (
        <ChartUnavailable />
      )}
    </>
  );
};
