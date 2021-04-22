import { ChainInfo } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: "http://127.0.0.1:26657",
    rest: "http://127.0.0.1:1317",
    chainId: "localnet-1",
    chainName: "OSMOSIS",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6
    },
    bip44: {
      coinType: 118
    },
    bech32Config: Bech32Address.defaultBech32Config("cosmos"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6
      },
      {
        coinDenom: "FOO",
        coinMinimalDenom: "ufoo",
        coinDecimals: 6
      },
      {
        coinDenom: "BAR",
        coinMinimalDenom: "ubar",
        coinDecimals: 6
      }
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6
      }
    ],
    features: ["stargate"]
  }
];
