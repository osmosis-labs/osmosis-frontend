import { Dec } from "@keplr-wallet/unit";

// TODO: Change this type from TBalance generic to SortableTableCell
/** Sorts assets by positive fiat value first, then by order in config (as received). */
export function initialAssetsSort<TBalance extends { fiatValueRaw?: Dec }>(
  ibcBalances: TBalance[]
): TBalance[] {
  const posBals = ibcBalances.filter((b) => !b.fiatValueRaw?.isZero());
  const posBalsSorted = posBals.sort((a, b) => {
    if (!a.fiatValueRaw || !b.fiatValueRaw) return 0;
    const aDec = a.fiatValueRaw;
    const bDec = b.fiatValueRaw;
    if (aDec.gt(bDec)) {
      return -1;
    } else if (aDec.lt(bDec)) {
      return 1;
    }
    return 0;
  });

  return [
    ...posBalsSorted,
    ...ibcBalances.filter((b) => b.fiatValueRaw?.isZero()),
  ];
}
