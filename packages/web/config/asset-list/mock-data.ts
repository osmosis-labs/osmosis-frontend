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
        keywords: ["osmosis-price:uosmo:649"],
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
        keywords: ["osmosis-info", "osmosis-price:uosmo:669"],
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
        keywords: ["osmosis-price:uosmo:700"],
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
          "osmosis-info",
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
        keywords: ["osmosis-price:uosmo:949"],
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
];
