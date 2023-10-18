import { ChainInfo } from "@keplr-wallet/types";

import { UnsafeIbcCurrencyRegistrar } from "../unsafe-ibc";

export const mockChainInfos: ChainInfo[] = [
  {
    rpc: "https://rpc-osmosis.keplr.app/",
    rest: "https://lcd-osmosis-baba.keplr.app/",
    chainId: "osmosis-1",
    chainName: "Osmosis",
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
  {
    // ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
    counterpartyChainId: "cosmoshub-4",
    sourceChannelId: "channel-0",
    coinMinimalDenom: "uatom",
  },
  {
    // SHD
    // ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A
    counterpartyChainId: "cosmoshub-4",
    sourceChannelId: "channel-476",
    coinMinimalDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
  },
  {
    // ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961
    counterpartyChainId: "cosmoshub-4",
    sourceChannelId: "channel-4",
    coinMinimalDenom:
      "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
    ibcTransferPathDenom:
      "transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
  },
];
