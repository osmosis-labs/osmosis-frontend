import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import {
  AvailableOneClickTradingMessages,
  OneClickTradingAuthenticatorType,
  OneClickTradingPeriods,
} from "@osmosis-labs/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useStore } from "~/stores";

interface AddAuthenticatorVars {
  type: OneClickTradingAuthenticatorType;
  data: Uint8Array | number[];
}

export function getFirstAuthenticatorAuthenticator({
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
  period,
  allowedMessage,
}: {
  key: PrivKeySecp256k1;
  allowedMessage: AvailableOneClickTradingMessages;
  allowedAmount: string;
  period: OneClickTradingPeriods;
}): AddAuthenticatorVars {
  const authenticator = {
    authenticator_type: "SignatureVerificationAuthenticator",
    data: toBase64(key.getPubKey().toBytes()),
  };

  const spendLimit = {
    authenticator_type: "SpendLimitAuthenticator",
    data: toBase64(
      Buffer.from(`{"allowed": ${allowedAmount}, "period": "${period}"}`)
    ),
  };

  const allowedMessages = [allowedMessage];
  const messageFilter = {
    authenticator_type: "MessageFilterAuthenticator",
    data: toBase64(Buffer.from(`{"type":"${allowedMessages[0]}","value":{}}`)),
  };

  const compositeAuthData = [authenticator, spendLimit, messageFilter];

  return {
    type: "AllOfAuthenticator",
    data: Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data,
  };
}

export const useAddAuthenticator = ({
  queryOptions,
}: {
  queryOptions?: UseMutationOptions<
    unknown,
    unknown,
    { authenticators: AddAuthenticatorVars[] },
    unknown
  >;
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
