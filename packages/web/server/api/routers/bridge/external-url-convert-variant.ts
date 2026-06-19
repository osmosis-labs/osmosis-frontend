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
 * Membership gating (REQUIRED): the matched variant MUST be a true constituent
 * of the alloy's transmuter pool — i.e. its `coinMinimalDenom` is in
 * `memberDenoms` (read from `get_total_pool_liquidity` on `alloy.contract`).
 * `variantGroupKey` alone is a display grouping, not pool membership: a grouped
 * sibling that is not pooled cannot be obtained by converting the alloy, so
 * pre-selecting it would instruct a transmuter swap the pool rejects. This
 * helper drives an action (the convert), so the gate is correctness-critical.
 *
 * Returns `undefined` when:
 * - the from-asset is not an alloy, or
 * - no pooled member variant carries an `external_interface` with that provider
 *   name.
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

  const variant = assets.find(
    (asset) =>
      asset.variantGroupKey === alloy.variantGroupKey &&
      asset.coinMinimalDenom !== alloy.coinMinimalDenom &&
      !asset.isAlloyed &&
      memberDenoms.has(asset.coinMinimalDenom) &&
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
