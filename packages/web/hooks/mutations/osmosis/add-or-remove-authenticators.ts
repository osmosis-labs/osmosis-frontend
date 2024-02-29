import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import {
  AuthenticatorType,
  AvailableOneClickTradingMessages,
  OneClickTradingResetPeriods,
  OneClickTradingTimeLimit,
} from "@osmosis-labs/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { SPENT_LIMIT_CONTRACT_ADDRESS } from "~/config/env";
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

export function getFirstAuthenticator({
  pubKey,
}: {
  pubKey: string;
}): AddAuthenticatorVars {
  return {
    type: "SignatureVerificationAuthenticator",
    data: fromBase64(pubKey),
  };
}

export function getOneClickTradingSessionAuthenticator({
  key,
  allowedAmount,
  resetPeriod,
  allowedMessages,
  sessionPeriod,
}: {
  key: PrivKeySecp256k1;
  allowedMessages: AvailableOneClickTradingMessages[];
  allowedAmount: string;
  resetPeriod: OneClickTradingResetPeriods;
  sessionPeriod: OneClickTradingTimeLimit;
}): AddAuthenticatorVars {
  const signatureVerification = {
    authenticator_type: "SignatureVerificationAuthenticator",
    data: toBase64(key.getPubKey().toBytes()),
  };

  const spendLimitParams = toBase64(
    Buffer.from(
      JSON.stringify({
        limit: allowedAmount,
        reset_period: resetPeriod,
        time_limit: sessionPeriod,
      })
    )
  );
  const spendLimit = {
    authenticator_type: "CosmwasmAuthenticatorV1",
    data: toBase64(
      Buffer.from(
        `{"contract": "${SPENT_LIMIT_CONTRACT_ADDRESS}", "params": "${spendLimitParams}"}`
      )
    ),
  };

  const messageFilters = allowedMessages.map((message) => ({
    authenticator_type: "MessageFilterAuthenticator",
    data: toBase64(Buffer.from(`{"@type":"${message}"}`)),
  }));

  const compositeAuthData = [
    signatureVerification,
    spendLimit,
    ...messageFilters,
  ];

  return {
    type: "AllOfAuthenticator",
    data: new Uint8Array(
      Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data
    ),
  };
}

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
