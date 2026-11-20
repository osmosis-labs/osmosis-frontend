import { useMemo } from "react";

import { api } from "~/utils/trpc";

/**
 * The canonical orderbook trading the two denoms, in either orientation.
 * Denoms are matched exactly, never by symbol.
 */
export function useCanonicalOrderbookForPair({
  coinMinimalDenomA,
  coinMinimalDenomB,
  poolId,
}: {
  coinMinimalDenomA?: string;
  coinMinimalDenomB?: string;
  /** Use this orderbook pool instead of looking one up by pair. */
  poolId?: string;
}) {
  const { data: orderbooks, isLoading } =
    api.edge.orderbooks.getPools.useQuery();

  const orderbook = useMemo(() => {
    if (poolId) return orderbooks?.find((ob) => ob.poolId === poolId);
    if (!coinMinimalDenomA || !coinMinimalDenomB) return undefined;
    return orderbooks?.find(
      ({ baseDenom, quoteDenom }) =>
        (baseDenom === coinMinimalDenomA && quoteDenom === coinMinimalDenomB) ||
        (baseDenom === coinMinimalDenomB && quoteDenom === coinMinimalDenomA)
    );
  }, [orderbooks, coinMinimalDenomA, coinMinimalDenomB, poolId]);

  return { orderbook, isLoading };
}
