import { TokenHistoricalPrice } from "@osmosis-labs/stores/build/queries-external/token-historical-chart/types";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

export const useSwapHistoricalPrice = (
  coinDenom: string,
  timeFrame: CommonPriceChartTimeFrame
) => {
  const result = trpc.api.edge.assets.getAssetHistoricalPrice.useQuery(
    {
      timeFrame,
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
