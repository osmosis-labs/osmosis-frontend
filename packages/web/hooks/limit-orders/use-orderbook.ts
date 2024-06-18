import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/server";
import { getAssetFromAssetList, makeMinimalAsset } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useSwapAsset } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface Orderbook {
  baseDenom: string;
  quoteDenom: string;
  contractAddress: string;
}

const USDC_DENOM = process.env.NEXT_PUBLIC_IS_TESTNET
  ? "ibc/DE6792CF9E521F6AD6E9A4BDF6225C9571A3B74ACC0A529F92BC5122A39D2E58"
  : "";
const USDT_DENOM = process.env.NEXT_PUBLIC_IS_TESTNET ? "" : "";
const validDenoms = [USDC_DENOM, USDT_DENOM];

const testnetOrderbooks: Orderbook[] = [
  {
    baseDenom: "uosmo",
    quoteDenom:
      "ibc/DE6792CF9E521F6AD6E9A4BDF6225C9571A3B74ACC0A529F92BC5122A39D2E58",
    contractAddress:
      "osmo1kgvlc4gmd9rvxuq2e63m0fn4j58cdnzdnrxx924mrzrjclcgqx5qxn3dga",
  },
  {
    baseDenom: "uion",
    quoteDenom: "uosmo",
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
  const { data: makerFeeData, isLoading } =
    api.edge.orderbooks.getMakerFee.useQuery({
      osmoAddress: orderbookAddress,
    });

  const makerFee = useMemo(() => {
    if (isLoading) return new Dec(0);
    return makerFeeData?.makerFee ?? new Dec(0);
  }, [isLoading, makerFeeData]);

  return {
    makerFee: new Dec(0.015),
    isLoading,
  };
};

// export const useActiveLimitOrdersByOrderbook = ({
//   orderbookAddress,
//   userAddress,
// }: {
//   orderbookAddress: string;
//   userAddress: string;
// }) => {
//   const { data: orders, isLoading } =
//     api.edge.orderbooks.getActiveOrders.useQuery({
//       contractOsmoAddress: orderbookAddress,
//       userOsmoAddress: userAddress,
//     });
//   return {
//     orders,
//     isLoading,
//   };
// };

/**
 * Hook to fetch the current spot price of a given pair from an orderbook.
 *
 * The spot price is determined by the provided quote asset and base asset.
 *
 * For a BID the quote asset is the base asset and the base asset is the quote asset of the orderbook.
 *
 * For an ASK the quote asset is the quote asset and the base asset is the base asset of the orderbook.
 *
 * @param {string} orderbookAddress - The contract address of the orderbook.
 * @param {string} quoteAssetDenom - The token out asset denom.
 * @param {string} baseAssetDenom - The token in asset denom.
 * @returns {Object} An object containing the spot price and the loading state.
 */
export const useOrderbookSpotPrice = ({
  orderbookAddress,
  quoteAssetDenom,
  baseAssetDenom,
}: {
  orderbookAddress: string;
  quoteAssetDenom: string;
  baseAssetDenom: string;
}) => {
  const { data: spotPrice, isLoading } =
    api.edge.orderbooks.getSpotPrice.useQuery({
      osmoAddress: orderbookAddress,
      quoteAssetDenom,
      baseAssetDenom,
    });
  return {
    spotPrice,
    isLoading,
  };
};
