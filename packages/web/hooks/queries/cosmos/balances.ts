import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { queryBalances } from "~/server/queries/cosmos";

type ResponseData = Awaited<ReturnType<typeof queryBalances>>;

function getQueryKey(address: string) {
  return ["balances", address];
}

export const useBalances = ({
  address,
  queryOptions,
}: {
  address: string;
  queryOptions: UseQueryOptions<ResponseData, unknown, ResponseData, string[]>;
}) => {
  const result = useQuery(
    getQueryKey(address),
    () => queryBalances(address),
    queryOptions
  );

  return result;
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
