import { ChainInfos } from "../../../config/generated/chain-infos";
import { queryNode } from "../../utils";

export type QueryBalancesResponse = {
  balances: {
    denom: string;
    amount: string;
  }[];
};

export async function queryBalances(
  bech32Address: string
): Promise<QueryBalancesResponse> {
  return queryNode(
    ChainInfos[0].rest,
    `cosmos/bank/v1beta1/balances/${bech32Address}`
  );
}
