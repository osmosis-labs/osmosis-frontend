import { Int } from "@osmosis-labs/unit";
import { useCallback, useMemo } from "react";

import { useStore } from "~/stores";
import {
  getInactiveDelegations,
  getStakeToEnterActiveSet,
  InactiveDelegation,
} from "~/utils/inactive-delegations";
import { api } from "~/utils/trpc";

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
  const { chainStore, accountStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const walletAddress = accountStore.getWallet(chainId)?.address ?? "";
  // an empty address never fetches, so nothing loads while disabled
  const address = enabled ? walletAddress : "";

  const { data: delegations } = api.edge.staking.getUserDelegations.useQuery(
    { userOsmoAddress: address },
    { enabled: Boolean(address) }
  );
  const { data: validators } =
    api.edge.staking.getUserDelegatorValidators.useQuery(
      { userOsmoAddress: address },
      { enabled: Boolean(address) }
    );

  const isLoaded =
    address.length > 0 && Boolean(delegations) && Boolean(validators);

  const inactiveDelegations = useMemo(
    () =>
      isLoaded && delegations && validators
        ? getInactiveDelegations(delegations, validators)
        : [],
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
  const { data: bondedValidators } = api.edge.staking.getValidators.useQuery({
    status: "Bonded",
  });
  const { data: stakingParams } = api.edge.staking.getStakingParams.useQuery();

  const maxValidators = stakingParams?.maxValidators;
  const isLoaded = Boolean(bondedValidators) && maxValidators !== undefined;

  const bondedTokens = useMemo(
    () => (bondedValidators ?? []).map(({ tokens }) => new Int(tokens)),
    [bondedValidators]
  );

  return useCallback(
    (validatorTokens: Int) =>
      isLoaded && maxValidators !== undefined
        ? getStakeToEnterActiveSet(validatorTokens, bondedTokens, maxValidators)
        : undefined,
    [isLoaded, bondedTokens, maxValidators]
  );
}
