import { useState } from "react";
import { ObservableSlippageConfig } from "@osmosis-labs/stores";

/** Maintains a single instance of `ObservableSlippageConfig` for React view lifecycle.
 */
export function useSlippageConfig() {
  const [slippageConfig] = useState(() => new ObservableSlippageConfig());
  return slippageConfig;
}
