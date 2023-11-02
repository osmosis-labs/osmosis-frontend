import { apiClient } from "~/utils/api-client";

import { ChainList } from "../../../config/generated/chain-list";

export type QueryBalancesResponse = {
  balances: {
    denom: string;
    amount: string;
  }[];
};

export async function queryBalances(
  bech32Address: string
): Promise<QueryBalancesResponse> {
  return apiClient<QueryBalancesResponse>(
    ChainList[0].apis.rest[0].address +
      `/cosmos/bank/v1beta1/balances/${bech32Address}`
  );
}
