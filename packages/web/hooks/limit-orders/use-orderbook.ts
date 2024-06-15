import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/server";
import { getAssetFromAssetList, makeMinimalAsset } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { api } from "~/utils/trpc";

interface Orderbook {
  baseDenom: string;
  quoteDenom: string;
  contractAddress: string;
}

const testnetOrderbooks: Orderbook[] = [
  {
    baseDenom: "OSMO",
    quoteDenom: "USDC",
    contractAddress:
      "osmo1kgvlc4gmd9rvxuq2e63m0fn4j58cdnzdnrxx924mrzrjclcgqx5qxn3dga",
  },
  {
    baseDenom: "ION",
    quoteDenom: "OSMO",
    contractAddress:
      "osmo1ruxn39qj6x44gms8pfzw22kd7kemslc5fahgua3wuz0tkyks0uhq2f25wh",
  },
];

/**
 * Retrieves all available orderbooks for the current chain.
 * Fetch is asynchronous so a loading state is returned.
 * @returns A state including an orderbooks array and a loading boolean.
 */
export const useOrderbooks = (): {
  orderbooks: Orderbook[];
  isLoading: boolean;
} => {
  const { orderbooks, isLoading } = {
    // TODO: Replace with SQS filtered response
    orderbooks: testnetOrderbooks,
    isLoading: false,
  };

  return { orderbooks: orderbooks ?? [], isLoading };
};

/**
 * Retrieves all available base and quote denoms for the current chain.
 * Fetch is asynchronous so a loading state is returned.
 * @returns A state including an an array of selectable base denom strings, selectable base denom assets, selectable quote assets organised by base assets in the form of an object and a loading boolean.
 */
export const useOrderbookSelectableDenoms = <TAsset extends Asset>() => {
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
    for (let i = 0; i < selectableBaseDenoms.length; i++) {
      quoteDenoms[selectableBaseDenoms[i]] = orderbooks
        .filter((orderbook) => orderbook.baseDenom === selectableBaseDenoms[i])
        .map((orderbook) => orderbook.quoteDenom);
    }
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
  const { orderbooks, isLoading: isOrderbookLoading } = useOrderbooks();

  const orderbook = orderbooks.find(
    (orderbook) =>
      orderbook.baseDenom === baseDenom && orderbook.quoteDenom === quoteDenom
  );
  const { makerFee, isLoading: isMakerFeeLoading } = useMakerFee({
    orderbookAddress: orderbook?.contractAddress ?? "",
  });

  return {
    poolId: "1",
    contractAddress: orderbook?.contractAddress ?? "",
    makerFee,
    isMakerFeeLoading,
    isOrderbookLoading,
  };
};

const useMakerFee = ({ orderbookAddress }: { orderbookAddress: string }) => {
  const { data: makerFeeData, isLoading } =
    api.edge.orderbooks.getMakerFee.useQuery({
      osmoAddress: orderbookAddress,
    });

  const makerFee = useMemo(() => {
    if (isLoading) return new Dec(0);
    return makerFeeData?.makerFee ?? new Dec(0);
  }, [isLoading, makerFeeData]);
  return {
    makerFee,
    isLoading,
  };
};

export const useActiveLimitOrdersByOrderbook = ({
  orderbookAddress,
  userAddress,
}: {
  orderbookAddress: string;
  userAddress: string;
}) => {
  const { data: orders, isLoading } =
    api.edge.orderbooks.getActiveOrders.useQuery({
      contractOsmoAddress: orderbookAddress,
      userOsmoAddress: userAddress,
    });
  return {
    orders,
    isLoading,
  };
};
