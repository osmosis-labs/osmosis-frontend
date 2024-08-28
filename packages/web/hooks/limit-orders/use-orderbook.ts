import { Dec } from "@keplr-wallet/unit";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import {
  MappedLimitOrder,
  MaybeUserAssetCoin,
  Orderbook,
} from "@osmosis-labs/server";
import { MinimalAsset } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useCallback, useMemo } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useSwapAsset } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/**
 * Retrieves all available orderbooks for the current chain.
 * Fetch is asynchronous so a loading state is returned.
 * @returns A state including an orderbooks array and a loading boolean.
 */
export const useOrderbooks = (): {
  orderbooks: Orderbook[];
  isLoading: boolean;
} => {
  const { data: orderbooks, isLoading } =
    api.edge.orderbooks.getPools.useQuery();

  return { orderbooks: orderbooks ?? [], isLoading };
};

/**
 * Retrieves all available base and quote denoms for the current chain.
 * Fetch is asynchronous so a loading state is returned.
 * @returns A state including an an array of selectable base denom strings, selectable base denom assets, selectable quote assets organised by base assets in the form of an object and a loading boolean.
 */
export const useOrderbookSelectableDenoms = () => {
  const { orderbooks, isLoading } = useOrderbooks();

  const { data: selectableAssetPages } =
    api.edge.assets.getUserAssets.useInfiniteQuery(
      {},
      {
        enabled: true,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        initialCursor: 0,
      }
    );

  // Determine selectable base denoms from orderbooks in the form of denom strings
  const selectableBaseDenoms = useMemo(() => {
    const selectableDenoms = orderbooks.map((orderbook) => orderbook.baseDenom);
    return Array.from(new Set(selectableDenoms));
  }, [orderbooks]);
  // Map selectable asset pages to array of assets
  const selectableAssets = useMemo(() => {
    return selectableAssetPages?.pages.flatMap((page) => page.items) ?? [];
  }, [selectableAssetPages]);

  // Map selectable base asset denoms to asset objects
  const selectableBaseAssets = useMemo(
    () =>
      selectableBaseDenoms
        .map((denom) => {
          const existingAsset = selectableAssets.find(
            (asset) => asset.coinMinimalDenom === denom
          );
          if (existingAsset) {
            return existingAsset;
          }
          const asset = getAssetFromAssetList({
            coinMinimalDenom: denom,
            assetLists: AssetLists,
          });

          if (!asset) return;

          return asset;
        })
        .filter(Boolean) as (MinimalAsset & MaybeUserAssetCoin)[],
    [selectableBaseDenoms, selectableAssets]
  );
  // Create mapping between base denom strings and a string of selectable quote asset denom strings
  const selectableQuoteDenoms = useMemo(() => {
    const quoteDenoms: Record<string, (MinimalAsset & MaybeUserAssetCoin)[]> =
      {};
    selectableBaseAssets.forEach((asset) => {
      quoteDenoms[asset.coinDenom] = orderbooks
        .filter((orderbook) => {
          return orderbook.baseDenom === asset.coinMinimalDenom;
        })
        .map((orderbook) => {
          const { quoteDenom } = orderbook;

          const existingAsset = selectableAssets.find(
            (asset) => asset.coinMinimalDenom === quoteDenom
          );

          if (existingAsset) {
            return existingAsset;
          }

          const asset = getAssetFromAssetList({
            coinMinimalDenom: quoteDenom,
            assetLists: AssetLists,
          });
          if (!asset) return;

          return { ...asset, amount: undefined, usdValue: undefined };
        })
        .filter(Boolean)
        .sort((a, b) =>
          (a?.amount?.toDec() ?? new Dec(0)).gt(
            b?.amount?.toDec() ?? new Dec(0)
          )
            ? 1
            : -1
        ) as (MinimalAsset & MaybeUserAssetCoin)[];
    });
    return quoteDenoms;
  }, [selectableBaseAssets, orderbooks, selectableAssets]);

  return {
    selectableBaseDenoms,
    selectableQuoteDenoms,
    selectableBaseAssets,
    isLoading,
  };
};

/**
 * Retrieves a single orderbook by base and quote denom.
 * @param denoms An object including both the base and quote denom
 * @returns A state including info about the current orderbook and any orders the user may have on the orderbook
 */
