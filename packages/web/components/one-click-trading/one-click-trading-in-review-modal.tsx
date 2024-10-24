import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useImperativeHandle,
} from "react";

import { displayErrorRemovingSessionToast } from "~/components/alert/one-click-trading-toasts";
import { isRejectedTxErrorMessage } from "~/components/alert/prettify";
import { OneClickTradingSettings } from "~/components/one-click-trading/one-click-trading-settings";
import { useOneClickTradingSession } from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useRemoveOneClickTradingSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface Props {
  onGoBack: () => void;
  transaction1CTParams: OneClickTradingTransactionParams | undefined;
  setTransaction1CTParams: Dispatch<
    SetStateAction<OneClickTradingTransactionParams | undefined>
  >;
  spendLimitTokenDecimals: number | undefined;
  isLoading1CTParams?: boolean;
  resetTransaction1CTParams: () => void;
}

export interface OneClickTradingInReviewModalRef {
  onStartTrading: () => Promise<void>;
  isLoading: boolean;
}

export const OneClickTradingInReviewModal = forwardRef<
  OneClickTradingInReviewModalRef,
  Props
>((props, ref) => {
  const {
    onGoBack,
    transaction1CTParams,
    setTransaction1CTParams,
    spendLimitTokenDecimals,
    isLoading1CTParams,
    resetTransaction1CTParams,
  } = props;

  const { accountStore, chainStore } = useStore();
  const { oneClickTradingInfo, isOneClickTradingEnabled } =
    useOneClickTradingSession();
  const removeSession = useRemoveOneClickTradingSession();
  const create1CTSession = useCreateOneClickTradingSession();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const shouldFetchSessionAuthenticator =
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
      enabled: shouldFetchSessionAuthenticator,
      cacheTime: 15_000, // 15 seconds
      staleTime: 15_000, // 15 seconds
      retry: false,
    }
  );

  const onStartTrading = useCallback(async () => {
    await create1CTSession.mutateAsync(
      {
        spendLimitTokenDecimals,
        transaction1CTParams,
        walletRepo: accountStore.getWalletRepo(chainStore.osmosis.chainId),
        /**
         * If the user has an existing session, remove it and add the new one.
         */
        additionalAuthenticatorsToRemove: sessionAuthenticator
          ? [BigInt(sessionAuthenticator.id)]
          : undefined,
      },
      {
        onSuccess: onGoBack,
      }
    );
  }, [
    onGoBack,
    accountStore,
    chainStore.osmosis.chainId,
    create1CTSession,
    sessionAuthenticator,
    spendLimitTokenDecimals,
    transaction1CTParams,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      isLoading: create1CTSession.isLoading,
      onStartTrading,
    }),
    [onStartTrading, create1CTSession]
  );

  return (
    <OneClickTradingSettings
      showCreationButton={false}
      transaction1CTParams={transaction1CTParams}
      setTransaction1CTParams={setTransaction1CTParams}
      resetTransaction1CTParams={resetTransaction1CTParams}
      isLoading={
        isLoading1CTParams ||
        (shouldFetchSessionAuthenticator
          ? isLoadingSessionAuthenticator
          : false)
      }
      isSendingTx={create1CTSession.isLoading}
      onStartTrading={onStartTrading}
      onGoBack={onGoBack}
      hasExistingSession={isOneClickTradingEnabled}
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
              onGoBack();
            },
            onError: (e) => {
              const error = e as Error;
              rollback();
              if (!isRejectedTxErrorMessage({ message: error?.message })) {
                displayErrorRemovingSessionToast();
              }
            },
          }
        );
      }}
      isEndingSession={removeSession.isLoading}
    />
  );
});
