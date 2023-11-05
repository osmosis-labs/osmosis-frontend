import type { ChainInfo } from "@osmosis-labs/types";

import { UnsafeIbcCurrencyRegistrar } from "../unsafe-ibc";

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
];

// for mock purposes, all IBC assets are Cosmos <> Osmosis
export const mockIbcAssets: ConstructorParameters<
  typeof UnsafeIbcCurrencyRegistrar
>[1] = [
  // ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
  {
    description: "The native staking and governance token of the Cosmos Hub.",
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
  // SHD
  // ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A
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
  // ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961
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
];
