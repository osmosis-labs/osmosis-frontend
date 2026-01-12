/* eslint-disable import/no-extraneous-dependencies */
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { renderHook } from "@testing-library/react";

import {
  DUST_THRESHOLD,
  useUserSettingsStore,
} from "../../../stores/user-settings-store";
import { useHideDustUserSetting } from "../use-hide-dust-filter";

// Helper to create PricePretty values
const createPrice = (value: number) =>
  new PricePretty(
    { currency: "usd", symbol: "$", maxDecimals: 2 },
    new Dec(value)
  );

describe("useHideDustUserSetting", () => {
  beforeEach(() => {
    // Reset store to initial state
    useUserSettingsStore.setState({
      hideDust: false,
      hideBalances: false,
      language: "en",
      showUnverifiedAssets: false,
    });
  });

  it("should return all items when hideDust is false", () => {
    useUserSettingsStore.setState({ hideDust: false });

    const items = [
      { id: 1, value: createPrice(0.01) }, // Below threshold
      { id: 2, value: createPrice(0.05) }, // Above threshold
      { id: 3, value: createPrice(100) }, // Above threshold
    ];

    const { result } = renderHook(() =>
      useHideDustUserSetting(items, (item) => item.value)
    );

    expect(result.current).toHaveLength(3);
    expect(result.current.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("should filter items below threshold when hideDust is true", () => {
    useUserSettingsStore.setState({ hideDust: true });

    const items = [
      { id: 1, value: createPrice(0.01) }, // Below threshold (0.02)
      { id: 2, value: createPrice(0.02) }, // At threshold - should be included
      { id: 3, value: createPrice(0.05) }, // Above threshold
      { id: 4, value: createPrice(100) }, // Above threshold
    ];

    const { result } = renderHook(() =>
      useHideDustUserSetting(items, (item) => item.value)
    );

    // Item with 0.01 should be filtered out
    expect(result.current).toHaveLength(3);
    expect(result.current.map((item) => item.id)).toEqual([2, 3, 4]);
  });

  it("should keep items with undefined values regardless of hideDust", () => {
    useUserSettingsStore.setState({ hideDust: true });

    const items = [
      { id: 1, value: undefined },
      { id: 2, value: createPrice(0.01) }, // Below threshold
      { id: 3, value: createPrice(0.05) }, // Above threshold
    ];

    const { result } = renderHook(() =>
      useHideDustUserSetting(items, (item) => item.value)
    );

    // Item with undefined should be kept, item with 0.01 should be filtered
    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.id)).toEqual([1, 3]);
  });

  it("should update when hideDust setting changes", () => {
    const items = [
      { id: 1, value: createPrice(0.01) }, // Below threshold
      { id: 2, value: createPrice(0.05) }, // Above threshold
    ];

    const { result, rerender } = renderHook(() =>
      useHideDustUserSetting(items, (item) => item.value)
    );

    // Initially hideDust is false, all items should be present
    expect(result.current).toHaveLength(2);

    // Enable hideDust
    useUserSettingsStore.setState({ hideDust: true });
    rerender();

    // Now only items above threshold should be present
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe(2);
  });

  it("should use DUST_THRESHOLD constant", () => {
    // Verify the threshold is 0.02 as expected
    expect(Number(DUST_THRESHOLD.toString())).toBe(0.02);
  });
});
