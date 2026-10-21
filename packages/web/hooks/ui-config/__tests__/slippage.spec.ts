import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import { Dec } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import { useSlippageConfig } from "~/hooks/ui-config/use-slippage-config";

/** The same sequence of operations on the legacy MobX config and on the hook state. */
const manualInputs = [
  "1",
  ".5",
  "0.5",
  "100",
  "99.99",
  "-1",
  "abc",
  "",
  "0",
  "1e2",
  "3.",
];

describe("useSlippageConfig", () => {
  it("starts on the first preset once mounted, with the given default", () => {
    const { result } = renderHook(() =>
      useSlippageConfig({ defaultSlippage: "0.1" })
    );
    expect(result.current.isManualSlippage).toBe(false);
    expect(result.current.slippage.toDec().toString()).toBe(
      "0.005000000000000000"
    );
    expect(result.current.defaultManualSlippage).toBe("0.1");
    expect(result.current.selectableSlippages.map((s) => s.selected)).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });

  it("keeps its setters stable across state changes", () => {
    const { result } = renderHook(() => useSlippageConfig());
    const {
      select,
      setManualSlippage,
      setDefaultSlippage,
      setIsManualSlippage,
    } = result.current;
    act(() => result.current.setManualSlippage("2"));
    expect(result.current.select).toBe(select);
    expect(result.current.setManualSlippage).toBe(setManualSlippage);
    expect(result.current.setDefaultSlippage).toBe(setDefaultSlippage);
    expect(result.current.setIsManualSlippage).toBe(setIsManualSlippage);
  });

  it.each(manualInputs)(
    "matches the legacy config for manual input %j",
    (input) => {
      const legacy = new ObservableSlippageConfig();
      // what the legacy hook did on mount
      legacy.select(0);
      const { result } = renderHook(() => useSlippageConfig());
      // unparsable input makes the legacy config throw before mutating anything
      try {
        legacy.setManualSlippage(input);
      } catch {}
      act(() => result.current.setManualSlippage(input));

      expect(result.current.manualSlippageStr).toBe(legacy.manualSlippageStr);
      expect(result.current.isManualSlippage).toBe(legacy.isManualSlippage);
      expect(result.current.slippage.toDec().toString()).toBe(
        legacy.slippage.toDec().toString()
      );
      expect(result.current.manualSlippageError?.constructor).toBe(
        legacy.manualSlippageError?.constructor
      );
    }
  );

  it("applies a valid manual slippage as a rate", () => {
    const { result } = renderHook(() => useSlippageConfig());
    act(() => result.current.setManualSlippage(".5"));
    expect(result.current.isManualSlippage).toBe(true);
    expect(result.current.manualSlippageStr).toBe("0.5");
    expect(result.current.slippage.toDec().toString()).toBe(
      "0.005000000000000000"
    );
    act(() => result.current.setManualSlippage("12.5"));
    expect(result.current.slippage.toDec().toString()).toBe(
      "0.125000000000000000"
    );
    expect(result.current.manualSlippageError).toBeUndefined();
  });

  it("ignores out of range and non numeric manual input", () => {
    const { result } = renderHook(() => useSlippageConfig());
    act(() => result.current.setManualSlippage("2"));
    for (const bad of ["100", "101", "-1", "abc"]) {
      act(() => result.current.setManualSlippage(bad));
      expect(result.current.manualSlippageStr).toBe("2");
    }
  });

  it("ignores empty manual input, as the legacy config rejected it", () => {
    const { result } = renderHook(() => useSlippageConfig());
    act(() => result.current.setManualSlippage("2"));
    act(() => result.current.setManualSlippage(""));
    expect(result.current.manualSlippageStr).toBe("2");
  });

  it("select ignores out of range indexes and leaves manual mode", () => {
    const { result } = renderHook(() => useSlippageConfig());
    act(() => result.current.setManualSlippage("2"));
    act(() => result.current.select(9));
    expect(result.current.isManualSlippage).toBe(true);
    act(() => result.current.select(2));
    expect(result.current.isManualSlippage).toBe(false);
    expect(result.current.slippage.toDec().toString()).toBe(
      "0.030000000000000000"
    );
  });

  it("setIsManualSlippage(true) brings back the typed manual value", () => {
    const { result } = renderHook(() => useSlippageConfig());
    act(() => result.current.setManualSlippage("7"));
    act(() => result.current.select(1));
    act(() => result.current.setIsManualSlippage(true));
    expect(result.current.slippage.toDec().toString()).toBe(
      "0.070000000000000000"
    );
  });

  it("matches the legacy getSmallestSlippage", () => {
    const legacy = new ObservableSlippageConfig();
    const { result } = renderHook(() => useSlippageConfig());
    for (const v of ["0.001", "0.005", "0.006", "0.03", "0.05", "0.2"]) {
      const [li, ld] = legacy.getSmallestSlippage(new Dec(v));
      const [i, d] = result.current.getSmallestSlippage(new Dec(v));
      expect(i).toBe(li);
      expect(d.toString()).toBe(ld.toString());
    }
  });
});
