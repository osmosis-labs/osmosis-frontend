import type { TokenHistoricalPrice } from "@osmosis-labs/stores/build/queries-external/token-historical-chart/types";
import { DeepPartial } from "lightweight-charts";
import { useRouter } from "next/router";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";

import {
  Asset,
  CommonPriceChartTimeFrame,
} from "~/server/queries/complex/assets";
import * as trpc from "~/utils/trpc";

interface UseSwapHistoricalPriceProps {
  asset?: Asset;
  coinDenom: string;
  timeFrame?: CommonPriceChartTimeFrame;
}

export type HistoricalPriceData = TokenHistoricalPrice &
  DeepPartial<Asset> & {
    label?: string;
  };

export const useSwapHistoricalPrice = (props: UseSwapHistoricalPriceProps) => {
  const { coinDenom, timeFrame, asset } = props;
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

  const { data: dataRaw, ...rest } =
    trpc.api.edge.assets.getAssetHistoricalPrice.useQuery({
      timeFrame: {
        custom: customTimeFrame,
      },
      coinDenom,
    });

  const data = useMemo(() => {
    if (dataRaw) {
      return dataRaw.map((assetHistoricalPrice) => ({
        ...assetHistoricalPrice,
        ...asset,
      })) as (TokenHistoricalPrice & Asset)[];
    }
  }, [asset, dataRaw]);

  return {
    data,
    ...rest,
  };
};

export const availableTimeFrames: CommonPriceChartTimeFrame[] = [
  "1H",
  "1D",
  "1W",
  "1M",
];

export const useSwapPageQuery = () => {
  const router = useRouter();

  const [swapState, setSwapState] = useQueryStates({
    from: parseAsString.withDefault("ATOM"),
    to: parseAsString.withDefault("OSMO"),
  });

  const [timeFrame, setTimeFrame] = useQueryState(
    "timeFrame",
    parseAsStringEnum<CommonPriceChartTimeFrame>(
      availableTimeFrames
    ).withDefault("1M")
  );

  return {
    swapState,
    setSwapState,
    timeFrame: router.isReady ? timeFrame : undefined,
    setTimeFrame,
  };
};
