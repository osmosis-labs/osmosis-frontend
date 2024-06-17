import { createNodeQuery } from "../../create-node-query";

interface PubKey {
  "@type": string;
  key: string;
}

export type BaseAccount = {
  account: {
    "@type": string;
    address: string;
    pub_key: PubKey | null;
    /** Int */
    account_number: string;
    /** Int */
    sequence: string;
  };
};

export const queryBaseAccount = createNodeQuery<
  BaseAccount,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) => `/cosmos/auth/v1beta1/accounts/${bech32Address}`,
});
