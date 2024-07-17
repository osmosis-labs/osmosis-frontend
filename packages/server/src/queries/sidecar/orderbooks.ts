import { apiClient } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from "../../env";

export type CanonicalOrderbooksResponse = {
  base: string;
  quote: string;
  pool_id: number;
}[];

export async function queryCanonicalOrderbooks() {
  const url = new URL("/pools/canonical-orderbooks", SIDECAR_BASE_URL);
  return await apiClient<CanonicalOrderbooksResponse>(url.toString());
}
