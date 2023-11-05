/**
 * This file is used to generate the asset-list.ts and chain-list.ts files.
 *
 * Reasons we need to generate chain-list.ts:
 *  1. We need to add the `keplrChain` object to the chain list. This is used to keep compatibility with the Keplr stores.
 *  2. We need to determine all the available chain ids for added type safety.
 *
 * Reasons we need to generate asset-list.ts:
 *  1. We need to add the `origin_chain_id` and `origin_chain_name` to the asset list.
 *     This makes it easier to find the source chain for an asset and register it on our observable assets store.
 *  2. We need to determine all the available asset symbols for added type safety.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import type {
  Asset,
  AssetList,
  Chain,
  ChainInfoWithExplorer,
  ChainList,
  ResponseAssetList,
} from "@osmosis-labs/types";
import {
  getDisplayDecimalsFromAsset,
  getMinimalDenomFromAssetList,
  hasMatchingMinimalDenom,
} from "@osmosis-labs/utils";
import * as fs from "fs";
import path from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

import {
  IS_TESTNET,
  OSMOSIS_CHAIN_ID_OVERWRITE,
  OSMOSIS_CHAIN_NAME_OVERWRITE,
  OSMOSIS_REST_OVERWRITE,
  OSMOSIS_RPC_OVERWRITE,
} from "~/config/env";
import { PoolPriceRoutes } from "~/config/price";
import { queryGithubFile } from "~/queries/github";

const repo = "osmosis-labs/assetlists";

function getOsmosisChainId(environment: "testnet" | "mainnet") {
  return environment === "testnet" ? "osmo-test-5" : "osmosis-1";
}

function getFilePath({
  chainId,
  fileType,
}: {
  chainId: string;
  fileType: "assetlist" | "chainlist";
}) {
  return `/${chainId}/${chainId}.${fileType}.json`;
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

function getKeplrCompatibleChain({
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
          return acc;
        }

        acc.push({
          coinDenom: asset.symbol,
          coinMinimalDenom: minimalDenom,
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
          `Failed to find asset for ${token.denom} on ${chain.chain_name}`
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

      acc.push({
        coinDenom: asset.symbol,
        coinMinimalDenom: minimalDenom,
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

async function generateChainListFile({
  assetLists,
  chainList,
  environment,
  overwriteFile,
  onlyTypes,
}: {
  assetLists: AssetList[];
  chainList: ChainList;
  environment: "testnet" | "mainnet";
  /**
   * If true, will only include types for available chains.
   */
  onlyTypes: boolean;
  /**
   * If true, will overwrite file.
   */
  overwriteFile: boolean;
}) {
  const allAvailableChains: Pick<Chain, "chain_id" | "chain_name">[] = [
    ...chainList.chains,
    ...(OSMOSIS_CHAIN_ID_OVERWRITE && OSMOSIS_CHAIN_NAME_OVERWRITE
      ? [
          {
            chain_id: OSMOSIS_CHAIN_ID_OVERWRITE,
            chain_name: OSMOSIS_CHAIN_NAME_OVERWRITE,
          },
        ]
      : []),
  ];

  let content: string = "";

  const chainIdTypeName =
    environment === "mainnet" ? "MainnetChainIds" : "TestnetChainIds";

  if (!onlyTypes) {
    content += `
      import type { ChainInfoWithExplorer } from "@osmosis-labs/types";
      import type { Chain } from "@osmosis-labs/types";
      export const ChainList: ( Omit<Chain, "chain_id"> & { chain_id: ${chainIdTypeName}; keplrChain: ChainInfoWithExplorer})[] = ${JSON.stringify(
      chainList.chains
        .map((chain) => {
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
                  ? { address: OSMOSIS_RPC_OVERWRITE }
                  : chain.apis.rpc,
              rest:
                isOsmosis && OSMOSIS_RPC_OVERWRITE
                  ? { address: OSMOSIS_REST_OVERWRITE }
                  : chain.apis.rest,
            },
            keplrChain,
          };
        })
        .filter((chain) => typeof chain !== "undefined"),
      null,
      2
    )};
    `;
  }

  content += `
    export type ${chainIdTypeName} = ${Array.from(
    new Set(allAvailableChains.map((c) => c.chain_id))
  )
    .map(
      (chainId) =>
        `"${chainId}" /** ${
          allAvailableChains.find((c) => c.chain_id === chainId)!.chain_name
        } */`
    )
    .join(" | ")};
  `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  const dirPath = "config/generated";
  const fileName = "chain-list.ts";

  try {
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    if (!overwriteFile) {
      fs.appendFileSync(filePath, formatted, {
        encoding: "utf8",
        flag: "a",
      });
      console.info(`Successfully appended to ${fileName}`);
      return;
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.info(`Successfully wrote ${fileName}`);
  } catch (e) {
    console.error(`Error writing ${fileName}: ${e}`);
  }
}

let assetsAdded = 0;
function createOrAddToAssetList(
  assetList: AssetList[],
  chain: Chain,
  asset: ResponseAssetList["assets"][number]
): AssetList[] {
  const assetlistIndex = assetList.findIndex(
    ({ chain_name }) => chain_name === chain.chain_name
  );

  const augmentedAsset: Asset = {
    ...asset,
    display: asset.display.toLowerCase(),
    origin_chain_id: chain.chain_id,
    origin_chain_name: chain.chain_name,
    price_coin_id: PoolPriceRoutes.find(
      ({ spotPriceSourceDenom }) => spotPriceSourceDenom === asset.base
    )?.alternativeCoinId,
  };

  if (assetlistIndex === -1) {
    assetList.push({
      chain_name: chain.chain_name,
      chain_id: chain.chain_id,
      assets: [augmentedAsset],
    });
  } else {
    assetList[assetlistIndex].assets.push(augmentedAsset);
  }

  assetsAdded += 1;
  return assetList;
}

async function generateAssetListFile({
  chains,
  environment,
  overwriteFile,
  onlyTypes,
}: {
  chains: Chain[];
  environment: "testnet" | "mainnet";
  /**
   * If true, will only include types for available assets.
   */
  onlyTypes: boolean;
  /**
   * If true, will overwrite file.
   */
  overwriteFile: boolean;
}) {
  const osmosisChainId = getOsmosisChainId(environment);
  const assetList = await queryGithubFile<ResponseAssetList>({
    repo,
    filePath: getFilePath({
      chainId: osmosisChainId,
      fileType: "assetlist",
    }),
  });

  const assetLists = assetList.assets.reduce<AssetList[]>((acc, asset) => {
    const traces = asset.traces.filter((trace) =>
      ["ibc", "ibc-cw20"].includes(trace.type)
    );

    /** If there are no traces, assume it's an Osmosis asset */
    if (traces.length === 0) {
      const chain = chains.find(
        (chain) =>
          chain.chain_id === (OSMOSIS_CHAIN_ID_OVERWRITE ?? osmosisChainId)
      );

      if (!chain) {
        throw new Error("Failed to find chain osmosis");
      }

      return createOrAddToAssetList(acc, chain, asset);
    }

    for (const trace of traces) {
      const chainName = trace.counterparty.chain_name;
      const chain = chains.find((chain) => chain.chain_name === chainName);

      if (!chain) {
        console.warn(
          `Failed to find chain ${chainName}. ${asset.symbol} for that chain will be skipped.`
        );
        continue;
      }

      createOrAddToAssetList(acc, chain, asset);
    }

    return acc;
  }, [] as AssetList[]);

  let content: string = "";

  if (!onlyTypes) {
    content += `
      import type { AssetList } from "@osmosis-labs/types";
      export const AssetLists = ${JSON.stringify(
        assetLists,
        null,
        2
      )} as AssetList[];    
    `;
  }

  content += `    
    export type ${
      environment === "testnet" ? "TestnetAssetSymbols" : "MainnetAssetSymbols"
    } = ${Array.from(new Set(assetList.assets.map((asset) => asset.symbol)))
    .map(
      (symbol) =>
        `"${symbol}" /** minDenom: ${getMinimalDenomFromAssetList(
          assetList.assets.find((asset) => asset.symbol === symbol)!
        )} */`
    )
    .join(" | ")};
  `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  const dirPath = "config/generated";
  const fileName = "asset-list.ts";

  try {
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    if (!overwriteFile) {
      fs.appendFileSync(filePath, formatted, {
        encoding: "utf8",
        flag: "a",
      });
      console.info(
        `Successfully appended ${fileName}. Added ${assetsAdded} assets.`
      );
      return assetLists;
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });

    console.info(
      `Successfully wrote ${fileName}. Added ${assetsAdded} assets.`
    );

    return assetLists;
  } catch (e) {
    console.error(`Error writing ${fileName}: ${e}`);
  }
}

