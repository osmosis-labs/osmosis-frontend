import { CW20Currency, Secret20Currency } from "@keplr-wallet/types";
import type {
  Asset,
  AssetList,
  Chain,
  ChainInfo,
  ChainInfoWithExplorer,
} from "@osmosis-labs/types";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

import {
  OSMOSIS_CHAIN_ID_OVERWRITE,
  OSMOSIS_CHAIN_NAME_OVERWRITE,
  OSMOSIS_REST_OVERWRITE,
  OSMOSIS_RPC_OVERWRITE,
} from "./env";

export function getOsmosisChainId(environment: "testnet" | "mainnet") {
  return environment === "testnet" ? "osmo-test-5" : "osmosis-1";
}

const tokensDir = "/tokens/generated";
export function getImageRelativeFilePath(imageUrl: string, symbol: string) {
  const urlParts = imageUrl.split("/");
  const fileNameSplit = urlParts[urlParts.length - 1].split(".");
  const fileType = fileNameSplit[fileNameSplit.length - 1];
  return path.join(tokensDir, `${symbol.toLowerCase()}.${fileType}`);
}

function getNodeImageRelativeFilePath(imageUrl: string, symbol: string) {
  const urlParts = imageUrl.split("/");
  const fileNameSplit = urlParts[urlParts.length - 1].split(".");
  const fileType = fileNameSplit[fileNameSplit.length - 1];
  return path.join("/public", tokensDir, `${symbol.toLowerCase()}.${fileType}`);
}

export const codegenDir = "config/generated";

// Path to the lock file
const lockFilePath = path.join(path.resolve(), `${codegenDir}/asset-lock.json`);

/**
 * Read the stored asset list hash from the lock file.
 * @returns The stored hash or null if the lock file doesn't exist.
 */
function readStoredAssetListHash(): string | null {
  if (!fs.existsSync(lockFilePath)) {
    return null;
  }
  const data = fs.readFileSync(lockFilePath, "utf-8");
  try {
    const parsed = JSON.parse(data);
    return parsed.assetListHash || null;
  } catch {
    return null;
  }
}

/**
 * Write the current asset list hash to the lock file.
 * @param hash The hash to store.
 */
