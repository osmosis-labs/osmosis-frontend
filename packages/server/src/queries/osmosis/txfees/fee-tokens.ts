import { createNodeQuery } from "../../create-node-query";

export const queryFeeTokens = createNodeQuery<{
  fee_tokens: { denom: string; poolID: number }[];
}>({
  path: "/osmosis/txfees/v1beta1/fee_tokens",
});
