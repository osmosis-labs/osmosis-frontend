import { getAssetFromAssetList, makeMinimalAsset } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { api } from "~/utils/trpc";

const testnetOrderbooks = [
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

export const useOrderbooks = () => {
  const { orderbooks, isLoading } = {
    orderbooks: testnetOrderbooks,
    isLoading: false,
  };

  return { orderbooks, isLoading };
};

export const useOrderbookByDenoms = ({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) => {
  const { orderbooks, isLoading } = useOrderbooks();

  const orderbook = orderbooks.find(
    (orderbook) =>
      orderbook.baseDenom === baseDenom && orderbook.quoteDenom === quoteDenom
  );

  return { orderbook, isLoading };
};

export const useOrderbookSelectableDenoms = () => {
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

  const selectableBaseDenoms = useMemo(() => {
    const selectableDenoms = orderbooks.map((orderbook) => orderbook.baseDenom);
    return Array.from(new Set(selectableDenoms));
  }, [orderbooks]);

  const selectableAssets = useMemo(() => {
    return selectableAssetPages?.pages.flatMap((page) => page.items) ?? [];
  }, [selectableAssetPages]);

  const selectableBaseAssets = selectableBaseDenoms.map((denom) => {
    const existingAsset = selectableAssets.find(
      (asset) => asset.coinDenom === denom
    );
    if (existingAsset) {
      return existingAsset;
    }
    const asset = getAssetFromAssetList({
      symbol: denom,
      sourceDenom: denom,
      assetLists: AssetLists,
    });

    if (!asset) return;

    return makeMinimalAsset(asset.rawAsset);
  });

  console.log(selectableBaseAssets);
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
