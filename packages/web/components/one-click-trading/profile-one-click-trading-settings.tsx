import { displayToast, ToastType } from "~/components/alert";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import {
  useOneClickTradingParams,
  useOneClickTradingSession,
  useTranslation,
} from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useAddOrRemoveAuthenticators } from "~/hooks/mutations/osmosis/add-or-remove-authenticators";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const ProfileOneClickTradingSettings = ({
  onGoBack,
}: {
  onGoBack: () => void;
}) => {
  const { accountStore, chainStore } = useStore();
  const { oneClickTradingInfo, isOneClickTradingEnabled } =
    useOneClickTradingSession();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { t } = useTranslation();

  const shouldFetchSessionAuthenticator =
    !!account?.address && !!oneClickTradingInfo;
  const {
    data: sessionAuthenticator,
    isLoading: isLoadingSessionAuthenticator,
    refetch: refetchSessionAuthenticator,
  } = api.edge.oneClickTrading.getSessionAuthenticator.useQuery(
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
  const removeAuthenticator = useAddOrRemoveAuthenticators();

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
      hasExistingSession={isOneClickTradingEnabled}
      onEndSession={() => {
        const rollback = () => {
          if (!transaction1CTParams) return;
          setTransaction1CTParams({
            ...transaction1CTParams,
            isOneClickEnabled: true,
          });
        };

        if (!sessionAuthenticator) {
          displayToast(
            {
              titleTranslationKey: t(
                "oneClickTrading.profile.failedToGetSession"
              ),
            },
            ToastType.ERROR
          );
          refetchSessionAuthenticator();
          return rollback();
        }

        removeAuthenticator.mutate(
          {
            addAuthenticators: [],
            removeAuthenticators: [BigInt(sessionAuthenticator?.id)],
          },
          {
            onSuccess: () => {
              accountStore.setOneClickTradingInfo(undefined);
              displayToast(
                {
                  titleTranslationKey:
                    "oneClickTrading.toast.oneClickTradingDisabled",
                  captionTranslationKey: "oneClickTrading.toast.sessionEnded",
                },
                ToastType.ONE_CLICK_TRADING
              );
              onGoBack();
            },
            onError: () => {
              rollback();
            },
          }
        );
      }}
      isEndingSession={removeAuthenticator.isLoading}
    />
  );
};
