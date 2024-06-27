import { createNodeQuery } from "../../create-node-query";

interface SuperfluidAllAssets {
  assets: [
    {
      denom: string;
      asset_type: string;
    }
  ];
}

export const queryAllSuperfluidAssets = createNodeQuery<SuperfluidAllAssets>({
  path: "/osmosis/superfluid/v1beta1/all_assets",
});
