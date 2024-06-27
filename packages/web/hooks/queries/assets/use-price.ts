import { api } from "~/utils/trpc";

export function usePrice(currency?: { coinMinimalDenom: string }) {
  const { data: price, ...otherUtils } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: currency?.coinMinimalDenom ?? "",
    },
    {
      enabled:
        Boolean(currency) && !currency?.coinMinimalDenom.startsWith("gamm"),
      cacheTime: 1000 * 3, // 3 second
      staleTime: 1000 * 3, // 3 second
    }
  );

  return {
    price,
    ...otherUtils,
  };
}
