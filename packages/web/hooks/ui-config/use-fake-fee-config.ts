import { useState } from "react";
import { ChainGetter } from "@keplr-wallet/stores";
import { FakeFeeConfig } from "@osmosis-labs/stores";
import { FeeType } from "@keplr-wallet/hooks";

/** Maintains a single instance of `FakeFeeConfig` for React view lifecycle.
 *  Updates `chainId` and `feeType` on render.
 */
export function useFakeFeeConfig(
  chainGetter: ChainGetter,
  chainId: string,
  gas: number,
  feeType?: FeeType
) {
  const [feeConfig] = useState(
    () => new FakeFeeConfig(chainGetter, chainId, gas)
  );
  feeConfig.setChain(chainId);
  feeConfig.setFeeType(feeType);
  return feeConfig;
}
