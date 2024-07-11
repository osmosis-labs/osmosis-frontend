import { isCosmosAddressValid, isNil } from "@osmosis-labs/utils";
import { useLocalStorage } from "react-use";

import { api } from "~/utils/trpc";

export const usePreviousConnectedCosmosAccount = () => {
  const [previousConnectedCosmosAccount, setPreviousConnectedCosmosAccount] =
    useLocalStorage<string>("previous-connected-account");

  const { data, isLoading: areLoadingBalances } =
    api.local.balances.getUserBalances.useQuery(
      {
        bech32Address: previousConnectedCosmosAccount!,
      },
      {
        enabled:
          !isNil(previousConnectedCosmosAccount) &&
          isCosmosAddressValid({
            address: previousConnectedCosmosAccount,
            bech32Prefix: "osmo",
          }),
      }
    );

  return {
    previousConnectedCosmosAccount,
    setPreviousConnectedCosmosAccount,
    areLoadingBalances,
    hasFunds: areLoadingBalances
      ? false
      : !isNil(data) &&
        data.length > 0 &&
        data.some(({ amount }) => amount !== "0"),
  };
};
