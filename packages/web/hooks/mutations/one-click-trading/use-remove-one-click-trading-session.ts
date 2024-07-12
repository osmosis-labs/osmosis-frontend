import { DeliverTxResponse } from "@osmosis-labs/stores";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { displayToast, ToastType } from "~/components/alert";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";

export type UseRemoveOneClickTradingMutationOptions = UseMutationOptions<
  void,
  unknown,
  { authenticatorId: string },
  unknown
>;

export const useRemoveOneClickTradingSession = ({
  queryOptions,
}: {
  queryOptions?: UseRemoveOneClickTradingMutationOptions;
} = {}) => {
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { logEvent } = useAmplitudeAnalytics();

  return useMutation(
    async ({ authenticatorId }) => {
      if (!account?.osmosis) {
        throw new Error("Osmosis account not found");
      }

      await new Promise<DeliverTxResponse>((resolve, reject) => {
        account.osmosis
          .sendAddOrRemoveAuthenticatorsMsg({
            addAuthenticators: [],
            removeAuthenticators: [BigInt(authenticatorId)],
            memo: "",
            onFulfill: (tx) => {
              if (tx.code === 0) {
                resolve(tx);
              } else {
                reject(new Error("Transaction failed"));
              }
            },
            signOptions: {
              preferNoSetFee: true,
            },
          })
          .catch((error) => {
            reject(error);
          });
      });

      const oneClickTradingInfo = await accountStore.getOneClickTradingInfo();

      if (oneClickTradingInfo?.authenticatorId === authenticatorId) {
        accountStore.setOneClickTradingInfo(undefined);
        displayToast(
          {
            titleTranslationKey:
              "oneClickTrading.toast.oneClickTradingDisabled",
            captionTranslationKey: "oneClickTrading.toast.sessionEnded",
          },
          ToastType.ONE_CLICK_TRADING
        );
      }
    },
    {
      ...queryOptions,
      onSuccess: (...params) => {
        queryOptions?.onSuccess?.(...params);
        logEvent([EventName.OneClickTrading.endSession]);
      },
    }
  );
};
