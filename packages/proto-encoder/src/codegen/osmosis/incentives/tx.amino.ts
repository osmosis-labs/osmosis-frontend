//@ts-nocheck
/* eslint-disable */
import { MsgCreateGauge, MsgAddToGauge } from "./tx";
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
};
