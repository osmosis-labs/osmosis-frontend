// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { createNodeQuery } from "~/server/queries/base-utils";

import { LiquidityPosition } from "./account-positions";

interface PeriodLock {
  ID: string;
  owner: string;
  duration: string;
  /** UTC */
  end_time: string;
  coins: {
    denom: string;
    amount: string;
  }[];
}

interface PositionWithPeriodLock {
  position: LiquidityPosition["position"];
  locks: PeriodLock;
}

interface AddressUnbondingPositionsResponse {
  positions_with_period_lock: PositionWithPeriodLock[];
}

export const queryCLUnbondingPositions = createNodeQuery<
  AddressUnbondingPositionsResponse,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/concentratedliquidity/v1beta1/user_unbonding_positions/${bech32Address}`,
});
