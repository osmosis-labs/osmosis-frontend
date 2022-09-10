import { AminoMsg } from "@cosmjs/amino";
import { MsgUnjail } from "./tx";
export interface AminoMsgUnjail extends AminoMsg {
    type: "cosmos-sdk/MsgUnjail";
    value: {
        validator_addr: string;
    };
}
export declare const AminoConverter: {
    "/cosmos.slashing.v1beta1.MsgUnjail": {
        aminoType: string;
        toAmino: ({ validatorAddr }: MsgUnjail) => AminoMsgUnjail["value"];
        fromAmino: ({ validator_addr }: AminoMsgUnjail["value"]) => MsgUnjail;
    };
};
