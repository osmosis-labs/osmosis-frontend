import { createNodeQuery } from "~/server/queries/base-utils";

export const queryOsmosisGasPrice = createNodeQuery<{
  base_fee: string;
}>({
  path: "/osmosis/txfees/v1beta1/cur_eip_base_fee",
});
