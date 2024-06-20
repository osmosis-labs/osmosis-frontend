import { Transition } from "@headlessui/react";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { PropsWithChildren, useState } from "react";
import { useLockBodyScroll } from "react-use";

import { AmountScreen } from "~/components/bridge/immersive/amount-screen";
import { AssetsScreen } from "~/components/bridge/immersive/assets-screen";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { StepProgress } from "~/components/stepper/progress-bar";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { BridgeFlowProvider } from "~/hooks/bridge";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useDisclosure } from "~/hooks/use-disclosure";
import { FiatRampKey } from "~/integrations";
import { ModalCloseButton } from "~/modals";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { FiatRampsModal } from "~/modals/fiat-ramps";
import { api } from "~/utils/trpc";

enum ImmersiveBridgeScreens {
  Asset = "0",
  Amount = "1",
  Review = "2",
}

export const ImmersiveBridgeFlow = ({
  Provider,
  children,
}: PropsWithChildren<BridgeFlowProvider>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<ImmersiveBridgeScreens>(
    ImmersiveBridgeScreens.Asset
  );
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const { logEvent } = useAmplitudeAnalytics();

  const apiUtils = api.useUtils();

  const [assetInOsmosis, setAssetInOsmosis] = useState<MinimalAsset>();

  const [fiatRampParams, setFiatRampParams] = useState<{
    fiatRampKey: FiatRampKey;
    assetKey: string;
  } | null>(null);

  const {
    isOpen: isFiatOnrampSelectionOpen,
    onOpen: onOpenFiatOnrampSelection,
    onClose: onCloseFiatOnrampSelection,
  } = useDisclosure();

  // const { isConnected, address } = useEvmWalletAccount();
  // const { onOpenWalletSelect } = useWalletSelect();
  // const { disconnect } = useDisconnectEvmWallet();

  useLockBodyScroll(isVisible);

  const onClose = () => {
    setIsVisible(false);
    setAssetInOsmosis(undefined);
    setStep(ImmersiveBridgeScreens.Asset);
  };

  const onOpen = (direction: "deposit" | "withdraw") => {
    setIsVisible(true);
    setType(direction);
  };

  return (
    <Provider
      value={{
        startBridge: ({ direction }: { direction: "deposit" | "withdraw" }) => {
          onOpen(direction);
          console.log("startBridge", direction);
        },
        bridgeAsset: async ({
          anyDenom,
          direction,
        }: {
          anyDenom: string;
          direction: "deposit" | "withdraw";
        }) => {
          onOpen(direction);

          const fetchAssetWithRetry = async (retries = 3) => {
            for (let attempt = 1; attempt <= retries; attempt++) {
              try {
                const asset = await apiUtils.edge.assets.getUserAsset.fetch({
                  findMinDenomOrSymbol: anyDenom,
                });

                if (!asset) {
                  console.error("Asset not found", anyDenom);
                  return undefined;
                }

                return asset;
              } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === retries) {
                  console.error("All attempts to fetch asset failed");
                  return undefined;
                }
              }
            }
          };

          const asset = await fetchAssetWithRetry();

          if (!asset) {
            return;
          }

          setAssetInOsmosis(asset);
          console.log("bridgeAsset", anyDenom, direction);
        },
        fiatRamp: ({
          fiatRampKey,
          assetKey,
        }: {
          fiatRampKey: FiatRampKey;
          assetKey: string;
        }) => {
          setFiatRampParams({ fiatRampKey, assetKey });
        },
        fiatRampSelection: onOpenFiatOnrampSelection,
      }}
    >
      {children}
      <ScreenManager
        currentScreen={String(step)}
        onChangeScreen={(screen) => {
          return setStep(screen as ImmersiveBridgeScreens);
        }}
      >
        {() => (
          <Transition
            show={isVisible}
            as="div"
            className="fixed inset-0 z-[999] flex items-center justify-center overflow-auto bg-osmoverse-900"
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalCloseButton onClick={() => onClose()} />
            {/* <IconButton
              onClick={() => {
                setStep(nextScreen);
              }}
              className={
                "absolute left-8 top-[28px] z-50 w-fit text-osmoverse-400 hover:text-osmoverse-100"
              }
              icon={<Icon id="chevron-left" width={16} height={16} />}
              aria-label="Go Back"
            /> */}

            <div className="flex h-full w-full max-w-[30rem] flex-col gap-10 py-12">
              <StepProgress
                className="w-full"
                steps={[
                  {
                    displayLabel: "Asset",
                    onClick:
                      step !== ImmersiveBridgeScreens.Asset
                        ? () => setStep(ImmersiveBridgeScreens.Asset)
                        : undefined,
                  },
                  {
                    displayLabel: "Amount",
                    onClick:
                      step === ImmersiveBridgeScreens.Review
                        ? () => setStep(ImmersiveBridgeScreens.Amount)
                        : undefined,
                  },
                  {
                    displayLabel: "Review",
                  },
                ]}
                currentStep={Number(step)}
              />

              <div className="flex-1">
                <Screen screenName={ImmersiveBridgeScreens.Asset}>
                  {({ setCurrentScreen }) => (
                    <AssetsScreen
                      type={type}
                      onSelectAsset={(asset) => {
                        setCurrentScreen(ImmersiveBridgeScreens.Amount);
                        setAssetInOsmosis(asset);
                      }}
                    />
                  )}
                </Screen>
                <Screen screenName={ImmersiveBridgeScreens.Amount}>
                  {() => (
                    <AmountScreen
                      type={type}
                      assetInOsmosis={assetInOsmosis!}
                    />
                  )}
                </Screen>
                <Screen screenName={ImmersiveBridgeScreens.Review}>
                  {({ goBack }) => (
                    <div>
                      <h6>Step 3: Review</h6>
                      <Button onClick={goBack}>Back</Button>
                      <Button onClick={() => onClose()}>Close</Button>
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
        )}
      </ScreenManager>

      {!isNil(fiatRampParams) && (
        <FiatRampsModal
          isOpen
          onRequestClose={() => {
            setFiatRampParams(null);
          }}
          assetKey={fiatRampParams.assetKey}
          fiatRampKey={fiatRampParams.fiatRampKey}
        />
      )}
      <FiatOnrampSelectionModal
        isOpen={isFiatOnrampSelectionOpen}
        onRequestClose={onCloseFiatOnrampSelection}
        onSelectRamp={() => {
          logEvent([EventName.ProfileModal.buyTokensClicked]);
        }}
      />
    </Provider>
  );
};
