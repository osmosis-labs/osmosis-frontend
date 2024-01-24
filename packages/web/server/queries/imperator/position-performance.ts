import { apiClient } from "@osmosis-labs/utils";

import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from ".";

interface Asset {
  denom: string;
  amount: number;
  value: number;
}

interface Position {
  pool_id: number;
  position_id: number;
  lower_tick: number;
  upper_tick: number;
}

interface PrincipalAction {
  action: string;
  address: string;
  tx_hash: string;
  block: number;
  tx_time: string;
  value: number;
  position: Position;
  assets: Asset[];
}

interface CoinPrimitive {
  denom: string;
  amount: string;
}

interface PositionPerformance {
  total_spread_rewards: CoinPrimitive[];
  total_incentives_rewards: CoinPrimitive[];
  total_forfeit_rewards: CoinPrimitive[];
  principal: PrincipalAction;
}

export async function queryPositionPerformance({
  positionId,
}: {
  positionId: string;
}): Promise<PositionPerformance> {
  const url = new URL(
    `/cl/v1/position/last/id/${positionId}`,
    IMPERATOR_INDEXER_DEFAULT_BASEURL
  );

  return await apiClient<PositionPerformance>(url.toString());
}
