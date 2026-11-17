/**
 * @file config.ts
 * @description Shared configuration constants for e2e utilities.
 *
 * Centralises endpoint resolution so that scripts and test utilities
 * use consistent URLs. Each constant checks dedicated env vars first,
 * then falls back to the same vars the frontend uses, and finally to
 * sensible defaults.
 */

/**
 * SQS endpoint used for price lookups, active-order queries, etc.
 *
 * Resolution order:
 * 1. `SQS_URL` (explicit override)
 * 2. `NEXT_PUBLIC_SIDECAR_BASE_URL` (frontend var, see packages/web/.env)
 * 3. `https://sqs.osmosis.zone`
 */
export const SQS_BASE_URL = (
  process.env.SQS_URL ??
  process.env.NEXT_PUBLIC_SIDECAR_BASE_URL ??
  "https://sqs.osmosis.zone"
).replace(/\/+$/, "");

/**
 * Osmosis LCD/REST endpoint used for balance queries.
 *
 * Resolution order:
 * 1. `REST_ENDPOINT` (explicit override)
 * 2. `https://lcd.osmosis.zone`
 */
export const REST_ENDPOINT =
  process.env.REST_ENDPOINT ?? "https://lcd.osmosis.zone";

/** GETs a path on REST_ENDPOINT as JSON, throwing on a non-OK response. */
export async function lcdGet<T>(path: string, timeoutMs = 15_000): Promise<T> {
  const url = `${REST_ENDPOINT.replace(/\/+$/, "")}${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`LCD ${res.status} for ${url}`);
  return (await res.json()) as T;
}

