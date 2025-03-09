import type { EncodeObject } from "@cosmjs/proto-signing";
import { DEFAULT_VS_CURRENCY, superjson } from "@osmosis-labs/server";
import {
  InsufficientBalanceForFeeError,
  SwapRequiresError,
} from "@osmosis-labs/stores";
import {
  estimateGasFee,
  getRegistry,
  getSmartAccountExtensionOptions,
  QuoteStdFee,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import { isNil } from "@osmosis-labs/utils";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { useWallets } from "~/hooks/use-wallets";
import { getCachedAssetListAndChains } from "~/utils/asset-lists";
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
  queryClient,
  address,
  authenticatorId,
}: {
  chainId: string;
  messages: EncodeObject[];
  apiUtils: ReturnType<typeof api.useUtils>;
  queryClient: QueryClient;
  address: string | undefined;
  authenticatorId: string | undefined;
}): Promise<QueryResult> {
  if (!messages.length) throw new Error("No messages");
  if (!address) throw new Error("No address");

  const registry = await getRegistry();
  const encodedMessages = messages.map((m) => registry.encodeAsAny(m));

  const { chainList } = await getCachedAssetListAndChains({
    queryClient,
    environment: "mainnet",
  });

  const { amount, gas } = await estimateGasFee({
    chainId,
    chainList,
    bech32Address: address,
    body: {
      messages: encodedMessages,
      nonCriticalExtensionOptions: authenticatorId
        ? await getSmartAccountExtensionOptions({
            authenticatorId,
          })
        : undefined,
    },
    gasMultiplier: 1.5,
  });

  const fee = amount[0];
  const asset = await getCachedAssetWithPrice(apiUtils, fee.denom);

  if (!fee || !asset?.currentPrice) {
    throw new Error("Failed to estimate fees");
  }

  const coinAmountDec = new Dec(fee.amount);
  const usdValue = coinAmountDec
    .quo(DecUtils.getTenExponentN(asset.coinDecimals))
    .mul(asset.currentPrice.toDec());
  const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, usdValue);

  return {
    gasUsdValueToPay,
    gasAmount: new CoinPretty(asset, coinAmountDec),
    gasLimit: gas,
    amount,
  };
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
  const queryClient = useQueryClient();

  const queryResult = useQuery<QueryResult, Error, QueryResult, string[]>({
    queryKey: ["estimate-tx-fees", superjson.stringify(messages)],
    queryFn: () => {
      return estimateTxFeesQueryFn({
        messages: messages!,
        apiUtils,
        chainId,
        queryClient,
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

function getCachedAssetWithPrice(
  apiUtils: ReturnType<typeof api.useUtils>,
  coinMinimalDenom: string
) {
  return apiUtils.local.assets.getAssetWithPrice.ensureData(
    {
      findMinDenomOrSymbol: coinMinimalDenom,
    },
    {
      staleTime: 1000 * 10, // 10 seconds
      cacheTime: 1000 * 10, // 10 seconds
    }
  );
}
