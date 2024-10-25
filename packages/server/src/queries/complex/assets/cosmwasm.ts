import { Chain } from "@osmosis-labs/types";

import { queryCosmWasmContractBalance } from "../../cosmwasm/wasm/balance";

export function getCosmWasmContractBalance({
  contractAddress,
  userBech32Address,
  chainList,
  chainId,
}: {
  contractAddress: string;
  userBech32Address: string;
  chainList: Chain[];
  chainId?: string;
}) {
  return queryCosmWasmContractBalance({
    contractAddress,
    userBech32Address,
    chainList,
    chainId,
  });
}
