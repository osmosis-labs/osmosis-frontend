//@ts-nocheck
import { MsgCreateBalancerPool } from "./tx";
export const AminoConverter = {
  "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
    aminoType: "osmosis/gamm/create-balancer-pool",
    toAmino: MsgCreateBalancerPool.toAmino,
    fromAmino: MsgCreateBalancerPool.fromAmino,
  },
};
