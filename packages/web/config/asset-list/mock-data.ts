import type { AssetList, Chain } from "@osmosis-labs/types";

export const MockAssetLists: AssetList[] = [
  {
    chain_name: "osmosis",
    chain_id: "osmosis-1",
    assets: [
      {
        description: "The native token of Osmosis",
        denom_units: [
          {
            denom: "uosmo",
            exponent: 0,
          },
          {
            denom: "osmo",
            exponent: 6,
          },
        ],
        base: "uosmo",
        name: "Osmosis",
        display: "osmo",
        symbol: "OSMO",
        traces: [],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
        },
        coingecko_id: "osmosis",
        keywords: [
          "dex",
          "staking",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:678",
        ],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:uosmo",
      },
      {
        denom_units: [
          {
            denom: "uion",
            exponent: 0,
          },
          {
            denom: "ion",
            exponent: 6,
          },
        ],
        base: "uion",
        name: "Ion",
        display: "ion",
        symbol: "ION",
        traces: [],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.svg",
        },
        coingecko_id: "ion",
        keywords: [
          "memecoin",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:2",
        ],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:uion",
      },
      {
        denom_units: [
          {
            denom:
              "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
            exponent: 0,
          },
          {
            denom: "ibcx",
            exponent: 6,
          },
        ],
        address:
          "osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm",
        base: "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        name: "IBCX Core <Product of ION DAO>",
        display: "ibcx",
        symbol: "IBCX",
        traces: [],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibcx.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B:1254",
        ],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:ibcx",
      },
      {
        denom_units: [
          {
            denom:
              "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
            exponent: 0,
          },
          {
            denom: "stibcx",
            exponent: 6,
          },
        ],
        address:
          "osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k",
        base: "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        name: "stIBCX Core <Product of ION DAO>",
        display: "stibcx",
        symbol: "stIBCX",
        traces: [],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1039"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:stibcx",
      },
      {
        description: "ERIS liquid staked OSMO",
        denom_units: [
          {
            denom:
              "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
            exponent: 0,
          },
          {
            denom: "ampOSMO",
            exponent: 6,
          },
        ],
        address:
          "osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9",
        base: "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        name: "ERIS Amplified OSMO",
        display: "amposmo",
        symbol: "ampOSMO",
        traces: [],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/amposmo.png",
        },
        keywords: ["osmosis-main", "osmosis-price:uosmo:1067"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:amposmo",
      },
      {
        description: "Membrane's CDP-style stablecoin called CDT",
        denom_units: [
          {
            denom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
            exponent: 0,
          },
          {
            denom: "cdt",
            exponent: 6,
          },
        ],
        base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        name: "CDT",
        display: "cdt",
        symbol: "CDT",
        traces: [],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CDT.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1226"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:cdt",
      },
      {
        description: "Membrane's protocol token",
        denom_units: [
          {
            denom:
              "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
            exponent: 0,
          },
          {
            denom: "mbrn",
            exponent: 6,
          },
        ],
        base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        name: "MBRN",
        display: "mbrn",
        symbol: "MBRN",
        traces: [],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/MBRN.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1225"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:mbrn",
      },
    ],
  },
  {
    chain_name: "cosmoshub",
    chain_id: "cosmoshub-4",
    assets: [
      {
        description:
          "The native staking and governance token of the Cosmos Hub.",
        denom_units: [
          {
            denom:
              "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
            exponent: 0,
            aliases: ["uatom"],
          },
          {
            denom: "atom",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        name: "Cosmos Hub Atom",
        display: "atom",
        symbol: "ATOM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "cosmoshub",
              base_denom: "uatom",
              channel_id: "channel-141",
            },
            chain: {
              channel_id: "channel-0",
              path: "transfer/channel-0/uatom",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
        },
        coingecko_id: "cosmos",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1"],
        origin_chain_id: "cosmoshub-4",
        origin_chain_name: "cosmoshub",
        price_coin_id: "pool:uatom",
      },
    ],
  },
];

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
];
