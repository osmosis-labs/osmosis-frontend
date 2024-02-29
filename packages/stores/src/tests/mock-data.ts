import type {
  Chain,
  ChainInfo,
  ChainInfoWithExplorer,
} from "@osmosis-labs/types";

import { UnsafeIbcCurrencyRegistrar } from "../currency-registrar/unsafe-ibc";

export const TestOsmosisChainId = "localosmosis";

export const MockChainList: (Chain & {
  keplrChain: ChainInfoWithExplorer;
})[] = [
  {
    chain_name: "osmosis",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Osmosis",
    chain_id: TestOsmosisChainId,
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
          average_gas_price: 0.035,
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
      "Osmosis (OSMO) is a decentralized exchange (DEX) for Cosmos, an ecosystem of sovereign, interoperable blockchains all connected trustlessly over IBC, the Inter-Blockchain Communication Protocol. Osmosis also offers non-IBC assets bridged from the Ethereum and Polkadot ecosystems. Osmosis' Supercharged Liquidity implements an efficient liquidity pool mechanism analogous to Uniswap's concentrated liquidity, attaining improved capital efficiency and allowing liquidity providers to compete for earned fees and incentives.\n\nAs an appchain DEX, Osmosis has greater control over the full blockchain stack than DEXs that must follow the code of a parent chain. This fine-grained control has enabled, for example, the development of Superfluid Staking, an improvement to Proof-of-Stake security. Superfluid staking allows the underlying OSMO in an LP position to add to chain security and earn staking rewards for doing so. The customizability of appchains also allows for the development of a transaction mempool shielded with threshold encryption, which will greatly reduce harmful MEV on Osmosis.\n\nOsmosis's vision is to build a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To build out the trading functionalities, Osmosis has invited external developers to create a bespoke DEX ecosystem that includes lending, credit, margin, fiat on-ramps, Defi strategy vaults, NFTs, stablecoins, and more – all the functionalities of a centralized exchange and more, plus the trust-minimization of decentralized finance.",
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
        tx_page: "https://www.mintscan.io/osmosis/txs/{txHash}",
      },
    ],
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
    keplrChain: {
      rpc: "https://rpc-osmosis.keplr.app",
      rest: "https://lcd-osmosis.keplr.app",
      chainId: TestOsmosisChainId,
      chainName: "osmosis",
      prettyChainName: "Osmosis",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coinGeckoId: "osmosis",
          coinImageUrl: "/tokens/generated/osmo.svg",
          base: "uosmo",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "ION",
          coinMinimalDenom: "uion",
          coinDecimals: 6,
          coinGeckoId: "ion",
          coinImageUrl: "/tokens/generated/ion.svg",
          base: "uion",
        },
        {
          coinDenom: "IBCX",
          coinMinimalDenom:
            "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          contractAddress:
            "osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ibcx.svg",
          base: "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        },
        {
          coinDenom: "stIBCX",
          coinMinimalDenom:
            "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          contractAddress:
            "osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stibcx.svg",
          base: "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        },
        {
          coinDenom: "ampOSMO",
          coinMinimalDenom:
            "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          contractAddress:
            "osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/amposmo.png",
          base: "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        },
        {
          coinDenom: "CDT",
          coinMinimalDenom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cdt.svg",
          base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        },
        {
          coinDenom: "MBRN",
          coinMinimalDenom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mbrn.svg",
          base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        },
        {
          coinDenom: "sqOSMO",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqosmo.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        },
        {
          coinDenom: "sqATOM",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqatom.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        },
        {
          coinDenom: "sqBTC",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqbtc.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinGeckoId: "osmosis",
        coinImageUrl: "/tokens/generated/osmo.svg",
        base: "uosmo",
      },
      feeCurrencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coinGeckoId: "osmosis",
          coinImageUrl: "/tokens/generated/osmo.svg",
          base: "uosmo",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "osmo",
        bech32PrefixAccPub: "osmopub",
        bech32PrefixValAddr: "osmovaloper",
        bech32PrefixValPub: "osmovaloperpub",
        bech32PrefixConsAddr: "osmovalcons",
        bech32PrefixConsPub: "osmovalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/osmosis/txs/{txHash}",
      features: [
        "ibc-go",
        "ibc-transfer",
        "cosmwasm",
        "wasmd_0.24+",
        "osmosis-txfees",
      ],
    },
  },
  {
    chain_name: "cosmoshub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "cosmoshub",
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
          fixed_min_gas_price: 0.005,
          low_gas_price: 0.01,
          average_gas_price: 0.045,
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
      "In a nutshell, Cosmos Hub bills itself as a project that solves some of the hardest problems facing the blockchain industry. It aims to offer an antidote to slow, expensive, unscalable and environmentally harmful proof-of-work protocols, like those used by Bitcoin, by offering an ecosystem of connected blockchains.\n\nThe project’s other goals include making blockchain technology less complex and difficult for developers thanks to a modular framework that demystifies decentralized apps. Last but not least, an Inter-blockchain Communication protocol makes it easier for blockchain networks to communicate with each other — preventing fragmentation in the industry.\n\nCosmos Hub's origins can be dated back to 2014, when Tendermint, a core contributor to the network, was founded. In 2016, a white paper for Cosmos was published — and a token sale was held the following year. ATOM tokens are earned through a hybrid proof-of-stake algorithm, and they help to keep the Cosmos Hub, the project’s flagship blockchain, secure. This cryptocurrency also has a role in the network’s governance.",
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
        tx_page: "https://www.mintscan.io/cosmos/txs/{txHash}",
      },
    ],
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-cosmoshub.keplr.app",
      rest: "https://lcd-cosmoshub.keplr.app",
      chainId: "cosmoshub-4",
      chainName: "cosmoshub",
      prettyChainName: "Cosmos Hub",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
          coinImageUrl: "/tokens/generated/atom.svg",
          base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinGeckoId: "cosmos",
        coinImageUrl: "/tokens/generated/atom.svg",
        base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
      feeCurrencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
          coinImageUrl: "/tokens/generated/atom.svg",
          base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmospub",
        bech32PrefixValAddr: "cosmosvaloper",
        bech32PrefixValPub: "cosmosvaloperpub",
        bech32PrefixConsAddr: "cosmosvalcons",
        bech32PrefixConsPub: "cosmosvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/cosmos/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
  {
    chain_name: "cosmoshub",
    status: "live",
    network_type: "mainnet",
    pretty_name: "cosmoshub",
    chain_id: "cosmoshub-4-no-gas-price",
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
      "In a nutshell, Cosmos Hub bills itself as a project that solves some of the hardest problems facing the blockchain industry. It aims to offer an antidote to slow, expensive, unscalable and environmentally harmful proof-of-work protocols, like those used by Bitcoin, by offering an ecosystem of connected blockchains.\n\nThe project’s other goals include making blockchain technology less complex and difficult for developers thanks to a modular framework that demystifies decentralized apps. Last but not least, an Inter-blockchain Communication protocol makes it easier for blockchain networks to communicate with each other — preventing fragmentation in the industry.\n\nCosmos Hub's origins can be dated back to 2014, when Tendermint, a core contributor to the network, was founded. In 2016, a white paper for Cosmos was published — and a token sale was held the following year. ATOM tokens are earned through a hybrid proof-of-stake algorithm, and they help to keep the Cosmos Hub, the project’s flagship blockchain, secure. This cryptocurrency also has a role in the network’s governance.",
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
        tx_page: "https://www.mintscan.io/cosmos/txs/{txHash}",
      },
    ],
    features: ["ibc-go", "ibc-transfer"],
    keplrChain: {
      rpc: "https://rpc-cosmoshub.keplr.app",
      rest: "https://lcd-cosmoshub.keplr.app",
      chainId: "cosmoshub-4",
      chainName: "cosmoshub",
      prettyChainName: "Cosmos Hub",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
          coinImageUrl: "/tokens/generated/atom.svg",
          base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinGeckoId: "cosmos",
        coinImageUrl: "/tokens/generated/atom.svg",
        base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
      feeCurrencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coinGeckoId: "cosmos",
          coinImageUrl: "/tokens/generated/atom.svg",
          base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.03,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmospub",
        bech32PrefixValAddr: "cosmosvaloper",
        bech32PrefixValPub: "cosmosvaloperpub",
        bech32PrefixConsAddr: "cosmosvalcons",
        bech32PrefixConsPub: "cosmosvalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/cosmos/txs/{txHash}",
      features: ["ibc-go", "ibc-transfer"],
    },
  },
];

