import { useState } from "react";
import { ObservableSlippageConfig } from "@osmosis-labs/stores";

// CONTRACT: Use with `observer`
export const useSlippageConfig = () => {
  const [config] = useState(() => new ObservableSlippageConfig());

  return config;
};
