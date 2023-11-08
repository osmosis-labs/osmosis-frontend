import { apiClient } from "~/utils/api-client";

import { ChainInfos } from "../../../../config/generated/chain-infos";

/** Params needed by frontend. There are more, so add them if needed. */
// Try: https://lcd-osmosis.keplr.app/osmosis/poolmanager/v1beta1/Params
export type PoolmanagerParamsResponse = {
  params: {
    taker_fee_params: {
      default_taker_fee: string;
      osmo_taker_fee_distribution: string;
      non_osmo_taker_fee_distribution: string;
      admin_addresses: string[];
      community_pool_denom_to_swap_non_whitelisted_assets_to: string;
    };
  };
};

export async function queryPoolmanagerParams(): Promise<PoolmanagerParamsResponse> {
  return await apiClient<PoolmanagerParamsResponse>(
    ChainInfos[0].rest + `osmosis/poolmanager/v1beta1/Params`
  );
}