export const mockChainInfos: ChainInfo[] = [
  {
    rpc: "https://rpc-osmosis.keplr.app/",
    rest: "https://lcd-osmosis-baba.keplr.app/",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    prettyChainName: "Osmosis",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "pool:uosmo",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "pool:uion",
      },
      {
        coinDenom: "IBCX",
        coinMinimalDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        coinDecimals: 6,
        coinGeckoId: "pool:ibcx",
      },
      {
        coinDenom: "stIBCX",
        coinMinimalDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        coinDecimals: 6,
        coinGeckoId: "pool:stibcx",
      },
    ],
    features: ["ibc-transfer", "ibc-go", "cosmwasm", "wasmd_0.24+"],
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "pool:uosmo",
    },
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "pool:uosmo",
      },
    ],
  },
  {
    rpc: "https://rpc-cosmoshub.keplr.app",
    rest: "https://lcd-cosmoshub.keplr.app",
    chainId: "cosmoshub-4",
    chainName: "Cosmos Hub",
    prettyChainName: "Cosmos Hub",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "pool:uatom",
      },
      {
        // multihop IBC asset
        coinDenom: "PSTAKE",
        coinMinimalDenom:
          "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
        coinDecimals: 18,
        coinGeckoId: "pool:pstake",
      },
      {
        type: "cw20",
        contractAddress: "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
        coinDenom: "SHD",
        coinMinimalDenom:
          "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD",
        coinDecimals: 8,
        //coinGeckoId: "shade-protocol",
        coinGeckoId: "pool:shd",
        coinImageUrl: "/tokens/shd.svg",
      },
    ],
    features: ["ibc-transfer", "ibc-go"],
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "pool:uatom",
    },
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "pool:uatom",
      },
    ],
  },
  {
    rpc: "https://rpc-persistence.keplr.app",
    rest: "https://lcd-persistence.keplr.app",
    chainId: "core-1",
    chainName: "persistence",
    prettyChainName: "Persistence",
    bip44: {
      coinType: 118,
    },
    currencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
      },
      {
        coinDenom: "PSTAKE",
        coinMinimalDenom:
          "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
      },
      {
        coinDenom: "stkATOM",
        coinMinimalDenom: "stk/uatom",
        coinDecimals: 6,
        coinGeckoId: "stkatom",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
      },
    ],
    stakeCurrency: {
      coinDecimals: 6,
      coinDenom: "XPRT",
      coinMinimalDenom: "uxprt",
      coinGeckoId: "persistence",
      coinImageUrl:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
    },
    feeCurrencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
      },
    ],
    bech32Config: {
      bech32PrefixAccAddr: "persistence",
      bech32PrefixAccPub: "persistencepub",
      bech32PrefixValAddr: "persistencevaloper",
      bech32PrefixValPub: "persistencevaloperpub",
      bech32PrefixConsAddr: "persistencevalcons",
      bech32PrefixConsPub: "persistencevalconspub",
    },
    features: ["ibc-transfer", "ibc-go"],
  },
  {
    rpc: "https://rpc-secret.keplr.app",
    rest: "https://lcd-secret.keplr.app",
    chainId: "secret-4",
    chainName: "secretnetwork",
    prettyChainName: "Secret Network",
    bip44: {
      coinType: 529,
    },
    currencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
      },
      {
        coinDenom: "ALTER",
        coinMinimalDenom:
          "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej:ALTER",
        coinDecimals: 6,
        coinGeckoId: "alter",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
      },
      {
        coinDenom: "BUTT",
        coinMinimalDenom:
          "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt:BUTT",
        coinDecimals: 6,
        coinGeckoId: "buttcoin-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
      },
      {
        coinDenom: "SHD(old)",
        coinMinimalDenom:
          "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d:SHD(old)",
        coinDecimals: 8,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
      },
      {
        coinDenom: "SIENNA",
        coinMinimalDenom:
          "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4:SIENNA",
        coinDecimals: 18,
        coinGeckoId: "sienna",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
      },
      {
        coinDenom: "stkd-SCRT",
        coinMinimalDenom:
          "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4:stkd-SCRT",
        coinDecimals: 6,
        coinGeckoId: "stkd-scrt",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
      },
      {
        coinDenom: "AMBER",
        coinMinimalDenom:
          "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852:AMBER",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
      },
      {
        coinDenom: "SILK",
        coinMinimalDenom:
          "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd:SILK",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
      },
      {
        coinDenom: "SHD",
        coinMinimalDenom:
          "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD",
        coinDecimals: 8,
        coinGeckoId: "shade-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
      },
    ],
    stakeCurrency: {
      coinDecimals: 6,
      coinDenom: "SCRT",
      coinMinimalDenom: "uscrt",
      coinGeckoId: "secret",
      coinImageUrl:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
    },
    feeCurrencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
      },
    ],
    bech32Config: {
      bech32PrefixAccAddr: "secret",
      bech32PrefixAccPub: "secretpub",
      bech32PrefixValAddr: "secretvaloper",
      bech32PrefixValPub: "secretvaloperpub",
      bech32PrefixConsAddr: "secretvalcons",
      bech32PrefixConsPub: "secretvalconspub",
    },
    features: [
      "ibc-transfer",
      "ibc-go",
      "secretwasm",
      "cosmwasm",
      "wasmd_0.24+",
    ],
  },
];

