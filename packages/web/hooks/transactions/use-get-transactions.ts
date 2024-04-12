import { api } from "~/utils/trpc";

// TODO - eventually remove this once testing is complete
const EXAMPLE = {
  ADDRESS: "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3",
  PAGE: 1,
  PAGE_SIZE: 100,
};

export function useGetTransactions(address: string) {
  const { data, isLoading } = api.edge.transactions.getTransactions.useQuery(
    {
      // address,
      address: EXAMPLE.ADDRESS,
      page: EXAMPLE.PAGE,
      pageSize: EXAMPLE.PAGE_SIZE,
    },
    {
      // enabled: !!address,
    }
  );

  return { data, isLoading };
}
