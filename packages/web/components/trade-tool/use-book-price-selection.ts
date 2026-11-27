import { useCallback, useState } from "react";

/** A price picked from an order book row, with the book it came from. */
export interface BookPriceSelection {
  /** Quote per base, in the book's own orientation. */
  price: string;
  baseDenom: string;
  quoteDenom: string;
  poolId: string;
}

/** The pair the widget currently has selected, as minimal denoms. */
export interface WidgetPair {
  base?: string;
  quote?: string;
  /** Set when the widget is locked to one orderbook pool. */
  poolId?: string;
}

/**
 * A book price is only meaningful for the exact pair, in the same
 * orientation, it was picked on. A price from another pair, or from a book
 * quoted the other way round, must never reach the limit price.
 */
export function bookPriceForPair(
  selection: BookPriceSelection | undefined,
  pair: WidgetPair
): string {
  if (!selection || !pair.base || !pair.quote) return "";
  if (selection.baseDenom !== pair.base) return "";
  if (selection.quoteDenom !== pair.quote) return "";
  if (pair.poolId && selection.poolId !== pair.poolId) return "";
  return selection.price;
}

/**
 * Holds the last price clicked in an order book and exposes it as the limit
 * price only while the widget's pair matches the book it came from. The
 * selection is dropped as soon as the pair (or pool) changes, so a remounted
 * form (e.g. after switching Buy and Sell) cannot pick up a price from an
 * earlier pair.
 */
export function useBookPriceSelection(pair: WidgetPair) {
  const [selection, setSelection] = useState<BookPriceSelection>();

  const pairKey = `${pair.base ?? ""}|${pair.quote ?? ""}|${pair.poolId ?? ""}`;
  const [selectionPairKey, setSelectionPairKey] = useState(pairKey);
  if (selectionPairKey !== pairKey) {
    setSelectionPairKey(pairKey);
    setSelection(undefined);
  }

  const selectBookPrice = useCallback(
    (next: BookPriceSelection) => setSelection(next),
    []
  );

  return {
    externalOrderPrice: bookPriceForPair(
      selectionPairKey === pairKey ? selection : undefined,
      pair
    ),
    selectBookPrice,
  };
}
