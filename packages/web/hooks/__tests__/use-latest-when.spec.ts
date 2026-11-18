import { renderHook } from "@testing-library/react";

import { useLatestWhen } from "../use-latest-when";

type Props = { value: number | undefined; key?: string };

const accept = (v: number | undefined) => v !== undefined;

const render = (initialProps: Props) =>
  renderHook(({ value, key }: Props) => useLatestWhen(value, accept, key), {
    initialProps,
  });

describe("useLatestWhen", () => {
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

  it("discards the held value when the key changes, even if it changes back", () => {
    const { result, rerender } = render({ value: 1, key: "out-given-in" });
    rerender({ value: undefined, key: "in-given-out" });
    expect(result.current).toBeUndefined();

    rerender({ value: undefined, key: "out-given-in" });
    expect(result.current).toBeUndefined();
  });
});
