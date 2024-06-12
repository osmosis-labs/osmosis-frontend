import type {
  AssetList,
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
    isAlloyed: false,
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
    isAlloyed: false,
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
    isAlloyed: false,
    verified: true,
    unstable: false,
    disabled: false,
    preview: false,
    relative_image_url: "/tokens/generated/pstake.svg",
  },
];

export const MockAssetList: AssetList[] = [
  {
    chain_name: "osmosis",
    chain_id: "osmosis-1",
    assets: [
      {
        chainName: "osmosis",
        sourceDenom: "uosmo",
        coinMinimalDenom: "uosmo",
        symbol: "OSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
        },
        coingeckoId: "osmosis",
        price: {
          poolId: "1464",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "Osmosis",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/osmo.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom: "uion",
        coinMinimalDenom: "uion",
        symbol: "ION",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.svg",
        },
        coingeckoId: "ion",
        price: {
          poolId: "2",
          denom: "uosmo",
        },
        categories: ["meme", "built_on_osmosis"],
        transferMethods: [],
        counterparty: [],
        name: "Ion DAO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ion.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        coinMinimalDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        symbol: "IBCX",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibcx.svg",
        },
        coingeckoId: "ibc-index",
        price: {
          poolId: "1031",
          denom: "uosmo",
        },
        categories: ["defi", "built_on_osmosis"],
        transferMethods: [],
        counterparty: [],
        name: "IBC Index",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ibcx.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        coinMinimalDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        symbol: "stIBCX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.svg",
        },
        price: {
          poolId: "1107",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [],
        counterparty: [],
        name: "Staked IBCX",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stibcx.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        coinMinimalDenom:
          "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        symbol: "ampOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/amposmo.png",
        },
        price: {
          poolId: "1067",
          denom: "uosmo",
        },
        categories: ["liquid_staking", "sail_initiative"],
        transferMethods: [],
        counterparty: [],
        name: "ERIS Amplified OSMO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/amposmo.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        coinMinimalDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        symbol: "CDT",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CDT.svg",
        },
        coingeckoId: "collateralized-debt-token",
        price: {
          poolId: "1268",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi", "built_on_osmosis"],
        pegMechanism: "collateralized",
        transferMethods: [],
        counterparty: [],
        name: "CDT Stablecoin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cdt.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        coinMinimalDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        symbol: "MBRN",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/MBRN.svg",
        },
        coingeckoId: "membrane",
        price: {
          poolId: "1225",
          denom: "uosmo",
        },
        categories: ["defi", "built_on_osmosis"],
        transferMethods: [],
        counterparty: [],
        name: "Membrane",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mbrn.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        symbol: "sqOSMO",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqosmo.svg",
        },
        price: {
          poolId: "1267",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [],
        counterparty: [],
        name: "OSMO Squared",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sqosmo.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        symbol: "sqATOM",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqatom.svg",
        },
        price: {
          poolId: "1299",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [],
        counterparty: [],
        name: "ATOM Squared",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sqatom.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        symbol: "sqBTC",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqbtc.svg",
        },
        categories: [],
        transferMethods: [],
        counterparty: [],
        name: "BTC Squared",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/sqbtc.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        coinMinimalDenom:
          "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        symbol: "LVN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/levana.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/levana.svg",
        },
        coingeckoId: "levana-protocol",
        price: {
          poolId: "1337",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi", "built_on_osmosis"],
        transferMethods: [],
        counterparty: [],
        name: "Levana",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/lvn.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        coinMinimalDenom:
          "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        symbol: "milkTIA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/milktia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/milktia.svg",
        },
        coingeckoId: "milkyway-staked-tia",
        price: {
          poolId: "1475",
          denom:
            "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        },
        categories: ["liquid_staking", "built_on_osmosis"],
        transferMethods: [],
        counterparty: [],
        variantGroupKey: "milkTIA",
        name: "milkTIA",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/milktia.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        coinMinimalDenom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        symbol: "WBTC",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
        },
        coingeckoId: "wrapped-bitcoin",
        price: {
          poolId: "1436",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [],
        counterparty: [
          {
            chainName: "ethereum",
            sourceDenom: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            chainType: "evm",
            chainId: 1,
            address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
            },
          },
          {
            chainName: "bitcoin",
            sourceDenom: "sat",
            chainType: "non-cosmos",
            symbol: "BTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/bitcoin/images/btc.png",
            },
          },
        ],
        variantGroupKey: "BTC",
        name: "Wrapped Bitcoin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-29T09:57:00.000Z",
        relative_image_url: "/tokens/generated/wbtc.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        coinMinimalDenom:
          "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        symbol: "WOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wosmo.png",
        },
        price: {
          poolId: "1408",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "WOSMO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-22T15:42:00.000Z",
        relative_image_url: "/tokens/generated/wosmo.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        symbol: "sqTIA",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqtia.svg",
        },
        price: {
          poolId: "1378",
          denom:
            "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        },
        categories: [],
        transferMethods: [],
        counterparty: [],
        name: "TIA Squared",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-19T15:51:00.000Z",
        relative_image_url: "/tokens/generated/sqtia.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        coinMinimalDenom:
          "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        symbol: "RAPTR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/RAPTR.png",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "RAPTR",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/raptr.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        coinMinimalDenom:
          "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        symbol: "BADKID",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/badkid.png",
        },
        price: {
          poolId: "1470",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "BADKID",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        tooltipMessage:
          "This asset is NOT affiliated with the Bad Kids NFT collection.",
        listingDate: "2024-02-13T21:32:00.000Z",
        relative_image_url: "/tokens/generated/badkid.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
        coinMinimalDenom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
        symbol: "SAIL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sail.png",
        },
        coingeckoId: "sail-dao",
        price: {
          poolId: "1782",
          denom: "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
        },
        categories: ["sail_initiative"],
        transferMethods: [],
        counterparty: [],
        name: "Sail",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-14T22:20:00.000Z",
        relative_image_url: "/tokens/generated/sail.png",
      },
      {
        chainName: "osmosis",
        sourceDenom: "factory/osmo1nr8zfakf6jauye3uqa9lrmr5xumee5n42lv92z/toro",
        coinMinimalDenom:
          "factory/osmo1nr8zfakf6jauye3uqa9lrmr5xumee5n42lv92z/toro",
        symbol: "TORO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/toro.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/toro.svg",
        },
        price: {
          poolId: "1624",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "TORO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-01T21:57:00.000Z",
        relative_image_url: "/tokens/generated/toro.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom: "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
        coinMinimalDenom:
          "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
        symbol: "LAB",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/LAB.png",
        },
        coingeckoId: "mad-scientists",
        price: {
          poolId: "1656",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["nft_protocol", "sail_initiative", "built_on_osmosis"],
        transferMethods: [],
        counterparty: [],
        name: "LAB",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-02T15:53:00.000Z",
        relative_image_url: "/tokens/generated/lab.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo",
        coinMinimalDenom:
          "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo",
        symbol: "bOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/bOSMO.png",
        },
        categories: ["liquid_staking", "sail_initiative"],
        transferMethods: [],
        counterparty: [],
        name: "BackBone Labs Liquid Staked OSMO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-15T18:00:00.000Z",
        relative_image_url: "/tokens/generated/bosmo.png",
      },
      {
        chainName: "osmosis",
        sourceDenom: "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
        coinMinimalDenom:
          "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
        symbol: "IBC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibc.png",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "IBC",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/ibc.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
        coinMinimalDenom:
          "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
        symbol: "BERNESE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/bernese.png",
        },
        price: {
          poolId: "1700",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "BERNESE",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-23T02:49:00.000Z",
        relative_image_url: "/tokens/generated/bernese.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
        coinMinimalDenom:
          "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
        symbol: "wLIBRA",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/0l/images/libra.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/0l/images/libra.png",
        },
        price: {
          poolId: "1721",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [],
        counterparty: [
          {
            chainName: "0l",
            sourceDenom: "microlibra",
            chainType: "non-cosmos",
            symbol: "LIBRA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/0l/images/libra.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/0l/images/libra.svg",
            },
          },
        ],
        variantGroupKey: "LIBRA",
        name: "Wrapped Libra Coin (LibraBridge)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-30T12:00:00.000Z",
        relative_image_url: "/tokens/generated/wlibra.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/cac",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/cac",
        symbol: "CAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CAC.png",
        },
        price: {
          poolId: "1736",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "Cosmos Airdrop Chat",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-06T12:00:00.000Z",
        relative_image_url: "/tokens/generated/cac.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/pbb",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/pbb",
        symbol: "PBB",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/PBB.png",
        },
        price: {
          poolId: "1750",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "Power Bottom",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-13T18:41:03.000Z",
        relative_image_url: "/tokens/generated/pbb.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bwh",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bwh",
        symbol: "BWH",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/BWH.png",
        },
        price: {
          poolId: "1729",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "BeerWifHat",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-13T18:59:11.000Z",
        relative_image_url: "/tokens/generated/bwh.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos",
        symbol: "SHITMOS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/shitmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/shitmos.svg",
        },
        price: {
          poolId: "1770",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "Shitmos",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-14T15:45:04.000Z",
        relative_image_url: "/tokens/generated/shitmos.svg",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
        symbol: "WIHA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/WIHA.png",
        },
        price: {
          poolId: "1779",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "WiliHall",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-16T21:03:04.000Z",
        relative_image_url: "/tokens/generated/wiha.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/crazyhorse",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/crazyhorse",
        symbol: "CRAZYHORSE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CrazyHorse.png",
        },
        price: {
          poolId: "1772",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "HorseShoeBar",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-14T22:32:04.000Z",
        relative_image_url: "/tokens/generated/crazyhorse.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/coca",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/coca",
        symbol: "COCA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/COCA.png",
        },
        price: {
          poolId: "1794",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [],
        counterparty: [],
        name: "CosmusCartol",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-21T11:07:05.000Z",
        relative_image_url: "/tokens/generated/coca.png",
      },
      {
        chainName: "osmosis",
        sourceDenom:
          "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
        coinMinimalDenom:
          "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
        symbol: "allUSDT",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [],
        counterparty: [],
        variantGroupKey: "allUSDT",
        name: "Alloyed USDT",
        isAlloyed: true,
        contract:
          "osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        listingDate: "2024-05-29T10:27:00.000Z",
        relative_image_url: "/tokens/generated/allusdt.svg",
      },
    ],
  },
  {
    chain_name: "axelar",
    chain_id: "axelar-dojo-1",
    assets: [
      {
        chainName: "axelar",
        sourceDenom: "uusdc",
        coinMinimalDenom:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        symbol: "USDC.axl",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.png",
        },
        coingeckoId: "axlusdc",
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Satellite",
            type: "external_interface",
            depositUrl:
              "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=uusdc",
            withdrawUrl:
              "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=uusdc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "uusdc",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "uusdc",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Axelar)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdc.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "weth-wei",
        coinMinimalDenom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        symbol: "ETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
        },
        coingeckoId: "ethereum",
        price: {
          poolId: "1281",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Satellite",
            type: "external_interface",
            depositUrl:
              "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=weth-wei",
            withdrawUrl:
              "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=weth-wei",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "weth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/weth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "weth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/weth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chainType: "evm",
            chainId: 1,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Ether",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/eth.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "wbtc-satoshi",
        coinMinimalDenom:
          "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        symbol: "WBTC.axl",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.axl.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.axl.png",
        },
        coingeckoId: "axlwbtc",
        price: {
          poolId: "1422",
          denom:
            "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wbtc-satoshi",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wbtc-satoshi",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wbtc-satoshi",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/wbtc.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            chainType: "evm",
            chainId: 1,
            address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
            },
          },
        ],
        variantGroupKey: "WBTC",
        name: "Wrapped Bitcoin (Axelar)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/wbtc.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "uusdt",
        coinMinimalDenom:
          "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        symbol: "USDT.axl",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.axl.svg",
        },
        coingeckoId: "axelar-usdt",
        price: {
          poolId: "1150",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "uusdt",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/uusdt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "uusdt",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD (Axelar)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdt.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "dai-wei",
        coinMinimalDenom:
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        symbol: "DAI",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
        },
        coingeckoId: "dai",
        price: {
          poolId: "1260",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "dai-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/dai-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "dai-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            chainType: "evm",
            chainId: 1,
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
        ],
        variantGroupKey: "DAI",
        name: "Dai Stablecoin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dai.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "busd-wei",
        coinMinimalDenom:
          "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
        symbol: "BUSD",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.svg",
        },
        coingeckoId: "binance-usd",
        price: {
          poolId: "877",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "busd-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/busd-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "busd-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "BUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
            chainType: "evm",
            chainId: 1,
            address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
            symbol: "BUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.svg",
            },
          },
        ],
        variantGroupKey: "BUSD",
        name: "Binance USD",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/busd.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wbnb-wei",
        coinMinimalDenom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        symbol: "BNB",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.svg",
        },
        coingeckoId: "binancecoin",
        price: {
          poolId: "840",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wbnb-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wbnb-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wbnb-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WBNB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.svg",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            chainType: "evm",
            chainId: 56,
            address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            symbol: "WBNB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.svg",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 56,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "BNB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.svg",
            },
          },
        ],
        variantGroupKey: "BNB",
        name: "Binance Coin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/bnb.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wmatic-wei",
        coinMinimalDenom:
          "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
        symbol: "MATIC",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.png",
        },
        coingeckoId: "matic-network",
        price: {
          poolId: "789",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wmatic-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wmatic-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wmatic-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WMATIC",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.svg",
            },
          },
          {
            chainName: "polygon",
            sourceDenom: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            chainType: "evm",
            chainId: 137,
            address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            symbol: "WMATIC",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/wmatic.svg",
            },
          },
          {
            chainName: "polygon",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 137,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "MATIC",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.svg",
            },
          },
        ],
        variantGroupKey: "MATIC",
        name: "Polygon",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/matic.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "wavax-wei",
        coinMinimalDenom:
          "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
        symbol: "AVAX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.png",
        },
        coingeckoId: "avalanche-2",
        price: {
          poolId: "899",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wavax-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wavax-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wavax-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WAVAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/wavax.svg",
            },
          },
          {
            chainName: "avalanche",
            sourceDenom: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            chainType: "evm",
            chainId: 43114,
            address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            symbol: "WAVAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/wavax.svg",
            },
          },
          {
            chainName: "avalanche",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 43114,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "AVAX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.svg",
            },
          },
        ],
        variantGroupKey: "AVAX",
        name: "Avalanche",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/avax.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "dot-planck",
        coinMinimalDenom:
          "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
        symbol: "moonbeam.DOT.axl",
        decimals: 10,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dot.axl.svg",
        },
        price: {
          poolId: "1091",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "dot-planck",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/dot-planck",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "dot-planck",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "moonbeam",
            sourceDenom: "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            chainType: "evm",
            chainId: 1284,
            address: "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            symbol: "xcDOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
        ],
        variantGroupKey: "xcDOT",
        name: "Wrapped Polkadot (Axelar)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "axelar",
          sourceDenom: "uaxl",
        },
        relative_image_url: "/tokens/generated/moonbeam.dot.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "frax-wei",
        coinMinimalDenom:
          "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
        symbol: "FRAX",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
        },
        coingeckoId: "frax",
        price: {
          poolId: "679",
          denom:
            "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        },
        categories: ["stablecoin"],
        pegMechanism: "hybrid",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "frax-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/frax-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "frax-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "FRAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x853d955acef822db058eb8505911ed77f175b99e",
            chainType: "evm",
            chainId: 1,
            address: "0x853d955acef822db058eb8505911ed77f175b99e",
            symbol: "FRAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
            },
          },
        ],
        variantGroupKey: "FRAX",
        name: "Frax",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/frax.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "link-wei",
        coinMinimalDenom:
          "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
        symbol: "LINK",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
        },
        coingeckoId: "chainlink",
        price: {
          poolId: "731",
          denom: "uosmo",
        },
        categories: ["oracles"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "link-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/link-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "link-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "LINK",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x514910771af9ca656af840dff83e8264ecf986ca",
            chainType: "evm",
            chainId: 1,
            address: "0x514910771af9ca656af840dff83e8264ecf986ca",
            symbol: "LINK",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
            },
          },
        ],
        variantGroupKey: "LINK",
        name: "Chainlink",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/link.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "aave-wei",
        coinMinimalDenom:
          "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
        symbol: "AAVE",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
        },
        coingeckoId: "aave",
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "aave-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/aave-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "aave-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "AAVE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            chainType: "evm",
            chainId: 1,
            address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            symbol: "AAVE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
            },
          },
        ],
        variantGroupKey: "AAVE",
        name: "Aave",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/aave.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "ape-wei",
        coinMinimalDenom:
          "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
        symbol: "APE",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
        },
        coingeckoId: "apecoin",
        categories: ["nft_protocol"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "ape-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/ape-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "ape-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "APE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x4d224452801aced8b2f0aebe155379bb5d594381",
            chainType: "evm",
            chainId: 1,
            address: "0x4d224452801aced8b2f0aebe155379bb5d594381",
            symbol: "APE",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
            },
          },
        ],
        variantGroupKey: "APE",
        name: "ApeCoin",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/ape.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "mkr-wei",
        coinMinimalDenom:
          "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
        symbol: "MKR",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
        },
        coingeckoId: "maker",
        price: {
          poolId: "1517",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "mkr-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/mkr-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "mkr-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "MKR",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            chainType: "evm",
            chainId: 1,
            address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            symbol: "MKR",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
            },
          },
        ],
        variantGroupKey: "MKR",
        name: "Maker",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mkr.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "rai-wei",
        coinMinimalDenom:
          "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
        symbol: "RAI",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
        },
        coingeckoId: "rai",
        price: {
          poolId: "1604",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        transferMethods: [
          {
            name: "Satellite",
            type: "external_interface",
            depositUrl:
              "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=rai-we",
            withdrawUrl:
              "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=rai-wei",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "rai-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/rai-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "rai-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "RAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
            chainType: "evm",
            chainId: 1,
            address: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
            symbol: "RAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
            },
          },
        ],
        variantGroupKey: "RAI",
        name: "Rai Reflex Index",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-29T20:12:00.000Z",
        relative_image_url: "/tokens/generated/rai.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "shib-wei",
        coinMinimalDenom:
          "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
        symbol: "SHIB",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
        },
        coingeckoId: "shiba-inu",
        price: {
          poolId: "880",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "shib-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/shib-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "shib-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "SHIB",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
            chainType: "evm",
            chainId: 1,
            address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
            symbol: "SHIB",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
            },
          },
        ],
        variantGroupKey: "SHIB",
        name: "Shiba Inu",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/shib.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wglmr-wei",
        coinMinimalDenom:
          "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
        symbol: "GLMR",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
        },
        coingeckoId: "moonbeam",
        price: {
          poolId: "1543",
          denom:
            "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wglmr-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wglmr-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wglmr-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WGLMR",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
            },
          },
          {
            chainName: "moonbeam",
            sourceDenom: "0xacc15dc74880c9944775448304b263d191c6077f",
            chainType: "evm",
            chainId: 1284,
            address: "0xacc15dc74880c9944775448304b263d191c6077f",
            symbol: "WGLMR",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
            },
          },
          {
            chainName: "moonbeam",
            sourceDenom: "Wei",
            chainType: "evm",
            chainId: 1284,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "GLMR",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
            },
          },
        ],
        variantGroupKey: "GLMR",
        name: "Moonbeam",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/glmr.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "uaxl",
        coinMinimalDenom:
          "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
        symbol: "AXL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg",
        },
        coingeckoId: "axelar",
        price: {
          poolId: "1094",
          denom: "uosmo",
        },
        categories: ["bridges"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "uaxl",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/uaxl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "uaxl",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "AXL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg",
            },
          },
        ],
        variantGroupKey: "AXL",
        name: "Axelar",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wftm-wei",
        coinMinimalDenom:
          "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
        symbol: "FTM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
        },
        coingeckoId: "fantom",
        price: {
          poolId: "900",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wftm-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wftm-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wftm-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "WFTM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
            },
          },
          {
            chainName: "fantom",
            sourceDenom: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            chainType: "evm",
            chainId: 250,
            address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            symbol: "WFTM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
            },
          },
          {
            chainName: "fantom",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 250,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "FTM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
            },
          },
        ],
        variantGroupKey: "FTM",
        name: "Fantom",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ftm.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "polygon-uusdc",
        coinMinimalDenom:
          "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
        symbol: "polygon.USDC.axl",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/polygon.usdc.svg",
        },
        coingeckoId: "usd-coin",
        price: {
          poolId: "938",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "polygon-uusdc",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/polygon-uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "polygon-uusdc",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg",
            },
          },
          {
            chainName: "polygon",
            sourceDenom: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            chainType: "evm",
            chainId: 137,
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Polygon)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/polygon.usdc.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "avalanche-uusdc",
        coinMinimalDenom:
          "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
        symbol: "avalanche.USDC.axl",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/avalanche.usdc.svg",
        },
        coingeckoId: "usd-coin",
        price: {
          poolId: "938",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "avalanche-uusdc",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/avalanche-uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "avalanche-uusdc",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg",
            },
          },
          {
            chainName: "avalanche",
            sourceDenom: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            chainType: "evm",
            chainId: 43114,
            address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Avalanche)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/avalanche.usdc.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wfil-wei",
        coinMinimalDenom:
          "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
        symbol: "FIL",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.svg",
        },
        coingeckoId: "filecoin",
        price: {
          poolId: "1006",
          denom: "uosmo",
        },
        categories: ["dweb", "depin"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wfil-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wfil-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wfil-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "axlFIL",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.svg",
            },
          },
          {
            chainName: "filecoin",
            sourceDenom: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
            chainType: "evm",
            chainId: 461,
            address: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
            symbol: "WFIL",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.svg",
            },
          },
          {
            chainName: "filecoin",
            sourceDenom: "attoFIL",
            chainType: "evm",
            chainId: 461,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "FIL",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.svg",
            },
          },
        ],
        variantGroupKey: "FIL",
        name: "Filecoin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fil.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "arb-wei",
        coinMinimalDenom:
          "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
        symbol: "ARB",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
        },
        coingeckoId: "arbitrum",
        price: {
          poolId: "1580",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "arb-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/arb-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "arb-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "ARB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
            },
          },
          {
            chainName: "arbitrum",
            sourceDenom: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            chainType: "evm",
            chainId: 42161,
            address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            symbol: "ARB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
            },
          },
        ],
        variantGroupKey: "ARB",
        name: "Arbitrum",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/arb.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "pepe-wei",
        coinMinimalDenom:
          "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
        symbol: "PEPE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
        },
        coingeckoId: "pepe",
        price: {
          poolId: "1018",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "pepe-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/pepe-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "pepe-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "PEPE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            chainType: "evm",
            chainId: 1,
            address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            symbol: "PEPE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
            },
          },
        ],
        variantGroupKey: "PEPE",
        name: "Pepe",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/pepe.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "cbeth-wei",
        coinMinimalDenom:
          "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
        symbol: "cbETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
        },
        coingeckoId: "coinbase-wrapped-staked-eth",
        price: {
          poolId: "1030",
          denom:
            "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "cbeth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/cbeth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "cbeth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "cbETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
            chainType: "evm",
            chainId: 1,
            address: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
            symbol: "cbETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
            },
          },
        ],
        variantGroupKey: "cbETH",
        name: "Coinbase Wrapped Staked ETH",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cbeth.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "reth-wei",
        coinMinimalDenom:
          "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
        symbol: "rETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
        },
        coingeckoId: "rocket-pool-eth",
        price: {
          poolId: "1030",
          denom:
            "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "reth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/reth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "reth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "rETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xae78736cd615f374d3085123a210448e74fc6393",
            chainType: "evm",
            chainId: 1,
            address: "0xae78736cd615f374d3085123a210448e74fc6393",
            symbol: "rETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
            },
          },
        ],
        variantGroupKey: "rETH",
        name: "Rocket Pool Ether",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/reth.png",
      },
      {
        chainName: "axelar",
        sourceDenom: "sfrxeth-wei",
        coinMinimalDenom:
          "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
        symbol: "sfrxETH",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
        },
        coingeckoId: "staked-frax-ether",
        price: {
          poolId: "1030",
          denom:
            "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "sfrxeth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/sfrxeth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "sfrxeth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "sfrxETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xac3e018457b222d93114458476f3e3416abbe38f",
            chainType: "evm",
            chainId: 1,
            address: "0xac3e018457b222d93114458476f3e3416abbe38f",
            symbol: "sfrxETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x5e8422345238f34275888049021821e8e08caa1f",
            chainType: "evm",
            chainId: 1,
            address: "0x5e8422345238f34275888049021821e8e08caa1f",
            symbol: "frxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.svg",
            },
          },
        ],
        variantGroupKey: "frxETH",
        name: "Staked Frax Ether",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sfrxeth.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "wsteth-wei",
        coinMinimalDenom:
          "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        symbol: "wstETH.axl",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wstETH.axl.svg",
        },
        price: {
          poolId: "1024",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "wsteth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/wsteth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "wsteth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            chainType: "evm",
            chainId: 1,
            address: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            chainType: "evm",
            chainId: 1,
            address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            symbol: "stETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/steth.svg",
            },
          },
        ],
        variantGroupKey: "stETH",
        name: "Wrapped Lido Staked Ether (Axelar)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "axelar",
          sourceDenom: "uaxl",
        },
        relative_image_url: "/tokens/generated/wsteth.axl.svg",
      },
      {
        chainName: "axelar",
        sourceDenom: "yieldeth-wei",
        coinMinimalDenom:
          "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
        symbol: "YieldETH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
        },
        coingeckoId: "yieldeth-sommelier",
        price: {
          poolId: "1213",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["defi", "liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "axelar",
              chainId: "axelar-dojo-1",
              sourceDenom: "yieldeth-wei",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-208",
              path: "transfer/channel-208/yieldeth-wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "axelar",
            sourceDenom: "yieldeth-wei",
            chainType: "cosmos",
            chainId: "axelar-dojo-1",
            symbol: "YieldETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
            chainType: "evm",
            chainId: 1,
            address: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
            symbol: "YieldETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
            },
          },
        ],
        variantGroupKey: "YieldETH",
        name: "Real Yield ETH",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/yieldeth.svg",
      },
    ],
  },
  {
    chain_name: "cosmoshub",
    chain_id: "cosmoshub-4",
    assets: [
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
        price: {
          poolId: "1282",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
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
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/atom.svg",
      },
    ],
  },
  {
    chain_name: "cryptoorgchain",
    chain_id: "crypto-org-chain-mainnet-1",
    assets: [
      {
        chainName: "cryptoorgchain",
        sourceDenom: "basecro",
        coinMinimalDenom:
          "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
        symbol: "CRO",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cro.svg",
        },
        coingeckoId: "crypto-com-chain",
        price: {
          poolId: "1092",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cryptoorgchain",
              chainId: "crypto-org-chain-mainnet-1",
              sourceDenom: "basecro",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5",
              path: "transfer/channel-5/basecro",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cryptoorgchain",
            sourceDenom: "basecro",
            chainType: "cosmos",
            chainId: "crypto-org-chain-mainnet-1",
            symbol: "CRO",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cro.svg",
            },
          },
        ],
        variantGroupKey: "CRO",
        name: "Cronos POS Chain",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cro.svg",
      },
    ],
  },
  {
    chain_name: "terra",
    chain_id: "columbus-5",
    assets: [
      {
        chainName: "terra",
        sourceDenom: "uluna",
        coinMinimalDenom:
          "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
        symbol: "LUNC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.svg",
        },
        coingeckoId: "terra-luna",
        price: {
          poolId: "800",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Terra Bridge",
            type: "external_interface",
            depositUrl: "https://bridge.terra.money",
            withdrawUrl: "https://bridge.terra.money",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra",
              chainId: "columbus-5",
              sourceDenom: "uluna",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-72",
              path: "transfer/channel-72/uluna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra",
            sourceDenom: "uluna",
            chainType: "cosmos",
            chainId: "columbus-5",
            symbol: "LUNC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.svg",
            },
          },
        ],
        variantGroupKey: "LUNC",
        name: "Luna Classic",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/lunc.svg",
      },
      {
        chainName: "terra",
        sourceDenom: "uusd",
        coinMinimalDenom:
          "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        symbol: "USTC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.svg",
        },
        coingeckoId: "terrausd",
        price: {
          poolId: "560",
          denom: "uosmo",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "algorithmic",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra",
              chainId: "columbus-5",
              sourceDenom: "uusd",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-72",
              path: "transfer/channel-72/uusd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra",
            sourceDenom: "uusd",
            chainType: "cosmos",
            chainId: "columbus-5",
            symbol: "USTC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.svg",
            },
          },
        ],
        variantGroupKey: "USTC",
        name: "TerraClassicUSD",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ustc.svg",
      },
      {
        chainName: "terra",
        sourceDenom: "ukrw",
        coinMinimalDenom:
          "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
        symbol: "KRTC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.svg",
        },
        price: {
          poolId: "581",
          denom:
            "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        },
        categories: ["stablecoin"],
        pegMechanism: "algorithmic",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra",
              chainId: "columbus-5",
              sourceDenom: "ukrw",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-72",
              path: "transfer/channel-72/ukrw",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra",
            sourceDenom: "ukrw",
            chainType: "cosmos",
            chainId: "columbus-5",
            symbol: "KRTC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.svg",
            },
          },
        ],
        variantGroupKey: "KRTC",
        name: "TerraClassicKRW",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/krtc.svg",
      },
    ],
  },
  {
    chain_name: "juno",
    chain_id: "juno-1",
    assets: [
      {
        chainName: "juno",
        sourceDenom: "ujuno",
        coinMinimalDenom:
          "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        symbol: "JUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
        },
        coingeckoId: "juno-network",
        price: {
          poolId: "1097",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom: "ujuno",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-42",
              path: "transfer/channel-42/ujuno",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom: "ujuno",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "JUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
            },
          },
        ],
        variantGroupKey: "JUNO",
        name: "Juno",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/juno.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
        coinMinimalDenom:
          "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
        symbol: "MARBLE",
        decimals: 3,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.svg",
        },
        price: {
          poolId: "649",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MARBLE",
            decimals: 3,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.svg",
            },
          },
        ],
        variantGroupKey: "MARBLE",
        name: "Marble",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/marble.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
        coinMinimalDenom:
          "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
        symbol: "NETA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.svg",
        },
        coingeckoId: "neta",
        price: {
          poolId: "631",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "NETA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.svg",
            },
          },
        ],
        variantGroupKey: "NETA",
        name: "Neta",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/neta.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
        coinMinimalDenom:
          "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
        symbol: "HOPE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.svg",
        },
        price: {
          poolId: "653",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "HOPE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.svg",
            },
          },
        ],
        variantGroupKey: "HOPE",
        name: "Hope Galaxy",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/hope.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
        coinMinimalDenom:
          "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
        symbol: "juno.RAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.svg",
        },
        coingeckoId: "racoon",
        price: {
          poolId: "669",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "RAC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.svg",
            },
          },
        ],
        variantGroupKey: "RAC",
        name: "Racoon",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/juno.rac.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
        coinMinimalDenom:
          "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
        symbol: "BLOCK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.svg",
        },
        price: {
          poolId: "691",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "BLOCK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.svg",
            },
          },
        ],
        variantGroupKey: "BLOCK",
        name: "Block",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/block.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
        coinMinimalDenom:
          "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
        symbol: "DHK",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.svg",
        },
        price: {
          poolId: "695",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "DHK",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.svg",
            },
          },
        ],
        variantGroupKey: "DHK",
        name: "DHK",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dhk.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
        coinMinimalDenom:
          "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
        symbol: "RAW",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.svg",
        },
        price: {
          poolId: "700",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "RAW",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.svg",
            },
          },
        ],
        variantGroupKey: "RAW",
        name: "JunoSwap",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/raw.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
        coinMinimalDenom:
          "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
        symbol: "ASVT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
        },
        price: {
          poolId: "771",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "ASVT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
            },
          },
        ],
        variantGroupKey: "ASVT",
        name: "Another.Software Validator Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/asvt.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
        coinMinimalDenom:
          "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
        symbol: "JOE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
        },
        price: {
          poolId: "718",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "JOE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
            },
          },
        ],
        variantGroupKey: "JOE",
        name: "JoeDAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/joe.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
        coinMinimalDenom:
          "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
        symbol: "GLTO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
        },
        price: {
          poolId: "778",
          denom: "uosmo",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
        ],
        variantGroupKey: "GLTO",
        name: "Gelotto",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/glto.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
        coinMinimalDenom:
          "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
        symbol: "GKEY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.svg",
        },
        price: {
          poolId: "790",
          denom: "uosmo",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GKEY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.svg",
            },
          },
        ],
        variantGroupKey: "GKEY",
        name: "GKey",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/gkey.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
        coinMinimalDenom:
          "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
        symbol: "SEJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.svg",
        },
        price: {
          poolId: "807",
          denom:
            "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SEJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.svg",
            },
          },
        ],
        variantGroupKey: "SEJUNO",
        name: "StakeEasy seJUNO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sejuno.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
        coinMinimalDenom:
          "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
        symbol: "BJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.svg",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "BJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.svg",
            },
          },
        ],
        variantGroupKey: "BJUNO",
        name: "StakeEasy bJUNO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/bjuno.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
        coinMinimalDenom:
          "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
        symbol: "SOLAR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.svg",
        },
        price: {
          poolId: "941",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SOLAR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.svg",
            },
          },
        ],
        variantGroupKey: "SOLAR",
        name: "Solarbank DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/solar.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
        coinMinimalDenom:
          "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
        symbol: "SEASY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.svg",
        },
        price: {
          poolId: "808",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SEASY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.svg",
            },
          },
        ],
        variantGroupKey: "SEASY",
        name: "StakeEasy SEASY",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/seasy.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
        coinMinimalDenom:
          "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
        symbol: "MUSE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MUSE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
            },
          },
        ],
        variantGroupKey: "MUSE",
        name: "MuseDAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/muse.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
        coinMinimalDenom:
          "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
        symbol: "FURY.legacy",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
        },
        coingeckoId: "fanfury",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "FURY.legacy",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
            },
          },
        ],
        variantGroupKey: "FURY.legacy",
        name: "FURY.legacy",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fury.legacy.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
        coinMinimalDenom:
          "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        symbol: "PHMN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.svg",
        },
        coingeckoId: "posthuman",
        price: {
          poolId: "1738",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "PHMN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.svg",
            },
          },
        ],
        variantGroupKey: "PHMN",
        name: "POSTHUMAN",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/phmn.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
        coinMinimalDenom:
          "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
        symbol: "HOPERS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.svg",
        },
        price: {
          poolId: "894",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "HOPERS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.svg",
            },
          },
        ],
        variantGroupKey: "HOPERS",
        name: "Hopers",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/hopers.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
        coinMinimalDenom:
          "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
        symbol: "WYND",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.svg",
        },
        coingeckoId: "wynd",
        price: {
          poolId: "902",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "WYND",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.svg",
            },
          },
        ],
        variantGroupKey: "WYND",
        name: "Wynd DAO Governance Token",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/wynd.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
        coinMinimalDenom:
          "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
        symbol: "NRIDE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.svg",
        },
        price: {
          poolId: "924",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "NRIDE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.svg",
            },
          },
        ],
        variantGroupKey: "NRIDE",
        name: "nRide Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nride.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
        coinMinimalDenom:
          "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
        symbol: "FOX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
        },
        price: {
          poolId: "949",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "FOX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
            },
          },
        ],
        variantGroupKey: "FOX",
        name: "Juno Fox",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fox.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
        coinMinimalDenom:
          "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
        symbol: "GRDN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
        },
        price: {
          poolId: "959",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GRDN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
            },
          },
        ],
        variantGroupKey: "GRDN",
        name: "Guardian",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/grdn.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
        coinMinimalDenom:
          "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
        symbol: "MNPU",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.svg",
        },
        price: {
          poolId: "961",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MNPU",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.svg",
            },
          },
        ],
        variantGroupKey: "MNPU",
        name: "Mini Punks",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mnpu.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
        coinMinimalDenom:
          "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
        symbol: "SHIBAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
        },
        price: {
          poolId: "962",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SHIBAC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
            },
          },
        ],
        variantGroupKey: "SHIBAC",
        name: "ShibaCosmos",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/shibac.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
        coinMinimalDenom:
          "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
        symbol: "SKOJ",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.svg",
        },
        price: {
          poolId: "964",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SKOJ",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.svg",
            },
          },
        ],
        variantGroupKey: "SKOJ",
        name: "Sikoba Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/skoj.svg",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
        coinMinimalDenom:
          "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
        symbol: "CLST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
        },
        price: {
          poolId: "974",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "CLST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
            },
          },
        ],
        variantGroupKey: "CLST",
        name: "Celestims",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/clst.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
        coinMinimalDenom:
          "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
        symbol: "OSDOGE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
        },
        price: {
          poolId: "975",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "OSDOGE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
            },
          },
        ],
        variantGroupKey: "OSDOGE",
        name: "Osmosis Doge",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/osdoge.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
        coinMinimalDenom:
          "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
        symbol: "APEMOS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
        },
        price: {
          poolId: "977",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "APEMOS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
            },
          },
        ],
        variantGroupKey: "APEMOS",
        name: "Apemos",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/apemos.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
        coinMinimalDenom:
          "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
        symbol: "INVDRS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
        },
        price: {
          poolId: "969",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "INVDRS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
            },
          },
        ],
        variantGroupKey: "INVDRS",
        name: "Invaders",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/invdrs.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
        coinMinimalDenom:
          "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
        symbol: "DOGA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
        },
        price: {
          poolId: "978",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "DOGA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
            },
          },
        ],
        variantGroupKey: "DOGA",
        name: "Doge Apr",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/doga.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
        coinMinimalDenom:
          "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
        symbol: "CATMOS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
        },
        price: {
          poolId: "981",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "CATMOS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
            },
          },
        ],
        variantGroupKey: "CATMOS",
        name: "Catmos",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/catmos.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
        coinMinimalDenom:
          "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
        symbol: "SUMMIT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
        },
        price: {
          poolId: "982",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SUMMIT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
            },
          },
        ],
        variantGroupKey: "SUMMIT",
        name: "Summit",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/summit.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
        coinMinimalDenom:
          "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
        symbol: "SPACER",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
        },
        price: {
          poolId: "993",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SPACER",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
            },
          },
        ],
        variantGroupKey: "SPACER",
        name: "Spacer",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/spacer.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
        coinMinimalDenom:
          "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
        symbol: "LIGHT",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
        },
        price: {
          poolId: "1009",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "LIGHT",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
            },
          },
        ],
        variantGroupKey: "LIGHT",
        name: "LIGHT",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/light.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
        coinMinimalDenom:
          "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
        symbol: "MILE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
        },
        price: {
          poolId: "1000",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MILE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
            },
          },
        ],
        variantGroupKey: "MILE",
        name: "Mille",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mile.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
        coinMinimalDenom:
          "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
        symbol: "MANNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
        },
        price: {
          poolId: "997",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "MANNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
            },
          },
        ],
        variantGroupKey: "MANNA",
        name: "Manna",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/manna.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
        coinMinimalDenom:
          "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
        symbol: "VOID",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
        },
        price: {
          poolId: "1003",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "VOID",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
            },
          },
        ],
        variantGroupKey: "VOID",
        name: "Void",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/void.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
        coinMinimalDenom:
          "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
        symbol: "SLCA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
        },
        price: {
          poolId: "1023",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SLCA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
            },
          },
        ],
        variantGroupKey: "SLCA",
        name: "Silica",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/slca.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
        coinMinimalDenom:
          "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
        symbol: "PEPEC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
        },
        price: {
          poolId: "1016",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "PEPEC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
            },
          },
        ],
        variantGroupKey: "PEPEC",
        name: "Pepec",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/pepec.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
        coinMinimalDenom:
          "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
        symbol: "CASA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
        },
        price: {
          poolId: "1028",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "CASA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
            },
          },
        ],
        variantGroupKey: "CASA",
        name: "Casa",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/casa.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
        coinMinimalDenom:
          "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
        symbol: "WATR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
        },
        price: {
          poolId: "1071",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "WATR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
            },
          },
        ],
        variantGroupKey: "WATR",
        name: "WATR",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/watr.png",
      },
      {
        chainName: "juno",
        sourceDenom: "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
        coinMinimalDenom:
          "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
        symbol: "DGL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
        },
        price: {
          poolId: "1143",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-42",
              path: "transfer/channel-42/factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "DGL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
            },
          },
        ],
        variantGroupKey: "DGL",
        name: "Licorice",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dgl.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
        coinMinimalDenom:
          "ibc/5F5B7DA5ECC80F6C7A8702D525BB0B74279B1F7B8EFAE36E423D68788F7F39FF",
        symbol: "KLEO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/kleomedes.png",
        },
        price: {
          poolId: "1421",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno10gthz5ufgrpuk5cscve2f0hjp56wgp90psqxcrqlg4m9mcu9dh8q4864xy",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "KLEO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/kleomedes.png",
            },
          },
        ],
        variantGroupKey: "KLEO",
        name: "Kleomedes",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/kleo.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
        coinMinimalDenom:
          "ibc/176DD560277BB0BD676260BE02EBAB697725CA85144D8A2BF286C6B5323DB5FE",
        symbol: "JAPE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/jape.png",
        },
        price: {
          poolId: "1377",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1zkwveux7y6fmsr88atf3cyffx96p0c96qr8tgcsj7vfnhx7sal3s3zu3ps",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "JAPE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/jape.png",
            },
          },
        ],
        variantGroupKey: "JAPE",
        name: "Junø Apes",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-17T17:14:00.000Z",
        relative_image_url: "/tokens/generated/jape.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
        coinMinimalDenom:
          "ibc/4BDADBEDA31899036AB286E9901116496A9D85FB87B35A408C9D67C0DCAC660A",
        symbol: "SGNL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sgnl.png",
        },
        price: {
          poolId: "1392",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno14lycavan8gvpjn97aapzvwmsj8kyrvf644p05r0hu79namyj3ens87650k",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "SGNL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sgnl.png",
            },
          },
        ],
        variantGroupKey: "SGNL",
        name: "Signal",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-18T15:42:00.000Z",
        relative_image_url: "/tokens/generated/sgnl.png",
      },
      {
        chainName: "juno",
        sourceDenom:
          "cw20:juno1spjes0smg5yp40dl7gqyw0h8rn03tnmve06dd2m5acwgh6tlx86swha3xg",
        coinMinimalDenom:
          "ibc/0D62E47FDEBBC199D4E1853C0708F0F9337AC62D95B719585C9700E466060995",
        symbol: "AFA",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/afa.png",
        },
        price: {
          poolId: "1701",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "juno",
              chainId: "juno-1",
              sourceDenom:
                "cw20:juno1spjes0smg5yp40dl7gqyw0h8rn03tnmve06dd2m5acwgh6tlx86swha3xg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channelId: "channel-47",
            },
            chain: {
              port: "transfer",
              channelId: "channel-169",
              path: "transfer/channel-169/cw20:juno1spjes0smg5yp40dl7gqyw0h8rn03tnmve06dd2m5acwgh6tlx86swha3xg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1spjes0smg5yp40dl7gqyw0h8rn03tnmve06dd2m5acwgh6tlx86swha3xg",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "AFA",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/afa.png",
            },
          },
        ],
        variantGroupKey: "AFA",
        name: "Airdrop For All",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-13T19:00:00.000Z",
        relative_image_url: "/tokens/generated/afa.png",
      },
    ],
  },
  {
    chain_name: "evmos",
    chain_id: "evmos_9001-2",
    assets: [
      {
        chainName: "evmos",
        sourceDenom: "aevmos",
        coinMinimalDenom:
          "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        symbol: "EVMOS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
        },
        coingeckoId: "evmos",
        price: {
          poolId: "722",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Evmos App",
            type: "external_interface",
            depositUrl: "https://app.evmos.org/assets",
            withdrawUrl: "https://app.evmos.org/assets",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "evmos",
              chainId: "evmos_9001-2",
              sourceDenom: "aevmos",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-204",
              path: "transfer/channel-204/aevmos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "evmos",
            sourceDenom: "aevmos",
            chainType: "cosmos",
            chainId: "evmos_9001-2",
            symbol: "EVMOS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
            },
          },
        ],
        variantGroupKey: "EVMOS",
        name: "Evmos",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/evmos.svg",
      },
      {
        chainName: "evmos",
        sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
        coinMinimalDenom:
          "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
        symbol: "NEOK",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.svg",
        },
        price: {
          poolId: "1121",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Evmos App",
            type: "external_interface",
            depositUrl: "https://app.evmos.org/assets",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "evmos",
              chainId: "evmos_9001-2",
              sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-204",
              path: "transfer/channel-204/erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
            },
          },
        ],
        counterparty: [
          {
            chainName: "evmos",
            sourceDenom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
            chainType: "cosmos",
            chainId: "evmos_9001-2",
            symbol: "NEOK",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.svg",
            },
          },
        ],
        variantGroupKey: "NEOK",
        name: "Neokingdom DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/neok.svg",
      },
      {
        chainName: "evmos",
        sourceDenom: "erc20/0x1cFc8f1FE8D5668BAFF2724547EcDbd6f013a280",
        coinMinimalDenom:
          "ibc/2BF9656CAB0384A31167DB9B0254F0FB1CB4346A229BD7E5CBDCBB911C3740F7",
        symbol: "BERLIN",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/berlin.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/berlin.svg",
        },
        price: {
          poolId: "1488",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Evmos App",
            type: "external_interface",
            depositUrl: "https://app.evmos.org/assets",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "evmos",
              chainId: "evmos_9001-2",
              sourceDenom: "erc20/0x1cFc8f1FE8D5668BAFF2724547EcDbd6f013a280",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-204",
              path: "transfer/channel-204/erc20/0x1cFc8f1FE8D5668BAFF2724547EcDbd6f013a280",
            },
          },
        ],
        counterparty: [
          {
            chainName: "evmos",
            sourceDenom: "erc20/0x1cFc8f1FE8D5668BAFF2724547EcDbd6f013a280",
            chainType: "cosmos",
            chainId: "evmos_9001-2",
            symbol: "BERLIN",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/berlin.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/berlin.svg",
            },
          },
        ],
        variantGroupKey: "BERLIN",
        name: "Teledisko DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-07T18:18:00.000Z",
        relative_image_url: "/tokens/generated/berlin.svg",
      },
      {
        chainName: "evmos",
        sourceDenom: "erc20/0xfbf4318d24a93753f11d365a6dcf8b830e98ab0f",
        coinMinimalDenom:
          "ibc/B87F0F5255CC658408F167C2F7B987A8D914622E1F73BCC267406360588F2B1E",
        symbol: "CROWDP",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/crowdp.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/crowdp.svg",
        },
        categories: [],
        transferMethods: [
          {
            name: "Evmos App",
            type: "external_interface",
            depositUrl: "https://app.evmos.org/assets",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "evmos",
              chainId: "evmos_9001-2",
              sourceDenom: "erc20/0xfbf4318d24a93753f11d365a6dcf8b830e98ab0f",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-204",
              path: "transfer/channel-204/erc20/0xfbf4318d24a93753f11d365a6dcf8b830e98ab0f",
            },
          },
        ],
        counterparty: [
          {
            chainName: "evmos",
            sourceDenom: "erc20/0xfbf4318d24a93753f11d365a6dcf8b830e98ab0f",
            chainType: "cosmos",
            chainId: "evmos_9001-2",
            symbol: "CROWDP",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/crowdp.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/crowdp.svg",
            },
          },
        ],
        variantGroupKey: "CROWDP",
        name: "Crowdpunk DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/crowdp.svg",
      },
    ],
  },
  {
    chain_name: "kava",
    chain_id: "kava_2222-10",
    assets: [
      {
        chainName: "kava",
        sourceDenom: "ukava",
        coinMinimalDenom:
          "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
        symbol: "KAVA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.svg",
        },
        coingeckoId: "kava",
        price: {
          poolId: "1105",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "ukava",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/ukava",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "ukava",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "KAVA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.svg",
            },
          },
        ],
        variantGroupKey: "KAVA",
        name: "Kava",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/kava.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "hard",
        coinMinimalDenom:
          "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
        symbol: "HARD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.svg",
        },
        coingeckoId: "kava-lend",
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "hard",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/hard",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "hard",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "HARD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.svg",
            },
          },
        ],
        variantGroupKey: "HARD",
        name: "Kava Hard",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/hard.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "swp",
        coinMinimalDenom:
          "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
        symbol: "SWP",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.svg",
        },
        coingeckoId: "kava-swap",
        price: {
          poolId: "1631",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "swp",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/swp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "swp",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "SWP",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.svg",
            },
          },
        ],
        variantGroupKey: "SWP",
        name: "Kava Swap",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/swp.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "usdx",
        coinMinimalDenom:
          "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
        symbol: "USDX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.svg",
        },
        coingeckoId: "usdx",
        price: {
          poolId: "1390",
          denom: "uosmo",
        },
        categories: ["stablecoin", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "usdx",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/usdx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "usdx",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "USDX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.svg",
            },
          },
        ],
        variantGroupKey: "USDX",
        name: "Kava USDX",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdx.svg",
      },
      {
        chainName: "kava",
        sourceDenom: "erc20/tether/usdt",
        coinMinimalDenom:
          "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        symbol: "USDT",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
        },
        coingeckoId: "tether",
        price: {
          poolId: "1220",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kava",
              chainId: "kava_2222-10",
              sourceDenom: "erc20/tether/usdt",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-143",
              path: "transfer/channel-143/erc20/tether/usdt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kava",
            sourceDenom: "erc20/tether/usdt",
            chainType: "cosmos",
            chainId: "kava_2222-10",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdt.svg",
      },
    ],
  },
  {
    chain_name: "secretnetwork",
    chain_id: "secret-4",
    assets: [
      {
        chainName: "secretnetwork",
        sourceDenom: "uscrt",
        coinMinimalDenom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        symbol: "SCRT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
        },
        coingeckoId: "secret",
        price: {
          poolId: "1095",
          denom: "uosmo",
        },
        categories: ["privacy"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "uscrt",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-88",
              path: "transfer/channel-88/uscrt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "uscrt",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SCRT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
            },
          },
        ],
        variantGroupKey: "SCRT",
        name: "Secret Network",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/scrt.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
        coinMinimalDenom:
          "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
        symbol: "ALTER",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
        },
        coingeckoId: "alter",
        price: {
          poolId: "845",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=alter",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "ALTER",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
            },
          },
        ],
        variantGroupKey: "ALTER",
        name: "Alter",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/alter.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        coinMinimalDenom:
          "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
        symbol: "BUTT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
        },
        price: {
          poolId: "985",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=butt",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "BUTT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
            },
          },
        ],
        variantGroupKey: "BUTT",
        name: "Button",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/butt.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        coinMinimalDenom:
          "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
        symbol: "SHD(old)",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
        },
        price: {
          poolId: "846",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SHD(old)",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
            },
          },
        ],
        variantGroupKey: "SHD(old)",
        name: "Shade (old)",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/shd(old).svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        coinMinimalDenom:
          "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
        symbol: "SIENNA",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
        },
        coingeckoId: "sienna",
        price: {
          poolId: "853",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=sienna",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SIENNA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
            },
          },
        ],
        variantGroupKey: "SIENNA",
        name: "SIENNA",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sienna.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        coinMinimalDenom:
          "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
        symbol: "stkd-SCRT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
        },
        coingeckoId: "stkd-scrt",
        price: {
          poolId: "854",
          denom:
            "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=stkd-scrt",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "stkd-SCRT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
            },
          },
        ],
        variantGroupKey: "stkd-SCRT",
        name: "SCRT Staking Derivatives",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stkd-scrt.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
        coinMinimalDenom:
          "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
        symbol: "AMBER",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
        },
        price: {
          poolId: "984",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=amber",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "AMBER",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
            },
          },
        ],
        variantGroupKey: "AMBER",
        name: "Amber",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/amber.svg",
      },
      {
        chainName: "secretnetwork",
        sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
        coinMinimalDenom:
          "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
        symbol: "SILK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
        },
        coingeckoId: "silk-bcec1136-561c-4706-a42c-8b67d0d7f7d2",
        price: {
          poolId: "1358",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=silk",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "secretnetwork",
              chainId: "secret-4",
              sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channelId: "channel-44",
            },
            chain: {
              port: "transfer",
              channelId: "channel-476",
              path: "transfer/channel-476/cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "secretnetwork",
            sourceDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
            chainType: "cosmos",
            chainId: "secret-4",
            symbol: "SILK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
            },
          },
        ],
        variantGroupKey: "SILK",
        name: "Silk",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/silk.svg",
      },
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
            name: "Secret Network IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://dash.scrt.network/ibc?chain=osmosis&mode=deposit&token=shd",
          },
          {
            name: "Osmosis IBC Transfer",
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
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/shd.svg",
      },
    ],
  },
  {
    chain_name: "stargaze",
    chain_id: "stargaze-1",
    assets: [
      {
        chainName: "stargaze",
        sourceDenom: "ustars",
        coinMinimalDenom:
          "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        symbol: "STARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
        },
        coingeckoId: "stargaze",
        price: {
          poolId: "1096",
          denom: "uosmo",
        },
        categories: ["nft_protocol"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom: "ustars",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/ustars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom: "ustars",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "STARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
            },
          },
        ],
        variantGroupKey: "STARS",
        name: "Stargaze",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stars.svg",
      },
      {
        chainName: "stargaze",
        sourceDenom:
          "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
        coinMinimalDenom:
          "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        symbol: "STRDST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.svg",
        },
        price: {
          poolId: "1234",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom:
                "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "STRDST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.svg",
            },
          },
        ],
        variantGroupKey: "STRDST",
        name: "Stardust STRDST",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/strdst.svg",
      },
      {
        chainName: "stargaze",
        sourceDenom:
          "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
        coinMinimalDenom:
          "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
        symbol: "BRNCH",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.svg",
        },
        price: {
          poolId: "1288",
          denom:
            "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom:
                "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "BRNCH",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.svg",
            },
          },
        ],
        variantGroupKey: "BRNCH",
        name: "Branch",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/brnch.svg",
      },
      {
        chainName: "stargaze",
        sourceDenom:
          "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
        coinMinimalDenom:
          "ibc/94ED1F172BC633DFC56D7E26551D8B101ADCCC69052AC44FED89F97FF658138F",
        symbol: "SNEAKY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.svg",
        },
        price: {
          poolId: "1403",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stargaze",
              chainId: "stargaze-1",
              sourceDenom:
                "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75",
              path: "transfer/channel-75/factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stargaze",
            sourceDenom:
              "factory/stars1xx5976njvxpl9n4v8huvff6cudhx7yuu8e7rt4/usneaky",
            chainType: "cosmos",
            chainId: "stargaze-1",
            symbol: "SNEAKY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.svg",
            },
          },
        ],
        variantGroupKey: "SNEAKY",
        name: "Sneaky Productions",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-22T12:50:00.000Z",
        relative_image_url: "/tokens/generated/sneaky.svg",
      },
    ],
  },
  {
    chain_name: "chihuahua",
    chain_id: "chihuahua-1",
    assets: [
      {
        chainName: "chihuahua",
        sourceDenom: "uhuahua",
        coinMinimalDenom:
          "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        symbol: "HUAHUA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.svg",
        },
        coingeckoId: "chihuahua-token",
        price: {
          poolId: "1111",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom: "uhuahua",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-113",
              path: "transfer/channel-113/uhuahua",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom: "uhuahua",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "HUAHUA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.svg",
            },
          },
        ],
        variantGroupKey: "HUAHUA",
        name: "Chihuahua",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/huahua.svg",
      },
      {
        chainName: "chihuahua",
        sourceDenom:
          "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
        coinMinimalDenom:
          "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        symbol: "PUPPY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/puppyhuahua_logo.png",
        },
        price: {
          poolId: "1332",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom:
                "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
              port: "wasm.chihuahua1jwkag4yvhyj9fuddtkygvavya8hmdjuzmgxwg9vp3lw9twv6lrcq9mgl52",
              channelId: "channel-73",
            },
            chain: {
              port: "transfer",
              channelId: "channel-11348",
              path: "transfer/channel-11348/cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "cw20:chihuahua1yl8z39ugle8s02fpwkhh293509q5xcpalmdzc4amvchz8nkexrmsy95gef",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "PUPPY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/puppyhuahua_logo.png",
            },
          },
        ],
        variantGroupKey: "PUPPY",
        name: "Puppy",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/puppy.png",
      },
      {
        chainName: "chihuahua",
        sourceDenom:
          "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
        coinMinimalDenom:
          "ibc/2FFE07C4B4EFC0DDA099A16C6AF3C9CCA653CC56077E87217A585D48794B0BC7",
        symbol: "BADDOG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/baddog.png",
        },
        price: {
          poolId: "1715",
          denom:
            "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom:
                "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-113",
              path: "transfer/channel-113/factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua1x4q2vkrz4dfgd9hcw0p5m2f2nuv2uqmt9xr8k2/achihuahuawifhat",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "BADDOG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/baddog.png",
            },
          },
        ],
        variantGroupKey: "BADDOG",
        name: "Chihuahuawifhat",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/baddog.png",
      },
      {
        chainName: "chihuahua",
        sourceDenom:
          "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
        coinMinimalDenom:
          "ibc/9B8EC667B6DF55387DC0F3ACC4F187DA6921B0806ED35DE6B04DE96F5AB81F53",
        symbol: "WOOF",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/woof.png",
        },
        price: {
          poolId: "1365",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chihuahua",
              chainId: "chihuahua-1",
              sourceDenom:
                "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-113",
              path: "transfer/channel-113/factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chihuahua",
            sourceDenom:
              "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
            chainType: "cosmos",
            chainId: "chihuahua-1",
            symbol: "WOOF",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/woof.png",
            },
          },
        ],
        variantGroupKey: "WOOF",
        name: "WOOF",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-17T17:41:00.000Z",
        relative_image_url: "/tokens/generated/woof.png",
      },
    ],
  },
  {
    chain_name: "persistence",
    chain_id: "core-1",
    assets: [
      {
        chainName: "persistence",
        sourceDenom: "uxprt",
        coinMinimalDenom:
          "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        symbol: "XPRT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
        },
        coingeckoId: "persistence",
        price: {
          poolId: "1773",
          denom:
            "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom: "uxprt",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/uxprt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom: "uxprt",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "XPRT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
            },
          },
        ],
        variantGroupKey: "XPRT",
        name: "Persistence",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/xprt.svg",
      },
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
        price: {
          poolId: "648",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
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
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/pstake.svg",
      },
      {
        chainName: "persistence",
        sourceDenom: "stk/uatom",
        coinMinimalDenom:
          "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
        symbol: "stkATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
        },
        coingeckoId: "stkatom",
        price: {
          poolId: "886",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom: "stk/uatom",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/stk/uatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom: "stk/uatom",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "stkATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
            },
          },
        ],
        variantGroupKey: "stkATOM",
        name: "PSTAKE staked ATOM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stkatom.svg",
      },
      {
        chainName: "persistence",
        sourceDenom: "stk/uosmo",
        coinMinimalDenom:
          "ibc/ECBE78BF7677320A93E7BA1761D144BCBF0CBC247C290C049655E106FE5DC68E",
        symbol: "stkOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.svg",
        },
        coingeckoId: "pstake-staked-osmo",
        price: {
          poolId: "1323",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "persistence",
              chainId: "core-1",
              sourceDenom: "stk/uosmo",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-4",
              path: "transfer/channel-4/stk/uosmo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "persistence",
            sourceDenom: "stk/uosmo",
            chainType: "cosmos",
            chainId: "core-1",
            symbol: "stkOSMO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.svg",
            },
          },
        ],
        variantGroupKey: "stkOSMO",
        name: "PSTAKE staked OSMO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stkosmo.svg",
      },
    ],
  },
  {
    chain_name: "akash",
    chain_id: "akashnet-2",
    assets: [
      {
        chainName: "akash",
        sourceDenom: "uakt",
        coinMinimalDenom:
          "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
        symbol: "AKT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
        },
        coingeckoId: "akash-network",
        price: {
          poolId: "1301",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["ai", "depin", "dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "akash",
              chainId: "akashnet-2",
              sourceDenom: "uakt",
              port: "transfer",
              channelId: "channel-9",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1",
              path: "transfer/channel-1/uakt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "akash",
            sourceDenom: "uakt",
            chainType: "cosmos",
            chainId: "akashnet-2",
            symbol: "AKT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
            },
          },
        ],
        variantGroupKey: "AKT",
        name: "Akash",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/akt.svg",
      },
    ],
  },
  {
    chain_name: "regen",
    chain_id: "regen-1",
    assets: [
      {
        chainName: "regen",
        sourceDenom: "uregen",
        coinMinimalDenom:
          "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        symbol: "REGEN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.svg",
        },
        coingeckoId: "regen",
        price: {
          poolId: "1483",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "regen",
              chainId: "regen-1",
              sourceDenom: "uregen",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8",
              path: "transfer/channel-8/uregen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "regen",
            sourceDenom: "uregen",
            chainType: "cosmos",
            chainId: "regen-1",
            symbol: "REGEN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.svg",
            },
          },
        ],
        variantGroupKey: "REGEN",
        name: "Regen",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/regen.svg",
      },
      {
        chainName: "regen",
        sourceDenom: "eco.uC.NCT",
        coinMinimalDenom:
          "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
        symbol: "NCT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.svg",
        },
        coingeckoId: "toucan-protocol-nature-carbon-tonne",
        price: {
          poolId: "972",
          denom:
            "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "regen",
              chainId: "regen-1",
              sourceDenom: "eco.uC.NCT",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8",
              path: "transfer/channel-8/eco.uC.NCT",
            },
          },
        ],
        counterparty: [
          {
            chainName: "regen",
            sourceDenom: "eco.uC.NCT",
            chainType: "cosmos",
            chainId: "regen-1",
            symbol: "NCT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.svg",
            },
          },
        ],
        variantGroupKey: "NCT",
        name: "Nature Carbon Ton",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nct.svg",
      },
    ],
  },
  {
    chain_name: "sentinel",
    chain_id: "sentinelhub-2",
    assets: [
      {
        chainName: "sentinel",
        sourceDenom: "udvpn",
        coinMinimalDenom:
          "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
        symbol: "DVPN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.svg",
        },
        coingeckoId: "sentinel",
        price: {
          poolId: "5",
          denom: "uosmo",
        },
        categories: ["dweb", "privacy"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sentinel",
              chainId: "sentinelhub-2",
              sourceDenom: "udvpn",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2",
              path: "transfer/channel-2/udvpn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sentinel",
            sourceDenom: "udvpn",
            chainType: "cosmos",
            chainId: "sentinelhub-2",
            symbol: "DVPN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.svg",
            },
          },
        ],
        variantGroupKey: "DVPN",
        name: "Sentinel",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dvpn.svg",
      },
    ],
  },
  {
    chain_name: "irisnet",
    chain_id: "irishub-1",
    assets: [
      {
        chainName: "irisnet",
        sourceDenom: "uiris",
        coinMinimalDenom:
          "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
        symbol: "IRIS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.svg",
        },
        coingeckoId: "iris-network",
        price: {
          poolId: "8",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "irisnet",
              chainId: "irishub-1",
              sourceDenom: "uiris",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6",
              path: "transfer/channel-6/uiris",
            },
          },
        ],
        counterparty: [
          {
            chainName: "irisnet",
            sourceDenom: "uiris",
            chainType: "cosmos",
            chainId: "irishub-1",
            symbol: "IRIS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.svg",
            },
          },
        ],
        variantGroupKey: "IRIS",
        name: "IRISnet",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/iris.svg",
      },
    ],
  },
  {
    chain_name: "starname",
    chain_id: "iov-mainnet-ibc",
    assets: [
      {
        chainName: "starname",
        sourceDenom: "uiov",
        coinMinimalDenom:
          "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
        symbol: "IOV",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.svg",
        },
        coingeckoId: "starname",
        price: {
          poolId: "197",
          denom: "uosmo",
        },
        categories: ["social"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "starname",
              chainId: "iov-mainnet-ibc",
              sourceDenom: "uiov",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-15",
              path: "transfer/channel-15/uiov",
            },
          },
        ],
        counterparty: [
          {
            chainName: "starname",
            sourceDenom: "uiov",
            chainType: "cosmos",
            chainId: "iov-mainnet-ibc",
            symbol: "IOV",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.svg",
            },
          },
        ],
        variantGroupKey: "IOV",
        name: "Starname",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/iov.svg",
      },
    ],
  },
  {
    chain_name: "emoney",
    chain_id: "emoney-3",
    assets: [
      {
        chainName: "emoney",
        sourceDenom: "ungm",
        coinMinimalDenom:
          "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
        symbol: "NGM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.svg",
        },
        coingeckoId: "e-money",
        price: {
          poolId: "463",
          denom: "uosmo",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "emoney",
              chainId: "emoney-3",
              sourceDenom: "ungm",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-37",
              path: "transfer/channel-37/ungm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "emoney",
            sourceDenom: "ungm",
            chainType: "cosmos",
            chainId: "emoney-3",
            symbol: "NGM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.svg",
            },
          },
        ],
        variantGroupKey: "NGM",
        name: "e-Money",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ngm.svg",
      },
      {
        chainName: "emoney",
        sourceDenom: "eeur",
        coinMinimalDenom:
          "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
        symbol: "EEUR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.svg",
        },
        coingeckoId: "e-money-eur",
        price: {
          poolId: "481",
          denom: "uosmo",
        },
        categories: ["stablecoin"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "emoney",
              chainId: "emoney-3",
              sourceDenom: "eeur",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-37",
              path: "transfer/channel-37/eeur",
            },
          },
        ],
        counterparty: [
          {
            chainName: "emoney",
            sourceDenom: "eeur",
            chainType: "cosmos",
            chainId: "emoney-3",
            symbol: "EEUR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.svg",
            },
          },
        ],
        variantGroupKey: "EEUR",
        name: "e-Money EUR",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/eeur.svg",
      },
    ],
  },
  {
    chain_name: "likecoin",
    chain_id: "likecoin-mainnet-2",
    assets: [
      {
        chainName: "likecoin",
        sourceDenom: "nanolike",
        coinMinimalDenom:
          "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
        symbol: "LIKE",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.svg",
        },
        coingeckoId: "likecoin",
        price: {
          poolId: "553",
          denom: "uosmo",
        },
        categories: ["social"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "likecoin",
              chainId: "likecoin-mainnet-2",
              sourceDenom: "nanolike",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-53",
              path: "transfer/channel-53/nanolike",
            },
          },
        ],
        counterparty: [
          {
            chainName: "likecoin",
            sourceDenom: "nanolike",
            chainType: "cosmos",
            chainId: "likecoin-mainnet-2",
            symbol: "LIKE",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.svg",
            },
          },
        ],
        variantGroupKey: "LIKE",
        name: "LikeCoin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/like.svg",
      },
    ],
  },
  {
    chain_name: "impacthub",
    chain_id: "ixo-5",
    assets: [
      {
        chainName: "impacthub",
        sourceDenom: "uixo",
        coinMinimalDenom:
          "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
        symbol: "IXO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.svg",
        },
        coingeckoId: "ixo",
        price: {
          poolId: "558",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "impacthub",
              chainId: "ixo-5",
              sourceDenom: "uixo",
              port: "transfer",
              channelId: "channel-4",
            },
            chain: {
              port: "transfer",
              channelId: "channel-38",
              path: "transfer/channel-38/uixo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "impacthub",
            sourceDenom: "uixo",
            chainType: "cosmos",
            chainId: "ixo-5",
            symbol: "IXO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.svg",
            },
          },
        ],
        variantGroupKey: "IXO",
        name: "Impacts Hub",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ixo.svg",
      },
    ],
  },
  {
    chain_name: "bitcanna",
    chain_id: "bitcanna-1",
    assets: [
      {
        chainName: "bitcanna",
        sourceDenom: "ubcna",
        coinMinimalDenom:
          "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
        symbol: "BCNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg",
        },
        coingeckoId: "bitcanna",
        price: {
          poolId: "572",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bitcanna",
              chainId: "bitcanna-1",
              sourceDenom: "ubcna",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-51",
              path: "transfer/channel-51/ubcna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bitcanna",
            sourceDenom: "ubcna",
            chainType: "cosmos",
            chainId: "bitcanna-1",
            symbol: "BCNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg",
            },
          },
        ],
        variantGroupKey: "BCNA",
        name: "BitCanna",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/bcna.svg",
      },
    ],
  },
  {
    chain_name: "bitsong",
    chain_id: "bitsong-2b",
    assets: [
      {
        chainName: "bitsong",
        sourceDenom: "ubtsg",
        coinMinimalDenom:
          "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        symbol: "BTSG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.svg",
        },
        coingeckoId: "bitsong",
        price: {
          poolId: "574",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["social"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bitsong",
              chainId: "bitsong-2b",
              sourceDenom: "ubtsg",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-73",
              path: "transfer/channel-73/ubtsg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bitsong",
            sourceDenom: "ubtsg",
            chainType: "cosmos",
            chainId: "bitsong-2b",
            symbol: "BTSG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.svg",
            },
          },
        ],
        variantGroupKey: "BTSG",
        name: "BitSong",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/btsg.svg",
      },
      {
        chainName: "bitsong",
        sourceDenom: "ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09",
        coinMinimalDenom:
          "ibc/7ABF696369EFB3387DF22B6A24204459FE5EFD010220E8E5618DC49DB877047B",
        symbol: "CLAY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09.png",
        },
        price: {
          poolId: "751",
          denom:
            "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        },
        categories: ["social"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bitsong",
              chainId: "bitsong-2b",
              sourceDenom: "ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-73",
              path: "transfer/channel-73/ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bitsong",
            sourceDenom: "ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09",
            chainType: "cosmos",
            chainId: "bitsong-2b",
            symbol: "CLAY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/ft2D8E7041556CE93E1EFD66C07C45D551A6AAAE09.png",
            },
          },
        ],
        variantGroupKey: "CLAY",
        name: "Adam Clay FanToken",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-29T12:00:00.000Z",
        relative_image_url: "/tokens/generated/clay.png",
      },
      {
        chainName: "bitsong",
        sourceDenom: "ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A",
        coinMinimalDenom:
          "ibc/B797E4F42CD33C50511B341E50C5CC0E8EF0D93B1E1247ABAA071583B8619202",
        symbol: "404DR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A.png",
        },
        price: {
          poolId: "758",
          denom:
            "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        },
        categories: ["social"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bitsong",
              chainId: "bitsong-2b",
              sourceDenom: "ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-73",
              path: "transfer/channel-73/ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bitsong",
            sourceDenom: "ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A",
            chainType: "cosmos",
            chainId: "bitsong-2b",
            symbol: "404DR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/ft99091610CCC66F4277C66D14AF2BC4C5EE52E27A.png",
            },
          },
        ],
        variantGroupKey: "404DR",
        name: "404Deep Records Fantoken",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-29T12:00:00.000Z",
        relative_image_url: "/tokens/generated/404dr.png",
      },
    ],
  },
  {
    chain_name: "kichain",
    chain_id: "kichain-2",
    assets: [
      {
        chainName: "kichain",
        sourceDenom: "uxki",
        coinMinimalDenom:
          "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
        symbol: "XKI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.svg",
        },
        coingeckoId: "ki",
        price: {
          poolId: "577",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kichain",
              chainId: "kichain-2",
              sourceDenom: "uxki",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-77",
              path: "transfer/channel-77/uxki",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kichain",
            sourceDenom: "uxki",
            chainType: "cosmos",
            chainId: "kichain-2",
            symbol: "XKI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.svg",
            },
          },
        ],
        variantGroupKey: "XKI",
        name: "Ki",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/xki.svg",
      },
      {
        chainName: "kichain",
        sourceDenom:
          "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
        coinMinimalDenom:
          "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
        symbol: "kichain.LVN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/lvn.png",
        },
        coingeckoId: "lvn",
        price: {
          poolId: "774",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kichain",
              chainId: "kichain-2",
              sourceDenom:
                "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
              port: "wasm.ki1hzz0s0ucrhdp6tue2lxk3c03nj6f60qy463we7lgx0wudd72ctmsd9kgha",
              channelId: "channel-18",
            },
            chain: {
              port: "transfer",
              channelId: "channel-261",
              path: "transfer/channel-261/cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kichain",
            sourceDenom:
              "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
            chainType: "cosmos",
            chainId: "kichain-2",
            symbol: "LVN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/lvn.png",
            },
          },
        ],
        variantGroupKey: "LVN",
        name: "LVN",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/kichain.lvn.png",
      },
    ],
  },
  {
    chain_name: "panacea",
    chain_id: "panacea-3",
    assets: [
      {
        chainName: "panacea",
        sourceDenom: "umed",
        coinMinimalDenom:
          "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
        symbol: "MED",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.svg",
        },
        coingeckoId: "medibloc",
        price: {
          poolId: "587",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "panacea",
              chainId: "panacea-3",
              sourceDenom: "umed",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-82",
              path: "transfer/channel-82/umed",
            },
          },
        ],
        counterparty: [
          {
            chainName: "panacea",
            sourceDenom: "umed",
            chainType: "cosmos",
            chainId: "panacea-3",
            symbol: "MED",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.svg",
            },
          },
        ],
        variantGroupKey: "MED",
        name: "Medibloc",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/med.svg",
      },
    ],
  },
  {
    chain_name: "bostrom",
    chain_id: "bostrom",
    assets: [
      {
        chainName: "bostrom",
        sourceDenom: "boot",
        coinMinimalDenom:
          "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        symbol: "BOOT",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.svg",
        },
        coingeckoId: "bostrom",
        price: {
          poolId: "912",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["ai"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "boot",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/boot",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "boot",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "BOOT",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.svg",
            },
          },
        ],
        variantGroupKey: "BOOT",
        name: "bostrom",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/boot.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "hydrogen",
        coinMinimalDenom:
          "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        symbol: "HYDROGEN",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.svg",
        },
        price: {
          poolId: "1330",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "hydrogen",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/hydrogen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "hydrogen",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "HYDROGEN",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.svg",
            },
          },
        ],
        variantGroupKey: "HYDROGEN",
        name: "Bostrom Hydrogen",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/hydrogen.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "tocyb",
        coinMinimalDenom:
          "ibc/BCDB35B7390806F35E716D275E1E017999F8281A81B6F128F087EF34D1DFA761",
        symbol: "TOCYB",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.svg",
        },
        price: {
          poolId: "1310",
          denom:
            "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "tocyb",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/tocyb",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "tocyb",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "TOCYB",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.svg",
            },
          },
        ],
        variantGroupKey: "TOCYB",
        name: "Bostrom Tocyb",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/tocyb.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "millivolt",
        coinMinimalDenom:
          "ibc/D3A1900B2B520E45608B5671ADA461E1109628E89B4289099557C6D3996F7DAA",
        symbol: "V",
        decimals: 3,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.svg",
        },
        price: {
          poolId: "1304",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "millivolt",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/millivolt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "millivolt",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "V",
            decimals: 3,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.svg",
            },
          },
        ],
        variantGroupKey: "V",
        name: "Bostrom Volt",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/v.svg",
      },
      {
        chainName: "bostrom",
        sourceDenom: "milliampere",
        coinMinimalDenom:
          "ibc/020F5162B7BC40656FC5432622647091F00D53E82EE8D21757B43D3282F25424",
        symbol: "A",
        decimals: 3,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.svg",
        },
        price: {
          poolId: "1303",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bostrom",
              chainId: "bostrom",
              sourceDenom: "milliampere",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-95",
              path: "transfer/channel-95/milliampere",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bostrom",
            sourceDenom: "milliampere",
            chainType: "cosmos",
            chainId: "bostrom",
            symbol: "A",
            decimals: 3,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.svg",
            },
          },
        ],
        variantGroupKey: "A",
        name: "Bostrom Ampere",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/a.svg",
      },
    ],
  },
  {
    chain_name: "comdex",
    chain_id: "comdex-1",
    assets: [
      {
        chainName: "comdex",
        sourceDenom: "ucmdx",
        coinMinimalDenom:
          "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        symbol: "CMDX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
        },
        coingeckoId: "comdex",
        price: {
          poolId: "601",
          denom: "uosmo",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "comdex",
              chainId: "comdex-1",
              sourceDenom: "ucmdx",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-87",
              path: "transfer/channel-87/ucmdx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "comdex",
            sourceDenom: "ucmdx",
            chainType: "cosmos",
            chainId: "comdex-1",
            symbol: "CMDX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
            },
          },
        ],
        variantGroupKey: "CMDX",
        name: "Comdex",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cmdx.svg",
      },
      {
        chainName: "comdex",
        sourceDenom: "ucmst",
        coinMinimalDenom:
          "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
        symbol: "CMST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.svg",
        },
        coingeckoId: "composite",
        price: {
          poolId: "857",
          denom: "uosmo",
        },
        categories: ["stablecoin", "defi"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "comdex",
              chainId: "comdex-1",
              sourceDenom: "ucmst",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-87",
              path: "transfer/channel-87/ucmst",
            },
          },
        ],
        counterparty: [
          {
            chainName: "comdex",
            sourceDenom: "ucmst",
            chainType: "cosmos",
            chainId: "comdex-1",
            symbol: "CMST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.svg",
            },
          },
        ],
        variantGroupKey: "CMST",
        name: "CMST",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cmst.svg",
      },
      {
        chainName: "comdex",
        sourceDenom: "uharbor",
        coinMinimalDenom:
          "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
        symbol: "HARBOR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.svg",
        },
        coingeckoId: "harbor-2",
        price: {
          poolId: "967",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "comdex",
              chainId: "comdex-1",
              sourceDenom: "uharbor",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-87",
              path: "transfer/channel-87/uharbor",
            },
          },
        ],
        counterparty: [
          {
            chainName: "comdex",
            sourceDenom: "uharbor",
            chainType: "cosmos",
            chainId: "comdex-1",
            symbol: "HARBOR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.svg",
            },
          },
        ],
        variantGroupKey: "HARBOR",
        name: "Harbor",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/harbor.svg",
      },
    ],
  },
  {
    chain_name: "cheqd",
    chain_id: "cheqd-mainnet-1",
    assets: [
      {
        chainName: "cheqd",
        sourceDenom: "ncheq",
        coinMinimalDenom:
          "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
        symbol: "CHEQ",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.svg",
        },
        coingeckoId: "cheqd-network",
        price: {
          poolId: "1273",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cheqd",
              chainId: "cheqd-mainnet-1",
              sourceDenom: "ncheq",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-108",
              path: "transfer/channel-108/ncheq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cheqd",
            sourceDenom: "ncheq",
            chainType: "cosmos",
            chainId: "cheqd-mainnet-1",
            symbol: "CHEQ",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.svg",
            },
          },
        ],
        variantGroupKey: "CHEQ",
        name: "Cheqd",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cheq.svg",
      },
    ],
  },
  {
    chain_name: "lumnetwork",
    chain_id: "lum-network-1",
    assets: [
      {
        chainName: "lumnetwork",
        sourceDenom: "ulum",
        coinMinimalDenom:
          "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
        symbol: "LUM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.svg",
        },
        coingeckoId: "lum-network",
        price: {
          poolId: "608",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "lumnetwork",
              chainId: "lum-network-1",
              sourceDenom: "ulum",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-115",
              path: "transfer/channel-115/ulum",
            },
          },
        ],
        counterparty: [
          {
            chainName: "lumnetwork",
            sourceDenom: "ulum",
            chainType: "cosmos",
            chainId: "lum-network-1",
            symbol: "LUM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.svg",
            },
          },
        ],
        variantGroupKey: "LUM",
        name: "Lum Network",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/lum.svg",
      },
    ],
  },
  {
    chain_name: "vidulum",
    chain_id: "vidulum-1",
    assets: [
      {
        chainName: "vidulum",
        sourceDenom: "uvdl",
        coinMinimalDenom:
          "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
        symbol: "VDL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.svg",
        },
        coingeckoId: "vidulum",
        price: {
          poolId: "613",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "vidulum",
              chainId: "vidulum-1",
              sourceDenom: "uvdl",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-124",
              path: "transfer/channel-124/uvdl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "vidulum",
            sourceDenom: "uvdl",
            chainType: "cosmos",
            chainId: "vidulum-1",
            symbol: "VDL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.svg",
            },
          },
        ],
        variantGroupKey: "VDL",
        name: "Vidulum",
        isAlloyed: false,
        verified: true,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/vdl.svg",
      },
    ],
  },
  {
    chain_name: "desmos",
    chain_id: "desmos-mainnet",
    assets: [
      {
        chainName: "desmos",
        sourceDenom: "udsm",
        coinMinimalDenom:
          "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
        symbol: "DSM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
        },
        coingeckoId: "desmos",
        price: {
          poolId: "619",
          denom: "uosmo",
        },
        categories: ["social"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "desmos",
              chainId: "desmos-mainnet",
              sourceDenom: "udsm",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-135",
              path: "transfer/channel-135/udsm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "desmos",
            sourceDenom: "udsm",
            chainType: "cosmos",
            chainId: "desmos-mainnet",
            symbol: "DSM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
            },
          },
        ],
        variantGroupKey: "DSM",
        name: "Desmos",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dsm.svg",
      },
    ],
  },
  {
    chain_name: "dig",
    chain_id: "dig-1",
    assets: [
      {
        chainName: "dig",
        sourceDenom: "udig",
        coinMinimalDenom:
          "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
        symbol: "DIG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
        },
        coingeckoId: "dig-chain",
        price: {
          poolId: "621",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dig",
              chainId: "dig-1",
              sourceDenom: "udig",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-128",
              path: "transfer/channel-128/udig",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dig",
            sourceDenom: "udig",
            chainType: "cosmos",
            chainId: "dig-1",
            symbol: "DIG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
            },
          },
        ],
        variantGroupKey: "DIG",
        name: "Dig Chain",
        isAlloyed: false,
        verified: true,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/dig.png",
      },
    ],
  },
  {
    chain_name: "sommelier",
    chain_id: "sommelier-3",
    assets: [
      {
        chainName: "sommelier",
        sourceDenom: "usomm",
        coinMinimalDenom:
          "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        symbol: "SOMM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
        },
        coingeckoId: "sommelier",
        price: {
          poolId: "1103",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sommelier",
              chainId: "sommelier-3",
              sourceDenom: "usomm",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-165",
              path: "transfer/channel-165/usomm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sommelier",
            sourceDenom: "usomm",
            chainType: "cosmos",
            chainId: "sommelier-3",
            symbol: "SOMM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
            },
          },
        ],
        variantGroupKey: "SOMM",
        name: "Sommelier",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/somm.svg",
      },
    ],
  },
  {
    chain_name: "bandchain",
    chain_id: "laozi-mainnet",
    assets: [
      {
        chainName: "bandchain",
        sourceDenom: "uband",
        coinMinimalDenom:
          "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
        symbol: "BAND",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.svg",
        },
        coingeckoId: "band-protocol",
        price: {
          poolId: "626",
          denom: "uosmo",
        },
        categories: ["oracles"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bandchain",
              chainId: "laozi-mainnet",
              sourceDenom: "uband",
              port: "transfer",
              channelId: "channel-83",
            },
            chain: {
              port: "transfer",
              channelId: "channel-148",
              path: "transfer/channel-148/uband",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bandchain",
            sourceDenom: "uband",
            chainType: "cosmos",
            chainId: "laozi-mainnet",
            symbol: "BAND",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.svg",
            },
          },
        ],
        variantGroupKey: "BAND",
        name: "Band Protocol",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/band.svg",
      },
    ],
  },
  {
    chain_name: "konstellation",
    chain_id: "darchub",
    assets: [
      {
        chainName: "konstellation",
        sourceDenom: "udarc",
        coinMinimalDenom:
          "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
        symbol: "DARC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.svg",
        },
        coingeckoId: "darcmatter-coin",
        price: {
          poolId: "637",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "konstellation",
              chainId: "darchub",
              sourceDenom: "udarc",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-171",
              path: "transfer/channel-171/udarc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "konstellation",
            sourceDenom: "udarc",
            chainType: "cosmos",
            chainId: "darchub",
            symbol: "DARC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.svg",
            },
          },
        ],
        variantGroupKey: "DARC",
        name: "Konstellation",
        isAlloyed: false,
        verified: true,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/darc.svg",
      },
    ],
  },
  {
    chain_name: "umee",
    chain_id: "umee-1",
    assets: [
      {
        chainName: "umee",
        sourceDenom: "uumee",
        coinMinimalDenom:
          "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        symbol: "UMEE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.svg",
        },
        coingeckoId: "umee",
        price: {
          poolId: "1110",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "umee",
              chainId: "umee-1",
              sourceDenom: "uumee",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-184",
              path: "transfer/channel-184/uumee",
            },
          },
        ],
        counterparty: [
          {
            chainName: "umee",
            sourceDenom: "uumee",
            chainType: "cosmos",
            chainId: "umee-1",
            symbol: "UMEE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.svg",
            },
          },
        ],
        variantGroupKey: "UMEE",
        name: "UX Chain",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/umee.svg",
      },
    ],
  },
  {
    chain_name: "gravitybridge",
    chain_id: "gravity-bridge-3",
    assets: [
      {
        chainName: "gravitybridge",
        sourceDenom: "ugraviton",
        coinMinimalDenom:
          "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        symbol: "GRAV",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
        },
        coingeckoId: "graviton",
        price: {
          poolId: "1113",
          denom: "uosmo",
        },
        categories: ["bridges"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "ugraviton",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/ugraviton",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "ugraviton",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "GRAV",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
            },
          },
        ],
        variantGroupKey: "GRAV",
        name: "Gravity Bridge",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/grav.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        coinMinimalDenom:
          "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
        symbol: "WBTC.grv",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.grv.svg",
        },
        price: {
          poolId: "694",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: [],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            chainType: "evm",
            chainId: 1,
            address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            symbol: "WBTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.svg",
            },
          },
        ],
        variantGroupKey: "WBTC",
        name: "Wrapped Bitcoin (Gravity Bridge)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relative_image_url: "/tokens/generated/wbtc.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        coinMinimalDenom:
          "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
        symbol: "WETH.grv",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/weth.grv.svg",
        },
        price: {
          poolId: "1297",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: [],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chainType: "evm",
            chainId: 1,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Ether (Gravity Bridge)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relative_image_url: "/tokens/generated/weth.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        coinMinimalDenom:
          "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
        symbol: "USDC.grv",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.grv.svg",
        },
        coingeckoId: "gravity-bridge-usdc",
        price: {
          poolId: "872",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USDC (Gravity Bridge)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdc.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
        coinMinimalDenom:
          "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
        symbol: "DAI.grv",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dai.grv.svg",
        },
        price: {
          poolId: "702",
          denom:
            "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            chainType: "evm",
            chainId: 1,
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
        ],
        variantGroupKey: "DAI",
        name: "DAI Stablecoin (Gravity Bridge)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relative_image_url: "/tokens/generated/dai.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
        coinMinimalDenom:
          "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
        symbol: "USDT.grv",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.grv.svg",
        },
        price: {
          poolId: "818",
          denom: "uosmo",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD (Gravity Bridge)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        relative_image_url: "/tokens/generated/usdt.grv.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
        coinMinimalDenom:
          "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99",
        symbol: "PAGE",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.svg",
        },
        coingeckoId: "page",
        price: {
          poolId: "1344",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "PAGE",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            chainType: "evm",
            chainId: 1,
            address: "0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
            symbol: "PAGE",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.svg",
            },
          },
        ],
        variantGroupKey: "PAGE",
        name: "Page",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/page.svg",
      },
      {
        chainName: "gravitybridge",
        sourceDenom: "gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
        coinMinimalDenom:
          "ibc/A5CCD24BA902843B1003A7EEE5F937C632808B9CF4925601241B15C5A0A51A53",
        symbol: "PAXG.grv",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/paxg.grv.svg",
        },
        price: {
          poolId: "1492",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Gravity Bridge",
            type: "external_interface",
            depositUrl:
              "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
            withdrawUrl:
              "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gravitybridge",
              chainId: "gravity-bridge-3",
              sourceDenom: "gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-144",
              path: "transfer/channel-144/gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gravitybridge",
            sourceDenom: "gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
            chainType: "cosmos",
            chainId: "gravity-bridge-3",
            symbol: "PAXG",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/paxg.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/paxg.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
            chainType: "evm",
            chainId: 1,
            address: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
            symbol: "PAXG",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/paxg.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/paxg.svg",
            },
          },
        ],
        variantGroupKey: "PAXG",
        name: "Paxos Gold (Gravity Bridge)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "gravitybridge",
          sourceDenom: "ugrav",
        },
        listingDate: "2024-04-13T19:14:00.000Z",
        relative_image_url: "/tokens/generated/paxg.grv.svg",
      },
    ],
  },
  {
    chain_name: "decentr",
    chain_id: "mainnet-3",
    assets: [
      {
        chainName: "decentr",
        sourceDenom: "udec",
        coinMinimalDenom:
          "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
        symbol: "DEC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.svg",
        },
        coingeckoId: "decentr",
        price: {
          poolId: "644",
          denom: "uosmo",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "decentr",
              chainId: "mainnet-3",
              sourceDenom: "udec",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-181",
              path: "transfer/channel-181/udec",
            },
          },
        ],
        counterparty: [
          {
            chainName: "decentr",
            sourceDenom: "udec",
            chainType: "cosmos",
            chainId: "mainnet-3",
            symbol: "DEC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.svg",
            },
          },
        ],
        variantGroupKey: "DEC",
        name: "Decentr",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dec.svg",
      },
    ],
  },
  {
    chain_name: "carbon",
    chain_id: "carbon-1",
    assets: [
      {
        chainName: "carbon",
        sourceDenom: "swth",
        coinMinimalDenom:
          "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
        symbol: "SWTH",
        decimals: 8,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.svg",
        },
        coingeckoId: "switcheo",
        price: {
          poolId: "651",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Carbon Demex",
            type: "external_interface",
            depositUrl:
              "https://app.dem.exchange/account/balance/withdraw/swth",
            withdrawUrl:
              "https://app.dem.exchange/account/balance/deposit/swth",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "carbon",
              chainId: "carbon-1",
              sourceDenom: "swth",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-188",
              path: "transfer/channel-188/swth",
            },
          },
        ],
        counterparty: [
          {
            chainName: "carbon",
            sourceDenom: "swth",
            chainType: "cosmos",
            chainId: "carbon-1",
            symbol: "SWTH",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.svg",
            },
          },
        ],
        variantGroupKey: "SWTH",
        name: "Carbon",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/swth.svg",
      },
    ],
  },
  {
    chain_name: "cerberus",
    chain_id: "cerberus-chain-1",
    assets: [
      {
        chainName: "cerberus",
        sourceDenom: "ucrbrus",
        coinMinimalDenom:
          "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
        symbol: "CRBRUS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg",
        },
        coingeckoId: "cerberus-2",
        price: {
          poolId: "662",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cerberus",
              chainId: "cerberus-chain-1",
              sourceDenom: "ucrbrus",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-212",
              path: "transfer/channel-212/ucrbrus",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cerberus",
            sourceDenom: "ucrbrus",
            chainType: "cosmos",
            chainId: "cerberus-chain-1",
            symbol: "CRBRUS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg",
            },
          },
        ],
        variantGroupKey: "CRBRUS",
        name: "Cerberus",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/crbrus.svg",
      },
    ],
  },
  {
    chain_name: "fetchhub",
    chain_id: "fetchhub-4",
    assets: [
      {
        chainName: "fetchhub",
        sourceDenom: "afet",
        coinMinimalDenom:
          "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
        symbol: "FET",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.svg",
        },
        coingeckoId: "fetch-ai",
        price: {
          poolId: "681",
          denom: "uosmo",
        },
        categories: ["ai"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "fetchhub",
              chainId: "fetchhub-4",
              sourceDenom: "afet",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-229",
              path: "transfer/channel-229/afet",
            },
          },
        ],
        counterparty: [
          {
            chainName: "fetchhub",
            sourceDenom: "afet",
            chainType: "cosmos",
            chainId: "fetchhub-4",
            symbol: "FET",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.svg",
            },
          },
        ],
        variantGroupKey: "FET",
        name: "Fetch.ai",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fet.svg",
      },
    ],
  },
  {
    chain_name: "assetmantle",
    chain_id: "mantle-1",
    assets: [
      {
        chainName: "assetmantle",
        sourceDenom: "umntl",
        coinMinimalDenom:
          "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
        symbol: "MNTL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.svg",
        },
        coingeckoId: "assetmantle",
        price: {
          poolId: "686",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["nft_protocol"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "assetmantle",
              chainId: "mantle-1",
              sourceDenom: "umntl",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-232",
              path: "transfer/channel-232/umntl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "assetmantle",
            sourceDenom: "umntl",
            chainType: "cosmos",
            chainId: "mantle-1",
            symbol: "MNTL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.svg",
            },
          },
        ],
        variantGroupKey: "MNTL",
        name: "AssetMantle",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mntl.svg",
      },
    ],
  },
  {
    chain_name: "injective",
    chain_id: "injective-1",
    assets: [
      {
        chainName: "injective",
        sourceDenom: "inj",
        coinMinimalDenom:
          "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
        symbol: "INJ",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
        },
        coingeckoId: "injective-protocol",
        price: {
          poolId: "1319",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Injective Hub",
            type: "external_interface",
            depositUrl: "https://bridge.injective.network/",
            withdrawUrl: "https://bridge.injective.network/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom: "inj",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/inj",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom: "inj",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "INJ",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
            },
          },
        ],
        variantGroupKey: "INJ",
        name: "Injective",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/inj.svg",
      },
      {
        chainName: "injective",
        sourceDenom:
          "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
        coinMinimalDenom:
          "ibc/9DDF52A334F92BC57A9E0D59DFF9984EAC61D2A14E5162605DF601AA58FDFC6D",
        symbol: "AUTISM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/autism.png",
        },
        coingeckoId: "autism",
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom:
                "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz/autism",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "AUTISM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/autism.png",
            },
          },
        ],
        variantGroupKey: "AUTISM",
        name: "Autism",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/autism.png",
      },
      {
        chainName: "injective",
        sourceDenom: "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
        coinMinimalDenom:
          "ibc/183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
        symbol: "NINJA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/ninja.png",
        },
        coingeckoId: "dog-wif-nuchucks",
        price: {
          poolId: "1384",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=factory%2Finj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w%2Fninja&token1=ibc%2F183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3&token1=factory%2Finj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w%2Fninja",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom:
                "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w/ninja",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "NINJA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/ninja.png",
            },
          },
        ],
        variantGroupKey: "NINJA",
        name: "Dog wif nunchucks",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-24T10:58:00.000Z",
        relative_image_url: "/tokens/generated/ninja.png",
      },
      {
        chainName: "injective",
        sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
        coinMinimalDenom:
          "ibc/072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
        symbol: "injective.GLTO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
        },
        price: {
          poolId: "1574",
          denom: "uosmo",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2&token1=ibc%2F072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7&token1=peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom: "peggy0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            chainType: "evm",
            chainId: 1,
            address: "0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
          {
            chainName: "juno",
            sourceDenom:
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            chainType: "cosmos",
            chainId: "juno-1",
            symbol: "GLTO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
            },
          },
        ],
        variantGroupKey: "GLTO",
        name: "Gelotto (Injective)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-01T20:23:00.000Z",
        relative_image_url: "/tokens/generated/injective.glto.svg",
      },
      {
        chainName: "injective",
        sourceDenom: "peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
        coinMinimalDenom:
          "ibc/B84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000",
        symbol: "BEAST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/beast.png",
        },
        price: {
          poolId: "1630",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=peggy0xA4426666addBE8c4985377d36683D17FB40c31Be&token1=ibc%2FB84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2FB84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000&token1=peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom: "peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom: "peggy0xA4426666addBE8c4985377d36683D17FB40c31Be",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "BEAST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/beast.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xA4426666addBE8c4985377d36683D17FB40c31Be",
            chainType: "evm",
            chainId: 1,
            address: "0xA4426666addBE8c4985377d36683D17FB40c31Be",
            symbol: "BEAST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/beast.png",
            },
          },
        ],
        variantGroupKey: "BEAST",
        name: "Gelotto BEAST (Peggy)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-01T19:35:00.000Z",
        relative_image_url: "/tokens/generated/beast.png",
      },
      {
        chainName: "injective",
        sourceDenom: "factory/inj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52/uhava",
        coinMinimalDenom:
          "ibc/884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
        symbol: "HAVA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/hava.png",
        },
        coingeckoId: "hava-coin",
        price: {
          poolId: "1687",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=injective-1&chainTo=osmosis-1&token0=factory%2Finj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52%2Fuhava&token1=ibc%2F884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=injective-1&token0=ibc%2F884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2&token1=factory%2Finj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52%2Fuhava",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "injective",
              chainId: "injective-1",
              sourceDenom:
                "factory/inj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52/uhava",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-122",
              path: "transfer/channel-122/factory/inj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52/uhava",
            },
          },
        ],
        counterparty: [
          {
            chainName: "injective",
            sourceDenom:
              "factory/inj1h0ypsdtjfcjynqu3m75z2zwwz5mmrj8rtk2g52/uhava",
            chainType: "cosmos",
            chainId: "injective-1",
            symbol: "HAVA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/hava.png",
            },
          },
        ],
        variantGroupKey: "HAVA",
        name: "Hava Coin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-15T15:55:00.000Z",
        relative_image_url: "/tokens/generated/hava.png",
      },
    ],
  },
  {
    chain_name: "microtick",
    chain_id: "microtick-1",
    assets: [
      {
        chainName: "microtick",
        sourceDenom: "utick",
        coinMinimalDenom:
          "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
        symbol: "TICK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.svg",
        },
        coingeckoId: "microtick",
        price: {
          poolId: "547",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["oracles"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "microtick",
              chainId: "microtick-1",
              sourceDenom: "utick",
              port: "transfer",
              channelId: "channel-16",
            },
            chain: {
              port: "transfer",
              channelId: "channel-39",
              path: "transfer/channel-39/utick",
            },
          },
        ],
        counterparty: [
          {
            chainName: "microtick",
            sourceDenom: "utick",
            chainType: "cosmos",
            chainId: "microtick-1",
            symbol: "TICK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.svg",
            },
          },
        ],
        variantGroupKey: "TICK",
        name: "Microtick",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/tick.svg",
      },
    ],
  },
  {
    chain_name: "sifchain",
    chain_id: "sifchain-1",
    assets: [
      {
        chainName: "sifchain",
        sourceDenom: "rowan",
        coinMinimalDenom:
          "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
        symbol: "ROWAN",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.svg",
        },
        coingeckoId: "sifchain",
        price: {
          poolId: "629",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sifchain",
              chainId: "sifchain-1",
              sourceDenom: "rowan",
              port: "transfer",
              channelId: "channel-17",
            },
            chain: {
              port: "transfer",
              channelId: "channel-47",
              path: "transfer/channel-47/rowan",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sifchain",
            sourceDenom: "rowan",
            chainType: "cosmos",
            chainId: "sifchain-1",
            symbol: "ROWAN",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.svg",
            },
          },
        ],
        variantGroupKey: "ROWAN",
        name: "Sifchain",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/rowan.svg",
      },
    ],
  },
  {
    chain_name: "shentu",
    chain_id: "shentu-2.2",
    assets: [
      {
        chainName: "shentu",
        sourceDenom: "uctk",
        coinMinimalDenom:
          "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
        symbol: "CTK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.svg",
        },
        coingeckoId: "certik",
        price: {
          poolId: "1020",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "shentu",
              chainId: "shentu-2.2",
              sourceDenom: "uctk",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-146",
              path: "transfer/channel-146/uctk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "shentu",
            sourceDenom: "uctk",
            chainType: "cosmos",
            chainId: "shentu-2.2",
            symbol: "CTK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.svg",
            },
          },
        ],
        variantGroupKey: "CTK",
        name: "Shentu",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ctk.svg",
      },
    ],
  },
  {
    chain_name: "provenance",
    chain_id: "pio-mainnet-1",
    assets: [
      {
        chainName: "provenance",
        sourceDenom: "nhash",
        coinMinimalDenom:
          "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
        symbol: "HASH",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.svg",
        },
        coingeckoId: "provenance-blockchain",
        price: {
          poolId: "693",
          denom: "uosmo",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "provenance",
              chainId: "pio-mainnet-1",
              sourceDenom: "nhash",
              port: "transfer",
              channelId: "channel-7",
            },
            chain: {
              port: "transfer",
              channelId: "channel-222",
              path: "transfer/channel-222/nhash",
            },
          },
        ],
        counterparty: [
          {
            chainName: "provenance",
            sourceDenom: "nhash",
            chainType: "cosmos",
            chainId: "pio-mainnet-1",
            symbol: "HASH",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.svg",
            },
          },
        ],
        variantGroupKey: "HASH",
        name: "Provenance",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/hash.svg",
      },
    ],
  },
  {
    chain_name: "galaxy",
    chain_id: "galaxy-1",
    assets: [
      {
        chainName: "galaxy",
        sourceDenom: "uglx",
        coinMinimalDenom:
          "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
        symbol: "GLX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.svg",
        },
        price: {
          poolId: "697",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "galaxy",
              chainId: "galaxy-1",
              sourceDenom: "uglx",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-236",
              path: "transfer/channel-236/uglx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "galaxy",
            sourceDenom: "uglx",
            chainType: "cosmos",
            chainId: "galaxy-1",
            symbol: "GLX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.svg",
            },
          },
        ],
        variantGroupKey: "GLX",
        name: "Galaxy",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/glx.svg",
      },
    ],
  },
  {
    chain_name: "meme",
    chain_id: "meme-1",
    assets: [
      {
        chainName: "meme",
        sourceDenom: "umeme",
        coinMinimalDenom:
          "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
        symbol: "MEME",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.svg",
        },
        coingeckoId: "meme-network",
        price: {
          poolId: "701",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "meme",
              chainId: "meme-1",
              sourceDenom: "umeme",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-238",
              path: "transfer/channel-238/umeme",
            },
          },
        ],
        counterparty: [
          {
            chainName: "meme",
            sourceDenom: "umeme",
            chainType: "cosmos",
            chainId: "meme-1",
            symbol: "MEME",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.svg",
            },
          },
        ],
        variantGroupKey: "MEME",
        name: "MEME",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/meme.svg",
      },
    ],
  },
  {
    chain_name: "terra2",
    chain_id: "phoenix-1",
    assets: [
      {
        chainName: "terra2",
        sourceDenom: "uluna",
        coinMinimalDenom:
          "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        symbol: "LUNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.svg",
        },
        coingeckoId: "terra-luna-2",
        price: {
          poolId: "1728",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom: "uluna",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-251",
              path: "transfer/channel-251/uluna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom: "uluna",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "LUNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.svg",
            },
          },
        ],
        variantGroupKey: "LUNA",
        name: "Luna",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/luna.svg",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
        coinMinimalDenom:
          "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        symbol: "ROAR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/roar.png",
        },
        coingeckoId: "lion-dao",
        price: {
          poolId: "1043",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv&token1=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0&token1=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "ROAR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/roar.png",
            },
          },
        ],
        variantGroupKey: "ROAR",
        name: "Lion DAO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/roar.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
        coinMinimalDenom:
          "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        symbol: "CUB",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/cub.png",
        },
        price: {
          poolId: "1072",
          denom:
            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t&token1=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3&token1=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "CUB",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/cub.png",
            },
          },
        ],
        variantGroupKey: "CUB",
        name: "Lion Cub DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cub.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
        coinMinimalDenom:
          "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        symbol: "BLUE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/blue.png",
        },
        price: {
          poolId: "1073",
          denom:
            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584&token1=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E&token1=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "BLUE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/blue.png",
            },
          },
        ],
        variantGroupKey: "BLUE",
        name: "BLUE CUB DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/blue.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
        coinMinimalDenom:
          "ibc/C25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7",
        symbol: "ASTRO.cw20",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/astro-cw20.svg",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26&token1=ibc%2FC25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FC25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7&token1=terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
              port: "wasm.terra1jhfjnm39y3nn9l4520mdn4k5mw23nz0674c4gsvyrcr90z9tqcvst22fce",
              channelId: "channel-392",
            },
            chain: {
              port: "transfer",
              channelId: "channel-21671",
              path: "transfer/channel-21671/cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "ASTRO.cw20",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/astro-cw20.svg",
            },
          },
        ],
        variantGroupKey: "ASTRO.cw20",
        name: "Astroport CW20 Token",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-13T17:30:00.000Z",
        relative_image_url: "/tokens/generated/astro.cw20.svg",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
        coinMinimalDenom:
          "ibc/7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942",
        symbol: "BMOS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/bitmos.png",
        },
        price: {
          poolId: "1505",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq&token1=ibc%2F7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942&token1=terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "BMOS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/bitmos.png",
            },
          },
        ],
        variantGroupKey: "BMOS",
        name: "Bitmos",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-02T22:12:00.000Z",
        relative_image_url: "/tokens/generated/bmos.png",
      },
      {
        chainName: "terra2",
        sourceDenom:
          "cw20:terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
        coinMinimalDenom:
          "ibc/06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56",
        symbol: "SAYVE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/sayve.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/sayve.svg",
        },
        price: {
          poolId: "1638",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3&token1=ibc%2F06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56&token1=terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "terra2",
              chainId: "phoenix-1",
              sourceDenom:
                "cw20:terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channelId: "channel-26",
            },
            chain: {
              port: "transfer",
              channelId: "channel-341",
              path: "transfer/channel-341/cw20:terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "terra2",
            sourceDenom:
              "cw20:terra1xp9hrhthzddnl7j5du83gqqr4wmdjm5t0guzg9jp6jwrtpukwfjsjgy4f3",
            chainType: "cosmos",
            chainId: "phoenix-1",
            symbol: "SAYVE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/sayve.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/sayve.svg",
            },
          },
        ],
        variantGroupKey: "SAYVE",
        name: "sayve",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/sayve.svg",
      },
    ],
  },
  {
    chain_name: "rizon",
    chain_id: "titan-1",
    assets: [
      {
        chainName: "rizon",
        sourceDenom: "uatolo",
        coinMinimalDenom:
          "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
        symbol: "ATOLO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.svg",
        },
        coingeckoId: "rizon",
        price: {
          poolId: "729",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "rizon",
              chainId: "titan-1",
              sourceDenom: "uatolo",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-221",
              path: "transfer/channel-221/uatolo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "rizon",
            sourceDenom: "uatolo",
            chainType: "cosmos",
            chainId: "titan-1",
            symbol: "ATOLO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.svg",
            },
          },
        ],
        variantGroupKey: "ATOLO",
        name: "Rizon",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/atolo.svg",
      },
    ],
  },
  {
    chain_name: "genesisl1",
    chain_id: "genesis_29-2",
    assets: [
      {
        chainName: "genesisl1",
        sourceDenom: "el1",
        coinMinimalDenom:
          "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
        symbol: "L1",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.svg",
        },
        price: {
          poolId: "732",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "genesisl1",
              chainId: "genesis_29-2",
              sourceDenom: "el1",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-253",
              path: "transfer/channel-253/el1",
            },
          },
        ],
        counterparty: [
          {
            chainName: "genesisl1",
            sourceDenom: "el1",
            chainType: "cosmos",
            chainId: "genesis_29-2",
            symbol: "L1",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.svg",
            },
          },
        ],
        variantGroupKey: "L1",
        name: "GenesisL1",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/l1.svg",
      },
    ],
  },
  {
    chain_name: "kujira",
    chain_id: "kaiyo-1",
    assets: [
      {
        chainName: "kujira",
        sourceDenom: "ukuji",
        coinMinimalDenom:
          "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
        symbol: "KUJI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg",
        },
        coingeckoId: "kujira",
        price: {
          poolId: "744",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Kujira Blue",
            type: "external_interface",
            depositUrl:
              "https://blue.kujira.app/ibc?destination=osmosis-1&denom=ukuji",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom: "ukuji",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/ukuji",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom: "ukuji",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "KUJI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg",
            },
          },
        ],
        variantGroupKey: "KUJI",
        name: "Kujira",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/kuji.svg",
      },
      {
        chainName: "kujira",
        sourceDenom:
          "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
        coinMinimalDenom:
          "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
        symbol: "USK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.svg",
        },
        coingeckoId: "usk",
        price: {
          poolId: "1648",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        transferMethods: [
          {
            name: "Kujira Blue",
            type: "external_interface",
            depositUrl:
              "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7%2Fuusk",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom:
                "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/factory:kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7:uusk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "USK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.svg",
            },
          },
        ],
        variantGroupKey: "USK",
        name: "USK",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usk.svg",
      },
      {
        chainName: "kujira",
        sourceDenom:
          "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
        coinMinimalDenom:
          "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
        symbol: "MNTA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.svg",
        },
        coingeckoId: "mantadao",
        price: {
          poolId: "1215",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Kujira Blue",
            type: "external_interface",
            depositUrl:
              "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7%2Fumnta",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom:
                "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/factory:kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7:umnta",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "MNTA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.svg",
            },
          },
        ],
        variantGroupKey: "MNTA",
        name: "MantaDAO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mnta.svg",
      },
      {
        chainName: "kujira",
        sourceDenom:
          "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
        coinMinimalDenom:
          "ibc/F74225B0AFD2F675AF56E9BE3F235486BCDE5C5E09AA88A97AFD2E052ABFE04C",
        symbol: "NSTK",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
        },
        coingeckoId: "unstake-fi",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kujira",
              chainId: "kaiyo-1",
              sourceDenom:
                "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-259",
              path: "transfer/channel-259/factory:kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh:unstk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kujira",
            sourceDenom:
              "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
            chainType: "cosmos",
            chainId: "kaiyo-1",
            symbol: "NSTK",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
            },
          },
        ],
        variantGroupKey: "NSTK",
        name: "Unstake Fi",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nstk.svg",
      },
    ],
  },
  {
    chain_name: "tgrade",
    chain_id: "tgrade-mainnet-1",
    assets: [
      {
        chainName: "tgrade",
        sourceDenom: "utgd",
        coinMinimalDenom:
          "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
        symbol: "TGD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.svg",
        },
        coingeckoId: "tgrade",
        price: {
          poolId: "769",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "tgrade",
              chainId: "tgrade-mainnet-1",
              sourceDenom: "utgd",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-263",
              path: "transfer/channel-263/utgd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "tgrade",
            sourceDenom: "utgd",
            chainType: "cosmos",
            chainId: "tgrade-mainnet-1",
            symbol: "TGD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.svg",
            },
          },
        ],
        variantGroupKey: "TGD",
        name: "Tgrade",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/tgd.svg",
      },
    ],
  },
  {
    chain_name: "echelon",
    chain_id: "echelon_3000-3",
    assets: [
      {
        chainName: "echelon",
        sourceDenom: "aechelon",
        coinMinimalDenom:
          "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
        symbol: "ECH",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/ech.svg",
        },
        price: {
          poolId: "848",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Echelon Network",
            type: "external_interface",
            depositUrl: "https://app.ech.network/ibc",
            withdrawUrl: "https://app.ech.network/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "echelon",
              chainId: "echelon_3000-3",
              sourceDenom: "aechelon",
              port: "transfer",
              channelId: "channel-11",
            },
            chain: {
              port: "transfer",
              channelId: "channel-403",
              path: "transfer/channel-403/aechelon",
            },
          },
        ],
        counterparty: [
          {
            chainName: "echelon",
            sourceDenom: "aechelon",
            chainType: "cosmos",
            chainId: "echelon_3000-3",
            symbol: "ECH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/ech.svg",
            },
          },
        ],
        variantGroupKey: "ECH",
        name: "Echelon",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ech.svg",
      },
    ],
  },
  {
    chain_name: "odin",
    chain_id: "odin-mainnet-freya",
    assets: [
      {
        chainName: "odin",
        sourceDenom: "loki",
        coinMinimalDenom:
          "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
        symbol: "ODIN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.svg",
        },
        coingeckoId: "odin-protocol",
        price: {
          poolId: "777",
          denom: "uosmo",
        },
        categories: ["ai"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "loki",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/loki",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "loki",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "ODIN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.svg",
            },
          },
        ],
        variantGroupKey: "ODIN",
        name: "Odin Protocol",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/odin.svg",
      },
      {
        chainName: "odin",
        sourceDenom: "mGeo",
        coinMinimalDenom:
          "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
        symbol: "GEO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.svg",
        },
        price: {
          poolId: "787",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "mGeo",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/mGeo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "mGeo",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "GEO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.svg",
            },
          },
        ],
        variantGroupKey: "GEO",
        name: "GEO",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/geo.svg",
      },
      {
        chainName: "odin",
        sourceDenom: "mO9W",
        coinMinimalDenom:
          "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
        symbol: "O9W",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.svg",
        },
        price: {
          poolId: "805",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "mO9W",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/mO9W",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "mO9W",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "O9W",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.svg",
            },
          },
        ],
        variantGroupKey: "O9W",
        name: "O9W",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/o9w.svg",
      },
      {
        chainName: "odin",
        sourceDenom: "udoki",
        coinMinimalDenom:
          "ibc/C12C353A83CD1005FC38943410B894DBEC5F2ABC97FC12908F0FB03B970E8E1B",
        symbol: "DOKI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/doki_Logo.png",
        },
        coingeckoId: "doki",
        price: {
          poolId: "1573",
          denom:
            "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "odin",
              chainId: "odin-mainnet-freya",
              sourceDenom: "udoki",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-258",
              path: "transfer/channel-258/udoki",
            },
          },
        ],
        counterparty: [
          {
            chainName: "odin",
            sourceDenom: "udoki",
            chainType: "cosmos",
            chainId: "odin-mainnet-freya",
            symbol: "DOKI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/doki_Logo.png",
            },
          },
        ],
        variantGroupKey: "DOKI",
        name: "DOKI",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-13T15:44:00.000Z",
        relative_image_url: "/tokens/generated/doki.png",
      },
    ],
  },
  {
    chain_name: "crescent",
    chain_id: "crescent-1",
    assets: [
      {
        chainName: "crescent",
        sourceDenom: "ucre",
        coinMinimalDenom:
          "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
        symbol: "CRE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
        },
        coingeckoId: "crescent-network",
        price: {
          poolId: "786",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "crescent",
              chainId: "crescent-1",
              sourceDenom: "ucre",
              port: "transfer",
              channelId: "channel-9",
            },
            chain: {
              port: "transfer",
              channelId: "channel-297",
              path: "transfer/channel-297/ucre",
            },
          },
        ],
        counterparty: [
          {
            chainName: "crescent",
            sourceDenom: "ucre",
            chainType: "cosmos",
            chainId: "crescent-1",
            symbol: "CRE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
            },
          },
        ],
        variantGroupKey: "CRE",
        name: "Crescent",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cre.svg",
      },
    ],
  },
  {
    chain_name: "lumenx",
    chain_id: "LumenX",
    assets: [
      {
        chainName: "lumenx",
        sourceDenom: "ulumen",
        coinMinimalDenom:
          "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
        symbol: "LUMEN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.svg",
        },
        price: {
          poolId: "788",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "lumenx",
              chainId: "LumenX",
              sourceDenom: "ulumen",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-286",
              path: "transfer/channel-286/ulumen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "lumenx",
            sourceDenom: "ulumen",
            chainType: "cosmos",
            chainId: "LumenX",
            symbol: "LUMEN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.svg",
            },
          },
        ],
        variantGroupKey: "LUMEN",
        name: "LumenX",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/lumen.svg",
      },
    ],
  },
  {
    chain_name: "oraichain",
    chain_id: "Oraichain",
    assets: [
      {
        chainName: "oraichain",
        sourceDenom: "orai",
        coinMinimalDenom:
          "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
        symbol: "ORAI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.svg",
        },
        coingeckoId: "oraichain-token",
        price: {
          poolId: "799",
          denom: "uosmo",
        },
        categories: ["ai"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "oraichain",
              chainId: "Oraichain",
              sourceDenom: "orai",
              port: "transfer",
              channelId: "channel-13",
            },
            chain: {
              port: "transfer",
              channelId: "channel-216",
              path: "transfer/channel-216/orai",
            },
          },
        ],
        counterparty: [
          {
            chainName: "oraichain",
            sourceDenom: "orai",
            chainType: "cosmos",
            chainId: "Oraichain",
            symbol: "ORAI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.svg",
            },
          },
        ],
        variantGroupKey: "ORAI",
        name: "Oraichain",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/orai.svg",
      },
    ],
  },
  {
    chain_name: "cudos",
    chain_id: "cudos-1",
    assets: [
      {
        chainName: "cudos",
        sourceDenom: "acudos",
        coinMinimalDenom:
          "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
        symbol: "CUDOS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.svg",
        },
        coingeckoId: "cudos",
        price: {
          poolId: "796",
          denom: "uosmo",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cudos",
              chainId: "cudos-1",
              sourceDenom: "acudos",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-298",
              path: "transfer/channel-298/acudos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cudos",
            sourceDenom: "acudos",
            chainType: "cosmos",
            chainId: "cudos-1",
            symbol: "CUDOS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.svg",
            },
          },
        ],
        variantGroupKey: "CUDOS",
        name: "Cudos",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cudos.svg",
      },
    ],
  },
  {
    chain_name: "agoric",
    chain_id: "agoric-3",
    assets: [
      {
        chainName: "agoric",
        sourceDenom: "ubld",
        coinMinimalDenom:
          "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
        symbol: "BLD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.svg",
        },
        coingeckoId: "agoric",
        price: {
          poolId: "1104",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "agoric",
              chainId: "agoric-3",
              sourceDenom: "ubld",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-320",
              path: "transfer/channel-320/ubld",
            },
          },
        ],
        counterparty: [
          {
            chainName: "agoric",
            sourceDenom: "ubld",
            chainType: "cosmos",
            chainId: "agoric-3",
            symbol: "BLD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.svg",
            },
          },
        ],
        variantGroupKey: "BLD",
        name: "Agoric",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/bld.svg",
      },
      {
        chainName: "agoric",
        sourceDenom: "uist",
        coinMinimalDenom:
          "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
        symbol: "IST",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.svg",
        },
        coingeckoId: "inter-stable-token",
        price: {
          poolId: "1224",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin", "defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "agoric",
              chainId: "agoric-3",
              sourceDenom: "uist",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-320",
              path: "transfer/channel-320/uist",
            },
          },
        ],
        counterparty: [
          {
            chainName: "agoric",
            sourceDenom: "uist",
            chainType: "cosmos",
            chainId: "agoric-3",
            symbol: "IST",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.svg",
            },
          },
        ],
        variantGroupKey: "IST",
        name: "Inter Stable Token",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ist.svg",
      },
    ],
  },
  {
    chain_name: "stride",
    chain_id: "stride-1",
    assets: [
      {
        chainName: "stride",
        sourceDenom: "ustrd",
        coinMinimalDenom:
          "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
        symbol: "STRD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg",
        },
        coingeckoId: "stride",
        price: {
          poolId: "1098",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "ustrd",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/ustrd",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "ustrd",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "STRD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg",
            },
          },
        ],
        variantGroupKey: "STRD",
        name: "Stride",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/strd.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuatom",
        coinMinimalDenom:
          "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
        symbol: "stATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.svg",
        },
        coingeckoId: "stride-staked-atom",
        price: {
          poolId: "1283",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuatom",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuatom",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.svg",
            },
          },
        ],
        variantGroupKey: "stATOM",
        name: "Stride Staked ATOM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/statom.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stustars",
        coinMinimalDenom:
          "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        symbol: "stSTARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.svg",
        },
        coingeckoId: "stride-staked-stars",
        price: {
          poolId: "1397",
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stustars",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stustars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stustars",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stSTARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.svg",
            },
          },
        ],
        variantGroupKey: "stSTARS",
        name: "Stride Staked STARS",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ststars.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stujuno",
        coinMinimalDenom:
          "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
        symbol: "stJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.svg",
        },
        coingeckoId: "stride-staked-juno",
        price: {
          poolId: "817",
          denom:
            "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stujuno",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stujuno",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stujuno",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.svg",
            },
          },
        ],
        variantGroupKey: "stJUNO",
        name: "Stride Staked JUNO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stjuno.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuosmo",
        coinMinimalDenom:
          "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
        symbol: "stOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.svg",
        },
        coingeckoId: "stride-staked-osmo",
        price: {
          poolId: "1252",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuosmo",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuosmo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuosmo",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stOSMO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.svg",
            },
          },
        ],
        variantGroupKey: "stOSMO",
        name: "Stride Staked OSMO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stosmo.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuluna",
        coinMinimalDenom:
          "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        symbol: "stLUNA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.svg",
        },
        coingeckoId: "stride-staked-luna",
        price: {
          poolId: "913",
          denom:
            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuluna",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuluna",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuluna",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stLUNA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.svg",
            },
          },
        ],
        variantGroupKey: "stLUNA",
        name: "Stride Staked LUNA",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stluna.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "staevmos",
        coinMinimalDenom:
          "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        symbol: "stEVMOS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.svg",
        },
        coingeckoId: "stride-staked-evmos",
        price: {
          poolId: "922",
          denom:
            "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "staevmos",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/staevmos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "staevmos",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stEVMOS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.svg",
            },
          },
        ],
        variantGroupKey: "stEVMOS",
        name: "Stride Staked EVMOS",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stevmos.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stuumee",
        coinMinimalDenom:
          "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
        symbol: "stUMEE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.svg",
        },
        coingeckoId: "stride-staked-umee",
        price: {
          poolId: "1035",
          denom:
            "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stuumee",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stuumee",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stuumee",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stUMEE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.svg",
            },
          },
        ],
        variantGroupKey: "stUMEE",
        name: "Stride Staked UMEE",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stumee.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stusomm",
        coinMinimalDenom:
          "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
        symbol: "stSOMM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.svg",
        },
        coingeckoId: "stride-staked-sommelier",
        price: {
          poolId: "1120",
          denom:
            "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stusomm",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stusomm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stusomm",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stSOMM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.svg",
            },
          },
        ],
        variantGroupKey: "stSOMM",
        name: "Stride Staked SOMM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/stsomm.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stadydx",
        coinMinimalDenom:
          "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
        symbol: "stDYDX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.svg",
        },
        price: {
          poolId: "1423",
          denom:
            "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stadydx",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stadydx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stadydx",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stDYDX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.svg",
            },
          },
        ],
        variantGroupKey: "stDYDX",
        name: "Stride Staked DYDX",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-01-29T12:48:00.000Z",
        relative_image_url: "/tokens/generated/stdydx.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stutia",
        coinMinimalDenom:
          "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
        symbol: "stTIA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.svg",
        },
        price: {
          poolId: "1428",
          denom:
            "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stutia",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stutia",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stutia",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stTIA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.svg",
            },
          },
        ],
        variantGroupKey: "stTIA",
        name: "Stride Staked TIA",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-01-31T23:17:00.000Z",
        relative_image_url: "/tokens/generated/sttia.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stusaga",
        coinMinimalDenom:
          "ibc/2CD9F8161C3FC332E78EF0C25F6E684D09379FB2F56EF9267E7EC139642EC57B",
        symbol: "stSAGA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsaga.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsaga.svg",
        },
        price: {
          poolId: "1674",
          denom:
            "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stusaga",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stusaga",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stusaga",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stSAGA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsaga.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsaga.svg",
            },
          },
        ],
        variantGroupKey: "stSAGA",
        name: "Stride Staked SAGA",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-04-09T15:50:00.000Z",
        relative_image_url: "/tokens/generated/stsaga.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stinj",
        coinMinimalDenom:
          "ibc/C04DFC9BCD893E57F2BEFE40F63EFD18D2768514DBD5F63ABD2FF7F48FC01D36",
        symbol: "stINJ",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stinj.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stinj.svg",
        },
        price: {
          poolId: "1675",
          denom:
            "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stinj",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stinj",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stinj",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stINJ",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stinj.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stinj.svg",
            },
          },
        ],
        variantGroupKey: "stINJ",
        name: "Stride Staked INJ",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-04-10T18:38:00.000Z",
        relative_image_url: "/tokens/generated/stinj.svg",
      },
      {
        chainName: "stride",
        sourceDenom: "stadym",
        coinMinimalDenom:
          "ibc/D53E785DC9C5C2CA50CADB1EFE4DE5D0C30418BE0E9C6F2AF9F092A247E8BC22",
        symbol: "stDYM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdym.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdym.svg",
        },
        price: {
          poolId: "1566",
          denom:
            "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stride",
              chainId: "stride-1",
              sourceDenom: "stadym",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-326",
              path: "transfer/channel-326/stadym",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stride",
            sourceDenom: "stadym",
            chainType: "cosmos",
            chainId: "stride-1",
            symbol: "stDYM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdym.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdym.svg",
            },
          },
        ],
        variantGroupKey: "stDYM",
        name: "Stride Staked DYM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "stride",
          sourceDenom: "ustrd",
        },
        listingDate: "2024-03-14T03:23:00.000Z",
        relative_image_url: "/tokens/generated/stdym.svg",
      },
    ],
  },
  {
    chain_name: "rebus",
    chain_id: "reb_1111-1",
    assets: [
      {
        chainName: "rebus",
        sourceDenom: "arebus",
        coinMinimalDenom:
          "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
        symbol: "REBUS",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.svg",
        },
        coingeckoId: "rebus",
        price: {
          poolId: "813",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "rebus",
              chainId: "reb_1111-1",
              sourceDenom: "arebus",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-355",
              path: "transfer/channel-355/arebus",
            },
          },
        ],
        counterparty: [
          {
            chainName: "rebus",
            sourceDenom: "arebus",
            chainType: "cosmos",
            chainId: "reb_1111-1",
            symbol: "REBUS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.svg",
            },
          },
        ],
        variantGroupKey: "REBUS",
        name: "Rebus",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/rebus.svg",
      },
    ],
  },
  {
    chain_name: "teritori",
    chain_id: "teritori-1",
    assets: [
      {
        chainName: "teritori",
        sourceDenom: "utori",
        coinMinimalDenom:
          "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        symbol: "TORI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.svg",
        },
        coingeckoId: "teritori",
        price: {
          poolId: "816",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "teritori",
              chainId: "teritori-1",
              sourceDenom: "utori",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-362",
              path: "transfer/channel-362/utori",
            },
          },
        ],
        counterparty: [
          {
            chainName: "teritori",
            sourceDenom: "utori",
            chainType: "cosmos",
            chainId: "teritori-1",
            symbol: "TORI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.svg",
            },
          },
        ],
        variantGroupKey: "TORI",
        name: "Teritori",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/tori.svg",
      },
    ],
  },
  {
    chain_name: "lambda",
    chain_id: "lambda_92000-1",
    assets: [
      {
        chainName: "lambda",
        sourceDenom: "ulamb",
        coinMinimalDenom:
          "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
        symbol: "LAMB",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.svg",
        },
        coingeckoId: "lambda",
        price: {
          poolId: "826",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "lambda",
              chainId: "lambda_92000-1",
              sourceDenom: "ulamb",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-378",
              path: "transfer/channel-378/ulamb",
            },
          },
        ],
        counterparty: [
          {
            chainName: "lambda",
            sourceDenom: "ulamb",
            chainType: "cosmos",
            chainId: "lambda_92000-1",
            symbol: "LAMB",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.svg",
            },
          },
        ],
        variantGroupKey: "LAMB",
        name: "Lambda",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/lamb.svg",
      },
    ],
  },
  {
    chain_name: "unification",
    chain_id: "FUND-MainNet-2",
    assets: [
      {
        chainName: "unification",
        sourceDenom: "nund",
        coinMinimalDenom:
          "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
        symbol: "FUND",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.svg",
        },
        coingeckoId: "unification",
        price: {
          poolId: "1576",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "unification",
              chainId: "FUND-MainNet-2",
              sourceDenom: "nund",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-382",
              path: "transfer/channel-382/nund",
            },
          },
        ],
        counterparty: [
          {
            chainName: "unification",
            sourceDenom: "nund",
            chainType: "cosmos",
            chainId: "FUND-MainNet-2",
            symbol: "FUND",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.svg",
            },
          },
        ],
        variantGroupKey: "FUND",
        name: "Unification",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fund.svg",
      },
    ],
  },
  {
    chain_name: "jackal",
    chain_id: "jackal-1",
    assets: [
      {
        chainName: "jackal",
        sourceDenom: "ujkl",
        coinMinimalDenom:
          "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
        symbol: "JKL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.svg",
        },
        coingeckoId: "jackal-protocol",
        price: {
          poolId: "832",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "jackal",
              chainId: "jackal-1",
              sourceDenom: "ujkl",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-412",
              path: "transfer/channel-412/ujkl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "jackal",
            sourceDenom: "ujkl",
            chainType: "cosmos",
            chainId: "jackal-1",
            symbol: "JKL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.svg",
            },
          },
        ],
        variantGroupKey: "JKL",
        name: "Jackal",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/jkl.svg",
      },
    ],
  },
  {
    chain_name: "beezee",
    chain_id: "beezee-1",
    assets: [
      {
        chainName: "beezee",
        sourceDenom: "ubze",
        coinMinimalDenom:
          "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        symbol: "BZE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.svg",
        },
        coingeckoId: "bzedge",
        price: {
          poolId: "856",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "beezee",
              chainId: "beezee-1",
              sourceDenom: "ubze",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-340",
              path: "transfer/channel-340/ubze",
            },
          },
        ],
        counterparty: [
          {
            chainName: "beezee",
            sourceDenom: "ubze",
            chainType: "cosmos",
            chainId: "beezee-1",
            symbol: "BZE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.svg",
            },
          },
        ],
        variantGroupKey: "BZE",
        name: "BeeZee",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/bze.svg",
      },
    ],
  },
  {
    chain_name: "acrechain",
    chain_id: "acre_9052-1",
    assets: [
      {
        chainName: "acrechain",
        sourceDenom: "aacre",
        coinMinimalDenom:
          "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
        symbol: "ACRE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.svg",
        },
        coingeckoId: "arable-protocol",
        price: {
          poolId: "858",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "acrechain",
              chainId: "acre_9052-1",
              sourceDenom: "aacre",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-490",
              path: "transfer/channel-490/aacre",
            },
          },
        ],
        counterparty: [
          {
            chainName: "acrechain",
            sourceDenom: "aacre",
            chainType: "cosmos",
            chainId: "acre_9052-1",
            symbol: "ACRE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.svg",
            },
          },
        ],
        variantGroupKey: "ACRE",
        name: "Acrechain",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/acre.svg",
      },
      {
        chainName: "acrechain",
        sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
        coinMinimalDenom:
          "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
        symbol: "arUSD",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.svg",
        },
        coingeckoId: "arable-usd",
        price: {
          poolId: "895",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Arable Finance",
            type: "external_interface",
            depositUrl: "https://app.arable.finance/#/ibc",
            withdrawUrl: "https://app.arable.finance/#/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "acrechain",
              chainId: "acre_9052-1",
              sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-490",
              path: "transfer/channel-490/erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
            },
          },
        ],
        counterparty: [
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
            chainType: "cosmos",
            chainId: "acre_9052-1",
            symbol: "arUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.svg",
            },
          },
        ],
        variantGroupKey: "arUSD",
        name: "Arable USD",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/arusd.svg",
      },
      {
        chainName: "acrechain",
        sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
        coinMinimalDenom:
          "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
        symbol: "CNTO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.svg",
        },
        price: {
          poolId: "909",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Arable Finance",
            type: "external_interface",
            depositUrl: "https://app.arable.finance/#/ibc",
            withdrawUrl: "https://app.arable.finance/#/ibc",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "acrechain",
              chainId: "acre_9052-1",
              sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-490",
              path: "transfer/channel-490/erc20/0xAE6D3334989a22A65228732446731438672418F2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "acrechain",
            sourceDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
            chainType: "cosmos",
            chainId: "acre_9052-1",
            symbol: "CNTO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.svg",
            },
          },
        ],
        variantGroupKey: "CNTO",
        name: "Ciento Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/cnto.svg",
      },
    ],
  },
  {
    chain_name: "imversed",
    chain_id: "imversed_5555555-1",
    assets: [
      {
        chainName: "imversed",
        sourceDenom: "aimv",
        coinMinimalDenom:
          "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
        symbol: "IMV",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.svg",
        },
        coingeckoId: "imv",
        price: {
          poolId: "866",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "imversed",
              chainId: "imversed_5555555-1",
              sourceDenom: "aimv",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-517",
              path: "transfer/channel-517/aimv",
            },
          },
        ],
        counterparty: [
          {
            chainName: "imversed",
            sourceDenom: "aimv",
            chainType: "cosmos",
            chainId: "imversed_5555555-1",
            symbol: "IMV",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.svg",
            },
          },
        ],
        variantGroupKey: "IMV",
        name: "Imversed",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/imv.svg",
      },
    ],
  },
  {
    chain_name: "medasdigital",
    chain_id: "medasdigital-1",
    assets: [
      {
        chainName: "medasdigital",
        sourceDenom: "umedas",
        coinMinimalDenom:
          "ibc/01E94A5FF29B8DDEFC86F412CC3927F7330E9B523CC63A6194B1108F5276025C",
        symbol: "MEDAS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.svg",
        },
        price: {
          poolId: "910",
          denom:
            "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "medasdigital",
              chainId: "medasdigital-1",
              sourceDenom: "umedas",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-519",
              path: "transfer/channel-519/umedas",
            },
          },
        ],
        counterparty: [
          {
            chainName: "medasdigital",
            sourceDenom: "umedas",
            chainType: "cosmos",
            chainId: "medasdigital-1",
            symbol: "MEDAS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.svg",
            },
          },
        ],
        variantGroupKey: "MEDAS",
        name: "Medas Digital Network",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/medas.svg",
      },
    ],
  },
  {
    chain_name: "onomy",
    chain_id: "onomy-mainnet-1",
    assets: [
      {
        chainName: "onomy",
        sourceDenom: "anom",
        coinMinimalDenom:
          "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        symbol: "NOM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.svg",
        },
        coingeckoId: "onomy-protocol",
        price: {
          poolId: "882",
          denom: "uosmo",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "onomy",
              chainId: "onomy-mainnet-1",
              sourceDenom: "anom",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-525",
              path: "transfer/channel-525/anom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "onomy",
            sourceDenom: "anom",
            chainType: "cosmos",
            chainId: "onomy-mainnet-1",
            symbol: "NOM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.svg",
            },
          },
        ],
        variantGroupKey: "NOM",
        name: "Onomy",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nom.svg",
      },
    ],
  },
  {
    chain_name: "dyson",
    chain_id: "dyson-mainnet-01",
    assets: [
      {
        chainName: "dyson",
        sourceDenom: "dys",
        coinMinimalDenom:
          "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
        symbol: "DYS",
        decimals: 0,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.svg",
        },
        price: {
          poolId: "950",
          denom:
            "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dyson",
              chainId: "dyson-mainnet-01",
              sourceDenom: "dys",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-526",
              path: "transfer/channel-526/dys",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dyson",
            sourceDenom: "dys",
            chainType: "cosmos",
            chainId: "dyson-mainnet-01",
            symbol: "DYS",
            decimals: 0,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.svg",
            },
          },
        ],
        variantGroupKey: "DYS",
        name: "Dyson Protocol",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dys.svg",
      },
    ],
  },
  {
    chain_name: "planq",
    chain_id: "planq_7070-2",
    assets: [
      {
        chainName: "planq",
        sourceDenom: "aplanq",
        coinMinimalDenom:
          "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
        symbol: "PLQ",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.svg",
        },
        coingeckoId: "planq",
        price: {
          poolId: "898",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=planq_7070-2&token0=aplanq&token1=ibc%2FB1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "planq",
              chainId: "planq_7070-2",
              sourceDenom: "aplanq",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-492",
              path: "transfer/channel-492/aplanq",
            },
          },
        ],
        counterparty: [
          {
            chainName: "planq",
            sourceDenom: "aplanq",
            chainType: "cosmos",
            chainId: "planq_7070-2",
            symbol: "PLQ",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.svg",
            },
          },
        ],
        variantGroupKey: "PLQ",
        name: "Planq",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/plq.svg",
      },
    ],
  },
  {
    chain_name: "canto",
    chain_id: "canto_7700-1",
    assets: [
      {
        chainName: "canto",
        sourceDenom: "acanto",
        coinMinimalDenom:
          "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
        symbol: "CANTO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
        },
        coingeckoId: "canto",
        price: {
          poolId: "901",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "canto",
              chainId: "canto_7700-1",
              sourceDenom: "acanto",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-550",
              path: "transfer/channel-550/acanto",
            },
          },
        ],
        counterparty: [
          {
            chainName: "canto",
            sourceDenom: "acanto",
            chainType: "cosmos",
            chainId: "canto_7700-1",
            symbol: "CANTO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
            },
          },
        ],
        variantGroupKey: "CANTO",
        name: "Canto",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/canto.svg",
      },
    ],
  },
  {
    chain_name: "quicksilver",
    chain_id: "quicksilver-2",
    assets: [
      {
        chainName: "quicksilver",
        sourceDenom: "uqstars",
        coinMinimalDenom:
          "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
        symbol: "qSTARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.svg",
        },
        price: {
          poolId: "1766",
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqstars",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqstars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqstars",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qSTARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.svg",
            },
          },
        ],
        variantGroupKey: "qSTARS",
        name: "Quicksilver Liquid Staked STARS",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relative_image_url: "/tokens/generated/qstars.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqatom",
        coinMinimalDenom:
          "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
        symbol: "qATOM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.svg",
        },
        price: {
          poolId: "944",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqatom",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqatom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqatom",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qATOM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.svg",
            },
          },
        ],
        variantGroupKey: "qATOM",
        name: "Quicksilver Liquid Staked ATOM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relative_image_url: "/tokens/generated/qatom.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqregen",
        coinMinimalDenom:
          "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
        symbol: "qREGEN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.svg",
        },
        price: {
          poolId: "1767",
          denom:
            "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqregen",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqregen",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqregen",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qREGEN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.svg",
            },
          },
        ],
        variantGroupKey: "qREGEN",
        name: "Quicksilver Liquid Staked Regen",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relative_image_url: "/tokens/generated/qregen.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqck",
        coinMinimalDenom:
          "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
        symbol: "QCK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
        },
        coingeckoId: "quicksilver",
        price: {
          poolId: "1697",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqck",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqck",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqck",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "QCK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
            },
          },
        ],
        variantGroupKey: "QCK",
        name: "Quicksilver",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/qck.png",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqosmo",
        coinMinimalDenom:
          "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
        symbol: "qOSMO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.svg",
        },
        price: {
          poolId: "956",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqosmo",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqosmo",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqosmo",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qOSMO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.svg",
            },
          },
        ],
        variantGroupKey: "qOSMO",
        name: "Quicksilver Liquid Staked OSMO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relative_image_url: "/tokens/generated/qosmo.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqsomm",
        coinMinimalDenom:
          "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
        symbol: "qSOMM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.svg",
        },
        price: {
          poolId: "1087",
          denom:
            "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqsomm",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqsomm",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqsomm",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qSOMM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.svg",
            },
          },
        ],
        variantGroupKey: "qSOMM",
        name: "Quicksilver Liquid Staked SOMM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        relative_image_url: "/tokens/generated/qsomm.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqjuno",
        coinMinimalDenom:
          "ibc/B4E18E61E1505C2F371B621E49B09E983F6A138F251A7B5286A6BDF739FD0D54",
        symbol: "qJUNO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qjuno.svg",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqjuno",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqjuno",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqjuno",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qJUNO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qjuno.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qjuno.svg",
            },
          },
        ],
        variantGroupKey: "qJUNO",
        name: "Quicksilver Liquid Staked JUNO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        listingDate: "2024-05-14T18:30:00.000Z",
        relative_image_url: "/tokens/generated/qjuno.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqsaga",
        coinMinimalDenom:
          "ibc/F2D400F2728E9DA06EAE2AFAB289931A69EDDA5A661578C66A3177EDFE3C0D13",
        symbol: "qSAGA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsaga.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsaga.svg",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqsaga",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqsaga",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqsaga",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qSAGA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsaga.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsaga.svg",
            },
          },
        ],
        variantGroupKey: "qSAGA",
        name: "Quicksilver Liquid Staked SAGA",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        listingDate: "2024-05-14T18:30:00.000Z",
        relative_image_url: "/tokens/generated/qsaga.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "aqdydx",
        coinMinimalDenom:
          "ibc/273C593E51ACE56F1F2BDB3E03A5CB81BB208B894BCAA642676A32C3454E8C27",
        symbol: "qDYDX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qdydx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qdydx.svg",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "aqdydx",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/aqdydx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "aqdydx",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qDYDX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qdydx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qdydx.svg",
            },
          },
        ],
        variantGroupKey: "qDYDX",
        name: "Quicksilver Liquid Staked DYDX",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        listingDate: "2024-05-14T18:30:00.000Z",
        relative_image_url: "/tokens/generated/qdydx.svg",
      },
      {
        chainName: "quicksilver",
        sourceDenom: "uqbld",
        coinMinimalDenom:
          "ibc/C1C106D915C8E8C59E5DC69BF30FEF64729A6F788060B184C86A315DBB762EF7",
        symbol: "qBLD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qbld.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qbld.svg",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quicksilver",
              chainId: "quicksilver-2",
              sourceDenom: "uqbld",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-522",
              path: "transfer/channel-522/uqbld",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quicksilver",
            sourceDenom: "uqbld",
            chainType: "cosmos",
            chainId: "quicksilver-2",
            symbol: "qBLD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qbld.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qbld.svg",
            },
          },
        ],
        variantGroupKey: "qBLD",
        name: "Quicksilver Liquid Staked BLD",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        sortWith: {
          chainName: "quicksilver",
          sourceDenom: "uqck",
        },
        listingDate: "2024-05-14T18:30:00.000Z",
        relative_image_url: "/tokens/generated/qbld.svg",
      },
    ],
  },
  {
    chain_name: "mars",
    chain_id: "mars-1",
    assets: [
      {
        chainName: "mars",
        sourceDenom: "umars",
        coinMinimalDenom:
          "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        symbol: "MARS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.svg",
        },
        coingeckoId: "mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3",
        price: {
          poolId: "1099",
          denom: "uosmo",
        },
        categories: ["defi", "built_on_osmosis"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "mars",
              chainId: "mars-1",
              sourceDenom: "umars",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-557",
              path: "transfer/channel-557/umars",
            },
          },
        ],
        counterparty: [
          {
            chainName: "mars",
            sourceDenom: "umars",
            chainType: "cosmos",
            chainId: "mars-1",
            symbol: "MARS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.svg",
            },
          },
        ],
        variantGroupKey: "MARS",
        name: "Mars Hub",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mars.svg",
      },
    ],
  },
  {
    chain_name: "8ball",
    chain_id: "eightball-1",
    assets: [
      {
        chainName: "8ball",
        sourceDenom: "uebl",
        coinMinimalDenom:
          "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        symbol: "EBL",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.svg",
        },
        price: {
          poolId: "935",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "8ball",
              chainId: "eightball-1",
              sourceDenom: "uebl",
              port: "transfer",
              channelId: "channel-16",
            },
            chain: {
              port: "transfer",
              channelId: "channel-641",
              path: "transfer/channel-641/uebl",
            },
          },
        ],
        counterparty: [
          {
            chainName: "8ball",
            sourceDenom: "uebl",
            chainType: "cosmos",
            chainId: "eightball-1",
            symbol: "EBL",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.svg",
            },
          },
        ],
        variantGroupKey: "EBL",
        name: "8ball",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ebl.svg",
      },
    ],
  },
  {
    chain_name: "arkh",
    chain_id: "arkh",
    assets: [
      {
        chainName: "arkh",
        sourceDenom: "arkh",
        coinMinimalDenom:
          "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
        symbol: "ARKH",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.svg",
        },
        price: {
          poolId: "954",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "arkh",
              chainId: "arkh",
              sourceDenom: "arkh",
              port: "transfer",
              channelId: "channel-12",
            },
            chain: {
              port: "transfer",
              channelId: "channel-648",
              path: "transfer/channel-648/arkh",
            },
          },
        ],
        counterparty: [
          {
            chainName: "arkh",
            sourceDenom: "arkh",
            chainType: "cosmos",
            chainId: "arkh",
            symbol: "ARKH",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.svg",
            },
          },
        ],
        variantGroupKey: "ARKH",
        name: "Arkhadian",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        relative_image_url: "/tokens/generated/arkh.svg",
      },
    ],
  },
  {
    chain_name: "noble",
    chain_id: "noble-1",
    assets: [
      {
        chainName: "noble",
        sourceDenom: "ufrienzies",
        coinMinimalDenom:
          "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
        symbol: "FRNZ",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.svg",
        },
        price: {
          poolId: "1012",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "noble",
              chainId: "noble-1",
              sourceDenom: "ufrienzies",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-750",
              path: "transfer/channel-750/ufrienzies",
            },
          },
        ],
        counterparty: [
          {
            chainName: "noble",
            sourceDenom: "ufrienzies",
            chainType: "cosmos",
            chainId: "noble-1",
            symbol: "FRNZ",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.svg",
            },
          },
        ],
        variantGroupKey: "FRNZ",
        name: "Frienzies",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/frnz.svg",
      },
      {
        chainName: "noble",
        sourceDenom: "uusdc",
        coinMinimalDenom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        symbol: "USDC",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
        },
        coingeckoId: "usd-coin",
        price: {
          poolId: "1223",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "noble",
              chainId: "noble-1",
              sourceDenom: "uusdc",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-750",
              path: "transfer/channel-750/uusdc",
            },
          },
        ],
        counterparty: [
          {
            chainName: "noble",
            sourceDenom: "uusdc",
            chainType: "cosmos",
            chainId: "noble-1",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USDC",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdc.svg",
      },
    ],
  },
  {
    chain_name: "migaloo",
    chain_id: "migaloo-1",
    assets: [
      {
        chainName: "migaloo",
        sourceDenom: "uwhale",
        coinMinimalDenom:
          "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
        symbol: "WHALE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.svg",
        },
        coingeckoId: "white-whale",
        price: {
          poolId: "1318",
          denom: "uosmo",
        },
        categories: ["defi", "sail_initiative"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom: "uwhale",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/uwhale",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom: "uwhale",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "WHALE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.svg",
            },
          },
        ],
        variantGroupKey: "WHALE",
        name: "Migaloo",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/whale.svg",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
        coinMinimalDenom:
          "ibc/4976049456D261659D0EC499CC9C2391D3C7D1128A0B9FB0BBF2842D1B2BC7BC",
        symbol: "ASH",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/ash.svg",
        },
        price: {
          poolId: "1660",
          denom:
            "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1erul6xyq0gk6ws98ncj7lnq9l4jn4gnnu9we73gdz78yyl2lr7qqrvcgup/ash",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "ASH",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/ash.svg",
            },
          },
        ],
        variantGroupKey: "ASH",
        name: "ASH",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ash.svg",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
        coinMinimalDenom:
          "ibc/DDF1CD4CDC14AE2D6A3060193624605FF12DEE71CF1F8C19EEF35E9447653493",
        symbol: "RAC",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.svg",
        },
        price: {
          poolId: "1659",
          denom:
            "ibc/42A9553A7770F3D7B62F3A82AF04E7719B4FD6EAF31BE5645092AAC4A6C2201D",
        },
        categories: ["gaming", "sail_initiative"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/urac",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "RAC",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.svg",
            },
          },
        ],
        variantGroupKey: "RAC",
        name: "RAC",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/rac.svg",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
        coinMinimalDenom:
          "ibc/42A9553A7770F3D7B62F3A82AF04E7719B4FD6EAF31BE5645092AAC4A6C2201D",
        symbol: "GUPPY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/guppy.png",
        },
        price: {
          poolId: "1342",
          denom:
            "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1etlu2h30tjvv8rfa4fwdc43c92f6ul5w9acxzk/uguppy",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "GUPPY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/guppy.png",
            },
          },
        ],
        variantGroupKey: "GUPPY",
        name: "GUPPY",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/guppy.png",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/shark",
        coinMinimalDenom:
          "ibc/64D56DF9EC69BE554F49EBCE0199611062FF1137EF105E2F645C1997344F3834",
        symbol: "SHARK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/shark.png",
        },
        categories: ["sail_initiative"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/shark",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/shark",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1eqntnl6tzcj9h86psg4y4h6hh05g2h9nj8e09l/shark",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "SHARK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/shark.png",
            },
          },
        ],
        variantGroupKey: "SHARK",
        name: "SHARK",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-15T19:51:00.000Z",
        relative_image_url: "/tokens/generated/shark.png",
      },
      {
        chainName: "migaloo",
        sourceDenom:
          "factory/migaloo1d0uma9qzcts4fzt7ml39xp44aut5k6qyjfzz4asalnecppppr3rsl52vvv/rstk",
        coinMinimalDenom:
          "ibc/04FAC73DFF7F1DD59395948F2F043B0BBF978AD4533EE37E811340F501A08FFB",
        symbol: "RSTK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rstk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rstk.svg",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "migaloo",
              chainId: "migaloo-1",
              sourceDenom:
                "factory/migaloo1d0uma9qzcts4fzt7ml39xp44aut5k6qyjfzz4asalnecppppr3rsl52vvv/rstk",
              port: "transfer",
              channelId: "channel-5",
            },
            chain: {
              port: "transfer",
              channelId: "channel-642",
              path: "transfer/channel-642/factory/migaloo1d0uma9qzcts4fzt7ml39xp44aut5k6qyjfzz4asalnecppppr3rsl52vvv/rstk",
            },
          },
        ],
        counterparty: [
          {
            chainName: "migaloo",
            sourceDenom:
              "factory/migaloo1d0uma9qzcts4fzt7ml39xp44aut5k6qyjfzz4asalnecppppr3rsl52vvv/rstk",
            chainType: "cosmos",
            chainId: "migaloo-1",
            symbol: "RSTK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rstk.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rstk.svg",
            },
          },
        ],
        variantGroupKey: "RSTK",
        name: "RESTAKE",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-14T01:25:00.000Z",
        relative_image_url: "/tokens/generated/rstk.svg",
      },
    ],
  },
  {
    chain_name: "omniflixhub",
    chain_id: "omniflixhub-1",
    assets: [
      {
        chainName: "omniflixhub",
        sourceDenom: "uflix",
        coinMinimalDenom:
          "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
        symbol: "FLIX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.svg",
        },
        coingeckoId: "omniflix-network",
        price: {
          poolId: "992",
          denom: "uosmo",
        },
        categories: ["nft_protocol"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "omniflixhub",
              chainId: "omniflixhub-1",
              sourceDenom: "uflix",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-199",
              path: "transfer/channel-199/uflix",
            },
          },
        ],
        counterparty: [
          {
            chainName: "omniflixhub",
            sourceDenom: "uflix",
            chainType: "cosmos",
            chainId: "omniflixhub-1",
            symbol: "FLIX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.svg",
            },
          },
        ],
        variantGroupKey: "FLIX",
        name: "OmniFlix",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/flix.svg",
      },
    ],
  },
  {
    chain_name: "bluzelle",
    chain_id: "bluzelle-9",
    assets: [
      {
        chainName: "bluzelle",
        sourceDenom: "ubnt",
        coinMinimalDenom:
          "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
        symbol: "BLZ",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.svg",
        },
        coingeckoId: "bluzelle",
        price: {
          poolId: "1007",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "bluzelle",
              chainId: "bluzelle-9",
              sourceDenom: "ubnt",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-763",
              path: "transfer/channel-763/ubnt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "bluzelle",
            sourceDenom: "ubnt",
            chainType: "cosmos",
            chainId: "bluzelle-9",
            symbol: "BLZ",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.svg",
            },
          },
        ],
        variantGroupKey: "BLZ",
        name: "Bluzelle",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/blz.svg",
      },
    ],
  },
  {
    chain_name: "gitopia",
    chain_id: "gitopia",
    assets: [
      {
        chainName: "gitopia",
        sourceDenom: "ulore",
        coinMinimalDenom:
          "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
        symbol: "LORE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.svg",
        },
        coingeckoId: "gitopia",
        price: {
          poolId: "1036",
          denom: "uosmo",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gitopia",
              chainId: "gitopia",
              sourceDenom: "ulore",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-781",
              path: "transfer/channel-781/ulore",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gitopia",
            sourceDenom: "ulore",
            chainType: "cosmos",
            chainId: "gitopia",
            symbol: "LORE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.svg",
            },
          },
        ],
        variantGroupKey: "LORE",
        name: "Gitopia",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/lore.svg",
      },
    ],
  },
  {
    chain_name: "nolus",
    chain_id: "pirin-1",
    assets: [
      {
        chainName: "nolus",
        sourceDenom: "unls",
        coinMinimalDenom:
          "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
        symbol: "NLS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.svg",
        },
        coingeckoId: "nolus",
        price: {
          poolId: "1797",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi", "built_on_osmosis"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nolus",
              chainId: "pirin-1",
              sourceDenom: "unls",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-783",
              path: "transfer/channel-783/unls",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nolus",
            sourceDenom: "unls",
            chainType: "cosmos",
            chainId: "pirin-1",
            symbol: "NLS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.svg",
            },
          },
        ],
        variantGroupKey: "NLS",
        name: "Nolus",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nls.svg",
      },
    ],
  },
  {
    chain_name: "neutron",
    chain_id: "neutron-1",
    assets: [
      {
        chainName: "neutron",
        sourceDenom: "untrn",
        coinMinimalDenom:
          "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
        symbol: "NTRN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
        },
        coingeckoId: "neutron-3",
        price: {
          poolId: "1388",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom: "untrn",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/untrn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom: "untrn",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "NTRN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
            },
          },
        ],
        variantGroupKey: "NTRN",
        name: "Neutron",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ntrn.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
        coinMinimalDenom:
          "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
        symbol: "wstETH",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
        },
        coingeckoId: "wrapped-steth",
        price: {
          poolId: "1431",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            chainType: "evm",
            chainId: 1,
            address: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            symbol: "wstETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            chainType: "evm",
            chainId: 1,
            address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            symbol: "stETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/steth.svg",
            },
          },
        ],
        variantGroupKey: "stETH",
        name: "Wrapped Lido Staked Ether",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/wsteth.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
        coinMinimalDenom:
          "ibc/BF685448E564B5A4AC8F6E0493A0B979D0E0BF5EC11F7E15D25A0A2160C944DD",
        symbol: "NEWT",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/newt.png",
        },
        coingeckoId: "newt",
        price: {
          poolId: "1646",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1p8d89wvxyjcnawmgw72klknr3lg9gwwl6ypxda/newt",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "NEWT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/newt.png",
            },
          },
        ],
        variantGroupKey: "NEWT",
        name: "Newt",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/newt.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
        coinMinimalDenom:
          "ibc/8C8F6349F656C943543C6B040377BE44123D01F712277815C3C13098BB98818C",
        symbol: "CIRCUS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/circus.png",
        },
        price: {
          poolId: "1391",
          denom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron170v88vrtnedesyfytuku257cggxc79rd7lwt7q/ucircus",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "CIRCUS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/circus.png",
            },
          },
        ],
        variantGroupKey: "CIRCUS",
        name: "AtomEconomicZone69JaeKwonInu",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/circus.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
        coinMinimalDenom:
          "ibc/442A08C33AE9875DF90792FFA73B5728E1CAECE87AB4F26AE9B422F1E682ED23",
        symbol: "BAD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/bad.png",
        },
        price: {
          poolId: "1381",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron143wp6g8paqasnuuey6zyapucknwy9rhnld8hkr/bad",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "BAD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/bad.png",
            },
          },
        ],
        variantGroupKey: "BAD",
        name: "Badcoin",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-15T14:42:00.000Z",
        relative_image_url: "/tokens/generated/bad.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
        coinMinimalDenom:
          "ibc/73BB20AF857D1FE6E061D01CA13870872AD0C979497CAF71BEA25B1CBF6879F1",
        symbol: "APOLLO",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/apollo.svg",
        },
        price: {
          poolId: "1410",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "APOLLO",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/apollo.svg",
            },
          },
        ],
        variantGroupKey: "APOLLO",
        name: "Apollo DAO",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-01-22T21:05:00.000Z",
        relative_image_url: "/tokens/generated/apollo.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron13lkh47msw28yynspc5rnmty3yktk43wc3dsv0l/ATOM1KLFG",
        coinMinimalDenom:
          "ibc/0E77E090EC04C476DE2BC0A7056580AC47660DAEB7B0D4701C085E3A046AC7B7",
        symbol: "ATOM1KLFG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ATOM1KLFGc.png",
        },
        price: {
          poolId: "1679",
          denom: "uosmo",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron13lkh47msw28yynspc5rnmty3yktk43wc3dsv0l/ATOM1KLFG",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron13lkh47msw28yynspc5rnmty3yktk43wc3dsv0l/ATOM1KLFG",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron13lkh47msw28yynspc5rnmty3yktk43wc3dsv0l/ATOM1KLFG",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "ATOM1KLFG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ATOM1KLFGc.png",
            },
          },
        ],
        variantGroupKey: "ATOM1KLFG",
        name: "ATOM1KLFG",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-09T16:00:00.000Z",
        relative_image_url: "/tokens/generated/atom1klfg.png",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
        coinMinimalDenom:
          "ibc/B8C608CEE08C4F30A15A7955306F2EDAF4A02BB191CABC4185C1A57FD978DA1B",
        symbol: "ASTRO",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/astro.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/astro.svg",
        },
        coingeckoId: "astroport-fi",
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1ffus553eet978k024lmssw0czsxwr97mggyv85lpcsdkft8v9ufsz3sa07/astro",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "ASTRO",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/astro.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/astro.svg",
            },
          },
        ],
        variantGroupKey: "ASTRO",
        name: "Astroport token",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-13T17:50:00.000Z",
        relative_image_url: "/tokens/generated/astro.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn/xASTRO",
        coinMinimalDenom:
          "ibc/2ED09B03AA396BC2F35B741F4CA4A82D33A24A1007BFC1973299842DD626F564",
        symbol: "xASTRO",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/xAstro.svg",
        },
        categories: ["defi", "liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn/xASTRO",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn/xASTRO",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron1zlf3hutsa4qnmue53lz2tfxrutp8y2e3rj4nkghg3rupgl4mqy8s5jgxsn/xASTRO",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "xASTRO",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/xAstro.svg",
            },
          },
        ],
        variantGroupKey: "xASTRO",
        name: "Staked Astroport Token",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        listingDate: "2024-04-13T17:50:00.000Z",
        relative_image_url: "/tokens/generated/xastro.svg",
      },
      {
        chainName: "neutron",
        sourceDenom:
          "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/WEIRD",
        coinMinimalDenom:
          "ibc/38ADC6FFDDDB7D70B72AD0322CEA8844CB18FAA0A23400DBA8A99D43E18B3748",
        symbol: "WEIRD",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/WEIRD.png",
        },
        price: {
          poolId: "1776",
          denom:
            "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "neutron",
              chainId: "neutron-1",
              sourceDenom:
                "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/WEIRD",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-874",
              path: "transfer/channel-874/factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/WEIRD",
            },
          },
        ],
        counterparty: [
          {
            chainName: "neutron",
            sourceDenom:
              "factory/neutron133xakkrfksq39wxy575unve2nyehg5npx75nph/WEIRD",
            chainType: "cosmos",
            chainId: "neutron-1",
            symbol: "WEIRD",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/WEIRD.png",
            },
          },
        ],
        variantGroupKey: "WEIRD",
        name: "WEIRD",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-08T18:00:00.000Z",
        relative_image_url: "/tokens/generated/weird.png",
      },
    ],
  },
  {
    chain_name: "composable",
    chain_id: "centauri-1",
    assets: [
      {
        chainName: "composable",
        sourceDenom: "ppica",
        coinMinimalDenom:
          "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        symbol: "PICA",
        decimals: 12,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
        },
        coingeckoId: "picasso",
        price: {
          poolId: "1057",
          denom: "uosmo",
        },
        categories: ["bridges"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl:
              "https://app.picasso.network/?from=PicassoKusama&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=PicassoKusama",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom: "ppica",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/ppica",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom: "ppica",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "PICA",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "ppica",
            chainType: "non-cosmos",
            symbol: "PICA",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
            },
          },
        ],
        variantGroupKey: "PICA",
        name: "Picasso",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
        coinMinimalDenom:
          "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
        symbol: "KSM",
        decimals: 12,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
        },
        coingeckoId: "kusama",
        price: {
          poolId: "1151",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=POLKADOT&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=POLKADOT",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/4",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "KSM",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "4",
            chainType: "non-cosmos",
            symbol: "KSM",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
            },
          },
          {
            chainName: "kusama",
            sourceDenom: "Planck",
            chainType: "non-cosmos",
            symbol: "KSM",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
            },
          },
        ],
        variantGroupKey: "KSM",
        name: "Kusama",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ksm.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
        coinMinimalDenom:
          "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
        symbol: "DOT",
        decimals: 10,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
        },
        coingeckoId: "polkadot",
        price: {
          poolId: "1145",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=POLKADOT&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=POLKADOT",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/transfer/channel-15/79228162514264337593543950342",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "79228162514264337593543950342",
            chainType: "non-cosmos",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "composablepolkadot",
            sourceDenom: "79228162514264337593543950342",
            chainType: "non-cosmos",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
          {
            chainName: "polkadot",
            sourceDenom: "Planck",
            chainType: "non-cosmos",
            symbol: "DOT",
            decimals: 10,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
            },
          },
        ],
        variantGroupKey: "DOT",
        name: "Polkadot",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dot.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/C58E5D2571042137CB68B1B9851C4E7211C05F7C2C79E21E0966AF0F063961F8",
        coinMinimalDenom:
          "ibc/3A0A392E610A8D477851ABFEA74F3D828F36C015AB8E93B0FBB7566A6D13C4D6",
        symbol: "TNKR",
        decimals: 12,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/tinkernet/images/tnkr.svg",
        },
        coingeckoId: "tinkernet",
        price: {
          poolId: "1664",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl:
              "https://app.picasso.network/?from=PicassoKusama&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=PicassoKusama",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/C58E5D2571042137CB68B1B9851C4E7211C05F7C2C79E21E0966AF0F063961F8",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/2125",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/C58E5D2571042137CB68B1B9851C4E7211C05F7C2C79E21E0966AF0F063961F8",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "TNKR",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/tinkernet/images/tnkr.svg",
            },
          },
          {
            chainName: "picasso",
            sourceDenom: "2125",
            chainType: "non-cosmos",
            symbol: "TNKR",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/tinkernet/images/tnkr.svg",
            },
          },
          {
            chainName: "tinkernet",
            sourceDenom: "Planck",
            chainType: "non-cosmos",
            symbol: "TNKR",
            decimals: 12,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/tinkernet/images/tnkr.svg",
            },
          },
        ],
        variantGroupKey: "TNKR",
        name: "Tinkernet",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-03T16:09:00.000Z",
        relative_image_url: "/tokens/generated/tnkr.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/F9D075D4079FC56A9C49B601E54A45292C319D8B0E8CC0F8439041130AA7166C",
        coinMinimalDenom:
          "ibc/A23E590BA7E0D808706FB5085A449B3B9D6864AE4DDE7DAF936243CEBB2A3D43",
        symbol: "ETH.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/eth.pica.svg",
        },
        coingeckoId: "ethereum",
        price: {
          poolId: "1739",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/F9D075D4079FC56A9C49B601E54A45292C319D8B0E8CC0F8439041130AA7166C",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/wei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/F9D075D4079FC56A9C49B601E54A45292C319D8B0E8CC0F8439041130AA7166C",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Ethereum",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/eth.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/A342F6F8D1CDE1D934C50E8EAFF91E813D971E1BFEED7E557F1674E01004A533",
        coinMinimalDenom:
          "ibc/37DFAFDA529FF7D513B0DB23E9728DF9BF73122D38D46824C78BB7F91E6A736B",
        symbol: "DAI.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dai.pica.svg",
        },
        coingeckoId: "dai",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/A342F6F8D1CDE1D934C50E8EAFF91E813D971E1BFEED7E557F1674E01004A533",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x6b175474e89094c44da98b954eedeac495271d0f",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/A342F6F8D1CDE1D934C50E8EAFF91E813D971E1BFEED7E557F1674E01004A533",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            chainType: "evm",
            chainId: 1,
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
            },
          },
        ],
        variantGroupKey: "DAI",
        name: "Dai",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/dai.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/5F9BE030FC355733EC79307409FA98398BBFC747C9430B326C144A74F6808B29",
        coinMinimalDenom:
          "ibc/5435437A8C9416B650DDA49C338B63CCFC6465123B715F6BAA9B1B2071E27913",
        symbol: "FXS.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/fxs.pica.svg",
        },
        coingeckoId: "frax-share",
        price: {
          poolId: "1719",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/5F9BE030FC355733EC79307409FA98398BBFC747C9430B326C144A74F6808B29",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/5F9BE030FC355733EC79307409FA98398BBFC747C9430B326C144A74F6808B29",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "FXS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/fxs.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/fxs.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
            chainType: "evm",
            chainId: 1,
            address: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
            symbol: "FXS",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/fxs.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/fxs.svg",
            },
          },
        ],
        variantGroupKey: "FXS",
        name: "Frax Shares",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/fxs.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/4F20D68B51ED559F99C3CD658383E91F45486D884BF546E7B25337A058562CDB",
        coinMinimalDenom:
          "ibc/9A8CBC029002DC5170E715F93FBF35011FFC9796371F59B1F3C3094AE1B453A9",
        symbol: "FRAX.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/frax.pica.svg",
        },
        coingeckoId: "frax",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/4F20D68B51ED559F99C3CD658383E91F45486D884BF546E7B25337A058562CDB",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x853d955acef822db058eb8505911ed77f175b99e",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/4F20D68B51ED559F99C3CD658383E91F45486D884BF546E7B25337A058562CDB",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "FRAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x853d955acef822db058eb8505911ed77f175b99e",
            chainType: "evm",
            chainId: 1,
            address: "0x853d955acef822db058eb8505911ed77f175b99e",
            symbol: "FRAX",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
            },
          },
        ],
        variantGroupKey: "FRAX",
        name: "Frax",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/frax.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/37CC704EA53E96AB09A9C31D79142DE7DB252420F3AB18015F9870AE219947BD",
        coinMinimalDenom:
          "ibc/078AD6F581E8115CDFBD8FFA29D8C71AFE250CE952AFF80040CBC64868D44AD3",
        symbol: "USDT.pica",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.pica.svg",
        },
        coingeckoId: "tether",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/37CC704EA53E96AB09A9C31D79142DE7DB252420F3AB18015F9870AE219947BD",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/37CC704EA53E96AB09A9C31D79142DE7DB252420F3AB18015F9870AE219947BD",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether (Ethereum)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/usdt.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/5BD7F23FE150D9CF3BCC944DB829380BCC51A4022A131151C4D13B3AFAC2D1D9",
        coinMinimalDenom:
          "ibc/0EFA07F312E05258A56AE1DD600E39B9151CF7A91C8A94EEBCF4F03ECFE5DD98",
        symbol: "sFRAX.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sfrax.pica.svg",
        },
        coingeckoId: "staked-frax",
        price: {
          poolId: "1748",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/5BD7F23FE150D9CF3BCC944DB829380BCC51A4022A131151C4D13B3AFAC2D1D9",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/5BD7F23FE150D9CF3BCC944DB829380BCC51A4022A131151C4D13B3AFAC2D1D9",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "sFRAX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrax.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrax.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32",
            chainType: "evm",
            chainId: 1,
            address: "0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32",
            symbol: "sFRAX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrax.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrax.svg",
            },
          },
        ],
        variantGroupKey: "sFRAX",
        name: "Staked FRAX",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/sfrax.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/458032E654E41DB91EF98F13E2CE4F9E0FE86BA3E0CDBEC074A854E9F5229A90",
        coinMinimalDenom:
          "ibc/688E70EF567E5D4BA1CF4C54BAD758C288BC1A6C8B0B12979F911A2AE95E27EC",
        symbol: "frxETH.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/frxeth.pica.svg",
        },
        coingeckoId: "frax-ether",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/458032E654E41DB91EF98F13E2CE4F9E0FE86BA3E0CDBEC074A854E9F5229A90",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x5e8422345238f34275888049021821e8e08caa1f",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/458032E654E41DB91EF98F13E2CE4F9E0FE86BA3E0CDBEC074A854E9F5229A90",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "frxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x5e8422345238f34275888049021821e8e08caa1f",
            chainType: "evm",
            chainId: 1,
            address: "0x5e8422345238f34275888049021821e8e08caa1f",
            symbol: "frxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.svg",
            },
          },
        ],
        variantGroupKey: "frxETH",
        name: "Frax Ether",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/frxeth.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/4E0ECE7819D77B0F2B49F5C34B5E594A02D2BA8B1B0F103208F847B53EBFB69A",
        coinMinimalDenom:
          "ibc/F17CCB4F07948CC2D8B72952C2D0A84F2B763962F698774BB121B872AE4611B5",
        symbol: "sfrxETH.pica",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sfrxeth.pica.svg",
        },
        coingeckoId: "staked-frax-ether",
        price: {
          poolId: "1720",
          denom: "uosmo",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/4E0ECE7819D77B0F2B49F5C34B5E594A02D2BA8B1B0F103208F847B53EBFB69A",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0xac3e018457b222d93114458476f3e3416abbe38f",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/4E0ECE7819D77B0F2B49F5C34B5E594A02D2BA8B1B0F103208F847B53EBFB69A",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "sfrxETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xac3e018457b222d93114458476f3e3416abbe38f",
            chainType: "evm",
            chainId: 1,
            address: "0xac3e018457b222d93114458476f3e3416abbe38f",
            symbol: "sfrxETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x5e8422345238f34275888049021821e8e08caa1f",
            chainType: "evm",
            chainId: 1,
            address: "0x5e8422345238f34275888049021821e8e08caa1f",
            symbol: "frxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frxeth.svg",
            },
          },
        ],
        variantGroupKey: "frxETH",
        name: "Frax Staked Ether",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-25T15:30:00.000Z",
        relative_image_url: "/tokens/generated/sfrxeth.pica.svg",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/6367C5AF2E2477FB13DD0C8CB0027FEDDF5AE947EE84C69FB75003E604E29D05",
        coinMinimalDenom:
          "ibc/5B5BFCC8A9F0D554A4245117F7798E85BE25B6C73DBFA2D6F369BD9DD6CACC6D",
        symbol: "PEPE.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/pepe.pica.png",
        },
        coingeckoId: "pepe",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/6367C5AF2E2477FB13DD0C8CB0027FEDDF5AE947EE84C69FB75003E604E29D05",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x6982508145454ce325ddbe47a25d4ec3d2311933",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/6367C5AF2E2477FB13DD0C8CB0027FEDDF5AE947EE84C69FB75003E604E29D05",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "PEPE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            chainType: "evm",
            chainId: 1,
            address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            symbol: "PEPE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
            },
          },
        ],
        variantGroupKey: "PEPE",
        name: "Pepe",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/pepe.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/52C8C6197989684F891076F228F20CD1659AB6E1776E3B85E65CBBEC67DA5DED",
        coinMinimalDenom:
          "ibc/080CE38C1E49595F2199E88BE7281F93FAEEF3FE354EECED0640625E8311C9CF",
        symbol: "CRV.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/crv.pica.png",
        },
        coingeckoId: "curve-dao-token",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/52C8C6197989684F891076F228F20CD1659AB6E1776E3B85E65CBBEC67DA5DED",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/52C8C6197989684F891076F228F20CD1659AB6E1776E3B85E65CBBEC67DA5DED",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "CRV",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/crv.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xd533a949740bb3306d119cc777fa900ba034cd52",
            chainType: "evm",
            chainId: 1,
            address: "0xd533a949740bb3306d119cc777fa900ba034cd52",
            symbol: "CRV",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/crv.png",
            },
          },
        ],
        variantGroupKey: "CRV",
        name: "Curve DAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/crv.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/0247E0E2C174135AADF4EA172D97FF5C15A64689A403E83603EAE4F0616DD365",
        coinMinimalDenom:
          "ibc/39AAE0F5F918B731BEF1E02E9BAED33C242805F668B0A941AC509FB569FE51CB",
        symbol: "ezETH.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ezeth.pica.png",
        },
        coingeckoId: "renzo-restaked-eth",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/0247E0E2C174135AADF4EA172D97FF5C15A64689A403E83603EAE4F0616DD365",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0xbf5495efe5db9ce00f80364c8b423567e58d2110",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/0247E0E2C174135AADF4EA172D97FF5C15A64689A403E83603EAE4F0616DD365",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "ezETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ezeth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xbf5495efe5db9ce00f80364c8b423567e58d2110",
            chainType: "evm",
            chainId: 1,
            address: "0xbf5495efe5db9ce00f80364c8b423567e58d2110",
            symbol: "ezETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ezeth.png",
            },
          },
        ],
        variantGroupKey: "ezETH",
        name: "Renzo Restaked ETH",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/ezeth.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/FFD9EB71B4480ED4D73F7370A2AEBDB48447A0AAE27265F8060A957F0FF71983",
        coinMinimalDenom:
          "ibc/BFFE212A23384C4EB055CF6F95A1F5EC1BE0F9BD286FAA66C3748F0444E67D63",
        symbol: "USDe.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usde.pica.png",
        },
        coingeckoId: "ethena-usde",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/FFD9EB71B4480ED4D73F7370A2AEBDB48447A0AAE27265F8060A957F0FF71983",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/FFD9EB71B4480ED4D73F7370A2AEBDB48447A0AAE27265F8060A957F0FF71983",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "USDe",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usde.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
            chainType: "evm",
            chainId: 1,
            address: "0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
            symbol: "USDe",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usde.png",
            },
          },
        ],
        variantGroupKey: "USDe",
        name: "Ethena USDe",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/usde.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/B089810D5A6316AD5E9C7808733DC4AB11C7BA3033221D28711FC7206BACB929",
        coinMinimalDenom:
          "ibc/257FF64F160106F6EE43CEE7C761DA64C1346221895373CC810FFA1BFAC5A7CD",
        symbol: "ENA.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ena.pica.png",
        },
        coingeckoId: "ethena",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/B089810D5A6316AD5E9C7808733DC4AB11C7BA3033221D28711FC7206BACB929",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x57e114b691db790c35207b2e685d4a43181e6061",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/B089810D5A6316AD5E9C7808733DC4AB11C7BA3033221D28711FC7206BACB929",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "ENA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ena.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x57e114b691db790c35207b2e685d4a43181e6061",
            chainType: "evm",
            chainId: 1,
            address: "0x57e114b691db790c35207b2e685d4a43181e6061",
            symbol: "ENA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ena.png",
            },
          },
        ],
        variantGroupKey: "ENA",
        name: "Ethena",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/ena.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/34C23BA6BAA2EAE0199D85AD1E2E214F76B0BFAD42BF75542D15F71264EEB05B",
        coinMinimalDenom:
          "ibc/8D0FFEA4EDB04E3C1738C9599B66AE49683E0540FC4C1214AC84534C200D818B",
        symbol: "eETH.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/eeth.pica.png",
        },
        coingeckoId: "ether-fi-staked-eth",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/34C23BA6BAA2EAE0199D85AD1E2E214F76B0BFAD42BF75542D15F71264EEB05B",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x35fa164735182de50811e8e2e824cfb9b6118ac2",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/34C23BA6BAA2EAE0199D85AD1E2E214F76B0BFAD42BF75542D15F71264EEB05B",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "eETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eeth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x35fa164735182de50811e8e2e824cfb9b6118ac2",
            chainType: "evm",
            chainId: 1,
            address: "0x35fa164735182de50811e8e2e824cfb9b6118ac2",
            symbol: "eETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eeth.png",
            },
          },
        ],
        variantGroupKey: "eETH",
        name: "ether.fi Staked ETH",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/eeth.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/36EF1EA47A09689C81D848B08E5240FA9FF13B17DB7DCF48B77D4D0D9B152821",
        coinMinimalDenom:
          "ibc/D09BB89B2187EF13EF006B44510749B0F02FD0B34F8BB55C70D812A1FF6148C7",
        symbol: "pxETH.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/pxeth.pica.png",
        },
        coingeckoId: "dinero-staked-eth",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/36EF1EA47A09689C81D848B08E5240FA9FF13B17DB7DCF48B77D4D0D9B152821",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0x04c154b66cb340f3ae24111cc767e0184ed00cc6",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/36EF1EA47A09689C81D848B08E5240FA9FF13B17DB7DCF48B77D4D0D9B152821",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "pxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pxeth.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x04c154b66cb340f3ae24111cc767e0184ed00cc6",
            chainType: "evm",
            chainId: 1,
            address: "0x04c154b66cb340f3ae24111cc767e0184ed00cc6",
            symbol: "pxETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pxeth.png",
            },
          },
        ],
        variantGroupKey: "pxETH",
        name: "Dinero Staked ETH",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/pxeth.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/C9D79BE8E3E75CA2DFDC722C77D7B179C39A4802D59019C790A825FDE34B724A",
        coinMinimalDenom:
          "ibc/63551E7BB24008F0AFC1CB051A423A5104F781F035F8B1A191264B7086A0A0F6",
        symbol: "crvUSD.pica",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/crvUSD.pica.png",
        },
        coingeckoId: "crvusd",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=ETHEREUM&to=OSMOSIS",
            withdrawUrl:
              "https://app.picasso.network/?from=OSMOSIS&to=ETHEREUM",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/C9D79BE8E3E75CA2DFDC722C77D7B179C39A4802D59019C790A825FDE34B724A",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-52/0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/C9D79BE8E3E75CA2DFDC722C77D7B179C39A4802D59019C790A825FDE34B724A",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "crvUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/crvusd.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
            chainType: "evm",
            chainId: 1,
            address: "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
            symbol: "crvUSD",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/crvusd.png",
            },
          },
        ],
        variantGroupKey: "crvUSD",
        name: "crvUSD",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/crvusd.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/D105950618E47CA2AEC314282BC401625025F80A4F812808DEEBB1941C685575",
        coinMinimalDenom:
          "ibc/0233A3F2541FD43DBCA569B27AF886E97F5C03FC0305E4A8A3FAC6AC26249C7A",
        symbol: "solana.USDT.pica",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/solana.usdt.pica.png",
        },
        coingeckoId: "tether",
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
            withdrawUrl: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/D105950618E47CA2AEC314282BC401625025F80A4F812808DEEBB1941C685575",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-71/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/D105950618E47CA2AEC314282BC401625025F80A4F812808DEEBB1941C685575",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
            chainType: "non-cosmos",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/solana.usdt.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/BADB5950C4A81AC201696EBCB33CD295137FA86F0AA620CDDE946D3700E0208C",
        coinMinimalDenom:
          "ibc/B83F9E20B4A07FA8846880000BD9D8985D89567A090F5E9390C64E81C39B4607",
        symbol: "edgeSOL.pica",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/edgesol.pica.png",
        },
        coingeckoId: "edgevana-staked-sol",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
            withdrawUrl: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/BADB5950C4A81AC201696EBCB33CD295137FA86F0AA620CDDE946D3700E0208C",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-71/edge86g9cVz87xcpKpy3J77vbp4wYd9idEV562CCntt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/BADB5950C4A81AC201696EBCB33CD295137FA86F0AA620CDDE946D3700E0208C",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "edgeSOL",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/edgesol.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "edge86g9cVz87xcpKpy3J77vbp4wYd9idEV562CCntt",
            chainType: "non-cosmos",
            symbol: "edgeSOL",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/edgesol.png",
            },
          },
        ],
        variantGroupKey: "edgeSOL",
        name: "Edgevana Staked SOL",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/edgesol.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/55F5B582483FEFA5422794292B079B4D49A5BAB9881E7C801F9F271F1D234F1D",
        coinMinimalDenom:
          "ibc/F618D130A2B8203D169811658BD0361F18DC2453085965FA0E5AEB8018DD54EE",
        symbol: "LST.pica",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/lst.pica.png",
        },
        coingeckoId: "liquid-staking-token",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
            withdrawUrl: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/55F5B582483FEFA5422794292B079B4D49A5BAB9881E7C801F9F271F1D234F1D",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-71/LSTxxxnJzKDFSLr4dUkPcmCf5VyryEqzPLz5j4bpxFp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/55F5B582483FEFA5422794292B079B4D49A5BAB9881E7C801F9F271F1D234F1D",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "LST",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/lst.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "LSTxxxnJzKDFSLr4dUkPcmCf5VyryEqzPLz5j4bpxFp",
            chainType: "non-cosmos",
            symbol: "LST",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/lst.png",
            },
          },
        ],
        variantGroupKey: "LST",
        name: "Liquid Staking Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/lst.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/91A2FE07F8BDFC0552B1C9972FCCBF2CFD067DDE5F496D81E5132CE57762B0F2",
        coinMinimalDenom:
          "ibc/9A83BDF4C8C5FFDDE735533BC8CD4363714A6474AED1C2C492FB003BB77C7982",
        symbol: "jitoSOL.pica",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/jitosol.pica.png",
        },
        coingeckoId: "jito-staked-sol",
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
            withdrawUrl: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/91A2FE07F8BDFC0552B1C9972FCCBF2CFD067DDE5F496D81E5132CE57762B0F2",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-71/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/91A2FE07F8BDFC0552B1C9972FCCBF2CFD067DDE5F496D81E5132CE57762B0F2",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "jitoSOL",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/jitosol.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
            chainType: "non-cosmos",
            symbol: "jitoSOL",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/jitosol.png",
            },
          },
        ],
        variantGroupKey: "jitoSOL",
        name: "Jito Staked SOL",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/jitosol.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/2CC39C8141F257EBBA250F65B9D0F31DC8D153C225E51EC192DE6E3F65D43F0C",
        coinMinimalDenom:
          "ibc/0F9E9277B61A78CB31014D541ACA5BF6AB06DFC4524C4C836490B131DAAECD78",
        symbol: "wSOL.pica",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wsol.pica.png",
        },
        coingeckoId: "wrapped-solana",
        price: {
          poolId: "1811",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
            withdrawUrl: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/2CC39C8141F257EBBA250F65B9D0F31DC8D153C225E51EC192DE6E3F65D43F0C",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-71/So11111111111111111111111111111111111111112",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/2CC39C8141F257EBBA250F65B9D0F31DC8D153C225E51EC192DE6E3F65D43F0C",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "wSOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "So11111111111111111111111111111111111111112",
            chainType: "non-cosmos",
            symbol: "WSOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "Lamport",
            chainType: "non-cosmos",
            symbol: "SOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
        ],
        variantGroupKey: "SOL",
        name: "Wrapped Solana",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/wsol.pica.png",
      },
      {
        chainName: "composable",
        sourceDenom:
          "ibc/9D5DA3720001F91DD76B8F609A93F96688EC8185B54BF9A1A1450EB34FF2D912",
        coinMinimalDenom:
          "ibc/A8C568580D613F16F7E9075EA9FAD69FEBE0CC1F4AF46C60255FEC4459C166F1",
        symbol: "WHINE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/whine.png",
        },
        categories: [],
        transferMethods: [
          {
            name: "Picasso App",
            type: "external_interface",
            depositUrl: "https://app.picasso.network/?from=SOLANA&to=OSMOSIS",
            withdrawUrl: "https://app.picasso.network/?from=OSMOSIS&to=SOLANA",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "composable",
              chainId: "centauri-1",
              sourceDenom:
                "ibc/9D5DA3720001F91DD76B8F609A93F96688EC8185B54BF9A1A1450EB34FF2D912",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-71/ATeTQcUkWGs7AZ15mCiFUWCW9EUL7KpDZEHCN1Y8pump",
            },
          },
        ],
        counterparty: [
          {
            chainName: "composable",
            sourceDenom:
              "ibc/9D5DA3720001F91DD76B8F609A93F96688EC8185B54BF9A1A1450EB34FF2D912",
            chainType: "cosmos",
            chainId: "centauri-1",
            symbol: "WHINE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/whine.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "ATeTQcUkWGs7AZ15mCiFUWCW9EUL7KpDZEHCN1Y8pump",
            chainType: "non-cosmos",
            symbol: "WHINE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/whine.png",
            },
          },
        ],
        variantGroupKey: "WHINE",
        name: "WHINEcoin",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-06-05T03:00:00.000Z",
        relative_image_url: "/tokens/generated/whine.png",
      },
    ],
  },
  {
    chain_name: "quasar",
    chain_id: "quasar-1",
    assets: [
      {
        chainName: "quasar",
        sourceDenom: "uqsr",
        coinMinimalDenom:
          "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
        symbol: "QSR",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
        },
        coingeckoId: "quasar-2",
        price: {
          poolId: "1314",
          denom: "uosmo",
        },
        categories: ["defi", "built_on_osmosis"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "quasar",
              chainId: "quasar-1",
              sourceDenom: "uqsr",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-688",
              path: "transfer/channel-688/uqsr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "quasar",
            sourceDenom: "uqsr",
            chainType: "cosmos",
            chainId: "quasar-1",
            symbol: "QSR",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
            },
          },
        ],
        variantGroupKey: "QSR",
        name: "Quasar",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/qsr.png",
      },
    ],
  },
  {
    chain_name: "archway",
    chain_id: "archway-1",
    assets: [
      {
        chainName: "archway",
        sourceDenom: "aarch",
        coinMinimalDenom:
          "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
        symbol: "ARCH",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg",
        },
        coingeckoId: "archway",
        price: {
          poolId: "1375",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "archway",
              chainId: "archway-1",
              sourceDenom: "aarch",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1429",
              path: "transfer/channel-1429/aarch",
            },
          },
        ],
        counterparty: [
          {
            chainName: "archway",
            sourceDenom: "aarch",
            chainType: "cosmos",
            chainId: "archway-1",
            symbol: "ARCH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg",
            },
          },
        ],
        variantGroupKey: "ARCH",
        name: "Archway",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/arch.svg",
      },
    ],
  },
  {
    chain_name: "empowerchain",
    chain_id: "empowerchain-1",
    assets: [
      {
        chainName: "empowerchain",
        sourceDenom: "umpwr",
        coinMinimalDenom:
          "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
        symbol: "MPWR",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
        },
        price: {
          poolId: "1065",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainTo=osmosis-1&chainFrom=empowerchain-1&token0=umpwr&token1=ibc%2FDD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "empowerchain",
              chainId: "empowerchain-1",
              sourceDenom: "umpwr",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1411",
              path: "transfer/channel-1411/umpwr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "empowerchain",
            sourceDenom: "umpwr",
            chainType: "cosmos",
            chainId: "empowerchain-1",
            symbol: "MPWR",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
            },
          },
        ],
        variantGroupKey: "MPWR",
        name: "EmpowerChain",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/mpwr.svg",
      },
    ],
  },
  {
    chain_name: "kyve",
    chain_id: "kyve-1",
    assets: [
      {
        chainName: "kyve",
        sourceDenom: "ukyve",
        coinMinimalDenom:
          "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
        symbol: "KYVE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.svg",
        },
        coingeckoId: "kyve-network",
        price: {
          poolId: "1652",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "kyve",
              chainId: "kyve-1",
              sourceDenom: "ukyve",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-767",
              path: "transfer/channel-767/ukyve",
            },
          },
        ],
        counterparty: [
          {
            chainName: "kyve",
            sourceDenom: "ukyve",
            chainType: "cosmos",
            chainId: "kyve-1",
            symbol: "KYVE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.svg",
            },
          },
        ],
        variantGroupKey: "KYVE",
        name: "KYVE",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/kyve.svg",
      },
    ],
  },
  {
    chain_name: "sei",
    chain_id: "pacific-1",
    assets: [
      {
        chainName: "sei",
        sourceDenom: "usei",
        coinMinimalDenom:
          "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
        symbol: "SEI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
        },
        coingeckoId: "sei-network",
        price: {
          poolId: "1114",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=pacific-1&chainTo=osmosis-1&token0=usei&token1=ibc%2F71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
            withdrawUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=osmosis-1&chainTo=pacific-1&token0=ibc%2F71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D&token1=usei",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sei",
              chainId: "pacific-1",
              sourceDenom: "usei",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-782",
              path: "transfer/channel-782/usei",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sei",
            sourceDenom: "usei",
            chainType: "cosmos",
            chainId: "pacific-1",
            symbol: "SEI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
            },
          },
        ],
        variantGroupKey: "SEI",
        name: "Sei",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sei.svg",
      },
      {
        chainName: "sei",
        sourceDenom: "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
        coinMinimalDenom:
          "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
        symbol: "OIN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/oin.png",
        },
        price: {
          poolId: "1210",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sei",
              chainId: "pacific-1",
              sourceDenom:
                "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-782",
              path: "transfer/channel-782/factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sei",
            sourceDenom:
              "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
            chainType: "cosmos",
            chainId: "pacific-1",
            symbol: "OIN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/oin.png",
            },
          },
        ],
        variantGroupKey: "OIN",
        name: "OIN STORE OF VALUE",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/oin.png",
      },
      {
        chainName: "sei",
        sourceDenom:
          "cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed",
        coinMinimalDenom:
          "ibc/86074B8DF625A75C25D52FA6112E3FD5446BA41FE418880C168CA99D10E22F05",
        symbol: "SEIYAN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/SEIYAN.png",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sei",
              chainId: "pacific-1",
              sourceDenom:
                "cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-782",
              path: "transfer/channel-782/cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sei",
            sourceDenom:
              "cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed",
            chainType: "cosmos",
            chainId: "pacific-1",
            symbol: "SEIYAN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/SEIYAN.png",
            },
          },
        ],
        variantGroupKey: "SEIYAN",
        name: "SEIYAN",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/seiyan.png",
      },
    ],
  },
  {
    chain_name: "passage",
    chain_id: "passage-2",
    assets: [
      {
        chainName: "passage",
        sourceDenom: "upasg",
        coinMinimalDenom:
          "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
        symbol: "PASG",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
        },
        coingeckoId: "passage",
        price: {
          poolId: "1498",
          denom:
            "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "passage",
              chainId: "passage-2",
              sourceDenom: "upasg",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2494",
              path: "transfer/channel-2494/upasg",
            },
          },
        ],
        counterparty: [
          {
            chainName: "passage",
            sourceDenom: "upasg",
            chainType: "cosmos",
            chainId: "passage-2",
            symbol: "PASG",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
            },
          },
        ],
        variantGroupKey: "PASG",
        name: "Passage",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/pasg.png",
      },
    ],
  },
  {
    chain_name: "gateway",
    chain_id: "wormchain",
    assets: [
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
        coinMinimalDenom:
          "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
        symbol: "SOL",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
        },
        coingeckoId: "solana",
        price: {
          poolId: "1294",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Wormhole Connect",
            type: "external_interface",
            depositUrl: "/wormhole?from=solana&to=osmosis&token=SOL",
            withdrawUrl: "/wormhole?from=osmosis&to=solana&token=SOL",
          },
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "SOL",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "So11111111111111111111111111111111111111112",
            chainType: "non-cosmos",
            symbol: "WSOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "Lamport",
            chainType: "non-cosmos",
            symbol: "SOL",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
            },
          },
        ],
        variantGroupKey: "SOL",
        name: "Solana",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sol.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
        coinMinimalDenom:
          "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
        symbol: "BONK",
        decimals: 5,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
        },
        coingeckoId: "bonk",
        price: {
          poolId: "1814",
          denom:
            "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
        },
        categories: ["meme"],
        transferMethods: [
          {
            name: "Osmosis Wormhole Connect",
            type: "external_interface",
            depositUrl: "/wormhole?from=solana&to=osmosis&token=BONK",
            withdrawUrl: "/wormhole?from=osmosis&to=solana&token=BONK",
          },
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "Bonk",
            decimals: 5,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            chainType: "non-cosmos",
            symbol: "BONK",
            decimals: 5,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
            },
          },
        ],
        variantGroupKey: "BONK",
        name: "Bonk",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/bonk.png",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
        coinMinimalDenom:
          "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
        symbol: "USDT.wh",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.hole.svg",
        },
        price: {
          poolId: "1131",
          denom:
            "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            chainType: "evm",
            chainId: 1,
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            symbol: "USDT",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
            },
          },
        ],
        variantGroupKey: "USDT",
        name: "Tether USD (Wormhole)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdt.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
        coinMinimalDenom:
          "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
        symbol: "SUI",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
        },
        coingeckoId: "sui",
        price: {
          poolId: "1503",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Wormhole Connect",
            type: "external_interface",
            depositUrl: "/wormhole?from=sui&to=osmosis&token=SUI",
            withdrawUrl: "/wormhole?from=osmosis&to=sui&token=SUI",
          },
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "SUI",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
            },
          },
          {
            chainName: "sui",
            sourceDenom: "0x2::sui::SUI",
            chainType: "non-cosmos",
            symbol: "SUI",
            decimals: 9,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
            },
          },
        ],
        variantGroupKey: "SUI",
        name: "Sui",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sui.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
        coinMinimalDenom:
          "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
        symbol: "APT",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/apt-dm.svg",
        },
        coingeckoId: "aptos",
        price: {
          poolId: "1500",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis Wormhole Connect",
            type: "external_interface",
            depositUrl: "/wormhole?from=aptos&to=osmosis&token=APT",
            withdrawUrl: "/wormhole?from=osmosis&to=aptos&token=APT",
          },
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "APT",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/aptos.svg",
            },
          },
          {
            chainName: "aptos",
            sourceDenom: "0x1::aptos_coin::AptosCoin",
            chainType: "non-cosmos",
            symbol: "APT",
            decimals: 8,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/aptos.svg",
            },
          },
        ],
        variantGroupKey: "APT",
        name: "Aptos Coin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/apt.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
        coinMinimalDenom:
          "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
        symbol: "USDC.wh",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.hole.svg",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "USD Coin (Wormhole)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/usdc.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
        coinMinimalDenom:
          "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
        symbol: "wETH.wh",
        decimals: 8,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/weth.hole.svg",
        },
        price: {
          poolId: "1424",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "WETH",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chainType: "evm",
            chainId: 1,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "WETH",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "wei",
            chainType: "evm",
            chainId: 1,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
            },
          },
        ],
        variantGroupKey: "ETH",
        name: "Wrapped Ether (Wormhole)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/weth.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
        coinMinimalDenom:
          "ibc/E42006ED917C769EDE1B474650EEA6BFE3F97958912B9206DD7010A28D01D9D5",
        symbol: "PYTH",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
        },
        coingeckoId: "pyth-network",
        price: {
          poolId: "1315",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["oracles"],
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "PYTH",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
            chainType: "non-cosmos",
            symbol: "PYTH",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
            },
          },
        ],
        variantGroupKey: "PYTH",
        name: "Pyth Network",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/pyth.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
        coinMinimalDenom:
          "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
        symbol: "solana.USDC.wh",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/solana.USDC.wh.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/solana.USDC.wh.png",
        },
        price: {
          poolId: "1474",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["stablecoin"],
        pegMechanism: "collateralized",
        transferMethods: [
          {
            name: "Wormhole Portal Bridge",
            type: "external_interface",
            depositUrl: "https://portalbridge.com/cosmos/",
            withdrawUrl: "https://portalbridge.com/cosmos/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/HJk1XMDRNUbRrpKkNZYui7SwWDMjXZAsySzqgyNcQoU3",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "solana.USDC.wh",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            chainType: "non-cosmos",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainType: "evm",
            chainId: 1,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
            },
          },
        ],
        variantGroupKey: "USDC",
        name: "Solana USD Coin (Wormhole)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-02-20T20:45:00.000Z",
        relative_image_url: "/tokens/generated/solana.usdc.wh.svg",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/bqqqpqsxzelp2hdfd4cgmxr6ekpatlj8yt2eghk52vst",
        coinMinimalDenom:
          "ibc/CDD1E59BD5034C1B2597DD199782204EB397DB93200AA2E99C0AF3A66B2915FA",
        symbol: "BSKT",
        decimals: 5,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bskt.png",
        },
        coingeckoId: "basket",
        categories: ["defi"],
        transferMethods: [
          {
            name: "Bskt.fi Wormhole Bridge",
            type: "external_interface",
            depositUrl: "https://www.bskt.fi/wormhole",
            withdrawUrl: "https://www.bskt.fi/wormhole",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/bqqqpqsxzelp2hdfd4cgmxr6ekpatlj8yt2eghk52vst",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/bqqqpqsxzelp2hdfd4cgmxr6ekpatlj8yt2eghk52vst",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/bqqqpqsxzelp2hdfd4cgmxr6ekpatlj8yt2eghk52vst",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "BSKT",
            decimals: 5,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bskt.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "6gnCPhXtLnUD76HjQuSYPENLSZdG8RvDB1pTLM5aLSJA",
            chainType: "non-cosmos",
            symbol: "BSKT",
            decimals: 5,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bskt.png",
            },
          },
        ],
        variantGroupKey: "BSKT",
        name: "Basket",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-21T20:09:00.000Z",
        relative_image_url: "/tokens/generated/bskt.png",
      },
      {
        chainName: "gateway",
        sourceDenom:
          "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2Wb6ueMFc9WLc2eyYVha6qnwHKbwzUXdooXsg6XXVvos",
        coinMinimalDenom:
          "ibc/AC6EE43E608B5A7EEE460C960480BC1C3708010E32B2071C429DA259836E10C3",
        symbol: "W",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/w.png",
        },
        coingeckoId: "wormhole",
        price: {
          poolId: "1651",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["bridges"],
        transferMethods: [
          {
            name: "Osmosis Wormhole Portal",
            type: "external_interface",
            depositUrl: "/wormhole?from=solana&to=osmosis&token=W",
            withdrawUrl: "/wormhole?from=osmosis&to=solana&token=W",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "gateway",
              chainId: "wormchain",
              sourceDenom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2Wb6ueMFc9WLc2eyYVha6qnwHKbwzUXdooXsg6XXVvos",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2Wb6ueMFc9WLc2eyYVha6qnwHKbwzUXdooXsg6XXVvos",
            },
          },
        ],
        counterparty: [
          {
            chainName: "gateway",
            sourceDenom:
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2Wb6ueMFc9WLc2eyYVha6qnwHKbwzUXdooXsg6XXVvos",
            chainType: "cosmos",
            chainId: "wormchain",
            symbol: "W",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/w.png",
            },
          },
          {
            chainName: "solana",
            sourceDenom: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
            chainType: "non-cosmos",
            symbol: "W",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/w.png",
            },
          },
        ],
        variantGroupKey: "W",
        name: "Wormhole Token",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-03T17:37:00.000Z",
        relative_image_url: "/tokens/generated/w.png",
      },
    ],
  },
  {
    chain_name: "xpla",
    chain_id: "dimension_37-1",
    assets: [
      {
        chainName: "xpla",
        sourceDenom: "axpla",
        coinMinimalDenom:
          "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
        symbol: "XPLA",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.svg",
        },
        coingeckoId: "xpla",
        price: {
          poolId: "1173",
          denom: "uosmo",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "XPLA",
            type: "external_interface",
            depositUrl: "https://ibc.xpla.io/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "xpla",
              chainId: "dimension_37-1",
              sourceDenom: "axpla",
              port: "transfer",
              channelId: "channel-9",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1634",
              path: "transfer/channel-1634/axpla",
            },
          },
        ],
        counterparty: [
          {
            chainName: "xpla",
            sourceDenom: "axpla",
            chainType: "cosmos",
            chainId: "dimension_37-1",
            symbol: "XPLA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.svg",
            },
          },
        ],
        variantGroupKey: "XPLA",
        name: "XPLA",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/xpla.svg",
      },
    ],
  },
  {
    chain_name: "realio",
    chain_id: "realionetwork_3301-1",
    assets: [
      {
        chainName: "realio",
        sourceDenom: "ario",
        coinMinimalDenom:
          "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
        symbol: "RIO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.svg",
        },
        coingeckoId: "realio-network",
        price: {
          poolId: "1180",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["rwa"],
        transferMethods: [
          {
            name: "Realio Network",
            type: "external_interface",
            depositUrl: "https://app.realio.network/",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "realio",
              chainId: "realionetwork_3301-1",
              sourceDenom: "ario",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1424",
              path: "transfer/channel-1424/ario",
            },
          },
        ],
        counterparty: [
          {
            chainName: "realio",
            sourceDenom: "ario",
            chainType: "cosmos",
            chainId: "realionetwork_3301-1",
            symbol: "RIO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.svg",
            },
          },
        ],
        variantGroupKey: "RIO",
        name: "Realio Network",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/rio.svg",
      },
    ],
  },
  {
    chain_name: "sge",
    chain_id: "sgenet-1",
    assets: [
      {
        chainName: "sge",
        sourceDenom: "usge",
        coinMinimalDenom:
          "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
        symbol: "SGE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.svg",
        },
        coingeckoId: "six-sigma",
        price: {
          poolId: "1233",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "sge",
              chainId: "sgenet-1",
              sourceDenom: "usge",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5485",
              path: "transfer/channel-5485/usge",
            },
          },
        ],
        counterparty: [
          {
            chainName: "sge",
            sourceDenom: "usge",
            chainType: "cosmos",
            chainId: "sgenet-1",
            symbol: "SGE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.svg",
            },
          },
        ],
        variantGroupKey: "SGE",
        name: "SGE",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/sge.svg",
      },
    ],
  },
  {
    chain_name: "stafihub",
    chain_id: "stafihub-1",
    assets: [
      {
        chainName: "stafihub",
        sourceDenom: "ufis",
        coinMinimalDenom:
          "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        symbol: "FIS",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/fis.svg",
        },
        coingeckoId: "stafi",
        price: {
          poolId: "1230",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stafihub",
              chainId: "stafihub-1",
              sourceDenom: "ufis",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5413",
              path: "transfer/channel-5413/ufis",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stafihub",
            sourceDenom: "ufis",
            chainType: "cosmos",
            chainId: "stafihub-1",
            symbol: "FIS",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/fis.svg",
            },
          },
        ],
        variantGroupKey: "FIS",
        name: "StaFi Hub",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fis.svg",
      },
      {
        chainName: "stafihub",
        sourceDenom: "uratom",
        coinMinimalDenom:
          "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
        symbol: "rATOM",
        decimals: 6,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/ratom.svg",
        },
        price: {
          poolId: "1227",
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        categories: ["liquid_staking"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "stafihub",
              chainId: "stafihub-1",
              sourceDenom: "uratom",
              port: "transfer",
              channelId: "channel-10",
            },
            chain: {
              port: "transfer",
              channelId: "channel-5413",
              path: "transfer/channel-5413/uratom",
            },
          },
        ],
        counterparty: [
          {
            chainName: "stafihub",
            sourceDenom: "uratom",
            chainType: "cosmos",
            chainId: "stafihub-1",
            symbol: "rATOM",
            decimals: 6,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/ratom.svg",
            },
          },
        ],
        variantGroupKey: "rATOM",
        name: "rATOM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/ratom.svg",
      },
    ],
  },
  {
    chain_name: "doravota",
    chain_id: "vota-ash",
    assets: [
      {
        chainName: "doravota",
        sourceDenom: "peaka",
        coinMinimalDenom:
          "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
        symbol: "DORA",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/doravota/images/dora.svg",
        },
        price: {
          poolId: "1239",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "doravota",
              chainId: "vota-ash",
              sourceDenom: "peaka",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2694",
              path: "transfer/channel-2694/peaka",
            },
          },
        ],
        counterparty: [
          {
            chainName: "doravota",
            sourceDenom: "peaka",
            chainType: "cosmos",
            chainId: "vota-ash",
            symbol: "DORA",
            decimals: 18,
            logoURIs: {
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/doravota/images/dora.svg",
            },
          },
        ],
        variantGroupKey: "DORA",
        name: "Dora Vota",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dora.svg",
      },
    ],
  },
  {
    chain_name: "coreum",
    chain_id: "coreum-mainnet-1",
    assets: [
      {
        chainName: "coreum",
        sourceDenom: "ucore",
        coinMinimalDenom:
          "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
        symbol: "COREUM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.svg",
        },
        coingeckoId: "coreum",
        price: {
          poolId: "1244",
          denom: "uosmo",
        },
        categories: ["bridges"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "coreum",
              chainId: "coreum-mainnet-1",
              sourceDenom: "ucore",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2188",
              path: "transfer/channel-2188/ucore",
            },
          },
        ],
        counterparty: [
          {
            chainName: "coreum",
            sourceDenom: "ucore",
            chainType: "cosmos",
            chainId: "coreum-mainnet-1",
            symbol: "COREUM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.svg",
            },
          },
        ],
        variantGroupKey: "COREUM",
        name: "Coreum",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/coreum.svg",
      },
      {
        chainName: "coreum",
        sourceDenom:
          "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
        coinMinimalDenom:
          "ibc/63A7CA0B6838AD8CAD6B5103998FF9B9B6A6F06FBB9638BFF51E63E0142339F3",
        symbol: "XRP.core",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/xrp.core.png",
        },
        price: {
          poolId: "1591",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Sologenic Coreum Bridge",
            type: "external_interface",
            depositUrl: "https://sologenic.org/coreum-bridge",
            withdrawUrl: "https://sologenic.org/coreum-bridge",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "coreum",
              chainId: "coreum-mainnet-1",
              sourceDenom:
                "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2188",
              path: "transfer/channel-2188/drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
            },
          },
        ],
        counterparty: [
          {
            chainName: "coreum",
            sourceDenom:
              "drop-core1zhs909jp9yktml6qqx9f0ptcq2xnhhj99cja03j3lfcsp2pgm86studdrz",
            chainType: "cosmos",
            chainId: "coreum-mainnet-1",
            symbol: "XRP",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/xrpl/images/xrp.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/xrpl/images/xrp.svg",
            },
          },
          {
            chainName: "xrpl",
            sourceDenom: "drop",
            chainType: "non-cosmos",
            symbol: "XRP",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/xrpl/images/xrp.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/xrpl/images/xrp.svg",
            },
          },
        ],
        variantGroupKey: "XRP",
        name: "Ripple (Coreum)",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-21T20:09:00.000Z",
        relative_image_url: "/tokens/generated/xrp.core.png",
      },
    ],
  },
  {
    chain_name: "celestia",
    chain_id: "celestia",
    assets: [
      {
        chainName: "celestia",
        sourceDenom: "utia",
        coinMinimalDenom:
          "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        symbol: "TIA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
        },
        coingeckoId: "celestia",
        price: {
          poolId: "1248",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "celestia",
              chainId: "celestia",
              sourceDenom: "utia",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6994",
              path: "transfer/channel-6994/utia",
            },
          },
        ],
        counterparty: [
          {
            chainName: "celestia",
            sourceDenom: "utia",
            chainType: "cosmos",
            chainId: "celestia",
            symbol: "TIA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
            },
          },
        ],
        variantGroupKey: "TIA",
        name: "Celestia",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/tia.svg",
      },
    ],
  },
  {
    chain_name: "dydx",
    chain_id: "dydx-mainnet-1",
    assets: [
      {
        chainName: "dydx",
        sourceDenom: "adydx",
        coinMinimalDenom:
          "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        symbol: "DYDX",
        decimals: 18,
        logoURIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx-circle.svg",
        },
        coingeckoId: "dydx-chain",
        price: {
          poolId: "1246",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dydx",
              chainId: "dydx-mainnet-1",
              sourceDenom: "adydx",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6787",
              path: "transfer/channel-6787/adydx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dydx",
            sourceDenom: "adydx",
            chainType: "cosmos",
            chainId: "dydx-mainnet-1",
            symbol: "DYDX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.svg",
            },
          },
        ],
        variantGroupKey: "DYDX",
        name: "dYdX Protocol",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/dydx.svg",
      },
    ],
  },
  {
    chain_name: "fxcore",
    chain_id: "fxcore",
    assets: [
      {
        chainName: "fxcore",
        sourceDenom: "FX",
        coinMinimalDenom:
          "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
        symbol: "FX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg",
        },
        coingeckoId: "fx-coin",
        price: {
          poolId: "1241",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Starscan",
            type: "external_interface",
            depositUrl:
              "https://starscan.io/fxbridge?from=fxcore&to=osmosis&token=FX",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "fxcore",
              chainId: "fxcore",
              sourceDenom: "FX",
              port: "transfer",
              channelId: "channel-19",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2716",
              path: "transfer/channel-2716/FX",
            },
          },
        ],
        counterparty: [
          {
            chainName: "fxcore",
            sourceDenom: "FX",
            chainType: "cosmos",
            chainId: "fxcore",
            symbol: "FX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg",
            },
          },
        ],
        variantGroupKey: "FX",
        name: "f(x)Core",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/fx.svg",
      },
      {
        chainName: "fxcore",
        sourceDenom: "eth0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
        coinMinimalDenom:
          "ibc/46D8D1A6E2A80ECCB7CA6663086A2E749C508B68DA56A077CD26E6F4F9691EEE",
        symbol: "PUNDIX",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pundix.png",
        },
        coingeckoId: "pundi-x-2",
        categories: ["depin"],
        transferMethods: [
          {
            name: "Starscan",
            type: "external_interface",
            depositUrl:
              "https://starscan.io/fxbridge?from=fxcore&to=osmosis&token=PUNDIX",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "fxcore",
              chainId: "fxcore",
              sourceDenom: "eth0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
              port: "transfer",
              channelId: "channel-19",
            },
            chain: {
              port: "transfer",
              channelId: "channel-2716",
              path: "transfer/channel-2716/eth0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
            },
          },
        ],
        counterparty: [
          {
            chainName: "fxcore",
            sourceDenom: "eth0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
            chainType: "cosmos",
            chainId: "fxcore",
            symbol: "PUNDIX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/pundi-x-token-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/pundi-x-token-logo.svg",
            },
          },
          {
            chainName: "ethereum",
            sourceDenom: "0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
            chainType: "evm",
            chainId: 1,
            address: "0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38",
            symbol: "PUNDIX",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/pundi-x-token-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/pundi-x-token-logo.svg",
            },
          },
        ],
        variantGroupKey: "PUNDIX",
        name: "Pundi X Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-21T16:00:00.000Z",
        relative_image_url: "/tokens/generated/pundix.png",
      },
    ],
  },
  {
    chain_name: "nomic",
    chain_id: "nomic-stakenet-3",
    assets: [
      {
        chainName: "nomic",
        sourceDenom: "usat",
        coinMinimalDenom:
          "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        symbol: "nBTC",
        decimals: 14,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.svg",
        },
        price: {
          poolId: "1490",
          denom:
            "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nomic",
              chainId: "nomic-stakenet-3",
              sourceDenom: "usat",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-6897",
              path: "transfer/channel-6897/usat",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nomic",
            sourceDenom: "usat",
            chainType: "cosmos",
            chainId: "nomic-stakenet-3",
            symbol: "nBTC",
            decimals: 14,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.svg",
            },
          },
          {
            chainName: "bitcoin",
            sourceDenom: "sat",
            chainType: "non-cosmos",
            symbol: "BTC",
            decimals: 8,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/bitcoin/images/btc.png",
            },
          },
        ],
        variantGroupKey: "BTC",
        name: "Nomic Bitcoin",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nbtc.svg",
      },
    ],
  },
  {
    chain_name: "nois",
    chain_id: "nois-1",
    assets: [
      {
        chainName: "nois",
        sourceDenom: "unois",
        coinMinimalDenom:
          "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
        symbol: "NOIS",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.svg",
        },
        price: {
          poolId: "1305",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nois",
              chainId: "nois-1",
              sourceDenom: "unois",
              port: "transfer",
              channelId: "channel-37",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8277",
              path: "transfer/channel-8277/unois",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nois",
            sourceDenom: "unois",
            chainType: "cosmos",
            chainId: "nois-1",
            symbol: "NOIS",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.svg",
            },
          },
        ],
        variantGroupKey: "NOIS",
        name: "Nois",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nois.svg",
      },
    ],
  },
  {
    chain_name: "qwoyn",
    chain_id: "qwoyn-1",
    assets: [
      {
        chainName: "qwoyn",
        sourceDenom: "uqwoyn",
        coinMinimalDenom:
          "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
        symbol: "QWOYN",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
        },
        coingeckoId: "qwoyn",
        price: {
          poolId: "1295",
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "qwoyn",
              chainId: "qwoyn-1",
              sourceDenom: "uqwoyn",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-880",
              path: "transfer/channel-880/uqwoyn",
            },
          },
        ],
        counterparty: [
          {
            chainName: "qwoyn",
            sourceDenom: "uqwoyn",
            chainType: "cosmos",
            chainId: "qwoyn-1",
            symbol: "QWOYN",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
            },
          },
        ],
        variantGroupKey: "QWOYN",
        name: "Qwoyn",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/qwoyn.png",
      },
    ],
  },
  {
    chain_name: "source",
    chain_id: "source-1",
    assets: [
      {
        chainName: "source",
        sourceDenom: "usource",
        coinMinimalDenom:
          "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
        symbol: "SOURCE",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.svg",
        },
        coingeckoId: "source",
        price: {
          poolId: "1623",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "source",
              chainId: "source-1",
              sourceDenom: "usource",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8945",
              path: "transfer/channel-8945/usource",
            },
          },
        ],
        counterparty: [
          {
            chainName: "source",
            sourceDenom: "usource",
            chainType: "cosmos",
            chainId: "source-1",
            symbol: "SOURCE",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.svg",
            },
          },
        ],
        variantGroupKey: "SOURCE",
        name: "Source",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/source.svg",
      },
      {
        chainName: "source",
        sourceDenom:
          "ibc/FC5A7360EEED0713AE3E83E9D55A69AF873056A172AC495890ACE4582FF9685A",
        coinMinimalDenom:
          "ibc/C97473CD237EBA2F94FDFA6ABA5EC0E22FA140655D73D2A2754F03A347BBA40B",
        symbol: "SRCX",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/srcx.png",
        },
        coingeckoId: "source-protocol",
        price: {
          poolId: "1513",
          denom:
            "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "source",
              chainId: "source-1",
              sourceDenom:
                "ibc/FC5A7360EEED0713AE3E83E9D55A69AF873056A172AC495890ACE4582FF9685A",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8945",
              path: "transfer/channel-8945/transfer/channel-1/erc20/0x091F9A57A3F58d758b6572E9d41675918EAC7F09",
            },
          },
        ],
        counterparty: [
          {
            chainName: "source",
            sourceDenom:
              "ibc/FC5A7360EEED0713AE3E83E9D55A69AF873056A172AC495890ACE4582FF9685A",
            chainType: "cosmos",
            chainId: "source-1",
            symbol: "SRCX",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/srcx.png",
            },
          },
          {
            chainName: "planq",
            sourceDenom: "erc20/0x091F9A57A3F58d758b6572E9d41675918EAC7F09",
            chainType: "cosmos",
            chainId: "planq_7070-2",
            symbol: "SRCX",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/srcx.png",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "0x454b90716a9435e7161a9aea5cf00e0acbe565ae",
            chainType: "evm",
            chainId: 56,
            address: "0x454b90716a9435e7161a9aea5cf00e0acbe565ae",
            symbol: "SRCX",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/srcx.png",
            },
          },
        ],
        variantGroupKey: "SRCX",
        name: "Source Token",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-03T21:47:00.000Z",
        relative_image_url: "/tokens/generated/srcx.png",
      },
    ],
  },
  {
    chain_name: "haqq",
    chain_id: "haqq_11235-1",
    assets: [
      {
        chainName: "haqq",
        sourceDenom: "aISLM",
        coinMinimalDenom:
          "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
        symbol: "ISLM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.svg",
        },
        coingeckoId: "islamic-coin",
        price: {
          poolId: "1637",
          denom:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "haqq",
              chainId: "haqq_11235-1",
              sourceDenom: "aISLM",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-1575",
              path: "transfer/channel-1575/aISLM",
            },
          },
        ],
        counterparty: [
          {
            chainName: "haqq",
            sourceDenom: "aISLM",
            chainType: "cosmos",
            chainId: "haqq_11235-1",
            symbol: "ISLM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.svg",
            },
          },
        ],
        variantGroupKey: "ISLM",
        name: "Haqq Network",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/islm.svg",
      },
    ],
  },
  {
    chain_name: "pundix",
    chain_id: "PUNDIX",
    assets: [
      {
        chainName: "pundix",
        sourceDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
        coinMinimalDenom:
          "ibc/6FD2938076A4C1BB3A324A676E76B0150A4443DAE0E002FB62AC0E6B604B1519",
        symbol: "PURSE",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.svg",
        },
        price: {
          poolId: "1695",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "pundix",
              chainId: "PUNDIX",
              sourceDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-12618",
              path: "transfer/channel-12618/bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            },
          },
        ],
        counterparty: [
          {
            chainName: "pundix",
            sourceDenom: "bsc0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            chainType: "cosmos",
            chainId: "PUNDIX",
            symbol: "PURSE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.svg",
            },
          },
          {
            chainName: "binancesmartchain",
            sourceDenom: "0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            chainType: "evm",
            chainId: 56,
            address: "0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C",
            symbol: "PURSE",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.svg",
            },
          },
        ],
        variantGroupKey: "PURSE",
        name: "PURSE Token (Function X)",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/purse.svg",
      },
    ],
  },
  {
    chain_name: "nyx",
    chain_id: "nyx",
    assets: [
      {
        chainName: "nyx",
        sourceDenom: "unyx",
        coinMinimalDenom:
          "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
        symbol: "NYX",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nyx.png",
        },
        categories: ["dweb", "privacy"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nyx",
              chainId: "nyx",
              sourceDenom: "unyx",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-15464",
              path: "transfer/channel-15464/unyx",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nyx",
            sourceDenom: "unyx",
            chainType: "cosmos",
            chainId: "nyx",
            symbol: "NYX",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nyx.png",
            },
          },
        ],
        variantGroupKey: "NYX",
        name: "Nym",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/nyx.png",
      },
      {
        chainName: "nyx",
        sourceDenom: "unym",
        coinMinimalDenom:
          "ibc/37CB3078432510EE57B9AFA8DBE028B33AE3280A144826FEAC5F2334CF2C5539",
        symbol: "NYM",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym.png",
        },
        coingeckoId: "nym",
        price: {
          poolId: "1361",
          denom: "uosmo",
        },
        categories: ["dweb", "privacy"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nyx",
              chainId: "nyx",
              sourceDenom: "unym",
              port: "transfer",
              channelId: "channel-8",
            },
            chain: {
              port: "transfer",
              channelId: "channel-15464",
              path: "transfer/channel-15464/unym",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nyx",
            sourceDenom: "unym",
            chainType: "cosmos",
            chainId: "nyx",
            symbol: "NYM",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym_token_light.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym_token_light.svg",
            },
          },
        ],
        variantGroupKey: "NYM",
        name: "NYM",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        relative_image_url: "/tokens/generated/nym.png",
      },
    ],
  },
  {
    chain_name: "dymension",
    chain_id: "dymension_1100-1",
    assets: [
      {
        chainName: "dymension",
        sourceDenom: "adym",
        coinMinimalDenom:
          "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
        symbol: "DYM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg",
        },
        coingeckoId: "dymension",
        price: {
          poolId: "1449",
          denom: "uosmo",
        },
        categories: [],
        transferMethods: [
          {
            name: "Dymension Portal",
            type: "external_interface",
            depositUrl:
              "https://portal.dymension.xyz/ibc/transfer?sourceId=dymension_1100-1&destinationId=osmosis-1",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dymension",
              chainId: "dymension_1100-1",
              sourceDenom: "adym",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-19774",
              path: "transfer/channel-19774/adym",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dymension",
            sourceDenom: "adym",
            chainType: "cosmos",
            chainId: "dymension_1100-1",
            symbol: "DYM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg",
            },
          },
        ],
        variantGroupKey: "DYM",
        name: "Dymension Hub",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-02-06T08:36:00.000Z",
        relative_image_url: "/tokens/generated/dym.svg",
      },
      {
        chainName: "dymension",
        sourceDenom:
          "ibc/FB53D1684F155CBB86D9CE917807E42B59209EBE3AD3A92E15EF66586C073942",
        coinMinimalDenom:
          "ibc/279D69A6EF8E37456C8D2DC7A7C1C50F7A566EC4758F6DE17472A9FDE36C4426",
        symbol: "NIM",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.svg",
        },
        categories: [],
        transferMethods: [
          {
            name: "Dymension Portal",
            type: "external_interface",
            depositUrl:
              "https://portal.dymension.xyz/ibc/transfer?sourceId=dymension_1100-1&destinationId=osmosis-1",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dymension",
              chainId: "dymension_1100-1",
              sourceDenom:
                "ibc/FB53D1684F155CBB86D9CE917807E42B59209EBE3AD3A92E15EF66586C073942",
              port: "transfer",
              channelId: "channel-2",
            },
            chain: {
              port: "transfer",
              channelId: "channel-19774",
              path: "transfer/channel-19774/transfer/channel-49/anim",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dymension",
            sourceDenom:
              "ibc/FB53D1684F155CBB86D9CE917807E42B59209EBE3AD3A92E15EF66586C073942",
            chainType: "cosmos",
            chainId: "dymension_1100-1",
            symbol: "NIM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.svg",
            },
          },
          {
            chainName: "nim",
            sourceDenom: "anim",
            chainType: "cosmos",
            chainId: "nim_1122-1",
            symbol: "NIM",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.svg",
            },
          },
        ],
        variantGroupKey: "NIM",
        name: "Nim Network",
        isAlloyed: false,
        verified: false,
        unstable: true,
        disabled: true,
        preview: false,
        listingDate: "2024-05-01T18:25:00.000Z",
        relative_image_url: "/tokens/generated/nim.svg",
      },
    ],
  },
  {
    chain_name: "humans",
    chain_id: "humans_1089-1",
    assets: [
      {
        chainName: "humans",
        sourceDenom: "aheart",
        coinMinimalDenom:
          "ibc/35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
        symbol: "HEART",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.svg",
        },
        coingeckoId: "humans-ai",
        price: {
          poolId: "1493",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["ai"],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=humans_1089-1&chainTo=osmosis-1&token0=aheart&token1=ibc%2F35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "humans",
              chainId: "humans_1089-1",
              sourceDenom: "aheart",
              port: "transfer",
              channelId: "channel-4",
            },
            chain: {
              port: "transfer",
              channelId: "channel-20082",
              path: "transfer/channel-20082/aheart",
            },
          },
        ],
        counterparty: [
          {
            chainName: "humans",
            sourceDenom: "aheart",
            chainType: "cosmos",
            chainId: "humans_1089-1",
            symbol: "HEART",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.svg",
            },
          },
        ],
        variantGroupKey: "HEART",
        name: "Humans.ai",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-08T16:25:00.000Z",
        relative_image_url: "/tokens/generated/heart.svg",
      },
    ],
  },
  {
    chain_name: "scorum",
    chain_id: "scorum-1",
    assets: [
      {
        chainName: "scorum",
        sourceDenom: "nscr",
        coinMinimalDenom:
          "ibc/178248C262DE2E141EE6287EE7AB0854F05F25B0A3F40C4B912FA1C7E51F466E",
        symbol: "SCR",
        decimals: 9,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scr.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scr.svg",
        },
        price: {
          poolId: "1507",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "scorum",
              chainId: "scorum-1",
              sourceDenom: "nscr",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-20100",
              path: "transfer/channel-20100/nscr",
            },
          },
        ],
        counterparty: [
          {
            chainName: "scorum",
            sourceDenom: "nscr",
            chainType: "cosmos",
            chainId: "scorum-1",
            symbol: "SCR",
            decimals: 9,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scr.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scr.svg",
            },
          },
        ],
        variantGroupKey: "SCR",
        name: "Scorum",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-19T19:08:00.000Z",
        relative_image_url: "/tokens/generated/scr.svg",
      },
    ],
  },
  {
    chain_name: "chain4energy",
    chain_id: "perun-1",
    assets: [
      {
        chainName: "chain4energy",
        sourceDenom: "uc4e",
        coinMinimalDenom:
          "ibc/62118FB4D5FEDD5D2B18DC93648A745CD5E5B01D420E9B7A5FED5381CB13A7E8",
        symbol: "C4E",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chain4energy/images/c4e.png",
        },
        coingeckoId: "chain4energy",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "chain4energy",
              chainId: "perun-1",
              sourceDenom: "uc4e",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-22172",
              path: "transfer/channel-22172/uc4e",
            },
          },
        ],
        counterparty: [
          {
            chainName: "chain4energy",
            sourceDenom: "uc4e",
            chainType: "cosmos",
            chainId: "perun-1",
            symbol: "C4E",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chain4energy/images/c4e.png",
            },
          },
        ],
        variantGroupKey: "C4E",
        name: "C4E",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-06T12:52:00.000Z",
        relative_image_url: "/tokens/generated/c4e.png",
      },
    ],
  },
  {
    chain_name: "pylons",
    chain_id: "pylons-mainnet-1",
    assets: [
      {
        chainName: "pylons",
        sourceDenom: "ubedrock",
        coinMinimalDenom:
          "ibc/0835781EF3F3ADD053874323AB660C75B50B18B16733CAB783CA6BBD78244EDF",
        symbol: "ROCK",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pylons/images/pylons.png",
        },
        price: {
          poolId: "1386",
          denom: "uosmo",
        },
        categories: ["nft_protocol"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "pylons",
              chainId: "pylons-mainnet-1",
              sourceDenom: "ubedrock",
              port: "transfer",
              channelId: "channel-29",
            },
            chain: {
              port: "transfer",
              channelId: "channel-17683",
              path: "transfer/channel-17683/ubedrock",
            },
          },
        ],
        counterparty: [
          {
            chainName: "pylons",
            sourceDenom: "ubedrock",
            chainType: "cosmos",
            chainId: "pylons-mainnet-1",
            symbol: "ROCK",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/pylons/images/pylons.png",
            },
          },
        ],
        variantGroupKey: "ROCK",
        name: "Pylons",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-03T22:27:00.000Z",
        relative_image_url: "/tokens/generated/rock.png",
      },
    ],
  },
  {
    chain_name: "aioz",
    chain_id: "aioz_168-1",
    assets: [
      {
        chainName: "aioz",
        sourceDenom: "attoaioz",
        coinMinimalDenom:
          "ibc/BB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
        symbol: "AIOZ",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.svg",
        },
        coingeckoId: "aioz-network",
        price: {
          poolId: "1565",
          denom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        },
        categories: ["ai", "dweb"],
        transferMethods: [
          {
            name: "Osmosis Pro TFM IBC Transfer",
            type: "external_interface",
            depositUrl:
              "https://pro.osmosis.zone/ibc?chainFrom=aioz_168-1&chainTo=osmosis-1&token0=attoaioz&token1=ibc%2FBB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
          },
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "aioz",
              chainId: "aioz_168-1",
              sourceDenom: "attoaioz",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-779",
              path: "transfer/channel-779/attoaioz",
            },
          },
        ],
        counterparty: [
          {
            chainName: "aioz",
            sourceDenom: "attoaioz",
            chainType: "cosmos",
            chainId: "aioz_168-1",
            symbol: "AIOZ",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.svg",
            },
          },
        ],
        variantGroupKey: "AIOZ",
        name: "AIOZ Network",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-12T23:14:00.000Z",
        relative_image_url: "/tokens/generated/aioz.svg",
      },
    ],
  },
  {
    chain_name: "nibiru",
    chain_id: "cataclysm-1",
    assets: [
      {
        chainName: "nibiru",
        sourceDenom: "unibi",
        coinMinimalDenom:
          "ibc/4017C65CEA338196ECCEC3FE3FE8258F23D1DE88F1D95750CC912C7A1C1016FF",
        symbol: "NIBI",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.svg",
        },
        coingeckoId: "nibiru",
        price: {
          poolId: "1605",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["defi"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "nibiru",
              chainId: "cataclysm-1",
              sourceDenom: "unibi",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-21113",
              path: "transfer/channel-21113/unibi",
            },
          },
        ],
        counterparty: [
          {
            chainName: "nibiru",
            sourceDenom: "unibi",
            chainType: "cosmos",
            chainId: "cataclysm-1",
            symbol: "NIBI",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.svg",
            },
          },
        ],
        variantGroupKey: "NIBI",
        name: "Nibiru",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-03-25T19:39:00.000Z",
        relative_image_url: "/tokens/generated/nibi.svg",
      },
    ],
  },
  {
    chain_name: "conscious",
    chain_id: "cvn_2032-1",
    assets: [
      {
        chainName: "conscious",
        sourceDenom: "acvnt",
        coinMinimalDenom:
          "ibc/044B7B28AFE93CEC769CF529ADC626DA09EA0EFA3E0E3284D540E9E00E01E24A",
        symbol: "CVN",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.svg",
        },
        coingeckoId: "consciousdao",
        price: {
          poolId: "1741",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "conscious",
              chainId: "cvn_2032-1",
              sourceDenom: "acvnt",
              port: "transfer",
              channelId: "channel-6",
            },
            chain: {
              port: "transfer",
              channelId: "channel-73971",
              path: "transfer/channel-73971/acvnt",
            },
          },
        ],
        counterparty: [
          {
            chainName: "conscious",
            sourceDenom: "acvnt",
            chainType: "cosmos",
            chainId: "cvn_2032-1",
            symbol: "CVN",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.svg",
            },
          },
        ],
        variantGroupKey: "CVN",
        name: "ConsciousDAO",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/cvn.svg",
      },
    ],
  },
  {
    chain_name: "dhealth",
    chain_id: "dhealth",
    assets: [
      {
        chainName: "dhealth",
        sourceDenom: "udhp",
        coinMinimalDenom:
          "ibc/FD506CCA1FC574F2A8175FB574C981E9F6351E194AA48AC219BD67FF934E2F33",
        symbol: "DHP",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.svg",
        },
        coingeckoId: "dhealth",
        price: {
          poolId: "1755",
          denom: "uosmo",
        },
        categories: ["dweb"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "dhealth",
              chainId: "dhealth",
              sourceDenom: "udhp",
              port: "transfer",
              channelId: "channel-4",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75030",
              path: "transfer/channel-75030/udhp",
            },
          },
        ],
        counterparty: [
          {
            chainName: "dhealth",
            sourceDenom: "udhp",
            chainType: "cosmos",
            chainId: "dhealth",
            symbol: "DHP",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.svg",
            },
          },
        ],
        variantGroupKey: "DHP",
        name: "dHealth",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-16T17:00:00.000Z",
        relative_image_url: "/tokens/generated/dhp.svg",
      },
    ],
  },
  {
    chain_name: "furya",
    chain_id: "furya-1",
    assets: [
      {
        chainName: "furya",
        sourceDenom: "ufury",
        coinMinimalDenom:
          "ibc/42D0FBF9DDC72D7359D309A93A6DF9F6FDEE3987EA1C5B3CDE95C06FCE183F12",
        symbol: "FURY",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/ufury.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/ufury.svg",
        },
        coingeckoId: "fanfury",
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "furya",
              chainId: "furya-1",
              sourceDenom: "ufury",
              port: "transfer",
              channelId: "channel-3",
            },
            chain: {
              port: "transfer",
              channelId: "channel-8690",
              path: "transfer/channel-8690/ufury",
            },
          },
        ],
        counterparty: [
          {
            chainName: "furya",
            sourceDenom: "ufury",
            chainType: "cosmos",
            chainId: "furya-1",
            symbol: "FURY",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/ufury.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/ufury.svg",
            },
          },
        ],
        variantGroupKey: "FURY",
        name: "furya",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-29T16:37:00.000Z",
        relative_image_url: "/tokens/generated/fury.svg",
      },
    ],
  },
  {
    chain_name: "saga",
    chain_id: "ssc-1",
    assets: [
      {
        chainName: "saga",
        sourceDenom: "usaga",
        coinMinimalDenom:
          "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
        symbol: "SAGA",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga_white.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga_white.svg",
        },
        coingeckoId: "saga-2",
        price: {
          poolId: "1671",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: ["gaming"],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "saga",
              chainId: "ssc-1",
              sourceDenom: "usaga",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-38946",
              path: "transfer/channel-38946/usaga",
            },
          },
        ],
        counterparty: [
          {
            chainName: "saga",
            sourceDenom: "usaga",
            chainType: "cosmos",
            chainId: "ssc-1",
            symbol: "SAGA",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.svg",
            },
          },
        ],
        variantGroupKey: "SAGA",
        name: "Saga",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-04-09T10:30:00.000Z",
        relative_image_url: "/tokens/generated/saga.svg",
      },
    ],
  },
  {
    chain_name: "shido",
    chain_id: "shido_9008-1",
    assets: [
      {
        chainName: "shido",
        sourceDenom: "shido",
        coinMinimalDenom:
          "ibc/62B50BB1DAEAD2A92D6C6ACAC118F4ED8CBE54265DCF5688E8D0A0A978AA46E7",
        symbol: "SHIDO",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.svg",
        },
        coingeckoId: "shido-2",
        price: {
          poolId: "1710",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "shido",
              chainId: "shido_9008-1",
              sourceDenom: "shido",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-73755",
              path: "transfer/channel-73755/shido",
            },
          },
        ],
        counterparty: [
          {
            chainName: "shido",
            sourceDenom: "shido",
            chainType: "cosmos",
            chainId: "shido_9008-1",
            symbol: "SHIDO",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.svg",
            },
          },
        ],
        variantGroupKey: "SHIDO",
        name: "Shido",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/shido.svg",
      },
    ],
  },
  {
    chain_name: "cifer",
    chain_id: "cifer-2",
    assets: [
      {
        chainName: "cifer",
        sourceDenom: "ucif",
        coinMinimalDenom:
          "ibc/EFC1776BEFB7842F2DC7BABD9A3050E188145C99007ECC5F3526FED45A68D5F5",
        symbol: "CIF",
        decimals: 6,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.svg",
        },
        price: {
          poolId: "1678",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "cifer",
              chainId: "cifer-2",
              sourceDenom: "ucif",
              port: "transfer",
              channelId: "channel-1",
            },
            chain: {
              port: "transfer",
              channelId: "channel-39205",
              path: "transfer/channel-39205/ucif",
            },
          },
        ],
        counterparty: [
          {
            chainName: "cifer",
            sourceDenom: "ucif",
            chainType: "cosmos",
            chainId: "cifer-2",
            symbol: "CIF",
            decimals: 6,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.svg",
            },
          },
        ],
        variantGroupKey: "CIF",
        name: "Cifer",
        isAlloyed: false,
        verified: false,
        unstable: false,
        disabled: false,
        preview: true,
        relative_image_url: "/tokens/generated/cif.svg",
      },
    ],
  },
  {
    chain_name: "seda",
    chain_id: "seda-1",
    assets: [
      {
        chainName: "seda",
        sourceDenom: "aseda",
        coinMinimalDenom:
          "ibc/956AEF1DA92F70584266E87978C3F30A43B91EE6ABC62F03D097E79F6B99C4D8",
        symbol: "SEDA",
        decimals: 18,
        logoURIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/seda/images/seda.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/seda/images/seda.svg",
        },
        coingeckoId: "seda-2",
        price: {
          poolId: "1731",
          denom:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        },
        categories: [],
        transferMethods: [
          {
            name: "Osmosis IBC Transfer",
            type: "ibc",
            counterparty: {
              chainName: "seda",
              chainId: "seda-1",
              sourceDenom: "aseda",
              port: "transfer",
              channelId: "channel-0",
            },
            chain: {
              port: "transfer",
              channelId: "channel-75016",
              path: "transfer/channel-75016/aseda",
            },
          },
        ],
        counterparty: [
          {
            chainName: "seda",
            sourceDenom: "aseda",
            chainType: "cosmos",
            chainId: "seda-1",
            symbol: "SEDA",
            decimals: 18,
            logoURIs: {
              png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/seda/images/seda.png",
              svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/seda/images/seda.svg",
            },
          },
        ],
        variantGroupKey: "SEDA",
        name: "SEDA",
        isAlloyed: false,
        verified: true,
        unstable: false,
        disabled: false,
        preview: false,
        listingDate: "2024-05-03T13:00:00.000Z",
        relative_image_url: "/tokens/generated/seda.svg",
      },
    ],
  },
];
