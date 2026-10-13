/**
 * This file generates asset-lists.ts and chain-list.ts. Assets are fetched and
 * embedded as a lossless compact table, decoded once into the existing API.
 *
 * Reasons we need to generate chain-list.ts:
 *  1. We need to apply the Osmosis chain overwrites and drop chains without an asset list.
 *  2. We need to determine all the available chain ids for added type safety.
 *
 * The Keplr `ChainInfo` and CosmosKit fields are derived at runtime (see `keplr-chain.ts`), not stored.
 *
 * Reasons we need to generate asset-lists.ts:
 *  1. We need to determine all the available asset symbols for added type safety.
 */

import { queryGithubFile, queryLatestCommitHash } from "@osmosis-labs/server";
import type { Asset, AssetList, Chain, ChainList } from "@osmosis-labs/types";
import { ApiClientError, isNil } from "@osmosis-labs/utils";
import * as fs from "fs";

import { generateTsFile } from "~/utils/codegen";

import { resolveAssetChain } from "./asset-chain";
import { encodeAssetLists } from "./compact-asset-list";
import {
  ASSET_LIST_COMMIT_HASH,
  GITHUB_API_TOKEN,
  IS_TESTNET,
  OSMOSIS_CHAIN_ID_OVERWRITE,
  OSMOSIS_CHAIN_NAME_OVERWRITE,
} from "./env";
import { getImageRelativeFilePath } from "./keplr-chain";
import type { ResponseAssetList } from "./load-asset-list";
import { loadBuildAssetList } from "./load-asset-list";
import {
  codegenDir,
  getChainList,
  getOsmosisChainId,
  runWithFailureLimit,
  saveAssetImageToTokensDir,
  writeCurrentAssetListHash,
} from "./utils";

const repo = "osmosis-labs/assetlists";

const IMAGE_DOWNLOAD_CONCURRENCY = 16;
const IMAGE_DOWNLOAD_MAX_FAILURES = 10;

function getFilePath({
  chainId,
  fileType,
}: {
  chainId: string;
  fileType: "assetlist" | "chainlist";
}) {
  return `${chainId}/generated/frontend/${fileType}.json`;
}

