import { useCallback, useState } from "react";

import { displayErrorRemovingSessionToast } from "~/components/alert/one-click-trading-toasts";
import { isRejectedTxErrorMessage } from "~/components/alert/prettify";
import { EventName } from "~/config";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useRemoveOneClickTradingSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useOneClickTradingSession } from "~/hooks/one-click-trading/use-one-click-trading-session";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export function useOneClickTradingStatusToggle({
  confirmAction,
}: {
  confirmAction: () => void;
}) {
  const { logEvent } = useAmplitudeAnalytics();

  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const {
    isOneClickTradingEnabled,
    oneClickTradingInfo,
    isOneClickTradingExpired,
    isLoadingInfo: isLoadingOneClickTradingSession,
  } = useOneClickTradingSession();

  const {
    transaction1CTParams,
    setTransaction1CTParams,
    spendLimitTokenDecimals,
    isLoading: isLoading1CTParams,
    reset: reset1CTParams,
  } = useOneClickTradingParams({
    oneClickTradingInfo,
    defaultIsOneClickEnabled: isOneClickTradingEnabled ?? false,
  });

  const shouldFetchExistingSessionAuthenticator =
    !!account?.address && !!oneClickTradingInfo;

  const {
    data: existingSessionAuthenticator,
    isLoading: isLoadingExistingSessionAuthenticator,
  } = api.local.oneClickTrading.getSessionAuthenticator.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
      publicKey: oneClickTradingInfo?.publicKey ?? "",
    },
    {
      enabled: shouldFetchExistingSessionAuthenticator,
      cacheTime: 15_000, // 15 seconds
      staleTime: 15_000, // 15 seconds
      retry: false,
    }
  );

  const isLoading =
    isLoadingOneClickTradingSession ||
    isLoading1CTParams ||
    (shouldFetchExistingSessionAuthenticator
      ? isLoadingExistingSessionAuthenticator
      : false);

  const [has1CTStatusChanged, setHas1CTStatusChanged] = useState(false);

  const create1CTSession = useCreateOneClickTradingSession();
  const removeSession = useRemoveOneClickTradingSession();

  const handleOneClickTradingStatusToggle = useCallback(() => {
    if (!transaction1CTParams) return;

    setTransaction1CTParams({
      ...transaction1CTParams,
      isOneClickEnabled: !transaction1CTParams.isOneClickEnabled,
    });
    setHas1CTStatusChanged((prev) => !prev);
  }, [setTransaction1CTParams, transaction1CTParams]);

  const cleanUpAndConfirm = useCallback(() => {
    setHas1CTStatusChanged(false);
    reset1CTParams();
    confirmAction();
  }, [setHas1CTStatusChanged, confirmAction, reset1CTParams]);

  const handleEnable = useCallback(() => {
    if (!transaction1CTParams) return;

    const rollbackCreateSession = () => {
      setTransaction1CTParams({
        ...transaction1CTParams,
        isOneClickEnabled: false,
      });
    };

    create1CTSession.mutate(
      {
        spendLimitTokenDecimals,
        transaction1CTParams,
        walletRepo: accountStore.getWalletRepo(chainStore.osmosis.chainId),
        /**
         * If the user has an existing session, remove it and add the new one.
         */
        additionalAuthenticatorsToRemove: existingSessionAuthenticator
          ? [BigInt(existingSessionAuthenticator.id)]
          : undefined,
      },
      {
        onError: (e) => {
          const error = e as Error;
          rollbackCreateSession();
          if (!isRejectedTxErrorMessage({ message: error?.message })) {
            displayErrorRemovingSessionToast();
          }
        },
        onSuccess: () => {
          logEvent([EventName.OneClickTrading.enableOneClickTrading]);
        },
        onSettled: cleanUpAndConfirm,
      }
    );
  }, [
    accountStore,
    chainStore.osmosis.chainId,
    create1CTSession,
    cleanUpAndConfirm,
    logEvent,
    existingSessionAuthenticator,
    setTransaction1CTParams,
    spendLimitTokenDecimals,
    transaction1CTParams,
  ]);

  const handleDisable = useCallback(() => {
    if (!transaction1CTParams) return;

    const rollbackRemoveSession = () => {
      setTransaction1CTParams({
        ...transaction1CTParams,
        isOneClickEnabled: true,
      });
    };

    if (!oneClickTradingInfo) {
      displayErrorRemovingSessionToast();
      rollbackRemoveSession();
      throw new Error("oneClickTradingInfo is undefined");
    }

    removeSession.mutate(
      {
        authenticatorId: oneClickTradingInfo?.authenticatorId,
      },
      {
        onError: (e) => {
          const error = e as Error;
          rollbackRemoveSession();
          if (!isRejectedTxErrorMessage({ message: error?.message })) {
            displayErrorRemovingSessionToast();
          }
        },
        onSettled: cleanUpAndConfirm,
      }
    );
  }, [
    cleanUpAndConfirm,
    oneClickTradingInfo,
    removeSession,
    setTransaction1CTParams,
    transaction1CTParams,
  ]);

  const handleConfirm = useCallback(() => {
    if (!has1CTStatusChanged) {
      cleanUpAndConfirm();
      return;
    }

    if (!transaction1CTParams) return;

    if (transaction1CTParams.isOneClickEnabled) {
      handleEnable();
    } else {
      handleDisable();
    }
  }, [
    cleanUpAndConfirm,
    handleDisable,
    handleEnable,
    has1CTStatusChanged,
    transaction1CTParams,
  ]);

  return {
    isOneClickTradingEnabled,
    isOneClickTradingExpired,
    isLoading,
    transaction1CTParams,
    handleOneClickTradingStatusToggle,
    handleConfirm,
  };
}
