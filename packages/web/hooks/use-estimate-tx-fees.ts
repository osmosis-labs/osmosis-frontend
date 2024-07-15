import { EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, superjson } from "@osmosis-labs/server";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  InsufficientBalanceForFeeError,
  OsmosisAccount,
  SignOptions,
} from "@osmosis-labs/stores";
import { QuoteStdFee } from "@osmosis-labs/tx";
import { isNil } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { useMemo } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface QueryResult {
  gasUsdValueToPay: PricePretty;
  gasAmount: CoinPretty;
  gasLimit: string;
  amount: QuoteStdFee["amount"];
}

async function estimateTxFeesQueryFn({
  wallet,
  messages,
  apiUtils,
  accountStore,
  signOptions,
  sendToken,
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  messages: EncodeObject[];
  apiUtils: ReturnType<typeof api.useUtils>;
  sendToken?: {
    balance: CoinPretty;
    amount: CoinPretty;
  };
  signOptions?: SignOptions;
}): Promise<QueryResult> {
  if (!messages.length) throw new Error("No messages");

  const baseEstimateFeeOptions: Parameters<typeof accountStore.estimateFee>[0] =
    {
      wallet,
      messages,
      signOptions: {
        ...wallet.walletInfo?.signOptions,
        ...signOptions,
        preferNoSetFee: true, // this will automatically calculate the amount as well.
      },
    };

  const { amount, gas } = await accountStore.estimateFee(
    baseEstimateFeeOptions
  );

  let fee = amount[0];
  let gasLimit = gas;
  let feeAmount = amount;
  const asset = await getCachedAssetWithPrice(apiUtils, fee.denom);

  /**
   * If the send token is provided and send token does not have enough balance to pay for the fee, it will
   * try to prevent the fee token to be the same as the send token.
   *
   * This is useful to not leave dust amounts while doing a max amount swap.
   */
  if (
    sendToken &&
    fee.denom === sendToken.balance.toCoin().denom &&
    new Dec(sendToken.amount.toCoin().amount).gt(
      new Dec(sendToken.balance.toCoin().amount).sub(new Dec(fee.amount))
    )
  ) {
    try {
      const { amount, gas } = await accountStore.estimateFee({
        ...baseEstimateFeeOptions,
        excludedFeeMinimalDenoms: [sendToken.balance.currency.coinMinimalDenom],
      });
      fee = amount[0];
      gasLimit = gas;
      feeAmount = amount;
    } catch (error) {
      console.warn(
        "Failed to estimate fees with excluded fee minimal denom. Using the original fee.",
        error
      );
    }
  }

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
    gasLimit,
    amount: feeAmount,
  };
}

export function useEstimateTxFees({
  messages,
  chainId,
  signOptions,
  sendToken,
  enabled = true,
}: {
  messages: EncodeObject[] | undefined;
  chainId: string;
  /**
   * If the send token is provided and does not have enough balance to pay for the fee, it will
   * try to prevent the fee token to be the same as the send token.
   */
  sendToken?: {
    balance: CoinPretty;
    amount: CoinPretty;
  };
  enabled?: boolean;
  signOptions?: SignOptions;
}) {
  const { accountStore } = useStore();
  const apiUtils = api.useUtils();

  const wallet = accountStore.getWallet(chainId);

  const queryResult = useQuery<QueryResult, Error, QueryResult, string[]>({
    queryKey: ["estimate-tx-fees", superjson.stringify(messages)],
    queryFn: () => {
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);
      return estimateTxFeesQueryFn({
        wallet,
        accountStore,
        messages: messages!,
        apiUtils,
        signOptions,
        sendToken,
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
      wallet?.address !== undefined &&
      typeof wallet?.address === "string",
  });

  const specificError = useMemo(() => {
    if (
      queryResult.error instanceof Error &&
      (queryResult.error.message.includes(
        "No fee tokens found with sufficient balance on account"
      ) ||
        queryResult.error.message.includes(
          "Insufficient alternative balance for transaction fees"
        ))
    ) {
      return new InsufficientBalanceForFeeError(queryResult.error.message);
    }
    return queryResult.error;
  }, [queryResult.error]);

  return { ...queryResult, error: specificError };
}

const getAssetCache = new LRUCache<string, CacheEntry>({ max: 50 });
function getCachedAssetWithPrice(
  apiUtils: ReturnType<typeof api.useUtils>,
  coinMinimalDenom: string
) {
  return cachified({
    cache: getAssetCache,
    key: coinMinimalDenom,
    ttl: 1000 * 10, // 10 seconds
    getFreshValue: () =>
      apiUtils.edge.assets.getAssetWithPrice.fetch({
        findMinDenomOrSymbol: coinMinimalDenom,
      }),
  });
}
