import { Dec } from "@keplr-wallet/unit";
import { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import { Orderbook } from "@osmosis-labs/server";
import { MappedLimitOrder } from "@osmosis-labs/trpc";
import { MinimalAsset } from "@osmosis-labs/types";
import { getAssetFromAssetList, makeMinimalAsset } from "@osmosis-labs/utils";
import { useCallback, useMemo } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useSwapAsset } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

const USDC_DENOM = process.env.NEXT_PUBLIC_IS_TESTNET
  ? "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4"
  : "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const USDT_DENOM = process.env.NEXT_PUBLIC_IS_TESTNET ? "" : "";
const validDenoms = [USDC_DENOM, USDT_DENOM];

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

  const onlyStableOrderbooks = useMemo(
    () =>
      (orderbooks ?? []).filter(({ quoteDenom }) =>
        validDenoms.includes(quoteDenom)
      ),
    [orderbooks]
  );
  return { orderbooks: onlyStableOrderbooks, isLoading };
};

/**
 * Retrieves all available base and quote denoms for the current chain.
 * Fetch is asynchronous so a loading state is returned.
 * @returns A state including an an array of selectable base denom strings, selectable base denom assets, selectable quote assets organised by base assets in the form of an object and a loading boolean.
 */
export const useOrderbookSelectableDenoms = <TAsset extends MinimalAsset>() => {
  const { orderbooks, isLoading } = useOrderbooks();

  const { data: selectableAssetPages } =
    api.edge.assets.getUserAssets.useInfiniteQuery(
      {
        limit: 50, // items per page
      },
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
  const selectableBaseAssets: TAsset[] = useMemo(
    () =>
      selectableBaseDenoms
        .map((denom) => {
          const existingAsset = selectableAssets.find(
            (asset) => asset.coinDenom === denom
          );
          if (existingAsset) {
            return existingAsset as TAsset;
          }
          const asset = getAssetFromAssetList({
            symbol: denom,
            sourceDenom: denom,
            assetLists: AssetLists,
          });

          if (!asset) return;

          return makeMinimalAsset(asset.rawAsset) as TAsset;
        })
        .filter((a) => a !== undefined) as TAsset[],
    [selectableBaseDenoms, selectableAssets]
  );

  // Create mapping between base denom strings and a string of selectable quote asset denom strings
  const selectableQuoteDenoms = useMemo(() => {
    const quoteDenoms: Record<string, string[]> = {};
    selectableBaseDenoms.forEach((_, i) => {
      quoteDenoms[selectableBaseDenoms[i]] = orderbooks
        .filter((orderbook) => orderbook.baseDenom === selectableBaseDenoms[i])
        .map((orderbook) => orderbook.quoteDenom);
    });
    return quoteDenoms;
  }, [selectableBaseDenoms, orderbooks]);

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
      !Boolean(orderbook) ||
      !Boolean(orderbook!.poolId) ||
      orderbook!.poolId === ""
    ) {
      return "errors.noOrderbook";
    }

    if (Boolean(makerFeeError)) {
      return makerFeeError?.message;
    }
  }, [orderbook, makerFeeError]);

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
  } = api.edge.orderbooks.getMakerFee.useQuery({
    osmoAddress: orderbookAddress,
  });

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
}: {
  userAddress: string;
  pageSize?: number;
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
  } = api.edge.orderbooks.getAllActiveOrders.useInfiniteQuery(
    {
      contractAddresses: addresses,
      userOsmoAddress: userAddress,
      limit: pageSize,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      keepPreviousData: true,
    }
  );

  const allOrders = useMemo(() => {
    return orders?.pages.flatMap((page) => page.items) ?? [];
  }, [orders]);
  return {
    orders: allOrders,
    isLoading,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
  };
};

export const useOrderbookClaimableOrders = ({
  userAddress,
}: {
  userAddress: string;
}) => {
  const { orderbooks } = useOrderbooks();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const addresses = orderbooks.map(({ contractAddress }) => contractAddress);
  const {
    data: orders,
    isLoading,
    isFetching,
  } = api.edge.orderbooks.getClaimableOrders.useQuery({
    contractAddresses: addresses,
    userOsmoAddress: userAddress,
  });

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
    }
  }, [orders, account, addresses]);

  return {
    orders: orders ?? [],
    count: orders?.length ?? 0,
    isLoading: isLoading || isFetching,
    claimAllOrders,
  };
};
