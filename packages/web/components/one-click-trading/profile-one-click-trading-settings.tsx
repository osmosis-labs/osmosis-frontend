import { displayErrorRemovingSessionToast } from "~/components/alert/one-click-trading-toasts";
import { isRejectedTxErrorMessage } from "~/components/alert/prettify";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import { useOneClickTradingParams, useOneClickTradingSession } from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useRemoveOneClickTradingSession } from "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const ProfileOneClickTradingSettings = ({
  onGoBack,
  onClose,
}: {
  onGoBack: () => void;
  onClose: () => void;
}) => {
  const { accountStore, chainStore } = useStore();
  const { oneClickTradingInfo, isOneClickTradingEnabled } =
    useOneClickTradingSession();
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
    }
  );

  const create1CTSession = useCreateOneClickTradingSession({
    queryOptions: {
      onSuccess: () => {
        onGoBack();
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
  } = useOneClickTradingParams({
    oneClickTradingInfo,
    defaultIsOneClickEnabled: isOneClickTradingEnabled ? true : false,
  });

  return (
    <OneClickTradingSettings
      transaction1CTParams={transaction1CTParams}
      setTransaction1CTParams={setTransaction1CTParams}
      isLoading={
        isLoading1CTParams ||
        (shouldFetchSessionAuthenticator
          ? isLoadingSessionAuthenticator
          : false)
      }
      isSendingTx={create1CTSession.isLoading}
      onStartTrading={() => {
        create1CTSession.mutate(
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
            onSuccess: () => {
              onGoBack();
            },
          }
        );
      }}
      onGoBack={() => {
        reset1CTParams();
        onGoBack();
      }}
      onClose={onClose}
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
};
