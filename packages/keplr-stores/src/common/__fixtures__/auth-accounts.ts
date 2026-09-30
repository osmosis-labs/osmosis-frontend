/**
 * `/cosmos/auth/v1beta1/accounts/{address}` responses covering each account
 * wrapper BaseAccount.fromProtoJSON unwraps. Expected values were recorded from
 * @keplr-wallet/cosmos@0.10.24's parser, which this code replaced.
 */
export const authAccountFixtures: {
  name: string;
  response: { account?: any };
  defaultAddress?: string;
  expected:
    | { type: string; address: string; accountNumber: string; sequence: string }
    | "throws";
}[] = [
  {
    name: "base account",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.BaseAccount",
        address: "osmo1base",
        pub_key: null,
        account_number: "123",
        sequence: "45",
      },
    },
    expected: {
      type: "/cosmos.auth.v1beta1.BaseAccount",
      address: "osmo1base",
      accountNumber: "123",
      sequence: "45",
    },
  },
  {
    name: "account number above 2^53 and at uint64 max",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.BaseAccount",
        address: "osmo1big",
        account_number: "18446744073709551615",
        sequence: "9007199254740993",
      },
    },
    expected: {
      type: "/cosmos.auth.v1beta1.BaseAccount",
      address: "osmo1big",
      accountNumber: "18446744073709551615",
      sequence: "9007199254740993",
    },
  },
  {
    name: "account number and sequence omitted",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.BaseAccount",
        address: "osmo1fresh",
      },
    },
    expected: {
      type: "/cosmos.auth.v1beta1.BaseAccount",
      address: "osmo1fresh",
      accountNumber: "0",
      sequence: "0",
    },
  },
  {
    name: "ethermint EthAccount embedding base_account",
    response: {
      account: {
        "@type": "/ethermint.types.v1.EthAccount",
        base_account: {
          address: "evmos1eth",
          account_number: "7",
          sequence: "8",
        },
        code_hash: "0xc5d2",
      },
    },
    expected: {
      type: "/ethermint.types.v1.EthAccount",
      address: "evmos1eth",
      accountNumber: "7",
      sequence: "8",
    },
  },
  {
    name: "continuous vesting account",
    response: {
      account: {
        "@type": "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
        base_vesting_account: {
          base_account: {
            address: "osmo1vest",
            account_number: "9",
            sequence: "10",
          },
          original_vesting: [],
        },
        start_time: "0",
      },
    },
    expected: {
      type: "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
      address: "osmo1vest",
      accountNumber: "9",
      sequence: "10",
    },
  },
  {
    name: "camelCase vesting account",
    response: {
      account: {
        "@type": "/cosmos.vesting.v1beta1.DelayedVestingAccount",
        baseVestingAccount: {
          baseAccount: {
            address: "osmo1camel",
            account_number: "13",
            sequence: "14",
          },
        },
      },
    },
    expected: {
      type: "/cosmos.vesting.v1beta1.DelayedVestingAccount",
      address: "osmo1camel",
      accountNumber: "13",
      sequence: "14",
    },
  },
  {
    name: "desmos profile embedding account",
    response: {
      account: {
        "@type": "/desmos.profiles.v3.Profile",
        account: {
          "@type": "/cosmos.auth.v1beta1.BaseAccount",
          address: "desmos1profile",
          account_number: "11",
          sequence: "12",
        },
        dtag: "someone",
      },
    },
    expected: {
      type: "/desmos.profiles.v3.Profile",
      address: "desmos1profile",
      accountNumber: "11",
      sequence: "12",
    },
  },
  {
    name: "module account",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.ModuleAccount",
        base_account: {
          address: "osmo1module",
          account_number: "3",
          sequence: "0",
        },
        name: "distribution",
        permissions: [],
      },
    },
    expected: {
      type: "/cosmos.auth.v1beta1.ModuleAccount",
      address: "osmo1module",
      accountNumber: "3",
      sequence: "0",
    },
  },
  {
    name: "not found, with default address",
    response: {
      code: 5,
      message: "rpc error: code = NotFound desc = account osmo1new not found",
      details: [],
    } as { account?: any },
    defaultAddress: "osmo1new",
    expected: {
      type: "",
      address: "osmo1new",
      accountNumber: "0",
      sequence: "0",
    },
  },
  {
    name: "not found, without default address",
    response: { code: 5, message: "not found", details: [] } as {
      account?: any;
    },
    expected: "throws",
  },
  {
    name: "account without address, with default address",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.BaseAccount",
        account_number: "5",
        sequence: "6",
      },
    },
    defaultAddress: "osmo1fallback",
    expected: {
      type: "/cosmos.auth.v1beta1.BaseAccount",
      address: "osmo1fallback",
      accountNumber: "5",
      sequence: "6",
    },
  },
  {
    name: "account without address, without default address",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.BaseAccount",
        account_number: "5",
      },
    },
    expected: "throws",
  },
  {
    name: "non-integer account number",
    response: {
      account: {
        "@type": "/cosmos.auth.v1beta1.BaseAccount",
        address: "osmo1bad",
        account_number: "1.5",
        sequence: "1",
      },
    },
    expected: "throws",
  },
];
