import { ChainGetter } from "@osmosis-labs/keplr-stores";
import {
  CreatePoolConfigOpts,
  ObservableCreatePoolConfig,
} from "@osmosis-labs/stores";
import { useEffect, useState } from "react";

import { api } from "~/utils/trpc";

/** Maintains a single instance of `ObservableCreatePoolConfig` for React view lifecycle.
 *  Updates `chainId` and `bech32Address` on render, and feeds the user's
 *  balances (from tRPC) into the config.
 */
export function useCreatePoolConfig(
  chainGetter: ChainGetter,
  chainId: string,
  bech32Address: string,
  opts?: CreatePoolConfigOpts
) {
  const [config] = useState(
    () =>
      new ObservableCreatePoolConfig(chainGetter, chainId, bech32Address, opts)
  );
  config.setChain(chainId);
  config.setSender(bech32Address);

  const { data: balances } = api.local.balances.getUserBalances.useQuery(
    { bech32Address },
    { enabled: Boolean(bech32Address) }
  );

  useEffect(() => {
    config.setBalances(
      (balances ?? []).flatMap(({ amount, coin }) =>
        coin ? [{ currency: coin.currency, amount }] : []
      )
    );
  }, [config, balances]);

  return config;
}
