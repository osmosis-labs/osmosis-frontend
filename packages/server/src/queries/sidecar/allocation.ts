import { Dec } from "@keplr-wallet/unit";
import { apiClient } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from "../../env";

interface Coin {
  denom: string;
  amount: string;
}

export interface AccountCoinsResult {
  coin: Coin;
  cap_value: string;
}

export interface AccountCoinsResultDec {
  coin: Coin;
  cap_value: Dec;
}
export interface Category {
  capitalization: string;
  is_best_effort: boolean;
  account_coins_result?: AccountCoinsResult[];
}

export interface Categories {
  "in-locks": Category;
  pooled: Category;
  staked: Category;
  "total-assets": Category;
  "unclaimed-rewards": Category;
  unstaking: Category;
  "user-balances": Category;
}

export interface AllocationResponse {
  categories: Categories;
}

export async function queryAllocation({
  address,
}: {
  address: string;
}): Promise<AllocationResponse> {
  const url = new URL(
    `passthrough/portfolio-assets/${address}`,
    SIDECAR_BASE_URL
  );

  return apiClient<AllocationResponse>(url.toString());
}
