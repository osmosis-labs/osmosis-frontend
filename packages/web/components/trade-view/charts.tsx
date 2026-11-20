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
        // The widget reads its symbol only at creation, so rebuild it when
        // the denom changes.
        <AdvancedChart
          key={coinDenom}
          coinDenom={coinDenom}
          datafeed={datafeed}
        />
      ) : (
        <ChartUnavailable />
      )}
    </>
  );
};
