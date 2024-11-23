import { Dec, PricePretty } from "@keplr-wallet/unit";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { displayErrorRemovingSessionToast } from "~/components/alert/one-click-trading-toasts";
import { isRejectedTxErrorMessage } from "~/components/alert/prettify";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useRemoveOneClickTradingSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useOneClickTradingSession } from "~/hooks/one-click-trading/use-one-click-trading-session";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

export function useOneClickTradingSessionManager({
  onCommit,
}: {
  onCommit: () => void;
}) {
  const { logEvent } = useAmplitudeAnalytics();

  const { accountStore, chainStore } = useStore();

  const {
    isOneClickTradingEnabled: isEnabled,
    isOneClickTradingExpired: isExpired,
    oneClickTradingInfo: info,
    isLoadingInfo,
  } = useOneClickTradingSession();

  const {
    initialTransaction1CTParams: initialTransactionParams,
    transaction1CTParams: transactionParams,
    setTransaction1CTParams: setTransactionParams,
    spendLimitTokenDecimals,
    reset: resetParams,
    changes,
    setChanges,
  } = useOneClickTradingParams({
    oneClickTradingInfo: info,
    defaultIsOneClickEnabled: isEnabled ?? false,
  });

  const shouldSend1CTTx = useMemo(() => {
    // Turn on or off: The session status have changed either turned on or off explicitly
    if (
      transactionParams?.isOneClickEnabled !==
      initialTransactionParams?.isOneClickEnabled
    ) {
      return true;
    }

    // Modify: The session was already on, wasn't turned off and the params have changed
    if (
      transactionParams?.isOneClickEnabled &&
      initialTransactionParams?.isOneClickEnabled &&
      changes.length > 0
    ) {
      return true;
    }

    return false;
  }, [transactionParams, initialTransactionParams, changes]);

  const {
    wouldExceedSpendLimit,
    remainingSpendLimit,
    sessionAuthenticator,
    isLoading: isLoadingRemainingSpendLimit,
  } = useOneClickRemainingSpendLimit({
    enabled: isEnabled,
    transactionParams,
    oneClickTradingInfo: info,
  });

  const isLoading = isLoadingInfo || isLoadingRemainingSpendLimit;

  const createSession = useCreateOneClickTradingSession();
  const removeSession = useRemoveOneClickTradingSession();

  const onCommitRef = useRef(onCommit);
  const isEnabledRef = useRef(isEnabled);
  useEffect(() => {
    onCommitRef.current = onCommit;
    isEnabledRef.current = isEnabled;
  }, [onCommit, isEnabled]);

  const startSession = useCallback(() => {
    if (!transactionParams) return;

    const rollbackCreateSession = () => {
      setTransactionParams({
        ...(initialTransactionParams ?? transactionParams),
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
        onSuccess: async () => {
          // Wait for isEnabled to be updated before committing
          await new Promise<void>((resolve, reject) => {
            let retries = 0;
            const maxRetries = 10; // 1 second
            const checkIsEnabled = () => {
              if (isEnabledRef.current) {
                resolve();
              } else if (retries >= maxRetries) {
                reject(
                  new Error(
                    "Timed out waiting for one-click trading to be enabled"
                  )
                );
              } else {
                retries++;
                setTimeout(checkIsEnabled, 100);
              }
            };
            checkIsEnabled();
          });
          onCommitRef.current();
        },
        onError: () => {
          rollbackCreateSession();
          onCommitRef.current();
        },
      }
    );
  }, [
    transactionParams,
    createSession,
    spendLimitTokenDecimals,
    accountStore,
    chainStore.osmosis.chainId,
    sessionAuthenticator,
    setTransactionParams,
    initialTransactionParams,
  ]);

  const stopSession = useCallback(() => {
    if (!transactionParams) return;

    const rollbackRemoveSession = () => {
      setTransactionParams({
        ...(initialTransactionParams ?? transactionParams),
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
          onCommitRef.current();
        },
        onSettled: () => {
          onCommitRef.current();
        },
      }
    );
  }, [
    info,
    initialTransactionParams,
    removeSession,
    setTransactionParams,
    transactionParams,
  ]);

  const commitSessionChange = useCallback(() => {
    if (!shouldSend1CTTx) {
      onCommitRef.current();
      return;
    }

    if (!transactionParams) return;

    if (transactionParams.isOneClickEnabled) {
      startSession();
    } else {
      stopSession();
    }
  }, [shouldSend1CTTx, transactionParams, startSession, stopSession]);

  return {
    isEnabled,
    isExpired,
    isLoading,
    commitSessionChangeIsLoading:
      createSession.isLoading || removeSession.isLoading,
    changes,
    setChanges,
    transactionParams,
    wouldExceedSpendLimit,
    remainingSpendLimit,
    setTransactionParams,
    commitSessionChange,
    resetParams,
  };
}

export function useOneClickRemainingSpendLimit({
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
        authenticatorId: oneClickTradingInfo?.authenticatorId ?? "",
        userOsmoAddress: oneClickTradingInfo?.userOsmoAddress ?? "",
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

  const wouldExceedSpendLimit = useCallback(
    ({
      wantToSpend,
      maybeSpendLimit,
      maybeWouldSpendTotal,
    }: {
      wantToSpend: Dec;
      maybeSpendLimit?: Dec;
      maybeWouldSpendTotal?: Dec;
    }) => {
      const spendLimit =
        maybeSpendLimit ?? transactionParams?.spendLimit?.toDec() ?? new Dec(0);
      const amountSpent = amountSpentData?.amountSpent?.toDec() ?? new Dec(0);
      /**
       * If we have simulation results then we use the exact amount that would be spent
       * if not we provide a fallback by adding already spent amount and the next spending
       * (the fallback ignores the fact that for some tokens, the value is not included in the spend limit)
       */
      const wouldSpend = maybeWouldSpendTotal ?? amountSpent.add(wantToSpend);

      return wouldSpend.gt(spendLimit);
    },
    [amountSpentData, transactionParams]
  );

  return {
    amountSpent: amountSpentData?.amountSpent,
    remainingSpendLimit,
    wouldExceedSpendLimit,
    sessionAuthenticator,
    isLoading,
  };
}

export function formatSpendLimit(price: PricePretty | undefined) {
  return `${price?.symbol}${trimPlaceholderZeros(
    price?.toDec().toString(2) ?? ""
  )}`;
}
