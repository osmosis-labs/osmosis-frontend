import { EthereumChainInfo } from "@osmosis-labs/utils";
import { useEffect } from "react";
import { createConfig, type CreateConnectorFn } from "wagmi";
import { reconnect } from "wagmi/actions";

import { getClientEvmRpcTransport } from "~/utils/evm-rpc";

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

/**
 * Starts with zero static SDK connectors so MetaMask SDK, Reown AppKit, and
 * Coinbase CDP SDK (~2.7 MB gzipped) stay out of the initial client bundle.
 * EIP-6963 browser extensions are still discovered automatically; SDK
 * connectors are loaded on demand via `ensureEvmConnectorsLoaded`.
 */
export const wagmiConfig = createConfig({
  chains: EthereumChainInfo,
  transports: Object.fromEntries(
    EthereumChainInfo.map((info) => [info.id, getClientEvmRpcTransport(info)])
  ),
  connectors: [] as CreateConnectorFn[],
});

let connectorsLoadPromise: Promise<void> | undefined;

const SDK_CONNECTOR_IDS = ["metaMaskSDK", "walletConnect", "coinbaseWalletSDK"];

/** True when localStorage holds a prior wagmi SDK session worth auto-restoring. */
export function hasPersistedEvmSdkSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const recent = window.localStorage.getItem("wagmi.recentConnectorId");
    if (recent && SDK_CONNECTOR_IDS.some((id) => recent.includes(id))) {
      return true;
    }
    const store = window.localStorage.getItem("wagmi.store");
    return Boolean(store && SDK_CONNECTOR_IDS.some((id) => store.includes(id)));
  } catch {
    return false;
  }
}

/** Waits until any in-flight WagmiProvider startup reconnect finishes. */
function waitForReconnectIdle(timeoutMs = 5_000): Promise<void> {
  if (wagmiConfig.state.status !== "reconnecting") return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve();
    };
    const unsubscribe = wagmiConfig.subscribe(
      (state) => state.status,
      (status) => {
        if (status !== "reconnecting") done();
      }
    );
    const timer = setTimeout(done, timeoutMs);
    if (wagmiConfig.state.status !== "reconnecting") done();
  });
}

/**
 * Dynamically imports and registers the EVM wallet SDK connectors once.
 * Safe to call repeatedly; concurrent callers share one load promise.
 */
export function ensureEvmConnectorsLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (connectorsLoadPromise) return connectorsLoadPromise;

  connectorsLoadPromise = import("~/config/wagmi-connectors")
    .then(async ({ createWagmiConnectors }) => {
      const fns = createWagmiConnectors();
      const existingIds = new Set(wagmiConfig.connectors.map((c) => c.id));
      const added = fns
        .map((fn) => wagmiConfig._internal.connectors.setup(fn))
        .filter((connector) => !existingIds.has(connector.id));

      if (added.length > 0) {
        wagmiConfig._internal.connectors.setState((prev) => [
          ...prev,
          ...added,
        ]);
        if (hasPersistedEvmSdkSession()) {
          // Wait for WagmiProvider's initial reconnect pass to settle so we
          // neither race with it (which causes `reconnect` to return `[]`) nor
          // clobber an already-connected EIP-6963 injected wallet.
          await waitForReconnectIdle();
          if (wagmiConfig.state.connections.size === 0) {
            await reconnect(wagmiConfig, { connectors: added }).catch(
              () => undefined
            );
          }
        }
      }
    })
    .catch((err) => {
      connectorsLoadPromise = undefined;
      console.error("Failed to load EVM wallet connectors", err);
    });

  return connectorsLoadPromise;
}

/** Loads EVM SDK connectors on demand when `enabled` becomes true. */
export function useEnsureEvmConnectors(enabled: boolean) {
  useEffect(() => {
    if (enabled) {
      void ensureEvmConnectorsLoaded();
    }
  }, [enabled]);
}

export type EthereumChainIds = (typeof wagmiConfig)["chains"][number]["id"];
