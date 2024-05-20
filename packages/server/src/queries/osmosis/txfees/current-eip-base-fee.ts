import { createNodeQuery } from "../../create-node-query";

/** Currently an Osmosis-specific feature, but could be queried from
 *  a common cosmos fee module, like Skip's Fee Market module.
 */
export const queryGasPrice = createNodeQuery<{
  base_fee: string;
}>({
  path: "/osmosis/txfees/v1beta1/cur_eip_base_fee",
});
