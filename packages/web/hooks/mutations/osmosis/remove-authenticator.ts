import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useStore } from "~/stores";

interface RemoveAuthenticatorVars {
  id: string;
}

export const useRemoveAuthenticator = ({
  queryOptions,
}: {
  queryOptions?: UseMutationOptions<
    unknown,
    unknown,
    RemoveAuthenticatorVars,
    unknown
  >;
} = {}) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  return useMutation(async ({ id }: RemoveAuthenticatorVars) => {
    if (!account?.osmosis) {
      throw new Error("Osmosis account not found");
    }

    return new Promise((resolve, reject) => {
      account.osmosis
        .sendRemoveAuthenticatorMsg(id, "", (tx: any) => {
          if (tx.code === 0) {
            resolve(tx);
          } else {
            reject(new Error("Transaction failed"));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }, queryOptions);
};
