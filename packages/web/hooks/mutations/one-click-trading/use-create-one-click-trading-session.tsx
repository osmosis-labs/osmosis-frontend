import { toBase64 } from "@cosmjs/encoding";
import { WalletRepo } from "@cosmos-kit/core";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import {
  AuthenticatorType,
  AvailableOneClickTradingMessages,
  OneClickTradingResetPeriods,
  OneClickTradingTimeLimit,
  OneClickTradingTransactionParams,
  ParsedAuthenticator,
} from "@osmosis-labs/types";
import {
  isNil,
  unixNanoSecondsToSeconds,
  unixSecondsToNanoSeconds,
} from "@osmosis-labs/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalStorage } from "react-use";

import { displayToast, ToastType } from "~/components/alert";
import { OneClickFloatingBannerDoNotShowKey } from "~/components/one-click-trading/one-click-toast";
import { EventName, SPEND_LIMIT_CONTRACT_ADDRESS } from "~/config";
import { useTranslation } from "~/hooks/language";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { humanizeTime } from "~/utils/date";
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
  type: AuthenticatorType;
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

  return {
    type: "AllOf",
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

export const useCreateOneClickTradingSession = ({
  onBroadcasted,
  queryOptions,
}: {
  onBroadcasted?: () => void;
  queryOptions?: UseMutationOptions<
    unknown,
    unknown,
    {
      walletRepo: WalletRepo;
      spendLimitTokenDecimals: number | undefined;
      transaction1CTParams: OneClickTradingTransactionParams | undefined;
      additionalAuthenticatorsToRemove?: bigint[];
    },
    unknown
  >;
} = {}) => {
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { logEvent } = useAmplitudeAnalytics();

  const apiUtils = api.useUtils();
  const [, setDoNotShowFloatingBannerAgain] = useLocalStorage(
    OneClickFloatingBannerDoNotShowKey,
    false
  );
  const { t } = useTranslation();

  return useMutation(
    async ({
      walletRepo,
      transaction1CTParams,
      spendLimitTokenDecimals,
      additionalAuthenticatorsToRemove,
    }) => {
      if (!account?.osmosis) {
        throw new CreateOneClickSessionError("Osmosis account not found");
      }

      if (!transaction1CTParams) {
        throw new CreateOneClickSessionError(
          "Transaction 1CT params are not defined."
        );
      }

      if (!walletRepo.current) {
        throw new CreateOneClickSessionError(
          "walletRepo.current is not defined."
        );
      }

      if (!spendLimitTokenDecimals) {
        throw new CreateOneClickSessionError(
          "Spend limit token decimals are not defined."
        );
      }

      let authenticators: ParsedAuthenticator[];
      try {
        ({ authenticators } =
          await apiUtils.local.oneClickTrading.getAuthenticators.fetch({
            userOsmoAddress: walletRepo.current.address!,
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
      ];

      let sessionPeriod: OneClickTradingTimeLimit;
      switch (transaction1CTParams.sessionPeriod.end) {
        case "5min":
          sessionPeriod = {
            end: unixSecondsToNanoSeconds(dayjs().add(5, "minute").unix()),
          };
          break;
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
          throw new Error(
            `Unsupported time limit: ${transaction1CTParams.sessionPeriod.end}`
          );
      }

      const oneClickTradingAuthenticator =
        getOneClickTradingSessionAuthenticator({
          key,
          allowedAmount,
          allowedMessages,
          sessionPeriod,
        });

      /**
       * If the user has 15 authenticators, remove the oldest AllOf
       * which is the previous OneClickTrading session
       */
      const authenticatorToRemoveId =
        authenticators.length === 15
          ? authenticators
              .filter((authenticator) =>
                isAuthenticatorOneClickTradingSession({ authenticator })
              )
              /**
               * Find the oldest 1-Click Trading Session by comparing the id.
               * The smallest id is the oldest authenticator.
               */
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

      const tx = await new Promise<DeliverTxResponse>((resolve, reject) => {
        account.osmosis
          .sendAddOrRemoveAuthenticatorsMsg({
            addAuthenticators: [oneClickTradingAuthenticator],
            removeAuthenticators: authenticatorsToRemove,
            memo: "",

            onBroadcasted,
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

      const publicKey = toBase64(key.getPubKey().toBytes());

      const authenticatorId = await getAuthenticatorIdFromTx({
        events: tx.events,
        userOsmoAddress: walletRepo.current.address!,
        fallbackGetAuthenticatorId:
          apiUtils.local.oneClickTrading.getSessionAuthenticator.fetch,
        publicKey,
      });

      accountStore.setOneClickTradingInfo({
        authenticatorId,
        publicKey,
        sessionKey: toBase64(key.toBytes()),
        allowedMessages,
        sessionPeriod,
        sessionStartedAtUnix: dayjs().unix(),
        networkFeeLimit: {
          ...transaction1CTParams.networkFeeLimit.currency,
          amount: transaction1CTParams.networkFeeLimit.toCoin().amount,
        },
        spendLimit: {
          amount: allowedAmount,
          decimals: spendLimitTokenDecimals,
        },
        hasSeenExpiryToast: false,
        humanizedSessionPeriod: transaction1CTParams.sessionPeriod.end,
        userOsmoAddress: walletRepo.current!.address!,
      });

      setDoNotShowFloatingBannerAgain(true);
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
              {humanizedTime.value} {t(humanizedTime.unitTranslationKey)}{" "}
              {t("remaining")}
            </p>
          ),
        },
        ToastType.ONE_CLICK_TRADING
      );
    },
    {
      ...queryOptions,
      onSuccess: (...params) => {
        const [, { transaction1CTParams }] = params;
        queryOptions?.onSuccess?.(...params);
        logEvent([
          EventName.OneClickTrading.startSession,
          {
            spendLimit: Number(
              transaction1CTParams?.spendLimit.toDec().toString()
            ),
            sessionPeriod: transaction1CTParams?.sessionPeriod.end,
          },
        ]);
      },
    }
  );
};
