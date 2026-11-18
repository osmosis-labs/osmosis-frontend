import type { walletInstallers as clientWalletInstallers } from "./wallet-installers";

const browserOnly = () =>
  Promise.reject(new Error("Wallets can only be installed in the browser"));

/**
 * Server stand-in for `wallet-installers.ts`, swapped in by `next.config.js`.
 * Wallets are only installed from the wallet-select flow, which never runs on
 * the server.
 */
export const walletInstallers: Record<
  keyof typeof clientWalletInstallers,
  () => Promise<never>
> = {
  "keplr-extension": browserOnly,
  "keplr-mobile": browserOnly,
  "okxwallet-extension": browserOnly,
  "cdcwallet-extension": browserOnly,
  "xdefi-extension": browserOnly,
  "station-extension": browserOnly,
};
