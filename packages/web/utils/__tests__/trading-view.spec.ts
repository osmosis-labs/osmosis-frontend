import { QueryClient } from "@tanstack/react-query";

import type { LibrarySymbolInfo, ResolutionString } from "~/public/tradingview";
import { historicalDatafeed } from "~/utils/trading-view";
import { setAssetsQueryDefaults } from "~/utils/trpc-cdn-cache";

jest.mock("~/utils/trpc", () => ({ api: {} }));

describe("historicalDatafeed.getBars", () => {
  it("refetches realtime bars despite the procedure's query defaults", async () => {
    const queryClient = new QueryClient();
    setAssetsQueryDefaults(queryClient);
    const queryFn = jest.fn().mockResolvedValue([]);

    // Mirrors tRPC's `utils.fetch`: the procedure key plus the caller's options.
    const apiUtils = {
      edge: {
        assets: {
          getAssetHistoricalPrice: {
            fetch: (input: unknown, opts?: object) =>
              queryClient.fetchQuery({
                ...opts,
                queryKey: [
                  ["edge", "assets", "getAssetHistoricalPrice"],
                  { input, type: "query" },
                ],
                queryFn,
              }),
          },
        },
      },
    } as unknown as Parameters<typeof historicalDatafeed>[0]["apiUtils"];
    const datafeed = historicalDatafeed({ apiUtils });

    const getBars = () =>
      datafeed.getBars(
        { name: "OSMO", base_name: ["uosmo"] } as LibrarySymbolInfo,
        "5" as ResolutionString,
        { countBack: 1, from: 0, to: 0, firstDataRequest: true },
        () => {},
        () => {}
      );

    await getBars();
    await getBars();

    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});
