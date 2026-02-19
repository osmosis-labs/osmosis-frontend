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

/**
 * Osmosis RPC endpoint used for signing transactions.
 *
 * Resolution order:
 * 1. `OSMOSIS_RPC` (explicit override)
 * 2. `NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE` (frontend var)
 * 3. `https://rpc.osmosis.zone`
 */
export const OSMOSIS_RPC =
  process.env.OSMOSIS_RPC ??
  process.env.NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE ??
  "https://rpc.osmosis.zone";
