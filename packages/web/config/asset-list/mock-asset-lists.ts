import type { AssetList } from "@osmosis-labs/types";
export const AssetLists: AssetList[] = [
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
        display: "ampOSMO",
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
      {
        description: "Margined Power Token sqOSMO",
        denom_units: [
          {
            denom:
              "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
            exponent: 0,
          },
          {
            denom: "sqosmo",
            exponent: 6,
          },
        ],
        base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        name: "OSMO Squared",
        display: "sqosmo",
        symbol: "sqOSMO",
        traces: [],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqosmo.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
        price_coin_id: "pool:sqosmo",
      },
      {
        description: "Margined Power Token sqATOM",
        denom_units: [
          {
            denom: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
            exponent: 0,
          },
          {
            denom: "sqatom",
            exponent: 6,
          },
        ],
        base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        name: "ATOM Squared",
        display: "sqatom",
        symbol: "sqATOM",
        traces: [],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqatom.svg",
        },
        keywords: ["osmosis-main", "osmosis-unlisted"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
      },
      {
        description: "Margined Power Token sqBTC",
        denom_units: [
          {
            denom: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
            exponent: 0,
          },
          {
            denom: "sqbtc",
            exponent: 6,
          },
        ],
        base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        name: "BTC Squared",
        display: "sqbtc",
        symbol: "sqBTC",
        traces: [],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqbtc.svg",
        },
        keywords: ["osmosis-main", "osmosis-unlisted"],
        origin_chain_id: "osmosis-1",
        origin_chain_name: "osmosis",
      },
    ],
  },
  {
    chain_name: "axelar",
    chain_id: "axelar-dojo-1",
    assets: [
      {
        description: "Circle's stablecoin on Axelar",
        denom_units: [
          {
            denom:
              "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
            exponent: 0,
            aliases: ["uusdc"],
          },
          {
            denom: "usdc",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        name: "USD Coin",
        display: "usdc",
        symbol: "USDC.axl",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Circle",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "uusdc",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/uusdc",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.svg",
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.png",
        },
        coingecko_id: "axlusdc",
        keywords: ["osmosis-main", "osmosis-info", "peg:collateralized"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Wrapped Ether on Axelar",
        denom_units: [
          {
            denom:
              "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
            exponent: 0,
            aliases: ["weth-wei"],
          },
          {
            denom: "weth",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        name: "Wrapped Ether",
        display: "weth",
        symbol: "ETH",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Ethereum",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "weth-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/weth-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:704"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:weth-wei",
      },
      {
        description: "Wrapped Bitcoin on Axelar",
        denom_units: [
          {
            denom:
              "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
            exponent: 0,
            aliases: ["wbtc-satoshi"],
          },
          {
            denom: "wbtc",
            exponent: 8,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        name: "Wrapped Bitcoin",
        display: "wbtc",
        symbol: "WBTC",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "bitcoin",
              base_denom: "sat",
            },
            provider: "BitGo, Kyber, and Ren",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wbtc-satoshi",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wbtc-satoshi",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/wbtc.png",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:712"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wbtc-satoshi",
      },
      {
        description: "Tether's USD stablecoin on Axelar",
        denom_units: [
          {
            denom:
              "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
            exponent: 0,
            aliases: ["uusdt"],
          },
          {
            denom: "usdt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        name: "Tether USD",
        display: "usdt",
        symbol: "USDT.axl",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Tether",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "uusdt",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/uusdt",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.axl.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:831",
          "peg:collateralized",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:uusdt.axl",
      },
      {
        description: "Dai stablecoin on Axelar",
        denom_units: [
          {
            denom:
              "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
            exponent: 0,
            aliases: ["dai-wei"],
          },
          {
            denom: "dai",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        name: "Dai Stablecoin",
        display: "dai",
        symbol: "DAI",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "MakerDAO",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "dai-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/dai-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:674",
          "peg:collateralized",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:dai-wei",
      },
      {
        description: "Binance USD on Axelar.",
        denom_units: [
          {
            denom:
              "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
            exponent: 0,
            aliases: ["busd-wei"],
          },
          {
            denom: "busd",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
        name: "Binance USD",
        display: "busd",
        symbol: "BUSD",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Binance",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "busd-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/busd-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:877",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:busdwei.axl",
      },
      {
        description: "Wrapped BNB on Axelar",
        denom_units: [
          {
            denom:
              "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
            exponent: 0,
            aliases: ["wbnb-wei"],
          },
          {
            denom: "wbnb",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        name: "Wrapped BNB",
        display: "wbnb",
        symbol: "BNB",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "binancesmartchain",
              base_denom: "wei",
            },
            chain: {
              contract: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            },
            provider: "Binance",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "binancesmartchain",
              base_denom: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wbnb-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wbnb-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/wbnb.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:840"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wbnbwei.axl",
      },
      {
        description: "Wrapped Matic on Axelar",
        denom_units: [
          {
            denom:
              "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
            exponent: 0,
            aliases: ["wmatic-wei"],
          },
          {
            denom: "wmatic",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
        name: "Wrapped Matic",
        display: "wmatic",
        symbol: "MATIC",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "polygon",
              base_denom: "wei",
            },
            provider: "Polygon",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "polygon",
              base_denom: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wmatic-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wmatic-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.png",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:789"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wmaticwei.axl",
      },
      {
        description: "Wrapped AVAX on Axelar.",
        denom_units: [
          {
            denom:
              "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
            exponent: 0,
            aliases: ["wavax-wei"],
          },
          {
            denom: "avax",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
        name: "Wrapped AVAX",
        display: "avax",
        symbol: "AVAX",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "avalanche",
              base_denom: "wei",
            },
            provider: "Avalanche",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "avalanche",
              base_denom: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wavax-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wavax-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.png",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:899"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wavaxwei.axl",
      },
      {
        description: "Wrapped Polkadot on Axelar",
        denom_units: [
          {
            denom:
              "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
            exponent: 0,
            aliases: ["dot-planck"],
          },
          {
            denom: "dot",
            exponent: 10,
          },
        ],
        type_asset: "ics20",
        base: "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
        name: "Wrapped Polkadot",
        display: "dot",
        symbol: "DOT.axl",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "polkadot",
              base_denom: "Planck",
            },
            provider: "Polkadot Parachain",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "moonbeam",
              base_denom: "0xffffffff1fcacbd218edc0eba20fc2308c778080",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "dot-planck",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/dot-planck",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dot.axl.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:773"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:dotplanck.axl",
      },
      {
        description: "Frax's fractional-algorithmic stablecoin on Axelar",
        denom_units: [
          {
            denom:
              "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
            exponent: 0,
            aliases: ["frax-wei"],
          },
          {
            denom: "frax",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
        name: "Frax",
        display: "frax",
        symbol: "FRAX",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Frax Protocol",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x853d955acef822db058eb8505911ed77f175b99e",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "frax-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/frax-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:679",
          "peg:hybrid",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Chainlink on Axelar",
        denom_units: [
          {
            denom:
              "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
            exponent: 0,
            aliases: ["link-wei"],
          },
          {
            denom: "link",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
        name: "Chainlink",
        display: "link",
        symbol: "LINK",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x514910771af9ca656af840dff83e8264ecf986ca",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "link-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/link-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:731"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:link-wei",
      },
      {
        description: "Aave on Axelar",
        denom_units: [
          {
            denom:
              "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
            exponent: 0,
            aliases: ["aave-wei"],
          },
          {
            denom: "aave",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
        name: "Aave",
        display: "aave",
        symbol: "AAVE",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "aave-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/aave-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
        },
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "ApeCoin on Axelar",
        denom_units: [
          {
            denom:
              "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
            exponent: 0,
            aliases: ["ape-wei"],
          },
          {
            denom: "ape",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
        name: "ApeCoin",
        display: "ape",
        symbol: "APE",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x4d224452801aced8b2f0aebe155379bb5d594381",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "ape-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/ape-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
        },
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Axie Infinity Shard on Axelar",
        denom_units: [
          {
            denom:
              "ibc/6C0CB8653012DC2BC1820FD0B6B3AFF8A07D18630BDAEE066FEFB2D92F477C24",
            exponent: 0,
            aliases: ["axs-wei"],
          },
          {
            denom: "axs",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6C0CB8653012DC2BC1820FD0B6B3AFF8A07D18630BDAEE066FEFB2D92F477C24",
        name: "Axie Infinity Shard",
        display: "axs",
        symbol: "AXS",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "axs-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/axs-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/axs.svg",
        },
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Maker on Axelar",
        denom_units: [
          {
            denom:
              "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
            exponent: 0,
            aliases: ["mkr-wei"],
          },
          {
            denom: "mkr",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
        name: "Maker",
        display: "mkr",
        symbol: "MKR",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "mkr-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/mkr-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-price:ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7:734",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:mkr-wei",
      },
      {
        description: "Rai Reflex Index on Axelar",
        denom_units: [
          {
            denom:
              "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
            exponent: 0,
            aliases: ["rai-wei"],
          },
          {
            denom: "rai",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
        name: "Rai Reflex Index",
        display: "rai",
        symbol: "RAI",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "RAI Finance",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "rai-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/rai-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
        },
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Shiba Inu on Axelar",
        denom_units: [
          {
            denom:
              "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
            exponent: 0,
            aliases: ["shib-wei"],
          },
          {
            denom: "shib",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
        name: "Shiba Inu",
        display: "shib",
        symbol: "SHIB",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "shib-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/shib-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
        },
        keywords: ["osmosis-price:uosmo:880"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Uniswap on Axelar",
        denom_units: [
          {
            denom:
              "ibc/AE2719773D6FCDD05AC17B1ED63F672F5F9D84144A61965F348C86C2A83AD161",
            exponent: 0,
            aliases: ["uni-wei"],
          },
          {
            denom: "uni",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/AE2719773D6FCDD05AC17B1ED63F672F5F9D84144A61965F348C86C2A83AD161",
        name: "Uniswap",
        display: "uni",
        symbol: "UNI",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "uni-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/uni-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/uni.svg",
        },
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Chain on Axelar",
        denom_units: [
          {
            denom:
              "ibc/B901BEC1B71D0573E6EE874FEC39E2DF4C2BDB1DB74CB3DA0A9CACC4A435B0EC",
            exponent: 0,
            aliases: ["xcn-wei"],
          },
          {
            denom: "xcn",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B901BEC1B71D0573E6EE874FEC39E2DF4C2BDB1DB74CB3DA0A9CACC4A435B0EC",
        name: "Chain",
        display: "xcn",
        symbol: "XCN",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xa2cd3d43c775978a96bdbf12d733d5a1ed94fb18",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "xcn-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/xcn-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/xcn.svg",
        },
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Wrapped Moonbeam on Axelar",
        denom_units: [
          {
            denom:
              "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
            exponent: 0,
            aliases: ["wglmr-wei"],
          },
          {
            denom: "wglmr",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
        name: "Wrapped Moonbeam",
        display: "wglmr",
        symbol: "GLMR",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "moonbeam",
              base_denom: "Wei",
            },
            provider: "Moonbeam",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "moonbeam",
              base_denom: "0xacc15dc74880c9944775448304b263d191c6077f",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wglmr-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wglmr-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.svg",
        },
        keywords: ["osmosis-price:uosmo:825"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "The native token of Axelar",
        denom_units: [
          {
            denom:
              "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
            exponent: 0,
            aliases: ["uaxl"],
          },
          {
            denom: "axl",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
        name: "Axelar",
        display: "axl",
        symbol: "AXL",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "uaxl",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/uaxl",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.svg",
        },
        coingecko_id: "axelar",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:812"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:uaxl",
      },
      {
        description: "Wrapped FTM on Axelar.",
        denom_units: [
          {
            denom:
              "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
            exponent: 0,
            aliases: ["wftm-wei"],
          },
          {
            denom: "ftm",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
        name: "Wrapped FTM",
        display: "ftm",
        symbol: "FTM",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "fantom",
              base_denom: "wei",
            },
            chain: {
              contract: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            },
            provider: "Fantom",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "fantom",
              base_denom: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wftm-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wftm-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:900"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wftm-wei",
      },
      {
        description: "Circle's stablecoin from Polygon on Axelar",
        denom_units: [
          {
            denom:
              "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
            exponent: 0,
            aliases: ["polygon-uusdc"],
          },
          {
            denom: "polygon-usdc",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
        name: "USD Coin from Polygon",
        display: "polygon-usdc",
        symbol: "polygon.USDC",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Circle",
          },
          {
            type: "additional-mintage",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            provider: "Circle",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "polygon",
              base_denom: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "polygon-uusdc",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/polygon-uusdc",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/polygon.usdc.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:938",
          "peg:collateralized",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Circle's stablecoin from Avalanche on Axelar",
        denom_units: [
          {
            denom:
              "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
            exponent: 0,
            aliases: ["avalanche-uusdc"],
          },
          {
            denom: "avalanche-usdc",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
        name: "USD Coin from Avalanche",
        display: "avalanche-usdc",
        symbol: "avalanche.USDC",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Circle",
          },
          {
            type: "additional-mintage",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            provider: "Circle",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "avalanche",
              base_denom: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "avalanche-uusdc",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/avalanche-uusdc",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/avalanche.usdc.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:938",
          "peg:collateralized",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
      },
      {
        description: "Wrapped FIL on Axelar",
        denom_units: [
          {
            denom:
              "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
            exponent: 0,
            aliases: ["wfil-wei"],
          },
          {
            denom: "fil",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
        name: "Wrapped FIL from Filecoin",
        display: "fil",
        symbol: "FIL",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "filecoin",
              base_denom: "attoFIL",
            },
            provider: "Filecoin",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "filecoin",
              base_denom: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wfil-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wfil-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/wfil.svg",
        },
        keywords: ["osmosis-main", "osmosis-price:uosmo:1006"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wfil-wei",
      },
      {
        description: "Arbitrum on Axelar",
        denom_units: [
          {
            denom:
              "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
            exponent: 0,
            aliases: ["arb-wei"],
          },
          {
            denom: "arb",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
        name: "Arbitrum",
        display: "arb",
        symbol: "ARB",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "arbitrum",
              base_denom: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "arb-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/arb-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1011"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:arb",
      },
      {
        denom_units: [
          {
            denom:
              "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
            exponent: 0,
            aliases: ["0x6982508145454Ce325dDbE47a25d4ec3d2311933", "pepe-wei"],
          },
          {
            denom: "pepe",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
        name: "Pepe",
        display: "pepe",
        symbol: "PEPE",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "pepe-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/pepe-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.svg",
        },
        keywords: ["osmosis-main", "osmosis-price:uosmo:1018"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:pepe",
      },
      {
        description:
          "Coinbase Wrapped Staked ETH (“cbETH”) is a utility token and liquid representation of ETH staked through Coinbase. cbETH gives customers the option to sell, transfer, or otherwise use their staked ETH in dapps while it remains locked by the Ethereum protocol.",
        denom_units: [
          {
            denom:
              "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
            exponent: 0,
            aliases: [
              "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
              "cbeth-wei",
            ],
          },
          {
            denom: "cbeth",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
        name: "Coinbase Wrapped Staked ETH",
        display: "cbeth",
        symbol: "cbETH",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Coinbase",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "cbeth-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/cbeth-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
        },
        keywords: [
          "osmosis-main",
          "osmosis-price:ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C:1030",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:cbeth-wei",
      },
      {
        description:
          "Rocket Pool is a decentralised Ethereum Proof of Stake pool.",
        denom_units: [
          {
            denom:
              "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
            exponent: 0,
            aliases: ["0xae78736cd615f374d3085123a210448e74fc6393", "reth-wei"],
          },
          {
            denom: "reth",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
        name: "Rocket Pool Ether",
        display: "reth",
        symbol: "rETH",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Rocket Pool",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xae78736cd615f374d3085123a210448e74fc6393",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "reth-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/reth-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
        },
        keywords: [
          "osmosis-main",
          "osmosis-price:ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C:1030",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:reth-wei",
      },
      {
        description:
          "sfrxETH is the version of frxETH which accrues staking yield. All profit generated from Frax Ether validators is distributed to sfrxETH holders. By exchanging frxETH for sfrxETH, one become's eligible for staking yield, which is redeemed upon converting sfrxETH back to frxETH.",
        denom_units: [
          {
            denom:
              "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
            exponent: 0,
            aliases: [
              "0xac3e018457b222d93114458476f3e3416abbe38f",
              "sfrxeth-wei",
            ],
          },
          {
            denom: "sfrxeth",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
        name: "Staked Frax Ether",
        display: "sfrxeth",
        symbol: "sfrxETH",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Frax",
          },
          {
            type: "wrapped",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x5e8422345238f34275888049021821e8e08caa1f",
            },
            provider: "Frax",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xac3e018457b222d93114458476f3e3416abbe38f",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "sfrxeth-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/sfrxeth-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-price:ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C:1030",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:sfrxeth-wei",
      },
      {
        description:
          "wstETH is a wrapped version of stETH. As some DeFi protocols require a constant balance mechanism for tokens, wstETH keeps your balance of stETH fixed and uses an underlying share system to reflect your earned staking rewards.",
        denom_units: [
          {
            denom:
              "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
            exponent: 0,
            aliases: [
              "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
              "wsteth-wei",
            ],
          },
          {
            denom: "wsteth",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        name: "Wrapped Lido Staked Ether",
        display: "wsteth",
        symbol: "wstETH.axl",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Lido",
          },
          {
            type: "wrapped",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            },
            provider: "Lido",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "wsteth-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/wsteth-wei",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-price:ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5:1024",
        ],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:wsteth-wei",
      },
      {
        description:
          "Maximize ETH yield through leveraged staking across Aave, Compound and Morpho and liquidity provision of ETH liquid staking tokens on Uniswap V3.",
        denom_units: [
          {
            denom:
              "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
            exponent: 0,
            aliases: [
              "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
              "yieldeth-wei",
            ],
          },
          {
            denom: "YieldETH",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
        name: "Real Yield Eth",
        display: "YieldETH",
        symbol: "YieldETH",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Seven Seas & DeFine Logic Labs",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
            },
            provider: "Axelar",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "axelar",
              base_denom: "yieldeth-wei",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-208",
              path: "transfer/channel-208/yieldeth-wei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "axelar-dojo-1",
        origin_chain_name: "axelar",
        price_coin_id: "pool:yieldeth-wei",
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
  {
    chain_name: "cryptoorgchain",
    chain_id: "crypto-org-chain-mainnet-1",
    assets: [
      {
        description:
          "CRO is the native token of the Crypto.org Chain, referred to as Native CRO.",
        denom_units: [
          {
            denom:
              "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
            exponent: 0,
            aliases: ["basecro"],
          },
          {
            denom: "cro",
            exponent: 8,
          },
        ],
        type_asset: "ics20",
        base: "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
        name: "Cronos",
        display: "cro",
        symbol: "CRO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "cryptoorgchain",
              base_denom: "basecro",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-5",
              path: "transfer/channel-5/basecro",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cronos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cro.svg",
        },
        coingecko_id: "crypto-com-chain",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:9"],
        origin_chain_id: "crypto-org-chain-mainnet-1",
        origin_chain_name: "cryptoorgchain",
        price_coin_id: "pool:basecro",
      },
    ],
  },
  {
    chain_name: "terra",
    chain_id: "columbus-5",
    assets: [
      {
        description: "The native staking token of Terra Classic.",
        denom_units: [
          {
            denom:
              "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
            exponent: 0,
            aliases: ["microluna", "uluna"],
          },
          {
            denom: "mluna",
            exponent: 3,
            aliases: ["milliluna"],
          },
          {
            denom: "luna",
            exponent: 6,
            aliases: ["lunc"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
        name: "Luna Classic",
        display: "luna",
        symbol: "LUNC",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "terra",
              base_denom: "uluna",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-72",
              path: "transfer/channel-72/uluna",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.svg",
        },
        coingecko_id: "terra-luna",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:800"],
        origin_chain_id: "columbus-5",
        origin_chain_name: "terra",
        price_coin_id: "pool:ulunc",
      },
      {
        description: "The USD stablecoin of Terra Classic.",
        denom_units: [
          {
            denom:
              "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
            exponent: 0,
            aliases: ["microusd", "uusd"],
          },
          {
            denom: "musd",
            exponent: 3,
            aliases: ["milliusd"],
          },
          {
            denom: "ust",
            exponent: 6,
            aliases: ["ustc"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        name: "TerraClassicUSD",
        display: "ust",
        symbol: "USTC",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "terra",
              base_denom: "uusd",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-72",
              path: "transfer/channel-72/uusd",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.svg",
        },
        coingecko_id: "terrausd",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:560",
          "peg:algorithmic",
        ],
        origin_chain_id: "columbus-5",
        origin_chain_name: "terra",
        price_coin_id: "pool:uustc",
      },
      {
        description: "The KRW stablecoin of Terra Classic.",
        denom_units: [
          {
            denom:
              "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
            exponent: 0,
            aliases: ["microkrw", "ukrw"],
          },
          {
            denom: "mkrw",
            exponent: 3,
            aliases: ["millikrw"],
          },
          {
            denom: "krt",
            exponent: 6,
            aliases: ["krtc"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
        name: "TerraClassicKRW",
        display: "krt",
        symbol: "KRTC",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "terra",
              base_denom: "ukrw",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-72",
              path: "transfer/channel-72/ukrw",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.svg",
        },
        coingecko_id: "terrakrw",
        keywords: [
          "osmosis-price:ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC:581",
          "peg:algorithmic",
        ],
        origin_chain_id: "columbus-5",
        origin_chain_name: "terra",
      },
    ],
  },
  {
    chain_name: "juno",
    chain_id: "juno-1",
    assets: [
      {
        description: "The native token of JUNO Chain",
        denom_units: [
          {
            denom:
              "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
            exponent: 0,
            aliases: ["ujuno"],
          },
          {
            denom: "juno",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        name: "Juno",
        display: "juno",
        symbol: "JUNO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "juno",
              base_denom: "ujuno",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-42",
              path: "transfer/channel-42/ujuno",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg",
        },
        coingecko_id: "juno-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:497"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:ujuno",
      },
      {
        description: "The native token cw20 for Marble DAO on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
            exponent: 0,
            aliases: [
              "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            ],
          },
          {
            denom: "marble",
            exponent: 3,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
        base: "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
        name: "Marble",
        display: "marble",
        symbol: "MARBLE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.svg",
        },
        coingecko_id: "marble",
        keywords: ["osmosis-info", "osmosis-price:uosmo:649"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:marble",
      },
      {
        description: "The native token cw20 for Neta on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
            exponent: 0,
            aliases: [
              "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            ],
          },
          {
            denom: "neta",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
        base: "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
        name: "Neta",
        display: "neta",
        symbol: "NETA",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.svg",
        },
        coingecko_id: "neta",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:631"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:neta",
      },
      {
        description:
          "Hope Galaxy is an NFT collection based on its own native Token $HOPE, a cw20 token on Juno chain.",
        denom_units: [
          {
            denom:
              "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
            exponent: 0,
            aliases: [
              "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            ],
          },
          {
            denom: "hope",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
        base: "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
        name: "Hope Galaxy",
        display: "hope",
        symbol: "HOPE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.svg",
        },
        coingecko_id: "hope-galaxy",
        keywords: ["osmosis-price:uosmo:653"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:hope",
      },
      {
        description:
          "Racoon aims to simplify accessibility to AI, NFTs and Gambling on the Cosmos Ecosystem",
        denom_units: [
          {
            denom:
              "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
            exponent: 0,
            aliases: [
              "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            ],
          },
          {
            denom: "rac",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
        base: "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
        name: "Racoon",
        display: "rac",
        symbol: "RAC",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.svg",
        },
        coingecko_id: "racoon",
        keywords: ["osmosis-price:uosmo:669"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:rac",
      },
      {
        description: "The native token of Marble DEX on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
            exponent: 0,
            aliases: [
              "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            ],
          },
          {
            denom: "block",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
        base: "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
        name: "Block",
        display: "block",
        symbol: "BLOCK",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.svg",
        },
        keywords: ["osmosis-price:uosmo:691"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:block",
      },
      {
        description: "The DAO token to build consensus among Hong Kong People",
        denom_units: [
          {
            denom:
              "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
            exponent: 0,
            aliases: [
              "dhk",
              "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            ],
          },
        ],
        type_asset: "ics20",
        address:
          "juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
        base: "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
        name: "DHK",
        display: "dhk",
        symbol: "DHK",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:695"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:dhk",
      },
      {
        description: "Token governance for Junoswap",
        denom_units: [
          {
            denom:
              "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
            exponent: 0,
            aliases: [
              "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            ],
          },
          {
            denom: "raw",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
        base: "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
        name: "JunoSwap",
        display: "raw",
        symbol: "RAW",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.svg",
        },
        coingecko_id: "junoswap-raw-dao",
        keywords: ["osmosis-main", "osmosis-price:uosmo:700"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:raw",
      },
      {
        description:
          "Profit sharing token for Another.Software validator. Hold and receive dividends from Another.Software validator commissions!",
        denom_units: [
          {
            denom:
              "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
            exponent: 0,
            aliases: [
              "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            ],
          },
          {
            denom: "asvt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
        base: "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
        name: "Another.Software Validator Token",
        display: "asvt",
        symbol: "ASVT",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
        },
        keywords: [
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:771",
        ],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:asvt",
      },
      {
        description: "DAO dedicated to building tools on the Juno Network",
        denom_units: [
          {
            denom:
              "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
            exponent: 0,
            aliases: [
              "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            ],
          },
          {
            denom: "joe",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
        base: "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
        name: "JoeDAO",
        display: "joe",
        symbol: "JOE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:718"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:joe",
      },
      {
        description: "DeFi gaming platform built on Juno",
        denom_units: [
          {
            denom:
              "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
            exponent: 0,
            aliases: [
              "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            ],
          },
          {
            denom: "glto",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
        base: "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
        name: "Gelotto",
        display: "glto",
        symbol: "GLTO",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:778"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:glto",
      },
      {
        description: "Gelotto Year 1 Grand Prize Token",
        denom_units: [
          {
            denom:
              "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
            exponent: 0,
            aliases: [
              "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            ],
          },
          {
            denom: "gkey",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
        base: "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
        name: "GKey",
        display: "gkey",
        symbol: "GKEY",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:790"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:gkey",
      },
      {
        description: "Staking derivative seJUNO for staked JUNO",
        denom_units: [
          {
            denom:
              "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
            exponent: 0,
            aliases: [
              "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            ],
          },
          {
            denom: "sejuno",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
        base: "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
        name: "StakeEasy seJUNO",
        display: "sejuno",
        symbol: "SEJUNO",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.svg",
        },
        coingecko_id: "stakeeasy-juno-derivative",
        keywords: [
          "osmosis-price:ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED:807",
        ],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:sejuno",
      },
      {
        description: "Staking derivative bJUNO for staked JUNO",
        denom_units: [
          {
            denom:
              "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
            exponent: 0,
            aliases: [
              "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            ],
          },
          {
            denom: "bjuno",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
        base: "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
        name: "StakeEasy bJUNO",
        display: "bjuno",
        symbol: "BJUNO",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.svg",
        },
        coingecko_id: "stakeeasy-bjuno",
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
      },
      {
        description:
          "Solarbank DAO Governance Token for speeding up the shift to renewable and green energy",
        denom_units: [
          {
            denom:
              "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
            exponent: 0,
            aliases: [
              "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            ],
          },
          {
            denom: "solar",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
        base: "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
        name: "Solarbank DAO",
        display: "solar",
        symbol: "SOLAR",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:941"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:solar",
      },
      {
        description: "StakeEasy governance token",
        denom_units: [
          {
            denom:
              "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
            exponent: 0,
            aliases: [
              "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            ],
          },
          {
            denom: "seasy",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
        base: "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
        name: "StakeEasy SEASY",
        display: "seasy",
        symbol: "SEASY",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.svg",
        },
        coingecko_id: "seasy",
        keywords: ["osmosis-price:uosmo:808"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:seasy",
      },
      {
        description: "The native token cw20 for MuseDAO on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
            exponent: 0,
            aliases: [
              "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            ],
          },
          {
            denom: "muse",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
        base: "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
        name: "MuseDAO",
        display: "muse",
        symbol: "MUSE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
        },
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
      },
      {
        description: "The native token cw20 for Fanfury on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
            exponent: 0,
            aliases: [
              "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            ],
          },
          {
            denom: "fury",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
        base: "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
        name: "Fanfury",
        display: "fury",
        symbol: "FURY",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
        },
        coingecko_id: "fanfury",
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
      },
      {
        description: "The native token cw20 for PHMN on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
            exponent: 0,
            aliases: [
              "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            ],
          },
          {
            denom: "phmn",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
        base: "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        name: "POSTHUMAN",
        display: "phmn",
        symbol: "PHMN",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.svg",
        },
        coingecko_id: "posthuman",
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:1255",
        ],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:phmn",
      },
      {
        description: "The native token cw20 for Hopers on Juno Chain",
        denom_units: [
          {
            denom:
              "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
            exponent: 0,
            aliases: [
              "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            ],
          },
          {
            denom: "hopers",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
        base: "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
        name: "Hopers",
        display: "hopers",
        symbol: "HOPERS",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.svg",
        },
        coingecko_id: "hopers-io ",
        keywords: ["osmosis-price:uosmo:894"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:hopers",
      },
      {
        description: "WYND DAO Governance Token",
        denom_units: [
          {
            denom:
              "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
            exponent: 0,
            aliases: [
              "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            ],
          },
          {
            denom: "wynd",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
        base: "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
        name: "Wynd DAO Governance Token",
        display: "wynd",
        symbol: "WYND",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:902"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:wynd",
      },
      {
        description: "nRide Token",
        denom_units: [
          {
            denom:
              "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
            exponent: 0,
            aliases: [
              "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            ],
          },
          {
            denom: "nride",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
        base: "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
        name: "nRide Token",
        display: "nride",
        symbol: "NRIDE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:924"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:nride",
      },
      {
        description:
          "Inspired by Bonk. A community project to celebrate the settlers of JunoNetwork.",
        denom_units: [
          {
            denom:
              "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
            exponent: 0,
            aliases: [
              "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            ],
          },
          {
            denom: "fox",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
        base: "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
        name: "Juno Fox",
        display: "fox",
        symbol: "FOX",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:949"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:fox",
      },
      {
        description: "Evmos Guardians governance token.",
        denom_units: [
          {
            denom:
              "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
            exponent: 0,
            aliases: [
              "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            ],
          },
          {
            denom: "grdn",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
        base: "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
        name: "Guardian",
        display: "grdn",
        symbol: "GRDN",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
        },
        keywords: ["osmosis-price:uosmo:959"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:grdn",
      },
      {
        description: "Mini Punks Token",
        denom_units: [
          {
            denom:
              "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
            exponent: 0,
            aliases: [
              "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            ],
          },
          {
            denom: "mnpu",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
        base: "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
        name: "Mini Punks",
        display: "mnpu",
        symbol: "MNPU",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.svg",
        },
        keywords: ["osmosis-price:uosmo:961"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:mnpu",
      },
      {
        description: "Shiba Cosmos",
        denom_units: [
          {
            denom:
              "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
            exponent: 0,
            aliases: [
              "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            ],
          },
          {
            denom: "shibac",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
        base: "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
        name: "ShibaCosmos",
        display: "shibac",
        symbol: "SHIBAC",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
        },
        keywords: ["osmosis-price:uosmo:962"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:shibac",
      },
      {
        description: "Sikoba Governance Token",
        denom_units: [
          {
            denom:
              "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
            exponent: 0,
            aliases: [
              "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            ],
          },
          {
            denom: "sikoba",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
        base: "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
        name: "Sikoba Token",
        display: "sikoba",
        symbol: "SKOJ",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:964"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:skoj",
      },
      {
        description: "Celestims",
        denom_units: [
          {
            denom:
              "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
            exponent: 0,
            aliases: [
              "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            ],
          },
          {
            denom: "clst",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
        base: "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
        name: "Celestims",
        display: "clst",
        symbol: "CLST",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
        },
        keywords: ["osmosis-price:uosmo:974"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:clst",
      },
      {
        description: "The First Doge on Osmosis",
        denom_units: [
          {
            denom:
              "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
            exponent: 0,
            aliases: [
              "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            ],
          },
          {
            denom: "osdoge",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
        base: "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
        name: "Osmosis Doge",
        display: "osdoge",
        symbol: "OSDOGE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
        },
        keywords: ["osmosis-price:uosmo:975"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:osdoge",
      },
      {
        description: "Apemos",
        denom_units: [
          {
            denom:
              "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
            exponent: 0,
            aliases: [
              "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            ],
          },
          {
            denom: "apemos",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
        base: "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
        name: "Apemos",
        display: "apemos",
        symbol: "APEMOS",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
        },
        keywords: ["osmosis-price:uosmo:977"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:apemos",
      },
      {
        description: "Evmos Guardians' Invaders DAO token.",
        denom_units: [
          {
            denom:
              "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
            exponent: 0,
            aliases: [
              "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            ],
          },
          {
            denom: "invdrs",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
        base: "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
        name: "Invaders",
        display: "invdrs",
        symbol: "INVDRS",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
        },
        keywords: ["osmosis-price:uosmo:969"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:invdrs",
      },
      {
        description: "Doge Apr",
        denom_units: [
          {
            denom:
              "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
            exponent: 0,
            aliases: [
              "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            ],
          },
          {
            denom: "doga",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
        base: "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
        name: "Doge Apr",
        display: "doga",
        symbol: "DOGA",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
        },
        keywords: ["osmosis-price:uosmo:978"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:doga",
      },
      {
        description: "Catmos",
        denom_units: [
          {
            denom:
              "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
            exponent: 0,
            aliases: [
              "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            ],
          },
          {
            denom: "catmos",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
        base: "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
        name: "Catmos",
        display: "catmos",
        symbol: "CATMOS",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
        },
        keywords: ["osmosis-price:uosmo:981"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:catmos",
      },
      {
        description:
          "Social Impact DAO providing showers, meals, and vehicles to the homeless",
        denom_units: [
          {
            denom:
              "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
            exponent: 0,
            aliases: [
              "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            ],
          },
          {
            denom: "summit",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
        base: "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
        name: "Summit",
        display: "summit",
        symbol: "SUMMIT",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
        },
        keywords: ["osmosis-price:uosmo:982"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:summit",
      },
      {
        description: "Spacer",
        denom_units: [
          {
            denom:
              "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
            exponent: 0,
            aliases: [
              "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            ],
          },
          {
            denom: "spacer",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
        base: "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
        name: "Spacer",
        display: "spacer",
        symbol: "SPACER",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
        },
        keywords: ["osmosis-price:uosmo:993"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:spacer",
      },
      {
        description: "Light: LumenX community DAO treasury token",
        denom_units: [
          {
            denom:
              "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
            exponent: 0,
            aliases: [
              "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            ],
          },
          {
            denom: "light",
            exponent: 9,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
        base: "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
        name: "LIGHT",
        display: "light",
        symbol: "LIGHT",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
        },
        keywords: ["osmosis-price:uosmo:1009"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:light",
      },
      {
        description: "Mille: the 1000th token on osmosis",
        denom_units: [
          {
            denom:
              "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
            exponent: 0,
            aliases: [
              "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            ],
          },
          {
            denom: "mile",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
        base: "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
        name: "Mille",
        display: "mile",
        symbol: "MILE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
        },
        keywords: ["osmosis-price:uosmo:1000"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:mile",
      },
      {
        description:
          "Social Impact DAO dedicated to combatting food insecurity and malnutrition",
        denom_units: [
          {
            denom:
              "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
            exponent: 0,
            aliases: [
              "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            ],
          },
          {
            denom: "manna",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
        base: "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
        name: "Manna",
        display: "manna",
        symbol: "MANNA",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
        },
        keywords: ["osmosis-price:uosmo:997"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:manna",
      },
      {
        description: "Void",
        denom_units: [
          {
            denom:
              "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
            exponent: 0,
            aliases: [
              "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            ],
          },
          {
            denom: "void",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
        base: "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
        name: "Void",
        display: "void",
        symbol: "VOID",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
        },
        keywords: ["osmosis-price:uosmo:1003"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
      },
      {
        description: "Silica",
        denom_units: [
          {
            denom:
              "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
            exponent: 0,
            aliases: [
              "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            ],
          },
          {
            denom: "silica",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
        base: "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
        name: "Silica",
        display: "silica",
        symbol: "SLCA",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
        },
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F:1023",
        ],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:slca",
      },
      {
        description: "Pepec",
        denom_units: [
          {
            denom:
              "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
            exponent: 0,
            aliases: [
              "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            ],
          },
          {
            denom: "pepec",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
        base: "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
        name: "Pepec",
        display: "pepec",
        symbol: "PEPEC",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
        },
        keywords: ["osmosis-price:uosmo:1016"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:pepec",
      },
      {
        description:
          "An innovative DAO dedicated to housing the most vulnerable",
        denom_units: [
          {
            denom:
              "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
            exponent: 0,
            aliases: [
              "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            ],
          },
          {
            denom: "casa",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
        base: "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
        name: "Casa",
        display: "casa",
        symbol: "CASA",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
        },
        keywords: ["osmosis-price:uosmo:1028"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:casa",
      },
      {
        description:
          "A revolutionary DAO created to bring clean drinking water to men, women, and children worldwide. We hope you join us on our journey!",
        denom_units: [
          {
            denom:
              "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
            exponent: 0,
            aliases: [
              "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            ],
          },
          {
            denom: "watr",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
        base: "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
        name: "WATR",
        display: "watr",
        symbol: "WATR",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
              port: "wasm.juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
              channel_id: "channel-47",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-169",
              path: "transfer/channel-169/cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
        },
        keywords: ["osmosis-price:uosmo:1071"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:watr",
      },
      {
        denom_units: [
          {
            denom:
              "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
            exponent: 0,
            aliases: [
              "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            ],
          },
          {
            denom: "dgl",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e",
        base: "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
        name: "Licorice",
        display: "dgl",
        symbol: "DGL",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "juno",
              base_denom:
                "factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-42",
              path: "transfer/channel-42/factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:1143"],
        origin_chain_id: "juno-1",
        origin_chain_name: "juno",
        price_coin_id: "pool:dgl",
      },
    ],
  },
  {
    chain_name: "evmos",
    chain_id: "evmos_9001-2",
    assets: [
      {
        description:
          "The native EVM, governance and staking token of the Evmos Hub",
        denom_units: [
          {
            denom:
              "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
            exponent: 0,
            aliases: ["aevmos"],
          },
          {
            denom: "evmos",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        name: "Evmos",
        display: "evmos",
        symbol: "EVMOS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "evmos",
              base_denom: "aevmos",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-204",
              path: "transfer/channel-204/aevmos",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
        },
        coingecko_id: "evmos",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:722"],
        origin_chain_id: "evmos_9001-2",
        origin_chain_name: "evmos",
        price_coin_id: "pool:aevmos",
      },
      {
        description: "The token of Neokingdom DAO.",
        denom_units: [
          {
            denom:
              "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
            exponent: 0,
            aliases: ["erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9"],
          },
          {
            denom: "neok",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
        name: "Neokingdom DAO",
        display: "neok",
        symbol: "NEOK",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "evmos",
              base_denom: "erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-204",
              path: "transfer/channel-204/erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:1121"],
        origin_chain_id: "evmos_9001-2",
        origin_chain_name: "evmos",
        price_coin_id: "pool:aneok",
      },
    ],
  },
  {
    chain_name: "kava",
    chain_id: "kava_2222-10",
    assets: [
      {
        description: "The native staking and governance token of Kava",
        denom_units: [
          {
            denom:
              "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
            exponent: 0,
            aliases: ["ukava"],
          },
          {
            denom: "kava",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
        name: "Kava",
        display: "kava",
        symbol: "KAVA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kava",
              base_denom: "ukava",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-143",
              path: "transfer/channel-143/ukava",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.svg",
        },
        coingecko_id: "kava",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:730"],
        origin_chain_id: "kava_2222-10",
        origin_chain_name: "kava",
        price_coin_id: "pool:ukava",
      },
      {
        description: "Governance token of Kava Lend Protocol",
        denom_units: [
          {
            denom:
              "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
            exponent: 0,
            aliases: ["hard"],
          },
          {
            denom: "HARD",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
        name: "Hard",
        display: "HARD",
        symbol: "HARD",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kava",
              base_denom: "hard",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-143",
              path: "transfer/channel-143/hard",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.svg",
        },
        coingecko_id: "kava-lend",
        origin_chain_id: "kava_2222-10",
        origin_chain_name: "kava",
      },
      {
        description: "Governance token of Kava Swap Protocol",
        denom_units: [
          {
            denom:
              "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
            exponent: 0,
            aliases: ["swp"],
          },
          {
            denom: "SWP",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
        name: "Swap",
        display: "SWP",
        symbol: "SWP",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kava",
              base_denom: "swp",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-143",
              path: "transfer/channel-143/swp",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.svg",
        },
        coingecko_id: "kava-swap",
        origin_chain_id: "kava_2222-10",
        origin_chain_name: "kava",
      },
      {
        description: "The native stablecoin of Kava",
        denom_units: [
          {
            denom:
              "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
            exponent: 0,
            aliases: ["usdx"],
          },
          {
            denom: "USDX",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
        name: "USDX",
        display: "USDX",
        symbol: "USDX",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kava",
              base_denom: "usdx",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-143",
              path: "transfer/channel-143/usdx",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.svg",
        },
        coingecko_id: "usdx",
        keywords: [
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:792",
        ],
        origin_chain_id: "kava_2222-10",
        origin_chain_name: "kava",
      },
      {
        description:
          "Tether gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
        denom_units: [
          {
            denom:
              "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
            exponent: 0,
            aliases: ["erc20/tether/usdt"],
          },
          {
            denom: "usdt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        name: "Tether USD",
        display: "usdt",
        symbol: "USDT",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Tether",
          },
          {
            type: "additional-mintage",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            provider: "Tether",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "kava",
              base_denom: "erc20/tether/usdt",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-143",
              path: "transfer/channel-143/erc20/tether/usdt",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg",
        },
        keywords: ["osmosis-main", "peg:collateralized"],
        origin_chain_id: "kava_2222-10",
        origin_chain_name: "kava",
        price_coin_id: "pool:kava.uusdt",
      },
    ],
  },
  {
    chain_name: "secretnetwork",
    chain_id: "secret-4",
    assets: [
      {
        description: "The native token of Secret Network",
        denom_units: [
          {
            denom:
              "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
            exponent: 0,
            aliases: ["uscrt"],
          },
          {
            denom: "scrt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        name: "Secret Network",
        display: "scrt",
        symbol: "SCRT",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "uscrt",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-88",
              path: "transfer/channel-88/uscrt",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
        },
        coingecko_id: "secret",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:584"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
        price_coin_id: "pool:uscrt",
      },
      {
        description: "The native token cw20 for Alter on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
            exponent: 0,
            aliases: ["cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej"],
          },
          {
            denom: "alter",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
        name: "Alter",
        display: "alter",
        symbol: "ALTER",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
        },
        coingecko_id: "alter",
        keywords: ["osmosis-price:uosmo:845"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
        price_coin_id: "pool:alter",
      },
      {
        description: "The native token cw20 for Button on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
            exponent: 0,
            aliases: ["cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt"],
          },
          {
            denom: "butt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        base: "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
        name: "Button",
        display: "butt",
        symbol: "BUTT",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
        },
        coingecko_id: "buttcoin-2",
        keywords: ["osmosis-price:uosmo:985"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
      },
      {
        description: "The native token cw20 for Shade on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
            exponent: 0,
            aliases: ["cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d"],
          },
          {
            denom: "shd",
            exponent: 8,
          },
        ],
        type_asset: "ics20",
        address: "secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        base: "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
        name: "Shade (old)",
        display: "shd",
        symbol: "SHD(old)",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
        },
        keywords: ["osmosis-price:uosmo:846"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
        price_coin_id: "pool:shdold",
      },
      {
        description: "The native token cw20 for SIENNA on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
            exponent: 0,
            aliases: ["cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4"],
          },
          {
            denom: "sienna",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        address: "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        base: "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
        name: "SIENNA",
        display: "sienna",
        symbol: "SIENNA",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
        },
        coingecko_id: "sienna",
        keywords: ["osmosis-price:uosmo:853"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
      },
      {
        description:
          "The native token cw20 for SCRT Staking Derivatives on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
            exponent: 0,
            aliases: ["cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4"],
          },
          {
            denom: "stkd-scrt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        base: "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
        name: "SCRT Staking Derivatives",
        display: "stkd-scrt",
        symbol: "stkd-SCRT",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
        },
        coingecko_id: "stkd-scrt",
        keywords: [
          "osmosis-price:ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A:854",
        ],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
      },
      {
        description: "The native token cw20 for Amber on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
            exponent: 0,
            aliases: ["cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852"],
          },
          {
            denom: "amber",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
        base: "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
        name: "Amber",
        display: "amber",
        symbol: "AMBER",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
        },
        keywords: ["osmosis-price:uosmo:984"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
      },
      {
        description: "The native token cw20 for Silk on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
            exponent: 0,
            aliases: ["cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd"],
          },
          {
            denom: "silk",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
        base: "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
        name: "Silk",
        display: "silk",
        symbol: "SILK",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
        },
        keywords: ["osmosis-main", "osmosis-price:uosmo:1005"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
        price_coin_id: "pool:silk",
      },
      {
        description: "The native token cw20 for Shade on Secret Network",
        denom_units: [
          {
            denom:
              "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
            exponent: 0,
            aliases: ["cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm"],
          },
          {
            denom: "shd",
            exponent: 8,
          },
        ],
        type_asset: "ics20",
        address: "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
        base: "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
        name: "Shade",
        display: "shd",
        symbol: "SHD",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "secretnetwork",
              base_denom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
              port: "wasm.secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
              channel_id: "channel-44",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-476",
              path: "transfer/channel-476/cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
        },
        coingecko_id: "shade-protocol",
        keywords: ["osmosis-main", "osmosis-price:uosmo:1004"],
        origin_chain_id: "secret-4",
        origin_chain_name: "secretnetwork",
        price_coin_id: "pool:shd",
      },
    ],
  },
  {
    chain_name: "stargaze",
    chain_id: "stargaze-1",
    assets: [
      {
        description: "The native token of Stargaze",
        denom_units: [
          {
            denom:
              "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
            exponent: 0,
            aliases: ["ustars"],
          },
          {
            denom: "stars",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        name: "Stargaze",
        display: "stars",
        symbol: "STARS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "stargaze",
              base_denom: "ustars",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-75",
              path: "transfer/channel-75/ustars",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg",
        },
        coingecko_id: "stargaze",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:604"],
        origin_chain_id: "stargaze-1",
        origin_chain_name: "stargaze",
        price_coin_id: "pool:ustars",
      },
      {
        description: "The native token of ohhNFT.",
        denom_units: [
          {
            denom:
              "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
            exponent: 0,
            aliases: [
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
            ],
          },
          {
            denom: "strdst",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        name: "Stardust STRDST",
        display: "strdst",
        symbol: "STRDST",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "stargaze",
              base_denom:
                "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-75",
              path: "transfer/channel-75/factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4:1234",
        ],
        origin_chain_id: "stargaze-1",
        origin_chain_name: "stargaze",
        price_coin_id: "pool:ustrdst",
      },
      {
        description: "ohhNFT LP token.",
        denom_units: [
          {
            denom:
              "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
            exponent: 0,
            aliases: [
              "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
            ],
          },
          {
            denom: "BRNCH",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
        name: "Branch",
        display: "BRNCH",
        symbol: "BRNCH",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "stargaze",
              base_denom:
                "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-75",
              path: "transfer/channel-75/factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.svg",
        },
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B:1288",
        ],
        origin_chain_id: "stargaze-1",
        origin_chain_name: "stargaze",
      },
    ],
  },
  {
    chain_name: "chihuahua",
    chain_id: "chihuahua-1",
    assets: [
      {
        description: "The native token of Chihuahua Chain",
        denom_units: [
          {
            denom:
              "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
            exponent: 0,
            aliases: ["uhuahua"],
          },
          {
            denom: "huahua",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        name: "Chihuahua",
        display: "huahua",
        symbol: "HUAHUA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "chihuahua",
              base_denom: "uhuahua",
              channel_id: "channel-7",
            },
            chain: {
              channel_id: "channel-113",
              path: "transfer/channel-113/uhuahua",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.svg",
        },
        coingecko_id: "chihuahua-token",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:605"],
        origin_chain_id: "chihuahua-1",
        origin_chain_name: "chihuahua",
        price_coin_id: "pool:uhuahua",
      },
    ],
  },
  {
    chain_name: "persistence",
    chain_id: "core-1",
    assets: [
      {
        description:
          "The XPRT token is primarily a governance token for the Persistence chain.",
        denom_units: [
          {
            denom:
              "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
            exponent: 0,
            aliases: ["uxprt"],
          },
          {
            denom: "xprt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        name: "Persistence",
        display: "xprt",
        symbol: "XPRT",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "persistence",
              base_denom: "uxprt",
              channel_id: "channel-6",
            },
            chain: {
              channel_id: "channel-4",
              path: "transfer/channel-4/uxprt",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
        },
        coingecko_id: "persistence",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:15"],
        origin_chain_id: "core-1",
        origin_chain_name: "persistence",
        price_coin_id: "pool:uxprt",
      },
      {
        description:
          "pSTAKE is a liquid staking protocol unlocking the liquidity of staked assets.",
        denom_units: [
          {
            denom:
              "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
            exponent: 0,
            aliases: [
              "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
              "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
              "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
            ],
          },
          {
            denom: "pstake",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
        name: "pSTAKE Finance",
        display: "pstake",
        symbol: "PSTAKE",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "persistence",
              base_denom: "uxprt",
            },
            provider: "Persistence",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
              channel_id: "channel-24",
            },
            chain: {
              channel_id: "channel-38",
              path: "transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "persistence",
              base_denom:
                "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
              channel_id: "channel-6",
            },
            chain: {
              channel_id: "channel-4",
              path: "transfer/channel-4/transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
        },
        keywords: [
          "canon",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:648",
        ],
        origin_chain_id: "core-1",
        origin_chain_name: "persistence",
        price_coin_id: "pool:pstake",
      },
      {
        description: "PSTAKE Liquid-Staked ATOM",
        denom_units: [
          {
            denom:
              "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
            exponent: 0,
            aliases: ["stk/uatom"],
          },
          {
            denom: "stkatom",
            exponent: 6,
            aliases: ["stk/atom"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
        name: "PSTAKE staked ATOM",
        display: "stkatom",
        symbol: "stkATOM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "persistence",
              base_denom: "stk/uatom",
              channel_id: "channel-6",
            },
            chain: {
              channel_id: "channel-4",
              path: "transfer/channel-4/stk/uatom",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
        },
        coingecko_id: "stkatom",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:886",
        ],
        origin_chain_id: "core-1",
        origin_chain_name: "persistence",
        price_coin_id: "pool:stk/uatom",
      },
    ],
  },
  {
    chain_name: "gravitybridge",
    chain_id: "gravity-bridge-3",
    assets: [
      {
        description:
          "pSTAKE is a liquid staking protocol unlocking the liquidity of staked assets.",
        denom_units: [
          {
            denom:
              "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
            exponent: 0,
            aliases: [
              "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
              "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
              "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
            ],
          },
          {
            denom: "pstake",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
        name: "pSTAKE Finance",
        display: "pstake",
        symbol: "PSTAKE",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "persistence",
              base_denom: "uxprt",
            },
            provider: "Persistence",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
              channel_id: "channel-24",
            },
            chain: {
              channel_id: "channel-38",
              path: "transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "persistence",
              base_denom:
                "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
              channel_id: "channel-6",
            },
            chain: {
              channel_id: "channel-4",
              path: "transfer/channel-4/transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
        },
        keywords: [
          "canon",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:648",
        ],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
        price_coin_id: "pool:pstake",
      },
      {
        description: "The native token of Gravity Bridge",
        denom_units: [
          {
            denom:
              "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
            exponent: 0,
            aliases: ["ugraviton"],
          },
          {
            denom: "graviton",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        name: "Graviton",
        display: "graviton",
        symbol: "GRAV",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "ugraviton",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-144",
              path: "transfer/channel-144/ugraviton",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
        },
        coingecko_id: "graviton",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:625"],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
        price_coin_id: "pool:ugraviton",
      },
      {
        description: "Gravity Bridge WBTC",
        denom_units: [
          {
            denom:
              "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
            exponent: 0,
            aliases: ["gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"],
          },
          {
            denom: "gwbtc",
            exponent: 8,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
        name: "Wrapped Bitcoin",
        display: "gwbtc",
        symbol: "WBTC.grv",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "bitcoin",
              base_denom: "sat",
            },
            provider: "BitGo, Kyber, and Ren",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-144",
              path: "transfer/channel-144/gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.grv.svg",
        },
        keywords: [
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:694",
        ],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
      },
      {
        description: "Gravity Bridge WETH",
        denom_units: [
          {
            denom:
              "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
            exponent: 0,
            aliases: ["gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
          },
          {
            denom: "gweth",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
        name: "Wrapped Ethereum",
        display: "gweth",
        symbol: "WETH.grv",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Ethereum",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-144",
              path: "transfer/channel-144/gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/weth.grv.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:634"],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
        price_coin_id: "pool:weth-wei.grv",
      },
      {
        description: "Gravity Bridge USDC",
        denom_units: [
          {
            denom:
              "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
            exponent: 0,
            aliases: ["gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
          },
          {
            denom: "gusdc",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
        name: "USD Coin",
        display: "gusdc",
        symbol: "USDC.grv",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Circle",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-144",
              path: "transfer/channel-144/gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.grv.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:872",
          "peg:collateralized",
        ],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
        price_coin_id: "pool:uusdc.grv",
      },
      {
        description: "Gravity Bridge DAI",
        denom_units: [
          {
            denom:
              "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
            exponent: 0,
            aliases: ["gravity0x6B175474E89094C44Da98b954EedeAC495271d0F"],
          },
          {
            denom: "gdai",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
        name: "Dai Stablecoin",
        display: "gdai",
        symbol: "DAI.grv",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "MakerDAO",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x6b175474e89094c44da98b954eedeac495271d0f",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-144",
              path: "transfer/channel-144/gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/dai.grv.svg",
        },
        keywords: [
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:702",
          "peg:collateralized",
        ],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
      },
      {
        description: "Gravity Bridge USDT",
        denom_units: [
          {
            denom:
              "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
            exponent: 0,
            aliases: ["gravity0xdAC17F958D2ee523a2206206994597C13D831ec7"],
          },
          {
            denom: "gusdt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
        name: "Tether USD",
        display: "gusdt",
        symbol: "USDT.grv",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Tether",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
            provider: "Gravity Bridge",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gravitybridge",
              base_denom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-144",
              path: "transfer/channel-144/gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.grv.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4:873",
          "peg:collateralized",
        ],
        origin_chain_id: "gravity-bridge-3",
        origin_chain_name: "gravitybridge",
        price_coin_id: "pool:uusdt.grv",
      },
    ],
  },
  {
    chain_name: "akash",
    chain_id: "akashnet-2",
    assets: [
      {
        description:
          "Akash Token (AKT) is the Akash Network's native utility token, used as the primary means to govern, secure the blockchain, incentivize participants, and provide a default mechanism to store and exchange value.",
        denom_units: [
          {
            denom:
              "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
            exponent: 0,
            aliases: ["uakt"],
          },
          {
            denom: "akt",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
        name: "Akash Network",
        display: "akt",
        symbol: "AKT",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "akash",
              base_denom: "uakt",
              channel_id: "channel-9",
            },
            chain: {
              channel_id: "channel-1",
              path: "transfer/channel-1/uakt",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
        },
        coingecko_id: "akash-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:3"],
        origin_chain_id: "akashnet-2",
        origin_chain_name: "akash",
        price_coin_id: "pool:uakt",
      },
    ],
  },
  {
    chain_name: "regen",
    chain_id: "regen-1",
    assets: [
      {
        description: "REGEN coin is the token for the Regen Network Platform",
        denom_units: [
          {
            denom:
              "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
            exponent: 0,
            aliases: ["uregen"],
          },
          {
            denom: "regen",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        name: "Regen Network",
        display: "regen",
        symbol: "REGEN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "regen",
              base_denom: "uregen",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-8",
              path: "transfer/channel-8/uregen",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.svg",
        },
        coingecko_id: "regen",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:42"],
        origin_chain_id: "regen-1",
        origin_chain_name: "regen",
        price_coin_id: "pool:uregen",
      },
      {
        description:
          "Nature Carbon Ton (NCT) is a carbon token standard backed 1:1 by carbon credits issued by Verra, a global leader in the voluntary carbon market. NCT credits on Regen Network have been tokenized by Toucan.earth.",
        denom_units: [
          {
            denom:
              "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
            exponent: 0,
            aliases: ["eco.uC.NCT"],
          },
          {
            denom: "nct",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
        name: "Nature Carbon Ton",
        display: "nct",
        symbol: "NCT",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "regen",
              base_denom: "eco.uC.NCT",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-8",
              path: "transfer/channel-8/eco.uC.NCT",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.svg",
        },
        coingecko_id: "toucan-protocol-nature-carbon-tonne",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076:972",
        ],
        origin_chain_id: "regen-1",
        origin_chain_name: "regen",
        price_coin_id: "pool:nct",
      },
    ],
  },
  {
    chain_name: "sentinel",
    chain_id: "sentinelhub-2",
    assets: [
      {
        description: "DVPN is the native token of the Sentinel Hub.",
        denom_units: [
          {
            denom:
              "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
            exponent: 0,
            aliases: ["udvpn"],
          },
          {
            denom: "dvpn",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
        name: "Sentinel",
        display: "dvpn",
        symbol: "DVPN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "sentinel",
              base_denom: "udvpn",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-2",
              path: "transfer/channel-2/udvpn",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.svg",
        },
        coingecko_id: "sentinel",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:6",
        ],
        origin_chain_id: "sentinelhub-2",
        origin_chain_name: "sentinel",
        price_coin_id: "pool:udvpn",
      },
    ],
  },
  {
    chain_name: "irisnet",
    chain_id: "irishub-1",
    assets: [
      {
        description:
          "The IRIS token is the native governance token for the IrisNet chain.",
        denom_units: [
          {
            denom:
              "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
            exponent: 0,
            aliases: ["uiris"],
          },
          {
            denom: "iris",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
        name: "IRISnet",
        display: "iris",
        symbol: "IRIS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "irisnet",
              base_denom: "uiris",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-6",
              path: "transfer/channel-6/uiris",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.svg",
        },
        coingecko_id: "iris-network",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:8",
        ],
        origin_chain_id: "irishub-1",
        origin_chain_name: "irisnet",
        price_coin_id: "pool:uiris",
      },
    ],
  },
  {
    chain_name: "starname",
    chain_id: "iov-mainnet-ibc",
    assets: [
      {
        description:
          "IOV coin is the token for the Starname (IOV) Asset Name Service",
        denom_units: [
          {
            denom:
              "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
            exponent: 0,
            aliases: ["uiov"],
          },
          {
            denom: "iov",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
        name: "Starname",
        display: "iov",
        symbol: "IOV",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "starname",
              base_denom: "uiov",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-15",
              path: "transfer/channel-15/uiov",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.svg",
        },
        coingecko_id: "starname",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:197"],
        origin_chain_id: "iov-mainnet-ibc",
        origin_chain_name: "starname",
        price_coin_id: "pool:uiov",
      },
    ],
  },
  {
    chain_name: "emoney",
    chain_id: "emoney-3",
    assets: [
      {
        description:
          "e-Money NGM staking token. In addition to earning staking rewards the token is bought back and burned based on e-Money stablecoin inflation.",
        denom_units: [
          {
            denom:
              "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
            exponent: 0,
            aliases: ["ungm"],
          },
          {
            denom: "ngm",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
        name: "e-Money",
        display: "ngm",
        symbol: "NGM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "emoney",
              base_denom: "ungm",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-37",
              path: "transfer/channel-37/ungm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.svg",
        },
        coingecko_id: "e-money",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:463"],
        origin_chain_id: "emoney-3",
        origin_chain_name: "emoney",
        price_coin_id: "pool:ungm",
      },
      {
        description:
          "e-Money EUR stablecoin. Audited and backed by fiat EUR deposits and government bonds.",
        denom_units: [
          {
            denom:
              "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
            exponent: 0,
            aliases: ["eeur"],
          },
          {
            denom: "eur",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
        name: "e-Money EUR",
        display: "eur",
        symbol: "EEUR",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "emoney",
              base_denom: "eeur",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-37",
              path: "transfer/channel-37/eeur",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.svg",
        },
        coingecko_id: "e-money-eur",
        keywords: ["osmosis-info", "osmosis-price:uosmo:481"],
        origin_chain_id: "emoney-3",
        origin_chain_name: "emoney",
        price_coin_id: "pool:eeur",
      },
    ],
  },
  {
    chain_name: "likecoin",
    chain_id: "likecoin-mainnet-2",
    assets: [
      {
        description:
          "LIKE is the native staking and governance token of LikeCoin chain, a Decentralized Publishing Infrastructure to empower content ownership, authenticity, and provenance.",
        denom_units: [
          {
            denom:
              "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
            exponent: 0,
            aliases: ["nanolike"],
          },
          {
            denom: "like",
            exponent: 9,
          },
        ],
        type_asset: "ics20",
        base: "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
        name: "LikeCoin",
        display: "like",
        symbol: "LIKE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "likecoin",
              base_denom: "nanolike",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-53",
              path: "transfer/channel-53/nanolike",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.svg",
        },
        coingecko_id: "likecoin",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:553"],
        origin_chain_id: "likecoin-mainnet-2",
        origin_chain_name: "likecoin",
        price_coin_id: "pool:nanolike",
      },
    ],
  },
  {
    chain_name: "impacthub",
    chain_id: "ixo-5",
    assets: [
      {
        description: "The native token of IXO Chain",
        denom_units: [
          {
            denom:
              "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
            exponent: 0,
            aliases: ["uixo"],
          },
          {
            denom: "ixo",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
        name: "IXO",
        display: "ixo",
        symbol: "IXO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "impacthub",
              base_denom: "uixo",
              channel_id: "channel-4",
            },
            chain: {
              channel_id: "channel-38",
              path: "transfer/channel-38/uixo",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.svg",
        },
        coingecko_id: "ixo",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:558",
        ],
        origin_chain_id: "ixo-5",
        origin_chain_name: "impacthub",
        price_coin_id: "pool:uixo",
      },
    ],
  },
  {
    chain_name: "bitcanna",
    chain_id: "bitcanna-1",
    assets: [
      {
        description:
          "The BCNA coin is the transactional token within the BitCanna network, serving the legal cannabis industry through its payment network, supply chain and trust network.",
        denom_units: [
          {
            denom:
              "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
            exponent: 0,
            aliases: ["ubcna"],
          },
          {
            denom: "bcna",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
        name: "BitCanna",
        display: "bcna",
        symbol: "BCNA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "bitcanna",
              base_denom: "ubcna",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-51",
              path: "transfer/channel-51/ubcna",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg",
        },
        coingecko_id: "bitcanna",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:572",
        ],
        origin_chain_id: "bitcanna-1",
        origin_chain_name: "bitcanna",
        price_coin_id: "pool:ubcna",
      },
    ],
  },
  {
    chain_name: "bitsong",
    chain_id: "bitsong-2b",
    assets: [
      {
        description: "BitSong Native Token",
        denom_units: [
          {
            denom:
              "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
            exponent: 0,
            aliases: ["ubtsg"],
          },
          {
            denom: "btsg",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        name: "BitSong",
        display: "btsg",
        symbol: "BTSG",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "bitsong",
              base_denom: "ubtsg",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-73",
              path: "transfer/channel-73/ubtsg",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.svg",
        },
        coingecko_id: "bitsong",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:574",
        ],
        origin_chain_id: "bitsong-2b",
        origin_chain_name: "bitsong",
        price_coin_id: "pool:ubtsg",
      },
    ],
  },
  {
    chain_name: "kichain",
    chain_id: "kichain-2",
    assets: [
      {
        description: "The native token of Ki Chain",
        denom_units: [
          {
            denom:
              "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
            exponent: 0,
            aliases: ["uxki"],
          },
          {
            denom: "xki",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
        name: "Ki",
        display: "xki",
        symbol: "XKI",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kichain",
              base_denom: "uxki",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-77",
              path: "transfer/channel-77/uxki",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.svg",
        },
        coingecko_id: "ki",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:577"],
        origin_chain_id: "kichain-2",
        origin_chain_name: "kichain",
        price_coin_id: "pool:uxki",
      },
      {
        description: "ELEVENPARIS loyalty token on KiChain",
        denom_units: [
          {
            denom:
              "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
            exponent: 0,
            aliases: [
              "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
            ],
          },
          {
            denom: "lvn",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
        base: "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
        name: "LVN",
        display: "lvn",
        symbol: "LVN",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "kichain",
              base_denom:
                "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
              port: "wasm.ki1hzz0s0ucrhdp6tue2lxk3c03nj6f60qy463we7lgx0wudd72ctmsd9kgha",
              channel_id: "channel-18",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-261",
              path: "transfer/channel-261/cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/lvn.png",
        },
        coingecko_id: "lvn",
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E:772",
        ],
        origin_chain_id: "kichain-2",
        origin_chain_name: "kichain",
      },
    ],
  },
  {
    chain_name: "panacea",
    chain_id: "panacea-3",
    assets: [
      {
        description:
          "Panacea is a public blockchain launched by MediBloc, which is the key infrastructure for reinventing the patient-centered healthcare data ecosystem",
        denom_units: [
          {
            denom:
              "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
            exponent: 0,
            aliases: ["umed"],
          },
          {
            denom: "med",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
        name: "MediBloc",
        display: "med",
        symbol: "MED",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "panacea",
              base_denom: "umed",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-82",
              path: "transfer/channel-82/umed",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.svg",
        },
        coingecko_id: "medibloc",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:587",
        ],
        origin_chain_id: "panacea-3",
        origin_chain_name: "panacea",
        price_coin_id: "pool:umed",
      },
    ],
  },
  {
    chain_name: "bostrom",
    chain_id: "bostrom",
    assets: [
      {
        description: "The staking token of Bostrom",
        denom_units: [
          {
            denom:
              "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
            exponent: 0,
            aliases: ["boot"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        name: "Bostrom",
        display: "boot",
        symbol: "BOOT",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "bostrom",
              base_denom: "boot",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-95",
              path: "transfer/channel-95/boot",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.svg",
        },
        coingecko_id: "bostrom",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5:912",
        ],
        origin_chain_id: "bostrom",
        origin_chain_name: "bostrom",
        price_coin_id: "pool:boot",
      },
    ],
  },
  {
    chain_name: "comdex",
    chain_id: "comdex-1",
    assets: [
      {
        description: "Native Token of Comdex Protocol",
        denom_units: [
          {
            denom:
              "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
            exponent: 0,
            aliases: ["ucmdx"],
          },
          {
            denom: "cmdx",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        name: "Comdex",
        display: "cmdx",
        symbol: "CMDX",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "comdex",
              base_denom: "ucmdx",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-87",
              path: "transfer/channel-87/ucmdx",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
        },
        coingecko_id: "comdex",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:600",
        ],
        origin_chain_id: "comdex-1",
        origin_chain_name: "comdex",
        price_coin_id: "pool:ucmdx",
      },
      {
        description: "Stable Token of Harbor protocol on Comdex network",
        denom_units: [
          {
            denom:
              "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
            exponent: 0,
            aliases: ["ucmst"],
          },
          {
            denom: "cmst",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
        name: "CMST",
        display: "cmst",
        symbol: "CMST",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "comdex",
              base_denom: "ucmst",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-87",
              path: "transfer/channel-87/ucmst",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.svg",
        },
        coingecko_id: "composite",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:857",
          "peg:collateralized",
        ],
        origin_chain_id: "comdex-1",
        origin_chain_name: "comdex",
        price_coin_id: "pool:ucmst",
      },
      {
        description: "Governance Token of Harbor protocol on Comdex network",
        denom_units: [
          {
            denom:
              "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
            exponent: 0,
            aliases: ["uharbor"],
          },
          {
            denom: "harbor",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
        name: "Harbor",
        display: "harbor",
        symbol: "HARBOR",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "comdex",
              base_denom: "uharbor",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-87",
              path: "transfer/channel-87/uharbor",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.svg",
        },
        keywords: ["osmosis-price:uosmo:967"],
        origin_chain_id: "comdex-1",
        origin_chain_name: "comdex",
        price_coin_id: "pool:uharbor",
      },
    ],
  },
  {
    chain_name: "cheqd",
    chain_id: "cheqd-mainnet-1",
    assets: [
      {
        description: "Native token for the cheqd network",
        denom_units: [
          {
            denom:
              "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
            exponent: 0,
            aliases: ["ncheq"],
          },
          {
            denom: "cheq",
            exponent: 9,
          },
        ],
        type_asset: "ics20",
        base: "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
        name: "cheqd",
        display: "cheq",
        symbol: "CHEQ",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "cheqd",
              base_denom: "ncheq",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-108",
              path: "transfer/channel-108/ncheq",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.svg",
        },
        coingecko_id: "cheqd-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:602"],
        origin_chain_id: "cheqd-mainnet-1",
        origin_chain_name: "cheqd",
        price_coin_id: "pool:ncheq",
      },
    ],
  },
  {
    chain_name: "lumnetwork",
    chain_id: "lum-network-1",
    assets: [
      {
        description: "Native token of the Lum Network",
        denom_units: [
          {
            denom:
              "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
            exponent: 0,
            aliases: ["ulum"],
          },
          {
            denom: "lum",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
        name: "Lum",
        display: "lum",
        symbol: "LUM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "lumnetwork",
              base_denom: "ulum",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-115",
              path: "transfer/channel-115/ulum",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.svg",
        },
        coingecko_id: "lum-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:608"],
        origin_chain_id: "lum-network-1",
        origin_chain_name: "lumnetwork",
        price_coin_id: "pool:ulum",
      },
    ],
  },
  {
    chain_name: "vidulum",
    chain_id: "vidulum-1",
    assets: [
      {
        description: "The native token of Vidulum",
        denom_units: [
          {
            denom:
              "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
            exponent: 0,
            aliases: ["uvdl"],
          },
          {
            denom: "vdl",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
        name: "Vidulum",
        display: "vdl",
        symbol: "VDL",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "vidulum",
              base_denom: "uvdl",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-124",
              path: "transfer/channel-124/uvdl",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.svg",
        },
        coingecko_id: "vidulum",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:613"],
        origin_chain_id: "vidulum-1",
        origin_chain_name: "vidulum",
        price_coin_id: "pool:uvdl",
      },
    ],
  },
  {
    chain_name: "desmos",
    chain_id: "desmos-mainnet",
    assets: [
      {
        description: "The native token of Desmos",
        denom_units: [
          {
            denom:
              "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
            exponent: 0,
            aliases: ["udsm"],
          },
          {
            denom: "dsm",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
        name: "Desmos",
        display: "dsm",
        symbol: "DSM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "desmos",
              base_denom: "udsm",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-135",
              path: "transfer/channel-135/udsm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
        },
        coingecko_id: "desmos",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:619"],
        origin_chain_id: "desmos-mainnet",
        origin_chain_name: "desmos",
        price_coin_id: "pool:udsm",
      },
    ],
  },
  {
    chain_name: "dig",
    chain_id: "dig-1",
    assets: [
      {
        description: "Native token of Dig Chain",
        denom_units: [
          {
            denom:
              "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
            exponent: 0,
            aliases: ["udig"],
          },
          {
            denom: "dig",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
        name: "Dig Chain",
        display: "dig",
        symbol: "DIG",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "dig",
              base_denom: "udig",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-128",
              path: "transfer/channel-128/udig",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
        },
        coingecko_id: "dig-chain",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:621",
          "osmosis-unstable",
        ],
        origin_chain_id: "dig-1",
        origin_chain_name: "dig",
        price_coin_id: "pool:udig",
      },
    ],
  },
  {
    chain_name: "sommelier",
    chain_id: "sommelier-3",
    assets: [
      {
        description:
          "Somm Token (SOMM) is the native staking token of the Sommelier Chain",
        denom_units: [
          {
            denom:
              "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
            exponent: 0,
            aliases: ["microsomm", "usomm"],
          },
          {
            denom: "msomm",
            exponent: 3,
            aliases: ["millisomm"],
          },
          {
            denom: "somm",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        name: "Somm",
        display: "somm",
        symbol: "SOMM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "sommelier",
              base_denom: "usomm",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-165",
              path: "transfer/channel-165/usomm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
        },
        coingecko_id: "sommelier",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:627"],
        origin_chain_id: "sommelier-3",
        origin_chain_name: "sommelier",
        price_coin_id: "pool:usomm",
      },
    ],
  },
  {
    chain_name: "bandchain",
    chain_id: "laozi-mainnet",
    assets: [
      {
        description: "The native token of BandChain",
        denom_units: [
          {
            denom:
              "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
            exponent: 0,
            aliases: ["uband"],
          },
          {
            denom: "band",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
        name: "Band Protocol",
        display: "band",
        symbol: "BAND",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "bandchain",
              base_denom: "uband",
              channel_id: "channel-83",
            },
            chain: {
              channel_id: "channel-148",
              path: "transfer/channel-148/uband",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.svg",
        },
        coingecko_id: "band-protocol",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:626"],
        origin_chain_id: "laozi-mainnet",
        origin_chain_name: "bandchain",
        price_coin_id: "pool:uband",
      },
    ],
  },
  {
    chain_name: "konstellation",
    chain_id: "darchub",
    assets: [
      {
        description: "The native token of Konstellation Network",
        denom_units: [
          {
            denom:
              "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
            exponent: 0,
            aliases: ["udarc"],
          },
          {
            denom: "darc",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
        name: "DARC",
        display: "darc",
        symbol: "DARC",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "konstellation",
              base_denom: "udarc",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-171",
              path: "transfer/channel-171/udarc",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.svg",
        },
        coingecko_id: "darcmatter-coin",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:637"],
        origin_chain_id: "darchub",
        origin_chain_name: "konstellation",
        price_coin_id: "pool:udarc",
      },
    ],
  },
  {
    chain_name: "umee",
    chain_id: "umee-1",
    assets: [
      {
        description: "The native token of Umee",
        denom_units: [
          {
            denom:
              "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
            exponent: 0,
            aliases: ["uumee"],
          },
          {
            denom: "umee",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        name: "Umee",
        display: "umee",
        symbol: "UMEE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "umee",
              base_denom: "uumee",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-184",
              path: "transfer/channel-184/uumee",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.svg",
        },
        coingecko_id: "umee",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:641"],
        origin_chain_id: "umee-1",
        origin_chain_name: "umee",
        price_coin_id: "pool:uumee",
      },
    ],
  },
  {
    chain_name: "decentr",
    chain_id: "mainnet-3",
    assets: [
      {
        description: "The native token of Decentr",
        denom_units: [
          {
            denom:
              "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
            exponent: 0,
            aliases: ["udec"],
          },
          {
            denom: "dec",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
        name: "Decentr",
        display: "dec",
        symbol: "DEC",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "decentr",
              base_denom: "udec",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-181",
              path: "transfer/channel-181/udec",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.svg",
        },
        coingecko_id: "decentr",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:644"],
        origin_chain_id: "mainnet-3",
        origin_chain_name: "decentr",
        price_coin_id: "pool:udec",
      },
    ],
  },
  {
    chain_name: "carbon",
    chain_id: "carbon-1",
    assets: [
      {
        description: "The native governance token of Carbon",
        denom_units: [
          {
            denom:
              "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
            exponent: 0,
            aliases: ["swth"],
          },
          {
            denom: "dswth",
            exponent: 8,
            aliases: ["SWTH"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
        name: "Carbon",
        display: "dswth",
        symbol: "SWTH",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "carbon",
              base_denom: "swth",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-188",
              path: "transfer/channel-188/swth",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.svg",
        },
        coingecko_id: "switcheo",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:651"],
        origin_chain_id: "carbon-1",
        origin_chain_name: "carbon",
        price_coin_id: "pool:swth",
      },
    ],
  },
  {
    chain_name: "cerberus",
    chain_id: "cerberus-chain-1",
    assets: [
      {
        description: "The native token of Cerberus Chain",
        denom_units: [
          {
            denom:
              "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
            exponent: 0,
            aliases: ["ucrbrus"],
          },
          {
            denom: "crbrus",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
        name: "Cerberus",
        display: "crbrus",
        symbol: "CRBRUS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "cerberus",
              base_denom: "ucrbrus",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-212",
              path: "transfer/channel-212/ucrbrus",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg",
        },
        coingecko_id: "cerberus-2",
        keywords: [
          "osmosis-info",
          "osmosis-price:uosmo:662",
          "osmosis-unstable",
        ],
        origin_chain_id: "cerberus-chain-1",
        origin_chain_name: "cerberus",
        price_coin_id: "pool:ucrbrus",
      },
    ],
  },
  {
    chain_name: "fetchhub",
    chain_id: "fetchhub-4",
    assets: [
      {
        description:
          "The native staking and governance token of the Fetch Hub.",
        denom_units: [
          {
            denom:
              "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
            exponent: 0,
            aliases: ["afet"],
          },
          {
            denom: "fet",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
        name: "fetch-ai",
        display: "fet",
        symbol: "FET",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "fetchhub",
              base_denom: "afet",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-229",
              path: "transfer/channel-229/afet",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.svg",
        },
        coingecko_id: "fetch-ai",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:681"],
        origin_chain_id: "fetchhub-4",
        origin_chain_name: "fetchhub",
        price_coin_id: "pool:afet",
      },
    ],
  },
  {
    chain_name: "assetmantle",
    chain_id: "mantle-1",
    assets: [
      {
        description: "The native token of Asset Mantle",
        denom_units: [
          {
            denom:
              "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
            exponent: 0,
            aliases: ["umntl"],
          },
          {
            denom: "mntl",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
        name: "AssetMantle",
        display: "mntl",
        symbol: "MNTL",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "assetmantle",
              base_denom: "umntl",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-232",
              path: "transfer/channel-232/umntl",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.svg",
        },
        coingecko_id: "assetmantle",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:686",
        ],
        origin_chain_id: "mantle-1",
        origin_chain_name: "assetmantle",
        price_coin_id: "pool:umntl",
      },
    ],
  },
  {
    chain_name: "injective",
    chain_id: "injective-1",
    assets: [
      {
        description:
          "The INJ token is the native governance token for the Injective chain.",
        denom_units: [
          {
            denom:
              "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
            exponent: 0,
            aliases: ["inj"],
          },
          {
            denom: "INJ",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
        name: "Injective",
        display: "INJ",
        symbol: "INJ",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "injective",
              base_denom: "inj",
              channel_id: "channel-8",
            },
            chain: {
              channel_id: "channel-122",
              path: "transfer/channel-122/inj",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg",
        },
        coingecko_id: "injective-protocol",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:725"],
        origin_chain_id: "injective-1",
        origin_chain_name: "injective",
        price_coin_id: "pool:inj",
      },
    ],
  },
  {
    chain_name: "microtick",
    chain_id: "microtick-1",
    assets: [
      {
        description:
          "TICK coin is the token for the Microtick Price Discovery & Oracle App",
        denom_units: [
          {
            denom:
              "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
            exponent: 0,
            aliases: ["utick"],
          },
          {
            denom: "tick",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
        name: "Microtick",
        display: "tick",
        symbol: "TICK",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "microtick",
              base_denom: "utick",
              channel_id: "channel-16",
            },
            chain: {
              channel_id: "channel-39",
              path: "transfer/channel-39/utick",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.svg",
        },
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:547",
          "osmosis-unstable",
        ],
        origin_chain_id: "microtick-1",
        origin_chain_name: "microtick",
        price_coin_id: "pool:utick",
      },
    ],
  },
  {
    chain_name: "sifchain",
    chain_id: "sifchain-1",
    assets: [
      {
        description:
          "Rowan Token (ROWAN) is the Sifchain Network's native utility token, used as the primary means to govern, provide liquidity, secure the blockchain, incentivize participants, and provide a default mechanism to store and exchange value.",
        denom_units: [
          {
            denom:
              "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
            exponent: 0,
            aliases: ["rowan"],
          },
          {
            denom: "ROWAN",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
        name: "Sifchain Rowan",
        display: "ROWAN",
        symbol: "ROWAN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "sifchain",
              base_denom: "rowan",
              channel_id: "channel-17",
            },
            chain: {
              channel_id: "channel-47",
              path: "transfer/channel-47/rowan",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.svg",
        },
        coingecko_id: "sifchain",
        keywords: [
          "osmosis-info",
          "osmosis-price:uosmo:629",
          "osmosis-unstable",
        ],
        origin_chain_id: "sifchain-1",
        origin_chain_name: "sifchain",
        price_coin_id: "pool:rowan",
      },
    ],
  },
  {
    chain_name: "shentu",
    chain_id: "shentu-2.2",
    assets: [
      {
        description: "The native token of Shentu",
        denom_units: [
          {
            denom:
              "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
            exponent: 0,
            aliases: ["uctk"],
          },
          {
            denom: "ctk",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
        name: "Shentu",
        display: "ctk",
        symbol: "CTK",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "shentu",
              base_denom: "uctk",
              channel_id: "channel-8",
            },
            chain: {
              channel_id: "channel-146",
              path: "transfer/channel-146/uctk",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.svg",
        },
        coingecko_id: "certik",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1020"],
        origin_chain_id: "shentu-2.2",
        origin_chain_name: "shentu",
        price_coin_id: "pool:uctk",
      },
    ],
  },
  {
    chain_name: "provenance",
    chain_id: "pio-mainnet-1",
    assets: [
      {
        description: "Hash is the staking token of the Provenance Blockchain",
        denom_units: [
          {
            denom:
              "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
            exponent: 0,
            aliases: ["nhash"],
          },
          {
            denom: "hash",
            exponent: 9,
          },
        ],
        type_asset: "ics20",
        base: "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
        name: "Hash",
        display: "hash",
        symbol: "HASH",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "provenance",
              base_denom: "nhash",
              channel_id: "channel-7",
            },
            chain: {
              channel_id: "channel-222",
              path: "transfer/channel-222/nhash",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.svg",
        },
        coingecko_id: "provenance-blockchain",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:693"],
        origin_chain_id: "pio-mainnet-1",
        origin_chain_name: "provenance",
        price_coin_id: "pool:nhash",
      },
    ],
  },
  {
    chain_name: "galaxy",
    chain_id: "galaxy-1",
    assets: [
      {
        description: "GLX is the staking token of the Galaxy Chain",
        denom_units: [
          {
            denom:
              "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
            exponent: 0,
            aliases: ["uglx"],
          },
          {
            denom: "glx",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
        name: "Galaxy",
        display: "glx",
        symbol: "GLX",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "galaxy",
              base_denom: "uglx",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-236",
              path: "transfer/channel-236/uglx",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.svg",
        },
        keywords: ["osmosis-price:uosmo:697"],
        origin_chain_id: "galaxy-1",
        origin_chain_name: "galaxy",
        price_coin_id: "pool:uglx",
      },
    ],
  },
  {
    chain_name: "meme",
    chain_id: "meme-1",
    assets: [
      {
        description:
          "MEME Token (MEME) is the native staking token of the MEME Chain",
        denom_units: [
          {
            denom:
              "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
            exponent: 0,
            aliases: ["umeme"],
          },
          {
            denom: "meme",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
        name: "MEME",
        display: "meme",
        symbol: "MEME",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "meme",
              base_denom: "umeme",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-238",
              path: "transfer/channel-238/umeme",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.svg",
        },
        coingecko_id: "meme-network",
        keywords: ["osmosis-info", "osmosis-price:uosmo:701"],
        origin_chain_id: "meme-1",
        origin_chain_name: "meme",
        price_coin_id: "pool:umeme",
      },
    ],
  },
  {
    chain_name: "terra2",
    chain_id: "phoenix-1",
    assets: [
      {
        description: "The native staking token of Terra.",
        denom_units: [
          {
            denom:
              "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
            exponent: 0,
            aliases: ["uluna"],
          },
          {
            denom: "luna",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        name: "Luna",
        display: "luna",
        symbol: "LUNA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "terra2",
              base_denom: "uluna",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-251",
              path: "transfer/channel-251/uluna",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.svg",
        },
        coingecko_id: "terra-luna-2",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:726"],
        origin_chain_id: "phoenix-1",
        origin_chain_name: "terra2",
        price_coin_id: "pool:uluna",
      },
      {
        description:
          "Lion DAO is a community DAO that lives on the Terra blockchain with the mission to reactivate the LUNAtic community and showcase Terra protocols & tooling",
        denom_units: [
          {
            denom:
              "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
            exponent: 0,
            aliases: [
              "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
            ],
          },
          {
            denom: "roar",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
        base: "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        name: "Lion DAO",
        display: "roar",
        symbol: "ROAR",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "terra2",
              base_denom:
                "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channel_id: "channel-26",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-341",
              path: "transfer/channel-341/cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/roar.png",
        },
        keywords: ["osmosis-main", "osmosis-price:uosmo:1043"],
        origin_chain_id: "phoenix-1",
        origin_chain_name: "terra2",
        price_coin_id: "pool:roar",
      },
      {
        description: "Lion Cub DAO is a useless meme community DAO on Terra",
        denom_units: [
          {
            denom:
              "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
            exponent: 0,
            aliases: [
              "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
            ],
          },
          {
            denom: "cub",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
        base: "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        name: "Lion Cub DAO",
        display: "cub",
        symbol: "CUB",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "terra2",
              base_denom:
                "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channel_id: "channel-26",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-341",
              path: "transfer/channel-341/cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/cub.png",
        },
        keywords: [
          "osmosis-price:ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9:1072",
        ],
        origin_chain_id: "phoenix-1",
        origin_chain_name: "terra2",
        price_coin_id: "pool:cub",
      },
      {
        description: "BLUE CUB DAO is a community DAO on Terra",
        denom_units: [
          {
            denom:
              "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
            exponent: 0,
            aliases: [
              "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
            ],
          },
          {
            denom: "blue",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address:
          "terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
        base: "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        name: "BLUE CUB DAO",
        display: "blue",
        symbol: "BLUE",
        traces: [
          {
            type: "ibc-cw20",
            counterparty: {
              chain_name: "terra2",
              base_denom:
                "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
              port: "wasm.terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
              channel_id: "channel-26",
            },
            chain: {
              port: "transfer",
              channel_id: "channel-341",
              path: "transfer/channel-341/cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/blue.png",
        },
        keywords: [
          "osmosis-price:ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9:1073",
        ],
        origin_chain_id: "phoenix-1",
        origin_chain_name: "terra2",
        price_coin_id: "pool:blue",
      },
    ],
  },
  {
    chain_name: "rizon",
    chain_id: "titan-1",
    assets: [
      {
        description: "Native token of Rizon Chain",
        denom_units: [
          {
            denom:
              "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
            exponent: 0,
            aliases: ["uatolo"],
          },
          {
            denom: "atolo",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
        name: "Rizon Chain",
        display: "atolo",
        symbol: "ATOLO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "rizon",
              base_denom: "uatolo",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-221",
              path: "transfer/channel-221/uatolo",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.svg",
        },
        coingecko_id: "rizon",
        keywords: ["osmosis-price:uosmo:729"],
        origin_chain_id: "titan-1",
        origin_chain_name: "rizon",
      },
    ],
  },
  {
    chain_name: "genesisl1",
    chain_id: "genesis_29-2",
    assets: [
      {
        description:
          "L1 coin is the GenesisL1 blockchain utility, governance and EVM token",
        denom_units: [
          {
            denom:
              "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
            exponent: 0,
            aliases: ["el1"],
          },
          {
            denom: "l1",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
        name: "GenesisL1",
        display: "l1",
        symbol: "L1",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "genesisl1",
              base_denom: "el1",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-253",
              path: "transfer/channel-253/el1",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:732"],
        origin_chain_id: "genesis_29-2",
        origin_chain_name: "genesisl1",
        price_coin_id: "pool:el1",
      },
    ],
  },
  {
    chain_name: "kujira",
    chain_id: "kaiyo-1",
    assets: [
      {
        description:
          "The native staking and governance token of the Kujira chain.",
        denom_units: [
          {
            denom:
              "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
            exponent: 0,
            aliases: ["ukuji"],
          },
          {
            denom: "kuji",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
        name: "Kuji",
        display: "kuji",
        symbol: "KUJI",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kujira",
              base_denom: "ukuji",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-259",
              path: "transfer/channel-259/ukuji",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg",
        },
        coingecko_id: "kujira",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:744"],
        origin_chain_id: "kaiyo-1",
        origin_chain_name: "kujira",
        price_coin_id: "pool:ukuji",
      },
      {
        description:
          "The native over-collateralized stablecoin from the Kujira chain.",
        denom_units: [
          {
            denom:
              "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
            exponent: 0,
            aliases: [
              "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
            ],
          },
          {
            denom: "usk",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
        name: "USK",
        display: "USK",
        symbol: "USK",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kujira",
              base_denom:
                "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-259",
              path: "transfer/channel-259/factory:kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7:uusk",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.svg",
        },
        coingecko_id: "usk",
        keywords: ["osmosis-main", "osmosis-price:uosmo:827"],
        origin_chain_id: "kaiyo-1",
        origin_chain_name: "kujira",
        price_coin_id: "pool:usk",
      },
      {
        description: "MantaDAO Governance Token",
        denom_units: [
          {
            denom:
              "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
            exponent: 0,
            aliases: [
              "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
            ],
          },
          {
            denom: "mnta",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
        name: "MNTA",
        display: "MNTA",
        symbol: "MNTA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kujira",
              base_denom:
                "factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-259",
              path: "transfer/channel-259/factory:kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7:umnta",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.svg",
        },
        coingecko_id: "mantadao",
        keywords: ["osmosis-main", "osmosis-price:uosmo:1139"],
        origin_chain_id: "kaiyo-1",
        origin_chain_name: "kujira",
        price_coin_id: "pool:umnta",
      },
      {
        description: "NSTK on Kujiura",
        denom_units: [
          {
            denom:
              "ibc/F74225B0AFD2F675AF56E9BE3F235486BCDE5C5E09AA88A97AFD2E052ABFE04C",
            exponent: 0,
            aliases: [
              "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
            ],
          },
          {
            denom: "nstk",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh",
        base: "ibc/F74225B0AFD2F675AF56E9BE3F235486BCDE5C5E09AA88A97AFD2E052ABFE04C",
        name: "NSTK",
        display: "nstk",
        symbol: "NSTK",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kujira",
              base_denom:
                "factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-259",
              path: "transfer/channel-259/factory:kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh:unstk",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
        },
        origin_chain_id: "kaiyo-1",
        origin_chain_name: "kujira",
      },
    ],
  },
  {
    chain_name: "tgrade",
    chain_id: "tgrade-mainnet-1",
    assets: [
      {
        description: "The native token of Tgrade",
        denom_units: [
          {
            denom:
              "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
            exponent: 0,
            aliases: ["utgd"],
          },
          {
            denom: "tgd",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
        name: "Tgrade",
        display: "tgd",
        symbol: "TGD",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "tgrade",
              base_denom: "utgd",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-263",
              path: "transfer/channel-263/utgd",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.svg",
        },
        coingecko_id: "tgrade",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:769"],
        origin_chain_id: "tgrade-mainnet-1",
        origin_chain_name: "tgrade",
        price_coin_id: "pool:utgd",
      },
    ],
  },
  {
    chain_name: "echelon",
    chain_id: "echelon_3000-3",
    assets: [
      {
        description:
          "Echelon - a scalable EVM on Cosmos, built on Proof-of-Stake with fast-finality that prioritizes interoperability and novel economics",
        denom_units: [
          {
            denom:
              "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
            exponent: 0,
            aliases: ["aechelon"],
          },
          {
            denom: "echelon",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
        name: "Echelon",
        display: "echelon",
        symbol: "ECH",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "echelon",
              base_denom: "aechelon",
              channel_id: "channel-11",
            },
            chain: {
              channel_id: "channel-403",
              path: "transfer/channel-403/aechelon",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/ech.svg",
        },
        coingecko_id: "echelon",
        keywords: ["osmosis-price:uosmo:848"],
        origin_chain_id: "echelon_3000-3",
        origin_chain_name: "echelon",
        price_coin_id: "pool:aechelon",
      },
    ],
  },
  {
    chain_name: "odin",
    chain_id: "odin-mainnet-freya",
    assets: [
      {
        description: "Staking and governance token for ODIN Protocol",
        denom_units: [
          {
            denom:
              "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
            exponent: 0,
            aliases: ["loki"],
          },
          {
            denom: "odin",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
        name: "ODIN",
        display: "odin",
        symbol: "ODIN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "odin",
              base_denom: "loki",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-258",
              path: "transfer/channel-258/loki",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.svg",
        },
        coingecko_id: "odin-protocol",
        keywords: ["osmosis-info", "osmosis-price:uosmo:777"],
        origin_chain_id: "odin-mainnet-freya",
        origin_chain_name: "odin",
        price_coin_id: "pool:odin",
      },
      {
        description: "GEO token for ODIN Protocol",
        denom_units: [
          {
            denom:
              "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
            exponent: 0,
            aliases: ["mGeo"],
          },
          {
            denom: "geo",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
        name: "GEO",
        display: "geo",
        symbol: "GEO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "odin",
              base_denom: "mGeo",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-258",
              path: "transfer/channel-258/mGeo",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:787"],
        origin_chain_id: "odin-mainnet-freya",
        origin_chain_name: "odin",
        price_coin_id: "pool:geo",
      },
      {
        description: "O9W token for ODIN Protocol",
        denom_units: [
          {
            denom:
              "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
            exponent: 0,
            aliases: ["mO9W"],
          },
          {
            denom: "O9W",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
        name: "O9W",
        display: "O9W",
        symbol: "O9W",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "odin",
              base_denom: "mO9W",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-258",
              path: "transfer/channel-258/mO9W",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.svg",
        },
        keywords: ["osmosis-price:uosmo:805"],
        origin_chain_id: "odin-mainnet-freya",
        origin_chain_name: "odin",
        price_coin_id: "pool:o9w",
      },
    ],
  },
  {
    chain_name: "crescent",
    chain_id: "crescent-1",
    assets: [
      {
        description: "The native token of Crescent",
        denom_units: [
          {
            denom:
              "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
            exponent: 0,
            aliases: ["ucre"],
          },
          {
            denom: "cre",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
        name: "Crescent",
        display: "cre",
        symbol: "CRE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "crescent",
              base_denom: "ucre",
              channel_id: "channel-9",
            },
            chain: {
              channel_id: "channel-297",
              path: "transfer/channel-297/ucre",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
        },
        coingecko_id: "crescent-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:786"],
        origin_chain_id: "crescent-1",
        origin_chain_name: "crescent",
        price_coin_id: "pool:ucre",
      },
    ],
  },
  {
    chain_name: "lumenx",
    chain_id: "LumenX",
    assets: [
      {
        description: "The native token of LumenX Network",
        denom_units: [
          {
            denom:
              "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
            exponent: 0,
            aliases: ["ulumen"],
          },
          {
            denom: "lumen",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
        name: "LUMEN",
        display: "lumen",
        symbol: "LUMEN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "lumenx",
              base_denom: "ulumen",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-286",
              path: "transfer/channel-286/ulumen",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.svg",
        },
        keywords: ["osmosis-price:uosmo:788", "osmosis-unstable"],
        origin_chain_id: "LumenX",
        origin_chain_name: "lumenx",
        price_coin_id: "pool:ulumen",
      },
    ],
  },
  {
    chain_name: "oraichain",
    chain_id: "Oraichain",
    assets: [
      {
        description: "The native token of Oraichain",
        denom_units: [
          {
            denom:
              "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
            exponent: 0,
            aliases: ["orai"],
          },
          {
            denom: "ORAI",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
        name: "Oraichain",
        display: "ORAI",
        symbol: "ORAI",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "oraichain",
              base_denom: "orai",
              channel_id: "channel-13",
            },
            chain: {
              channel_id: "channel-216",
              path: "transfer/channel-216/orai",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-white.svg",
        },
        coingecko_id: "oraichain-token",
        keywords: ["osmosis-info", "osmosis-price:uosmo:799"],
        origin_chain_id: "Oraichain",
        origin_chain_name: "oraichain",
        price_coin_id: "pool:orai",
      },
    ],
  },
  {
    chain_name: "cudos",
    chain_id: "cudos-1",
    assets: [
      {
        description: "The native token of the Cudos blockchain",
        denom_units: [
          {
            denom:
              "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
            exponent: 0,
            aliases: ["attocudos", "acudos"],
          },
          {
            denom: "cudos",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
        name: "Cudos",
        display: "cudos",
        symbol: "CUDOS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "cudos",
              base_denom: "acudos",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-298",
              path: "transfer/channel-298/acudos",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.svg",
        },
        coingecko_id: "cudos",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:796"],
        origin_chain_id: "cudos-1",
        origin_chain_name: "cudos",
        price_coin_id: "pool:acudos",
      },
    ],
  },
  {
    chain_name: "agoric",
    chain_id: "agoric-3",
    assets: [
      {
        description:
          "BLD is the token used to secure the Agoric chain through staking and to backstop Inter Protocol.",
        denom_units: [
          {
            denom:
              "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
            exponent: 0,
            aliases: ["ubld"],
          },
          {
            denom: "bld",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
        name: "Agoric",
        display: "bld",
        symbol: "BLD",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "agoric",
              base_denom: "ubld",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-320",
              path: "transfer/channel-320/ubld",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.svg",
        },
        coingecko_id: "agoric",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:795"],
        origin_chain_id: "agoric-3",
        origin_chain_name: "agoric",
        price_coin_id: "pool:ubld",
      },
      {
        description:
          "IST is the stable token used by the Agoric chain for execution fees and commerce.",
        denom_units: [
          {
            denom:
              "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
            exponent: 0,
            aliases: ["uist"],
          },
          {
            denom: "ist",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
        name: "Inter Stable Token",
        display: "ist",
        symbol: "IST",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "agoric",
              base_denom: "uist",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-320",
              path: "transfer/channel-320/uist",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:837"],
        origin_chain_id: "agoric-3",
        origin_chain_name: "agoric",
        price_coin_id: "pool:uist",
      },
    ],
  },
  {
    chain_name: "stride",
    chain_id: "stride-1",
    assets: [
      {
        description: "The native token of Stride",
        denom_units: [
          {
            denom:
              "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
            exponent: 0,
            aliases: ["ustrd"],
          },
          {
            denom: "strd",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
        name: "Stride",
        display: "strd",
        symbol: "STRD",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "ustrd",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/ustrd",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg",
        },
        coingecko_id: "stride",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:806"],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:ustrd",
      },
      {
        description:
          "The native staking and governance token of the Cosmos Hub.",
        denom_units: [
          {
            denom:
              "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
            exponent: 0,
            aliases: ["stuatom"],
          },
          {
            denom: "statom",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
        name: "stATOM",
        display: "statom",
        symbol: "stATOM",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "cosmoshub",
              base_denom: "uatom",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stuatom",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stuatom",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.svg",
        },
        coingecko_id: "stride-staked-atom",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:803",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stuatom",
      },
      {
        description: "The native token of Stargaze",
        denom_units: [
          {
            denom:
              "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
            exponent: 0,
            aliases: ["stustars"],
          },
          {
            denom: "ststars",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        name: "stSTARS",
        display: "ststars",
        symbol: "stSTARS",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "stargaze",
              base_denom: "ustars",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stustars",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stustars",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4:810",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stustars",
      },
      {
        description: "The native token of JUNO Chain",
        denom_units: [
          {
            denom:
              "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
            exponent: 0,
            aliases: ["stujuno"],
          },
          {
            denom: "stjuno",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
        name: "stJUNO",
        display: "stjuno",
        symbol: "stJUNO",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "juno",
              base_denom: "ujuno",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stujuno",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stujuno",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED:817",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stujuno",
      },
      {
        description: "The native token of Osmosis",
        denom_units: [
          {
            denom:
              "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
            exponent: 0,
            aliases: ["stuosmo"],
          },
          {
            denom: "stosmo",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
        name: "stOSMO",
        display: "stosmo",
        symbol: "stOSMO",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "osmosis",
              base_denom: "uosmo",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stuosmo",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stuosmo",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:833"],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stuosmo",
      },
      {
        description: "The native staking token of Terra.",
        denom_units: [
          {
            denom:
              "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
            exponent: 0,
            aliases: ["stuluna"],
          },
          {
            denom: "stluna",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        name: "stLUNA",
        display: "stluna",
        symbol: "stLUNA",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "terra2",
              base_denom: "uluna",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stuluna",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stuluna",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-price:ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9:913",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stuluna",
      },
      {
        denom_units: [
          {
            denom:
              "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
            exponent: 0,
            aliases: ["staevmos"],
          },
          {
            denom: "stevmos",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        name: "stEVMOS",
        display: "stevmos",
        symbol: "stEVMOS",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "evmos",
              base_denom: "uaevmos",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "staevmos",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/staevmos",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A:922",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:staevmos",
      },
      {
        description: "The native token of Umee",
        denom_units: [
          {
            denom:
              "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
            exponent: 0,
            aliases: ["stuumee"],
          },
          {
            denom: "stumee",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
        name: "stUMEE",
        display: "stumee",
        symbol: "stUMEE",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "umee",
              base_denom: "uumee",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stuumee",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stuumee",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C:1035",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stuumee",
      },
      {
        description:
          "Somm Token (SOMM) is the native staking token of the Sommelier Chain",
        denom_units: [
          {
            denom:
              "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
            exponent: 0,
            aliases: ["stusomm"],
          },
          {
            denom: "stsomm",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
        name: "stSOMM",
        display: "stsomm",
        symbol: "stSOMM",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "sommelier",
              base_denom: "usomm",
            },
            provider: "Stride",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stride",
              base_denom: "stusomm",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-326",
              path: "transfer/channel-326/stusomm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E:1120",
        ],
        origin_chain_id: "stride-1",
        origin_chain_name: "stride",
        price_coin_id: "pool:stusomm",
      },
    ],
  },
  {
    chain_name: "rebus",
    chain_id: "reb_1111-1",
    assets: [
      {
        description: "REBUS, the native coin of the Rebus chain.",
        denom_units: [
          {
            denom:
              "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
            exponent: 0,
            aliases: ["arebus"],
          },
          {
            denom: "rebus",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
        name: "Rebus",
        display: "rebus",
        symbol: "REBUS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "rebus",
              base_denom: "arebus",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-355",
              path: "transfer/channel-355/arebus",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.svg",
        },
        coingecko_id: "rebus",
        keywords: ["osmosis-info", "osmosis-price:uosmo:813"],
        origin_chain_id: "reb_1111-1",
        origin_chain_name: "rebus",
        price_coin_id: "pool:arebus",
      },
    ],
  },
  {
    chain_name: "teritori",
    chain_id: "teritori-1",
    assets: [
      {
        description: "The native token of Teritori",
        denom_units: [
          {
            denom:
              "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
            exponent: 0,
            aliases: ["utori"],
          },
          {
            denom: "tori",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        name: "Teritori",
        display: "tori",
        symbol: "TORI",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "teritori",
              base_denom: "utori",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-362",
              path: "transfer/channel-362/utori",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.svg",
        },
        coingecko_id: "teritori",
        keywords: ["osmosis-info", "osmosis-price:uosmo:816"],
        origin_chain_id: "teritori-1",
        origin_chain_name: "teritori",
        price_coin_id: "pool:utori",
      },
    ],
  },
  {
    chain_name: "lambda",
    chain_id: "lambda_92000-1",
    assets: [
      {
        description: "The native token of Lambda",
        denom_units: [
          {
            denom:
              "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
            exponent: 0,
            aliases: ["ulamb"],
          },
          {
            denom: "lamb",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
        name: "Lambda",
        display: "lamb",
        symbol: "LAMB",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "lambda",
              base_denom: "ulamb",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-378",
              path: "transfer/channel-378/ulamb",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.svg",
        },
        coingecko_id: "lambda",
        keywords: ["osmosis-info", "osmosis-price:uosmo:826"],
        origin_chain_id: "lambda_92000-1",
        origin_chain_name: "lambda",
        price_coin_id: "pool:lambda",
      },
    ],
  },
  {
    chain_name: "unification",
    chain_id: "FUND-MainNet-2",
    assets: [
      {
        description:
          "Staking and governance coin for the Unification Blockchain",
        denom_units: [
          {
            denom:
              "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
            exponent: 0,
            aliases: ["nund"],
          },
          {
            denom: "FUND",
            exponent: 9,
          },
        ],
        type_asset: "ics20",
        base: "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
        name: "Unification Network",
        display: "FUND",
        symbol: "FUND",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "unification",
              base_denom: "nund",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-382",
              path: "transfer/channel-382/nund",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.svg",
        },
        coingecko_id: "unification",
        keywords: ["osmosis-info", "osmosis-price:uosmo:1240"],
        origin_chain_id: "FUND-MainNet-2",
        origin_chain_name: "unification",
        price_coin_id: "pool:nund",
      },
    ],
  },
  {
    chain_name: "jackal",
    chain_id: "jackal-1",
    assets: [
      {
        description: "The native staking and governance token of Jackal.",
        denom_units: [
          {
            denom:
              "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
            exponent: 0,
            aliases: ["ujkl"],
          },
          {
            denom: "jkl",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
        name: "Jackal",
        display: "jkl",
        symbol: "JKL",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "jackal",
              base_denom: "ujkl",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-412",
              path: "transfer/channel-412/ujkl",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.svg",
        },
        coingecko_id: "jackal-protocol",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:832"],
        origin_chain_id: "jackal-1",
        origin_chain_name: "jackal",
        price_coin_id: "pool:jkl",
      },
    ],
  },
  {
    chain_name: "beezee",
    chain_id: "beezee-1",
    assets: [
      {
        description: "BeeZee native blockchain",
        denom_units: [
          {
            denom:
              "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
            exponent: 0,
            aliases: ["ubze"],
          },
          {
            denom: "bze",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        name: "BeeZee",
        display: "bze",
        symbol: "BZE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "beezee",
              base_denom: "ubze",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-340",
              path: "transfer/channel-340/ubze",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.svg",
        },
        coingecko_id: "bzedge",
        keywords: ["osmosis-info", "osmosis-price:uosmo:856"],
        origin_chain_id: "beezee-1",
        origin_chain_name: "beezee",
        price_coin_id: "pool:ubze",
      },
    ],
  },
  {
    chain_name: "acrechain",
    chain_id: "acre_9052-1",
    assets: [
      {
        description:
          "The native EVM, governance and staking token of the Acrechain",
        denom_units: [
          {
            denom:
              "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
            exponent: 0,
            aliases: ["aacre"],
          },
          {
            denom: "acre",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
        name: "Acre",
        display: "acre",
        symbol: "ACRE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "acrechain",
              base_denom: "aacre",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-490",
              path: "transfer/channel-490/aacre",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.svg",
        },
        coingecko_id: "arable-protocol",
        keywords: ["osmosis-info", "osmosis-price:uosmo:858"],
        origin_chain_id: "acre_9052-1",
        origin_chain_name: "acrechain",
        price_coin_id: "pool:aacre",
      },
      {
        description: "Overcollateralized stable coin for Arable derivatives v1",
        denom_units: [
          {
            denom:
              "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
            exponent: 0,
            aliases: ["erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c"],
          },
          {
            denom: "arusd",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
        name: "Arable USD",
        display: "arusd",
        symbol: "arUSD",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "acrechain",
              base_denom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-490",
              path: "transfer/channel-490/erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.svg",
        },
        coingecko_id: "arable-usd",
        keywords: [
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:895",
        ],
        origin_chain_id: "acre_9052-1",
        origin_chain_name: "acrechain",
        price_coin_id: "pool:erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
      },
      {
        description: "Ciento Exchange Token",
        denom_units: [
          {
            denom:
              "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
            exponent: 0,
            aliases: ["erc20/0xAE6D3334989a22A65228732446731438672418F2"],
          },
          {
            denom: "cnto",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
        name: "Ciento Token",
        display: "cnto",
        symbol: "CNTO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "acrechain",
              base_denom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-490",
              path: "transfer/channel-490/erc20/0xAE6D3334989a22A65228732446731438672418F2",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.svg",
        },
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:909",
        ],
        origin_chain_id: "acre_9052-1",
        origin_chain_name: "acrechain",
        price_coin_id: "pool:erc20/0xAE6D3334989a22A65228732446731438672418F2",
      },
    ],
  },
  {
    chain_name: "imversed",
    chain_id: "imversed_5555555-1",
    assets: [
      {
        description:
          "The native EVM, governance and staking token of the Imversed",
        denom_units: [
          {
            denom:
              "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
            exponent: 0,
            aliases: ["aimv"],
          },
          {
            denom: "imv",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
        name: "IMV",
        display: "imv",
        symbol: "IMV",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "imversed",
              base_denom: "aimv",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-517",
              path: "transfer/channel-517/aimv",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.svg",
        },
        coingecko_id: "imv",
        keywords: [
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:866",
        ],
        origin_chain_id: "imversed_5555555-1",
        origin_chain_name: "imversed",
        price_coin_id: "pool:aimv",
      },
    ],
  },
  {
    chain_name: "medasdigital",
    chain_id: "medasdigital-1",
    assets: [
      {
        description: "The native token of Medas Digital Network",
        denom_units: [
          {
            denom:
              "ibc/01E94A5FF29B8DDEFC86F412CC3927F7330E9B523CC63A6194B1108F5276025C",
            exponent: 0,
            aliases: ["umedas"],
          },
          {
            denom: "medas",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/01E94A5FF29B8DDEFC86F412CC3927F7330E9B523CC63A6194B1108F5276025C",
        name: "Medas Digital",
        display: "medas",
        symbol: "MEDAS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "medasdigital",
              base_denom: "umedas",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-519",
              path: "transfer/channel-519/umedas",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.svg",
        },
        keywords: ["medas", "osmosis-info", "osmosis-price:uosmo:859"],
        origin_chain_id: "medasdigital-1",
        origin_chain_name: "medasdigital",
        price_coin_id: "pool:umedas",
      },
    ],
  },
  {
    chain_name: "onomy",
    chain_id: "onomy-mainnet-1",
    assets: [
      {
        description: "The native token of Onomy Protocol",
        denom_units: [
          {
            denom:
              "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
            exponent: 0,
            aliases: ["anom"],
          },
          {
            denom: "nom",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        name: "Nom",
        display: "nom",
        symbol: "NOM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "onomy",
              base_denom: "anom",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-525",
              path: "transfer/channel-525/anom",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.svg",
        },
        coingecko_id: "onomy-protocol",
        keywords: [
          "dex",
          "stablecoin",
          "bridge",
          "staking",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:882",
        ],
        origin_chain_id: "onomy-mainnet-1",
        origin_chain_name: "onomy",
        price_coin_id: "pool:anom",
      },
    ],
  },
  {
    chain_name: "dyson",
    chain_id: "dyson-mainnet-01",
    assets: [
      {
        description:
          "The native staking and governance token of the Dyson Protocol",
        denom_units: [
          {
            denom:
              "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
            exponent: 0,
            aliases: ["dys"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
        name: "Dys",
        display: "dys",
        symbol: "DYS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "dyson",
              base_denom: "dys",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-526",
              path: "transfer/channel-526/dys",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.svg",
        },
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F:950",
        ],
        origin_chain_id: "dyson-mainnet-01",
        origin_chain_name: "dyson",
        price_coin_id: "pool:dys",
      },
    ],
  },
  {
    chain_name: "planq",
    chain_id: "planq_7070-2",
    assets: [
      {
        description:
          "The native EVM, governance and staking token of the Planq Network",
        denom_units: [
          {
            denom:
              "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
            exponent: 0,
            aliases: ["aplanq"],
          },
          {
            denom: "planq",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
        name: "Planq",
        display: "planq",
        symbol: "PLQ",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "planq",
              base_denom: "aplanq",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-492",
              path: "transfer/channel-492/aplanq",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.svg",
        },
        coingecko_id: "planq",
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4:1218",
        ],
        origin_chain_id: "planq_7070-2",
        origin_chain_name: "planq",
        price_coin_id: "pool:aplanq",
      },
    ],
  },
  {
    chain_name: "canto",
    chain_id: "canto_7700-1",
    assets: [
      {
        description:
          "Canto is a Layer-1 blockchain built to deliver on the promise of DeFi",
        denom_units: [
          {
            denom:
              "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
            exponent: 0,
            aliases: ["acanto"],
          },
          {
            denom: "canto",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
        name: "Canto",
        display: "canto",
        symbol: "CANTO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "canto",
              base_denom: "acanto",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-550",
              path: "transfer/channel-550/acanto",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
        },
        coingecko_id: "canto",
        keywords: ["osmosis-main", "osmosis-price:uosmo:901"],
        origin_chain_id: "canto_7700-1",
        origin_chain_name: "canto",
        price_coin_id: "pool:acanto",
      },
    ],
  },
  {
    chain_name: "quicksilver",
    chain_id: "quicksilver-2",
    assets: [
      {
        description: "Quicksilver Liquid Staked STARS",
        denom_units: [
          {
            denom:
              "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
            exponent: 0,
            aliases: ["uqstars"],
          },
          {
            denom: "qstars",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
        name: "Quicksilver Liquid Staked STARS",
        display: "qstars",
        symbol: "qSTARS",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "stargaze",
              base_denom: "ustars",
            },
            provider: "Quicksilver",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "quicksilver",
              base_denom: "uqstars",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-522",
              path: "transfer/channel-522/uqstars",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4:903",
        ],
        origin_chain_id: "quicksilver-2",
        origin_chain_name: "quicksilver",
        price_coin_id: "pool:uqstars",
      },
      {
        description: "Quicksilver Liquid Staked ATOM",
        denom_units: [
          {
            denom:
              "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
            exponent: 0,
            aliases: ["uqatom"],
          },
          {
            denom: "qatom",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
        name: "Quicksilver Liquid Staked ATOM",
        display: "qatom",
        symbol: "qATOM",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "cosmoshub",
              base_denom: "uatom",
            },
            provider: "Quicksilver",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "quicksilver",
              base_denom: "uqatom",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-522",
              path: "transfer/channel-522/uqatom",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:944",
        ],
        origin_chain_id: "quicksilver-2",
        origin_chain_name: "quicksilver",
        price_coin_id: "pool:uqatom",
      },
      {
        description: "Quicksilver Liquid Staked REGEN",
        denom_units: [
          {
            denom:
              "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
            exponent: 0,
            aliases: ["uqregen"],
          },
          {
            denom: "qregen",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
        name: "Quicksilver Liquid Staked Regen",
        display: "qregen",
        symbol: "qREGEN",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "regen",
              base_denom: "uregen",
            },
            provider: "Quicksilver",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "quicksilver",
              base_denom: "uqregen",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-522",
              path: "transfer/channel-522/uqregen",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076:948",
        ],
        origin_chain_id: "quicksilver-2",
        origin_chain_name: "quicksilver",
        price_coin_id: "pool:uqregen",
      },
      {
        description: "QCK - native token of Quicksilver",
        denom_units: [
          {
            denom:
              "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
            exponent: 0,
            aliases: ["uqck"],
          },
          {
            denom: "qck",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
        name: "Quicksilver",
        display: "qck",
        symbol: "QCK",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "quicksilver",
              base_denom: "uqck",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-522",
              path: "transfer/channel-522/uqck",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
        },
        coingecko_id: "quicksilver",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:952"],
        origin_chain_id: "quicksilver-2",
        origin_chain_name: "quicksilver",
        price_coin_id: "pool:uqck",
      },
      {
        description: "Quicksilver Liquid Staked OSMO",
        denom_units: [
          {
            denom:
              "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
            exponent: 0,
            aliases: ["uqosmo"],
          },
          {
            denom: "qosmo",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
        name: "Quicksilver Liquid Staked OSMO",
        display: "qosmo",
        symbol: "qOSMO",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "osmosis",
              base_denom: "uosmo",
            },
            provider: "Quicksilver",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "quicksilver",
              base_denom: "uqosmo",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-522",
              path: "transfer/channel-522/uqosmo",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:956"],
        origin_chain_id: "quicksilver-2",
        origin_chain_name: "quicksilver",
        price_coin_id: "pool:uqosmo",
      },
      {
        description: "Quicksilver Liquid Staked SOMM",
        denom_units: [
          {
            denom:
              "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
            exponent: 0,
            aliases: ["uqsomm"],
          },
          {
            denom: "qsomm",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
        name: "Quicksilver Liquid Staked SOMM",
        display: "qsomm",
        symbol: "qSOMM",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "sommelier",
              base_denom: "usomm",
            },
            provider: "Quicksilver",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "quicksilver",
              base_denom: "uqsomm",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-522",
              path: "transfer/channel-522/uqsomm",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E:1087",
        ],
        origin_chain_id: "quicksilver-2",
        origin_chain_name: "quicksilver",
        price_coin_id: "pool:uqsomm",
      },
    ],
  },
  {
    chain_name: "mars",
    chain_id: "mars-1",
    assets: [
      {
        description: "Mars protocol token",
        denom_units: [
          {
            denom:
              "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
            exponent: 0,
            aliases: ["umars"],
          },
          {
            denom: "mars",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        name: "Mars",
        display: "mars",
        symbol: "MARS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "mars",
              base_denom: "umars",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-557",
              path: "transfer/channel-557/umars",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.svg",
        },
        coingecko_id: "mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:907"],
        origin_chain_id: "mars-1",
        origin_chain_name: "mars",
        price_coin_id: "pool:mars",
      },
    ],
  },
  {
    chain_name: "8ball",
    chain_id: "eightball-1",
    assets: [
      {
        description: "The native staking token of 8ball.",
        denom_units: [
          {
            denom:
              "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
            exponent: 0,
            aliases: ["uebl"],
          },
          {
            denom: "ebl",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        name: "8ball",
        display: "ebl",
        symbol: "EBL",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "8ball",
              base_denom: "uebl",
              channel_id: "channel-16",
            },
            chain: {
              channel_id: "channel-641",
              path: "transfer/channel-641/uebl",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.svg",
        },
        keywords: ["osmosis-info", "osmosis-price:uosmo:935"],
        origin_chain_id: "eightball-1",
        origin_chain_name: "8ball",
        price_coin_id: "pool:uebl",
      },
    ],
  },
  {
    chain_name: "arkh",
    chain_id: "arkh",
    assets: [
      {
        description: "The native token of Arkhadian",
        denom_units: [
          {
            denom:
              "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
            exponent: 0,
            aliases: ["arkh"],
          },
          {
            denom: "ARKH",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
        name: "Arkh",
        display: "ARKH",
        symbol: "ARKH",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "arkh",
              base_denom: "arkh",
              channel_id: "channel-12",
            },
            chain: {
              channel_id: "channel-648",
              path: "transfer/channel-648/arkh",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.svg",
        },
        keywords: ["osmosis-price:uosmo:954", "osmosis-unstable"],
        origin_chain_id: "arkh",
        origin_chain_name: "arkh",
        price_coin_id: "pool:arkh",
      },
    ],
  },
  {
    chain_name: "noble",
    chain_id: "noble-1",
    assets: [
      {
        description:
          "Frienzies are an IBC token redeemable exclusively for a physical asset issued by the Noble entity.",
        denom_units: [
          {
            denom:
              "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
            exponent: 0,
            aliases: ["microfrienzies", "ufrienzies"],
          },
          {
            denom: "frienzies",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
        name: "Frienzies",
        display: "frienzies",
        symbol: "FRNZ",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "noble",
              base_denom: "ufrienzies",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-750",
              path: "transfer/channel-750/ufrienzies",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:1012",
        ],
        origin_chain_id: "noble-1",
        origin_chain_name: "noble",
        price_coin_id: "pool:frnz",
      },
      {
        description: "USD Coin",
        denom_units: [
          {
            denom:
              "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
            exponent: 0,
            aliases: ["microusdc", "uusdc"],
          },
          {
            denom: "usdc",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        name: "USD Coin",
        display: "usdc",
        symbol: "USDC",
        traces: [
          {
            type: "synthetic",
            counterparty: {
              chain_name: "forex",
              base_denom: "USD",
            },
            provider: "Circle",
          },
          {
            type: "additional-mintage",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
            provider: "Circle",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "noble",
              base_denom: "uusdc",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-750",
              path: "transfer/channel-750/uusdc",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3:1232",
        ],
        origin_chain_id: "noble-1",
        origin_chain_name: "noble",
        price_coin_id: "pool:usdc",
      },
    ],
  },
  {
    chain_name: "migaloo",
    chain_id: "migaloo-1",
    assets: [
      {
        description: "The native token of Migaloo Chain",
        denom_units: [
          {
            denom:
              "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
            exponent: 0,
            aliases: ["uwhale"],
          },
          {
            denom: "whale",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
        name: "Whale",
        display: "whale",
        symbol: "WHALE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "migaloo",
              base_denom: "uwhale",
              channel_id: "channel-5",
            },
            chain: {
              channel_id: "channel-642",
              path: "transfer/channel-642/uwhale",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.svg",
        },
        coingecko_id: "white-whale",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:960"],
        origin_chain_id: "migaloo-1",
        origin_chain_name: "migaloo",
        price_coin_id: "pool:uwhale",
      },
    ],
  },
  {
    chain_name: "omniflixhub",
    chain_id: "omniflixhub-1",
    assets: [
      {
        description: "The native staking token of OmniFlix Hub.",
        denom_units: [
          {
            denom:
              "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
            exponent: 0,
            aliases: ["uflix"],
          },
          {
            denom: "flix",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
        name: "Flix",
        display: "flix",
        symbol: "FLIX",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "omniflixhub",
              base_denom: "uflix",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-199",
              path: "transfer/channel-199/uflix",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.svg",
        },
        coingecko_id: "omniflix-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:992"],
        origin_chain_id: "omniflixhub-1",
        origin_chain_name: "omniflixhub",
        price_coin_id: "pool:uflix",
      },
    ],
  },
  {
    chain_name: "bluzelle",
    chain_id: "bluzelle-9",
    assets: [
      {
        description: "The native token of Bluzelle",
        denom_units: [
          {
            denom:
              "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
            exponent: 0,
            aliases: ["ubnt"],
          },
          {
            denom: "bnt",
            exponent: 6,
            aliases: ["blz"],
          },
        ],
        type_asset: "ics20",
        base: "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
        name: "Bluzelle",
        display: "bnt",
        symbol: "BLZ",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "bluzelle",
              base_denom: "ubnt",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-763",
              path: "transfer/channel-763/ubnt",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.svg",
        },
        coingecko_id: "bluzelle",
        keywords: [
          "bluzelle",
          "game",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:1007",
        ],
        origin_chain_id: "bluzelle-9",
        origin_chain_name: "bluzelle",
        price_coin_id: "pool:ubnt",
      },
    ],
  },
  {
    chain_name: "gitopia",
    chain_id: "gitopia",
    assets: [
      {
        description: "The native token of Gitopia",
        denom_units: [
          {
            denom:
              "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
            exponent: 0,
            aliases: ["ulore"],
          },
          {
            denom: "LORE",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
        name: "LORE",
        display: "LORE",
        symbol: "LORE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "gitopia",
              base_denom: "ulore",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-781",
              path: "transfer/channel-781/ulore",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.svg",
        },
        coingecko_id: "gitopia",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1036"],
        origin_chain_id: "gitopia",
        origin_chain_name: "gitopia",
        price_coin_id: "pool:ulore",
      },
    ],
  },
  {
    chain_name: "nolus",
    chain_id: "pirin-1",
    assets: [
      {
        description: "The native token of Nolus chain",
        denom_units: [
          {
            denom:
              "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
            exponent: 0,
            aliases: ["unls"],
          },
          {
            denom: "nls",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
        name: "Nolus",
        display: "nls",
        symbol: "NLS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "nolus",
              base_denom: "unls",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-783",
              path: "transfer/channel-783/unls",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.svg",
        },
        coingecko_id: "nolus",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:1041",
        ],
        origin_chain_id: "pirin-1",
        origin_chain_name: "nolus",
        price_coin_id: "pool:unls",
      },
    ],
  },
  {
    chain_name: "neutron",
    chain_id: "neutron-1",
    assets: [
      {
        description: "The native token of Neutron chain.",
        denom_units: [
          {
            denom:
              "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
            exponent: 0,
            aliases: ["untrn"],
          },
          {
            denom: "ntrn",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
        name: "Neutron",
        display: "ntrn",
        symbol: "NTRN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "neutron",
              base_denom: "untrn",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-874",
              path: "transfer/channel-874/untrn",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg",
        },
        coingecko_id: "neutron-3",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1046"],
        origin_chain_id: "neutron-1",
        origin_chain_name: "neutron",
        price_coin_id: "pool:untrn",
      },
      {
        description: "wstETH on Neutron",
        denom_units: [
          {
            denom:
              "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
            exponent: 0,
            aliases: [
              "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
            ],
          },
          {
            denom: "wstETH",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
        name: "wstETH",
        display: "wstETH",
        symbol: "wstETH",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "wei",
            },
            provider: "Lido",
          },
          {
            type: "wrapped",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            },
            provider: "Lido",
          },
          {
            type: "additional-mintage",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            },
            provider: "Lido",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "neutron",
              base_denom:
                "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-874",
              path: "transfer/channel-874/factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "neutron-1",
        origin_chain_name: "neutron",
      },
    ],
  },
  {
    chain_name: "composable",
    chain_id: "centauri-1",
    assets: [
      {
        description: "The native staking and governance token of Composable.",
        denom_units: [
          {
            denom:
              "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
            exponent: 0,
            aliases: ["ppica"],
          },
          {
            denom: "pica",
            exponent: 12,
          },
        ],
        type_asset: "ics20",
        base: "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        name: "Pica",
        display: "pica",
        symbol: "PICA",
        traces: [
          {
            type: "additional-mintage",
            counterparty: {
              chain_name: "picasso",
              base_denom: "ppica",
            },
            provider: "Composable Finance",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "composable",
              base_denom: "ppica",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-1279",
              path: "transfer/channel-1279/ppica",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
        },
        coingecko_id: "picasso",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1057"],
        origin_chain_id: "centauri-1",
        origin_chain_name: "composable",
        price_coin_id: "pool:ppica",
      },
      {
        description:
          "The native staking and governance token of Kusama Relay Chain.",
        denom_units: [
          {
            denom:
              "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
            exponent: 0,
            aliases: [
              "4",
              "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
            ],
          },
          {
            denom: "ksm",
            exponent: 12,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
        name: "KSM",
        display: "ksm",
        symbol: "KSM",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "kusama",
              base_denom: "Planck",
            },
            provider: "Kusama Parachain",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "picasso",
              base_denom: "4",
              channel_id: "channel-17",
            },
            chain: {
              channel_id: "channel-2",
              path: "transfer/channel-2/4",
            },
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "composable",
              base_denom:
                "ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/4",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1058"],
        origin_chain_id: "centauri-1",
        origin_chain_name: "composable",
        price_coin_id: "pool:ksm",
      },
      {
        description:
          "The native staking and governance token of Polkadot Relay Chain.",
        denom_units: [
          {
            denom:
              "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
            exponent: 0,
            aliases: [
              "79228162514264337593543950342",
              "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
            ],
          },
          {
            denom: "dot",
            exponent: 10,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
        name: "DOT",
        display: "dot",
        symbol: "DOT",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "polkadot",
              base_denom: "Planck",
            },
            provider: "Polkadot Relay",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "composablepolkadot",
              base_denom: "79228162514264337593543950342",
              channel_id: "channel-15",
            },
            chain: {
              channel_id: "channel-15",
              path: "transfer/channel-15/79228162514264337593543950342",
            },
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "picasso",
              base_denom: "79228162514264337593543950342",
              channel_id: "channel-17",
            },
            chain: {
              channel_id: "channel-2",
              path: "transfer/channel-2/transfer/channel-15/79228162514264337593543950342",
            },
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "composable",
              base_denom:
                "ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-1279",
              path: "transfer/channel-1279/transfer/channel-2/transfer/channel-15/79228162514264337593543950342",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1069"],
        origin_chain_id: "centauri-1",
        origin_chain_name: "composable",
        price_coin_id: "pool:dot.comp",
      },
    ],
  },
  {
    chain_name: "quasar",
    chain_id: "quasar-1",
    assets: [
      {
        description: "The native token of Quasar",
        denom_units: [
          {
            denom:
              "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
            exponent: 0,
            aliases: ["uqsr"],
          },
          {
            denom: "qsr",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        base: "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
        name: "Quasar",
        display: "qsr",
        symbol: "QSR",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "quasar",
              base_denom: "uqsr",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-688",
              path: "transfer/channel-688/uqsr",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
        },
        coingecko_id: "quasar-2",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1060"],
        origin_chain_id: "quasar-1",
        origin_chain_name: "quasar",
        price_coin_id: "pool:uqsr",
      },
    ],
  },
  {
    chain_name: "archway",
    chain_id: "archway-1",
    assets: [
      {
        description: "The native token of Archway network",
        denom_units: [
          {
            denom:
              "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
            exponent: 0,
            aliases: ["aarch"],
          },
          {
            denom: "uarch",
            exponent: 12,
          },
          {
            denom: "arch",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
        name: "Archway",
        display: "arch",
        symbol: "ARCH",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "archway",
              base_denom: "aarch",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-1429",
              path: "transfer/channel-1429/aarch",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.svg",
        },
        coingecko_id: "archway",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1061"],
        origin_chain_id: "archway-1",
        origin_chain_name: "archway",
        price_coin_id: "pool:aarch",
      },
    ],
  },
  {
    chain_name: "empowerchain",
    chain_id: "empowerchain-1",
    assets: [
      {
        description: "The native staking and governance token of Empower.",
        denom_units: [
          {
            denom:
              "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
            exponent: 0,
            aliases: ["umpwr"],
          },
          {
            denom: "mpwr",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
        name: "MPWR",
        display: "mpwr",
        symbol: "MPWR",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "empowerchain",
              base_denom: "umpwr",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-1411",
              path: "transfer/channel-1411/umpwr",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1065"],
        origin_chain_id: "empowerchain-1",
        origin_chain_name: "empowerchain",
        price_coin_id: "pool:umpwr",
      },
    ],
  },
  {
    chain_name: "kyve",
    chain_id: "kyve-1",
    assets: [
      {
        description: "The native utility token of the KYVE network.",
        denom_units: [
          {
            denom:
              "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
            exponent: 0,
            aliases: ["ukyve"],
          },
          {
            denom: "kyve",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
        name: "KYVE",
        display: "kyve",
        symbol: "KYVE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "kyve",
              base_denom: "ukyve",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-767",
              path: "transfer/channel-767/ukyve",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.svg",
        },
        coingecko_id: "kyve-network",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1075"],
        origin_chain_id: "kyve-1",
        origin_chain_name: "kyve",
        price_coin_id: "pool:ukyve",
      },
    ],
  },
  {
    chain_name: "sei",
    chain_id: "pacific-1",
    assets: [
      {
        description: "The native staking token of Sei.",
        denom_units: [
          {
            denom:
              "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
            exponent: 0,
            aliases: ["usei"],
          },
          {
            denom: "sei",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
        name: "Sei",
        display: "sei",
        symbol: "SEI",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "sei",
              base_denom: "usei",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-782",
              path: "transfer/channel-782/usei",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg",
        },
        coingecko_id: "sei-network",
        keywords: ["osmosis-main", "osmosis-price:uosmo:1086"],
        origin_chain_id: "pacific-1",
        origin_chain_name: "sei",
        price_coin_id: "pool:usei",
      },
      {
        description:
          "OIN Token ($OIN) is a groundbreaking digital asset developed on the $SEI Blockchain. It transcends being merely a cryptocurrency; $OIN stands as a robust store of value, symbolizing the future of decentralized finance and its potential to reshape the crypto landscape.",
        denom_units: [
          {
            denom:
              "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
            exponent: 0,
            aliases: ["factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN"],
          },
          {
            denom: "oin",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        address: "sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w",
        base: "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
        name: "OIN STORE OF VALUE",
        display: "oin",
        symbol: "OIN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "sei",
              base_denom:
                "factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-782",
              path: "transfer/channel-782/factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/oin.png",
        },
        keywords: ["osmosis-price:uosmo:1210"],
        origin_chain_id: "pacific-1",
        origin_chain_name: "sei",
        price_coin_id: "pool:oin",
      },
    ],
  },
  {
    chain_name: "passage",
    chain_id: "passage-2",
    assets: [
      {
        description:
          "The native staking and governance token of the Passage chain.",
        denom_units: [
          {
            denom:
              "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
            exponent: 0,
            aliases: ["upasg"],
          },
          {
            denom: "pasg",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
        name: "Passage",
        display: "pasg",
        symbol: "PASG",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "passage",
              base_denom: "upasg",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-2494",
              path: "transfer/channel-2494/upasg",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
        },
        coingecko_id: "passage",
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:1137",
        ],
        origin_chain_id: "passage-2",
        origin_chain_name: "passage",
        price_coin_id: "pool:upasg",
      },
    ],
  },
  {
    chain_name: "gateway",
    chain_id: "wormchain",
    assets: [
      {
        description:
          "Wrapped SOL (Wormhole), SOL, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
        denom_units: [
          {
            denom:
              "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
            ],
          },
          {
            denom: "wormhole/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA/8",
            exponent: 8,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole1wn625s4jcmvk0szpl85rj5azkfc6suyvf75q6vrddscjdphtve8sca0pvl",
        base: "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
        name: "Wrapped SOL (Wormhole)",
        display: "wormhole/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA/8",
        symbol: "SOL",
        traces: [
          {
            type: "wrapped",
            counterparty: {
              chain_name: "solana",
              base_denom: "Lamport",
            },
            provider: "Solana",
          },
          {
            type: "bridge",
            counterparty: {
              chain_name: "solana",
              base_denom: "So11111111111111111111111111111111111111112",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:sol.wh",
      },
      {
        description:
          "Bonk (Wormhole), Bonk, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
        denom_units: [
          {
            denom:
              "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
            ],
          },
          {
            denom: "wormhole/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR/5",
            exponent: 5,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole10qt8wg0n7z740ssvf3urmvgtjhxpyp74hxqvqt7z226gykuus7eq9mpu8u",
        base: "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
        name: "Bonk (Wormhole)",
        display: "wormhole/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR/5",
        symbol: "Bonk",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "solana",
              base_denom: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:bonk.wh",
      },
      {
        description:
          "Tether USD (Wormhole), USDT, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
        denom_units: [
          {
            denom:
              "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
            ],
          },
          {
            denom: "wormhole/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi/6",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole1w27ekqvvtzfanfxnkw4jx2f8gdfeqwd3drkee3e64xat6phwjg0savgmhw",
        base: "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
        name: "Tether USD (Wormhole)",
        display: "wormhole/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi/6",
        symbol: "USDT.wh",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdt.hole.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:usdt.wh",
      },
      {
        description:
          "Sui (Wormhole), SUI, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
        denom_units: [
          {
            denom:
              "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
            ],
          },
          {
            denom: "wormhole/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh/8",
            exponent: 8,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole19hlynxzedrlqv99v6qscww7d3crhl86qtd0vprpltg5g9xx6jk9q6ya33y",
        base: "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
        name: "Sui (Wormhole)",
        display: "wormhole/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh/8",
        symbol: "SUI",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "sui",
              base_denom: "0x2::sui::SUI",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:sui.wh",
      },
      {
        description:
          "Aptos Coin (Wormhole), APT, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
        denom_units: [
          {
            denom:
              "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
            ],
          },
          {
            denom: "wormhole/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r/8",
            exponent: 8,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole1f9sxjn0qu8xylcpzlvnhrefnatndqxnrajfrnr5h97hegnmsdqhsh6juc0",
        base: "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
        name: "Aptos Coin (Wormhole)",
        display: "wormhole/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r/8",
        symbol: "APT",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "aptos",
              base_denom: "0x1::aptos_coin::AptosCoin",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/apt-dm.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:apt.wh",
      },
      {
        description:
          "USD Coin (Wormhole), USDC, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
        denom_units: [
          {
            denom:
              "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
            ],
          },
          {
            denom: "wormhole/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt/6",
            exponent: 6,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole1utjx3594tlvfw4375esgu72wa4sdgf0q7x4ye27husf5kvuzp5rsr72gdq",
        base: "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
        name: "USD Coin (Wormhole)",
        display: "wormhole/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt/6",
        symbol: "USDC.wh",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.hole.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:usdc.wh",
      },
      {
        description:
          "Wrapped Ether (Wormhole), WETH, factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
        denom_units: [
          {
            denom:
              "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
            exponent: 0,
            aliases: [
              "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
            ],
          },
          {
            denom: "wormhole/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp/8",
            exponent: 8,
            aliases: [],
          },
        ],
        type_asset: "ics20",
        address:
          "wormhole18csycs4vm6varkp00apuqlsm7v4twg8jsljk8wfdd7cghr7g4rtslwqndm",
        base: "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
        name: "Wrapped Ether (Wormhole)",
        display: "wormhole/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp/8",
        symbol: "wETH.wh",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "ethereum",
              base_denom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            },
            provider: "Wormhole",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "gateway",
              base_denom:
                "factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-2186",
              path: "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/weth.hole.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "wormchain",
        origin_chain_name: "gateway",
        price_coin_id: "pool:weth.wh",
      },
    ],
  },
  {
    chain_name: "xpla",
    chain_id: "dimension_37-1",
    assets: [
      {
        description: "The native staking token of XPLA.",
        denom_units: [
          {
            denom:
              "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
            exponent: 0,
            aliases: ["axpla"],
          },
          {
            denom: "xpla",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
        name: "Xpla",
        display: "xpla",
        symbol: "XPLA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "xpla",
              base_denom: "axpla",
              channel_id: "channel-9",
            },
            chain: {
              channel_id: "channel-1634",
              path: "transfer/channel-1634/axpla",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.svg",
        },
        coingecko_id: "xpla",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1173"],
        origin_chain_id: "dimension_37-1",
        origin_chain_name: "xpla",
        price_coin_id: "pool:axpla",
      },
    ],
  },
  {
    chain_name: "realio",
    chain_id: "realionetwork_3301-1",
    assets: [
      {
        description: "The native currency of the Realio Network.",
        denom_units: [
          {
            denom:
              "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
            exponent: 0,
            aliases: ["ario"],
          },
          {
            denom: "rio",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
        name: "Realio Network",
        display: "rio",
        symbol: "RIO",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "realio",
              base_denom: "ario",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-1424",
              path: "transfer/channel-1424/ario",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.svg",
        },
        coingecko_id: "realio-network",
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:1180",
        ],
        origin_chain_id: "realionetwork_3301-1",
        origin_chain_name: "realio",
        price_coin_id: "pool:ario",
      },
    ],
  },
  {
    chain_name: "sge",
    chain_id: "sgenet-1",
    assets: [
      {
        description: "The native token of SGE Network",
        denom_units: [
          {
            denom:
              "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
            exponent: 0,
            aliases: ["usge"],
          },
          {
            denom: "sge",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
        name: "SGE",
        display: "sge",
        symbol: "SGE",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "sge",
              base_denom: "usge",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-5485",
              path: "transfer/channel-5485/usge",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.svg",
        },
        coingecko_id: "six-sigma",
        keywords: [
          "osmosis-info",
          "osmosis-price:ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2:1233",
        ],
        origin_chain_id: "sgenet-1",
        origin_chain_name: "sge",
        price_coin_id: "pool:usge",
      },
    ],
  },
  {
    chain_name: "stafihub",
    chain_id: "stafihub-1",
    assets: [
      {
        description:
          "The native staking and governance token of the StaFi Hub.",
        denom_units: [
          {
            denom:
              "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
            exponent: 0,
            aliases: ["ufis"],
          },
          {
            denom: "fis",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        name: "FIS",
        display: "fis",
        symbol: "FIS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "stafihub",
              base_denom: "ufis",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-5413",
              path: "transfer/channel-5413/ufis",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/fis.svg",
        },
        coingecko_id: "stafi",
        keywords: ["osmosis-main"],
        origin_chain_id: "stafihub-1",
        origin_chain_name: "stafihub",
        price_coin_id: "pool:ufis",
      },
      {
        description: "A liquid staking representation of staked ATOMs",
        denom_units: [
          {
            denom:
              "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
            exponent: 0,
            aliases: ["uratom"],
          },
          {
            denom: "ratom",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
        name: "rATOM",
        display: "ratom",
        symbol: "rATOM",
        traces: [
          {
            type: "liquid-stake",
            counterparty: {
              chain_name: "cosmoshub",
              base_denom: "uatom",
            },
            provider: "StaFiHub",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "stafihub",
              base_denom: "uratom",
              channel_id: "channel-10",
            },
            chain: {
              channel_id: "channel-5413",
              path: "transfer/channel-5413/uratom",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/ratom.svg",
        },
        keywords: ["osmosis-main"],
        origin_chain_id: "stafihub-1",
        origin_chain_name: "stafihub",
        price_coin_id: "pool:uratom",
      },
    ],
  },
  {
    chain_name: "doravota",
    chain_id: "vota-ash",
    assets: [
      {
        description:
          "The native staking and governance token of the Theta testnet version of the Dora Vota.",
        denom_units: [
          {
            denom:
              "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
            exponent: 0,
            aliases: ["peaka"],
          },
          {
            denom: "DORA",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
        name: "Dora Vota",
        display: "DORA",
        symbol: "DORA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "doravota",
              base_denom: "peaka",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-2694",
              path: "transfer/channel-2694/peaka",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/doravota/images/dora.svg",
        },
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1239"],
        origin_chain_id: "vota-ash",
        origin_chain_name: "doravota",
        price_coin_id: "pool:peaka",
      },
    ],
  },
  {
    chain_name: "coreum",
    chain_id: "coreum-mainnet-1",
    assets: [
      {
        description: "The native token of Coreum",
        denom_units: [
          {
            denom:
              "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
            exponent: 0,
            aliases: ["ucore"],
          },
          {
            denom: "core",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
        name: "Coreum",
        display: "core",
        symbol: "COREUM",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "coreum",
              base_denom: "ucore",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-2188",
              path: "transfer/channel-2188/ucore",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.svg",
        },
        coingecko_id: "coreum",
        keywords: [
          "dex",
          "staking",
          "wasm",
          "assets",
          "nft",
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:uosmo:1244",
        ],
        origin_chain_id: "coreum-mainnet-1",
        origin_chain_name: "coreum",
        price_coin_id: "pool:ucore",
      },
    ],
  },
  {
    chain_name: "celestia",
    chain_id: "celestia",
    assets: [
      {
        denom_units: [
          {
            denom:
              "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
            exponent: 0,
            aliases: ["utia"],
          },
          {
            denom: "tia",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        name: "Celestia",
        display: "tia",
        symbol: "TIA",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "celestia",
              base_denom: "utia",
              channel_id: "channel-2",
            },
            chain: {
              channel_id: "channel-6994",
              path: "transfer/channel-6994/utia",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg",
        },
        coingecko_id: "celestia",
        keywords: ["osmosis-main", "osmosis-info", "osmosis-price:uosmo:1249"],
        origin_chain_id: "celestia",
        origin_chain_name: "celestia",
        price_coin_id: "pool:utia",
      },
    ],
  },
  {
    chain_name: "dydx",
    chain_id: "dydx-mainnet-1",
    assets: [
      {
        description: "The native staking token of dYdX Protocol.",
        denom_units: [
          {
            denom:
              "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
            exponent: 0,
            aliases: ["adydx"],
          },
          {
            denom: "dydx",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        name: "dYdX",
        display: "dydx",
        symbol: "DYDX",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "dydx",
              base_denom: "adydx",
              channel_id: "channel-3",
            },
            chain: {
              channel_id: "channel-6787",
              path: "transfer/channel-6787/adydx",
            },
          },
        ],
        logo_URIs: {
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx-circle.svg",
        },
        coingecko_id: "dydx",
        keywords: ["osmosis-main", "osmosis-price:uosmo:1285"],
        origin_chain_id: "dydx-mainnet-1",
        origin_chain_name: "dydx",
        price_coin_id: "pool:adydx",
      },
    ],
  },
  {
    chain_name: "fxcore",
    chain_id: "fxcore",
    assets: [
      {
        description: "The native staking token of the Function X",
        denom_units: [
          {
            denom:
              "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
            exponent: 0,
            aliases: ["FX"],
          },
          {
            denom: "WFX",
            exponent: 18,
          },
        ],
        type_asset: "ics20",
        base: "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
        name: "Function X",
        display: "WFX",
        symbol: "FX",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "fxcore",
              base_denom: "FX",
              channel_id: "channel-19",
            },
            chain: {
              channel_id: "channel-2716",
              path: "transfer/channel-2716/FX",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.svg",
        },
        coingecko_id: "fx-coin",
        keywords: ["osmosis-main", "osmosis-price:uosmo:1241"],
        origin_chain_id: "fxcore",
        origin_chain_name: "fxcore",
        price_coin_id: "pool:fx",
      },
    ],
  },
  {
    chain_name: "nomic",
    chain_id: "nomic-stakenet-3",
    assets: [
      {
        description: "Bitcoin. On Cosmos.",
        denom_units: [
          {
            denom:
              "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
            exponent: 0,
            aliases: ["usat"],
          },
          {
            denom: "nbtc",
            exponent: 14,
          },
        ],
        type_asset: "ics20",
        base: "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        name: "Nomic Bitcoin",
        display: "nbtc",
        symbol: "nBTC",
        traces: [
          {
            type: "bridge",
            counterparty: {
              chain_name: "bitcoin",
              base_denom: "sat",
            },
            provider: "Nomic",
          },
          {
            type: "ibc",
            counterparty: {
              chain_name: "nomic",
              base_denom: "usat",
              channel_id: "channel-1",
            },
            chain: {
              channel_id: "channel-6897",
              path: "transfer/channel-6897/usat",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.svg",
        },
        keywords: [
          "osmosis-main",
          "osmosis-info",
          "osmosis-price:ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F:1284",
        ],
        origin_chain_id: "nomic-stakenet-3",
        origin_chain_name: "nomic",
        price_coin_id: "pool:nbtc",
      },
    ],
  },
  {
    chain_name: "nois",
    chain_id: "nois-1",
    assets: [
      {
        description: "The native token of Nois",
        denom_units: [
          {
            denom:
              "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
            exponent: 0,
            aliases: ["unois"],
          },
          {
            denom: "nois",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
        name: "Nois",
        display: "nois",
        symbol: "NOIS",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "nois",
              base_denom: "unois",
              channel_id: "channel-37",
            },
            chain: {
              channel_id: "channel-8277",
              path: "transfer/channel-8277/unois",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.svg",
        },
        keywords: ["nois", "randomness", "drand", "wasm", "osmosis-main"],
        origin_chain_id: "nois-1",
        origin_chain_name: "nois",
        price_coin_id: "pool:unois",
      },
    ],
  },
  {
    chain_name: "qwoyn",
    chain_id: "qwoyn-1",
    assets: [
      {
        description: "QWOYN is the native governance token for Qwoyn Network",
        denom_units: [
          {
            denom:
              "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
            exponent: 0,
            aliases: ["uqwoyn"],
          },
          {
            denom: "qwoyn",
            exponent: 6,
          },
        ],
        type_asset: "ics20",
        base: "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
        name: "Qwoyn Blockchain",
        display: "qwoyn",
        symbol: "QWOYN",
        traces: [
          {
            type: "ibc",
            counterparty: {
              chain_name: "qwoyn",
              base_denom: "uqwoyn",
              channel_id: "channel-0",
            },
            chain: {
              channel_id: "channel-880",
              path: "transfer/channel-880/uqwoyn",
            },
          },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
        },
        keywords: [
          "osmosis-price:ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858:1291",
          "osmosis-unlisted",
        ],
        origin_chain_id: "qwoyn-1",
        origin_chain_name: "qwoyn",
        price_coin_id: "pool:uqwoyn",
      },
    ],
  },
];

export type MainnetAssetSymbols =
  | "OSMO" /** minDenom: uosmo */
  | "ION" /** minDenom: uion */
  | "USDC.axl" /** minDenom: uusdc */
  | "ETH" /** minDenom: weth-wei */
  | "WBTC" /** minDenom: wbtc-satoshi */
  | "USDT.axl" /** minDenom: uusdt */
  | "DAI" /** minDenom: dai-wei */
  | "BUSD" /** minDenom: busd-wei */
  | "ATOM" /** minDenom: uatom */
  | "CRO" /** minDenom: basecro */
  | "BNB" /** minDenom: wbnb-wei */
  | "MATIC" /** minDenom: wmatic-wei */
  | "AVAX" /** minDenom: wavax-wei */
  | "LUNC" /** minDenom: uluna */
  | "JUNO" /** minDenom: ujuno */
  | "DOT.axl" /** minDenom: dot-planck */
  | "EVMOS" /** minDenom: aevmos */
  | "KAVA" /** minDenom: ukava */
  | "SCRT" /** minDenom: uscrt */
  | "USTC" /** minDenom: uusd */
  | "STARS" /** minDenom: ustars */
  | "HUAHUA" /** minDenom: uhuahua */
  | "XPRT" /** minDenom: uxprt */
  | "PSTAKE" /** minDenom: ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444 */
  | "AKT" /** minDenom: uakt */
  | "REGEN" /** minDenom: uregen */
  | "DVPN" /** minDenom: udvpn */
  | "IRIS" /** minDenom: uiris */
  | "IOV" /** minDenom: uiov */
  | "NGM" /** minDenom: ungm */
  | "EEUR" /** minDenom: eeur */
  | "LIKE" /** minDenom: nanolike */
  | "IXO" /** minDenom: uixo */
  | "BCNA" /** minDenom: ubcna */
  | "BTSG" /** minDenom: ubtsg */
  | "XKI" /** minDenom: uxki */
  | "MED" /** minDenom: umed */
  | "BOOT" /** minDenom: boot */
  | "CMDX" /** minDenom: ucmdx */
  | "CHEQ" /** minDenom: ncheq */
  | "LUM" /** minDenom: ulum */
  | "VDL" /** minDenom: uvdl */
  | "DSM" /** minDenom: udsm */
  | "DIG" /** minDenom: udig */
  | "SOMM" /** minDenom: usomm */
  | "BAND" /** minDenom: uband */
  | "DARC" /** minDenom: udarc */
  | "UMEE" /** minDenom: uumee */
  | "GRAV" /** minDenom: ugraviton */
  | "DEC" /** minDenom: udec */
  | "MARBLE" /** minDenom: cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl */
  | "SWTH" /** minDenom: swth */
  | "CRBRUS" /** minDenom: ucrbrus */
  | "FET" /** minDenom: afet */
  | "MNTL" /** minDenom: umntl */
  | "NETA" /** minDenom: cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr */
  | "INJ" /** minDenom: inj */
  | "KRTC" /** minDenom: ukrw */
  | "TICK" /** minDenom: utick */
  | "ROWAN" /** minDenom: rowan */
  | "CTK" /** minDenom: uctk */
  | "HOPE" /** minDenom: cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z */
  | "RAC" /** minDenom: cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa */
  | "FRAX" /** minDenom: frax-wei */
  | "WBTC.grv" /** minDenom: gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 */
  | "WETH.grv" /** minDenom: gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 */
  | "USDC.grv" /** minDenom: gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 */
  | "DAI.grv" /** minDenom: gravity0x6B175474E89094C44Da98b954EedeAC495271d0F */
  | "USDT.grv" /** minDenom: gravity0xdAC17F958D2ee523a2206206994597C13D831ec7 */
  | "BLOCK" /** minDenom: cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq */
  | "HASH" /** minDenom: nhash */
  | "GLX" /** minDenom: uglx */
  | "DHK" /** minDenom: cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49 */
  | "RAW" /** minDenom: cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g */
  | "MEME" /** minDenom: umeme */
  | "ASVT" /** minDenom: cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w */
  | "JOE" /** minDenom: cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3 */
  | "LUNA" /** minDenom: uluna */
  | "ATOLO" /** minDenom: uatolo */
  | "HARD" /** minDenom: hard */
  | "SWP" /** minDenom: swp */
  | "LINK" /** minDenom: link-wei */
  | "L1" /** minDenom: el1 */
  | "AAVE" /** minDenom: aave-wei */
  | "APE" /** minDenom: ape-wei */
  | "AXS" /** minDenom: axs-wei */
  | "MKR" /** minDenom: mkr-wei */
  | "RAI" /** minDenom: rai-wei */
  | "SHIB" /** minDenom: shib-wei */
  | "UNI" /** minDenom: uni-wei */
  | "XCN" /** minDenom: xcn-wei */
  | "KUJI" /** minDenom: ukuji */
  | "TGD" /** minDenom: utgd */
  | "ECH" /** minDenom: aechelon */
  | "ODIN" /** minDenom: loki */
  | "GEO" /** minDenom: mGeo */
  | "O9W" /** minDenom: mO9W */
  | "LVN" /** minDenom: cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy */
  | "GLMR" /** minDenom: wglmr-wei */
  | "GLTO" /** minDenom: cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se */
  | "GKEY" /** minDenom: cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh */
  | "CRE" /** minDenom: ucre */
  | "LUMEN" /** minDenom: ulumen */
  | "ORAI" /** minDenom: orai */
  | "CUDOS" /** minDenom: acudos */
  | "USDX" /** minDenom: usdx */
  | "BLD" /** minDenom: ubld */
  | "IST" /** minDenom: uist */
  | "SEJUNO" /** minDenom: cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv */
  | "BJUNO" /** minDenom: cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3 */
  | "STRD" /** minDenom: ustrd */
  | "stATOM" /** minDenom: stuatom */
  | "stSTARS" /** minDenom: stustars */
  | "SOLAR" /** minDenom: cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse */
  | "SEASY" /** minDenom: cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf */
  | "AXL" /** minDenom: uaxl */
  | "REBUS" /** minDenom: arebus */
  | "TORI" /** minDenom: utori */
  | "stJUNO" /** minDenom: stujuno */
  | "stOSMO" /** minDenom: stuosmo */
  | "MUSE" /** minDenom: cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3 */
  | "LAMB" /** minDenom: ulamb */
  | "USK" /** minDenom: factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk */
  | "FUND" /** minDenom: nund */
  | "JKL" /** minDenom: ujkl */
  | "ALTER" /** minDenom: cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej */
  | "BUTT" /** minDenom: cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt */
  | "SHD(old)" /** minDenom: cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d */
  | "SIENNA" /** minDenom: cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4 */
  | "stkd-SCRT" /** minDenom: cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4 */
  | "BZE" /** minDenom: ubze */
  | "FURY" /** minDenom: cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz */
  | "ACRE" /** minDenom: aacre */
  | "CMST" /** minDenom: ucmst */
  | "IMV" /** minDenom: aimv */
  | "MEDAS" /** minDenom: umedas */
  | "PHMN" /** minDenom: cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l */
  | "AMBER" /** minDenom: cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852 */
  | "NOM" /** minDenom: anom */
  | "stkATOM" /** minDenom: stk/uatom */
  | "DYS" /** minDenom: dys */
  | "HOPERS" /** minDenom: cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n */
  | "arUSD" /** minDenom: erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c */
  | "PLQ" /** minDenom: aplanq */
  | "FTM" /** minDenom: wftm-wei */
  | "CANTO" /** minDenom: acanto */
  | "qSTARS" /** minDenom: uqstars */
  | "WYND" /** minDenom: cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9 */
  | "polygon.USDC" /** minDenom: polygon-uusdc */
  | "avalanche.USDC" /** minDenom: avalanche-uusdc */
  | "MARS" /** minDenom: umars */
  | "CNTO" /** minDenom: erc20/0xAE6D3334989a22A65228732446731438672418F2 */
  | "stLUNA" /** minDenom: stuluna */
  | "stEVMOS" /** minDenom: staevmos */
  | "NRIDE" /** minDenom: cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq */
  | "EBL" /** minDenom: uebl */
  | "qATOM" /** minDenom: uqatom */
  | "HARBOR" /** minDenom: uharbor */
  | "qREGEN" /** minDenom: uqregen */
  | "FOX" /** minDenom: cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x */
  | "QCK" /** minDenom: uqck */
  | "ARKH" /** minDenom: arkh */
  | "qOSMO" /** minDenom: uqosmo */
  | "FRNZ" /** minDenom: ufrienzies */
  | "WHALE" /** minDenom: uwhale */
  | "GRDN" /** minDenom: cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma */
  | "MNPU" /** minDenom: cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my */
  | "SHIBAC" /** minDenom: cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z */
  | "SKOJ" /** minDenom: cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp */
  | "NCT" /** minDenom: eco.uC.NCT */
  | "CLST" /** minDenom: cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg */
  | "OSDOGE" /** minDenom: cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je */
  | "APEMOS" /** minDenom: cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06 */
  | "INVDRS" /** minDenom: cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8 */
  | "DOGA" /** minDenom: cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d */
  | "CATMOS" /** minDenom: cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488 */
  | "SUMMIT" /** minDenom: cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm */
  | "FLIX" /** minDenom: uflix */
  | "SPACER" /** minDenom: cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg */
  | "LIGHT" /** minDenom: cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l */
  | "SILK" /** minDenom: cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd */
  | "MILE" /** minDenom: cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d */
  | "MANNA" /** minDenom: cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq */
  | "FIL" /** minDenom: wfil-wei */
  | "VOID" /** minDenom: cw20:juno1lpvx3mv2a6ddzfjc7zzz2v2cm5gqgqf0hx67hc5p5qwn7hz4cdjsnznhu8 */
  | "SHD" /** minDenom: cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm */
  | "BLZ" /** minDenom: ubnt */
  | "ARB" /** minDenom: arb-wei */
  | "SLCA" /** minDenom: cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux */
  | "PEPEC" /** minDenom: cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k */
  | "PEPE" /** minDenom: pepe-wei */
  | "IBCX" /** minDenom: factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx */
  | "cbETH" /** minDenom: cbeth-wei */
  | "rETH" /** minDenom: reth-wei */
  | "sfrxETH" /** minDenom: sfrxeth-wei */
  | "wstETH.axl" /** minDenom: wsteth-wei */
  | "LORE" /** minDenom: ulore */
  | "ROAR" /** minDenom: cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv */
  | "stUMEE" /** minDenom: stuumee */
  | "stIBCX" /** minDenom: factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx */
  | "NLS" /** minDenom: unls */
  | "CUB" /** minDenom: cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t */
  | "BLUE" /** minDenom: cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584 */
  | "NTRN" /** minDenom: untrn */
  | "CASA" /** minDenom: cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss */
  | "PICA" /** minDenom: ppica */
  | "KSM" /** minDenom: ibc/EE9046745AEC0E8302CB7ED9D5AD67F528FB3B7AE044B247FB0FB293DBDA35E9 */
  | "DOT" /** minDenom: ibc/3CC19CEC7E5A3E90E78A5A9ECC5A0E2F8F826A375CF1E096F4515CF09DA3E366 */
  | "QSR" /** minDenom: uqsr */
  | "ARCH" /** minDenom: aarch */
  | "MPWR" /** minDenom: umpwr */
  | "WATR" /** minDenom: cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw */
  | "KYVE" /** minDenom: ukyve */
  | "USDT" /** minDenom: erc20/tether/usdt */
  | "ampOSMO" /** minDenom: factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO */
  | "SEI" /** minDenom: usei */
  | "qSOMM" /** minDenom: uqsomm */
  | "PASG" /** minDenom: upasg */
  | "stSOMM" /** minDenom: stusomm */
  | "SOL" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA */
  | "Bonk" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/95mnwzvJZJ3fKz77xfGN2nR5to9pZmH8YNvaxgLgw5AR */
  | "USDT.wh" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8iuAc6DSeLvi2JDUtwJxLytsZT8R19itXebZsNReLLNi */
  | "SUI" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh */
  | "APT" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5wS2fGojbL9RhGEAeQBdkHPUAciYDxjDTMYvdf9aDn2r */
  | "MNTA" /** minDenom: factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta */
  | "DGL" /** minDenom: factory/juno1u805lv20qc6jy7c3ttre7nct6uyl20pfky5r7e/DGL */
  | "USDC.wh" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt */
  | "wETH.wh" /** minDenom: factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5BWqpR48Lubd55szM5i62zK7TFkddckhbT48yy6mNbDp */
  | "USDC" /** minDenom: uusdc */
  | "YieldETH" /** minDenom: yieldeth-wei */
  | "XPLA" /** minDenom: axpla */
  | "OIN" /** minDenom: factory/sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w/OIN */
  | "NEOK" /** minDenom: erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9 */
  | "RIO" /** minDenom: ario */
  | "CDT" /** minDenom: factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt */
  | "MBRN" /** minDenom: factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn */
  | "SGE" /** minDenom: usge */
  | "FIS" /** minDenom: ufis */
  | "rATOM" /** minDenom: uratom */
  | "STRDST" /** minDenom: factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust */
  | "DORA" /** minDenom: peaka */
  | "COREUM" /** minDenom: ucore */
  | "TIA" /** minDenom: utia */
  | "DYDX" /** minDenom: adydx */
  | "FX" /** minDenom: FX */
  | "nBTC" /** minDenom: usat */
  | "NOIS" /** minDenom: unois */
  | "sqOSMO" /** minDenom: factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo */
  | "NSTK" /** minDenom: factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk */
  | "BRNCH" /** minDenom: factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH */
  | "wstETH" /** minDenom: factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH */
  | "sqATOM" /** minDenom: factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom */
  | "sqBTC" /** minDenom: factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc */
  | "QWOYN" /** minDenom: uqwoyn */;
export type TestnetAssetSymbols =
  | "OSMO" /** minDenom: uosmo */
  | "ION" /** minDenom: uion */
  | "ATOM" /** minDenom: uatom */
  | "aUSDC" /** minDenom: uausdc */
  | "ETH" /** minDenom: eth-wei */
  | "JUNOX" /** minDenom: ujunox */
  | "MARS" /** minDenom: umars */
  | "USDC" /** minDenom: uusdc */
  | "AKT" /** minDenom: uakt */
  | "KYVE" /** minDenom: tkyve */
  | "QCK" /** minDenom: uqck */
  | "C4E" /** minDenom: uc4e */
  | "XPRT" /** minDenom: uxprt */
  | "XION" /** minDenom: uxion */;
