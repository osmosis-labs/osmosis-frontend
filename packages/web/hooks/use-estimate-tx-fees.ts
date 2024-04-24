import { Coin, EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, superjson } from "@osmosis-labs/server";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
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
  sendToken,
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  messages: EncodeObject[] | undefined;
  apiUtils: ReturnType<typeof api.useUtils>;
  sendToken?: {
    balance: CoinPretty;
    amount: CoinPretty;
  };
}): Promise<QueryResult> {
  if (!messages) throw new Error("No messages");

  let feeCoin: Coin;
  let feeAmount: readonly Coin[];
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

  const { amount, gas } = await accountStore.estimateFee(
    baseEstimateFeeOptions
  );

  feeCoin = amount[0];
  gasLimit = gas;
  feeAmount = amount;

  /**
   * If the send token is provided and send token does not have enough balance to pay for the fee, it will
   * try to prevent the fee token to be the same as the send token.
   */
  if (
    sendToken &&
    feeCoin.denom === sendToken.balance.toCoin().denom &&
    new Dec(sendToken.amount.toCoin().amount).gt(
      new Dec(sendToken.balance.toCoin().amount).sub(new Dec(feeCoin.amount))
    )
  ) {
    const { amount, gas } = await accountStore.estimateFee({
      ...baseEstimateFeeOptions,
      excludedFeeMinimalDenoms: [sendToken.balance.currency.coinMinimalDenom],
    });
    feeCoin = amount[0];
    gasLimit = gas;
    feeAmount = amount;
  }

  const asset = await apiUtils.edge.assets.getAssetWithPrice.fetch({
    coinMinimalDenom: feeCoin.denom,
  });

  if (!feeCoin || !asset?.currentPrice) {
    throw new Error("Failed to estimate fees");
  }

  const coinAmountDec = new Dec(feeCoin.amount);
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
  sendToken,
  enabled = true,
}: {
  messages: EncodeObject[] | undefined;
  chainId: string;
  /**
   * If the send token is provided and send token does not have enough balance to pay for the fee, it will
   * try to prevent the fee token to be the same as the send token.
   */
  sendToken?: {
    balance: CoinPretty;
    amount: CoinPretty;
  };
  enabled?: boolean;
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
