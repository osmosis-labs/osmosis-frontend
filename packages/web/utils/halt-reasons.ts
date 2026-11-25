import type { TranslationPath } from "~/hooks/language/types";

type DepositHaltReason =
  | "bridge_down"
  | "extended_unstable_market"
  | "planned_shutdown"
  | "source_chain_killed"
  | "manual";

type WithdrawalHaltReason = "bridge_down" | "source_chain_killed" | "manual";

type UnstableReason =
  | "ibc_client"
  | "source_chain_killed"
  | "market"
  | "manual";

/** Map a deposit-halt enum reason to its localisation key.
 *  Switch-case ensures every key is a literal string in source so the
 *  localizations.spec.ts dead-key check passes. */
export function depositHaltReasonKey(
  reason: DepositHaltReason | string | undefined
): TranslationPath {
  switch (reason) {
    case "bridge_down":
      return "halt.deposit.bridge_down";
    case "extended_unstable_market":
      return "halt.deposit.extended_unstable_market";
    case "planned_shutdown":
      return "halt.deposit.planned_shutdown";
    case "source_chain_killed":
      return "halt.deposit.source_chain_killed";
    case "manual":
      return "halt.deposit.manual";
    default:
      return "halt.deposit.unknown";
  }
}

export function withdrawalHaltReasonKey(
  reason: WithdrawalHaltReason | string | undefined
): TranslationPath {
  switch (reason) {
    case "bridge_down":
      return "halt.withdrawal.bridge_down";
    case "source_chain_killed":
      return "halt.withdrawal.source_chain_killed";
    case "manual":
      return "halt.withdrawal.manual";
    default:
      return "halt.withdrawal.unknown";
  }
}

export function unstableReasonKey(
  reason: UnstableReason | string | undefined
): TranslationPath {
  switch (reason) {
    case "ibc_client":
      return "unstable.ibc_client";
    case "source_chain_killed":
      return "unstable.source_chain_killed";
    case "market":
      return "unstable.market";
    case "manual":
      return "unstable.manual";
    default:
      return "unstable.unknown";
  }
}
