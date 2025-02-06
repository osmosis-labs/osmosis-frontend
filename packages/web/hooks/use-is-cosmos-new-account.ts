import { api } from "~/utils/trpc";

export const useIsCosmosNewAccount = ({
  address,
}: {
  address: string | undefined;
}) => {
  const { data, isLoading: areLoadingBalances } =
    api.local.balances.getUserBalances.useQuery(
      {
        bech32Address: address!,
      },
      {
        enabled: !!address,
      }
    );

  return {
    isNewAccount: areLoadingBalances
      ? true
      : !data ||
        data.length === 0 ||
        !data.some(({ amount }) => amount !== "0"),
  };
};
