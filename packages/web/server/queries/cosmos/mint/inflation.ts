import { apiClient, getChain } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface MintingInflation {
  inflation: string;
}

export function queryInflation({
  chainId = ChainList[0].chain_id,
}: {
  chainId?: string;
} = {}): Promise<MintingInflation> {
  const chain = getChain({ chainId, chainList: ChainList });

  if (!chain) throw new Error(`Chain ${chainId} not found`);

  const url = new URL(
    "/cosmos/mint/v1beta1/inflation",
    chain.apis.rest[0].address
  );
  return apiClient<MintingInflation>(url.toString());
}
