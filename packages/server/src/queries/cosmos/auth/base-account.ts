import { createNodeQuery } from "../../create-node-query";

interface PubKey {
  "@type": string;
  key: string;
}

export const BaseAccountTypeStr = "/cosmos.auth.v1beta1.BaseAccount";

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

export type VestingAccount = {
  account: {
    "@type": string;
    base_vesting_account: {
      base_account: {
        address: string;
        pub_key: PubKey | null;
        /** Int */
        account_number: string;
        /** Int */
        sequence: string;
      };
    };
  };
};

export const queryBaseAccount = createNodeQuery<
  BaseAccount | VestingAccount,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) => `/cosmos/auth/v1beta1/accounts/${bech32Address}`,
});
