import { EncodeObject } from "@cosmjs/proto-signing";
import { DEFAULT_VS_CURRENCY, superjson } from "@osmosis-labs/server";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  InsufficientBalanceForFeeError,
  OsmosisAccount,
  SignOptions,
  SwapRequiresError,
} from "@osmosis-labs/stores";
import {
  getFallbackFeeAmountFromBalances,
  InsufficientFeeError,
  type QuoteStdFee,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
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

const DEFAULT_FALLBACK_GAS_LIMIT = 1_000_000; // Conservative fallback for swaps
const DEFAULT_GAS_PRICE_UOSMO = 0.045; // Higher than default 0.035
const BASE_GAS_DENOM_UOSMO = "uosmo";

async function estimateTxFeesQueryFn({
  wallet,
  messages,
  apiUtils,
  accountStore,
  chainStore,
  chainId,
  signOptions,
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  messages: EncodeObject[];
  apiUtils: ReturnType<typeof api.useUtils>;
  chainStore: ReturnType<typeof useStore>["chainStore"];
  chainId: string;
  signOptions?: SignOptions;
}): Promise<QueryResult> {
  if (!messages.length) throw new Error("No messages");

  try {
    const { amount, gas } = await accountStore.estimateFee({
      wallet,
      messages,
      fallbackGasLimit: DEFAULT_FALLBACK_GAS_LIMIT,
      signOptions: {
        ...wallet.walletInfo?.signOptions,
        ...signOptions,
        preferNoSetFee: true, // this will automatically calculate the amount as well.
      },
    });

    const fee = amount?.[0];
    if (!fee?.denom) {
      throw new Error("Failed to estimate fees");
    }

    const asset = await getCachedAssetWithPrice(apiUtils, fee.denom);
    if (!asset?.currentPrice) {
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
  } catch (error) {
    if (isInsufficientFeeError(error)) {
      throw error;
    }

    return getFallbackFeeEstimate({
      wallet,
      chainStore,
      chainId,
      apiUtils,
    });
  }
}

function isInsufficientFeeError(error: unknown) {
  if (
    error instanceof InsufficientBalanceForFeeError ||
    error instanceof InsufficientFeeError
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("no fee tokens found with sufficient balance") ||
    message.includes("insufficient alternative balance for transaction fees") ||
    message.includes("insufficient balance for transaction fees") ||
    message.includes("insufficient funds")
  );
}

async function getFallbackFeeEstimate({
  wallet,
  chainStore,
  chainId,
  apiUtils,
}: {
  wallet: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  chainStore: ReturnType<typeof useStore>["chainStore"];
  chainId: string;
  apiUtils: ReturnType<typeof api.useUtils>;
}): Promise<QueryResult> {
  if (!wallet.address) {
    throw new Error("No wallet address available.");
  }

  const chain = chainStore.getChain(chainId);
  const feeDenoms =
    chain?.feeCurrencies
      ?.map((currency) => currency.coinMinimalDenom)
      .filter(Boolean) ?? [];

  const baseFeeDenom = feeDenoms[0] ?? BASE_GAS_DENOM_UOSMO;
  const feeDenomsForFallback =
    feeDenoms.length > 0 ? feeDenoms : [baseFeeDenom];
  const baseAsset = await getCachedAssetWithPrice(apiUtils, baseFeeDenom);

  if (!baseAsset?.currentPrice) {
    throw new Error("Failed to estimate fees: missing base fee asset price");
  }

  const baseFeeCurrency = chain?.feeCurrencies?.[0] as
    | { gasPriceStep?: { high?: number } }
    | undefined;
  const baseGasPrice =
    baseFeeDenom === BASE_GAS_DENOM_UOSMO
      ? DEFAULT_GAS_PRICE_UOSMO
      : baseFeeCurrency?.gasPriceStep?.high ?? DEFAULT_GAS_PRICE_UOSMO;

  const baseGasPriceDec = new Dec(baseGasPrice.toString());
  const balances = await apiUtils.local.balances.getUserBalances.fetch({
    bech32Address: wallet.address,
    chainId,
  });

  const priceByDenom = new Map<string, { price: Dec; coinDecimals: number }>();
  const denomsToPrice = Array.from(
    new Set([baseFeeDenom, ...feeDenomsForFallback])
  );
  await Promise.all(
    denomsToPrice.map(async (denom) => {
      const asset = await getCachedAssetWithPrice(apiUtils, denom);
      if (!asset?.currentPrice) return;
      priceByDenom.set(denom, {
        price: asset.currentPrice.toDec(),
        coinDecimals: asset.coinDecimals,
      });
    })
  );

  let fallbackAmounts: QuoteStdFee["amount"];
  try {
    fallbackAmounts = await getFallbackFeeAmountFromBalances({
      fallbackGasLimit: DEFAULT_FALLBACK_GAS_LIMIT.toString(),
      baseFeeDenom,
      baseGasPrice: baseGasPriceDec,
      feeDenoms: feeDenomsForFallback,
      balances,
      priceByDenom,
      bech32Address: wallet.address,
    });
  } catch (error) {
    if (error instanceof InsufficientFeeError) {
      throw error;
    }
    throw new Error("Failed to estimate fees: fallback selection failed", {
      cause: error,
    });
  }

  const fallbackAmount = fallbackAmounts[0];
  const fallbackAsset = await getCachedAssetWithPrice(
    apiUtils,
    fallbackAmount.denom
  );
  if (!fallbackAsset?.currentPrice) {
    throw new Error("Failed to estimate fees: missing fallback asset price");
  }
  const fallbackAmountDec = new Dec(fallbackAmount.amount);
  const usdValue = fallbackAmountDec
    .quo(DecUtils.getTenExponentN(fallbackAsset.coinDecimals))
    .mul(fallbackAsset.currentPrice.toDec());
  const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, usdValue);

  return {
    gasUsdValueToPay,
    gasAmount: new CoinPretty(fallbackAsset, fallbackAmountDec),
    gasLimit: DEFAULT_FALLBACK_GAS_LIMIT.toString(),
    amount: fallbackAmounts,
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
  const { accountStore, chainStore } = useStore();
  const apiUtils = api.useUtils();

  const wallet = accountStore.getWallet(chainId);

  const queryResult = useQuery<QueryResult, Error, QueryResult, string[]>({
    queryKey: [
      "estimate-tx-fees",
      superjson.stringify(messages),
      superjson.stringify(signOptions),
    ],
    queryFn: () => {
      if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);
      return estimateTxFeesQueryFn({
        wallet,
        accountStore,
        messages: messages!,
        apiUtils,
        chainStore,
        chainId,
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
