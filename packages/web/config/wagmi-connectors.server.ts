import type { CreateConnectorFn } from "wagmi";

/**
 * Server stand-in for `wagmi-connectors.ts`, swapped in by `next.config.js`.
 * Connectors are only used from the wallet-select modals, which never render
 * on the server, so SSR runs with none.
 */
export function createWagmiConnectors(): CreateConnectorFn[] {
  return [];
}
