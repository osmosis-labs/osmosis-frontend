import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import {
  AvailableOneClickTradingMessages,
  OneClickTradingAuthenticatorType,
  OneClickTradingHumanizedSessionPeriod,
  OneClickTradingResetPeriods,
} from "@osmosis-labs/types";
import { unixSecondsToNanoSeconds } from "@osmosis-labs/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import dayjs from "dayjs";

import { SPENT_LIMIT_CONTRACT_ADDRESS } from "~/config/env";
import { useStore } from "~/stores";

interface AddAuthenticatorVars {
  type: OneClickTradingAuthenticatorType;
  data: Uint8Array | number[];
}

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
  sessionPeriod: rawSessionPeriod,
}: {
  key: PrivKeySecp256k1;
  allowedMessages: AvailableOneClickTradingMessages[];
  allowedAmount: string;
  resetPeriod: OneClickTradingResetPeriods;
  sessionPeriod: OneClickTradingHumanizedSessionPeriod;
}): AddAuthenticatorVars {
  const signatureVerification = {
    authenticator_type: "SignatureVerificationAuthenticator",
    data: toBase64(key.getPubKey().toBytes()),
  };

  let sessionPeriod: { end: string };
  switch (rawSessionPeriod) {
    case "10min":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(10, "minute").unix()),
      };
      break;
    case "30min":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(30, "minute").unix()),
      };
      break;
    case "1hour":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(1, "hour").unix()),
      };
      break;
    case "3hours":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(3, "hours").unix()),
      };
      break;
    case "12hours":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(12, "hours").unix()),
      };
      break;
    default:
      throw new Error(`Unsupported time limit: ${rawSessionPeriod}`);
  }

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
