import { AxelarBridgeConfig, SourceChain } from "./axelar/types";
import { WalletKey } from "./wallets";

// Add to these types as more bridges are integrated

export type OriginBridgeInfo = {
  bridge: "axelar";
  wallets: WalletKey[];
} & AxelarBridgeConfig;

/** String literal identifiers for a source chain. */
export type SourceChainKey = SourceChain;
