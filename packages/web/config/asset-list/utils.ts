import type {
  Asset,
  AssetList,
  Chain,
  ChainInfoWithExplorer,
} from "@osmosis-labs/types";
import {
  getDisplayDecimalsFromAsset,
  getMinimalDenomFromAssetList,
  hasMatchingMinimalDenom,
} from "@osmosis-labs/utils";

import {
  OSMOSIS_CHAIN_ID_OVERWRITE,
  OSMOSIS_CHAIN_NAME_OVERWRITE,
  OSMOSIS_REST_OVERWRITE,
  OSMOSIS_RPC_OVERWRITE,
} from "~/config/env";

function findMinDenomAndDecimals({
  asset,
  chainName,
}: {
  asset?: Asset;
  chainName: string;
}) {
  if (!asset) {
    return {
      minimalDenom: undefined,
      displayDecimals: undefined,
    };
  }

  const minimalDenom = getMinimalDenomFromAssetList(asset);
  const displayDecimals = getDisplayDecimalsFromAsset(asset);

  if (typeof minimalDenom === "undefined") {
    console.warn(
      `Failed to find minimal denom for ${asset?.symbol} on ${chainName}`
    );
  }

  if (typeof displayDecimals === "undefined") {
    console.warn(
      `Failed to find decimals for ${asset?.symbol} on ${chainName}`
    );
  }

  return { minimalDenom, displayDecimals };
}

