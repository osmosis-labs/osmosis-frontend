import { AxelarBridgeConfig, SourceChain } from "./axelar/types";
import { WalletKey } from "./wallets";

// Add to these types as more bridges are integrated

export type OriginBridgeInfo = {
  bridge: "axelar";
  wallets: WalletKey[];
} & AxelarBridgeConfig;

/** String literal identifiers for a source chain. */
export type SourceChainKey = SourceChain;

// Fiat on/off ramps

export type FiatRampKey = "kado" | "transak";
export const FiatRampDisplayInfos: {
  [key: string]: { iconUrl: string; displayName: string };
} = {
  kado: {
    iconUrl: "/logos/kado.svg",
    displayName: "Kado",
  },
  transak: {
    iconUrl: "/logos/transak.svg",
    displayName: "Transak",
  },
};
