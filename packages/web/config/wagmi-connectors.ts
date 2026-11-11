import type { CreateConnectorFn } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

import { WALLETCONNECT_PROJECT_KEY } from "~/config/env";
import { theme } from "~/tailwind.config";

/**
 * Scopes the EVM WalletConnect client to its own storage keys and its own
 * WalletConnect Core. Without it, it shares the default keys, and the Core
 * registered on `globalThis`, with the Keplr Mobile client
 * (`integrations/core-walletconnect`). On load the EVM provider then adopts the
 * first stored session, which can be the cosmos-only Keplr Mobile one. It fails
 * to read the `eip155` namespace and disconnects that session, deleting its key
 * from the shared keychain, so Keplr Mobile signing fails with
 * "session topic does not exist in keychain".
 *
 * `EthereumProvider.init` passes this through to its sign client, but the
 * option is missing from its types, so it is spread in rather than written
 * inline.
 */
const evmWalletConnectStorage = { customStoragePrefix: "wagmi" };

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
      ...evmWalletConnectStorage,
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
      // The SDK's telemetry loads its analytics bundle as an inline script on
      // every page, which the Content-Security-Policy blocks. `all` is the
      // SDK's default (Smart Wallet and the extension).
      preference: { options: "all", telemetry: false },
    }),
  ];
}
