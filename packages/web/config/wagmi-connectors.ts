import type { CreateConnectorFn } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

import { WALLETCONNECT_PROJECT_KEY } from "~/config/env";
import { theme } from "~/tailwind.config";

/**
 * The EVM wallet connectors. Server builds replace this module with
 * `wagmi-connectors.server.ts` (see `next.config.js`): the connector SDKs
 * (MetaMask, Reown AppKit, Coinbase's CDP SDK, Porto) only run in the browser,
 * and keeping them out of the server bundle took the Cloudflare Worker from 9.3MB to 6.6MB gzipped.
 */
export function createWagmiConnectors(): CreateConnectorFn[] {
  return [
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
        // The provider renders Reown AppKit and maps these legacy `--wcm-*`
        // variables onto it. The background colour is not mapped, so use
        // AppKit's dark theme instead.
        themeMode: "dark",
        themeVariables: {
          "--wcm-accent-color": theme.colors.wosmongton[300],
          "--wcm-font-family": "Inter, ui-sans-serif, system-ui",
          "--wcm-z-index": "9999",
        },
      },
    }),
    coinbaseWallet({
      appLogoUrl: "https://osmosis.zone/favicon.ico",
      appName: "Osmosis",
    }),
  ];
}
