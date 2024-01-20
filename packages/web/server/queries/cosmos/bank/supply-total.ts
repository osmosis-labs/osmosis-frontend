import { apiClient, getChain } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

export interface SupplyTotal {
  amount: {
    denom: string;
    amount: string;
  };
}

export function querySupplyTotal({
  chainId = ChainList[0].chain_id,
  denom,
}: {
  chainId?: string;
  denom: string;
}): Promise<SupplyTotal> {
  const chain = getChain({ chainId, chainList: ChainList });

  if (!chain) throw new Error(`Chain ${chainId} not found`);

  const url = new URL(
    `/cosmos/bank/v1beta1/supply/by_denom?denom=${denom}`,
    chain.apis.rest[0].address
  );
  return apiClient<SupplyTotal>(url.toString());
}
