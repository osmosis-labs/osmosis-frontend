//@ts-nocheck
/* eslint-disable */
import {
  MsgCreateStableswapPool,
  MsgStableSwapAdjustScalingFactors,
} from "./tx";
export const AminoConverter = {
  "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool": {
    aminoType: "osmosis/gamm/create-stableswap-pool",
    toAmino: MsgCreateStableswapPool.toAmino,
    fromAmino: MsgCreateStableswapPool.fromAmino,
  },
  "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors":
    {
      aminoType: "osmosis/gamm/stableswap-adjust-scaling-factors",
      toAmino: MsgStableSwapAdjustScalingFactors.toAmino,
      fromAmino: MsgStableSwapAdjustScalingFactors.fromAmino,
    },
};
