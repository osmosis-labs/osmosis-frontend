import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface SuperfluidAllAssets {
  assets: [
    {
      denom: string;
      asset_type: string;
    }
  ];
}

export function queryAllSuperfluidAssets(): Promise<SuperfluidAllAssets> {
  const url = new URL(
    "/osmosis/superfluid/v1beta1/all_assets",
    ChainList[0].apis.rest[0].address
  );
  return apiClient<SuperfluidAllAssets>(url.toString());
}
