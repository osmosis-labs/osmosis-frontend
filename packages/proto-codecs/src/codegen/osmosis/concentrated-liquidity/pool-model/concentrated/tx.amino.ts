//@ts-nocheck
import { MsgCreateConcentratedPool } from "./tx";
export const AminoConverter = {
  "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool":
    {
      aminoType:
        "osmosis/concentratedliquidity/poolmodel/concentrated/create-concentrated-pool",
      toAmino: MsgCreateConcentratedPool.toAmino,
      fromAmino: MsgCreateConcentratedPool.fromAmino,
    },
};
