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
    aminoType: "osmosis/concentratedliquidity/create-position",
    toAmino: MsgCreatePosition.toAmino,
    fromAmino: MsgCreatePosition.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition": {
    aminoType: "osmosis/concentratedliquidity/withdraw-position",
    toAmino: MsgWithdrawPosition.toAmino,
    fromAmino: MsgWithdrawPosition.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition": {
    aminoType: "osmosis/concentratedliquidity/add-to-position",
    toAmino: MsgAddToPosition.toAmino,
    fromAmino: MsgAddToPosition.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards": {
    aminoType: "osmosis/concentratedliquidity/collect-spread-rewards",
    toAmino: MsgCollectSpreadRewards.toAmino,
    fromAmino: MsgCollectSpreadRewards.fromAmino,
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives": {
    aminoType: "osmosis/concentratedliquidity/collect-incentives",
    toAmino: MsgCollectIncentives.toAmino,
    fromAmino: MsgCollectIncentives.fromAmino,
  },
};
