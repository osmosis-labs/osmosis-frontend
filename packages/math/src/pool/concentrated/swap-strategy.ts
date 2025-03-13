import { Dec } from "@osmosis-labs/unit";

import { OneForZeroStrategy } from "./one-for-zero";
import { SwapStrategy } from "./types";
import { ZeroForOneStrategy } from "./zero-for-one";

export function makeSwapStrategy(
  izZeroForOne: boolean,
  sqrtPriceLimit: Dec,
  swapFee: Dec
): SwapStrategy {
  if (izZeroForOne) {
    return new ZeroForOneStrategy({ sqrtPriceLimit, swapFee });
  }
  return new OneForZeroStrategy({ sqrtPriceLimit, swapFee });
}

export { SwapStrategy } from "./types";
