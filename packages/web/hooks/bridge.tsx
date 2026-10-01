import { Transition } from "@headlessui/react";
import { isNil } from "@osmosis-labs/utils";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import dynamic, { DynamicOptionsLoadingProps } from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMount, useSearchParam } from "react-use";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { Icon } from "~/components/assets";
import { ErrorBoundary } from "~/components/error/error-boundary";
import { GeneralErrorScreen } from "~/components/error/general-error-screen";
import { Spinner } from "~/components/loaders";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { StepProgress } from "~/components/stepper/progress-bar";
import { Button, IconButton } from "~/components/ui/button";
import { useTranslation, useWindowKeyActions } from "~/hooks";
import { FiatRampKey } from "~/integrations";
import { ModalBase } from "~/modals/base";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";

// The bridge screens pull in every bridge provider's client code (Nomic, TON,
// Bitcoin, Solana wallets, ...). They only render while the bridge is open, so
// load them on first open instead of shipping them in the shared _app chunk.
//
// `next/dynamic` hands a failed chunk download (typically a stale hash after a
// deploy) to the loading component rather than the nearest error boundary, and
// keeps that failure until `retry` is called. Without a retry the bridge would
// spin forever, even after closing and reopening it.
const ChunkLoadFallback = ({
  error,
  retry,
  showSpinner,
}: DynamicOptionsLoadingProps & { showSpinner: boolean }) => {
  const { t } = useTranslation();

  if (error) {
    // Mirrors GeneralErrorScreen, which handles render-time errors for these
    // same screens; the bridge frame already provides the close button.
    return (
      <div className="text-white flex flex-col items-center gap-6 py-20">
        <Image
          src="/images/leaking-beaker.svg"
          alt="Leaking beaker"
          width={224}
          height={168}
        />
        <h1 className="text-2xl font-bold leading-9">
          {t("errors.uhOhSomethingWentWrong")}
        </h1>
        <p className="text-center">{t("errors.sorryForTheInconvenience")}</p>
        <Button variant="secondary" onClick={retry}>
          {t("walletSelect.retry")}
        </Button>
      </div>
    );
  }

  return showSpinner ? (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  ) : null;
};
const ScreenLoader = (props: DynamicOptionsLoadingProps) => (
  <ChunkLoadFallback {...props} showSpinner />
);
/** The modal is an overlay, so render nothing while it loads. A failed load is
 *  shown inside a modal shell of its own: the selection modal has already
 *  closed, and the bridge frame this renders in may sit offscreen. */
const ModalLoader = ({ error, retry }: DynamicOptionsLoadingProps) => {
  if (!error) return null;
  return (
    <ModalBase
      isOpen
      onRequestClose={() => useBridgeStore.getState().setFiatRampParams(null)}
    >
      <ChunkLoadFallback error={error} retry={retry} showSpinner={false} />
    </ModalBase>
  );
};
const AssetSelectScreen = dynamic(
  () =>
    import("~/components/bridge/asset-select-screen").then(
      (module) => module.AssetSelectScreen
    ),
  { ssr: false, loading: ScreenLoader }
);
const AmountAndReviewScreen = dynamic(
  () =>
    import("~/components/bridge/amount-and-review-screen").then(
      (module) => module.AmountAndReviewScreen
    ),
  { ssr: false, loading: ScreenLoader }
);
const FiatRampsModal = dynamic(
  () => import("~/modals/fiat-ramps").then((module) => module.FiatRampsModal),
  { ssr: false, loading: ModalLoader }
);

export const enum BridgeScreen {
  Asset = "0",
  Amount = "1",
  Review = "2",
}

export const useBridgeStore = create(
  combine(
    {
      isVisible: false,
      type: "quote" as "quote" | "deposit-address",
      step: BridgeScreen.Asset,
      direction: undefined as "deposit" | "withdraw" | undefined,
      selectedAssetDenom: undefined as string | undefined,
      fiatRamp: null as {
        fiatRampKey: FiatRampKey;
        assetKey: string;
      } | null,
      fiatRampSelectionOpen: false,
    },
    (set) => ({
      setIsVisible: (isVisible: boolean) => set({ isVisible }),
      setStep: (step: BridgeScreen) => set({ step }),
      setDirection: (direction: "deposit" | "withdraw" | undefined) => {
        set({ direction });
      },
      setSelectedAssetDenom: (denom: string | undefined) => {
        set({ selectedAssetDenom: denom });
      },
      startBridge: ({ direction }: { direction: "deposit" | "withdraw" }) => {
        set({ isVisible: true, direction });
      },
      bridgeAsset: ({
        anyDenom,
        direction = "deposit",
      }: {
        anyDenom: string | undefined;
        direction: "deposit" | "withdraw" | undefined;
      }) => {
        set({
          isVisible: true,
          direction,
          step: BridgeScreen.Amount,
          selectedAssetDenom: anyDenom,
        });
      },
      setFiatRampParams: (
        params: {
          fiatRampKey: FiatRampKey;
          assetKey: string;
        } | null
      ) => {
        set({ fiatRamp: params });
      },
      toggleFiatRamp: ({
        fiatRampKey,
        assetKey,
      }: {
        fiatRampKey: FiatRampKey;
        assetKey: string;
      }) => {
        set({ fiatRamp: { fiatRampKey, assetKey } });
      },
      fiatRampSelection: () => {
        set({ fiatRampSelectionOpen: true });
      },
      toggleFiatRampSelection: (nextValue: boolean) => {
        set((state) => ({
          fiatRampSelectionOpen: nextValue ?? !state.fiatRampSelectionOpen,
        }));
      },
      setType: (type: "quote" | "deposit-address") => {
        set({ type });
      },
    })
  )
);

