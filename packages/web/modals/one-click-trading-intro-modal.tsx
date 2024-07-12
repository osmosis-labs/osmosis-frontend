import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { createGlobalState, useMount } from "react-use";

import { displayToast, ToastType } from "~/components/alert";
import { displayErrorRemovingSessionToast } from "~/components/alert/one-click-trading-toasts";
import { isRejectedTxErrorMessage } from "~/components/alert/prettify";
import { Button } from "~/components/buttons";
import { Spinner } from "~/components/loaders";
import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click-trading";
import { OneClickTradingSettings } from "~/components/one-click-trading/one-click-trading-settings";
import { Screen, ScreenManager } from "~/components/screen-manager";
import {
  useOneClickTradingParams,
  useOneClickTradingSession,
  useTranslation,
} from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useRemoveOneClickTradingSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { ModalBase } from "~/modals/base";
import { useStore } from "~/stores";

type Screens = "intro" | "settings" | "settings-no-back-button";

export const useGlobalIs1CTIntroModalScreen = createGlobalState<Screens | null>(
  null
);

export const OneClickTradingIntroModal = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { oneClickTradingInfo, isOneClickTradingEnabled, isLoadingInfo } =
    useOneClickTradingSession();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const [isClosing, setIsClosing] = useState(false);
  const [currentScreen, setCurrentScreen] = useGlobalIs1CTIntroModalScreen();

  const { t } = useTranslation();

  const displayExpiredToast = useCallback(() => {
    const toastId = "one-click-trading-expired";
    displayToast(
      {
        titleTranslationKey: t("oneClickTrading.toast.oneClickTradingExpired"),
        captionElement: (
          <Button
            mode="text"
            className="caption"
            onClick={() => {
              setCurrentScreen("settings-no-back-button");
              toast.dismiss(toastId);
            }}
          >
            {t("oneClickTrading.toast.startANewSession")}
          </Button>
        ),
      },
      ToastType.ONE_CLICK_TRADING,
      {
        toastId, // Provide an id to prevent duplicates
        autoClose: false,
      }
    );
  }, [t, setCurrentScreen]);

  const on1CTSessionExpire = useCallback(
    ({ oneClickTradingInfo }: { oneClickTradingInfo: OneClickTradingInfo }) => {
      if (
        oneClickTradingInfo.hasSeenExpiryToast ||
        account?.address !== oneClickTradingInfo?.userOsmoAddress
      )
        return;

      accountStore.setOneClickTradingInfo({
        ...oneClickTradingInfo,
        hasSeenExpiryToast: true,
      });

      displayExpiredToast();
    },
    [account?.address, accountStore, displayExpiredToast]
  );

  /**
   * If the session has expired while the user was not on the page,
   * we need to display the toast when the user comes back.
   */
  useMount(() => {
    const main = async () => {
      const oneClickTradingInfo = await accountStore.getOneClickTradingInfo();
      const isExpired = await accountStore.isOneClickTradingExpired();
      if (
        !isExpired ||
        !oneClickTradingInfo ||
        oneClickTradingInfo?.hasSeenExpiryToast
      )
        return;
      on1CTSessionExpire({ oneClickTradingInfo });
    };
    main();
  });

  useOneClickTradingSession({
    onExpire: on1CTSessionExpire,
  });

  const onClose = () => {
    setIsClosing(true);
  };

  const show1CTEditParams =
    currentScreen === "settings" || currentScreen === "settings-no-back-button";

  return (
    <ModalBase
      isOpen={!isNil(currentScreen) && !isClosing}
      onRequestClose={onClose}
      className={classNames(show1CTEditParams && "px-0 py-9")}
      hideCloseButton={show1CTEditParams}
      onAfterClose={() => {
        setCurrentScreen(null);
        setIsClosing(false);
      }}
    >
      <ScreenManager currentScreen={currentScreen ?? ""}>
        <div
          className={classNames(
            "flex items-center",
            show1CTEditParams ? "px-8" : "mx-auto max-w-[31rem]"
          )}
        >
          {isLoadingInfo || !currentScreen ? (
            <div className="flex h-[90vh] max-h-[310px] w-full flex-col items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <IntroModal1CTScreens
              oneClickTradingInfo={oneClickTradingInfo}
              isOneClickTradingEnabled={isOneClickTradingEnabled}
              onCloseModal={onClose}
            />
          )}
        </div>
      </ScreenManager>
    </ModalBase>
  );
});

