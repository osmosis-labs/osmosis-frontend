import type { Asset } from "@osmosis-labs/types";

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
 * sibling variant (same `variantGroupKey`) whose own `external_interface`
 * carries the same provider name, so the caller can convert alloy -> variant
 * before opening the URL.
 *
 * Returns `undefined` when:
 * - the from-asset is not an alloy, or
 * - no sibling variant carries an `external_interface` with that provider name.
 *
 * Purely data-driven via the alloy's variant group; no per-site hardcoding. The
 * matched variant must not be the alloy itself.
 */
export function resolveExternalUrlConvertVariant({
  urlProviderName,
  alloy,
  assets,
}: {
  urlProviderName: string;
  /** The from-asset of the withdrawal (the alloy candidate). */
  alloy: Pick<
    Asset,
    "coinMinimalDenom" | "variantGroupKey" | "isAlloyed"
  > | null;
  /** All asset-list assets (flattened). */
  assets: Asset[];
}): ExternalUrlConvertVariant | undefined {
  if (!alloy?.isAlloyed || !alloy.variantGroupKey) return undefined;

  const variant = assets.find(
    (asset) =>
      asset.variantGroupKey === alloy.variantGroupKey &&
      asset.coinMinimalDenom !== alloy.coinMinimalDenom &&
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
