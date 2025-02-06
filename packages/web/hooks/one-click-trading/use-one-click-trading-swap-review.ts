import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo } from "react";
import { useAsync, useLocalStorage } from "react-use";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { makeCreate1CTSessionMessage } from "~/hooks/mutations/one-click-trading";
import {
  OneClickTradingParamsChanges,
  useOneClickTradingParams,
} from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useOneClickTradingSession } from "~/hooks/one-click-trading/use-one-click-trading-session";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

const use1CTSwapReviewStore = create<{
  transaction1CTParams?: OneClickTradingTransactionParams;
  spendLimitTokenDecimals?: number;
  changes?: OneClickTradingParamsChanges;
  setTransaction1CTParams: (
    transaction1CTParams: OneClickTradingTransactionParams | undefined
  ) => void;
  setSpendLimitTokenDecimals: (
    spendLimitTokenDecimals: number | undefined
  ) => void;
  setChanges: (changes: OneClickTradingParamsChanges | undefined) => void;
}>((set) => ({
  spendLimitTokenDecimals: undefined,
  transaction1CTParams: undefined,
  changes: undefined,
  setTransaction1CTParams: (transaction1CTParams) =>
    set({ transaction1CTParams }),
  setSpendLimitTokenDecimals: (spendLimitTokenDecimals) =>
    set({ spendLimitTokenDecimals }),
  setChanges: (changes) => set({ changes }),
}));

export function useOneClickTradingSwapReview({
  enabled,
}: {
  enabled: boolean;
}) {
  const [previousIsOneClickEnabled, setPreviousIsOneClickEnabled] =
    useLocalStorage("previous-one-click-enabled", true);

  const {
    isOneClickTradingEnabled: isEnabled,
    isOneClickTradingExpired: isExpired,
    oneClickTradingInfo,
    isLoadingInfo,
  } = useOneClickTradingSession();

  const {
    transaction1CTParams: transactionParams,
    setTransaction1CTParams: setTransactionParams,
    spendLimitTokenDecimals,
    reset: resetParams,
    changes,
    setChanges,
  } = useOneClickTradingParams({
    oneClickTradingInfo,
    defaultIsOneClickEnabled: previousIsOneClickEnabled,
  });

  const { wouldExceedSpendLimit, remainingSpendLimit } =
    useOneClickRemainingSpendLimit({
      enabled: isEnabled,
      transactionParams,
      oneClickTradingInfo,
    });

  const isLoading = isLoadingInfo;

  useEffect(() => {
    if (enabled) {
      use1CTSwapReviewStore
        .getState()
        .setTransaction1CTParams(transactionParams);
    }
  }, [transactionParams, enabled]);

  useEffect(() => {
    if (enabled) {
      use1CTSwapReviewStore
        .getState()
        .setSpendLimitTokenDecimals(spendLimitTokenDecimals);
    }
  }, [enabled, spendLimitTokenDecimals]);

  useEffect(() => {
    if (enabled) {
      use1CTSwapReviewStore.getState().setChanges(changes);
    }
  }, [enabled, changes]);

  useEffect(() => {
    if (!enabled) {
      const state = use1CTSwapReviewStore.getState();
      resetParams();
      state.setTransaction1CTParams(undefined);
      state.setSpendLimitTokenDecimals(undefined);
      state.setChanges(undefined);
    }
  }, [enabled, resetParams]);

  return {
    isEnabled,
    isExpired,
    isLoading,
    changes,
    setChanges,
    transactionParams,
    wouldExceedSpendLimit,
    remainingSpendLimit,
    setTransactionParams,
    resetParams,
    setPreviousIsOneClickEnabled,
  };
}

