/**
 * Loaders for the Cosmos wallet classes, keyed by cosmos-kit wallet name.
 * Server builds replace this module with `wallet-installers.server.ts` (see
 * `next.config.js`) so the wallet SDKs, WalletConnect and their dependencies
 * stay out of the server bundle. Wallets are only installed from the
 * wallet-select flow in the browser.
 */
export const walletInstallers = {
  "keplr-extension": () =>
    import("@cosmos-kit/keplr-extension").then((m) => m.KeplrExtensionWallet),
  "keplr-mobile": () =>
    import("~/integrations/keplr-walletconnect").then(
      (m) => m.KeplrMobileWallet
    ),
  "okxwallet-extension": () =>
    import("@cosmos-kit/okxwallet-extension").then(
      (m) => m.OkxwalletExtensionWallet
    ),
  "cdcwallet-extension": () =>
    import("@cosmos-kit/cdcwallet-extension").then(
      (m) => m.CdcwalletExtensionWallet
    ),
  "xdefi-extension": () =>
    import("@cosmos-kit/xdefi-extension").then((m) => m.XDEFIExtensionWallet),
  "station-extension": () =>
    import("@cosmos-kit/station-extension").then(
      (m) => m.StationExtensionWallet
    ),
};
