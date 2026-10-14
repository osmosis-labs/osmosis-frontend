import { Pool } from "@osmosis-labs/server";
import type { PoolRawResponse } from "@osmosis-labs/types";
import {
  CONCENTRATED_LIQ_POOL_TYPE,
  COSMWASM_POOL_TYPE,
  STABLE_POOL_TYPE,
  WEIGHTED_POOL_TYPE,
} from "@osmosis-labs/types";

const typeUrls: Partial<Record<Pool["type"], string>> = {
  weighted: WEIGHTED_POOL_TYPE,
  stable: STABLE_POOL_TYPE,
  concentrated: CONCENTRATED_LIQ_POOL_TYPE,
};

/** Chain-shaped pool for the deprecated `/api/pools` routes. */
export function toLegacyPoolResponse(pool: Pool): PoolRawResponse {
  return {
    ...pool.raw,
    "@type": typeUrls[pool.type] ?? COSMWASM_POOL_TYPE,
  } as PoolRawResponse;
}
