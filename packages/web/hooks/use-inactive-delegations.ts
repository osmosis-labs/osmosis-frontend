import { BondStatus } from "@osmosis-labs/types";
import { Int } from "@osmosis-labs/unit";
import { useCallback, useMemo } from "react";

import { useStore } from "~/stores";
import {
  getInactiveDelegations,
  getStakeToEnterActiveSet,
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

/**
 * Returns the stake (minimal units) a validator outside the active set needs to
 * rank back into it, or undefined until the bonded validators and staking
 * params have loaded. Call from an observer component.
 */
export function useStakeToEnterActiveSet(): (
  validatorTokens: Int
) => Int | undefined {
  const { chainStore, queriesStore } = useStore();
  const cosmosQueries = queriesStore.get(chainStore.osmosis.chainId).cosmos;
  const bondedQuery = cosmosQueries.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const { maxValidators } = cosmosQueries.queryStakingParams;

  const isLoaded =
    Boolean(bondedQuery.response) &&
    Boolean(cosmosQueries.queryStakingParams.response);
  const { validators } = bondedQuery;

  const bondedTokens = useMemo(
    () => validators.map(({ tokens }) => new Int(tokens)),
    [validators]
  );

  return useCallback(
    (validatorTokens: Int) =>
      isLoaded
        ? getStakeToEnterActiveSet(validatorTokens, bondedTokens, maxValidators)
        : undefined,
    [isLoaded, bondedTokens, maxValidators]
  );
}
