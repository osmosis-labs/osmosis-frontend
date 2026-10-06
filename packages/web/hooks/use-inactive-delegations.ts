import { useMemo } from "react";

import { useStore } from "~/stores";
import {
  getInactiveDelegations,
  InactiveDelegation,
} from "~/utils/inactive-delegations";

/**
 * The connected wallet's delegations to validators outside the active set,
 * which have stopped earning rewards. Empty while disabled, no wallet is
 * connected, or either query hasn't loaded, so callers never act on partial
 * data. Call from an observer component.
 */
export function useInactiveDelegations({
  enabled = true,
}: { enabled?: boolean } = {}): {
  inactiveDelegations: InactiveDelegation[];
  isLoaded: boolean;
} {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const walletAddress = accountStore.getWallet(chainId)?.address ?? "";
  // an empty address never fetches, so nothing loads while disabled
  const address = enabled ? walletAddress : "";
  const cosmosQueries = queriesStore.get(chainId).cosmos;

  const delegationsQuery =
    cosmosQueries.queryDelegations.getQueryBech32Address(address);
  const delegatorValidatorsQuery =
    cosmosQueries.queryDelegatorValidators.getQueryBech32Address(address);

  const isLoaded =
    address.length > 0 &&
    Boolean(delegationsQuery.response) &&
    Boolean(delegatorValidatorsQuery.response);

  const { delegations } = delegationsQuery;
  const { validators } = delegatorValidatorsQuery;

  const inactiveDelegations = useMemo(
    () => (isLoaded ? getInactiveDelegations(delegations, validators) : []),
    [isLoaded, delegations, validators]
  );

  return { inactiveDelegations, isLoaded };
}
