import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

import { ICNS_RESOLVER_CONTRACT_ADDRESS } from ".";

interface ICNSNameResponse {
  names: string[];
  primary_name: string;
}

export function queryICNSName({
  address,
}: {
  address: string;
}): Promise<ICNSNameResponse> {
  const msg = JSON.stringify({
    icns_names: { address: address },
  });
  const encodedMsg = Buffer.from(msg).toString("base64");

  const url = new URL(
    `/cosmwasm/wasm/v1/contract/${ICNS_RESOLVER_CONTRACT_ADDRESS}/smart/${encodedMsg}`,
    ChainList[0].apis.rest[0].address
  );
  return apiClient<ICNSNameResponse>(url.toString());
}
