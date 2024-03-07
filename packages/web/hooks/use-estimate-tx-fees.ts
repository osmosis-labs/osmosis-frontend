import { EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { useQuery } from "@tanstack/react-query";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { useStore } from "~/stores";
import { superjson } from "~/utils/superjson";
import { api } from "~/utils/trpc";

export function useEstimateTxFees({
  messages,
  chainId,
}: {
  messages: EncodeObject[] | undefined;
  chainId: string;
}) {
  const { accountStore } = useStore();
  const apiUtils = api.useUtils();

  const wallet = accountStore.getWallet(chainId);

  return useQuery({
    queryKey: [`simulate-swap-tx-${superjson.stringify(messages)}`],
    queryFn: async () => {
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);

      const [{ amount, gas: gasLimit }, osmoAssetWithPrice] = await Promise.all(
        [
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
        ]
      );
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
    },
    staleTime: 3_000, // 3 seconds
    cacheTime: 3_000, // 3 seconds
    enabled:
      messages &&
      Array.isArray(messages) &&
      messages.length > 0 &&
      wallet?.address !== undefined,
  });
}
