import type { DeliverTxResponse } from "@osmosis-labs/tx";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { displayToast, ToastType } from "~/components/alert";
import { useWallet } from "~/hooks/use-wallet";
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
  const { signAndBroadcast, getChainWallet } = useWallet();

  return useMutation({
    ...queryOptions,
    mutationFn: async ({ authenticatorId }: { authenticatorId: string }) => {
      const userOsmoAddress = getChainWallet(
        accountStore.osmosisChainId
      ).address;

      if (!userOsmoAddress) {
        throw new Error("User Osmo address not found");
      }

      const msg = await makeRemoveAuthenticatorMsg({
        id: BigInt(authenticatorId),
        sender: userOsmoAddress,
      });

      await new Promise<DeliverTxResponse>((resolve, reject) => {
        signAndBroadcast(
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
        ).catch((error) => {
          reject(error);
        });
      });

      onEnd1CTSession({ accountStore, authenticatorId });
    },
  });
};
