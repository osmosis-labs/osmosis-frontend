import { DeliverTxResponse } from "@osmosis-labs/stores";
import { AuthenticatorType } from "@osmosis-labs/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useStore } from "~/stores";

interface AddAuthenticatorVars {
  type: AuthenticatorType;
  data: Uint8Array;
}

export type AddAuthenticatorQueryOptions = UseMutationOptions<
  unknown,
  unknown,
  { addAuthenticators: AddAuthenticatorVars[] },
  unknown
>;

export const useAddOrRemoveAuthenticators = ({
  queryOptions,
}: {
  queryOptions?: AddAuthenticatorQueryOptions;
} = {}) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  return useMutation(
    async ({
      addAuthenticators,
      removeAuthenticators,
    }: {
      addAuthenticators: AddAuthenticatorVars[];
      removeAuthenticators: bigint[];
    }) => {
      if (!account?.osmosis) {
        throw new Error("Osmosis account not found");
      }

      return new Promise<DeliverTxResponse>((resolve, reject) => {
        account.osmosis
          .sendAddOrRemoveAuthenticatorsMsg({
            addAuthenticators,
            removeAuthenticators,
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
    },
    queryOptions
  );
};
