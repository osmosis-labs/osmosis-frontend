import { TokenHistoricalPrice } from "@osmosis-labs/stores/build/queries-external/token-historical-chart/types";

import { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

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
              denom: coinDenom,
            } as TokenHistoricalPrice & {
              denom: string;
            })
        ),
    }
  );
  return queryResult;
};
