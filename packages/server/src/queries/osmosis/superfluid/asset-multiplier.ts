import { createNodeQuery } from "../../create-node-query";

export type SuperfluidAssetMultiplier = {
  osmo_equivalent_multiplier: {
    // Int
    epoch_number: string;
    denom: string;
    // Dec
    multiplier: string;
  };
};

export const querySuperfluidAssetMultiplier = createNodeQuery<
  SuperfluidAssetMultiplier,
  { denom: string }
>({
  path: ({ denom }) =>
    `/osmosis/superfluid/v1beta1/asset_multiplier?denom=${denom}`,
});
