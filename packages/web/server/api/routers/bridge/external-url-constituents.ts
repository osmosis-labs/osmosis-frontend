import type {
  Asset,
  ExternalInterfaceBridgeTransferMethod,
} from "@osmosis-labs/types";

// Sibling: `external-url-convert-variant.ts` picks ONE variant to pre-convert
// an alloy into before a third-party hand-off. This file is the other half:
// it aggregates the external bridge links of MANY constituent variants so an
// alloy with no transfer methods of its own still has fallbacks. Both feed
// `getExternalUrls` and both expand the same `variantGroupKey` family; that
// shared expansion is slated to collapse into the unified resolver.

/**
 * Given an alloy denom, return the `external_interface` transfer methods of all
 * its constituent variants (non-alloyed assets whose `variantGroupKey` equals
 * the alloy's `coinMinimalDenom`), excluding the alloy's own entry.
 *
 * Kept as a small, single-purpose seam: the variant-family lookup is done
 * inline here, but isolated behind a named function so a future shared
 * alloy -> variant resolver can replace the body with a single delegation
 * without changing any caller. Mirrors the shape of
 * `resolveExternalUrlConvertVariant` so the two external-URL consumers stay
 * consistent.
 *
 * Why this exists: `getExternalUrls` previously read `external_interface`
 * methods only from the from/to asset (the alloy itself on a withdraw). An
 * alloy like allBTC carries an empty `transferMethods`, so if its only in-app
 * quote route went down the user was stranded with no external fallback even
 * though the constituents (WBTC.eth, nBTC, ...) carry perfectly good
 * `external_interface` URLs. Aggregating the constituents closes that gap
 * without per-asset assetlist hedges.
 *
 * Halt-aware: a constituent whose relevant direction is kill-switched
 * (`haltWithdrawals` on a withdraw, `haltDeposits` on a deposit) is skipped, so
 * a down variant's dead bridge link is never surfaced. `disabled` is NOT a skip
 * reason: a disabled asset commonly routes the user through exactly this kind of
 * custom external flow, so its `external_interface` is intentional. `unstable`
 * is warning-only and does not gate the UI, so unstable constituents are kept.
 *
 * Membership gating (REQUIRED): `variantGroupKey` is a display/grouping key, NOT
 * alloy pool membership. A variant can share the alloy's `variantGroupKey` while
 * not being a constituent of the alloy's transmuter pool, so the user cannot
 * convert the alloy into it 1:1 and any route to it is a dead end. Concrete live
 * example: BTC.int3 shares the allBTC group key but is NOT in the allBTC pool.
 * The caller therefore must pass `memberDenoms` — the alloy's true pool-member
 * denom set, read from the CW pool contract (`get_total_pool_liquidity` on
 * `alloy.contract`, via `getCachedTransmuterTotalPoolLiquidity`). Only variants
 * in that set are surfaced. Pass an empty set to surface nothing; the caller
 * should only invoke this once it has resolved membership (fallback path).
 *
 * Scope (separate from membership): even among true members, this returns every
 * viable one, including ones that bridge to a differently-wrapped form of the
 * asset (e.g. EVM-wrapped WBTC variants via Squid). Narrowing a "withdraw BTC"
 * fallback to same-asset exits only is a canonical-variant judgment with no
 * single discriminating field in the asset list, so it is left to the unified
 * resolver.
 *
 * The returned methods are not deduped among themselves; the caller is
 * responsible for collapsing duplicates (e.g. a provider that appears on both
 * the alloy and a constituent).
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

  // For an alloy, `variantGroupKey === coinMinimalDenom`; a constituent's
  // `variantGroupKey` points back at the alloy's `coinMinimalDenom`. Match on
  // the alloy's own denom so we never depend on the alloy carrying its own
  // counterparty/transfer data. Exclude the alloy's own entry and any nested
  // alloy so only true variants contribute, then gate by actual pool membership
  // so we never surface a group-sibling the user cannot obtain from the alloy.
  const alloyDenom = alloy.coinMinimalDenom;

  return assets
    .filter(
      (asset) =>
        asset.variantGroupKey === alloyDenom &&
        asset.coinMinimalDenom !== alloyDenom &&
        !asset.isAlloyed &&
        memberDenoms.has(asset.coinMinimalDenom) &&
        // Skip a constituent whose active direction is kill-switched; its
        // bridge link is dead right now.
        !(direction === "withdraw" && asset.haltWithdrawals) &&
        !(direction === "deposit" && asset.haltDeposits)
    )
    .flatMap(
      (variant) =>
        variant.transferMethods.filter(
          (method) => method.type === "external_interface"
        ) as ExternalInterfaceBridgeTransferMethod[]
    );
}
