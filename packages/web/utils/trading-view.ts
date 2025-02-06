import { TokenHistoricalPrice } from "@osmosis-labs/server";

import type {
  DatafeedConfiguration,
  ErrorCallback,
  HistoryCallback,
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  Timezone,
} from "~/public/tradingview";
import { api } from "~/utils/trpc";

const configurationData: DatafeedConfiguration = {
  supported_resolutions: ["5", "15", "60", "240", "480"] as ResolutionString[],
  exchanges: [
    {
      value: "Osmosis", // `exchange` argument for the `searchSymbols` method, if a user selects this exchange
      name: "Osmosis", // filter name
      desc: "Osmosis DEX", // full exchange name displayed in the filter popup
    },
  ],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto", // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
    },
  ],
};

export const historicalDatafeed: ({
  apiUtils,
}: {
  apiUtils: ReturnType<typeof api.useUtils>;
}) => IBasicDataFeed = ({ apiUtils }) => ({
  onReady(callback: OnReadyCallback) {
    setTimeout(() => callback(configurationData), 0);
  },
  searchSymbols: (
    _: string,
    __: string,
    ___: string,
    onResult: SearchSymbolsCallback
  ) => {
    onResult([]);
  },
  resolveSymbol: async (
    denom: string,
    onResult: ResolveCallback,
    onError: ErrorCallback
  ) => {
    try {
      const asset = await apiUtils.edge.assets.getUserAsset.fetch({
        findMinDenomOrSymbol: denom,
      });

      const pricescale = 10 ** 6;

      const symbolInfo: LibrarySymbolInfo = {
        ticker: asset.coinName,
        name: asset.coinDenom,
        base_name: [asset.coinMinimalDenom],
        description: asset.coinName,
        type: "crypto",
        exchange: "Osmosis",
        listed_exchange: "Osmosis",
        has_intraday: true,
        has_daily: true,
        minmov: 1,
        pricescale,
        session: "24x7",
        /* intraday_multipliers: ["5", "60", "720", "1440", "1440"], */
        supported_resolutions: configurationData.supported_resolutions!,
        data_status: "endofday",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
        format: "price",
      };

      setTimeout(() => onResult(symbolInfo), 0);
    } catch (error) {
      setTimeout(() => onError((error as Error).message), 0);
    }
  },

  getBars: async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: {
      countBack: number;
      from: number;
      to: number;
      firstDataRequest: boolean;
    },
    onResult: HistoryCallback,
    onError: ErrorCallback
  ) => {
    try {
      if (!symbolInfo) return;

      const { countBack, firstDataRequest } = periodParams;

      const customTimeFrame = {
        timeFrame: 5,
      };

      switch (resolution) {
        case "60":
          customTimeFrame.timeFrame = 5;
          break;
        case "1D":
          customTimeFrame.timeFrame = 60;
          break;
        case "1W":
          customTimeFrame.timeFrame = 720;
          break;
        case "1M":
          customTimeFrame.timeFrame = 1440;
          break;
        case "12M":
          customTimeFrame.timeFrame = 1440;
          break;
      }

      let bars: TokenHistoricalPrice[] = [];

      bars = await apiUtils.edge.assets.getAssetHistoricalPrice.fetch({
        coinMinimalDenom: symbolInfo.base_name
          ? symbolInfo.base_name[0]
          : symbolInfo.name,
        timeFrame: {
          custom: customTimeFrame,
        },
      });

      if (bars.length === 0 || bars.length < countBack) {
        onResult([], {
          noData: true,
        });

        return;
      }

      if (firstDataRequest) {
        onResult(
          bars.map((bar) => ({
            ...bar,
            time: bar.time * 1000,
          })),
          {
            noData: false,
          }
        );
      }
    } catch (error) {
      onError((error as Error).message);
    }
  },

  subscribeBars() {},

  unsubscribeBars: () => {},
});
