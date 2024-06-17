import { createNodeQuery } from "../../create-node-query";

export const queryFeesBaseDenom = createNodeQuery<{ base_denom: string }>({
  path: "/osmosis/txfees/v1beta1/base_denom",
});
