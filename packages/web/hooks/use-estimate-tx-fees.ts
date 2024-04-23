import { Coin, EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, superjson } from "@osmosis-labs/server";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  InsufficientFeeError,
  OsmosisAccount,
} from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface QueryResult {
  gasUsdValueToPay: PricePretty;
  gasAmount: CoinPretty;
  gasLimit: string;
  amount: readonly Coin[];
}

async function estimateTxFeesQueryFn({
  wallet,
  messages,
  apiUtils,
  accountStore,
  tryToExcludeMinimalDenoms = [],
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  messages: EncodeObject[] | undefined;
  apiUtils: ReturnType<typeof api.useUtils>;
  tryToExcludeMinimalDenoms?: string[];
}): Promise<QueryResult> {
  if (!messages) throw new Error("No messages");

  let coin: Coin;
  let amount: readonly Coin[];
  let gasLimit: string;

  const baseEstimateFeeOptions: Parameters<typeof accountStore.estimateFee>[0] =
    {
      wallet,
      messages: messages!,
      signOptions: {
        ...wallet.walletInfo?.signOptions,
        preferNoSetFee: true, // this will automatically calculate the amount as well.
      },
    };

  /**
   * Try to exclude minimal denoms to pay for the transaction fee. This is useful
   * for the case where we are computing the max fee and we don't want to pay with the
   * same token that we are trying to send.
   */
  if (tryToExcludeMinimalDenoms.length > 0) {
    try {
      const { amount: amount_, gas } = await accountStore.estimateFee({
        ...baseEstimateFeeOptions,
        excludedFeeMinimalDenoms: tryToExcludeMinimalDenoms,
      });
      coin = amount_[0];
      gasLimit = gas;
      amount = amount_;
    } catch (e) {
      const error = e as Error | InsufficientFeeError;
      /**
       * If there are no alternative tokens, just return the default estimation.
       */
      if (error instanceof InsufficientFeeError) {
        const { amount: amount_, gas } = await accountStore.estimateFee(
          baseEstimateFeeOptions
        );

        coin = amount_[0];
        gasLimit = gas;
        amount = amount_;
      } else {
        throw error;
      }
    }
  } else {
    const { amount: amount_, gas } = await accountStore.estimateFee(
      baseEstimateFeeOptions
    );
    coin = amount_[0];
    gasLimit = gas;
    amount = amount_;
  }

  const asset = await apiUtils.edge.assets.getAssetWithPrice.fetch({
    coinMinimalDenom: coin.denom,
  });

  if (!coin || !asset?.currentPrice) {
    throw new Error("Failed to estimate fees");
  }

  const coinAmountDec = new Dec(coin.amount);
  const usdValue = coinAmountDec
    .quo(DecUtils.getTenExponentN(asset.coinDecimals))
    .mul(asset.currentPrice.toDec());
  const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, usdValue);

  return {
    gasUsdValueToPay,
    gasAmount: new CoinPretty(asset, coinAmountDec),
    gasLimit,
    amount,
  };
}

export function useEstimateTxFees({
  messages,
  chainId,
  tryToExcludeMinimalDenoms = [],
  enabled = true,
}: {
  messages: EncodeObject[] | undefined;
  chainId: string;
  /**
   * Try to exclude minimal denoms to pay for the transaction fee. This is useful
   * for the case where we are computing the max fee and we don't want to pay with the
   * same token that we are trying to send.
   */
  tryToExcludeMinimalDenoms?: string[];
  enabled?: boolean;
  onSuccess?: (data: QueryResult) => void;
}) {
  const { accountStore } = useStore();
  const apiUtils = api.useUtils();

  const wallet = accountStore.getWallet(chainId);

  const queryResult = useQuery<QueryResult, Error, QueryResult, string[]>({
    queryKey: ["simulate-swap-tx", superjson.stringify(messages)],
    queryFn: () => {
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);
      return estimateTxFeesQueryFn({
        wallet,
        accountStore,
        messages,
        apiUtils,
        tryToExcludeMinimalDenoms,
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

  return queryResult;
}

export function useEstimateTxFeesMutation() {
  const { accountStore } = useStore();
  const apiUtils = api.useUtils();

  return useMutation({
    mutationFn: async ({
      messages,
      chainId,
    }: {
      messages: EncodeObject[];
      chainId: string;
    }) => {
      const wallet = accountStore.getWallet(chainId);
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);

      return estimateTxFeesQueryFn({
        wallet,
        accountStore,
        messages,
        apiUtils,
      });
    },
  });
}
