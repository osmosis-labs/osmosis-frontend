import { Dec } from "@osmosis-labs/unit";

import { intervalToSeconds } from "~/config/dca";
import {
  buildCreateVaultMsg,
  planExecutions,
  validatePerExec,
  validateTotal,
} from "~/hooks/dca/dca-utils";

describe("intervalToSeconds", () => {
  it("maps the standard intervals to their canonical seconds", () => {
    expect(intervalToSeconds("Hourly")).toBe(3600);
    expect(intervalToSeconds("HalfDaily")).toBe(4 * 3600);
    expect(intervalToSeconds("Daily")).toBe(86400);
    expect(intervalToSeconds("Weekly")).toBe(7 * 86400);
    expect(intervalToSeconds("Fortnightly")).toBe(14 * 86400);
    expect(intervalToSeconds("Monthly")).toBe(30 * 86400);
  });

  it("returns the custom seconds value as-is", () => {
    expect(intervalToSeconds({ Custom: { seconds: 2 } })).toBe(2);
    expect(intervalToSeconds({ Custom: { seconds: 300 } })).toBe(300);
    expect(intervalToSeconds({ Custom: { seconds: 123456 } })).toBe(123456);
  });
});

describe("validatePerExec", () => {
  it("flags empty input", () => {
    expect(validatePerExec("")).toBe("errors.emptyAmount");
  });

  it("flags non-numeric input", () => {
    expect(validatePerExec("abc")).toBe("errors.invalidNumberAmount");
    expect(validatePerExec("1.2.3")).toBe("errors.invalidNumberAmount");
  });

  it("flags zero and negative", () => {
    expect(validatePerExec("0")).toBe("errors.zeroAmount");
    expect(validatePerExec("0.0")).toBe("errors.zeroAmount");
  });

  it("accepts valid positive amounts", () => {
    expect(validatePerExec("1")).toBeUndefined();
    expect(validatePerExec("0.000001")).toBeUndefined();
    expect(validatePerExec("100.5")).toBeUndefined();
  });
});

describe("validateTotal", () => {
  it("flags empty total with totalRequired (not the swap empty key)", () => {
    expect(validateTotal("", "10")).toBe("dca.totalRequired");
  });

  it("flags non-numeric total", () => {
    expect(validateTotal("xyz", "10")).toBe("errors.invalidNumberAmount");
  });

  it("flags zero total", () => {
    expect(validateTotal("0", "10")).toBe("errors.zeroAmount");
  });

  it("flags total less than per-exec amount", () => {
    expect(validateTotal("5", "10")).toBe("dca.totalLessThanPerExec");
  });

  it("does NOT cross-validate per-exec when per-exec is itself invalid", () => {
    // If per-exec is empty/garbage, we don't fail total with totalLessThanPerExec.
    // The user will see the per-exec error separately.
    expect(validateTotal("100", "")).toBeUndefined();
    expect(validateTotal("100", "abc")).toBeUndefined();
  });

  it("flags total exceeding the wallet balance", () => {
    const balance = new Dec("50");
    expect(validateTotal("100", "10", balance)).toBe("errors.insufficientBal");
  });

  it("accepts total exactly equal to balance", () => {
    const balance = new Dec("100");
    expect(validateTotal("100", "10", balance)).toBeUndefined();
  });

  it("accepts when no balance is supplied (unconnected wallet path)", () => {
    expect(validateTotal("1000000", "10")).toBeUndefined();
  });

  it("accepts total equal to per-exec (single-execution vault)", () => {
    expect(validateTotal("10", "10")).toBeUndefined();
  });
});

describe("planExecutions", () => {
  it("returns undefined fields for incomplete or inconsistent inputs", () => {
    expect(planExecutions("", "100", "Daily")).toEqual({
      executionCount: undefined,
      durationLabel: undefined,
    });
    expect(planExecutions("10", "", "Daily")).toEqual({
      executionCount: undefined,
      durationLabel: undefined,
    });
    expect(planExecutions("10", "5", "Daily")).toEqual({
      executionCount: undefined,
      durationLabel: undefined,
    });
    expect(planExecutions("0", "100", "Daily")).toEqual({
      executionCount: undefined,
      durationLabel: undefined,
    });
  });

  it("floors fractional execution counts", () => {
    // 25 / 10 = 2.5 -> 2 executions
    expect(planExecutions("10", "25", "Daily").executionCount).toBe(2);
  });

  it("labels durations under a week in days", () => {
    expect(planExecutions("10", "30", "Daily").durationLabel).toBe("3 days");
    expect(planExecutions("10", "10", "Daily").durationLabel).toBe("1 day");
  });

  it("labels durations from a week to a month in weeks", () => {
    // 14 days = 2 weeks
    expect(planExecutions("10", "140", "Daily").durationLabel).toBe("2 weeks");
  });

  it("labels durations from a month to a year in months", () => {
    // 60 days -> ~2 months
    expect(planExecutions("10", "600", "Daily").durationLabel).toBe("2 months");
  });

  it("labels multi-year durations with one decimal", () => {
    // 730 days = ~2.0 years
    const plan = planExecutions("10", "7300", "Daily");
    expect(plan.durationLabel).toBe("2.0 years");
  });

  it("respects the interval when computing duration", () => {
    // 10 executions hourly = 10 hours total -> rounds to 0 days
    const plan = planExecutions("10", "100", "Hourly");
    expect(plan.executionCount).toBe(10);
    expect(plan.durationLabel).toBe("0 days");
  });
});

