//@ts-nocheck
import {
  MsgCreateBalancerPool,
  MsgMigrateSharesToFullRangeConcentratedPosition,
} from "./tx";
export const AminoConverter = {
  "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
    aminoType: "osmosis/gamm/create-balancer-pool",
    toAmino: MsgCreateBalancerPool.toAmino,
    fromAmino: MsgCreateBalancerPool.fromAmino,
  },
  "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition":
    {
      aminoType:
        "osmosis/gamm/poolmodels/balancer/migrate-shares-to-full-range-concentrated-position",
      toAmino: MsgMigrateSharesToFullRangeConcentratedPosition.toAmino,
      fromAmino: MsgMigrateSharesToFullRangeConcentratedPosition.fromAmino,
    },
};
