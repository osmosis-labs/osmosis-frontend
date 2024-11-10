import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useCallback, useMemo, useState } from "react";

import { displayErrorRemovingSessionToast } from "~/components/alert/one-click-trading-toasts";
import { isRejectedTxErrorMessage } from "~/components/alert/prettify";
import { EventName } from "~/config";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useRemoveOneClickTradingSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useOneClickTradingSession } from "~/hooks/one-click-trading/use-one-click-trading-session";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { formatSpendLimit } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export function useOneClickTradingSessionManager({
  onCommit,
}: {
  onCommit: () => void;
}) {
  const { logEvent } = useAmplitudeAnalytics();

  const { accountStore, chainStore } = useStore();

  const [hasParamsEnableChanged, setHasParamsEnableChanged] = useState(false);

  const {
    isOneClickTradingEnabled: isEnabled,
    isOneClickTradingExpired: isExpired,
    oneClickTradingInfo: info,
    isLoadingInfo,
  } = useOneClickTradingSession();

  const {
    transaction1CTParams: transactionParams,
    setTransaction1CTParams: setTransactionParams,
    spendLimitTokenDecimals,
    isLoading: isLoadingParams,
    reset: resetParams,
  } = useOneClickTradingParams({
    oneClickTradingInfo: info,
    defaultIsOneClickEnabled: isEnabled ?? false,
  });

  const {
    remainingSpendLimit,
    sessionAuthenticator,
    isLoading: isLoadingRemainingSpendLimit,
  } = useRemainingSpendLimit({
    enabled: isEnabled,
    transactionParams,
    oneClickTradingInfo: info,
  });

  const isLoading =
    isLoadingInfo || isLoadingParams || isLoadingRemainingSpendLimit;

  const createSession = useCreateOneClickTradingSession();
  const removeSession = useRemoveOneClickTradingSession();

  const toggleTransactionParamsEnable = useCallback(() => {
    if (!transactionParams) return;

    setTransactionParams({
      ...transactionParams,
      isOneClickEnabled: !transactionParams.isOneClickEnabled,
    });
    setHasParamsEnableChanged((prev) => !prev);
  }, [setTransactionParams, transactionParams]);

  const cleanUpAndCommit = useCallback(() => {
    setHasParamsEnableChanged(false);
    resetParams();
    onCommit();
  }, [setHasParamsEnableChanged, onCommit, resetParams]);

  const startSession = useCallback(() => {
    if (!transactionParams) return;

    const rollbackCreateSession = () => {
      setTransactionParams({
        ...transactionParams,
        isOneClickEnabled: false,
      });
    };

    createSession.mutate(
      {
        spendLimitTokenDecimals,
        transaction1CTParams: transactionParams,
        walletRepo: accountStore.getWalletRepo(chainStore.osmosis.chainId),
        /**
         * If the user has an existing session, remove it and add the new one.
         */
        additionalAuthenticatorsToRemove: sessionAuthenticator
          ? [BigInt(sessionAuthenticator.id)]
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
        onSettled: cleanUpAndCommit,
      }
    );
  }, [
    accountStore,
    chainStore.osmosis.chainId,
    createSession,
    cleanUpAndCommit,
    logEvent,
    sessionAuthenticator,
    setTransactionParams,
    spendLimitTokenDecimals,
    transactionParams,
  ]);

  const stopSession = useCallback(() => {
    if (!transactionParams) return;

    const rollbackRemoveSession = () => {
      setTransactionParams({
        ...transactionParams,
        isOneClickEnabled: true,
      });
    };

    if (!info) {
      displayErrorRemovingSessionToast();
      rollbackRemoveSession();
      throw new Error("oneClickTradingInfo is undefined");
    }

    removeSession.mutate(
      {
        authenticatorId: info?.authenticatorId,
      },
      {
        onError: (e) => {
          const error = e as Error;
          rollbackRemoveSession();
          if (!isRejectedTxErrorMessage({ message: error?.message })) {
            displayErrorRemovingSessionToast();
          }
        },
        onSettled: cleanUpAndCommit,
      }
    );
  }, [
    cleanUpAndCommit,
    info,
    removeSession,
    setTransactionParams,
    transactionParams,
  ]);

  const commitSessionChange = useCallback(() => {
    if (!hasParamsEnableChanged) {
      cleanUpAndCommit();
      return;
    }

    if (!transactionParams) return;

    if (transactionParams.isOneClickEnabled) {
      startSession();
    } else {
      stopSession();
    }
  }, [
    hasParamsEnableChanged,
    transactionParams,
    cleanUpAndCommit,
    startSession,
    stopSession,
  ]);

  return {
    isEnabled,
    isExpired,
    isLoading,
    transactionParams,
    remainingSpendLimit,
    setTransactionParams,
    toggleTransactionParamsEnable,
    commitSessionChange,
    resetParams,
  };
}

export function useRemainingSpendLimit({
  enabled = true,
  transactionParams,
  oneClickTradingInfo,
}: {
  enabled?: boolean;
  transactionParams?: OneClickTradingTransactionParams;
  oneClickTradingInfo?: OneClickTradingInfo;
}) {
  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const shouldFetchExistingSessionAuthenticator =
    !!account?.address && !!oneClickTradingInfo;

  const { data: sessionAuthenticator, isLoading } =
    api.local.oneClickTrading.getSessionAuthenticator.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
        publicKey: oneClickTradingInfo?.publicKey ?? "",
      },
      {
        enabled: enabled && shouldFetchExistingSessionAuthenticator,
        cacheTime: 15_000, // 15 seconds
        staleTime: 15_000, // 15 seconds
        retry: false,
      }
    );

  const { data: amountSpentData } =
    api.local.oneClickTrading.getAmountSpent.useQuery(
      {
        authenticatorId: oneClickTradingInfo?.authenticatorId!,
        userOsmoAddress: oneClickTradingInfo?.userOsmoAddress!,
      },
      {
        enabled: enabled && !!oneClickTradingInfo,
      }
    );

  const remainingSpendLimit = useMemo(
    () =>
      transactionParams?.spendLimit && amountSpentData?.amountSpent
        ? formatSpendLimit(
            transactionParams.spendLimit.sub(amountSpentData.amountSpent)
          )
        : undefined,
    [transactionParams, amountSpentData]
  );

  return {
    remainingSpendLimit,
    sessionAuthenticator,
    isLoading,
  };
}
