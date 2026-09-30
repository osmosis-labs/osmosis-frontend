import type { Asset } from "@osmosis-labs/types";

/** The variant a third-party external-interface site recognises in place of the
 *  alloy the user holds. */
export interface ExternalUrlConvertVariant {
  coinMinimalDenom: string;
  symbol: string;
}

/**
 * For an alloy withdrawal, a third-party site (e.g. Sologenic for allXRP)
 * only accepts a specific variant (XRP.coreum), not the alloy. Resolves the
 * sibling variant whose `external_interface` has the given provider name, so the
 * caller can convert alloy -> variant before opening the URL.
 *
 * When membership is known, only a true pool member qualifies: converting into
 * a grouped sibling outside the pool would be rejected by the transmuter.
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

  // An empty `memberDenoms` means membership is unknown (failed pool read), not
  // "no members". The alloy-own link is kept in that case, so fall back to the
  // `variantGroupKey` family to keep the pre-convert firing; otherwise the
  // holder lands on a site that rejects the alloy (MTN-146).
  const membershipResolved = memberDenoms.size > 0;

  const variant = assets.find(
    (asset) =>
      asset.variantGroupKey === alloy.variantGroupKey &&
      asset.coinMinimalDenom !== alloy.coinMinimalDenom &&
      !asset.isAlloyed &&
      (!membershipResolved || memberDenoms.has(asset.coinMinimalDenom)) &&
      // Converting into a withdrawal-halted variant would strand the user.
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
