import type { Staking } from "@osmosis-labs/keplr-stores";
import { Dec, Int } from "@osmosis-labs/unit";

/** Why a delegation has stopped earning rewards, or "active" if it hasn't. */
export type ValidatorRewardStatus = "active" | "inactive" | "jailed";

export type InactiveDelegation = {
  operatorAddress: string;
  moniker: string;
  status: Exclude<ValidatorRewardStatus, "active">;
  /** Delegated amount in the staking denom's minimal units. */
  amount: Int;
  /** The validator's total stake, in minimal units. */
  validatorTokens?: Int;
};

/**
 * Rewards stop as soon as a validator leaves the bonded set, so anything not
 * BONDED counts, including the 14-day UNBONDING window. Jailed validators are
 * also not bonded, but get their own status so the UI can say why.
 */
export function getValidatorRewardStatus(
  validator: Pick<Staking.Validator, "status" | "jailed">
): ValidatorRewardStatus {
  if (validator.jailed) return "jailed";
  if (validator.status !== "BOND_STATUS_BONDED") return "inactive";
  return "active";
}

/**
 * The delegator's delegations that point at a validator outside the active
 * set. A delegation whose validator is missing from `delegatorValidators` is
 * skipped rather than guessed at, since the two queries can briefly disagree
 * while one of them refreshes.
 */
export function getInactiveDelegations(
  delegations: Staking.Delegation[],
  delegatorValidators: Staking.Validator[]
): InactiveDelegation[] {
  const validatorsByAddress = new Map(
    delegatorValidators.map((validator) => [
      validator.operator_address,
      validator,
    ])
  );

  const inactiveDelegations: InactiveDelegation[] = [];

  for (const delegation of delegations) {
    const operatorAddress = delegation.delegation.validator_address;
    const validator = validatorsByAddress.get(operatorAddress);
    if (!validator) continue;

    const status = getValidatorRewardStatus(validator);
    if (status === "active") continue;

    const amount = new Int(delegation.balance.amount);
    if (amount.isZero()) continue;

    inactiveDelegations.push({
      operatorAddress,
      moniker: validator.description.moniker || operatorAddress,
      status,
      amount,
      validatorTokens: new Int(validator.tokens),
    });
  }

  return inactiveDelegations.sort((a, b) =>
    a.amount.gt(b.amount) ? -1 : a.amount.lt(b.amount) ? 1 : 0
  );
}

/**
 * Operator addresses of the largest bonded validators that together hold the
 * first third of bonded stake: each validator counts if the stake ranked above
 * it is still short of one third. These are the validators that could halt the
 * chain together, so the squad picker steers new stake away from them.
 */
export function getTopThirdValidators(
  bondedValidators: Pick<Staking.Validator, "operator_address" | "tokens">[]
): Set<string> {
  const sorted = [...bondedValidators].sort((a, b) => {
    const aTokens = new Dec(a.tokens);
    const bTokens = new Dec(b.tokens);
    return aTokens.gt(bTokens) ? -1 : aTokens.lt(bTokens) ? 1 : 0;
  });

  const totalTokens = sorted.reduce(
    (acc, validator) => acc.add(new Dec(validator.tokens)),
    new Dec(0)
  );

  const topThird = new Set<string>();
  if (totalTokens.isZero()) return topThird;

  const oneThird = totalTokens.quo(new Dec(3));
  let stakeAbove = new Dec(0);

  for (const validator of sorted) {
    if (stakeAbove.gte(oneThird)) break;
    topThird.add(validator.operator_address);
    stakeAbove = stakeAbove.add(new Dec(validator.tokens));
  }

  return topThird;
}

/**
 * Stake (minimal units) an unjailed validator outside the active set still
 * needs to rank into it: the set holds the top `maxValidators` by stake,
 * re-sorted every block, so it has to pass the smallest validator that would
 * stay in. Zero when the set has a free slot. A live estimate: the cutoff
 * moves with every delegation.
 */
export function getStakeToEnterActiveSet(
  validatorTokens: Int,
  bondedTokens: Int[],
  maxValidators: number
): Int {
  if (bondedTokens.length < maxValidators) return new Int(0);

  const sorted = [...bondedTokens].sort((a, b) =>
    a.gt(b) ? -1 : a.lt(b) ? 1 : 0
  );
  const cutoff = sorted[maxValidators - 1];
  const needed = cutoff.sub(validatorTokens);
  return needed.isPositive() ? needed : new Int(0);
}

