import { createNodeQuery } from "../../base-utils";

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

export const queryCosmosAccount = createNodeQuery<
  { account: CosmosAccount },
  { address: string }
>({
  path: ({ address }) => `cosmos/auth/v1beta1/accounts/${address}`,
});
