import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { Authenticator } from "~/server/queries/osmosis/authenticators";
import { useStore } from "~/stores";

interface AddAuthenticatorVars {
  type: Authenticator["type"];
  data: Uint8Array | number[];
}

export const useAddAuthenticator = ({
  queryOptions,
}: {
  queryOptions?: UseMutationOptions<
    unknown,
    unknown,
    AddAuthenticatorVars,
    unknown
  >;
} = {}) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  return useMutation(async (authenticator: AddAuthenticatorVars) => {
    if (!account?.osmosis) {
      throw new Error("Osmosis account not found");
    }

    return new Promise((resolve, reject) => {
      account.osmosis
        .sendAddAuthenticatorMsg(authenticator, "", (tx: any) => {
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