export function getKeplrCompatibleChain({
  chain,
  assetLists,
  environment,
}: {
  chain: Chain;
  assetLists: AssetList[];
  environment: "testnet" | "mainnet";
}): ChainInfoWithExplorer | undefined {
  const isOsmosis =
    chain.chain_name === "osmosis" || chain.chain_name === "osmosistestnet";
  const assetList = assetLists.find(
    ({ chain_name }) => chain_name === chain.chain_name
  );

  if (!assetList && environment === "mainnet") {
    throw new Error(`Failed to find currencies for ${chain.chain_name}`);
  }

  if (!assetList && environment === "testnet") {
    console.warn(`Failed to find currencies for ${chain.chain_name}`);
    return undefined;
  }

  const stakingTokenDenom = chain.staking.staking_tokens[0].denom;
  const stakeAsset = assetList!.assets.find((asset) =>
    hasMatchingMinimalDenom(asset, stakingTokenDenom)
  );

  if (!stakeAsset) {
    console.warn(
      `Failed to find stake asset for ${stakingTokenDenom} on ${chain.chain_name}. Proceeding to use minimalDenom as currency.`
    );
  }

  const {
    displayDecimals: stakeDisplayDecimals,
    minimalDenom: stakeMinimalDenom,
  } = findMinDenomAndDecimals({
    asset: stakeAsset,
    chainName: chain.chain_name,
  });

  const rpc = chain.apis.rpc[0].address;
  const rest = chain.apis.rest[0].address;
  const chainId = chain.chain_id;
  const prettyChainName = chain.pretty_name;

  return {
    rpc: isOsmosis ? OSMOSIS_RPC_OVERWRITE ?? rpc : rpc,
    rest: isOsmosis ? OSMOSIS_REST_OVERWRITE ?? rest : rest,
    chainId: isOsmosis ? OSMOSIS_CHAIN_ID_OVERWRITE ?? chainId : chainId,
    chainName: chain.chain_name,
    prettyChainName: isOsmosis
      ? OSMOSIS_CHAIN_NAME_OVERWRITE ?? prettyChainName
      : prettyChainName,
    bip44: {
      coinType: chain?.slip44 ?? 118,
    },
    currencies: assetList!.assets.reduce<ChainInfoWithExplorer["currencies"]>(
      (acc, asset) => {
        const { displayDecimals, minimalDenom } = findMinDenomAndDecimals({
          asset,
          chainName: chain.chain_name,
        });

        if (
          typeof displayDecimals === "undefined" ||
          typeof minimalDenom === "undefined"
        ) {
          console.warn(
            `Failed to find fee asset on asset list for ${asset.display} on ${chain.chain_name}. Skipping adding it to 'keplrChain.currencies'`
          );
          return acc;
        }

        const isContractToken =
          minimalDenom
            .split(/(\w+):(\w+)/)
            .filter((val) => Boolean(val) && !val.startsWith(":")).length > 1;

        acc.push({
          coinDenom: asset.symbol,
          /**
           * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
           */
          coinMinimalDenom: isContractToken
            ? minimalDenom + `:${asset.symbol}`
            : minimalDenom,
          contractAddress: isContractToken
            ? minimalDenom.split(":")[1]
            : undefined,
          coinDecimals: displayDecimals,
          coinGeckoId: asset.coingecko_id,
          coinImageUrl: asset.logo_URIs.svg ?? asset.logo_URIs.png,
          priceCoinId: asset.price_coin_id,
        });
        return acc;
      },
      []
    ),
    stakeCurrency: {
      coinDecimals: stakeDisplayDecimals ?? 0,
      coinDenom: stakeAsset?.symbol ?? stakingTokenDenom,
      coinMinimalDenom: stakeMinimalDenom ?? stakingTokenDenom,
      coinGeckoId: stakeAsset?.coingecko_id,
      coinImageUrl: stakeAsset?.logo_URIs.svg,
    },
    feeCurrencies: chain.fees.fee_tokens.reduce<
      ChainInfoWithExplorer["feeCurrencies"]
    >((acc, token) => {
      const asset = assetList!.assets.find((asset) =>
        hasMatchingMinimalDenom(asset, token.denom)
      );

      if (!asset) {
        console.warn(
          `Failed to find fee asset on asset list for ${token.denom} on ${chain.chain_name}. Skipping adding it to 'keplrChain.feeCurrencies'`
        );
        return acc;
      }

      const { displayDecimals, minimalDenom } = findMinDenomAndDecimals({
        asset,
        chainName: chain.chain_name,
      });

      if (
        typeof displayDecimals === "undefined" ||
        typeof minimalDenom === "undefined"
      ) {
        return acc;
      }

      const isContractToken =
        minimalDenom
          .split(/(\w+):(\w+)/)
          .filter((val) => Boolean(val) && !val.startsWith(":")).length > 1;

      acc.push({
        coinDenom: asset.symbol,
        /**
         * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
         */
        coinMinimalDenom: isContractToken
          ? minimalDenom + `:${asset.symbol}`
          : minimalDenom,
        coinDecimals: displayDecimals,
        coinGeckoId: asset.coingecko_id,
        coinImageUrl: asset.logo_URIs.svg,
        priceCoinId: asset.price_coin_id,
      });
      return acc;
    }, []),
    bech32Config: chain.bech32_config,
    explorerUrlToTx: chain.explorers[0].tx_page,
    features: chain.features,
  };
}

export function getChainList({
  assetLists,
  chains,
  environment,
}: {
  assetLists: AssetList[];
  chains: Chain[];
  environment: "testnet" | "mainnet";
}) {
  return chains
    .map((chain) => {
      const isOsmosis =
        chain.chain_name === "osmosis" || chain.chain_name === "osmosistestnet";
      const keplrChain = getKeplrCompatibleChain({
        chain,
        assetLists,
        environment,
      });

      if (!keplrChain) return undefined;

      return {
        ...chain,
        chain_id: isOsmosis
          ? OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id
          : chain.chain_id,
        chain_name: isOsmosis
          ? OSMOSIS_CHAIN_NAME_OVERWRITE ?? chain.chain_name
          : chain.chain_name,
        apis: {
          rpc:
            isOsmosis && OSMOSIS_RPC_OVERWRITE
              ? [{ address: OSMOSIS_RPC_OVERWRITE }]
              : chain.apis.rpc,
          rest:
            isOsmosis && OSMOSIS_RPC_OVERWRITE
              ? [{ address: OSMOSIS_REST_OVERWRITE }]
              : chain.apis.rest,
        },
        keplrChain,
      };
    })
    .filter((chain) => typeof chain !== "undefined");
}