describe("buildCreateVaultMsg", () => {
  const baseInputs = {
    contractAddress: "osmo1contract",
    ownerAddress: "osmo1owner",
    sendDenom: "ibc/USDC",
    sendDecimals: 6,
    targetDenom: "uosmo",
    targetDecimals: 6,
    amountRaw: "10",
    totalRaw: "100",
    slippageRaw: "0.01",
    minReceiveRaw: "",
    interval: "Daily" as const,
    startNow: true,
    startTimeUtc: undefined,
  };

  it("converts the per-execution amount and total deposit to base units", () => {
    const msg = buildCreateVaultMsg(baseInputs);
    expect(msg.msg.create_vault.swap_amount).toBe("10000000"); // 10 * 10^6
    expect(msg.funds).toEqual([
      { denom: "ibc/USDC", amount: "100000000" }, // 100 * 10^6
    ]);
  });

  it("honors the send-token's decimals (e.g. 18 for ETH-like)", () => {
    const msg = buildCreateVaultMsg({ ...baseInputs, sendDecimals: 18 });
    expect(msg.msg.create_vault.swap_amount).toBe("10000000000000000000");
  });

  it("defaults destinations to a single 100% allocation to the owner", () => {
    const msg = buildCreateVaultMsg(baseInputs);
    expect(msg.msg.create_vault.destinations).toEqual([
      { allocation: "1", address: "osmo1owner", msg: null },
    ]);
  });

  it("sends null minimum_receive_amount when no min-receive is set", () => {
    const msg = buildCreateVaultMsg(baseInputs);
    expect(msg.msg.create_vault.minimum_receive_amount).toBeNull();
  });

  it("converts a non-empty min-receive using the target token's decimals", () => {
    const msg = buildCreateVaultMsg({
      ...baseInputs,
      minReceiveRaw: "5",
      targetDecimals: 6,
    });
    expect(msg.msg.create_vault.minimum_receive_amount).toBe("5000000");
  });

  it("includes the target denom and time interval verbatim", () => {
    const msg = buildCreateVaultMsg({ ...baseInputs, interval: "Weekly" });
    expect(msg.msg.create_vault.target_denom).toBe("uosmo");
    expect(msg.msg.create_vault.time_interval).toBe("Weekly");
  });

  it("passes custom-interval seconds through unchanged", () => {
    const msg = buildCreateVaultMsg({
      ...baseInputs,
      interval: { Custom: { seconds: 300 } },
    });
    expect(msg.msg.create_vault.time_interval).toEqual({
      Custom: { seconds: 300 },
    });
  });

  it("formats slippage tolerance as a decimal string", () => {
    const msg = buildCreateVaultMsg({ ...baseInputs, slippageRaw: "0.005" });
    expect(msg.msg.create_vault.slippage_tolerance).toBe("0.005000000000000000");
  });

  it("sends null start time when startNow is true", () => {
    const msg = buildCreateVaultMsg({
      ...baseInputs,
      startNow: true,
      startTimeUtc: new Date("2026-12-31T00:00:00Z"),
    });
    expect(msg.msg.create_vault.target_start_time_utc_seconds).toBeNull();
  });

  it("encodes scheduled start time as unix seconds when startNow is false", () => {
    const startTimeUtc = new Date("2026-06-01T12:00:00Z");
    const msg = buildCreateVaultMsg({
      ...baseInputs,
      startNow: false,
      startTimeUtc,
    });
    expect(msg.msg.create_vault.target_start_time_utc_seconds).toBe(
      Math.floor(startTimeUtc.getTime() / 1000).toString()
    );
  });

  it("truncates (not rounds) base-unit conversions to avoid sending more than the user typed", () => {
    // 0.0000019 USDC at 6 decimals = 1.9 base units -> truncate to 1
    const msg = buildCreateVaultMsg({
      ...baseInputs,
      amountRaw: "0.0000019",
      totalRaw: "1",
    });
    expect(msg.msg.create_vault.swap_amount).toBe("1");
  });

  it("preserves the contract address in the result", () => {
    const msg = buildCreateVaultMsg(baseInputs);
    expect(msg.contractAddress).toBe("osmo1contract");
  });
});
