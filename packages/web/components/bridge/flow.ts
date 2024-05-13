import { Provider } from "react";

import { BridgeContext } from "~/hooks/bridge";

/** A bridge flow for UI for deposit/withdraw or fiat on ramping capable of handling the bridge context provider. */
export interface BridgeFlowProvider {
  Provider: Provider<BridgeContext>;
}
