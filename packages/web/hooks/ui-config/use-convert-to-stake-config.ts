import { UserConvertToStakeConfig } from "@osmosis-labs/stores";
import { useState } from "react";

import { useStore } from "~/stores";

/** Use the convert to stake config at the current component tree node. */
export function useConvertToStakeConfig() {
  const {
    chainStore,
    queriesStore,
    queriesExternalStore,
    derivedDataStore,
    accountStore,
    priceStore,
  } = useStore();

  const [config] = useState(
    () =>
      new UserConvertToStakeConfig(
        chainStore.osmosis.chainId,
        queriesStore,
        queriesExternalStore,
        accountStore,
        derivedDataStore,
        priceStore
      )
  );

  return config;
}
