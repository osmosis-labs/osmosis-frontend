import { Dec } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import { useSlippageConfig } from "~/hooks/ui-config/use-slippage-config";

/** Regression inputs covering accepted, rejected and normalized manual values. */
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

  it.each(manualInputs)("handles manual input %j", (input) => {
    const { result } = renderHook(() => useSlippageConfig());
    act(() => result.current.setManualSlippage(input));

    // Expectations captured from the legacy config before its removal.
    expect({
      manualSlippageStr: result.current.manualSlippageStr,
      isManualSlippage: result.current.isManualSlippage,
      slippage: result.current.slippage.toDec().toString(),
      error: result.current.manualSlippageError?.constructor.name,
    }).toMatchSnapshot();
  });

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

  it.each([
    ["0.001", 0, "0.005000000000000000"],
    ["0.005", 0, "0.005000000000000000"],
    ["0.006", 1, "0.010000000000000000"],
    ["0.03", 2, "0.030000000000000000"],
    ["0.05", 3, "0.050000000000000000"],
    ["0.2", 3, "0.050000000000000000"],
  ])("selects the smallest preset for rate %s", (value, index, rate) => {
    const { result } = renderHook(() => useSlippageConfig());
    const [i, d] = result.current.getSmallestSlippage(new Dec(value));
    expect(i).toBe(index);
    expect(d.toString()).toBe(rate);
  });
});
