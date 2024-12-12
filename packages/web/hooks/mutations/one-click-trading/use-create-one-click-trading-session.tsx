import { toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import {
  makeAddAuthenticatorMsg,
  makeRemoveAuthenticatorMsg,
} from "@osmosis-labs/tx";
import {
  AuthenticatorType,
  AvailableOneClickTradingMessages,
  OneClickTradingResetPeriods,
  OneClickTradingTimeLimit,
  OneClickTradingTransactionParams,
  ParsedAuthenticator,
} from "@osmosis-labs/types";
import { Dec, DecUtils } from "@osmosis-labs/unit";
import {
  isNil,
  unixNanoSecondsToSeconds,
  unixSecondsToNanoSeconds,
} from "@osmosis-labs/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import dayjs from "dayjs";

import { displayToast, ToastType } from "~/components/alert";
import { OneClickFloatingBannerDoNotShowKey } from "~/components/one-click-trading/one-click-trading-toast";
import { EventName, SPEND_LIMIT_CONTRACT_ADDRESS } from "~/config";
import { useTranslation } from "~/hooks/language";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { displayHumanizedTime, humanizeTime } from "~/utils/date";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

export class CreateOneClickSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletSelectOneClickError";
  }
}

export function isAuthenticatorOneClickTradingSession({
  authenticator,
}: {
  authenticator: ParsedAuthenticator;
}) {
  return (
    authenticator.type === "AllOf" &&
    authenticator.subAuthenticators.some(
      (sub) => sub.type === "SignatureVerification"
    ) &&
    authenticator.subAuthenticators.some(
      (sub) =>
        sub.type === "CosmwasmAuthenticatorV1" &&
        sub.contract === SPEND_LIMIT_CONTRACT_ADDRESS
    ) &&
    authenticator.subAuthenticators.some(
      (sub) =>
        sub.type === "AnyOf" &&
        sub.subAuthenticators.every((sub) => sub.type === "MessageFilter")
    )
  );
}

export function getOneClickTradingSessionAuthenticator({
  key,
  allowedAmount,
  allowedMessages,
  sessionPeriod,
}: {
  key: PrivKeySecp256k1;
  allowedMessages: AvailableOneClickTradingMessages[];
  allowedAmount: string;
  sessionPeriod: OneClickTradingTimeLimit;
}): {
  authenticatorType: AuthenticatorType;
  data: Uint8Array;
} {
  const signatureVerification = {
    type: "SignatureVerification",
    config: toBase64(key.getPubKey().toBytes()),
  };

  const spendLimitParams = toBase64(
    Buffer.from(
      JSON.stringify({
        limit: allowedAmount,
        reset_period: "day" as OneClickTradingResetPeriods,
        time_limit: sessionPeriod,
      })
    )
  );
  const spendLimit = {
    type: "CosmwasmAuthenticatorV1",
    config: toBase64(
      Buffer.from(
        `{"contract": "${SPEND_LIMIT_CONTRACT_ADDRESS}", "params": "${spendLimitParams}"}`
      )
    ),
  };

  const messageFilters = allowedMessages.map((message) => ({
    type: "MessageFilter",
    config: toBase64(Buffer.from(`{"@type":"${message}"}`)),
  }));

  const messageFilterAnyOf = {
    type: "AnyOf",
    config: toBase64(Buffer.from(JSON.stringify(messageFilters))),
  };

  const compositeAuthData = [
    signatureVerification,
    spendLimit,
    messageFilterAnyOf,
  ];

  // We return the message structure we want to broadcase here,
  // not the structure of the authenticator returned from the chain.
  return {
    authenticatorType: "AllOf",
    data: new Uint8Array(
      Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data
    ),
  };
}

export async function getAuthenticatorIdFromTx({
  events,
  userOsmoAddress,
  fallbackGetAuthenticatorId,
  publicKey,
}: {
  events: DeliverTxResponse["events"];
  userOsmoAddress: string;
  publicKey: string;
  fallbackGetAuthenticatorId: (
    input: RouterInputs["local"]["oneClickTrading"]["getSessionAuthenticator"]
  ) => Promise<
    RouterOutputs["local"]["oneClickTrading"]["getSessionAuthenticator"]
  >;
}) {
  let authenticatorId: string | undefined = events
    ?.find(
      ({ type, attributes }) =>
        type === "message" &&
        attributes.some(({ key, value }) => key === "authenticator_id" && value)
    )
    ?.attributes?.find(({ key }) => key === "authenticator_id")?.value;

  if (!authenticatorId) {
    try {
      const authenticator = await fallbackGetAuthenticatorId({
        userOsmoAddress,
        publicKey,
      });
      if (!authenticator || isNil(authenticator?.id)) {
        throw new Error("Authenticator id is not found");
      }
      authenticatorId = authenticator.id;
    } catch (error) {
      throw new CreateOneClickSessionError(
        "Failed to fetch account public key and authenticators."
      );
    }
  }

  if (!authenticatorId) {
    throw new CreateOneClickSessionError("Authenticator id is not found");
  }

  return authenticatorId;
}

