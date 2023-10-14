import { apiClient } from "~/utils/api-client";

import { ChainInfos } from "../../../config/generated/chain-infos";

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
    ChainInfos[0].rest + `/cosmos/bank/v1beta1/balances/${bech32Address}`
  );
}
