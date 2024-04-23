import { RatePretty } from "@keplr-wallet/unit";
import type { CommonPriceChartTimeFrame } from "@osmosis-labs/server";
import { FunctionComponent } from "react";

import { HistoricalPriceSparkline } from "~/components/assets/price";
import { PriceChange } from "~/components/assets/price";

/** Historical price sparkline, accompanied with price change if provided. */
export const HistoricalPriceCell: FunctionComponent<{
  coinDenom: string;
  timeFrame: CommonPriceChartTimeFrame;
  priceChange24h?: RatePretty;
}> = ({ coinDenom, priceChange24h, timeFrame = "1D" }) => (
  <div className="flex items-center gap-4">
    <HistoricalPriceSparkline
      coinDenom={coinDenom}
      timeFrame={timeFrame}
      height={50}
      width={80}
    />
    {priceChange24h && <PriceChange priceChange={priceChange24h} />}
  </div>
);
