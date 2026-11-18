import { renderHook } from "@testing-library/react";

import { useDeepMemo } from "~/hooks/use-deep-memo";
import { useLatestWhen } from "~/hooks/use-latest-when";

describe("render-safe memo hooks", () => {
  it("returns the current value when it qualifies, otherwise the latest one that did", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useLatestWhen(value, (next) => next % 2 === 0),
      { initialProps: { value: 1 } }
    );
    expect(result.current).toBeUndefined();
    rerender({ value: 2 });
    expect(result.current).toBe(2);
    rerender({ value: 3 });
    expect(result.current).toBe(2);
    rerender({ value: 4 });
    expect(result.current).toBe(4);
    rerender({ value: 5 });
    expect(result.current).toBe(4);
  });

  it("deeply compares dependencies without treating an undefined memo result as uninitialized", () => {
    const factory = jest.fn(() => undefined);
    const { result, rerender } = renderHook(
      ({ dependencies }) => useDeepMemo(factory, dependencies),
      { initialProps: { dependencies: [{ value: 1 }] } }
    );
    expect(result.current).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);
    rerender({ dependencies: [{ value: 1 }] });
    expect(factory).toHaveBeenCalledTimes(1);
    rerender({ dependencies: [{ value: 2 }] });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("returns the recomputed value on the render where dependencies change", () => {
    const { result, rerender } = renderHook(
      ({ n }) => useDeepMemo(() => ({ doubled: n * 2 }), [{ n }]),
      { initialProps: { n: 1 } }
    );
    const first = result.current;
    rerender({ n: 1 });
    expect(result.current).toBe(first);
    rerender({ n: 3 });
    expect(result.current).toEqual({ doubled: 6 });
  });

  it("preserves null memo results", () => {
    const { result } = renderHook(() => useDeepMemo(() => null, []));
    expect(result.current).toBeNull();
  });
});
