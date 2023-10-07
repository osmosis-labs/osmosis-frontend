import type { Asset } from "@chain-registry/types";
import { AppCurrency } from "@keplr-wallet/types";
import { ChainInfoWithExplorer } from "@osmosis-labs/stores";

import { hasMatchingMinimalDenom } from "~/config/generate-wallet-assets/utils";
import { WalletAssets } from "~/config/generated/wallet-assets";
import { FeeCurrency } from "~/stores/assets";

/** All currency attributes (stake and fee) are defined once in the `currencies` list.
 *  Maintains the option to skip this conversion and keep the verbose `ChainInfo` type.
 */
export interface SimplifiedChainInfo
  extends Omit<ChainInfoWithExplorer, "stakeCurrency" | "feeCurrencies"> {
  currencies: Array<
    AppCurrency &
      FeeCurrency & {
        isStakeCurrency?: boolean;
        isFeeCurrency?: boolean;
        pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
      }
  >;
}

/** Convert a less redundant chain info schema into one that is accepted by Keplr's suggestChain: `ChainInfo`. */
export function createKeplrChainInfos(
  chainInfo: SimplifiedChainInfo
): ChainInfoWithExplorer {
  let feeCurrencies: AppCurrency[] = [];
  let stakeCurrency: AppCurrency | undefined;

  for (const currency of chainInfo.currencies) {
    if (currency.isFeeCurrency) {
      feeCurrencies.push(currency);
    }

    if (currency.isStakeCurrency && stakeCurrency === undefined) {
      stakeCurrency = currency;
    } else if (currency.isStakeCurrency) {
      throw new Error(
        `There cannot be more than one stake currency for ${chainInfo.chainName}`
      );
    }
  }

  if (stakeCurrency === undefined) {
    throw new Error(
      `Did not specify a stake currency for ${chainInfo.chainName}`
    );
  }

  if (feeCurrencies.length === 0) {
    throw new Error(
      `Did not specify any fee currencies for ${chainInfo.chainName}`
    );
  }

  return {
    ...chainInfo,
    stakeCurrency,
    feeCurrencies,
  };
}

/**
 * Get's asset from wallet assets by minimal denom.
 * We have to use this since our asset list coingecko ids are
 * not accurate given some rely on pool pricing.
 *
 * TODO: Refactor once we have Osmosis assetlists
 * @see https://github.com/osmosis-labs/assetlists
 */
export function getAssetFromWalletAssets(coinMinimalDenom: string) {
  let asset: Asset | undefined;

  for (const assetList of WalletAssets) {
    const walletAsset = assetList.assets.find((asset) =>
      hasMatchingMinimalDenom(asset, coinMinimalDenom)
    );

    if (walletAsset) {
      asset = walletAsset;
      break;
    }
  }

  return asset;
}
