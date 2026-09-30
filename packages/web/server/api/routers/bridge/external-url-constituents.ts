import type {
  Asset,
  ExternalInterfaceBridgeTransferMethod,
} from "@osmosis-labs/types";

/**
 * `external_interface` transfer methods of the alloy's constituent variants,
 * so an alloy with no transfer methods of its own (e.g. allBTC) still has
 * external fallbacks. The caller dedupes against the alloy's own methods.
 *
 * Only true pool members (`memberDenoms`, from the transmuter pool) count:
 * `variantGroupKey` is a display grouping, and a grouped sibling outside the
 * pool (e.g. BTC.int3 for allBTC) can't be obtained from the alloy. An empty
 * set surfaces nothing.
 *
 * Constituents halted in `direction` are skipped. `disabled` ones are kept,
 * since a disabled asset is commonly routed through exactly this kind of
 * external flow.
 */
export function getAlloyConstituentExternalInterfaceMethods({
  alloy,
  assets,
  direction,
  memberDenoms,
}: {
  alloy:
    | Pick<Asset, "coinMinimalDenom" | "isAlloyed" | "variantGroupKey">
    | null
    | undefined;
  assets: Asset[];
  direction: "deposit" | "withdraw";
  /** The alloy's true pool-member coinMinimalDenoms (from the transmuter pool).
   *  A grouped variant not in this set is excluded — it is not redeemable from
   *  the alloy. */
  memberDenoms: Set<string>;
}): ExternalInterfaceBridgeTransferMethod[] {
  if (!alloy?.isAlloyed) return [];

  // A constituent's `variantGroupKey` is the alloy's `coinMinimalDenom`.
  const alloyDenom = alloy.coinMinimalDenom;

  return assets
    .filter(
      (asset) =>
        asset.variantGroupKey === alloyDenom &&
        asset.coinMinimalDenom !== alloyDenom &&
        !asset.isAlloyed &&
        memberDenoms.has(asset.coinMinimalDenom) &&
        !(direction === "withdraw" && asset.haltWithdrawals) &&
        !(direction === "deposit" && asset.haltDeposits)
    )
    .flatMap((variant) =>
      variant.transferMethods.filter(
        (method): method is ExternalInterfaceBridgeTransferMethod =>
          method.type === "external_interface"
      )
    );
}

/**
 * Provider names of the alloy's own `external_interface` methods that should be
 * hidden because the variant behind them is gated out (not a pool member, or
 * halted in `direction`). Alloy-own methods carry no halt flag or variant link,
 * so they are correlated to siblings by provider name. A name is suppressed only
 * if no reachable sibling also carries it.
 */
export function getSuppressedAlloyExternalInterfaceNames({
  alloy,
  assets,
  direction,
  memberDenoms,
}: {
  alloy:
    | Pick<Asset, "coinMinimalDenom" | "isAlloyed" | "variantGroupKey">
    | null
    | undefined;
  assets: Asset[];
  direction: "deposit" | "withdraw";
  memberDenoms: Set<string>;
}): Set<string> {
  if (!alloy?.isAlloyed) return new Set();

  // An empty set means membership is unknown (failed pool read), not "no
  // members". Suppress nothing rather than strip a link that may still work.
  if (memberDenoms.size === 0) return new Set();

  const alloyDenom = alloy.coinMinimalDenom;

  const isReachable = (asset: Asset) =>
    memberDenoms.has(asset.coinMinimalDenom) &&
    !(direction === "withdraw" && asset.haltWithdrawals) &&
    !(direction === "deposit" && asset.haltDeposits);

  const siblings = assets.filter(
    (asset) =>
      asset.variantGroupKey === alloyDenom &&
      asset.coinMinimalDenom !== alloyDenom &&
      !asset.isAlloyed
  );

  const externalNames = (asset: Asset): string[] =>
    asset.transferMethods
      .filter(
        (method): method is ExternalInterfaceBridgeTransferMethod =>
          method.type === "external_interface"
      )
      .map((method) => method.name);

  // Names still reachable via at least one good sibling — never suppress these.
  const reachableNames = new Set(
    siblings.filter(isReachable).flatMap(externalNames)
  );

  // Names that appear on a gated sibling and nowhere reachable.
  const suppressed = new Set<string>();
  for (const sibling of siblings) {
    if (isReachable(sibling)) continue;
    for (const name of externalNames(sibling)) {
      if (!reachableNames.has(name)) suppressed.add(name);
    }
  }

  return suppressed;
}
