import { DCA_CONTRACT_ADDRESS } from "~/config/env";

// CALC Finance DCA contract, mainnet (Proposal 515, AGPL-3.0). The env var lets
// staging/testnet override; otherwise we fall through to the mainnet deployment.
export const DCA_CONTRACT =
  DCA_CONTRACT_ADDRESS ??
  "osmo1zacxlu90sl6j2zf90uctpddhfmux84ryrw794ywnlcwx2zeh5a4q67qtc9";

export type DcaInterval =
  | "Hourly"
  | "HalfDaily"
  | "Daily"
  | "Weekly"
  | "Fortnightly"
  | "Monthly"
  | { Custom: { seconds: number } };

export interface DcaIntervalOption {
  label: string;
  value: DcaInterval;
  /** Cadences below Hourly may not be reliably triggered by current keepers
   *  (per-execution automation_fee may not cover gas at that frequency).
   *  Gated behind the dcaSubHourly flag until keeper coverage is verified. */
  subHourly?: boolean;
}

export const DCA_INTERVAL_OPTIONS: DcaIntervalOption[] = [
  {
    label: "dca.interval.streaming",
    value: { Custom: { seconds: 2 } },
    subHourly: true,
  },
  {
    label: "dca.interval.every5Min",
    value: { Custom: { seconds: 300 } },
    subHourly: true,
  },
  { label: "dca.interval.hourly", value: "Hourly" },
  { label: "dca.interval.every4Hours", value: "HalfDaily" },
  { label: "dca.interval.daily", value: "Daily" },
  { label: "dca.interval.weekly", value: "Weekly" },
  { label: "dca.interval.monthly", value: "Monthly" },
];

export const DEFAULT_DCA_SLIPPAGE = "0.01";
export const DEFAULT_DCA_INTERVAL: DcaInterval = "Daily";

const NAMED_INTERVAL_SECONDS: Record<
  Exclude<DcaInterval, { Custom: { seconds: number } }>,
  number
> = {
  Hourly: 3600,
  HalfDaily: 4 * 3600,
  Daily: 86400,
  Weekly: 7 * 86400,
  Fortnightly: 14 * 86400,
  Monthly: 30 * 86400,
};

export function intervalToSeconds(interval: DcaInterval): number {
  if (typeof interval === "string") {
    return NAMED_INTERVAL_SECONDS[interval];
  }
  return interval.Custom.seconds;
}
