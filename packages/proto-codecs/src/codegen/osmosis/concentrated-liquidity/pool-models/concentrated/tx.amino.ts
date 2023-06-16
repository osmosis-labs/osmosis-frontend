//@ts-nocheck
import { MsgCreateConcentratedPool } from "./tx";
export const AminoConverter = {
  "/osmosis.concentratedliquidity.poolmodels.concentrated.v1beta1.MsgCreateConcentratedPool":
    {
      aminoType:
        "osmosis/concentratedliquidity/poolmodels/concentrated/create-concentrated-pool",
      toAmino: MsgCreateConcentratedPool.toAmino,
      fromAmino: MsgCreateConcentratedPool.fromAmino,
    },
};
