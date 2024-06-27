import type { Chain } from "@osmosis-labs/types";

export const MockChains: Chain[] = [
  {
    chain_name: "osmosis",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Osmosis",
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    bech32_config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uosmo",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uosmo",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "Swap, earn, and build on the leading decentralized Cosmos exchange.",
    apis: {
      rpc: [
        {
          address: "https://rpc-osmosis.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-osmosis.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/cosmos/txs/${txHash}",
      },
    ],
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
  },
  {
    chain_name: "cosmoshub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Cosmos Hub",
    chain_id: "cosmoshub-4",
    bech32_prefix: "cosmos",
    bech32_config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uatom",
          fixed_min_gas_price: 0,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.03,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uatom",
        },
      ],
    },
    description:
      "Cosmos Hub is the gateway to a rapidly expanding ecosystem of independent interconnected blockchains built using developer-friendly application components and connected with ground-breaking IBC (Inter-Blockchain Communication) protocol.",
    apis: {
      rpc: [
        {
          address: "https://rpc-cosmoshub.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-cosmoshub.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/osmosis/txs/${txHash}",
      },
    ],
    features: ["ibc-go", "ibc-transfer"],
  },
  {
    chain_name: "juno",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Juno",
    chain_id: "juno-1",
    bech32_prefix: "juno",
    bech32_config: {
      bech32PrefixAccAddr: "juno",
      bech32PrefixAccPub: "junopub",
      bech32PrefixValAddr: "junovaloper",
      bech32PrefixValPub: "junovaloperpub",
      bech32PrefixConsAddr: "junovalcons",
      bech32PrefixConsPub: "junovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "ujuno",
          fixed_min_gas_price: 0.075,
          low_gas_price: 0.075,
          average_gas_price: 0.1,
          high_gas_price: 0.125,
        },
        {
          denom:
            "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          fixed_min_gas_price: 0.003,
          low_gas_price: 0.003,
          average_gas_price: 0.0035,
          high_gas_price: 0.004,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "ujuno",
        },
      ],
    },
    description:
      "Juno is a completely community owned and operated smart contract platform.",
    apis: {
      rpc: [
        {
          address: "https://rpc-juno.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-juno.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/juno/txs/${txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
  },
  {
    chain_name: "injective",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Injective",
    chain_id: "injective-1",
    bech32_prefix: "inj",
    bech32_config: {
      bech32PrefixAccAddr: "inj",
      bech32PrefixAccPub: "injpub",
      bech32PrefixValAddr: "injvaloper",
      bech32PrefixValPub: "injvaloperpub",
      bech32PrefixConsAddr: "injvalcons",
      bech32PrefixConsPub: "injvalconspub",
    },
    slip44: 60,
    fees: {
      fee_tokens: [
        {
          denom: "inj",
          fixed_min_gas_price: 500000000,
          low_gas_price: 500000000,
          average_gas_price: 700000000,
          high_gas_price: 900000000,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "inj",
        },
      ],
    },
    description:
      "Injective’s mission is to create a truly free and inclusive financial system through decentralization.",
    apis: {
      rpc: [
        {
          address: "https://public.api.injective.network",
        },
      ],
      rest: [
        {
          address: "https://public.lcd.injective.network",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://explorer.injective.network/transaction/${txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
  },
  {
    chain_name: "secretnetwork",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Secret Network",
    chain_id: "secret-4",
    bech32_prefix: "secret",
    bech32_config: {
      bech32PrefixAccAddr: "secret",
      bech32PrefixAccPub: "secretpub",
      bech32PrefixValAddr: "secretvaloper",
      bech32PrefixValPub: "secretvaloperpub",
      bech32PrefixConsAddr: "secretvalcons",
      bech32PrefixConsPub: "secretvalconspub",
    },
    slip44: 529,
    alternative_slip44s: [118],
    fees: {
      fee_tokens: [
        {
          denom: "uscrt",
          fixed_min_gas_price: 0.1,
          low_gas_price: 0.1,
          average_gas_price: 0.1,
          high_gas_price: 0.25,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uscrt",
        },
      ],
    },
    description:
      "Secret Network is the first blockchain with customizable privacy. You get to choose what you share, with whom, and how. This protects users, and empowers developers to build a better Web3.",
    apis: {
      rpc: [
        {
          address: "https://rpc-secret.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-secret.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page:
          "https://secretnodes.com/secret/chains/secret-4/transactions/${txHash}",
      },
    ],
    features: [
      "ibc-transfer",
      "ibc-go",
      "secretwasm",
      "cosmwasm",
      "wasmd_0.24+",
    ],
  },
  {
    chain_name: "axelar",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Axelar",
    chain_id: "axelar-dojo-1",
    bech32_prefix: "axelar",
    bech32_config: {
      bech32PrefixAccAddr: "axelar",
      bech32PrefixAccPub: "axelarpub",
      bech32PrefixValAddr: "axelarvaloper",
      bech32PrefixValPub: "axelarvaloperpub",
      bech32PrefixConsAddr: "axelarvalcons",
      bech32PrefixConsPub: "axelarvalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uaxl",
          fixed_min_gas_price: 0.007,
          low_gas_price: 0.007,
          average_gas_price: 0.007,
          high_gas_price: 0.01,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uaxl",
        },
      ],
    },
    description:
      "Axelar delivers secure cross-chain communication for Web3. Our infrastructure enables dApp users to interact with any asset or application, on any chain, with one click.",
    apis: {
      rpc: [
        {
          address: "https://rpc-axelar.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-axelar.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://axelarscan.io/tx/${txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "axelar-evm-bridge"],
  },
];
