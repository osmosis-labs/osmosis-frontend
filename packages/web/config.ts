import { ChainInfo } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfoWithExplorer } from "./stores/chain";

export const EmbedChainInfos: ChainInfoWithExplorer[] = [
  {
    rpc: "https://rpc-osmosis.keplr.app",
    rest: "https://lcd-osmosis.keplr.app",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
      coinImageUrl: "https://app.osmosis.zone/public/assets/tokens/osmosis.svg",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("osmo"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          "https://app.osmosis.zone/public/assets/tokens/osmosis.svg",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
        coinImageUrl: "https://app.osmosis.zone/public/assets/tokens/ion.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          "https://app.osmosis.zone/public/assets/tokens/osmosis.svg",
      },
    ],
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
    explorerUrlToTx: "https://www.mintscan.io/osmosis/txs/{txHash}",
  },
];
