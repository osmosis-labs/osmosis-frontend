import { api } from "~/utils/trpc";

export const useIsCosmosNewAccount = ({
  address,
}: {
  address: string | undefined;
}) => {
  const { data, isLoading: isLoadingBalances } =
    api.local.balances.getUserBalances.useQuery(
      {
        bech32Address: address!,
      },
      {
        enabled: !!address,
      }
    );

  return {
    isNewAccount: isLoadingBalances
      ? true
      : !data ||
        data.length === 0 || // If there are no balances, don't show the floating toast
        !data.some(({ amount }) => amount !== "0"),
  };
};
