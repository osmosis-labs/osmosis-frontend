import { Transition } from "@headlessui/react";
import { FunctionComponent, useState } from "react";

import { StepProgress } from "~/components/stepper/progress-bar";
import { Button } from "~/components/ui/button";
import { useWalletSelect } from "~/hooks";
import {
  useDisconnectEvmWallet,
  useEvmWalletAccount,
} from "~/hooks/evm-wallet";
import { FiatRampKey } from "~/integrations";

import { BridgeFlowProvider } from "../flow";

export const ImmersiveBridgeFlow: FunctionComponent<BridgeFlowProvider> = ({
  Provider,
  children,
}) => {
  // TODO: state will be encapsulated in a state hook
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const { isConnected, address } = useEvmWalletAccount();
  const { onOpenWalletSelect } = useWalletSelect();
  const { disconnect } = useDisconnectEvmWallet();

  return (
    <Provider
      value={{
        // globally received events
        startBridge: (direction: "deposit" | "withdraw") => {
          setIsVisible(true);
          console.log("startBridge", direction);
        },
        bridgeAsset: (anyDenom: string, direction: "deposit" | "withdraw") => {
          setIsVisible(true);
          console.log("bridgeAsset", anyDenom, direction);
        },
        fiatRamp: (fiatRampKey: FiatRampKey, assetKey: string) => {
          setIsVisible(true);
          console.log("fiatRamp", fiatRampKey, assetKey);
        },
        fiatRampSelection: () => {
          setIsVisible(true);
          console.log("fiatRampSelection");
        },
      }}
    >
      {children}
      <Transition
        show={isVisible}
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
          <Button onClick={() => setIsVisible(false)}>Close</Button>

          {isConnected ? (
            <div>
              <p>Evm Address: {address}</p>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </div>
          ) : (
            <Button
              onClick={() =>
                onOpenWalletSelect({
                  walletOptions: [
                    {
                      walletType: "evm",
                    },
                  ],
                  layout: "list",
                })
              }
            >
              Connect EVM Wallet
            </Button>
          )}
        </div>
      </Transition>
    </Provider>
  );
};
