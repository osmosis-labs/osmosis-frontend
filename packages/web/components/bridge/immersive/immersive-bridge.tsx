import { Transition } from "@headlessui/react";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { memo, PropsWithChildren, useState } from "react";
import { useLockBodyScroll } from "react-use";

import { Icon } from "~/components/assets";
import { AmountScreen } from "~/components/bridge/immersive/amount-screen";
import { AssetSelectScreen } from "~/components/bridge/immersive/asset-select-screen";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { StepProgress } from "~/components/stepper/progress-bar";
import { Button, IconButton } from "~/components/ui/button";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { BridgeFlowProvider } from "~/hooks/bridge";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useDisclosure } from "~/hooks/use-disclosure";
import { FiatRampKey } from "~/integrations";
import { ModalCloseButton } from "~/modals";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { FiatRampsModal } from "~/modals/fiat-ramps";
import { api } from "~/utils/trpc";

const enum ImmersiveBridgeScreens {
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
  const [step, setStep] = useState<ImmersiveBridgeScreens>(
    ImmersiveBridgeScreens.Asset
  );
  const [direction, setDirection] = useState<"deposit" | "withdraw">("deposit");
  const { logEvent } = useAmplitudeAnalytics();

  const [selectedAssetDenom, setSelectedAssetDenom] = useState<string>();

  const { data: canonicalAssetsWithVariants } =
    api.edge.assets.getCanonicalAssetWithVariants.useQuery(
      {
        findMinDenomOrSymbol: selectedAssetDenom!,
      },
      {
        enabled: !isNil(selectedAssetDenom),
        cacheTime: 10 * 60 * 1000, // 10 minutes
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    );

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
          setStep(ImmersiveBridgeScreens.Amount);
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
            afterLeave={() => {
              setSelectedAssetDenom(undefined);
              setStep(ImmersiveBridgeScreens.Asset);
            }}
          >
            <ModalCloseButton onClick={() => onClose()} />
            {step !== ImmersiveBridgeScreens.Asset && (
              <IconButton
                onClick={() => {
                  const previousStep = Number(step) - 1;
                  // @ts-expect-error
                  setStep(previousStep);
                }}
                className={
                  "absolute left-8 top-[28px] z-50 w-fit text-osmoverse-400 hover:text-osmoverse-100"
                }
                icon={<Icon id="chevron-left" width={16} height={16} />}
                aria-label="Go Back"
              />
            )}

            <div className="flex h-full w-full max-w-[30rem] flex-col gap-10 py-12">
              <StepProgress
                className="w-full"
                steps={[
                  {
                    displayLabel: t("transfer.stepLabels.asset"),
                    onClick:
                      step !== ImmersiveBridgeScreens.Asset
                        ? () => setStep(ImmersiveBridgeScreens.Asset)
                        : undefined,
                  },
                  {
                    displayLabel: t("transfer.stepLabels.amount"),
                    onClick:
                      step === ImmersiveBridgeScreens.Review
                        ? () => setStep(ImmersiveBridgeScreens.Amount)
                        : undefined,
                  },
                  {
                    displayLabel: t("transfer.stepLabels.review"),
                  },
                ]}
                currentStep={Number(step)}
              />

              <div className="flex-1">
                <Screen screenName={ImmersiveBridgeScreens.Asset}>
                  {({ setCurrentScreen }) => (
                    <AssetSelectScreen
                      type={direction}
                      onSelectAsset={(asset) => {
                        setCurrentScreen(ImmersiveBridgeScreens.Amount);
                        setSelectedAssetDenom(asset.coinDenom);
                      }}
                    />
                  )}
                </Screen>
                <Screen screenName={ImmersiveBridgeScreens.Amount}>
                  <AmountScreen
                    type={direction}
                    assetsInOsmosis={canonicalAssetsWithVariants}
                  />
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
