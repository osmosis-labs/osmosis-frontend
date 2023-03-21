import { Environment } from "@axelar-network/axelarjs-sdk";
import { useState } from "react";

import { ObservableAxelarUIConfig } from "../axelar-deposit-address-ui-config";

export function useAxelarConfig(environment = Environment.MAINNET) {
  const [config] = useState(() => new ObservableAxelarUIConfig(environment));
  return config;
}
