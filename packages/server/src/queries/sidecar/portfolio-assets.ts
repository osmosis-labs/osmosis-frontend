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

export interface PortfolioAssetsResponse {
  categories: Categories;
}

export async function queryPortfolioAssets({
  address,
}: {
  address: string;
}): Promise<PortfolioAssetsResponse> {
  const url = new URL(
    `passthrough/portfolio-assets/${address}`,
    SIDECAR_BASE_URL
  );

  return apiClient<PortfolioAssetsResponse>(url.toString());
}
