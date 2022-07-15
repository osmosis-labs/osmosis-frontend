import { AxelarBridgeConfig } from "./axelar/types";

export type OriginBridgeInfo = {
  bridge: "axelar";
} & AxelarBridgeConfig;
