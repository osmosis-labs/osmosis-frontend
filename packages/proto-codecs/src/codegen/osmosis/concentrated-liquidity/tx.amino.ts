//@ts-nocheck
import {
  MsgAddToPosition,
  MsgCollectIncentives,
  MsgCollectSpreadRewards,
  MsgCreatePosition,
  MsgWithdrawPosition,
} from "./tx";
export const AminoConverter = {
  "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition": {
    aminoType: "osmosis/cl-create-position",
    toAmino: MsgCreatePosition.toAmino,
    fromAmino: MsgCreatePosition.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition": {
    aminoType: "osmosis/cl-withdraw-position",
    toAmino: MsgWithdrawPosition.toAmino,
    fromAmino: MsgWithdrawPosition.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition": {
    aminoType: "osmosis/cl-add-to-position",
    toAmino: MsgAddToPosition.toAmino,
    fromAmino: MsgAddToPosition.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards": {
    aminoType: "osmosis/cl-col-sp-rewards",
    toAmino: MsgCollectSpreadRewards.toAmino,
    fromAmino: MsgCollectSpreadRewards.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives": {
    aminoType: "osmosis/cl-collect-incentives",
    toAmino: MsgCollectIncentives.toAmino,
    fromAmino: MsgCollectIncentives.fromAmino,
  },
};
