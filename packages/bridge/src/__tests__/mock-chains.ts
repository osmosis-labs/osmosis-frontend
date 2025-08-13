import type { Chain } from "@osmosis-labs/types";

export const MockChains: Chain[] = [
  {
    chain_name: "osmosis",
    status: "live",
    networkType: "mainnet",
    prettyName: "Osmosis",
    chain_id: "osmosis-1",
    bech32Prefix: "osmo",
    bech32Config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    feeCurrencies: [
      {
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinDenom: "OSMO",
        coinGeckoId: "",
        fixed_min_gas_price: 0.0025,
        gasPriceStep: {
          low: 0.0025,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    stakeCurrency: {
      coinMinimalDenom: "uosmo",
      coinDenom: "OSMO",
      coinDecimals: 6,
      coinGeckoId: "",
    },
    currencies: [],
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
        txPage: "https://www.mintscan.io/osmosis/txs/{txHash}",
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
    networkType: "mainnet",
    prettyName: "Cosmos Hub",
    chain_id: "cosmoshub-4",
    bech32Prefix: "cosmos",
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    slip44: 118,
    feeCurrencies: [
      {
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinDenom: "ATOM",
        coinGeckoId: "",
        fixed_min_gas_price: 0,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "",
    },
    currencies: [],
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
        txPage: "https://www.mintscan.io/cosmos/txs/{txHash}",
      },
    ],
    features: ["ibc-go", "ibc-transfer"],
  },
  {
    chain_name: "juno",
    status: "live",
    networkType: "mainnet",
    prettyName: "Juno",
    chain_id: "juno-1",
    bech32Prefix: "juno",
    bech32Config: {
      bech32PrefixAccAddr: "juno",
      bech32PrefixAccPub: "junopub",
      bech32PrefixValAddr: "junovaloper",
      bech32PrefixValPub: "junovaloperpub",
      bech32PrefixConsAddr: "junovalcons",
      bech32PrefixConsPub: "junovalconspub",
    },
    slip44: 118,
    feeCurrencies: [
      {
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinDenom: "JUNO",
        coinGeckoId: "",
        fixed_min_gas_price: 0.075,
        gasPriceStep: {
          low: 0.075,
          average: 0.1,
          high: 0.125,
        },
      },
      {
        coinMinimalDenom:
          "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
        coinDecimals: 6,
        coinDenom: "ATOM",
        coinGeckoId: "",
        fixed_min_gas_price: 0.003,
        gasPriceStep: {
          low: 0.003,
          average: 0.0035,
          high: 0.004,
        },
      },
    ],
    stakeCurrency: {
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      coinDenom: "JUNO",
      coinGeckoId: "",
    },
    currencies: [],
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
        txPage: "https://www.mintscan.io/juno/txs/{txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
  },
  {
    chain_name: "injective",
    status: "live",
    networkType: "mainnet",
    prettyName: "Injective",
    chain_id: "injective-1",
    bech32Prefix: "inj",
    bech32Config: {
      bech32PrefixAccAddr: "inj",
      bech32PrefixAccPub: "injpub",
      bech32PrefixValAddr: "injvaloper",
      bech32PrefixValPub: "injvaloperpub",
      bech32PrefixConsAddr: "injvalcons",
      bech32PrefixConsPub: "injvalconspub",
    },
    slip44: 60,
    feeCurrencies: [
      {
        coinMinimalDenom: "inj",
        coinDecimals: 6,
        coinDenom: "INJ",
        coinGeckoId: "",
        fixed_min_gas_price: 500000000,
        gasPriceStep: {
          low: 500000000,
          average: 700000000,
          high: 900000000,
        },
      },
    ],
    stakeCurrency: {
      coinDecimals: 6,
      coinDenom: "INJ",
      coinGeckoId: "",
      coinMinimalDenom: "inj",
    },
    currencies: [],
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
        txPage: "https://explorer.injective.network/transaction/${txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
  },
  {
    chain_name: "secretnetwork",
    status: "live",
    networkType: "mainnet",
    prettyName: "Secret Network",
    chain_id: "secret-4",
    bech32Prefix: "secret",
    bech32Config: {
      bech32PrefixAccAddr: "secret",
      bech32PrefixAccPub: "secretpub",
      bech32PrefixValAddr: "secretvaloper",
      bech32PrefixValPub: "secretvaloperpub",
      bech32PrefixConsAddr: "secretvalcons",
      bech32PrefixConsPub: "secretvalconspub",
    },
    slip44: 529,
    alternativeSlip44s: [118],
    feeCurrencies: [
      {
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinDenom: "SCRT",
        coinGeckoId: "",
        fixed_min_gas_price: 0.1,
        gasPriceStep: {
          low: 0.1,
          average: 0.1,
          high: 0.25,
        },
      },
    ],
    stakeCurrency: {
      coinMinimalDenom: "uscrt",
      coinDecimals: 6,
      coinDenom: "SCRT",
      coinGeckoId: "",
    },
    currencies: [],
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
        txPage:
          "https://secretnodes.com/secret/chains/secret-4/transactions/{txHash}",
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
    networkType: "mainnet",
    prettyName: "Axelar",
    chain_id: "axelar-dojo-1",
    bech32Prefix: "axelar",
    bech32Config: {
      bech32PrefixAccAddr: "axelar",
      bech32PrefixAccPub: "axelarpub",
      bech32PrefixValAddr: "axelarvaloper",
      bech32PrefixValPub: "axelarvaloperpub",
      bech32PrefixConsAddr: "axelarvalcons",
      bech32PrefixConsPub: "axelarvalconspub",
    },
    slip44: 118,
    feeCurrencies: [
      {
        coinMinimalDenom: "uaxl",
        coinDecimals: 6,
        coinDenom: "AXL",
        coinGeckoId: "",
        fixed_min_gas_price: 0.007,
        gasPriceStep: {
          low: 0.007,
          average: 0.007,
          high: 0.01,
        },
      },
    ],
    stakeCurrency: {
      coinDecimals: 6,
      coinDenom: "AXL",
      coinGeckoId: "",
      coinMinimalDenom: "uaxl",
    },
    currencies: [],
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
        txPage: "https://axelarscan.io/tx/{txHash}",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "axelar-evm-bridge"],
  },
];
