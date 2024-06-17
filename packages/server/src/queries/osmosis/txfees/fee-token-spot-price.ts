import { createNodeQuery } from "../../create-node-query";

export const queryFeeTokenSpotPrice = createNodeQuery<
  {
    pool_id: string;
    spot_price: string;
  },
  { denom: string }
>({
  path: ({ denom }) =>
    `/osmosis/txfees/v1beta1/spot_price_by_denom?denom=${denom}`,
});