/** Provides a globally accessible bridge UX that is initiated via the `useBridge` hook. */
export const ImmersiveBridge = () => {
  const { t } = useTranslation();
  const transferDirectionSearchParam = useSearchParam("transferDirection");
  const transferAssetSearchParam = useSearchParam("transferAsset");
  const { isReady: isRouterReady } = useRouter();

  const {
    type,
    direction,
    isVisible,
    selectedAssetDenom,
    setDirection,
    setIsVisible,
    setSelectedAssetDenom,
    setStep,
    step,
    isFiatOnRampSelectionOpen,
    toggleFiatOnRampSelection,
    fiatRampParams,
    setFiatRampParams,
    bridgeAsset,
  } = useBridgeStore(
    useShallow((state) => ({
      isVisible: state.isVisible,
      step: state.step,
      direction: state.direction,
      type: state.type,
      selectedAssetDenom: state.selectedAssetDenom,
      setIsVisible: state.setIsVisible,
      setStep: state.setStep,
      setDirection: state.setDirection,
      setSelectedAssetDenom: state.setSelectedAssetDenom,
      isFiatOnRampSelectionOpen: state.fiatRampSelectionOpen,
      toggleFiatOnRampSelection: state.toggleFiatRampSelection,
      fiatRampParams: state.fiatRamp,
      setFiatRampParams: state.setFiatRampParams,
      bridgeAsset: state.bridgeAsset,
    }))
  );

  /**
   * Open the bridge transfer flow if the transfer direction or asset is specified in the URL
   */
  useMount(() => {
    let nextDirection: "deposit" | "withdraw" | undefined;
    let nextAsset: string | undefined;

    if (
      transferDirectionSearchParam === "deposit" ||
      transferDirectionSearchParam === "withdraw"
    ) {
      nextDirection = transferDirectionSearchParam;
    }

    if (transferAssetSearchParam) {
      nextAsset = transferAssetSearchParam;
    }

    setDirection(nextDirection);
    setSelectedAssetDenom(nextAsset);

    if (nextDirection || nextAsset) {
      bridgeAsset({
        anyDenom: nextAsset,
        direction: nextDirection,
      });
    }

    if (nextAsset) {
      setStep(BridgeScreen.Amount);
    }
  });

  useEffect(() => {
    if (!isRouterReady || !isVisible) return;

    const url = new URL(location.href);

    const hadTransferDirection = url.searchParams.has("transferDirection");
    const hadTransferAsset = url.searchParams.has("transferAsset");

    if (direction) url.searchParams.set("transferDirection", direction);
    if (selectedAssetDenom)
      url.searchParams.set("transferAsset", selectedAssetDenom);

    /**
     * If the URL did not have any transfer direction or asset, push the new URL to the history
     */
    if (!hadTransferDirection && !hadTransferAsset) {
      window.history.pushState(null, document.title, url.href);
      return;
    }

    window.history.replaceState(null, document.title, url.href);
  }, [direction, isRouterReady, isVisible, selectedAssetDenom]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  const onClose = () => {
    setIsVisible(false);

    /**
     * Remove bridge related query params from the URL
     */
    const url = new URL(location.href);
    url.searchParams.delete("transferDirection");
    url.searchParams.delete("transferAsset");
    window.history.replaceState(null, document.title, url.href);
  };

  useWindowKeyActions({
    Escape: onClose,
  });

  return (
    <>
      <ScreenManager
        currentScreen={String(step)}
        onChangeScreen={(screen) => setStep(screen as BridgeScreen)}
      >
        {({ currentScreen }) => {
          return (
            <Transition
              show={isVisible}
              as="div"
              className="fixed inset-0 z-[999] flex h-screen w-screen bg-osmoverse-900"
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => {
                setSelectedAssetDenom(undefined);
                setDirection(undefined);
                setStep(BridgeScreen.Asset);
              }}
            >
              <QueryErrorResetBoundary>
                {({ reset: resetQueries }) => (
                  <ErrorBoundary
                    FallbackComponent={(props) => (
                      <GeneralErrorScreen {...props} onClose={onClose} />
                    )}
                    onReset={resetQueries}
                  >
                    <div className="flex-1 overflow-y-auto">
                      <div className="sticky top-0 z-50 mx-auto flex max-w-7xl place-content-between items-center gap-3 bg-osmoverse-900 py-8 px-10">
                        {step === BridgeScreen.Asset ? (
                          <div className="h-12 w-12 flex-shrink-0 md:h-8 md:w-8" />
                        ) : (
                          <IconButton
                            aria-label="Go Back"
                            className="z-50 !h-12 !w-12 flex-shrink-0 text-wosmongton-200 hover:text-osmoverse-100 md:!h-8 md:!w-8"
                            icon={
                              <Icon
                                id="arrow-left-thin"
                                className="md:h-4 md:w-4"
                              />
                            }
                            onClick={() => {
                              setStep(
                                (Number(step) - 1).toString() as BridgeScreen
                              );
                              if (step === BridgeScreen.Amount) {
                                setSelectedAssetDenom(undefined);
                              }
                            }}
                          />
                        )}
                        <StepProgress
                          className="mx-6 max-w-3xl shrink md:hidden"
                          steps={
                            type === "quote"
                              ? [
                                  {
                                    displayLabel: t(
                                      "transfer.stepLabels.asset"
                                    ),
                                    onClick:
                                      step !== BridgeScreen.Asset
                                        ? () => {
                                            setStep(BridgeScreen.Asset);
                                            setSelectedAssetDenom(undefined);
                                          }
                                        : undefined,
                                  },
                                  {
                                    displayLabel: t(
                                      "transfer.stepLabels.amount"
                                    ),
                                    onClick:
                                      step === BridgeScreen.Review
                                        ? () => setStep(BridgeScreen.Amount)
                                        : undefined,
                                  },
                                  {
                                    displayLabel: t(
                                      "transfer.stepLabels.review"
                                    ),
                                  },
                                ]
                              : [
                                  {
                                    displayLabel: t(
                                      "transfer.stepLabels.asset"
                                    ),
                                    onClick:
                                      step !== BridgeScreen.Asset
                                        ? () => {
                                            setStep(BridgeScreen.Asset);
                                            setSelectedAssetDenom(undefined);
                                          }
                                        : undefined,
                                  },
                                  {
                                    displayLabel: t(
                                      "transfer.stepLabels.deposit"
                                    ),
                                  },
                                ]
                          }
                          currentStep={Number(step)}
                        />
                        <IconButton
                          aria-label="Close"
                          className="z-50 !h-12 !w-12 flex-shrink-0 text-wosmongton-200 hover:text-osmoverse-100 md:!h-8 md:!w-8"
                          icon={<Icon id="close" className="md:h-4 md:w-4" />}
                          onClick={onClose}
                        />
                      </div>

                      <div className="w-full flex-1">
                        <div className="mx-auto max-w-lg md:px-4">
                          <Screen screenName={BridgeScreen.Asset}>
                            {({ setCurrentScreen }) =>
                              direction ? (
                                <AssetSelectScreen
                                  type={direction}
                                  onSelectAsset={({ coinMinimalDenom }) => {
                                    setCurrentScreen(BridgeScreen.Amount);
                                    setSelectedAssetDenom(coinMinimalDenom);
                                  }}
                                />
                              ) : null
                            }
                          </Screen>
                          {currentScreen !== BridgeScreen.Asset &&
                            direction && (
                              <AmountAndReviewScreen
                                direction={direction}
                                onClose={onClose}
                                selectedAssetDenom={selectedAssetDenom}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  </ErrorBoundary>
                )}
              </QueryErrorResetBoundary>
            </Transition>
          );
        }}
      </ScreenManager>

      {!isNil(fiatRampParams) && (
        <FiatRampsModal
          isOpen
          onRequestClose={() => {
            setFiatRampParams(null);
          }}
          onRequestBack={() => {
            setFiatRampParams(null);
            toggleFiatOnRampSelection(true);
          }}
          assetKey={fiatRampParams.assetKey}
          fiatRampKey={fiatRampParams.fiatRampKey}
        />
      )}
      <FiatOnrampSelectionModal
        isOpen={isFiatOnRampSelectionOpen}
        onRequestClose={() => toggleFiatOnRampSelection(false)}
      />
    </>
  );
};