const IntroModal1CTScreens = observer(
  ({
    oneClickTradingInfo,
    isOneClickTradingEnabled,
    onCloseModal,
  }: {
    isOneClickTradingEnabled: boolean | undefined;
    oneClickTradingInfo: OneClickTradingInfo | undefined;
    onCloseModal: () => void;
  }) => {
    const { accountStore, chainStore } = useStore();

    const [currentScreen, setCurrentScreen] = useGlobalIs1CTIntroModalScreen();

    const create1CTSession = useCreateOneClickTradingSession({
      queryOptions: {
        onSuccess: () => {
          setCurrentScreen(null);
        },
      },
    });
    const removeSession = useRemoveOneClickTradingSession();

    const {
      transaction1CTParams,
      setTransaction1CTParams,
      isLoading: isLoading1CTParams,
      spendLimitTokenDecimals,
      reset: reset1CTParams,
      isError: isError1CTParams,
    } = useOneClickTradingParams({
      oneClickTradingInfo,
      defaultIsOneClickEnabled: isOneClickTradingEnabled ? true : false,
    });

    return (
      <>
        <Screen
          screenName={
            ["settings", "settings-no-back-button"] satisfies Screens[]
          }
        >
          <OneClickTradingSettings
            onGoBack={() => {
              setCurrentScreen("intro");
            }}
            isLoading={isLoading1CTParams}
            hideBackButton={currentScreen === "settings-no-back-button"}
            setTransaction1CTParams={setTransaction1CTParams}
            transaction1CTParams={transaction1CTParams!}
            isSendingTx={create1CTSession.isLoading}
            onStartTrading={() => {
              create1CTSession.mutate({
                spendLimitTokenDecimals,
                transaction1CTParams,
                walletRepo: accountStore.getWalletRepo(
                  chainStore.osmosis.chainId
                ),
              });
            }}
            hasExistingSession={isOneClickTradingEnabled}
            isEndingSession={removeSession.isLoading}
            onClose={onCloseModal}
            onEndSession={() => {
              const rollback = () => {
                if (!transaction1CTParams) return;
                setTransaction1CTParams({
                  ...transaction1CTParams,
                  isOneClickEnabled: true,
                });
              };

              if (!oneClickTradingInfo) {
                displayErrorRemovingSessionToast();
                rollback();
                throw new Error("oneClickTradingInfo is undefined");
              }

              removeSession.mutate(
                {
                  authenticatorId: oneClickTradingInfo?.authenticatorId,
                },
                {
                  onSuccess: () => {
                    accountStore.setOneClickTradingInfo(undefined);
                  },
                  onError: (e) => {
                    const error = e as Error;
                    rollback();
                    if (
                      !isRejectedTxErrorMessage({ message: error?.message })
                    ) {
                      displayErrorRemovingSessionToast();
                    }
                  },
                }
              );
            }}
          />
        </Screen>

        <Screen screenName={"intro" satisfies Screens}>
          <IntroducingOneClick
            isDisabled={isError1CTParams}
            isLoading={isLoading1CTParams || create1CTSession.isLoading}
            onStartTrading={() => {
              reset1CTParams();
              create1CTSession.mutate({
                spendLimitTokenDecimals,
                transaction1CTParams,
                walletRepo: accountStore.getWalletRepo(
                  chainStore.osmosis.chainId
                ),
              });
            }}
            onClickEditParams={() => {
              setCurrentScreen("settings");
            }}
          />
        </Screen>
      </>
    );
  }
);
