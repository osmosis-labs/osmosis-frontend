/**
 * @file usdc-identity.ts
 * @description Resolves which denom the build under test attaches to the
 * symbol "USDC".
 *
 * The assetlist identity handover moved "USDC" from Noble to the allUSDC
 * alloy, but builds pick their assetlist up at build time, so during the
 * transition some deployments still resolve "USDC" to Noble while others
 * resolve it to the alloy. Specs that assert on the USDC denom must derive
 * the expectation from the build they are running against rather than
 * hardcode it: hardcoding the alloy fails on pre-handover builds, and
 * accepting either denom would let a handover build silently regress to
 * routing through Noble.
 */

const ALLOY_DENOM =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";
const NOBLE_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

/**
 * Asks the app's own asset endpoint what "USDC" resolves to. Uses the edge
 * tRPC assets router (`/api/edge-trpc-assets`, the same route the UI calls),
 * so the answer is exactly the identity the token selector will use.
 *
 * Fails loudly rather than falling back: a wrong guess here would either
 * mask a regression or fail every USDC test for the wrong reason.
 */
export async function resolveAppUsdcDenom(
  baseUrl: string = process.env.BASE_URL ?? "https://stage.osmosis.zone"
): Promise<string> {
  const input = encodeURIComponent(
    JSON.stringify({ json: { findMinDenomOrSymbol: "USDC" } })
  );
  const url = `${baseUrl.replace(/\/+$/, "")}/api/edge-trpc-assets/assets.getUserAsset?input=${input}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(
      `Failed to resolve the app's USDC identity: ${response.status} ${response.statusText} (${url})`
    );
  }
  const body = (await response.json()) as {
    result?: { data?: { json?: { coinMinimalDenom?: string } } };
  };
  const denom = body.result?.data?.json?.coinMinimalDenom;
  if (denom !== ALLOY_DENOM && denom !== NOBLE_DENOM) {
    throw new Error(
      `Unexpected USDC identity from ${baseUrl}: ${denom ?? "<none>"}`
    );
  }
  console.log(
    `  App "USDC" identity: ${denom === ALLOY_DENOM ? "allUSDC (alloy)" : "Noble"} (${denom})`
  );
  return denom;
}
