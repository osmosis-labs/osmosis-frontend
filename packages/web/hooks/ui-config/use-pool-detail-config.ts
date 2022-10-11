import { useEffect, useState } from "react";
import { ObservableQueryPoolDetails } from "@osmosis-labs/stores";
import { useStore } from "../../stores";

export function usePoolDetailConfig(poolId?: string) {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

  const pool = poolId ? queryOsmosis.queryGammPools.getPool(poolId) : undefined;

  const [poolDetailConfig, setPoolDetailConfig] =
    useState<ObservableQueryPoolDetails | null>(null);
  useEffect(() => {
    if (!poolDetailConfig && pool && fiat) {
      setPoolDetailConfig(
        new ObservableQueryPoolDetails(
          bech32Address,
          fiat,
          pool,
          queryOsmosis,
          priceStore
        )
      );
    }
  }, [pool, poolDetailConfig, bech32Address, fiat, queryOsmosis, priceStore]);

  return { poolDetailConfig: poolDetailConfig ?? undefined, pool };
}
