import { DeliverTxResponse } from "@osmosis-labs/stores";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { displayToast, ToastType } from "~/components/alert";
import { useStore } from "~/stores";

type UseRemoveOneClickTradingMutationOptions = Omit<
  UseMutationOptions<void, unknown, { authenticatorId: string }, unknown>,
  "mutationFn"
>;

export async function onEnd1CTSession({
  accountStore,
  authenticatorId,
}: {
  accountStore: ReturnType<typeof useStore>["accountStore"];
  authenticatorId: string;
}) {
  const oneClickTradingInfo = await accountStore.getOneClickTradingInfo();

  if (oneClickTradingInfo?.authenticatorId === authenticatorId) {
    accountStore.setOneClickTradingInfo(undefined);
    accountStore.setShouldUseOneClickTrading({ nextValue: false });
    displayToast(
      {
        titleTranslationKey: "oneClickTrading.toast.oneClickTradingDisabled",
        captionTranslationKey: "oneClickTrading.toast.sessionEnded",
      },
      ToastType.ONE_CLICK_TRADING
    );
  }
}

export const useRemoveOneClickTradingSession = ({
  queryOptions,
}: {
  queryOptions?: UseRemoveOneClickTradingMutationOptions;
} = {}) => {
  const { accountStore } = useStore();

  return useMutation({
    ...queryOptions,
    mutationFn: async ({ authenticatorId }: { authenticatorId: string }) => {
      const userOsmoAddress = accountStore.getWallet(
        accountStore.osmosisChainId
      )?.address;

      if (!userOsmoAddress) {
        throw new Error("User Osmo address not found");
      }

      const msg = await makeRemoveAuthenticatorMsg({
        id: BigInt(authenticatorId),
        sender: userOsmoAddress,
      });

      await new Promise<DeliverTxResponse>((resolve, reject) => {
        accountStore
          .signAndBroadcast(
            accountStore.osmosisChainId,
            "addOrRemoveAuthenticators",
            [msg],
            "",
            undefined,
            { preferNoSetFee: true },
            {
              onFulfill: (tx) => {
                if (tx.code === 0) {
                  resolve(tx);
                } else {
                  reject(new Error("Transaction failed"));
                }
              },
            }
          )
          .catch((error) => {
            reject(error);
          });
      });

      onEnd1CTSession({ accountStore, authenticatorId });
    },
  });
};
