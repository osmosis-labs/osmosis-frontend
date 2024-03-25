import { createNodeQuery } from "../../base-utils";

export const queryFeeTokens = createNodeQuery<{
  fee_tokens: { denom: string; poolID: number }[];
}>({
  path: "/osmosis/txfees/v1beta1/fee_tokens",
});
