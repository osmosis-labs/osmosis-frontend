import { EthereumChainInfo } from "@osmosis-labs/utils";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

import { WALLETCONNECT_PROJECT_KEY } from "~/config/env";
import { theme } from "~/tailwind.config";

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: EthereumChainInfo,
  transports: Object.fromEntries(
    EthereumChainInfo.map((info) => [info.id, http()])
  ),
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Osmosis",
        url: "https://osmosis.zone",
        iconUrl: "https://osmosis.zone/favicon.ico",
      },
      injectProvider: false,
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_KEY ?? "",
      qrModalOptions: {
        themeVariables: {
          "--wcm-accent-color": theme.colors.wosmongton[300],
          "--wcm-background-color": theme.colors.osmoverse[700],
          "--wcm-font-family": "Inter, ui-sans-serif, system-ui",
          "--wcm-z-index": "9999",
        },
      },
    }),
    coinbaseWallet({
      appLogoUrl: "https://osmosis.zone/favicon.ico",
      appName: "Osmosis",
    }),
  ],
});

export type EthereumChainIds = (typeof wagmiConfig)["chains"][number]["id"];
