import type { Staking } from "@osmosis-labs/keplr-stores";
import { Int } from "@osmosis-labs/unit";

import {
  getInactiveDelegations,
  getInactiveDelegationsToAlert,
  getInactiveValidatorAlertDismissalId,
  getRedelegationPreferenceUpdate,
  getTopThirdValidators,
  getValidatorRewardStatus,
  splitRedelegations,
} from "../inactive-delegations";

const DELEGATOR = "osmo1delegator";

const makeValidator = (
  operator_address: string,
  status: Staking.Validator["status"],
  jailed = false,
  tokens = "0",
  moniker: string | undefined = operator_address
) =>
  ({
    operator_address,
    status,
    jailed,
    tokens,
    description: { moniker },
  }) as Staking.Validator;

const makeDelegation = (validator_address: string, amount: string) =>
  ({
    delegation: {
      delegator_address: DELEGATOR,
      validator_address,
      shares: amount,
    },
    balance: { denom: "uosmo", amount },
  }) as Staking.Delegation;

describe("getValidatorRewardStatus", () => {
  it("treats bonded, unjailed validators as active", () => {
    expect(
      getValidatorRewardStatus(makeValidator("a", "BOND_STATUS_BONDED"))
    ).toBe("active");
  });

  it("treats unbonding validators as inactive, not only unbonded ones", () => {
    expect(
      getValidatorRewardStatus(makeValidator("a", "BOND_STATUS_UNBONDING"))
    ).toBe("inactive");
    expect(
      getValidatorRewardStatus(makeValidator("a", "BOND_STATUS_UNBONDED"))
    ).toBe("inactive");
  });

  it("reports jailed ahead of the bond status", () => {
    expect(
      getValidatorRewardStatus(
        makeValidator("a", "BOND_STATUS_UNBONDING", true)
      )
    ).toBe("jailed");
    expect(
      getValidatorRewardStatus(makeValidator("a", "BOND_STATUS_UNBONDED", true))
    ).toBe("jailed");
  });
});

describe("getInactiveDelegations", () => {
  const validators = [
    makeValidator("active", "BOND_STATUS_BONDED"),
    makeValidator("unbonding", "BOND_STATUS_UNBONDING"),
    makeValidator("jailed", "BOND_STATUS_UNBONDED", true, "0", "Jailed Val"),
    makeValidator("no-moniker", "BOND_STATUS_UNBONDED", false, "0", ""),
  ];

  it("returns only non-bonded delegations, largest first", () => {
    const result = getInactiveDelegations(
      [
        makeDelegation("active", "5000000"),
        makeDelegation("unbonding", "1000000"),
        makeDelegation("jailed", "9000000"),
      ],
      validators
    );

    expect(result.map(({ operatorAddress }) => operatorAddress)).toEqual([
      "jailed",
      "unbonding",
    ]);
    expect(result[0]).toMatchObject({
      moniker: "Jailed Val",
      status: "jailed",
    });
    expect(result[0].amount.toString()).toBe("9000000");
    expect(result[1].status).toBe("inactive");
  });

  it("skips delegations whose validator hasn't loaded and zero balances", () => {
    expect(
      getInactiveDelegations(
        [
          makeDelegation("missing", "1000000"),
          makeDelegation("unbonding", "0"),
        ],
        validators
      )
    ).toEqual([]);
  });

  it("falls back to the operator address when there is no moniker", () => {
    const [result] = getInactiveDelegations(
      [makeDelegation("no-moniker", "1")],
      validators
    );
    expect(result.moniker).toBe("no-moniker");
  });
});

describe("getTopThirdValidators", () => {
  it("includes each validator whose stake ranked above is short of one third", () => {
    // total 100, one third 33.3: a (0 above) and b (30 above) count, c (60 above) doesn't
    const result = getTopThirdValidators([
      { operator_address: "c", tokens: "20" },
      { operator_address: "a", tokens: "30" },
      { operator_address: "d", tokens: "20" },
      { operator_address: "b", tokens: "30" },
    ]);
    expect([...result]).toEqual(["a", "b"]);
  });

  it("stops after a single validator that holds a third on its own", () => {
    const result = getTopThirdValidators([
      { operator_address: "a", tokens: "20" },
      { operator_address: "b", tokens: "40" },
      { operator_address: "c", tokens: "20" },
      { operator_address: "d", tokens: "20" },
    ]);
    expect([...result]).toEqual(["b"]);
  });

  it("returns nothing when there is no stake", () => {
    expect(getTopThirdValidators([]).size).toBe(0);
  });
});

