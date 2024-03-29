import { Coin, EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, superjson } from "@osmosis-labs/server";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
  SignOptions,
} from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

async function estimateTxFeesQueryFn({
  wallet,
  messages,
  apiUtils,
  accountStore,
  signOptions,
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  messages: EncodeObject[] | undefined;
  apiUtils: ReturnType<typeof api.useUtils>;
  signOptions?: SignOptions;
}) {
  if (!messages) throw new Error("No messages");

  const shouldBeSignedWithOneClickTrading =
    signOptions?.useOneClickTrading &&
    (await accountStore.shouldBeSignedWithOneClickTrading({ messages }));
  const oneClickTradingInfo = await accountStore.getOneClickTradingInfo();

  const { amount, gas: gasLimit } = await accountStore.estimateFee({
    wallet,
    messages,
    nonCriticalExtensionOptions: shouldBeSignedWithOneClickTrading
      ? await accountStore.getOneClickTradingExtensionOptions({
          oneClickTradingInfo,
        })
      : undefined,
    signOptions: {
      ...wallet.walletInfo?.signOptions,
      ...signOptions,
      preferNoSetFee: true, // this will automatically calculate the amount as well.
    },
  });

  const coin = amount[0];

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
  signOptions,
  enabled = true,
}: {
  messages: EncodeObject[] | undefined;
  chainId: string;
  enabled?: boolean;
  signOptions?: SignOptions;
}) {
  const { accountStore } = useStore();
  const apiUtils = api.useUtils();

  const wallet = accountStore.getWallet(chainId);

  return useQuery<
    {
      gasUsdValueToPay: PricePretty;
      gasAmount: CoinPretty;
      gasLimit: string;
      amount: readonly Coin[];
    },
    Error
  >({
    queryKey: ["simulate-swap-tx", superjson.stringify(messages)],
    queryFn: () => {
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);
      return estimateTxFeesQueryFn({
        wallet,
        accountStore,
        messages,
        apiUtils,
        signOptions,
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
