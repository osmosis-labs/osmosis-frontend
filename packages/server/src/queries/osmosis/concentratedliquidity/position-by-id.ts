import { createNodeQuery } from "../../../queries/base-utils";
import { LiquidityPosition } from "../../../queries/osmosis/concentratedliquidity/account-positions";

export const queryPositionById = createNodeQuery<
  {
    position: LiquidityPosition;
  },
  { id: string }
>({
  path: ({ id }) =>
    `/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${id}`,
});
