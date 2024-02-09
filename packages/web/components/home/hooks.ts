import { TokenHistoricalPrice } from "@osmosis-labs/stores/build/queries-external/token-historical-chart/types";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { useMemo } from "react";

import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

export const useSwapHistoricalPrice = (
  coinDenom: string,
  timeFrame: CommonPriceChartTimeFrame
) => {
  /**
   * Need to have a custom graph so you have more points to plot
   */
  const customTimeFrame = useMemo(() => {
    /**
     * 1 hour bars
     */
    let frame = 60;
    let numRecentFrames = 0;

    switch (timeFrame) {
      case "1H":
        frame = 5; // 5 minute bars
        numRecentFrames = 12;
        break;
      case "1D":
        numRecentFrames = 24;
        break;
      case "1W":
        numRecentFrames = 168;
        break;
      case "1M":
        numRecentFrames = 730;
        break;
    }

    return {
      timeFrame: frame,
      numRecentFrames,
    };
  }, [timeFrame]);

  const result = trpc.api.edge.assets.getAssetHistoricalPrice.useQuery(
    {
      timeFrame: {
        custom: customTimeFrame,
      },
      coinDenom,
    },
    {
      select: (data) =>
        data.map(
          (d) =>
            ({
              ...d,
              denom: coinDenom,
            } as TokenHistoricalPrice & {
              denom: string;
            })
        ),
    }
  );

  return {
    result,
  };
};

export const availableTimeFrames: CommonPriceChartTimeFrame[] = [
  "1H",
  "1D",
  "1W",
  "1M",
];

export const useSwapPageQuery = () => {
  const [queryState, setQueryState] = useQueryStates({
    from: parseAsString.withDefault("OSMO"),
    to: parseAsString.withDefault("ATOM"),
    timeFrame:
      parseAsStringEnum<CommonPriceChartTimeFrame>(
        availableTimeFrames
      ).withDefault("1M"),
  });

  return {
    queryState,
    setQueryState,
  };
};