export function use1CTSwapReviewMessages() {
  const apiUtils = api.useUtils();

  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const { transaction1CTParams, spendLimitTokenDecimals, changes } =
    use1CTSwapReviewStore(
      useShallow((state) => ({
        transaction1CTParams: state.transaction1CTParams,
        spendLimitTokenDecimals: state.spendLimitTokenDecimals,
        changes: state.changes,
      }))
    );

  const { oneClickTradingInfo, isOneClickTradingEnabled, isLoadingInfo } =
    useOneClickTradingSession();

  const shouldFetchExistingSessionAuthenticator =
    !!account?.address && !!oneClickTradingInfo;

  const enabledFetchingSessionAuthenticator =
    isOneClickTradingEnabled && shouldFetchExistingSessionAuthenticator;

  const {
    data: sessionAuthenticator,
    isLoading: isLoadingSessionAuthenticator,
    error: sessionAuthenticatorError,
  } = api.local.oneClickTrading.getSessionAuthenticator.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
      publicKey: oneClickTradingInfo?.publicKey ?? "",
    },
    {
      enabled: enabledFetchingSessionAuthenticator,
      cacheTime: 15_000, // 15 seconds
      staleTime: 15_000, // 15 seconds
      retry: false,
    }
  );

  const shouldSend1CTTx = useMemo(() => {
    if (isOneClickTradingEnabled && (changes ?? []).length === 0) return false;
    if (transaction1CTParams?.isOneClickEnabled) return true;
    return false;
  }, [transaction1CTParams, changes, isOneClickTradingEnabled]);

  const { value: oneClickMessages, loading: isLoadingOneClickMessages } =
    useAsync(async () => {
      if (
        !transaction1CTParams ||
        !spendLimitTokenDecimals ||
        !account?.address ||
        !shouldSend1CTTx
      )
        return undefined;

      if (transaction1CTParams.isOneClickEnabled) {
        const result = await makeCreate1CTSessionMessage({
          apiUtils,
          transaction1CTParams,
          spendLimitTokenDecimals,
          userOsmoAddress: account?.address ?? "",
          /**
           * If the user has an existing session, remove it and add the new one.
           */
          additionalAuthenticatorsToRemove: sessionAuthenticator
            ? [BigInt(sessionAuthenticator.id)]
            : undefined,
        });
        return { type: "create-1ct-session" as const, ...result };
      }

      return {
        type: "remove-1ct-session" as const,
        authenticatorId: oneClickTradingInfo!.authenticatorId,
        msgs: [
          await makeRemoveAuthenticatorMsg({
            id: BigInt(oneClickTradingInfo!.authenticatorId),
            sender: account.address,
          }),
        ],
      };
    }, [
      account?.address,
      apiUtils,
      oneClickTradingInfo,
      sessionAuthenticator,
      shouldSend1CTTx,
      spendLimitTokenDecimals,
      transaction1CTParams,
    ]);
  const isLoading = shouldSend1CTTx
    ? isLoadingOneClickMessages ||
      (shouldFetchExistingSessionAuthenticator &&
      !sessionAuthenticatorError &&
      enabledFetchingSessionAuthenticator
        ? isLoadingSessionAuthenticator
        : false) ||
      isLoadingInfo
    : false;

  return {
    oneClickMessages,
    shouldSend1CTTx,
    isLoadingOneClickMessages: isLoading,
  };
}

function useOneClickRemainingSpendLimit({
  enabled = true,
  transactionParams,
  oneClickTradingInfo,
}: {
  enabled?: boolean;
  transactionParams?: OneClickTradingTransactionParams;
  oneClickTradingInfo?: OneClickTradingInfo;
}) {
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
      maybeWouldSpendTotal,
    }: {
      wantToSpend: Dec;
      maybeWouldSpendTotal?: Dec;
    }) => {
      if (!enabled) return false;
      if (wantToSpend.isZero()) return false;

      const spendLimit = transactionParams?.spendLimit?.toDec() ?? new Dec(0);
      const amountSpent = amountSpentData?.amountSpent?.toDec() ?? new Dec(0);
      /**
       * If we have simulation results then we use the exact amount that would be spent
       * if not we provide a fallback by adding already spent amount and the next spending
       * (the fallback ignores the fact that for some tokens, the value is not included in the spend limit)
       */
      const wouldSpend = maybeWouldSpendTotal ?? amountSpent.add(wantToSpend);

      return wouldSpend.gt(spendLimit);
    },
    [amountSpentData?.amountSpent, enabled, transactionParams?.spendLimit]
  );

  return {
    amountSpent: amountSpentData?.amountSpent,
    remainingSpendLimit,
    wouldExceedSpendLimit,
  };
}

export function formatSpendLimit(price: PricePretty | undefined) {
  return `${price?.symbol}${trimPlaceholderZeros(
    price?.toDec().toString(2) ?? ""
  )}`;
}
