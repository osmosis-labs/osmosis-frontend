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
        new ObservableQueryPoolDetails(fiat, pool, queryOsmosis, priceStore)
      );
    }
  }, [pool, poolDetailConfig, fiat, queryOsmosis, priceStore]);

  useEffect(
    () => poolDetailConfig?.setBech32Address(bech32Address),
    [poolDetailConfig, bech32Address]
  );

  return { poolDetailConfig: poolDetailConfig ?? undefined, pool };
}
