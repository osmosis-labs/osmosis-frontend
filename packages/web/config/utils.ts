import type { Asset, AssetList, Chain } from "@osmosis-labs/types";
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
    console.error(
      `Failed to fetch image from ${imageUrl}: ${response.statusText}`
    );
    return null;
  }

  if (!response.body) {
    console.error(
      `Failed to fetch image from ${imageUrl}: ${response.statusText}`
    );
    return null;
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
/**
 * Chains in the generated list. `keplrChain` and CosmosKit's `fees`/`staking` are derived
 * at runtime in `config/keplr-chain.ts` instead of being stored here.
 */
export function getChainList({
  assetLists,
  chains,
  environment,
}: {
  assetLists: AssetList[];
  chains: Chain[];
  environment: "testnet" | "mainnet";
}): Chain[] {
  return chains.flatMap((chain) => {
    const isOsmosis =
      chain.chain_name === "osmosis" || chain.chain_name === "osmosistestnet";
    const chainId = isOsmosis
      ? OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id
      : chain.chain_id;

    // The Keplr chain store needs each chain's currencies, which come from its asset list.
    if (!assetLists.some(({ chain_id }) => chain_id === chainId)) {
      const log = environment === "mainnet" ? console.error : console.warn;
      log(
        `Failed to find currencies for ${chain.chain_name} (${chain.chain_id})`
      );
      return [];
    }

    return {
      ...chain,
      features: chain.features ?? [],
      chain_id: chainId,
      prettyName: isOsmosis
        ? OSMOSIS_CHAIN_NAME_OVERWRITE ?? chain.prettyName
        : chain.prettyName,
      apis: {
        rpc:
          isOsmosis && OSMOSIS_RPC_OVERWRITE
            ? [{ address: OSMOSIS_RPC_OVERWRITE }]
            : chain.apis?.rpc ?? [],
        rest:
          isOsmosis && OSMOSIS_REST_OVERWRITE
            ? [{ address: OSMOSIS_REST_OVERWRITE }]
            : chain.apis?.rest ?? [],
      },
      explorers: (chain.explorers ?? []).map((explorer) => ({
        ...explorer,
        txPage: explorer.txPage.replace("${", "{"),
      })),
    };
  });
}
