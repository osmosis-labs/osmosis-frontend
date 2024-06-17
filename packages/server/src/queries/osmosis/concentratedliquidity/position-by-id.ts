import { LiquidityPosition } from "../../../queries/osmosis/concentratedliquidity/account-positions";
import { createNodeQuery } from "../../create-node-query";

export const queryPositionById = createNodeQuery<
  {
    position: LiquidityPosition;
  },
  { id: string }
>({
  path: ({ id }) =>
    `/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${id}`,
});
