import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";

/** Non OSMO gauge. */
export type ExternalGauge = {
  id: string;
  duration: Duration;
  rewardAmount?: CoinPretty;
  remainingEpochs: number;
};

export type BondDuration = {
  duration: Duration;
  /** Bondable if there's any active gauges for this duration. */
  bondable: boolean;
  userShares: CoinPretty;
  userLockedShareValue: PricePretty;
  userUnlockingShares?: { shares: CoinPretty; endTime?: Date };
  aggregateApr: RatePretty;
  swapFeeApr: RatePretty;
  swapFeeDailyReward: PricePretty;
  incentivesBreakdown: {
    dailyPoolReward: CoinPretty;
    apr: RatePretty;
    numDaysRemaining?: number;
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
