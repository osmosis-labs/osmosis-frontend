import { OneClickTradingInfo } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { createGlobalState, useMount } from "react-use";

import { displayToast, ToastType } from "~/components/alert";
import { Button } from "~/components/buttons";
import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import {
  useOneClickTradingInfo,
  useOneClickTradingParams,
  useTranslation,
} from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/one-click-trading/use-create-one-click-trading-session";
import { ModalBase } from "~/modals/base";
import { useStore } from "~/stores";

export const useGlobalIs1CTIntroModalOpen = createGlobalState(false);

const OneClickTradingIntroModal = observer(() => {
  const { accountStore, chainStore } = useStore();
  const [isOpen, setIsOpen] = useGlobalIs1CTIntroModalOpen();
  const [show1CTEditParams, setShow1CTEditParams] = useState(false);
  const [shouldHideSettingsBackButton, setShouldHideSettingsBackButton] =
    useState(false);
  const { t } = useTranslation();

  const create1CTSessionMutation = useCreateOneClickTradingSession({
    addAuthenticatorsQueryOptions: {
      onSuccess: () => {
        setIsOpen(false);
      },
    },
  });

  const displayExpiredToast = useCallback(() => {
    displayToast(
      {
        message: t("oneClickTrading.toast.oneClickTradingExpired"),
        captionElement: (
          <Button
            mode="text"
            className="caption"
            onClick={() => {
              setIsOpen(true);
              setShow1CTEditParams(true);
              setShouldHideSettingsBackButton(true);
            }}
          >
            {t("oneClickTrading.toast.enableOneClickTrading")}
          </Button>
        ),
      },
      ToastType.ONE_CLICK_TRADING,
      {
        toastId: "one-click-trading-expired", // Provide an id to prevent duplicates
        autoClose: 50000,
      }
    );
  }, [t, setIsOpen]);

  const on1CTSessionExpire = useCallback(
    ({ oneClickTradingInfo }: { oneClickTradingInfo: OneClickTradingInfo }) => {
      if (oneClickTradingInfo.hasSeenExpiryToast) return;

      accountStore.setOneClickTradingInfo({
        ...oneClickTradingInfo,
        hasSeenExpiryToast: true,
      });

      displayExpiredToast();
    },
    [accountStore, displayExpiredToast]
  );

  /**
   * If the session has expired while the user was not on the page,
   * we need to display the toast when the user comes back.
   */
  useMount(() => {
    const main = async () => {
      const oneClickTradingInfo = await accountStore.getOneClickTradingInfo();
      const isExpired = await accountStore.isOneClickTradingExpired();
      if (!isExpired || oneClickTradingInfo?.hasSeenExpiryToast) return;
      displayExpiredToast();
    };
    main();
  });

  useOneClickTradingInfo({
    onExpire: on1CTSessionExpire,
  });

  const {
    transaction1CTParams,
    setTransaction1CTParams,
    isLoading: isLoading1CTParams,
    spendLimitTokenDecimals,
    reset: reset1CTParams,
  } = useOneClickTradingParams();

  const onClose = () => {
    setIsOpen(false);
    setShow1CTEditParams(false);
    setShouldHideSettingsBackButton(false);
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      className={classNames(show1CTEditParams && "px-0 py-9")}
    >
      <div
        className={classNames(
          "flex items-center",
          show1CTEditParams ? "px-8" : "mx-auto max-w-[31rem]"
        )}
      >
        {show1CTEditParams ? (
          <OneClickTradingSettings
            onClose={() => {
              setShow1CTEditParams(false);
            }}
            hideBackButton={shouldHideSettingsBackButton}
            setTransaction1CTParams={setTransaction1CTParams}
            transaction1CTParams={transaction1CTParams!}
            isLoading={create1CTSessionMutation.isLoading}
            onStartTrading={() => {
              create1CTSessionMutation.onCreate1CTSession({
                spendLimitTokenDecimals,
                transaction1CTParams,
                walletRepo: accountStore.getWalletRepo(
                  chainStore.osmosis.chainId
                ),
              });
            }}
          />
        ) : (
          <IntroducingOneClick
            isLoading={isLoading1CTParams || create1CTSessionMutation.isLoading}
            onStartTrading={() => {
              reset1CTParams();
              create1CTSessionMutation.onCreate1CTSession({
                spendLimitTokenDecimals,
                transaction1CTParams,
                walletRepo: accountStore.getWalletRepo(
                  chainStore.osmosis.chainId
                ),
              });
            }}
            onClickEditParams={() => {
              setShow1CTEditParams(true);
            }}
          />
        )}
      </div>
    </ModalBase>
  );
});

export default OneClickTradingIntroModal;
