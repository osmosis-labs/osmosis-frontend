import { renderHook } from "@testing-library/react";

import { useDeepMemo } from "~/hooks/use-deep-memo";
import { usePreviousWhen } from "~/hooks/use-previous-when";

describe("explicitly initialized memo refs", () => {
  it("starts previous values as undefined and updates only when the predicate passes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePreviousWhen(value, (next) => next % 2 === 0),
      { initialProps: { value: 1 } }
    );
    expect(result.current).toBeUndefined();
    rerender({ value: 2 });
    expect(result.current).toBeUndefined();
    rerender({ value: 3 });
    expect(result.current).toBe(2);
    rerender({ value: 5 });
    expect(result.current).toBe(2);
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

  it("preserves null memo results", () => {
    const { result } = renderHook(() => useDeepMemo(() => null, []));
    expect(result.current).toBeNull();
  });
});
