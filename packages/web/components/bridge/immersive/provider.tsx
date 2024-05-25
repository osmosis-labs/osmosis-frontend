import { Transition } from "@headlessui/react";
import { PropsWithChildren, useState } from "react";

import { StepProgress } from "~/components/stepper/progress-bar";
import { Button } from "~/components/ui/button";
import { FiatRampKey } from "~/integrations";

import { BridgeFlowProvider } from "../flow";

export const ImmersiveBridgeFlow = ({
  Provider,
  children,
}: PropsWithChildren<BridgeFlowProvider>) => {
  // TODO: state will be encapsulated in a state hook
  const [isShowing, setIsShowing] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  return (
    <Provider
      value={{
        // globally received events
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
        className="fixed inset-0 z-[999] flex items-center justify-center bg-osmoverse-900"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex flex-col gap-10">
          <StepProgress
            className="w-full"
            steps={[
              { displayLabel: "Asset" },
              { displayLabel: "Network" },
              { displayLabel: "Amount" },
              { displayLabel: "Review" },
              { displayLabel: "Deposit" },
            ]}
            currentStep={step}
          />
          <div className="flex gap-2">
            <Button disabled={step === 0} onClick={() => setStep(0)}>
              1
            </Button>
            <Button disabled={step === 1} onClick={() => setStep(1)}>
              2
            </Button>
            <Button disabled={step === 2} onClick={() => setStep(2)}>
              3
            </Button>
            <Button disabled={step === 3} onClick={() => setStep(3)}>
              4
            </Button>
            <Button disabled={step === 4} onClick={() => setStep(4)}>
              5
            </Button>
          </div>
          <h6>I will fade in and out</h6>
          <Button onClick={() => setIsShowing(false)}>Close</Button>
        </div>
      </Transition>
    </Provider>
  );
};
