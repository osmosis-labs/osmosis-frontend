import type { Asset, ChainInfoWithExplorer } from "@osmosis-labs/types";

export const mockChainInfos: ChainInfoWithExplorer[] = [
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
    explorerUrlToTx: "",
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
    explorerUrlToTx: "",
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
    explorerUrlToTx: "",
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
    explorerUrlToTx: "",
  },
];

// for mock purposes, all IBC assets are Cosmos <> Osmosis
export const mockIbcAssets: Asset[] = [
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
    sourceDenom: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
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
    sourceDenom: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
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
    sourceDenom: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
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
    sourceDenom: "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
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
    sourceDenom: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
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
    sourceDenom: "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
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
    sourceDenom: "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
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
    coinMinimalDenom: "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
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
    coinMinimalDenom: "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
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
    sourceDenom: "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
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
    sourceDenom: "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
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
];
