import { toBase64 } from "@cosmjs/encoding";
import { WalletRepo } from "@cosmos-kit/core";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { DecUtils } from "@keplr-wallet/unit";
import {
  AvailableOneClickTradingMessages,
  OneClickTradingTimeLimit,
  OneClickTradingTransactionParams,
} from "@osmosis-labs/types";
import { unixSecondsToNanoSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useCallback } from "react";

import {
  AddAuthenticatorQueryOptions,
  getFirstAuthenticator,
  getOneClickTradingSessionAuthenticator,
  useAddAuthenticators,
} from "~/hooks/mutations/osmosis/add-authenticator";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export class CreateOneClickSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletSelectOneClickError";
  }
}

export const useCreateOneClickTradingSession = ({
  addAuthenticatorsQueryOptions,
}: {
  addAuthenticatorsQueryOptions: AddAuthenticatorQueryOptions;
}) => {
  const { accountStore } = useStore();
  const addAuthenticators = useAddAuthenticators({
    queryOptions: addAuthenticatorsQueryOptions,
  });
  const apiUtils = api.useUtils();

  const onCreate1CTSession = useCallback(
    async ({
      walletRepo,
      transaction1CTParams,
      spendLimitTokenDecimals,
    }: {
      walletRepo: WalletRepo;
      spendLimitTokenDecimals: number | undefined;
      transaction1CTParams: OneClickTradingTransactionParams | undefined;
    }) => {
      if (!transaction1CTParams)
        throw new CreateOneClickSessionError(
          "Transaction 1CT params are not defined."
        );

      if (!walletRepo.current)
        throw new CreateOneClickSessionError(
          "walletRepo.current is not defined."
        );
      if (!spendLimitTokenDecimals)
        throw new CreateOneClickSessionError(
          "Spend limit token decimals are not defined."
        );

      const { accountPubKey, shouldAddFirstAuthenticator } =
        await apiUtils.edge.oneClickTrading.getAccountPubKeyAndAuthenticators.fetch(
          { userOsmoAddress: walletRepo.current.address! }
        );

      const key = PrivKeySecp256k1.generateRandomKey();
      const allowedAmount = transaction1CTParams.spendLimit
        .toDec()
        .mul(DecUtils.getTenExponentN(spendLimitTokenDecimals))
        .truncate()
        .toString();
      const allowedMessages: AvailableOneClickTradingMessages[] = [
        "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
      ];
      const resetPeriod = transaction1CTParams.resetPeriod;

      let sessionPeriod: OneClickTradingTimeLimit;
      switch (transaction1CTParams.sessionPeriod.end) {
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
          resetPeriod,
          sessionPeriod,
        });

      addAuthenticators.mutate(
        {
          authenticators: shouldAddFirstAuthenticator
            ? [
                getFirstAuthenticator({ pubKey: accountPubKey }),
                oneClickTradingAuthenticator,
              ]
            : [oneClickTradingAuthenticator],
        },
        {
          onSuccess: () => {
            accountStore.setOneClickTradingInfo({
              allowed: allowedAmount,
              allowedMessages,
              resetPeriod,
              privateKey: toBase64(key.toBytes()),
              sessionPeriod,
              sessionStartedAtUnix: dayjs().unix(),
              networkFeeLimit: transaction1CTParams.networkFeeLimit.toCoin(),
            });

            accountStore.setShouldUseOneClickTrading({ nextValue: true });
          },
        }
      );
    },
    [
      accountStore,
      addAuthenticators,
      apiUtils.edge.oneClickTrading.getAccountPubKeyAndAuthenticators,
    ]
  );

  return { onCreate1CTSession, isLoading: addAuthenticators.isLoading };
};