export function writeCurrentAssetListHash(hash: string): void {
  const data = { assetListHash: hash };
  fs.writeFileSync(lockFilePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Download an image from the provided URL and save it to the local file system.
 * Only saves images if the current asset list hash differs from the stored hash or the file doesn't exist.
 * @param params An object containing the image URL, asset information, and current asset list hash.
 * @returns The filename of the saved image or null if skipped.
 */
export async function saveAssetImageToTokensDir({
  imageUrl,
  asset,
  currentAssetListHash,
}: {
  imageUrl: string;
  asset: Pick<Asset, "symbol">;
  currentAssetListHash: string;
}) {
  // Ensure the tokens directory exists.
  if (!fs.existsSync(path.resolve() + "/public" + tokensDir)) {
    fs.mkdirSync(path.resolve() + "/public" + tokensDir, { recursive: true });
  }

  const filePath =
    path.resolve() + getNodeImageRelativeFilePath(imageUrl, asset.symbol);

  if (process.env.NODE_ENV === "test") {
    console.info("Skipping image download for test environment");
    return null;
  }

  const storedHash = readStoredAssetListHash();

  /**
   * Skip saving the image if the current asset list hash matches the stored hash.
   */
  if (storedHash === currentAssetListHash && fs.existsSync(filePath)) {
    return null;
  }

  // Fetch the image from the URL.
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from ${imageUrl}: ${response.statusText}`
    );
  }

  if (!response.body) {
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

  // Verify the image has been added
  if (!fs.existsSync(filePath)) {
    throw new Error(`Failed to save image to ${filePath}`);
  }

  const splitPath = filePath.split("/");
  return splitPath[splitPath.length - 1];
}

/** Generate a chain config compatible with Keplr wallet. */
function getKeplrCompatibleChain({
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

  const stakingTokenSourceDenom = chain.stakeCurrency?.sourceDenom ?? "";
  const stakeAsset = assetList!.assets.find(
    (asset) => asset.sourceDenom === stakingTokenSourceDenom
  );

  const stakeDisplayDecimals = stakeAsset?.decimals;
  const stakeSourceDenom = stakeAsset?.sourceDenom;

  const rpc = chain.apis.rpc[0].address;
  const rest = chain.apis.rest[0].address;
  const prettyChainName = chain.prettyName;

  const stakeCurrencyImageUrl =
    stakeAsset?.logoURIs?.svg ?? stakeAsset?.logoURIs?.png;

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
        const sourceDenom = asset.sourceDenom;
        const displayDecimals = asset.decimals;

        const isCW20ContractToken =
          sourceDenom
            .split(/(\w+):(\w+)/)
            .filter((val) => Boolean(val) && !val.startsWith(":")).length > 1;

        let type: CW20Currency["type"] | Secret20Currency["type"] | undefined;
        if (sourceDenom.startsWith("cw20:secret")) {
          type = "secret20";
        } else if (sourceDenom.startsWith("cw20:")) {
          type = "cw20";
        }

        // if (!asset.logoURIs.svg && !asset.logoURIs.png) {
        //   throw new Error(
        //     `Failed to find logo for ${asset.symbol} on ${chain.chain_name}`
        //   );
        // }

        let gasPriceStep: ChainInfo["gasPriceStep"];
        const matchingFeeCurrency = chain.feeCurrencies.find(
          (token) => token.coinDenom === sourceDenom
        );

        if (
          matchingFeeCurrency &&
          matchingFeeCurrency.gasPriceStep?.low &&
          matchingFeeCurrency.gasPriceStep.average &&
          matchingFeeCurrency.gasPriceStep.high
        ) {
          gasPriceStep = {
            low: matchingFeeCurrency.gasPriceStep.low,
            average: matchingFeeCurrency.gasPriceStep.average,
            high: matchingFeeCurrency.gasPriceStep.high,
          };
        }

        const imageUrl = asset?.logoURIs?.svg ?? asset?.logoURIs?.png;

        acc.push({
          type: type ?? "cw20",
          coinDenom: asset.symbol,
          /**
           * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
           */
          coinMinimalDenom: isCW20ContractToken
            ? sourceDenom + `:${asset.symbol}`
            : sourceDenom,
          contractAddress: isCW20ContractToken
            ? sourceDenom.split(":")[1]!
            : "",
          coinDecimals: displayDecimals,
          coinGeckoId: asset.coingeckoId,
          coinImageUrl: imageUrl
            ? getImageRelativeFilePath(imageUrl, asset.symbol)
            : undefined,
          base: asset.coinMinimalDenom,
          pegMechanism: asset.pegMechanism,
          gasPriceStep,
        });
        return acc;
      },
      []
    ),
    stakeCurrency:
      // Note: this is a hacky fix since it's possible for chains to have no staking token (i.e. Noble)
      // Newever versions of Keplr made this nullable, but our Keplr stores are from an old version of Keplr.
      // I don't anticipate this being an issue since we don't really use staking tokens on other chain in our FE features.
      // Further, most chains have staking tokens.
      // So, I add a placeholder token to stay compatible with the ChainInfo types that we imported into the keplr-* packages in the monorepo.
      // Long term, once we remove the keplr stores for good and delete that code, we can upgrade our Keplr chain type to use the newer
      // type that tolerates missing staking tokens. Then, we can suggest chains to Keplr wallet with Staking tokens missing.
      stakeAsset &&
      stakeDisplayDecimals &&
      (stakeSourceDenom || stakingTokenSourceDenom)
        ? {
            coinDecimals: stakeDisplayDecimals ?? 0,
            coinDenom: stakeAsset.symbol ?? stakingTokenSourceDenom,
            coinMinimalDenom:
              stakeSourceDenom ?? stakingTokenSourceDenom! ?? "",
            coinGeckoId: stakeAsset.coingeckoId,
            coinImageUrl: stakeCurrencyImageUrl
              ? getImageRelativeFilePath(
                  stakeCurrencyImageUrl,
                  stakeAsset.symbol
                )
              : undefined,
            base: stakeAsset.coinMinimalDenom ?? "tempStakePlaceholder",
          }
        : {
            coinDecimals: 0,
            coinDenom: "STAKE",
            coinMinimalDenom: "tempStakePlaceholder",
          },
    feeCurrencies: chain.feeCurrencies.reduce<
      ChainInfoWithExplorer["feeCurrencies"]
    >((acc, token) => {
      const asset = assetList!.assets.find(
        (asset) =>
          asset.sourceDenom ===
          (token.chainSuggestionDenom ?? token.coinMinimalDenom)
      );

      if (!asset) {
        return acc;
      }

      const sourceDenom = asset.sourceDenom;
      const displayDecimals = asset.decimals;

      const isContractToken =
        sourceDenom
          .split(/(\w+):(\w+)/)
          .filter((val) => Boolean(val) && !val.startsWith(":")).length > 1;
      let type: CW20Currency["type"] | Secret20Currency["type"] | undefined;
      if (sourceDenom.startsWith("cw20:secret")) {
        type = "secret20";
      } else if (sourceDenom.startsWith("cw20:")) {
        type = "cw20";
      }

      let gasPriceStep: ChainInfo["gasPriceStep"];
      const matchingFeeCurrency = chain.feeCurrencies.find(
        (token) => token.coinMinimalDenom === asset.coinMinimalDenom
      );

      if (
        matchingFeeCurrency &&
        matchingFeeCurrency.gasPriceStep?.low &&
        matchingFeeCurrency.gasPriceStep.average &&
        matchingFeeCurrency.gasPriceStep.high
      ) {
        gasPriceStep = {
          low: matchingFeeCurrency.gasPriceStep.low,
          average: matchingFeeCurrency.gasPriceStep.average,
          high: matchingFeeCurrency.gasPriceStep.high,
        };
      }

      const imageUrl = asset?.logoURIs?.svg ?? asset?.logoURIs?.png;

      acc.push({
        type: type ?? "cw20",
        coinDenom: asset.symbol,
        /**
         * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
         */
        coinMinimalDenom: isContractToken
          ? sourceDenom + `:${asset.symbol}`
          : sourceDenom,
        contractAddress: isContractToken ? sourceDenom.split(":")[1] : "ƒ",
        coinDecimals: displayDecimals,
        coinGeckoId: asset.coingeckoId,
        coinImageUrl: imageUrl
          ? getImageRelativeFilePath(imageUrl, asset.symbol)
          : undefined,
        base: asset.coinMinimalDenom,
        gasPriceStep,
      });
      return acc;
    }, []),
    bech32Config: chain.bech32Config,
    explorerUrlToTx: chain.explorers[0].txPage.replace("${", "{"),
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
          /**
           * Needed for CosmosKit to function correctly, otherwise
           * chain suggestion won't work.
           */
          fees: {
            fee_tokens: chain.feeCurrencies.map((token) => ({
              ...token,
              denom: token.chainSuggestionDenom ?? token.coinMinimalDenom,
              fixed_min_gas_price: token.gasPriceStep?.low ?? 0,
              low_gas_price: token.gasPriceStep?.low,
              average_gas_price: token.gasPriceStep?.average,
              high_gas_price: token.gasPriceStep?.high,
            })),
          },
          staking: {
            staking_tokens: chain.stakeCurrency ? [chain.stakeCurrency] : [],
          },
          chain_id: isOsmosis
            ? OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id
            : chain.chain_id,
          prettyName: isOsmosis
            ? OSMOSIS_CHAIN_NAME_OVERWRITE ?? chain.prettyName
            : chain.prettyName,
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
            txPage: explorer.txPage.replace("${", "{"),
          })),
          keplrChain,
        };
      }
    )
    .filter((chain) => typeof chain !== "undefined");
}
