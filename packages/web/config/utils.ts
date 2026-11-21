import type { Asset, AssetList, Chain } from "@osmosis-labs/types";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

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

const ALLOWED_IMAGE_EXTENSIONS = new Set(["svg", "png", "webp", "jpg", "jpeg"]);

const HTML_NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  colon: ":",
  tab: "\t",
  newline: "\n",
};

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#x[0-9a-f]+|#[0-9]+|[a-z]+);?/gi,
    (match, entity: string) => {
      const lower = entity.toLowerCase();
      if (lower.startsWith("#x")) {
        const code = Number.parseInt(lower.slice(2), 16);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : "";
      }
      if (lower.startsWith("#")) {
        const code = Number.parseInt(lower.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : "";
      }
      return HTML_NAMED_ENTITIES[lower] ?? match;
    }
  );
}

function isUnsafeSvgHref(rawValue: string): boolean {
  const decoded = decodeHtmlEntities(rawValue)
    // Browsers ignore ASCII control chars and whitespace before scheme matching.
    .replace(/[\u0000-\u0020]+/g, "")
    .toLowerCase();
  return (
    decoded.startsWith("javascript:") ||
    decoded.startsWith("vbscript:") ||
    decoded.startsWith("data:text/html") ||
    decoded.startsWith("data:image/svg+xml")
  );
}

/**
 * Strips active/executable content from third-party SVGs before they are
 * written into `public/tokens/generated/` (defense-in-depth alongside the
 * `default-src 'none'; sandbox` CSP in `public/_headers`).
 */