export async function onAdd1CTSession({
  privateKey,
  tx,
  userOsmoAddress,
  fallbackGetAuthenticatorId,
  accountStore,
  allowedMessages,
  sessionPeriod,
  spendLimitTokenDecimals,
  transaction1CTParams,
  allowedAmount,
  t,
  logEvent,
}: {
  privateKey: PrivKeySecp256k1;
  tx: DeliverTxResponse;
  userOsmoAddress: string;
  fallbackGetAuthenticatorId: Parameters<
    typeof getAuthenticatorIdFromTx
  >[0]["fallbackGetAuthenticatorId"];
  accountStore: ReturnType<typeof useStore>["accountStore"];
  allowedMessages: AvailableOneClickTradingMessages[];
  sessionPeriod: OneClickTradingTimeLimit;
  spendLimitTokenDecimals: number;
  transaction1CTParams: OneClickTradingTransactionParams;
  allowedAmount: string;
  t: ReturnType<typeof useTranslation>["t"];
  logEvent: ReturnType<typeof useAmplitudeAnalytics>["logEvent"];
}) {
  const publicKey = toBase64(privateKey.getPubKey().toBytes());

  const authenticatorId = await getAuthenticatorIdFromTx({
    events: tx.events,
    userOsmoAddress,
    fallbackGetAuthenticatorId,
    publicKey,
  });

  accountStore.setOneClickTradingInfo({
    authenticatorId,
    publicKey,
    sessionKey: toBase64(privateKey.toBytes()),
    allowedMessages,
    sessionPeriod,
    sessionStartedAtUnix: dayjs().unix(),
    networkFeeLimit: transaction1CTParams.networkFeeLimit,
    spendLimit: {
      amount: allowedAmount,
      decimals: spendLimitTokenDecimals,
    },
    hasSeenExpiryToast: false,
    humanizedSessionPeriod: transaction1CTParams.sessionPeriod.end,
    userOsmoAddress,
  });

  localStorage.setItem(OneClickFloatingBannerDoNotShowKey, "true");
  accountStore.setShouldUseOneClickTrading({ nextValue: true });

  const sessionEndDate = dayjs.unix(
    unixNanoSecondsToSeconds(sessionPeriod.end)
  );
  const humanizedTime = humanizeTime(sessionEndDate);
  displayToast(
    {
      titleTranslationKey: "oneClickTrading.toast.oneClickTradingActive",
      captionElement: (
        <p className="text-sm text-osmoverse-300 md:text-xs">
          {displayHumanizedTime({ humanizedTime, t })} {t("remaining")}
        </p>
      ),
    },
    ToastType.ONE_CLICK_TRADING
  );
  logEvent([
    EventName.OneClickTrading.startSession,
    {
      spendLimit: Number(transaction1CTParams.spendLimit.toDec().toString()),
      sessionPeriod: transaction1CTParams.sessionPeriod.end,
    },
  ]);
}

