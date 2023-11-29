import { CW20Currency, Secret20Currency } from "@keplr-wallet/types";
import type {
  AppCurrency,
  Asset,
  AssetList,
  Chain,
  ChainInfo,
  ChainInfoWithExplorer,
} from "@osmosis-labs/types";
import {
  getDisplayDecimalsFromAsset,
  getMinimalDenomFromAssetList,
  hasMatchingMinimalDenom,
} from "@osmosis-labs/utils";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

import {
  OSMOSIS_CHAIN_ID_OVERWRITE,
  OSMOSIS_CHAIN_NAME_OVERWRITE,
  OSMOSIS_REST_OVERWRITE,
  OSMOSIS_RPC_OVERWRITE,
} from "~/config/env";

export function getOsmosisChainId(environment: "testnet" | "mainnet") {
  return environment === "testnet" ? "osmo-test-5" : "osmosis-1";
}

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

const tokensDir = "/tokens/generated";
export function getImageRelativeFilePath(imageUrl: string, symbol: string) {
  const urlParts = imageUrl.split("/");
  const fileNameSplit = urlParts[urlParts.length - 1].split(".");
  const fileType = fileNameSplit[fileNameSplit.length - 1];
  return path.join(tokensDir, `${symbol.toLowerCase()}.${fileType}`);
}

export function getNodeImageRelativeFilePath(imageUrl: string, symbol: string) {
  const urlParts = imageUrl.split("/");
  const fileNameSplit = urlParts[urlParts.length - 1].split(".");
  const fileType = fileNameSplit[fileNameSplit.length - 1];
  return path.join("/public", tokensDir, `${symbol.toLowerCase()}.${fileType}`);
}

