import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface CosmosAccount {
  "@type": "/cosmos.auth.v1beta1.BaseAccount";
  address: string;
  pub_key: {
    "@type": "/cosmos.crypto.secp256k1.PubKey";
    key: string;
  };
  /**
   * Numerical string
   */
  account_number: string;
  /**
   * Numerical string
   */
  sequence: string;
}

export async function queryCosmosAccount({ address }: { address: string }) {
  const url = new URL(
    `cosmos/auth/v1beta1/accounts/${address}`,
    ChainList[0].apis.rest[0].address
  );
  return await apiClient<{ account: CosmosAccount }>(url.toString());
}