export type Redelegation = {
  validatorSrcAddress: string;
  validatorDstAddress: string;
  /** Amount in the staking denom's minimal units. */
  amount: string;
};

/**
 * Splits each source delegation evenly across the destinations, one
 * MsgBeginRedelegate per source and destination pair. The integer remainder
 * goes to the first destinations so the full delegation moves, and pairs that
 * would move nothing are dropped. A destination equal to the source is skipped.
 */
export function splitRedelegations(
  sources: Pick<InactiveDelegation, "operatorAddress" | "amount">[],
  destinations: string[]
): Redelegation[] {
  const redelegations: Redelegation[] = [];

  for (const source of sources) {
    const targets = destinations.filter(
      (destination) => destination !== source.operatorAddress
    );
    if (!targets.length) continue;

    const count = new Int(targets.length);
    const share = source.amount.div(count);
    const remainder = source.amount.sub(share.mul(count));

    targets.forEach((destination, index) => {
      const amount = new Int(index).lt(remainder)
        ? share.add(new Int(1))
        : share;
      if (amount.isZero()) return;

      redelegations.push({
        validatorSrcAddress: source.operatorAddress,
        validatorDstAddress: destination,
        amount: amount.toString(),
      });
    });
  }

  return redelegations;
}

/**
 * The validator set preference to send alongside a redelegation, or undefined
 * to leave the stored preference alone.
 *
 * Without a stored preference the chain falls back to the user's delegations,
 * which drop the inactive validators once their stake moves, so nothing needs
 * setting (and skipping it keeps the tx signable by amino-only wallets, since
 * MsgSetValidatorSetPreference forces direct signing). With a stored preference
 * it is replaced only when the validators change: the chain rejects an
 * identical preference, and an unchanged list may carry custom weights.
 */
export function getRedelegationPreferenceUpdate(
  currentPreference: string[],
  selectedValidators: string[]
): string[] | undefined {
  if (!currentPreference.length) return;

  const current = new Set(currentPreference);
  const selected = new Set(selectedValidators);
  const isSameSet =
    current.size === selected.size &&
    [...selected].every((validator) => current.has(validator));

  return isSameSet ? undefined : [...selected];
}

export const InactiveValidatorAlertDismissedKey =
  "inactive-validator-alert-dismissed";

/** Dismissals are stored per wallet and validator, so a validator that becomes
 *  inactive later (or another wallet's) still raises the alert. */
export function getInactiveValidatorAlertDismissalId(
  delegatorAddress: string,
  operatorAddress: string
): string {
  return `${delegatorAddress}/${operatorAddress}`;
}

/** Jailed delegations at or above `minAmount` that this wallet hasn't
 *  dismissed the alert for. Validators merely outside the active set may be
 *  working their way back in, so they're only flagged on the stake page. */
export function getInactiveDelegationsToAlert(
  inactiveDelegations: InactiveDelegation[],
  delegatorAddress: string,
  dismissedIds: string[],
  minAmount: Int
): InactiveDelegation[] {
  const dismissed = new Set(dismissedIds);

  return inactiveDelegations.filter(
    ({ operatorAddress, amount, status }) =>
      status === "jailed" &&
      amount.gte(minAmount) &&
      !dismissed.has(
        getInactiveValidatorAlertDismissalId(delegatorAddress, operatorAddress)
      )
  );
}

/**
 * The validators preselected when redelegating off inactive validators: the
 * stored preference if there is one, else the validators the user delegates
 * at least `minDelegation` to (a leftover dust delegation isn't a validator the
 * user still means to back, so it shouldn't get an even share). Either way,
 * kept only where the squad picker shows a selectable row. Anything else
 * (inactive, or hidden from the picker for missing a moniker or charging over
 * the commission cap) would receive stake the user can't see or deselect.
 */
export function getRedelegationDefaultSelection({
  preference,
  delegatedValidators,
  minDelegation,
  selectableValidators,
}: {
  preference: string[];
  delegatedValidators: { operatorAddress: string; amount: Int }[];
  minDelegation: Int;
  selectableValidators: Set<string>;
}): string[] {
  const squad = preference.length
    ? preference
    : delegatedValidators
        .filter(({ amount }) => amount.gte(minDelegation))
        .map(({ operatorAddress }) => operatorAddress);
  return squad.filter((address) => selectableValidators.has(address));
}
