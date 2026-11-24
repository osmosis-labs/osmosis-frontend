import type { Asset, AssetList, Chain } from "@osmosis-labs/types";

import { getImageRelativeFilePath } from "~/config/keplr-chain";

/**
 * Strips server-only fields (`counterparty`, `transferMethods`, `logoURIs`,
 * `listingDate`, `sortWith`, `pegMechanism`, `preview`,
 * `chainName`) from the generated asset list so the browser bundle only ships
 * fields actually read by client lookup helpers, Keplr chain derivation, and
 * CosmosKit (`~65%` smaller raw JS).
 */
export function toClientAssetLists(assetLists: AssetList[]): AssetList[] {
  return assetLists.map((list) => ({
    chain_name: list.chain_name,
    chain_id: list.chain_id,
    assets: list.assets.map((asset) => {
      const slim: Record<string, unknown> = {
        coinMinimalDenom: asset.coinMinimalDenom,
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
        sourceDenom: asset.sourceDenom,
        relative_image_url: asset.relative_image_url,
        verified: Boolean(asset.verified),
        isAlloyed: Boolean(asset.isAlloyed),
        unstable: Boolean(asset.unstable),
        disabled: Boolean(asset.disabled),
        // Read by the limit-order quote picker to offer only stablecoins.
        categories: asset.categories ?? [],
      };
      if (asset.coingeckoId) slim.coingeckoId = asset.coingeckoId;
      if (asset.price) slim.price = asset.price;
      if (asset.contract) slim.contract = asset.contract;
      if (asset.variantGroupKey) slim.variantGroupKey = asset.variantGroupKey;
      if (asset.unstableReason) slim.unstableReason = asset.unstableReason;
      if (asset.haltDeposits) slim.haltDeposits = asset.haltDeposits;
      if (asset.depositHaltReason)
        slim.depositHaltReason = asset.depositHaltReason;
      if (asset.haltWithdrawals) slim.haltWithdrawals = asset.haltWithdrawals;
      if (asset.withdrawalHaltReason)
        slim.withdrawalHaltReason = asset.withdrawalHaltReason;
      if (asset.lastDowntimeDate)
        slim.lastDowntimeDate = asset.lastDowntimeDate;
      if (asset.lastRecoveryDate)
        slim.lastRecoveryDate = asset.lastRecoveryDate;
      if (asset.plannedShutdownDate)
        slim.plannedShutdownDate = asset.plannedShutdownDate;
      if (asset.tooltipMessage) slim.tooltipMessage = asset.tooltipMessage;
      return slim as unknown as Asset;
    }),
  }));
}

/**
 * Strips unused fields (`description`, `logo_URIs`, `alternativeSlip44s`) and
 * normalizes verbose remote `currencies[].coinImageUrl` URLs to their local
 * `/tokens/generated/...` paths for the browser chain list.
 */
export function toClientChainList(chains: Chain[]): Chain[] {
  return chains.map((chain) => ({
    chain_name: chain.chain_name,
    status: chain.status,
    networkType: chain.networkType,
    prettyName: chain.prettyName,
    chain_id: chain.chain_id,
    bech32Prefix: chain.bech32Prefix,
    bech32Config: chain.bech32Config,
    slip44: chain.slip44,
    feeCurrencies: chain.feeCurrencies,
    ...(chain.stakeCurrency ? { stakeCurrency: chain.stakeCurrency } : {}),
    currencies: (chain.currencies ?? []).map((currency) => ({
      ...currency,
      ...(currency.coinImageUrl
        ? {
            coinImageUrl: currency.coinImageUrl.startsWith("/")
              ? currency.coinImageUrl
              : getImageRelativeFilePath(
                  currency.coinImageUrl,
                  currency.coinDenom
                ),
          }
        : {}),
    })),
    apis: chain.apis,
    explorers: chain.explorers,
    features: chain.features,
  }));
}
