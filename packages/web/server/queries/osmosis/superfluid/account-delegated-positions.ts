import { createNodeQuery } from "~/server/queries/base-utils";

import { ConcentratedPoolAccountPositionRecord } from "./types";

export interface AccountDelegatedClPositionsResponse {
  cl_pool_user_position_records: ConcentratedPoolAccountPositionRecord[];
}

export const queryAccountDelegatedPositions = createNodeQuery<
  AccountDelegatedClPositionsResponse,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/superfluid/v1beta1/account_delegated_cl_positions/${bech32Address}`,
});
