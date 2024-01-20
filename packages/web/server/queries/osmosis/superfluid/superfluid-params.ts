import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

export type SuperfluidParams = {
  params: {
    minimum_risk_factor: string;
  };
};

export async function querySuperfluidParams(): Promise<SuperfluidParams> {
  const url = new URL(
    "/osmosis/superfluid/v1beta1/params",
    ChainList[0].apis.rest[0].address
  );
  return apiClient<SuperfluidParams>(url.toString());
}
