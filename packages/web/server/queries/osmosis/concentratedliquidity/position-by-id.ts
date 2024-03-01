import { createNodeQuery } from "~/server/queries/base-utils";
import { LiquidityPosition } from "~/server/queries/osmosis/concentratedliquidity/account-positions";

export const queryCLPosition = createNodeQuery<
  {
    position: LiquidityPosition;
  },
  { id: string }
>({
  path: ({ id }) =>
    `/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${id}`,
});
