import { ChainList } from "~/config/generated/chain-list";
import { apiClient } from "~/utils/api-client";

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
  return await apiClient<{ account: CosmosAccount }>(
    ChainList[0].apis.rest[0].address +
      `cosmos/auth/v1beta1/accounts/${address}`
  );
}
