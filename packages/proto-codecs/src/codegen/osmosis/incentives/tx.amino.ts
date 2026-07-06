//@ts-nocheck
import { MsgAddToGauge, MsgCreateGauge, MsgCreateGroup } from "./tx";
export const AminoConverter = {
  "/osmosis.incentives.MsgCreateGauge": {
    aminoType: "osmosis/incentives/create-gauge",
    toAmino: MsgCreateGauge.toAmino,
    fromAmino: MsgCreateGauge.fromAmino,
  },
  "/osmosis.incentives.MsgAddToGauge": {
    aminoType: "osmosis/incentives/add-to-gauge",
    toAmino: MsgAddToGauge.toAmino,
    fromAmino: MsgAddToGauge.fromAmino,
  },
  "/osmosis.incentives.MsgCreateGroup": {
    aminoType: "osmosis/incentives/create-group",
    toAmino: MsgCreateGroup.toAmino,
    fromAmino: MsgCreateGroup.fromAmino,
  },
};
