import { Dec, PricePretty } from "@keplr-wallet/unit";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useCallback, useEffect, useMemo } from "react";
import { useAsync } from "react-use";
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
  initialTransactionParams?: OneClickTradingTransactionParams;
  setTransaction1CTParams: (
    transaction1CTParams: OneClickTradingTransactionParams | undefined
  ) => void;
  setSpendLimitTokenDecimals: (
    spendLimitTokenDecimals: number | undefined
  ) => void;
  setChanges: (changes: OneClickTradingParamsChanges | undefined) => void;
  setInitialTransactionParams: (
    initialTransactionParams: OneClickTradingTransactionParams | undefined
  ) => void;
}>((set) => ({
  spendLimitTokenDecimals: undefined,
  transaction1CTParams: undefined,
  changes: undefined,
  initialTransactionParams: undefined,
  setTransaction1CTParams: (transaction1CTParams) =>
    set({ transaction1CTParams }),
  setSpendLimitTokenDecimals: (spendLimitTokenDecimals) =>
    set({ spendLimitTokenDecimals }),
  setChanges: (changes) => set({ changes }),
  setInitialTransactionParams: (initialTransactionParams) =>
    set({ initialTransactionParams }),
}));

export function useOneClickTradingSwapReview({
  isModalOpen,
}: {
  isModalOpen: boolean;
}) {
  const {
    isOneClickTradingEnabled: isEnabled,
    isOneClickTradingExpired: isExpired,
    oneClickTradingInfo,
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
    oneClickTradingInfo,
    defaultIsOneClickEnabled: isEnabled ?? false,
  });

  const { wouldExceedSpendLimit, remainingSpendLimit } =
    useOneClickRemainingSpendLimit({
      enabled: isEnabled,
      transactionParams,
      oneClickTradingInfo,
    });

  const isLoading = isLoadingInfo;

  useEffect(() => {
    if (isModalOpen) {
      use1CTSwapReviewStore
        .getState()
        .setTransaction1CTParams(transactionParams);
    }
  }, [transactionParams, isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      use1CTSwapReviewStore
        .getState()
        .setSpendLimitTokenDecimals(spendLimitTokenDecimals);
    }
  }, [isModalOpen, spendLimitTokenDecimals]);

  useEffect(() => {
    if (isModalOpen) {
      use1CTSwapReviewStore
        .getState()
        .setInitialTransactionParams(initialTransactionParams);
    }
  }, [isModalOpen, initialTransactionParams]);

  useEffect(() => {
    if (isModalOpen) {
      use1CTSwapReviewStore.getState().setChanges(changes);
    }
  }, [isModalOpen, changes]);

  useEffect(() => {
    if (!isModalOpen) {
      const state = use1CTSwapReviewStore.getState();
      resetParams();
      state.setTransaction1CTParams(undefined);
      state.setSpendLimitTokenDecimals(undefined);
      state.setChanges(undefined);
      state.setInitialTransactionParams(undefined);
    }
  }, [isModalOpen, resetParams]);

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
  };
}

export function use1CTSwapReviewMessages() {
  const apiUtils = api.useUtils();

  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const {
    transaction1CTParams,
    spendLimitTokenDecimals,
    changes,
    initialTransactionParams,
  } = use1CTSwapReviewStore(
    useShallow((state) => ({
      transaction1CTParams: state.transaction1CTParams,
      spendLimitTokenDecimals: state.spendLimitTokenDecimals,
      changes: state.changes,
      initialTransactionParams: state.initialTransactionParams,
    }))
  );

  const { oneClickTradingInfo, isOneClickTradingEnabled, isLoadingInfo } =
    useOneClickTradingSession();

  const shouldFetchExistingSessionAuthenticator =
    !!account?.address && !!oneClickTradingInfo;

  const {
    data: sessionAuthenticator,
    isLoading: isLoadingSessionAuthenticator,
  } = api.local.oneClickTrading.getSessionAuthenticator.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
      publicKey: oneClickTradingInfo?.publicKey ?? "",
    },
    {
      enabled:
        isOneClickTradingEnabled && shouldFetchExistingSessionAuthenticator,
      cacheTime: 15_000, // 15 seconds
      staleTime: 15_000, // 15 seconds
      retry: false,
    }
  );

  const shouldSend1CTTx = useMemo(() => {
    // Turn on or off: The session status have changed either turned on or off explicitly
    if (
      transaction1CTParams?.isOneClickEnabled !==
      initialTransactionParams?.isOneClickEnabled
    ) {
      return true;
    }

    // Modify: The session was already on, wasn't turned off and the params have changed
    if (
      transaction1CTParams?.isOneClickEnabled &&
      initialTransactionParams?.isOneClickEnabled &&
      (changes ?? [])?.length > 0
    ) {
      return true;
    }

    return false;
  }, [transaction1CTParams, initialTransactionParams, changes]);

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

  return {
    oneClickMessages,
    shouldSend1CTTx,
    isLoadingOneClickMessages: shouldSend1CTTx
      ? isLoadingOneClickMessages ||
        (shouldFetchExistingSessionAuthenticator
          ? isLoadingSessionAuthenticator
          : false) ||
        isLoadingInfo
      : false,
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
    [amountSpentData, transactionParams]
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
