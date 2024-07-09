import { Transition } from "@headlessui/react";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { memo, PropsWithChildren, useState } from "react";
import { useLockBodyScroll } from "react-use";

import { Icon } from "~/components/assets";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { StepProgress } from "~/components/stepper/progress-bar";
import { IconButton } from "~/components/ui/button";
import { EventName } from "~/config";
import { useTranslation, useWindowKeyActions } from "~/hooks";
import { BridgeFlowProvider } from "~/hooks/bridge";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useDisclosure } from "~/hooks/use-disclosure";
import { FiatRampKey } from "~/integrations";
import { ModalCloseButton } from "~/modals";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { FiatRampsModal } from "~/modals/fiat-ramps";

import { AmountAndReviewScreen } from "./amount-and-review-screen";
import { AssetSelectScreen } from "./asset-select-screen";

export enum ImmersiveBridgeScreen {
  Asset = "0",
  Amount = "1",
  Review = "2",
}

const MemoizedChildren = memo(({ children }: PropsWithChildren) => {
  return <>{children}</>;
});

export const ImmersiveBridgeFlow = ({
  Provider,
  children,
}: PropsWithChildren<BridgeFlowProvider>) => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<ImmersiveBridgeScreen>(
    ImmersiveBridgeScreen.Asset
  );
  const [direction, setDirection] = useState<"deposit" | "withdraw">("deposit");
  const { logEvent } = useAmplitudeAnalytics();

  const [selectedAssetDenom, setSelectedAssetDenom] = useState<string>();

  const [fiatRampParams, setFiatRampParams] = useState<{
    fiatRampKey: FiatRampKey;
    assetKey: string;
  } | null>(null);

  const {
    isOpen: isFiatOnrampSelectionOpen,
    onOpen: onOpenFiatOnrampSelection,
    onClose: onCloseFiatOnrampSelection,
  } = useDisclosure();

  useLockBodyScroll(isVisible);

  const onClose = () => {
    setIsVisible(false);
  };

  const onOpen = (direction: BridgeTransactionDirection) => {
    setIsVisible(true);
    setDirection(direction);
  };

  useWindowKeyActions({
    Escape: onClose,
  });

  return (
    <Provider
      value={{
        startBridge: ({
          direction,
        }: {
          direction: BridgeTransactionDirection;
        }) => {
          onOpen(direction);
        },
        bridgeAsset: async ({
          anyDenom,
          direction,
        }: {
          anyDenom: string;
          direction: BridgeTransactionDirection;
        }) => {
          onOpen(direction);
          setStep(ImmersiveBridgeScreen.Amount);
          setSelectedAssetDenom(anyDenom);
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
      <MemoizedChildren>{children}</MemoizedChildren>
      <ScreenManager
        currentScreen={String(step)}
        onChangeScreen={(screen) => setStep(screen as ImmersiveBridgeScreen)}
      >
        {({ currentScreen }) => (
          <Transition
            show={isVisible}
            as="div"
            className="fixed inset-0 z-[999] flex h-screen w-screen items-center justify-center bg-osmoverse-900"
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => {
              setSelectedAssetDenom(undefined);
              setStep(ImmersiveBridgeScreen.Asset);
            }}
          >
            <ModalCloseButton onClick={() => onClose()} />
            {step !== ImmersiveBridgeScreen.Asset && (
              <IconButton
                onClick={() => {
                  setStep(
                    (Number(step) - 1).toString() as ImmersiveBridgeScreen
                  );
                }}
                className={
                  "absolute left-8 top-[28px] z-50 w-fit text-osmoverse-400 hover:text-osmoverse-100"
                }
                icon={<Icon id="chevron-left" width={16} height={16} />}
                aria-label="Go Back"
              />
            )}

            <div className="flex h-full w-[30rem] flex-col gap-10 pt-12 md:w-screen md:pt-20">
              <StepProgress
                className="w-full md:hidden"
                steps={[
                  {
                    displayLabel: t("transfer.stepLabels.asset"),
                    onClick:
                      step !== ImmersiveBridgeScreen.Asset
                        ? () => setStep(ImmersiveBridgeScreen.Asset)
                        : undefined,
                  },
                  {
                    displayLabel: t("transfer.stepLabels.amount"),
                    onClick:
                      step === ImmersiveBridgeScreen.Review
                        ? () => setStep(ImmersiveBridgeScreen.Amount)
                        : undefined,
                  },
                  {
                    displayLabel: t("transfer.stepLabels.review"),
                  },
                ]}
                currentStep={Number(step)}
              />

              <div className="h-full flex-1 overflow-y-scroll px-2">
                <Screen screenName={ImmersiveBridgeScreen.Asset}>
                  {({ setCurrentScreen }) => (
                    <AssetSelectScreen
                      type={direction}
                      onSelectAsset={(asset) => {
                        setCurrentScreen(ImmersiveBridgeScreen.Amount);
                        setSelectedAssetDenom(asset.coinDenom);
                      }}
                    />
                  )}
                </Screen>
                {currentScreen !== ImmersiveBridgeScreen.Asset && (
                  <AmountAndReviewScreen
                    direction={direction}
                    onClose={onClose}
                    selectedAssetDenom={selectedAssetDenom}
                  />
                )}
              </div>
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
