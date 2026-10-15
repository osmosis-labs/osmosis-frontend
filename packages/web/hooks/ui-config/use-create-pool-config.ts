import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";
import type { CreatePoolConfigOpts } from "@osmosis-labs/types";
import { useEffect, useState } from "react";

import { StaticChainGetter } from "~/config/chain";
import { api } from "~/utils/trpc";

/** Maintains a single instance of `ObservableCreatePoolConfig` for React view lifecycle.
 *  Syncs `chainId` and `bech32Address` from effects, and feeds the user's
 *  balances (from tRPC) into the config.
 */
export function useCreatePoolConfig(
  chainId: string,
  bech32Address: string,
  opts?: CreatePoolConfigOpts
) {
  const [config] = useState(
    () =>
      new ObservableCreatePoolConfig(
        StaticChainGetter,
        chainId,
        bech32Address,
        opts
      )
  );
  // the constructor takes the initial values, so these only sync later changes
  useEffect(() => {
    config.setChain(chainId);
    config.setSender(bech32Address);
  }, [config, chainId, bech32Address]);

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
