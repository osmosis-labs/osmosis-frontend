import { DeliverTxResponse } from "@osmosis-labs/tx";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useStore } from "~/stores";

type UseRemoveMobileSessionMutationOptions = UseMutationOptions<
  void,
  unknown,
  { authenticatorIds: string[] },
  unknown
>;

export const useRemoveMobileSession = ({
  queryOptions,
}: {
  queryOptions?: UseRemoveMobileSessionMutationOptions;
} = {}) => {
  const { accountStore } = useStore();

  return useMutation(async ({ authenticatorIds }) => {
    const userOsmoAddress = accountStore.getWallet(
      accountStore.osmosisChainId
    )?.address;

    if (!userOsmoAddress) {
      throw new Error("User Osmo address not found");
    }

    const msgs = await Promise.all(
      authenticatorIds.map((id) =>
        makeRemoveAuthenticatorMsg({
          id: BigInt(id),
          sender: userOsmoAddress,
        })
      )
    );

    await new Promise<DeliverTxResponse>((resolve, reject) => {
      accountStore
        .signAndBroadcast(
          accountStore.osmosisChainId,
          "addOrRemoveAuthenticators",
          msgs,
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
