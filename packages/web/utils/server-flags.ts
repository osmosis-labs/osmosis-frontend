/**
 * Reads LaunchDarkly flags for API routes through LaunchDarkly's client-side
 * evaluation endpoint, which needs no SDK (the Node client SDK does not run
 * on the Edge runtime) and only the public client-side id the browser
 * already ships with. Used to keep keyed RPC proxies hidden until their flag
 * is on, and as a kill switch afterwards.
 */

/** How long a flag read is reused before asking LaunchDarkly again. */
const FLAG_CACHE_MS = 60_000;
/** A LaunchDarkly read that takes longer than this is treated as failed, so
 *  a hung request falls through to the stale value (or fails closed) instead
 *  of holding every RPC call. Covers the response body as well. */
const FLAG_FETCH_TIMEOUT_MS = 2_000;
/** If LaunchDarkly cannot be reached, a value this old is still trusted
 *  rather than failing closed on a transient error. */
const FLAG_STALE_MS = 10 * 60_000;

type Flags = Record<string, { value?: unknown } | undefined>;

let flagCache: { flags: Flags; readAt: number } | undefined;

/** Test-only: forget the cached flag read. */
export function resetServerFlagCache() {
  flagCache = undefined;
}

const base64url = (s: string) =>
  btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * Whether `flagKey` (the kebab-case LaunchDarkly key) is on for the server.
 * Without a client-side id nothing can be evaluated: local development
 * stays open, any deployed build fails closed rather than exposing a route
 * because an env var went missing.
 */
export async function isServerFlagEnabled(flagKey: string): Promise<boolean> {
  const clientSideId = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;
  if (!clientSideId) return process.env.NODE_ENV === "development";

  const now = Date.now();
  if (flagCache && now - flagCache.readAt < FLAG_CACHE_MS) {
    return flagCache.flags[flagKey]?.value === true;
  }

  try {
    const context = base64url(
      JSON.stringify({
        kind: "user",
        key: "osmosis-frontend-server",
        anonymous: true,
      })
    );
    const response = await fetch(
      `https://clientsdk.launchdarkly.com/sdk/evalx/${clientSideId}/contexts/${context}`,
      { signal: AbortSignal.timeout(FLAG_FETCH_TIMEOUT_MS) }
    );
    if (!response.ok) throw new Error(`LaunchDarkly ${response.status}`);
    const flags = (await response.json()) as Flags;
    flagCache = { flags, readAt: now };
    return flags[flagKey]?.value === true;
  } catch {
    if (flagCache && now - flagCache.readAt < FLAG_STALE_MS) {
      return flagCache.flags[flagKey]?.value === true;
    }
    return false;
  }
}