/**
 * Download an image from the provided URL and save it to the local file system.
 * @param {string} imageUrl The URL of the image to download.
 * @returns {Promise<string>} The filename of the saved image.
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  asset: Pick<Asset, "symbol">
) {
  // Ensure the tokens directory exists.
  if (!fs.existsSync(path.resolve() + "/public" + tokensDir)) {
    fs.mkdirSync(path.resolve() + "/public" + tokensDir, { recursive: true });
  }

  const filePath =
    path.resolve() + getNodeImageRelativeFilePath(imageUrl, asset.symbol);

  if (process.env.NODE_ENV === "test") {
    console.log("Skipping image download for test environment");
  }

  if (fs.existsSync(filePath)) {
    return null;
  }

  // Fetch the image from the URL.
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from ${imageUrl}: ${response.statusText}`
    );
  }

  // Save the image to the file system.
  const fileStream = fs.createWriteStream(filePath, { flags: "w" });
  await finished(
    Readable.fromWeb(
      response.body as import("stream/web").ReadableStream<any>
    ).pipe(fileStream)
  );

  const splitPath = filePath.split("/");
  return splitPath[splitPath.length - 1];
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
  const isOsmosis = chain.chain_id === getOsmosisChainId(environment);
  const chainId = isOsmosis
    ? OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id
    : chain.chain_id;
  const assetList = assetLists.find(({ chain_id }) => chain_id === chainId);

  if (!assetList && environment === "mainnet") {
    throw new Error(
      `Failed to find currencies for ${chain.chain_name} (${chain.chain_id})`
    );
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

        const isCW20ContractToken =
          minimalDenom
            .split(/(\w+):(\w+)/)
            .filter((val) => Boolean(val) && !val.startsWith(":")).length > 1;

        let type: CW20Currency["type"] | Secret20Currency["type"] | undefined;
        if (minimalDenom.startsWith("cw20:secret")) {
          type = "secret20";
        } else if (minimalDenom.startsWith("cw20:")) {
          type = "cw20";
        }

        if (!asset.logo_URIs.svg && !asset.logo_URIs.png) {
          throw new Error(
            `Failed to find logo for ${asset.symbol} on ${chain.chain_name}`
          );
        }

        let gasPriceStep: ChainInfo["gasPriceStep"];
        const matchingFeeCurrency = chain.fees.fee_tokens.find(
          (token) => token.denom === minimalDenom
        );

        if (
          matchingFeeCurrency &&
          matchingFeeCurrency.low_gas_price &&
          matchingFeeCurrency.average_gas_price &&
          matchingFeeCurrency.high_gas_price
        ) {
          gasPriceStep = {
            low: matchingFeeCurrency.low_gas_price,
            average: matchingFeeCurrency.average_gas_price,
            high: matchingFeeCurrency.high_gas_price,
          };
        }

        acc.push({
          // @ts-ignore
          type,
          coinDenom: asset.symbol,
          /**
           * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
           */
          coinMinimalDenom: isCW20ContractToken
            ? minimalDenom + `:${asset.symbol}`
            : minimalDenom,
          // @ts-ignore
          contractAddress: asset.address,
          coinDecimals: displayDecimals,
          coinGeckoId: asset.coingecko_id,
          coinImageUrl: getImageRelativeFilePath(
            asset.logo_URIs.svg ?? asset.logo_URIs.png!,
            asset.symbol
          ),
          base: asset.base,
          pegMechanism: asset.keywords
            ?.find((keyword) => keyword.startsWith("peg:"))
            ?.split(":")[1] as AppCurrency["pegMechanism"],
          gasPriceStep,
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
      coinImageUrl:
        stakeAsset?.logo_URIs.svg || stakeAsset?.logo_URIs.png
          ? getImageRelativeFilePath(
              stakeAsset.logo_URIs.svg ?? stakeAsset.logo_URIs.png!,
              stakeAsset.symbol
            )
          : undefined,
      base: stakeAsset?.base,
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
      let type: CW20Currency["type"] | Secret20Currency["type"] | undefined;
      if (minimalDenom.startsWith("cw20:secret")) {
        type = "secret20";
      } else if (minimalDenom.startsWith("cw20:")) {
        type = "cw20";
      }

      let gasPriceStep: ChainInfo["gasPriceStep"];
      const matchingFeeCurrency = chain.fees.fee_tokens.find(
        (token) => token.denom === minimalDenom
      );

      if (
        matchingFeeCurrency &&
        matchingFeeCurrency.low_gas_price &&
        matchingFeeCurrency.average_gas_price &&
        matchingFeeCurrency.high_gas_price
      ) {
        gasPriceStep = {
          low: matchingFeeCurrency.low_gas_price,
          average: matchingFeeCurrency.average_gas_price,
          high: matchingFeeCurrency.high_gas_price,
        };
      }

      acc.push({
        // @ts-ignore
        type,
        coinDenom: asset.symbol,
        /**
         * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
         */
        coinMinimalDenom: isContractToken
          ? minimalDenom + `:${asset.symbol}`
          : minimalDenom,
        // @ts-ignore
        contractAddress: isContractToken
          ? minimalDenom.split(":")[1]
          : undefined,
        coinDecimals: displayDecimals,
        coinGeckoId: asset.coingecko_id,
        coinImageUrl:
          asset?.logo_URIs.svg || asset?.logo_URIs.png
            ? getImageRelativeFilePath(
                asset.logo_URIs.svg ?? asset.logo_URIs.png!,
                asset.symbol
              )
            : undefined,
        base: asset.base,
        gasPriceStep,
      });
      return acc;
    }, []),
    bech32Config: chain.bech32_config,
    explorerUrlToTx: chain.explorers[0].tx_page.replace("${", "{"),
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
    .map(
      (
        chain
      ):
        | (Chain & {
            keplrChain: ChainInfoWithExplorer;
          })
        | undefined => {
        const isOsmosis =
          chain.chain_name === "osmosis" ||
          chain.chain_name === "osmosistestnet";
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
              isOsmosis && OSMOSIS_REST_OVERWRITE
                ? [{ address: OSMOSIS_REST_OVERWRITE }]
                : chain.apis.rest,
          },
          explorers: chain.explorers.map((explorer) => ({
            ...explorer,
            tx_page: explorer.tx_page.replace("${", "{"),
          })),
          keplrChain,
        };
      }
    )
    .filter((chain) => typeof chain !== "undefined");
}
