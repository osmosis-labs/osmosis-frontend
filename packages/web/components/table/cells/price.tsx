import { RatePretty } from "@keplr-wallet/unit";
import type { CommonPriceChartTimeFrame } from "@osmosis-labs/server";
import { FunctionComponent, useMemo } from "react";

import { PriceChange } from "~/components/assets/price-change";
import { Sparkline } from "~/components/chart/sparkline";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

export const HistoricalPriceCell: FunctionComponent<{
  coinDenom: string;
  timeFrame: CommonPriceChartTimeFrame;
  priceChange24h?: RatePretty;
}> = ({ coinDenom, priceChange24h, timeFrame = "1D" }) => {
  const { data: recentPrices } =
    api.edge.assets.getAssetHistoricalPrice.useQuery(
      {
        coinDenom: coinDenom,
        timeFrame: timeFrame,
      },
      {
        staleTime: 1000 * 30, // 30 secs
      }
    );

  const recentPriceCloses = useMemo(
    () => (recentPrices ? recentPrices.map((p) => p.close) : []),
    [recentPrices]
  );

  const isBullish = priceChange24h && priceChange24h.toDec().isPositive();
  const isBearish = priceChange24h && priceChange24h.toDec().isNegative();

  let color: string;
  if (isBullish) {
    color = theme.colors.bullish[400];
  } else if (isBearish) {
    color = theme.colors.rust[400];
  } else {
    color = theme.colors.wosmongton[200];
  }

  return (
    <div className="flex items-center gap-4">
      {recentPriceCloses.length > 0 && (
        <Sparkline
          width={80}
          height={50}
          lineWidth={2}
          data={recentPriceCloses}
          color={color}
        />
      )}
      {priceChange24h && <PriceChange priceChange={priceChange24h} />}
    </div>
  );
};