// for mock purposes, all IBC assets are Cosmos <> Osmosis
export const mockIbcAssets: ConstructorParameters<
  typeof UnsafeIbcCurrencyRegistrar
>[1] = [
  // ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
  {
    chainName: "cosmoshub",
    sourceDenom: "uatom",
    coinMinimalDenom:
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    symbol: "ATOM",
    decimals: 6,
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
    },
    coingeckoId: "cosmos",
    price: { poolId: "1265", denom: "uosmo" },
    categories: ["defi"],
    transferMethods: [
      {
        type: "ibc",
        counterparty: {
          chainName: "cosmoshub",
          chainId: "cosmoshub-4",
          sourceDenom: "uatom",
          port: "transfer",
          channelId: "channel-141",
        },
        chain: {
          port: "transfer",
          channelId: "channel-0",
          path: "transfer/channel-0/uatom",
        },
      },
    ],
    counterparty: [
      {
        chainName: "cosmoshub",
        sourceDenom: "uatom",
        chainType: "cosmos",
        chainId: "cosmoshub-4",
        symbol: "ATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
        },
      },
    ],
    variantGroupKey: "ATOM",
    name: "Cosmos Hub",
    verified: true,
    unstable: false,
    disabled: false,
    preview: false,
    relative_image_url: "/tokens/generated/atom.svg",
  },
  // SHD
  // ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A
  {
    chainName: "secretnetwork",
    sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
    coinMinimalDenom:
      "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
    symbol: "SHD",
    decimals: 8,
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
    },
    coingeckoId: "shade-protocol",
    price: {
      poolId: "1170",
      denom:
        "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
    },
    categories: ["defi"],
    transferMethods: [
      {
        type: "ibc",
        counterparty: {
          chainName: "secretnetwork",
          chainId: "secret-4",
          sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
          port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
          channelId: "channel-44",
        },
        chain: {
          port: "transfer",
          channelId: "channel-476",
          path: "transfer/channel-476/cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
        },
      },
    ],
    counterparty: [
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
        chainType: "cosmos",
        chainId: "secret-4",
        symbol: "SHD",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
        },
      },
    ],
    variantGroupKey: "SHD",
    name: "Shade",
    verified: true,
    unstable: false,
    disabled: false,
    preview: false,
    relative_image_url: "/tokens/generated/shd.svg",
  },
  // ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961
  {
    chainName: "persistence",
    sourceDenom:
      "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
    coinMinimalDenom:
      "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
    symbol: "PSTAKE",
    decimals: 18,
    logoURIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
    },
    coingeckoId: "pstake-finance",
    price: { poolId: "648", denom: "uosmo" },
    categories: ["liquid_staking", "defi"],
    transferMethods: [
      {
        type: "ibc",
        counterparty: {
          chainName: "persistence",
          chainId: "core-1",
          sourceDenom:
            "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          port: "transfer",
          channelId: "channel-6",
        },
        chain: {
          port: "transfer",
          channelId: "channel-4",
          path: "transfer/channel-4/transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
        },
      },
    ],
    counterparty: [
      {
        chainName: "persistence",
        sourceDenom:
          "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
        chainType: "cosmos",
        chainId: "core-1",
        symbol: "PSTAKE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
        },
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
        chainType: "cosmos",
        chainId: "gravity-bridge-3",
        symbol: "PSTAKE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
        },
      },
      {
        chainName: "ethereum",
        sourceDenom: "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
        chainType: "evm",
        chainId: 1,
        address: "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
        symbol: "PSTAKE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
        },
      },
    ],
    variantGroupKey: "PSTAKE",
    name: "pSTAKE Finance",
    verified: true,
    unstable: false,
    disabled: false,
    preview: false,
    relative_image_url: "/tokens/generated/pstake.svg",
  },
];
