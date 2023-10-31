import { UserConvertToStakeConfig } from "@osmosis-labs/stores";
import { useEffect, useState } from "react";

import { useStore } from "~/stores";

/** Use the convert to stake config at the current component tree node. */
export function useConvertToStakeConfig() {
  const {
    chainStore,
    queriesStore,
    derivedDataStore,
    queriesExternalStore,
    accountStore,
    priceStore,
  } = useStore();

  const [config] = useState(
    () =>
      new UserConvertToStakeConfig(
        chainStore.osmosis.chainId,
        chainStore,
        queriesStore,
        accountStore,
        derivedDataStore,
        queriesExternalStore,
        priceStore
      )
  );

  useEffect(() => () => config.dispose(), [config]);

  return config;
}
