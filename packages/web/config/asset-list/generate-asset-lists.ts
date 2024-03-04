/**
 * This file is used to generate the asset-list.ts and chain-list.ts files.
 *
 * Reasons we need to generate chain-list.ts:
 *  1. We need to add the `keplrChain` object to the chain list. This is used to keep compatibility with the Keplr stores.
 *  2. We need to determine all the available chain ids for added type safety.
 *
 * Reasons we need to generate asset-list.ts:
 *  1. We need to determine all the available asset symbols for added type safety.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import type {
  Asset,
  AssetList,
  Chain,
  ChainList,
  IbcTransferMethod,
} from "@osmosis-labs/types";
import * as fs from "fs";
import path from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

import {
  ASSET_LIST_COMMIT_HASH,
  GITHUB_API_TOKEN,
  IS_TESTNET,
  OSMOSIS_CHAIN_ID_OVERWRITE,
  OSMOSIS_CHAIN_NAME_OVERWRITE,
} from "~/config/env";
import {
  queryGithubFile,
  queryLatestCommitHash,
} from "~/server/queries/github";

import {
  getChainList,
  getImageRelativeFilePath,
  getOsmosisChainId,
  saveAssetImageToTokensDir,
} from "./utils";

interface ResponseAssetList {
  chainName: string;
  assets: Omit<Asset, "chain_id">[];
}

const repo = "osmosis-labs/assetlists";

function getFilePath({
  chainId,
  fileType,
}: {
  chainId: string;
  fileType: "assetlist" | "chainlist";
}) {
  // TEMPORARY
  // use legacy chain list
  if (fileType === "chainlist") {
    return `${chainId}/${chainId}.${fileType}.json`;
  }

  return `${chainId}/generated/frontend/${fileType}.json`;
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
      import type { Chain, ChainInfoWithExplorer } from "@osmosis-labs/types";
      export const ChainList: ( Omit<Chain, "chain_id"> & { chain_id: ${chainIdTypeName}; keplrChain: ChainInfoWithExplorer})[] = ${JSON.stringify(
      getChainList({ assetLists, environment, chains: chainList.chains }),
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

function createOrAddToAssetList(
  assetList: AssetList[],
  chain: Chain,
  asset: Asset,
  environment: "testnet" | "mainnet"
): AssetList[] {
  const assetlistIndex = assetList.findIndex(
    ({ chain_name }) => chain_name === chain.chain_name
  );

  const isOsmosis = chain.chain_id === getOsmosisChainId(environment);

  const chainId = isOsmosis
    ? OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id
    : chain.chain_id;
  const chainName = chain.chain_name;

  const augmentedAsset: Asset = {
    ...asset,
    relative_image_url: getImageRelativeFilePath(
      asset.logoURIs.svg ?? asset.logoURIs.png!,
      asset.symbol
    ),
  };

  if (assetlistIndex === -1) {
    assetList.push({
      chain_name: chainName,
      chain_id: chainId,
      assets: [augmentedAsset],
    });
  } else {
    assetList[assetlistIndex].assets.push(augmentedAsset);
  }

  return assetList;
}

/** Generates asset list TypeScript file. */
async function generateAssetListFile({
  chains,
  environment,
  overwriteFile,
  onlyTypes,
  assetList,
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
  assetList: ResponseAssetList;
}) {
  const osmosisChainId = getOsmosisChainId(environment);

  const assetLists = assetList.assets.reduce<AssetList[]>((acc, asset) => {
    /** If there are no traces, assume it's an Osmosis asset */
    if (asset.transferMethods.length === 0) {
      const chain = chains.find((chain) => chain.chain_id === osmosisChainId);

      if (!chain) {
        throw new Error("Failed to find chain osmosis");
      }

      return createOrAddToAssetList(acc, chain, asset, environment);
    }

    /** Otherwise, assume IBC asset 1 hop counterparty. */
    const cosmosCounterparty = [...asset.transferMethods]
      .reverse()
      .find(({ type }) => type === "ibc") as IbcTransferMethod | undefined;

    if (!cosmosCounterparty) {
      throw new Error(
        "Failed to find cosmos counterparty for IBC asset: " + asset.symbol
      );
    }

    const counterpartyChainName = cosmosCounterparty.counterparty.chainName;

    const chain = chains.find(
      (chain) => chain.chain_name === counterpartyChainName
    );

    if (!chain) {
      throw new Error(
        `Failed to find chain ${counterpartyChainName}. ${asset.symbol} for that chain will be skipped.`
      );
    }

    return createOrAddToAssetList(acc, chain, asset, environment);
  }, [] as AssetList[]);

  let content: string = "";

  if (!onlyTypes) {
    content += `
      import type { AssetList } from "@osmosis-labs/types";
      export const AssetLists: AssetList[] = ${JSON.stringify(
        assetLists,
        null,
        2
      )};    
    `;
  }

  content += `    
    export type ${
      environment === "testnet" ? "TestnetAssetSymbols" : "MainnetAssetSymbols"
    } = ${Array.from(new Set(assetList.assets.map((asset) => asset.symbol)))
    .map(
      (symbol) =>
        `"${symbol}" /** source denom: ${
          assetList.assets.find((asset) => asset.symbol === symbol)!.sourceDenom
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
  const fileName = "asset-lists.ts";
  const addedAssetsSize = assetLists
    .flatMap(({ assets }) => assets)
    .reduce((acc, asset) => {
      acc.add(asset.symbol);
      return acc;
    }, new Set()).size;

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
      console.info(`Successfully appended to ${fileName}.`);
      return assetLists;
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });

    console.info(
      `Successfully wrote ${fileName}. Added ${addedAssetsSize} assets.`
    );

    return assetLists;
  } catch (e) {
    console.error(`Error writing ${fileName}: ${e}`);
  }
}

async function generateAssetImages({
  assetList,
}: {
  assetList: ResponseAssetList;
}) {
  console.time("Successfully downloaded images");
  for await (const asset of assetList.assets) {
    await saveAssetImageToTokensDir(
      asset?.logoURIs.svg ?? asset?.logoURIs.png ?? "",
      asset
    );
  }
  console.timeEnd("Successfully downloaded images");
}

async function getLatestCommitHash() {
  try {
    return await queryLatestCommitHash({
      repo,
      branch: "main",
      githubToken: GITHUB_API_TOKEN,
    });
  } catch (e) {
    console.info(
      "You can set the GITHUB_API_TOKEN environment variable to increase the rate limit."
    );
  }
}

async function main() {
  const mainnetOsmosisChainId = getOsmosisChainId("mainnet");
  const testnetOsmosisChainId = getOsmosisChainId("testnet");

  const mainLatestCommitHash =
    ASSET_LIST_COMMIT_HASH ?? (await getLatestCommitHash());

  console.info(`Using hash '${mainLatestCommitHash}' to generate assets`);

  const [
    mainnetChainList,
    testnetChainList,
    mainnetResponseAssetList,
    testnetResponseAssetList,
  ] = await Promise.all([
    queryGithubFile<ChainList>({
      repo,
      filePath: getFilePath({
        chainId: mainnetOsmosisChainId,
        fileType: "chainlist",
      }),
      commitHash: mainLatestCommitHash,
    }),
    queryGithubFile<ChainList>({
      repo,
      filePath: getFilePath({
        chainId: testnetOsmosisChainId,
        fileType: "chainlist",
      }),
      commitHash: mainLatestCommitHash,
    }),
    queryGithubFile<ResponseAssetList>({
      repo,
      filePath: getFilePath({
        chainId: mainnetOsmosisChainId,
        fileType: "assetlist",
      }),
      commitHash: mainLatestCommitHash,
    }),
    queryGithubFile<ResponseAssetList>({
      repo,
      filePath: getFilePath({
        chainId: testnetOsmosisChainId,
        fileType: "assetlist",
      }),
      commitHash: mainLatestCommitHash,
    }),
  ]);

  await generateAssetImages({
    assetList: IS_TESTNET ? testnetResponseAssetList : mainnetResponseAssetList,
  });

  let mainnetAssetLists: AssetList[] | undefined;
  let testnetAssetLists: AssetList[] | undefined;

  /**
   * If testnet, generate testnet asset list first to avoid overwriting the mainnet types.
   */
  if (IS_TESTNET) {
    testnetAssetLists = await generateAssetListFile({
      chains: testnetChainList.chains,
      assetList: testnetResponseAssetList,
      environment: "testnet",
      overwriteFile: true,
      onlyTypes: false,
    });
    mainnetAssetLists = await generateAssetListFile({
      chains: mainnetChainList.chains,
      assetList: mainnetResponseAssetList,
      environment: "mainnet",
      overwriteFile: false,
      onlyTypes: true,
    });
  } else {
    mainnetAssetLists = await generateAssetListFile({
      chains: mainnetChainList.chains,
      assetList: mainnetResponseAssetList,
      environment: "mainnet",
      overwriteFile: true,
      onlyTypes: false,
    });
    testnetAssetLists = await generateAssetListFile({
      chains: testnetChainList.chains,
      assetList: testnetResponseAssetList,
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
