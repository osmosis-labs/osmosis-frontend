import { api } from "~/utils/trpc";

export function usePrice(
  currency?: { coinMinimalDenom: string },
  options?: {
    retry?: boolean;
  }
) {
  const { data: price, ...otherUtils } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: currency?.coinMinimalDenom ?? "",
    },
    {
      enabled:
        Boolean(currency) && !currency?.coinMinimalDenom.startsWith("gamm"),
      // Keep the last price after unmount so remounts render it right away
      // and refresh in the background once it is stale.
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 3, // 3 second
      ...options,
    }
  );

  return {
    price,
    ...otherUtils,
  };
}
