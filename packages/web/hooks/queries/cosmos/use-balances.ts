import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { queryBalances } from "~/server/queries/cosmos";

type ResponseData = Awaited<ReturnType<typeof queryBalances>>;

function getQueryKey(address: string): string[] {
  return ["balances", address];
}

export const useBalances = <
  TQueryFnData = ResponseData,
  TError = unknown,
  TData = ResponseData
>({
  address,
  queryOptions = {},
}: {
  address: string;
  queryOptions?: UseQueryOptions<TQueryFnData, TError, TData, string[]>;
}) => {
  return useQuery(
    getQueryKey(address),
    () => queryBalances(address) as Promise<TQueryFnData>,
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
