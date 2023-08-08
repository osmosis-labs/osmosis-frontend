import type { Asset, AssetList } from "@chain-registry/types";
// eslint-disable-next-line import/no-extraneous-dependencies
import { assets as assetLists } from "chain-registry";

import { ChainInfos } from "~/config/generated/chain-infos";
import IBCAssetInfos from "~/config/ibc-assets";

export type GeneratorAssetInfo = {
  isVerified?: boolean;
  coinMinimalDenom: string;
};

// Assets to be included in the wallet-assets list.
const initialAssetInfos: GeneratorAssetInfo[] = [
  ...IBCAssetInfos,
  // Add native Osmosis Assets as they are not included in IBCAssetInfos but are needed in the app.
  { coinMinimalDenom: "uosmo", isVerified: true },
  { coinMinimalDenom: "uion", isVerified: true },
  {
    coinMinimalDenom:
      "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
    isVerified: true,
  },
  {
    coinMinimalDenom:
      "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
    isVerified: true,
  },
];

export const hasMatchingMinimalDenom = (
  { denom_units }: Asset,
  coinMinimalDenom: string
) => {
  return denom_units.some(
    ({ aliases, denom }) =>
      denom.toLowerCase() === coinMinimalDenom.toLowerCase() ||
      aliases?.some(
        (alias) => alias.toLowerCase() === coinMinimalDenom.toLowerCase()
      )
  );
};

export function getAssetLists(assetInfos = initialAssetInfos): AssetList[] {
  /**
   * asset list will have the following structure;
   * {
   *  $schema?: string | undefined;
   *  chain_name: string;
   *  assets: Asset[];
   * }
   */
  const newAssetLists: AssetList[] = ChainInfos.map(
    ({ chainName, currencies, chainRegistryChainName }) => {
      const cosmologyAssetList = assetLists.find(
        ({ chain_name }) => chain_name === chainRegistryChainName
      );

      if (!cosmologyAssetList) {
        console.warn(`No asset list found for ${chainRegistryChainName}`);
      }

      return {
        chain_name: chainName,
        assets: currencies
          .filter(({ coinMinimalDenom }) => {
            const currencyInIbcAssetFile = assetInfos.find(
              (ibcAsset) =>
                ibcAsset.coinMinimalDenom === coinMinimalDenom ||
                coinMinimalDenom.startsWith(ibcAsset.coinMinimalDenom) // cw20 tokens
            );

            // Do not add assets that are not in the ibc-assets.ts file
            if (!currencyInIbcAssetFile) {
              console.warn(
                `Warning: Currency ${coinMinimalDenom} not found in ibc-assets.ts file`
              );
              return false;
            }

            return true;
          })
          .map(({ coinDecimals, coinDenom, coinMinimalDenom, coinGeckoId }) => {
            // Use cosmology asset to fill in additional metadata.
            const cosmologyCurrency = cosmologyAssetList?.assets.find((asset) =>
              hasMatchingMinimalDenom(asset, coinMinimalDenom)
            );

            if (!cosmologyCurrency) {
              console.warn(
                `Warning: No asset found for ${coinMinimalDenom} in cosmology asset list. Consider bumping chain-registry version.`
              );
            }

            return {
              base: coinMinimalDenom,
              name: cosmologyCurrency?.name ?? coinDenom,
              denom_units: [
                {
                  exponent: coinDecimals,
                  denom: coinDenom.toLowerCase(),
                },
                ...(cosmologyCurrency?.denom_units.filter(
                  ({ denom }) => denom.toLowerCase() !== coinDenom.toLowerCase()
                ) ?? []),
              ],
              display: coinDenom.toLowerCase(),
              symbol: coinDenom,
              coingecko_id: coinGeckoId,
              logo_URIs: cosmologyCurrency?.logo_URIs,
              address: cosmologyCurrency?.address,
              description: cosmologyCurrency?.description,
              ibc: cosmologyCurrency?.ibc,
              keywords: cosmologyCurrency?.keywords,
              traces: cosmologyCurrency?.traces,
              type_asset: cosmologyCurrency?.type_asset,
            } as Asset;
          }),
      };
    }
  ).filter(({ assets }) => assets.length > 0);

  return newAssetLists;
}
