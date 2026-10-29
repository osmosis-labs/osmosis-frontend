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
 * Numia data services endpoint the frontend reads market data from.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_HISTORICAL_DATA_URL` (frontend var, see packages/web/.env)
 * 2. `https://data.app.osmosis.zone`
 *
 * This matches packages/web/.env, not the `data.stage` fallback in
 * packages/server/src/env.ts, which the deployments don't use.
 */
export const DATA_SERVICES_BASE_URL = (
  process.env.NEXT_PUBLIC_HISTORICAL_DATA_URL ?? "https://data.app.osmosis.zone"
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