describe("splitRedelegations", () => {
  it("splits evenly and hands the remainder to the first destinations", () => {
    const result = splitRedelegations(
      [{ operatorAddress: "jailed", amount: new Int(10) }],
      ["a", "b", "c"]
    );

    expect(result).toEqual([
      { validatorSrcAddress: "jailed", validatorDstAddress: "a", amount: "4" },
      { validatorSrcAddress: "jailed", validatorDstAddress: "b", amount: "3" },
      { validatorSrcAddress: "jailed", validatorDstAddress: "c", amount: "3" },
    ]);
  });

  it("moves the full amount and drops pairs that would move nothing", () => {
    const result = splitRedelegations(
      [{ operatorAddress: "jailed", amount: new Int(2) }],
      ["a", "b", "c"]
    );

    expect(result).toEqual([
      { validatorSrcAddress: "jailed", validatorDstAddress: "a", amount: "1" },
      { validatorSrcAddress: "jailed", validatorDstAddress: "b", amount: "1" },
    ]);
  });

  it("never redelegates a source to itself", () => {
    const result = splitRedelegations(
      [
        { operatorAddress: "x", amount: new Int(6) },
        { operatorAddress: "y", amount: new Int(5) },
      ],
      ["x", "a"]
    );

    expect(result).toEqual([
      { validatorSrcAddress: "x", validatorDstAddress: "a", amount: "6" },
      { validatorSrcAddress: "y", validatorDstAddress: "x", amount: "3" },
      { validatorSrcAddress: "y", validatorDstAddress: "a", amount: "2" },
    ]);
  });
});

describe("getRedelegationPreferenceUpdate", () => {
  it("leaves the preference unset when the user has none", () => {
    expect(getRedelegationPreferenceUpdate([], ["a", "b"])).toBeUndefined();
  });

  it("replaces a stored preference when the validators change", () => {
    expect(
      getRedelegationPreferenceUpdate(["jailed", "a"], ["a", "b"])
    ).toEqual(["a", "b"]);
  });

  it("keeps a stored preference with the same validators", () => {
    expect(
      getRedelegationPreferenceUpdate(["b", "a"], ["a", "b"])
    ).toBeUndefined();
  });
});

describe("getInactiveDelegationsToAlert", () => {
  const oneOsmo = new Int(1_000_000);
  const inactive = [
    {
      operatorAddress: "jailed",
      moniker: "Jailed",
      status: "jailed" as const,
      amount: new Int(5_000_000),
    },
    {
      operatorAddress: "dust",
      moniker: "Dust",
      status: "inactive" as const,
      amount: new Int(999_999),
    },
    {
      operatorAddress: "exact",
      moniker: "Exact",
      status: "inactive" as const,
      amount: new Int(1_000_000),
    },
  ];

  it("skips delegations under the threshold", () => {
    expect(
      getInactiveDelegationsToAlert(inactive, DELEGATOR, [], oneOsmo).map(
        ({ operatorAddress }) => operatorAddress
      )
    ).toEqual(["jailed", "exact"]);
  });

  it("skips validators this wallet dismissed, but not another wallet's", () => {
    const dismissed = [
      getInactiveValidatorAlertDismissalId(DELEGATOR, "jailed"),
      getInactiveValidatorAlertDismissalId("osmo1other", "exact"),
    ];

    expect(
      getInactiveDelegationsToAlert(
        inactive,
        DELEGATOR,
        dismissed,
        oneOsmo
      ).map(({ operatorAddress }) => operatorAddress)
    ).toEqual(["exact"]);
  });

  it("keys dismissals by wallet and validator", () => {
    expect(
      getInactiveValidatorAlertDismissalId("osmo1a", "osmovaloper1b")
    ).toBe("osmo1a/osmovaloper1b");
  });
});
