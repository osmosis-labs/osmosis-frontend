import { Transition } from "@headlessui/react";
import { FunctionComponent, useState } from "react";

import { Button } from "~/components/ui/button";
import { FiatRampKey } from "~/integrations";

import { BridgeFlowProvider } from "../flow";

export const ImmersiveBridgeFlow: FunctionComponent<BridgeFlowProvider> = ({
  Provider,
  children,
}) => {
  // TODO: state will be encapsulated in a state hook
  const [isShowing, setIsShowing] = useState(false);

  return (
    <Provider
      value={{
        startBridge: (direction: "deposit" | "withdraw") => {
          setIsShowing(true);
          console.log("startBridge", direction);
        },
        bridgeAsset: (anyDenom: string, direction: "deposit" | "withdraw") => {
          setIsShowing(true);
          console.log("bridgeAsset", anyDenom, direction);
        },
        fiatRamp: (fiatRampKey: FiatRampKey, assetKey: string) => {
          setIsShowing(true);
          console.log("fiatRamp", fiatRampKey, assetKey);
        },
        fiatRampSelection: () => {
          setIsShowing(true);
          console.log("fiatRampSelection");
        },
      }}
    >
      {children}
      <Transition
        show={isShowing}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="bg-white rounded p-4 text-center shadow-lg">
          I will fade in and out
          <Button onClick={() => setIsShowing(false)}>OK</Button>
        </div>
      </Transition>
    </Provider>
  );
};
