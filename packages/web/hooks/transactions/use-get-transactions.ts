import { api } from "~/utils/trpc";

const EXAMPLE = {
  ADDRESS: "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3",
  PAGE: 1,
  PAGE_SIZE: 100,
};

export function useGetTransactions() {
  const { data, isLoading } = api.local.transactions.getTransactions.useQuery({
    address: EXAMPLE.ADDRESS,
    page: EXAMPLE.PAGE,
    pageSize: EXAMPLE.PAGE_SIZE,
  });

  return { data, isLoading };
}
