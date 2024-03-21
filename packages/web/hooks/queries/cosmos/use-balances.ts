import { queryBalances } from "@osmosis-labs/server";
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { ChainList } from "~/config/generated/chain-list";

type ResponseData = Awaited<ReturnType<typeof queryBalances>>;

function getQueryKey(address: string): string[] {
  return ["balances", address];
}

export const useBalances = ({
  address,
  queryOptions = {},
}: {
  address: string;
  queryOptions?: UseQueryOptions<ResponseData, unknown, ResponseData, string[]>;
}) => {
  return useQuery(
    getQueryKey(address),
    () => queryBalances({ bech32Address: address, chainList: ChainList }),
    {
      enabled: Boolean(address) && typeof address === "string",
      ...queryOptions,
    }
  );
};

useBalances.invalidateQuery = ({
  address,
  queryClient,
}: {
  queryClient: QueryClient;
  address: string;
}) => {
  return queryClient.invalidateQueries(getQueryKey(address));
};
