import { FunctionComponent } from "react";

import { FiatRampKey } from "~/integrations";

import { BridgeFlowProvider } from "../flow";

export const ImmersiveBridgeFlow: FunctionComponent<BridgeFlowProvider> = ({
  Provider,
  children,
}) => {
  return (
    <Provider
      value={{
        startBridge: (direction: "deposit" | "withdraw") => {
          console.log("startBridge", direction);
        },
        bridgeAsset: (anyDenom: string, direction: "deposit" | "withdraw") => {
          console.log("bridgeAsset", anyDenom, direction);
        },
        fiatRamp: (fiatRampKey: FiatRampKey, assetKey: string) => {
          console.log("fiatRamp", fiatRampKey, assetKey);
        },
        fiatRampSelection: () => {
          console.log("fiatRampSelection");
        },
      }}
    >
      New flow
      {children}
    </Provider>
  );
};
