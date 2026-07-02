import type { Asset } from "@osmosis-labs/types";

// Sibling: `external-url-constituents.ts` aggregates the external bridge links
// of MANY constituent variants as fallbacks. This file is the other half: it
// picks ONE variant to pre-convert the alloy into before a third-party
// hand-off. Both feed `getExternalUrls` and both expand the same
// `variantGroupKey` family; that shared expansion is slated to collapse into
// the unified resolver.

/** The variant a third-party external-interface site recognises in place of the
 *  alloy the user holds. */
export interface ExternalUrlConvertVariant {
  coinMinimalDenom: string;
  symbol: string;
}

/**
 * For an alloy withdrawal, a third-party external-interface site (e.g.
 * Sologenic for allXRP, Picasso for allSOL) only recognises a specific bridge
 * *variant* (XRP.coreum, SOL.pica), not the alloy denom the user holds. Given
 * the external URL's provider name and the alloy being withdrawn, resolve the
 * sibling variant whose own `external_interface` carries the same provider name,
 * so the caller can convert alloy -> variant before opening the URL.
 *
 * Membership gating (when membership is RESOLVED): the matched variant must be
 * a true constituent of the alloy's transmuter pool, i.e. its
 * `coinMinimalDenom` is in `memberDenoms` (read from `get_total_pool_liquidity`
 * on `alloy.contract`). `variantGroupKey` alone is a display grouping, not pool
 * membership: a grouped sibling that is not pooled cannot be obtained by
 * converting the alloy, so pre-selecting it would instruct a transmuter swap the
 * pool rejects. This helper drives an action (the convert), so when membership
 * is known the gate is correctness-critical.
 *
 * When membership is UNKNOWN (an empty `memberDenoms`, from a failed pool read
 * or a missing `contract`) the gate is bypassed and the target is resolved from
 * the `variantGroupKey` family instead (best-effort). This mirrors the alloy-own
 * suppression, which also no-ops on an unknown set so the alloy's own connector
 * link is kept rather than stripped; the pre-convert is what makes that kept
 * link usable, so it must fire too. (The constituent aggregator surfaces nothing
 * on an unknown set, but the alloy-own link path is exactly the one that still
 * needs a convert.) See the inline note on `membershipResolved` below for why
 * stripping the pre-convert here would strand the alloy holder (the MTN-146
 * case). The halt + sibling + provider-name checks always apply.
 *
 * Returns `undefined` when:
 * - the from-asset is not an alloy, or
 * - no eligible variant carries an `external_interface` with that provider name
 *   (eligible = a pooled member when membership is resolved, else any pooled-or-
 *   grouped sibling when membership is unknown; never the alloy itself, a nested
 *   alloy, or a withdrawals-halted variant).
 *
 * Data-driven via the alloy's pool membership + variant group; no per-site
 * hardcoding. The matched variant must not be the alloy itself or a nested
 * alloy.
 */
export function resolveExternalUrlConvertVariant({
  urlProviderName,
  alloy,
  assets,
  memberDenoms,
}: {
  urlProviderName: string;
  /** The from-asset of the withdrawal (the alloy candidate). */
  alloy: Pick<
    Asset,
    "coinMinimalDenom" | "variantGroupKey" | "isAlloyed"
  > | null;
  /** All asset-list assets (flattened). */
  assets: Asset[];
  /** The alloy's true pool-member coinMinimalDenoms (from the transmuter pool).
   *  Only a member can be a valid convert target. */
  memberDenoms: Set<string>;
}): ExternalUrlConvertVariant | undefined {
  if (!alloy?.isAlloyed || !alloy.variantGroupKey) return undefined;

  // An empty `memberDenoms` means membership is UNKNOWN (a failed transmuter
  // pool read or a missing `contract`), not "no members". In that case the
  // constituent link aggregator and the alloy-own suppression also degrade to
  // best-effort (they surface the link rather than strip it), so the convert
  // must degrade the same way: resolve the target from the `variantGroupKey`
  // family so the pre-convert still fires. Otherwise the link opens with no
  // pre-convert and strands the alloy holder on a site that only accepts the
  // variant — the exact case MTN-146 exists to prevent. When membership IS
  // resolved, gate strictly on it (only a true member is a valid convert
  // target). The halt + sibling + provider-name checks always apply.
  const membershipResolved = memberDenoms.size > 0;

  const variant = assets.find(
    (asset) =>
      asset.variantGroupKey === alloy.variantGroupKey &&
      asset.coinMinimalDenom !== alloy.coinMinimalDenom &&
      !asset.isAlloyed &&
      (!membershipResolved || memberDenoms.has(asset.coinMinimalDenom)) &&
      // The convert always precedes a withdrawal, so never target a variant
      // whose withdrawals are kill-switched: converting into it would strand the
      // user on a halted denom. Mirrors the halt skip in the constituent
      // link aggregator (external-url-constituents.ts) so the surfaced link and
      // the convert target can't diverge when a halted and a live member share a
      // provider name.
      !asset.haltWithdrawals &&
      asset.transferMethods.some(
        (method) =>
          method.type === "external_interface" &&
          method.name === urlProviderName
      )
  );

  if (!variant) return undefined;

  return {
    coinMinimalDenom: variant.coinMinimalDenom,
    symbol: variant.symbol,
  };
}