async function main() {
  const [mainnetChainList, testnetChainList] = await Promise.all([
    queryGithubFile<ChainList>({
      repo,
      filePath: getFilePath({
        chainId: getOsmosisChainId("mainnet"),
        fileType: "chainlist",
      }),
    }),
    queryGithubFile<ChainList>({
      repo,
      filePath: getFilePath({
        chainId: getOsmosisChainId("testnet"),
        fileType: "chainlist",
      }),
    }),
  ]);

  let mainnetAssetLists: AssetList[] | undefined;
  let testnetAssetLists: AssetList[] | undefined;

  /**
   * If testnet, generate testnet asset list first to avoid overwriting the mainnet types.
   */
  if (IS_TESTNET) {
    testnetAssetLists = await generateAssetListFile({
      chains: testnetChainList.chains,
      environment: "testnet",
      overwriteFile: true,
      onlyTypes: false,
    });
    mainnetAssetLists = await generateAssetListFile({
      chains: mainnetChainList.chains,
      environment: "mainnet",
      overwriteFile: false,
      onlyTypes: true,
    });
  } else {
    mainnetAssetLists = await generateAssetListFile({
      chains: mainnetChainList.chains,
      environment: "mainnet",
      overwriteFile: true,
      onlyTypes: false,
    });
    testnetAssetLists = await generateAssetListFile({
      chains: testnetChainList.chains,
      environment: "testnet",
      overwriteFile: false,
      onlyTypes: true,
    });
  }

  if (!mainnetAssetLists || !testnetAssetLists)
    throw new Error("Failed to generate asset lists");

  /**
   * If testnet, generate testnet chain list first to avoid overwriting the mainnet types.
   */
  if (IS_TESTNET) {
    await generateChainListFile({
      assetLists: testnetAssetLists,
      chainList: testnetChainList,
      environment: "testnet",
      onlyTypes: false,
      overwriteFile: true,
    });
    await generateChainListFile({
      assetLists: mainnetAssetLists,
      chainList: mainnetChainList,
      environment: "mainnet",
      onlyTypes: true,
      overwriteFile: false,
    });
  } else {
    await generateChainListFile({
      assetLists: mainnetAssetLists,
      chainList: mainnetChainList,
      environment: "mainnet",
      onlyTypes: false,
      overwriteFile: true,
    });
    await generateChainListFile({
      assetLists: testnetAssetLists,
      chainList: testnetChainList,
      environment: "testnet",
      onlyTypes: true,
      overwriteFile: false,
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
