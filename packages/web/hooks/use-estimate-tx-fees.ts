import { EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import { useMutation, useQuery } from "@tanstack/react-query";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { useStore } from "~/stores";
import { superjson } from "~/utils/superjson";
import { api } from "~/utils/trpc";

async function estimateTxFeesQueryFn({
  wallet,
  messages,
  apiUtils,
  accountStore,
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  messages: EncodeObject[] | undefined;
  apiUtils: ReturnType<typeof api.useUtils>;
}) {
  if (!messages) throw new Error("No messages");

  const [{ amount, gas: gasLimit }, osmoAssetWithPrice] = await Promise.all([
    accountStore.estimateFee({
      wallet,
      messages: messages!,
      signOptions: {
        ...wallet.walletInfo?.signOptions,
        preferNoSetFee: true, // this will automatically calculate the amount as well.
      },
    }),
    apiUtils.edge.assets.getMarketAsset.fetch({
      findMinDenomOrSymbol: "OSMO",
    }),
  ]);

  const coin = amount[0];
  if (!coin || !osmoAssetWithPrice?.currentPrice) {
    throw new Error("Failed to estimate fees");
  }

  const coinAmountDec = new Dec(coin.amount);
  const usdValue = coinAmountDec
    .quo(DecUtils.getTenExponentN(osmoAssetWithPrice.coinDecimals))
    .mul(osmoAssetWithPrice.currentPrice.toDec());
  const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, usdValue);

  return {
    gasUsdValueToPay,
    gasAmount: new CoinPretty(osmoAssetWithPrice, coinAmountDec),
    gasLimit,
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
  const { accountStore } = useStore();
  const apiUtils = api.useUtils();

  const wallet = accountStore.getWallet(chainId);

  return useQuery({
    queryKey: ["simulate-swap-tx", superjson.stringify(messages)],
    queryFn: () => {
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);
      return estimateTxFeesQueryFn({
        wallet,
        accountStore,
        messages,
        apiUtils,
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
