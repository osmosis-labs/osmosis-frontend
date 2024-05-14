import { WalletKey } from "~/integrations/wallets";

import { AxelarBridgeConfig } from "./axelar";

export type OriginBridgeInfo = {
  bridge: "axelar" | "nomic";
  wallets: WalletKey[];
} & AxelarBridgeConfig;
