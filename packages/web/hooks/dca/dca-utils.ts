import { Dec, DecUtils } from "@osmosis-labs/unit";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";

import { DcaInterval, intervalToSeconds } from "~/config/dca";

export type PerExecErrorKey =
  | "errors.emptyAmount"
  | "errors.invalidNumberAmount"
  | "errors.zeroAmount";

export type TotalErrorKey =
  | "dca.totalRequired"
  | "errors.invalidNumberAmount"
  | "errors.zeroAmount"
  | "dca.totalLessThanPerExec"
  | "errors.insufficientBal";

/** Per-execution amount validation. Same rules as the swap-tool. */
export function validatePerExec(raw: string): PerExecErrorKey | undefined {
  if (!raw) return "errors.emptyAmount";
  if (!isValidNumericalRawInput(raw)) return "errors.invalidNumberAmount";
  if (new Dec(raw).lte(new Dec(0))) return "errors.zeroAmount";
  return undefined;
}

/** Total-deposit validation. Total must be a valid positive number, at least
 *  equal to the per-execution amount, and within the wallet balance. */
export function validateTotal(
  totalRaw: string,
  perExecRaw: string,
  balanceDec?: Dec
): TotalErrorKey | undefined {
  if (!totalRaw) return "dca.totalRequired";
  if (!isValidNumericalRawInput(totalRaw))
    return "errors.invalidNumberAmount";
  const total = new Dec(totalRaw);
  if (total.lte(new Dec(0))) return "errors.zeroAmount";
  if (
    perExecRaw &&
    isValidNumericalRawInput(perExecRaw) &&
    total.lt(new Dec(perExecRaw))
  )
    return "dca.totalLessThanPerExec";
  if (balanceDec && total.gt(balanceDec)) return "errors.insufficientBal";
  return undefined;
}

export interface ExecutionPlan {
  executionCount: number | undefined;
  durationLabel: string | undefined;
}

/** Given a per-execution amount, total deposit, and interval, returns how many
 *  executions the deposit covers and a human-readable duration label. Returns
 *  undefined fields when the inputs are incomplete or inconsistent. */
export function planExecutions(
  perExecRaw: string,
  totalRaw: string,
  interval: DcaInterval
): ExecutionPlan {
  const perExec = parseFloat(perExecRaw);
  const total = parseFloat(totalRaw);
  if (!perExec || !total || perExec <= 0 || total < perExec) {
    return { executionCount: undefined, durationLabel: undefined };
  }
  const count = Math.floor(total / perExec);
  const totalSeconds = count * intervalToSeconds(interval);
  const days = Math.round(totalSeconds / 86400);

  let durationLabel: string;
  if (days < 7) {
    durationLabel = `${days} day${days !== 1 ? "s" : ""}`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    durationLabel = `${weeks} week${weeks !== 1 ? "s" : ""}`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    durationLabel = `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    durationLabel = `${(days / 365).toFixed(1)} year${days / 365 >= 2 ? "s" : ""}`;
  }

  return { executionCount: count, durationLabel };
}

export interface CreateVaultMsgInputs {
  contractAddress: string;
  ownerAddress: string;
  sendDenom: string;
  sendDecimals: number;
  targetDenom: string;
  targetDecimals: number;
  amountRaw: string;
  totalRaw: string;
  slippageRaw: string;
  minReceiveRaw: string;
  interval: DcaInterval;
  startNow: boolean;
  startTimeUtc?: Date;
}

/** Builds the MsgExecuteContract payload for CALC's `create_vault` entry. All
 *  human-decimal inputs (amountRaw/totalRaw/minReceiveRaw) are converted to
 *  base-unit strings via the relevant token's `coinDecimals`. */
export function buildCreateVaultMsg(inputs: CreateVaultMsgInputs) {
  const {
    contractAddress,
    ownerAddress,
    sendDenom,
    sendDecimals,
    targetDenom,
    targetDecimals,
    amountRaw,
    totalRaw,
    slippageRaw,
    minReceiveRaw,
    interval,
    startNow,
    startTimeUtc,
  } = inputs;

  const swapAmountBaseUnits = DecUtils.getTenExponentN(sendDecimals)
    .mul(new Dec(amountRaw))
    .truncate()
    .toString();
  const totalBaseUnits = DecUtils.getTenExponentN(sendDecimals)
    .mul(new Dec(totalRaw))
    .truncate()
    .toString();

  const slippage = new Dec(slippageRaw);

  const startTime =
    !startNow && startTimeUtc
      ? Math.floor(startTimeUtc.getTime() / 1000).toString()
      : undefined;

  return {
    contractAddress,
    msg: {
      create_vault: {
        owner: ownerAddress,
        label: null as string | null,
        destinations: [
          { allocation: "1", address: ownerAddress, msg: null as null },
        ],
        target_denom: targetDenom,
        position_type: null as null,
        slippage_tolerance: slippage.toString(),
        minimum_receive_amount: minReceiveRaw
          ? DecUtils.getTenExponentN(targetDecimals)
              .mul(new Dec(minReceiveRaw))
              .truncate()
              .toString()
          : null,
        swap_amount: swapAmountBaseUnits,
        time_interval: interval,
        target_start_time_utc_seconds: startTime ?? null,
        performance_assessment_strategy: null as null,
        swap_adjustment_strategy: null as null,
      },
    },
    funds: [{ denom: sendDenom, amount: totalBaseUnits }],
  };
}
