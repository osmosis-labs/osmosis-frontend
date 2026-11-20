import { act, renderHook } from "@testing-library/react";

import {
  useBookPriceSelection,
  WidgetPair,
} from "~/components/trade-tool/use-book-price-selection";

const BTC = "factory/btc";
const ATOM = "ibc/atom";
const USDC = "ibc/usdc";

const btcBookPrice = {
  price: "60000",
  baseDenom: BTC,
  quoteDenom: USDC,
  poolId: "1930",
};

describe("useBookPriceSelection", () => {
  it("applies a book price to the pair it was picked on", () => {
    const { result } = renderHook(() =>
      useBookPriceSelection({ base: BTC, quote: USDC })
    );
    act(() => result.current.selectBookPrice(btcBookPrice));
    expect(result.current.externalOrderPrice).toBe("60000");
  });

  it("does not apply a price from one pair after switching pair and toggling Buy/Sell", () => {
    const { result, rerender } = renderHook(
      (pair: WidgetPair) => useBookPriceSelection(pair),
      { initialProps: { base: BTC, quote: USDC } as WidgetPair }
    );
    act(() => result.current.selectBookPrice(btcBookPrice));

    // Select ATOM.
    rerender({ base: ATOM, quote: USDC });
    expect(result.current.externalOrderPrice).toBe("");

    // Switch Buy -> Sell: the pair is unknown while the new form mounts,
    // then the form reports ATOM/USDC again.
    rerender({ base: undefined, quote: undefined });
    rerender({ base: ATOM, quote: USDC });
    expect(result.current.externalOrderPrice).toBe("");

    // Even going back to BTC does not resurrect the old selection.
    rerender({ base: BTC, quote: USDC });
    expect(result.current.externalOrderPrice).toBe("");
  });

  it("ignores a price from a book quoted the other way round", () => {
    const { result } = renderHook(() =>
      useBookPriceSelection({ base: USDC, quote: BTC })
    );
    act(() => result.current.selectBookPrice(btcBookPrice));
    expect(result.current.externalOrderPrice).toBe("");
  });

  it("ignores a price from another pool when the widget is locked to one", () => {
    const { result } = renderHook(() =>
      useBookPriceSelection({ base: BTC, quote: USDC, poolId: "1904" })
    );
    act(() => result.current.selectBookPrice(btcBookPrice));
    expect(result.current.externalOrderPrice).toBe("");
  });
});