export function sanitizeSvgContent(svg: string): string {
  let out = svg;
  let prev: string;
  // Loop until fixed point so nested/overlapping payloads (e.g. `<scr<script>ipt>`)
  // cannot reconstruct forbidden tags or event-handler attributes.
  do {
    prev = out;
    out = out
      .replace(
        /<(script|foreignObject|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
        ""
      )
      .replace(
        /<\/?(script|foreignObject|iframe|object|embed)\b[^>]*\/?>/gi,
        ""
      )
      .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  } while (out !== prev);

  // Decode entity-encoded href / xlink:href values before checking schemes.
  out = out.replace(
    /\s+(?:xlink:)?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (full, dq?: string, sq?: string, bare?: string) => {
      const value = dq ?? sq ?? bare ?? "";
      return isUnsafeSvgHref(value) ? "" : full;
    }
  );

  return out;
}

function getNodeImageRelativeFilePath(imageUrl: string, symbol: string) {
  let pathname: string;
  try {
    pathname = new URL(imageUrl).pathname;
  } catch {
    throw new Error(`Invalid image URL: ${imageUrl}`);
  }
  const lastSegment = pathname.split("/").pop() ?? "";
  const dotIndex = lastSegment.lastIndexOf(".");
  const fileType =
    dotIndex >= 0 ? lastSegment.slice(dotIndex + 1).toLowerCase() : "";
  if (!ALLOWED_IMAGE_EXTENSIONS.has(fileType)) {
    throw new Error(
      `Unsupported image extension "${fileType}" for ${imageUrl}`
    );
  }
  const safeSymbol = symbol.toLowerCase();
  if (
    !safeSymbol ||
    safeSymbol.includes("/") ||
    safeSymbol.includes("\\") ||
    safeSymbol.includes("..")
  ) {
    throw new Error(`Unsafe asset symbol for filename: ${symbol}`);
  }
  return path.join("/public", tokensDir, `${safeSymbol}.${fileType}`);
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

const FETCH_ATTEMPTS = 4;
const FETCH_BASE_DELAY_MS = 1_000;
const FETCH_MAX_DELAY_MS = 30_000;
const FETCH_ATTEMPT_TIMEOUT_MS = 30_000;

/**
 * Runs `run` over `groups` with `concurrency` workers. One worker takes a
 * whole group and processes its items in order (items in a group share a
 * target, so they must not run concurrently). Each failed item counts once;
 * once failures exceed `maxFailures`, workers stop taking new groups and the
 * groups still queued are left unattempted, so a broad outage fails fast
 * instead of draining the whole queue through every retry.
 */
export async function runWithFailureLimit<T>(
  groups: T[][],
  {
    concurrency,
    maxFailures,
    run,
    onError,
  }: {
    concurrency: number;
    maxFailures: number;
    run: (item: T) => Promise<unknown>;
    onError?: (error: unknown, item: T) => void;
  }
): Promise<{ failures: number; skipped: number }> {
  const queue = [...groups];
  let failures = 0;
  const worker = async () => {
    while (failures <= maxFailures) {
      const group = queue.shift();
      if (!group) return;
      for (const item of group) {
        try {
          await run(item);
        } catch (e) {
          failures++;
          onError?.(e, item);
        }
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { failures, skipped: queue.length };
}

/** `Retry-After` as milliseconds: either delay-seconds or an HTTP-date. */
function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1_000;
  const atMs = Date.parse(header);
  if (Number.isNaN(atMs)) return undefined;
  const delayMs = atMs - Date.now();
  return delayMs > 0 ? delayMs : undefined;
}

/**
 * Fetch a build-time resource (asset list JSON, asset image), retrying rate
 * limits (429), server errors (5xx) and network errors with exponential
 * backoff, honouring `Retry-After` (delay-seconds or HTTP-date) when the host
 * sends one, capped so one slow host cannot stall a build. Each attempt,
 * including reading its body, is aborted after `FETCH_ATTEMPT_TIMEOUT_MS`, so
 * a stalled connection is retried (and a caller can move on to a mirror)
 * instead of hanging until undici's own minutes-long timeouts. Other statuses
 * (e.g. a dead logo URL's 404) fail at once.
 * @throws When the resource could not be fetched.
 */
export async function fetchWithRetry(url: string): Promise<Response> {
  let lastError = "";
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    let retryAfterMs: number | undefined;
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_ATTEMPT_TIMEOUT_MS),
      });
      if (response.ok) return response;

      lastError = `${response.status} ${response.statusText}`;
      // Release the connection: an unread body keeps its socket busy, and 16
      // workers retrying would otherwise exhaust the pool.
      await response.body?.cancel().catch(() => undefined);
      if (response.status !== 429 && response.status < 500) break;

      retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }

    if (attempt < FETCH_ATTEMPTS) {
      const delayMs = Math.min(
        retryAfterMs ?? FETCH_BASE_DELAY_MS * 2 ** (attempt - 1),
        FETCH_MAX_DELAY_MS
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError}`);
}

/**
 * Download an image from the provided URL and save it to the local file system.
 * Only saves images if the current asset list hash differs from the stored hash or the file doesn't exist.
 * @param params An object containing the image URL, asset information, and current asset list hash.
 * @returns The filename of the saved image or null if skipped.
 * @throws When the image could not be fetched or saved.
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
  const tokensRoot = path.resolve(path.resolve() + "/public" + tokensDir);
  // Ensure the tokens directory exists.
  if (!fs.existsSync(tokensRoot)) {
    fs.mkdirSync(tokensRoot, { recursive: true });
  }

  const filePath = path.resolve(
    path.resolve() + getNodeImageRelativeFilePath(imageUrl, asset.symbol)
  );
  if (!filePath.startsWith(tokensRoot + path.sep)) {
    throw new Error(
      `Resolved image path escapes tokens directory: ${filePath}`
    );
  }

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
  const response = await fetchWithRetry(imageUrl);
  if (!response.body) {
    throw new Error(`Failed to fetch image from ${imageUrl}: empty body`);
  }

  // Save the image through a temporary file and rename it into place only
  // once complete. A download or write that fails part-way would otherwise
  // leave a truncated file at `filePath`, which later builds skip because it
  // exists and the asset list hash matches. `pipeline` (unlike `pipe`) also
  // rejects when the response body errors mid-download.
  const tempFilePath = `${filePath}.download`;
  try {
    await pipeline(
      Readable.fromWeb(
        response.body as import("stream/web").ReadableStream<any>
      ),
      fs.createWriteStream(tempFilePath, { flags: "w" })
    );
    if (filePath.endsWith(".svg")) {
      const rawSvg = fs.readFileSync(tempFilePath, "utf-8");
      fs.writeFileSync(tempFilePath, sanitizeSvgContent(rawSvg), "utf-8");
    }
    fs.renameSync(tempFilePath, filePath);
  } catch (e) {
    fs.rmSync(tempFilePath, { force: true });
    throw new Error(
      `Failed to save image from ${imageUrl} to ${filePath}: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }

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
      ? (OSMOSIS_CHAIN_ID_OVERWRITE ?? chain.chain_id)
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
        ? (OSMOSIS_CHAIN_NAME_OVERWRITE ?? chain.prettyName)
        : chain.prettyName,
      apis: {
        rpc:
          isOsmosis && OSMOSIS_RPC_OVERWRITE
            ? [{ address: OSMOSIS_RPC_OVERWRITE }]
            : (chain.apis?.rpc ?? []),
        rest:
          isOsmosis && OSMOSIS_REST_OVERWRITE
            ? [{ address: OSMOSIS_REST_OVERWRITE }]
            : (chain.apis?.rest ?? []),
      },
      explorers: (chain.explorers ?? []).map((explorer) => ({
        ...explorer,
        txPage: explorer.txPage.replace("${", "{"),
      })),
    };
  });
}
