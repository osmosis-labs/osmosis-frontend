import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";

/** Non OSMO gauge. */
export type ExternalSharesGauge = {
  id: string;
  duration: Duration;
  rewardAmount?: CoinPretty;
  remainingEpochs: number;
};

/** Bond duration that corresponds to locked pool shares. */
export type BondDuration = {
  duration: Duration;
  /** Bondable if there's any active gauges for this duration. */
  bondable: boolean;
  userShares: CoinPretty;
  userLockedShareValue: PricePretty;
  userUnlockingShares?: { shares: CoinPretty; endTime?: Date };
  aggregateApr: RatePretty;
  swapFeeApr: RatePretty;
  incentivesBreakdown: {
    apr: RatePretty;
    type: "osmosis" | "boost" | "swapFees";
  }[];
  /** Both `delegated` and `undelegating` will be `undefined` if the user may "Go superfluid". */
  superfluid?: {
    /** Duration users can bond to for superfluid participation. Assumed to be longest duration on lock durations chain param. */
    duration: Duration;
    apr: RatePretty;
    commission?: RatePretty;
    validatorMoniker?: string;
    validatorLogoUrl?: string;
    delegated?: CoinPretty;
    undelegating?: CoinPretty;
  };
};
