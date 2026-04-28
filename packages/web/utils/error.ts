export function captureError(e: any) {
  if (e instanceof Error) {
    console.error(e);
  } else if (process.env.NODE_ENV === "development") {
    console.warn("Did not capture non-Error:", e);
  }
}

/**
 * Marker prefix used by the bridge-transfer tRPC router to tag Osmosis-source
 * withdrawal quote failures that are caused by the user holding no fee token
 * with sufficient balance (e.g. an alt-fee token whose txfees routing pool has
 * no liquidity). The client checks for this prefix to render the dedicated
 * "insufficient fee tokens" warning instead of the generic error box.
 *
 * Producer: `packages/web/server/api/routers/bridge-transfer.ts`
 * Consumer: `packages/web/components/bridge/use-bridge-quotes.ts`
 *
 * Both sides MUST reference this constant (do not hardcode the string).
 */
export const INSUFFICIENT_FEE_TOKENS_OSMOSIS_MARKER =
  "INSUFFICIENT_FEE_TOKENS_OSMOSIS";
