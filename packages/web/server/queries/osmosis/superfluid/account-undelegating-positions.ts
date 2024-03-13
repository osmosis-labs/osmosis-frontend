import { createNodeQuery } from "~/server/queries/base-utils";

import { ConcentratedPoolAccountPositionRecord } from "./types";

interface SyntheticLock {
  duration: string;
  end_time: string;
  synth_denom: string;
  underlying_lock_id: string;
}

type AccountUndelegatingClPositionsResponse = {
  cl_pool_user_position_records: (ConcentratedPoolAccountPositionRecord & {
    synthetic_lock: SyntheticLock;
  })[];
};

export const queryAccountUndelegatingPositions = createNodeQuery<
  AccountUndelegatingClPositionsResponse,
  { bech32Address: string }
>({
  path: ({ bech32Address }) =>
    `/osmosis/superfluid/v1beta1/account_undelegating_cl_positions/${bech32Address}`,
});
