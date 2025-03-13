import type { EncodeObject } from "@cosmjs/proto-signing";
import { superjson } from "@osmosis-labs/server";
import {
  InsufficientBalanceForFeeError,
  SwapRequiresError,
} from "@osmosis-labs/stores";
import {
  encodeAnyBase64,
  getRegistry,
  getSmartAccountExtensionOptions,
  QuoteStdFee,
} from "@osmosis-labs/tx";
import { CoinPretty, PricePretty } from "@osmosis-labs/unit";
import { isNil } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useWallets } from "~/hooks/use-wallets";
import { api } from "~/utils/trpc";

interface QueryResult {
  gasUsdValueToPay: PricePretty;
  gasAmount: CoinPretty;
  gasLimit: string;
  amount: QuoteStdFee["amount"];
}

async function estimateTxFeesQueryFn({
  messages,
  apiUtils,
  chainId,
  address,
  authenticatorId,
}: {
  chainId: string;
  messages: EncodeObject[];
  apiUtils: ReturnType<typeof api.useUtils>;
  address: string | undefined;
  authenticatorId: string | undefined;
}): Promise<QueryResult> {
  if (!messages.length) throw new Error("No messages");
  if (!address) throw new Error("No address");

  const registry = await getRegistry();
  const encodedMessages = messages.map((m) => registry.encodeAsAny(m));

  return apiUtils.local.gas.estimateTxFees.ensureData({
    chainId,
    bech32Address: address,
    messages: encodedMessages.map((m) => encodeAnyBase64(m)),
    nonCriticalExtensionOptions: authenticatorId
      ? (
          await getSmartAccountExtensionOptions({
            authenticatorId,
          })
        ).map((m) => encodeAnyBase64(m))
      : undefined,
    gasMultiplier: 1.5,
  });
}

export function useEstimateTxFees({
  messages,
  chainId,
  enabled = true,
}: {
  messages: EncodeObject[] | undefined;
  chainId: string;
  enabled?: boolean;
}) {
  const apiUtils = api.useUtils();
  const { currentWallet } = useWallets();

  const queryResult = useQuery<QueryResult, Error, QueryResult, string[]>({
    queryKey: ["estimate-tx-fees", superjson.stringify(messages)],
    queryFn: () => {
      return estimateTxFeesQueryFn({
        messages: messages!,
        apiUtils,
        chainId,
        address: currentWallet?.address,
        authenticatorId:
          currentWallet?.type === "smart-account"
            ? currentWallet?.authenticatorId
            : undefined,
      });
    },
    staleTime: 3_000, // 3 seconds
    cacheTime: 3_000, // 3 seconds
    retry: false,
    enabled:
      enabled &&
      !isNil(messages) &&
      Array.isArray(messages) &&
      messages.length > 0 &&
      currentWallet?.type === "smart-account" &&
      currentWallet?.authenticatorId !== undefined &&
      currentWallet?.address !== undefined &&
      typeof currentWallet?.address === "string",
  });

  const specificError = useMemo(() => {
    if (
      queryResult.error instanceof Error &&
      (queryResult.error.message.includes(
        "No fee tokens found with sufficient balance on account"
      ) ||
        queryResult.error.message.includes(
          "Insufficient alternative balance for transaction fees"
        ) ||
        queryResult.error.message.includes("insufficient funds"))
    ) {
      return new InsufficientBalanceForFeeError(queryResult.error.message);
    }

    if (
      queryResult.error instanceof Error &&
      (queryResult.error.message.includes("Swap requires") ||
        queryResult.error.message.includes("is greater than max amount"))
    ) {
      return new SwapRequiresError(queryResult.error.message);
    }

    return queryResult.error;
  }, [queryResult.error]);

  return { ...queryResult, error: specificError };
}
