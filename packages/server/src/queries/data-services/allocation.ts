import { apiClient } from "@osmosis-labs/utils";

interface Coin {
  denom: string;
  amount: string;
}

interface AccountCoinsResult {
  coin: Coin;
  cap_value: string;
}

interface Category {
  capitalization: string;
  is_best_effort: boolean;
  account_coins_result?: AccountCoinsResult[];
}

interface Categories {
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
    "https://sqs.stage.osmosis.zone/"
    // SIDECAR_BASE_URL
  );

  return apiClient<AllocationResponse>(url.toString());
}
