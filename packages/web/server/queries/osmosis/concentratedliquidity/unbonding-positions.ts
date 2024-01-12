// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

import { LiquidityPosition } from "./positions-by-address";

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

export function queryCLUnbondingPositions({
  bech32Address,
}: {
  bech32Address: string;
}): Promise<AddressUnbondingPositionsResponse> {
  const url = new URL(
    `/osmosis/concentratedliquidity/v1beta1/user_unbonding_positions/${bech32Address}`,
    ChainList[0].apis.rest[0].address
  );

  return apiClient<AddressUnbondingPositionsResponse>(url.toString());
}
