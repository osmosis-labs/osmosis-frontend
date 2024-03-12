import { DeliverTxResponse } from "@osmosis-labs/stores";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { displayToast, ToastType } from "~/components/alert";
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
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  return useMutation(async ({ authenticatorId }) => {
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
          titleTranslationKey: "oneClickTrading.toast.oneClickTradingDisabled",
          captionTranslationKey: "oneClickTrading.toast.sessionEnded",
        },
        ToastType.ONE_CLICK_TRADING
      );
    }
  }, queryOptions);
};
