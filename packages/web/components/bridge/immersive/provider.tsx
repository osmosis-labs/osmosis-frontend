import { Transition } from "@headlessui/react";
import { PropsWithChildren, useState } from "react";
import { useLockBodyScroll } from "react-use";

import { AmountScreen } from "~/components/bridge/amount-screen";
import { Screen, ScreenManager } from "~/components/screen-manager"; // Import ScreenManager and Screen
import { StepProgress } from "~/components/stepper/progress-bar";
import { Button } from "~/components/ui/button";
import { FiatRampKey } from "~/integrations";

import { BridgeFlowProvider } from "../flow";

export const ImmersiveBridgeFlow = ({
  Provider,
  children,
}: PropsWithChildren<BridgeFlowProvider>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  // const { isConnected, address } = useEvmWalletAccount();
  // const { onOpenWalletSelect } = useWalletSelect();
  // const { disconnect } = useDisconnectEvmWallet();

  useLockBodyScroll(isVisible);

  return (
    <Provider
      value={{
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
      <ScreenManager
        currentScreen={String(step)}
        onChangeScreen={(screen) => {
          return setStep(Number(screen) as 0 | 1 | 2);
        }}
      >
        <Transition
          show={isVisible}
          as="div"
          className="absolute inset-0 z-[999] flex items-center justify-center overflow-auto bg-osmoverse-900"
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="flex h-full w-full max-w-container flex-col gap-10 py-12">
            <StepProgress
              className="w-full"
              steps={[
                { displayLabel: "Asset" },
                { displayLabel: "Amount" },
                { displayLabel: "Review" },
              ]}
              currentStep={step}
            />

            <div className="flex-1 overflow-auto">
              <Screen screenName="0">
                {({ setCurrentScreen }) => (
                  <div>
                    <h6>Step 1: Asset</h6>
                    <Button onClick={() => setIsVisible(false)}>Close</Button>
                    <Button onClick={() => setCurrentScreen("1")}>Next</Button>
                  </div>
                )}
              </Screen>
              <Screen screenName="1">
                {({ setCurrentScreen, goBack }) => (
                  <div>
                    <div className="flex items-center gap-2">
                      <Button onClick={goBack}>Back</Button>
                      <Button onClick={() => setCurrentScreen("2")}>
                        Next
                      </Button>
                      <Button
                        onClick={() =>
                          setType(type === "deposit" ? "withdraw" : "deposit")
                        }
                      >
                        Type: {type}
                      </Button>
                    </div>

                    <AmountScreen type={type} />
                  </div>
                )}
              </Screen>
              <Screen screenName="2">
                {({ goBack }) => (
                  <div>
                    <h6>Step 3: Review</h6>
                    <Button onClick={goBack}>Back</Button>
                    <Button onClick={() => setIsVisible(false)}>Close</Button>
                  </div>
                )}
              </Screen>
            </div>
            {/* {isConnected ? (
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
            )} */}
          </div>
        </Transition>
      </ScreenManager>
    </Provider>
  );
};