async function queryBuildAssetList(chainId: string, commitHash: string) {
  return loadBuildAssetList({
    chainId,
    commitHash,
    queryFile: (filePath, hash) =>
      queryGithubFile({ repo, filePath, commitHash: hash }),
    isNotFound: (error) =>
      error instanceof ApiClientError && error.status === 404,
  });
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
  ].filter(
    (chain) => typeof chain.chain_id === "string" && chain.chain_id.length > 0
  );

  let content: string = "";

  const chainIdTypeName =
    environment === "mainnet" ? "MainnetChainIds" : "TestnetChainIds";

  if (!onlyTypes) {
    content += `
      import type { Chain } from "@osmosis-labs/types";
      export const ChainList: ( Omit<Chain, "chain_id"> & { chain_id: ${chainIdTypeName} })[] = ${JSON.stringify(
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

  if (
    !(await generateTsFile(content, codegenDir, "chain-list.ts", overwriteFile))
  )
    throw new Error("Failed to generate chain list file");
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
    ? (OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id ?? "")
    : (chain.chain_id ?? "");
  const chainName = chain.chain_name;
  const imageUrl = asset?.logoURIs?.svg ?? asset?.logoURIs?.png;

  const augmentedAsset: Asset = {
    ...asset,
    logoURIs: asset.logoURIs ?? {
      png: "",
      svg: "",
    },
    relative_image_url: imageUrl
      ? getImageRelativeFilePath(imageUrl, asset.symbol)
      : "",
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
    const chain = resolveAssetChain(asset, chains, osmosisChainId);
    return createOrAddToAssetList(acc, chain, asset, environment);
  }, [] as AssetList[]);

  let content: string = "";

  if (!onlyTypes) {
    content += `
      import { decodeAssetLists } from "../compact-asset-list";
      export const AssetLists = decodeAssetLists(${JSON.stringify(
        encodeAssetLists(assetLists)
      )});
    `;
  }

  // create available symbols type
  content += `    
    export type ${
      environment === "testnet" ? "TestnetAssetSymbols" : "MainnetAssetSymbols"
    } = ${Array.from(new Set(assetList.assets.map((asset) => asset.symbol)))
      .map(
        (symbol) =>
          `"${symbol}" /** source denom: ${
            assetList.assets.find((asset) => asset.symbol === symbol)!
              .sourceDenom
          } */`
      )
      .join(" | ")};
  `;

  content += `    
    export type ${
      environment === "testnet"
        ? "TestnetVariantGroupKeys"
        : "MainnetVariantGroupKeys"
    } = ${Array.from(
      new Set(assetList.assets.map((asset) => asset.variantGroupKey))
    )
      .filter((groupKey, index, self) => {
        if (isNil(groupKey)) {
          return false;
        }

        // remove duplicates
        return self.indexOf(groupKey) === index;
      })
      .map(
        (groupKey) =>
          `"${groupKey}" /** Symbols: ${assetList.assets
            .filter((asset) => asset.variantGroupKey === groupKey)!
            .map((asset) => asset.symbol)
            .join(",")} */`
      )
      .join(" | ")};
  `;

  const success = await generateTsFile(
    content,
    codegenDir,
    "asset-lists.ts",
    overwriteFile
  );

  if (success) {
    if (overwriteFile) {
      const addedAssetsSize = assetLists
        .flatMap(({ assets }) => assets)
        .reduce((acc, asset) => {
          acc.add(asset.symbol);
          return acc;
        }, new Set()).size;
      console.info("Successfully added", addedAssetsSize, "assets");
    }
    return assetLists;
  } else {
    throw new Error("Failed to write asset list file.");
  }
}

async function generateAssetImages({
  assetList,
  commitHash,
}: {
  assetList: ResponseAssetList;
  commitHash: string;
}) {
  console.time("Successfully downloaded images");
  // ~1300 images: downloading them one at a time dominated build time on
  // fresh clones (~3 min), so fetch with a small pool of workers instead.
  // Assets sharing a symbol write to the same file, so group them by path and
  // download each group in order on one worker. That avoids concurrent writes
  // to one path and keeps the previous sequential behavior: the last
  // successful download wins, and a failed one leaves an earlier image.
  const downloads = new Map<
    string,
    { imageUrl: string; asset: Pick<Asset, "symbol"> }[]
  >();
  for (const asset of assetList.assets) {
    const imageUrl = asset?.logoURIs?.svg ?? asset?.logoURIs?.png;
    if (!imageUrl) continue;
    const filePath = getImageRelativeFilePath(imageUrl, asset.symbol);
    const candidates = downloads.get(filePath) ?? [];
    candidates.push({ imageUrl, asset });
    downloads.set(filePath, candidates);
  }

  // A few dead logo URLs in the asset list shouldn't block a deploy, but a
  // wave of failures (a rate limit that outlasted the retries, a host outage)
  // would otherwise ship with missing logos and exit 0. Once the limit is
  // passed the build is going to fail anyway, so the pool stops taking new
  // groups rather than spending up to three capped waits on each remaining
  // image.
  const { failures, skipped } = await runWithFailureLimit(
    Array.from(downloads.values()),
    {
      concurrency: IMAGE_DOWNLOAD_CONCURRENCY,
      maxFailures: IMAGE_DOWNLOAD_MAX_FAILURES,
      run: (download) =>
        saveAssetImageToTokensDir({
          ...download,
          currentAssetListHash: commitHash,
        }),
      onError: (e) => console.error(e instanceof Error ? e.message : e),
    }
  );
  console.timeEnd("Successfully downloaded images");

  if (failures > IMAGE_DOWNLOAD_MAX_FAILURES) {
    throw new Error(
      `${failures} asset images failed to download (more than ${IMAGE_DOWNLOAD_MAX_FAILURES} allowed); ` +
        `stopped with ${skipped} image groups not attempted.`
    );
  }
  if (failures > 0) {
    console.warn(`${failures} asset images failed to download.`);
  }
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
  if (!fs.existsSync(codegenDir)) {
    fs.mkdirSync(codegenDir);
  }

  const mainnetOsmosisChainId = getOsmosisChainId("mainnet");
  const testnetOsmosisChainId = getOsmosisChainId("testnet");

  const mainLatestCommitHash =
    ASSET_LIST_COMMIT_HASH ?? (await getLatestCommitHash());

  if (!mainLatestCommitHash) {
    throw new Error("Failed to get latest commit hash");
  }

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
    queryBuildAssetList(mainnetOsmosisChainId, mainLatestCommitHash),
    queryBuildAssetList(testnetOsmosisChainId, mainLatestCommitHash),
  ]);

  await generateAssetImages({
    assetList: IS_TESTNET ? testnetResponseAssetList : mainnetResponseAssetList,
    commitHash: mainLatestCommitHash,
  });

  writeCurrentAssetListHash(mainLatestCommitHash);

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
