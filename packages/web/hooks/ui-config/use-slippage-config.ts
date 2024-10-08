import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import { useEffect, useState } from "react";

/** Maintains a single instance of `ObservableSlippageConfig` for React view lifecycle.
 */
export function useSlippageConfig({
  defaultSlippage = "0.5",
  selectedIndex = 0,
}: Partial<{
  defaultSlippage: string;
  selectedIndex: number;
}> = {}) {
  const [slippageConfig] = useState(() => new ObservableSlippageConfig());

  useEffect(() => {
    slippageConfig.setDefaultSlippage(defaultSlippage);
    slippageConfig.select(selectedIndex);
  }, [defaultSlippage, selectedIndex, slippageConfig]);
  return slippageConfig;
}
