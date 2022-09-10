import { AminoMsg } from "@cosmjs/amino";
import { MsgUnjail } from "./tx";
export interface AminoMsgUnjail extends AminoMsg {
  type: "cosmos-sdk/MsgUnjail";
  value: {
    validator_addr: string;
  };
}
export const AminoConverter = {
  "/cosmos.slashing.v1beta1.MsgUnjail": {
    aminoType: "cosmos-sdk/MsgUnjail",
    toAmino: ({
      validatorAddr
    }: MsgUnjail): AminoMsgUnjail["value"] => {
      return {
        validator_addr: validatorAddr
      };
    },
    fromAmino: ({
      validator_addr
    }: AminoMsgUnjail["value"]): MsgUnjail => {
      return {
        validatorAddr: validator_addr
      };
    }
  }
};