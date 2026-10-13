import { act, renderHook } from "@testing-library/react";

import { useNow } from "~/hooks/use-now";

describe("useNow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00.400Z"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the current time floored to the second", () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toBe(Date.parse("2026-01-01T00:00:00.000Z"));
  });

  it("advances on each whole-second boundary", () => {
    const { result } = renderHook(() => useNow());
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(result.current).toBe(Date.parse("2026-01-01T00:00:01.000Z"));
    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(Date.parse("2026-01-01T00:00:02.000Z"));
  });

  it("stops ticking once every subscriber unmounts", () => {
    const first = renderHook(() => useNow());
    const second = renderHook(() => useNow());
    first.unmount();
    expect(jest.getTimerCount()).toBe(1);
    second.unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
