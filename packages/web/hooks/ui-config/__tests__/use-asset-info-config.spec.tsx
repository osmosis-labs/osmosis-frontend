import { act, waitFor } from "@testing-library/react";

import { server, trpcQuery } from "~/__tests__/msw";
import { renderHookWithProviders } from "~/__tests__/test-utils";

import {
  useAssetInfoConfig,
  useAssetInfoHover,
} from "../use-asset-info-config";

const nowSec = () => Math.floor(Date.now() / 1000);

const point = (time: number, close: number) => ({
  time,
  close,
  high: close,
  low: close,
  open: close,
  volume: 1,
});

function useConfigWithHover(denom: string) {
  const config = useAssetInfoConfig(denom, `u${denom}`);
  return { config, hover: useAssetInfoHover(config) };
}

describe("useAssetInfoConfig", () => {
  beforeEach(() => {
    server.use(
      trpcQuery("edge.assets.getAssetHistoricalPrice", () => [
        point(nowSec() - 120, 1),
        point(nowSec() - 60, 2),
        point(nowSec() + 3600, 99), // future point is dropped
      ]),
      trpcQuery("edge.assets.getAssetLatestPricePoint", () => ({
        time: nowSec() - 10,
      }))
    );
  });

  it("starts from the default range, data type and mode", () => {
    const { result } = renderHookWithProviders(() => useAssetInfoConfig("a"));
    expect(result.current.historicalRange).toBe("7d");
    expect(result.current.dataType).toBe("price");
    expect(result.current.mode).toBe("simple");
    expect(result.current.isHistoricalDataLoading).toBe(true);
  });

  it("exposes loaded, non-future points and the last tick", async () => {
    const { result } = renderHookWithProviders(() => useAssetInfoConfig("a"));

    await waitFor(() =>
      expect(result.current.isHistoricalDataLoading).toBe(false)
    );
    expect(result.current.historicalChartData.map((p) => p.close)).toEqual([
      1, 2,
    ]);
    expect(result.current.lastChartData?.close).toBe(2);
    expect(result.current.historicalChartUnavailable).toBe(false);
    expect(result.current.historicalChartStale).toBe(false);
  });

  it("updates range, data type, mode and zoom through setters", async () => {
    const { result } = renderHookWithProviders(() => useAssetInfoConfig("a"));
    const { setHistoricalRange } = result.current;

    act(() => result.current.setHistoricalRange("1d"));
    act(() => result.current.setDataType("volume"));
    act(() => result.current.setMode("advanced"));

    expect(result.current.historicalRange).toBe("1d");
    expect(result.current.dataType).toBe("volume");
    expect(result.current.mode).toBe("advanced");
    // setters stay referentially stable across state changes
    expect(result.current.setHistoricalRange).toBe(setHistoricalRange);
  });

  it("keeps hover state out of the config and formats it", () => {
    const { result } = renderHookWithProviders(() => useConfigWithHover("a"));
    const configBefore = result.current.config;
    expect(result.current.hover.hoverData).toBeUndefined();
    expect(result.current.hover.hoverDate).toBeNull();

    act(() => result.current.config.setHoverData(12.5, 1700000000 as never));

    expect(result.current.hover.hoverData?.toDec().toString()).toBe(
      "12.500000000000000000"
    );
    expect(result.current.hover.hoverDate).toEqual(expect.any(String));
    // hovering must not recreate the config object
    expect(result.current.config).toBe(configBefore);

    act(() => result.current.config.setHoverData(undefined, undefined));
    expect(result.current.hover.hoverData).toBeUndefined();
  });

  it("resets chart state when the asset changes", () => {
    const { result, rerender } = renderHookWithProviders(
      ({ denom }: { denom: string }) => useAssetInfoConfig(denom),
      { initialProps: { denom: "a" } }
    );

    act(() => result.current.setHistoricalRange("1y"));
    expect(result.current.historicalRange).toBe("1y");

    rerender({ denom: "b" });
    expect(result.current.historicalRange).toBe("7d");
  });
});
