import { DeliverTxResponse } from "@osmosis-labs/stores";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useStore } from "~/stores";

type UseRemoveMobileSessionMutationOptions = UseMutationOptions<
  void,
  unknown,
  { authenticatorId: string },
  unknown
>;

export const useRemoveMobileSession = ({
  queryOptions,
}: {
  queryOptions?: UseRemoveMobileSessionMutationOptions;
} = {}) => {
  const { accountStore } = useStore();

  return useMutation(async ({ authenticatorId }) => {
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
  }, queryOptions);
};
