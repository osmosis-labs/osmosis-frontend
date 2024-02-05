import { TokenHistoricalPrice } from "@osmosis-labs/stores/build/queries-external/token-historical-chart/types";

import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

const minMax = (current: number, max: number, min: number) =>
  (current - min) / max - min;

export const useGetHistoricalPriceWithNormalization = (
  coinDenom: string,
  timeFrame: CommonPriceChartTimeFrame
) => {
  const queryResult = trpc.api.edge.assets.getAssetHistoricalPrice.useQuery(
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
              displayValue: minMax(d.close, d.high, d.low),
              denom: coinDenom,
            } as TokenHistoricalPrice & {
              denom: string;
              displayValue: number;
            })
        ),
    }
  );
  return queryResult;
};
