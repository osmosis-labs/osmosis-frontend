import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import {
  AvailableOneClickTradingMessages,
  OneClickTradingAuthenticatorType,
  OneClickTradingResetPeriods,
  OneClickTradingTimeLimit,
} from "@osmosis-labs/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { SPENT_LIMIT_CONTRACT_ADDRESS } from "~/config/env";
import { useStore } from "~/stores";

interface AddAuthenticatorVars {
  type: OneClickTradingAuthenticatorType;
  data: Uint8Array | number[];
}

export type AddAuthenticatorQueryOptions = UseMutationOptions<
  unknown,
  unknown,
  { authenticators: AddAuthenticatorVars[] },
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
  // pub struct Timestamp(Uint64); end
  const messageFilter = {
    authenticator_type: "MessageFilterAuthenticator",
    data: toBase64(Buffer.from(`{"@type":"${allowedMessages[0]}"}`)),
  };

  const compositeAuthData = [signatureVerification, spendLimit, messageFilter];

  return {
    type: "AllOfAuthenticator",
    data: Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data,
  };
}

export const useAddAuthenticators = ({
  queryOptions,
}: {
  queryOptions?: AddAuthenticatorQueryOptions;
} = {}) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  return useMutation(
    async ({ authenticators }: { authenticators: AddAuthenticatorVars[] }) => {
      if (!account?.osmosis) {
        throw new Error("Osmosis account not found");
      }

      return new Promise((resolve, reject) => {
        account.osmosis
          .sendAddAuthenticatorMsg(authenticators, "", (tx: any) => {
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
    },
    queryOptions
  );
};