export const useOrderbook = ({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) => {
  const { accountStore } = useStore();
  const { orderbooks, isLoading: isOrderbookLoading } = useOrderbooks();
  const { data: selectableAssetPages } =
    api.edge.assets.getUserAssets.useInfiniteQuery(
      {
        userOsmoAddress: accountStore.getWallet(accountStore.osmosisChainId)
          ?.address,
        includePreview: false,
        limit: 50, // items per page
      },
      {
        enabled: true,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 0,

        // avoid blocking
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const selectableAssets = useMemo(
    () =>
      true
        ? selectableAssetPages?.pages.flatMap(({ items }) => items) ?? []
        : [],
    [selectableAssetPages?.pages]
  );
  const { asset: baseAsset } = useSwapAsset({
    minDenomOrSymbol: baseDenom,
    existingAssets: selectableAssets,
  });
  const { asset: quoteAsset } = useSwapAsset({
    minDenomOrSymbol: quoteDenom,
    existingAssets: selectableAssets,
  });

  const orderbook = useMemo(
    () =>
      orderbooks.find(
        (orderbook) =>
          baseAsset &&
          quoteAsset &&
          (orderbook.baseDenom === baseAsset.coinDenom ||
            orderbook.baseDenom === baseAsset.coinMinimalDenom) &&
          (orderbook.quoteDenom === quoteAsset.coinDenom ||
            orderbook.quoteDenom === quoteAsset.coinMinimalDenom)
      ),
    [orderbooks, baseAsset, quoteAsset]
  );
  const {
    makerFee,
    isLoading: isMakerFeeLoading,
    error: makerFeeError,
  } = useMakerFee({
    orderbookAddress: orderbook?.contractAddress ?? "",
  });

  const error = useMemo(() => {
    if (
      !isOrderbookLoading &&
      (!orderbook || !orderbook!.poolId || orderbook!.poolId === "")
    ) {
      return "errors.noOrderbook";
    }

    if (makerFeeError) {
      return makerFeeError?.message;
    }
  }, [orderbook, makerFeeError, isOrderbookLoading]);

  return {
    orderbook,
    poolId: orderbook?.poolId ?? "",
    contractAddress: orderbook?.contractAddress ?? "",
    makerFee,
    isMakerFeeLoading,
    isOrderbookLoading,
    error,
  };
};

/**
 * Hook to fetch the maker fee for a given orderbook.
 *
 * Queries the maker fee using the orderbook's address.
 * If the data is still loading, it returns a default value of Dec(0) for the maker fee.
 * Once the data is loaded, it returns the actual maker fee if available, or Dec(0) if not.
 * @param {string} orderbookAddress - The contract address of the orderbook.
 * @returns {Object} An object containing the maker fee and the loading state.
 */
const useMakerFee = ({ orderbookAddress }: { orderbookAddress: string }) => {
  const {
    data: makerFeeData,
    isLoading,
    error,
  } = api.edge.orderbooks.getMakerFee.useQuery(
    {
      osmoAddress: orderbookAddress,
    },
    {
      enabled: !!orderbookAddress,
    }
  );

  const makerFee = useMemo(() => {
    if (isLoading) return new Dec(0);
    return makerFeeData?.makerFee ?? new Dec(0);
  }, [isLoading, makerFeeData]);

  return {
    makerFee,
    isLoading,
    error,
  };
};

export type DisplayableLimitOrder = MappedLimitOrder;

export const useOrderbookAllActiveOrders = ({
  userAddress,
  pageSize = 10,
  refetchInterval = 5000,
}: {
  userAddress: string;
  pageSize?: number;
  refetchInterval?: number;
}) => {
  const { orderbooks } = useOrderbooks();
  const addresses = orderbooks.map(({ contractAddress }) => contractAddress);
  const {
    data: orders,
    isLoading,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = api.local.orderbooks.getAllOrdersSQS.useInfiniteQuery(
    {
      userOsmoAddress: userAddress,
      limit: pageSize,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      refetchInterval,
      enabled: !!userAddress && addresses.length > 0,
      refetchOnMount: true,
      keepPreviousData: false,
      trpc: {
        abortOnUnmount: true,
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const allOrders = useMemo(() => {
    return orders?.pages.flatMap((page) => page.items) ?? [];
  }, [orders]);

  const refetchOrders = useCallback(async () => {
    if (isRefetching) return;

    return refetch();
  }, [refetch, isRefetching]);

  return {
    orders: allOrders,
    isLoading,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    refetch: refetchOrders,
    isRefetching,
  };
};

export const useOrderbookClaimableOrders = ({
  userAddress,
  disabled = false,
  refetchInterval = 5000,
}: {
  userAddress: string;
  disabled?: boolean;
  refetchInterval?: number;
}) => {
  const { orderbooks } = useOrderbooks();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const addresses = orderbooks.map(({ contractAddress }) => contractAddress);
  const {
    data: claimableOrders,
    isLoading,
    isFetching,
    refetch,
  } = api.local.orderbooks.getAllOrdersSQS.useInfiniteQuery(
    {
      userOsmoAddress: userAddress,
      filter: "filled",
      limit: 100,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      refetchInterval,
      enabled: !!userAddress && addresses.length > 0 && !disabled,
      refetchOnMount: true,
      keepPreviousData: false,
      cacheTime: refetchInterval,
      staleTime: refetchInterval,
      trpc: {
        abortOnUnmount: true,
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const orders = useMemo(() => {
    return claimableOrders?.pages?.flatMap((page) => page.items) ?? [];
  }, [claimableOrders?.pages]);
  const claimAllOrders = useCallback(async () => {
    if (!account || !orders) return;
    const msgs = addresses
      .map((contractAddress) => {
        const ordersForAddress = orders.filter(
          (o) => o.orderbookAddress === contractAddress
        );
        if (ordersForAddress.length === 0) return;

        const msg = {
          batch_claim: {
            orders: ordersForAddress.map((o) => [o.tick_id, o.order_id]),
          },
        };
        return {
          contractAddress,
          msg,
          funds: [],
        };
      })
      .filter(Boolean) as {
      contractAddress: string;
      msg: object;
      funds: CoinPrimitive[];
    }[];

    if (msgs.length > 0) {
      await account?.cosmwasm.sendMultiExecuteContractMsg("executeWasm", msgs);
      await refetch();
    }
  }, [orders, account, addresses, refetch]);

  return {
    orders: orders ?? [],
    count: orders?.length ?? 0,
    isLoading: isLoading || isFetching,
    claimAllOrders,
  };
};
