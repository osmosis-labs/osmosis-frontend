import { ChainGetter } from "@keplr-wallet/stores";
import { FakeFeeConfig } from "@osmosis-labs/stores";
import { useState } from "react";

/** Maintains a single instance of `FakeFeeConfig` for React view lifecycle.
 *  Updates `chainId` and `feeType` on render.
 */
export function useFakeFeeConfig(
  chainGetter: ChainGetter,
  chainId: string,
  gas: number,
  shouldZero: boolean = false
) {
  const [feeConfig] = useState(
    () => new FakeFeeConfig(chainGetter, chainId, gas)
  );
  feeConfig.setChain(chainId);
  feeConfig.setShouldZero(shouldZero);
  return feeConfig;
}
