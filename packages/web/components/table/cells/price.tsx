import { RatePretty } from "@keplr-wallet/unit";
import type { CommonPriceChartTimeFrame } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
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

  if (recentPriceCloses.length === 0) return <div className="w-20" />;

  const isBullish = priceChange24h && priceChange24h.toDec().isPositive();
  const isBearish = priceChange24h && priceChange24h.toDec().isNegative();
  const isFlat = !isBullish && !isBearish;

  let color: string;
  if (isBullish) {
    color = theme.colors.bullish[400];
  } else if (isBearish) {
    color = theme.colors.ammelia[400];
  } else {
    color = theme.colors.wosmongton[200];
  }

  // remove negative symbol since we're using arrows
  if (isBearish && priceChange24h)
    priceChange24h = priceChange24h.mul(new RatePretty(-1));

  return (
    <div className="flex items-center gap-4">
      <Sparkline
        width={80}
        height={50}
        lineWidth={2}
        data={recentPriceCloses}
        color={color}
      />
      {priceChange24h && (
        <div className="flex items-center gap-1">
          {isBullish && (
            <Icon
              className="text-bullish-400"
              id="bullish-arrow"
              height={9}
              width={9}
            />
          )}
          {isBearish && (
            <Icon
              className="text-ammelia-400"
              id="bearish-arrow"
              height={9}
              width={9}
            />
          )}
          <span
            className={classNames("caption", {
              "text-bullish-400": isBullish,
              "text-ammelia-400": isBearish,
              "text-wosmongton-200": isFlat,
            })}
          >
            {isFlat ? "-" : priceChange24h.maxDecimals(2).toString()}
          </span>
        </div>
      )}
    </div>
  );
};
