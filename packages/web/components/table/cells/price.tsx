import { RatePretty } from "@keplr-wallet/unit";
import type { CommonPriceChartTimeFrame } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

import { PriceChange } from "~/components/assets/price-change";
import { Sparkline } from "~/components/chart/sparkline";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

export const PriceCell: FunctionComponent<
  Partial<{
    coinDenom: string;
    currentPrice: RatePretty;
    priceChange24h?: RatePretty;
  }>
> = ({ currentPrice, coinDenom, priceChange24h }) => (
  <div className={classNames("flex w-44 items-center gap-4 md:gap-1")}>
    <div className="flex w-full flex-col place-content-center">
      {coinDenom && (
        <div className="subtitle1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {currentPrice?.toString() ?? "-"}
        </div>
      )}
      {coinDenom && (
        <span className="body2 md:caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400 md:w-28">
          {priceChange24h && <PriceChange priceChange={priceChange24h} />}
        </span>
      )}
    </div>
  </div>
);

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
      {/** If empty, is likely error state */}
      {recentPriceCloses.length > 0 ? (
        <Sparkline
          width={80}
          height={50}
          lineWidth={2}
          data={recentPriceCloses}
          color={color}
        />
      ) : (
        <div className="w-20" />
      )}
      {priceChange24h && <PriceChange priceChange={priceChange24h} />}
    </div>
  );
};
