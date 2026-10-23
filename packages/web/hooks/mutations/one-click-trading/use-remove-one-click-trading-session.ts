import type { DeliverTxResponse } from "@osmosis-labs/tx";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { displayToast, ToastType } from "~/components/alert";
import { OsmosisChainInfo } from "~/config/chain";
import { useWallet } from "~/hooks/use-wallet";

type UseRemoveOneClickTradingMutationOptions = Omit<
  UseMutationOptions<void, unknown, { authenticatorId: string }, unknown>,
  "mutationFn"
>;

export async function onEnd1CTSession({
  walletApi,
  authenticatorId,
}: {
  walletApi: Pick<
    ReturnType<typeof useWallet>,
    | "getOneClickTradingInfo"
    | "setOneClickTradingInfo"
    | "setShouldUseOneClickTrading"
  >;
  authenticatorId: string;
}) {
  const oneClickTradingInfo = await walletApi.getOneClickTradingInfo();

  if (oneClickTradingInfo?.authenticatorId === authenticatorId) {
    await walletApi.setOneClickTradingInfo(undefined);
    await walletApi.setShouldUseOneClickTrading({ nextValue: false });
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
  const walletApi = useWallet();
  const { signAndBroadcast, getChainWallet } = walletApi;

  return useMutation({
    ...queryOptions,
    mutationFn: async ({ authenticatorId }: { authenticatorId: string }) => {
      const userOsmoAddress = getChainWallet(OsmosisChainInfo.chainId).address;

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

      await onEnd1CTSession({ walletApi, authenticatorId });
    },
  });
};
