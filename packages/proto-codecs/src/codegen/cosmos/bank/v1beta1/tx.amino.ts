//@ts-nocheck
import { MsgMultiSend, MsgSend } from "./tx";
export const AminoConverter = {
  "/cosmos.bank.v1beta1.MsgSend": {
    aminoType: "cosmos-sdk/MsgSend",
    toAmino: MsgSend.toAmino,
    fromAmino: MsgSend.fromAmino,
  },
  "/cosmos.bank.v1beta1.MsgMultiSend": {
    aminoType: "cosmos-sdk/MsgMultiSend",
    toAmino: MsgMultiSend.toAmino,
    fromAmino: MsgMultiSend.fromAmino,
  },
};
