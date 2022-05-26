import { Dec } from "@keplr-wallet/unit";

/** Sorts assets by positive fiat value first, then by order in config (as received). */
export function initialAssetsSort<TBalance extends { fiatValueRaw?: string }>(
  ibcBalances: TBalance[]
): TBalance[] {
  const posBals = ibcBalances.filter((b) => b.fiatValueRaw !== "0");
  const posBalsSorted = posBals.sort((a, b) => {
    if (!a.fiatValueRaw || !b.fiatValueRaw) return 0;
    const aDec = new Dec(a.fiatValueRaw);
    const bDec = new Dec(b.fiatValueRaw);
    if (aDec.gt(bDec)) {
      return -1;
    } else if (aDec.lt(bDec)) {
      return 1;
    }
    return 0;
  });

  return [
    ...posBalsSorted,
    ...ibcBalances.filter((b) => b.fiatValueRaw === "0"),
  ];
}