export async function makeCreate1CTSessionMessage({
  transaction1CTParams,
  spendLimitTokenDecimals,
  additionalAuthenticatorsToRemove,
  userOsmoAddress,
  apiUtils,
}: {
  transaction1CTParams: OneClickTradingTransactionParams;
  spendLimitTokenDecimals: number;
  additionalAuthenticatorsToRemove?: bigint[];
  userOsmoAddress: string;
  apiUtils: ReturnType<typeof api.useUtils>;
}) {
  let authenticators: ParsedAuthenticator[];
  try {
    ({ authenticators } =
      await apiUtils.local.oneClickTrading.getAuthenticators.fetch({
        userOsmoAddress,
      }));
  } catch (error) {
    throw new CreateOneClickSessionError(
      "Failed to fetch account public key and authenticators."
    );
  }

  const key = PrivKeySecp256k1.generateRandomKey();
  const allowedAmount = transaction1CTParams.spendLimit
    .toDec()
    .mul(DecUtils.getTenExponentN(spendLimitTokenDecimals))
    .truncate()
    .toString();
  const allowedMessages: AvailableOneClickTradingMessages[] = [
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
    "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
    "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference",
  ];

  let sessionPeriod: OneClickTradingTimeLimit;
  switch (transaction1CTParams.sessionPeriod.end) {
    case "1hour":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(1, "hour").unix()),
      };
      break;
    case "1day":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(1, "day").unix()),
      };
      break;
    case "7days":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(7, "day").unix()),
      };
      break;
    case "30days":
      sessionPeriod = {
        end: unixSecondsToNanoSeconds(dayjs().add(30, "day").unix()),
      };
      break;

    default:
      throw new Error(
        `Unsupported time limit: ${transaction1CTParams.sessionPeriod.end}`
      );
  }

  const oneClickTradingAuthenticator = getOneClickTradingSessionAuthenticator({
    key,
    allowedAmount,
    allowedMessages,
    sessionPeriod,
  });

  const authenticatorToRemoveId =
    authenticators.length === 15
      ? authenticators
          .filter((authenticator) =>
            isAuthenticatorOneClickTradingSession({ authenticator })
          )
          .reduce((min, authenticator) => {
            if (isNil(min)) return authenticator.id;
            return new Dec(authenticator.id).lt(new Dec(min))
              ? authenticator.id
              : min;
          }, null as string | null)
      : undefined;

  const authenticatorsToRemove = authenticatorToRemoveId
    ? [BigInt(authenticatorToRemoveId)]
    : [];

  if (additionalAuthenticatorsToRemove) {
    authenticatorsToRemove.push(...additionalAuthenticatorsToRemove);
  }

  const addAuthenticatorMsg = makeAddAuthenticatorMsg({
    authenticatorType: oneClickTradingAuthenticator.authenticatorType,
    data: oneClickTradingAuthenticator.data,
    sender: userOsmoAddress,
  });

  const removeAuthenticatorMsgs = authenticatorsToRemove.map((id) =>
    makeRemoveAuthenticatorMsg({
      id,
      sender: userOsmoAddress,
    })
  );

  return {
    msgs: await Promise.all([...removeAuthenticatorMsgs, addAuthenticatorMsg]),
    allowedMessages,
    allowedAmount,
    sessionPeriod,
    key,
    transaction1CTParams,
    spendLimitTokenDecimals,
  };
}

export const useCreateOneClickTradingSession = ({
  onBroadcasted,
  queryOptions,
}: {
  onBroadcasted?: () => void;
  queryOptions?: UseMutationOptions<
    unknown,
    unknown,
    {
      spendLimitTokenDecimals: number | undefined;
      transaction1CTParams: OneClickTradingTransactionParams | undefined;
      additionalAuthenticatorsToRemove?: bigint[];
    },
    unknown
  >;
} = {}) => {
  const { accountStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();

  const apiUtils = api.useUtils();
  const { t } = useTranslation();

  return useMutation(
    async ({
      transaction1CTParams,
      spendLimitTokenDecimals,
      additionalAuthenticatorsToRemove,
    }) => {
      const userOsmoAddress = accountStore.getWallet(
        accountStore.osmosisChainId
      )?.address;

      if (!userOsmoAddress) {
        throw new CreateOneClickSessionError("Osmosis account not found");
      }

      if (!transaction1CTParams) {
        throw new CreateOneClickSessionError(
          "Transaction 1CT params are not defined."
        );
      }

      if (!spendLimitTokenDecimals) {
        throw new CreateOneClickSessionError(
          "Spend limit token decimals are not defined."
        );
      }

      const { msgs, allowedMessages, allowedAmount, sessionPeriod, key } =
        await makeCreate1CTSessionMessage({
          transaction1CTParams,
          spendLimitTokenDecimals,
          additionalAuthenticatorsToRemove,
          userOsmoAddress,
          apiUtils,
        });

      const tx = await new Promise<DeliverTxResponse>((resolve, reject) => {
        accountStore
          .signAndBroadcast(
            accountStore.osmosisChainId,
            "addOrRemoveAuthenticators",
            msgs,
            "",
            undefined,
            undefined,
            {
              onBroadcasted,
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

      onAdd1CTSession({
        privateKey: key,
        tx,
        userOsmoAddress,
        fallbackGetAuthenticatorId:
          apiUtils.local.oneClickTrading.getSessionAuthenticator.fetch,
        accountStore,
        allowedMessages,
        sessionPeriod,
        spendLimitTokenDecimals,
        transaction1CTParams,
        allowedAmount,
        t,
        logEvent,
      });
    },
    queryOptions
  );
};
