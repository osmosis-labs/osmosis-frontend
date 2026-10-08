import { renderHook } from "@testing-library/react";

import { usePreviousWhen } from "../use-previous-when";

type Props = { value: number | undefined; key?: string };

const accept = (v: number | undefined) => v !== undefined;

const render = (initialProps: Props) =>
  renderHook(({ value, key }: Props) => usePreviousWhen(value, accept, key), {
    initialProps,
  });

describe("usePreviousWhen", () => {
  it("holds the last accepted value while later values are rejected", () => {
    const { result, rerender } = render({ value: 1 });
    rerender({ value: undefined });
    expect(result.current).toBe(1);
  });

  it("behaves as before when no resetKey is given", () => {
    const { result, rerender } = render({ value: 1 });
    rerender({ value: 2 });
    rerender({ value: undefined });
    expect(result.current).toBe(2);
  });

  it("never serves a value held under a different resetKey", () => {
    const { result, rerender } = render({ value: 1, key: "out-given-in" });
    rerender({ value: undefined, key: "out-given-in" });
    expect(result.current).toBe(1);

    // Switching key while the new key's first value loads returns nothing,
    // including on the very first render after the switch.
    rerender({ value: undefined, key: "in-given-out" });
    expect(result.current).toBeUndefined();

    rerender({ value: 5, key: "in-given-out" });
    rerender({ value: undefined, key: "in-given-out" });
    expect(result.current).toBe(5);

    // Switching back does not resurrect the value from the first key.
    rerender({ value: undefined, key: "out-given-in" });
    expect(result.current).toBeUndefined();
  });
});
