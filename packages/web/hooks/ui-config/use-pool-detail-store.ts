import { useEffect, useState } from "react";
import { ObservableQueryPoolDetails } from "@osmosis-labs/stores";
import { useStore } from "../../stores";

export function usePoolDetailStore(poolId?: string) {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

  const pool = poolId ? queryOsmosis.queryGammPools.getPool(poolId) : undefined;

  const [poolDetailStore, setPoolDetailStore] =
    useState<ObservableQueryPoolDetails | null>(null);
  useEffect(() => {
    if (!poolDetailStore && pool && fiat) {
      setPoolDetailStore(
        new ObservableQueryPoolDetails(
          bech32Address,
          fiat,
          pool,
          queryOsmosis,
          priceStore
        )
      );
    }
  }, [pool, poolDetailStore, bech32Address, fiat, queryOsmosis, priceStore]);

  return { poolDetailStore: poolDetailStore ?? undefined, pool };
}
