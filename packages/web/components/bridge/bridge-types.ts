import type { Bridge } from "@osmosis-labs/bridge";
import { CoinPretty } from "@osmosis-labs/unit";

import { SupportedAsset } from "./use-bridges-supported-assets";

export type SupportedAssetWithAmount = SupportedAsset & { amount: CoinPretty };

export type SupportedBridgeInfo = {
  allBridges: Bridge[];
  quoteBridges: Bridge[];
  externalUrlBridges: Bridge[];
  depositAddressBridges: Bridge[];
};
